'use client';
import { supabase } from './supabase';
import { addCredit, deductCredit, getCreditBalance } from './credits';
import { awardLoyaltyPoints } from './loyalty-points';

export interface CreditTransaction {
  id: number;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  bundle_id?: string;
  amount: number;
  credit_amount: number;
  gateway_fee: number;
  transaction_type: 'purchase' | 'refund' | 'transfer';
  payment_method: 'credits_only' | 'credits_partial' | 'mixed';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: any;
  created_at: string;
  completed_at?: string;
}

export interface CreditGatewaySettings {
  id: number;
  gateway_enabled: boolean;
  automatic_transfer: boolean;
  gateway_fee_percentage: number;
  minimum_credit_amount: number;
  maximum_credit_amount: number;
  allow_partial_credits: boolean;
  require_backup_payment: boolean;
  transfer_delay_hours: number;
  created_at: string;
  updated_at: string;
}

// Gateway Settings Management
export const getCreditGatewaySettings = async (): Promise<CreditGatewaySettings | null> => {
  const { data, error } = await supabase
    .from('credit_gateway_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching credit gateway settings:', error);
    return null;
  }

  if (!data) {
    // Create default settings
    const defaultSettings = {
      gateway_enabled: true,
      automatic_transfer: false,
      gateway_fee_percentage: 2.5,
      minimum_credit_amount: 5.0,
      maximum_credit_amount: 5000.0,
      allow_partial_credits: true,
      require_backup_payment: true,
      transfer_delay_hours: 24
    };

    const { data: newSettings, error: createError } = await supabase
      .from('credit_gateway_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (createError) {
      console.error('Error creating credit gateway settings:', createError);
      return null;
    }

    return newSettings;
  }

  return data;
};

export const updateCreditGatewaySettings = async (
  updates: Partial<CreditGatewaySettings>
): Promise<boolean> => {
  const { error } = await supabase
    .from('credit_gateway_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating credit gateway settings:', error);
    return false;
  }

  return true;
};

// Credit Gateway Processing
export const processCreditPayment = async (paymentData: {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  bundle_id?: string;
  total_amount: number;
  credit_amount: number;
  payment_method: 'credits_only' | 'credits_partial' | 'mixed';
  backup_payment_method?: string;
  metadata?: any;
}): Promise<{ success: boolean; transaction_id?: number; error?: string }> => {
  try {
    const settings = await getCreditGatewaySettings();
    if (!settings || !settings.gateway_enabled) {
      return { success: false, error: 'Credit gateway is not available' };
    }

    // Validate credit amount limits
    if (paymentData.credit_amount < settings.minimum_credit_amount) {
      return { success: false, error: `Minimum credit amount is $${settings.minimum_credit_amount}` };
    }

    if (paymentData.credit_amount > settings.maximum_credit_amount) {
      return { success: false, error: `Maximum credit amount is $${settings.maximum_credit_amount}` };
    }

    // Check buyer's credit balance
    const buyerBalance = await getCreditBalance(paymentData.buyer_id);
    if (!buyerBalance || buyerBalance.current_balance < paymentData.credit_amount) {
      if (!settings.allow_partial_credits || paymentData.payment_method === 'credits_only') {
        return { success: false, error: 'Insufficient credit balance' };
      }
    }

    // Calculate gateway fee
    const gatewayFee = (paymentData.credit_amount * settings.gateway_fee_percentage) / 100;
    const netCreditAmount = paymentData.credit_amount - gatewayFee;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        buyer_id: paymentData.buyer_id,
        seller_id: paymentData.seller_id,
        product_id: paymentData.product_id,
        bundle_id: paymentData.bundle_id,
        amount: paymentData.total_amount,
        credit_amount: paymentData.credit_amount,
        gateway_fee: gatewayFee,
        transaction_type: 'purchase',
        payment_method: paymentData.payment_method,
        status: 'pending',
        metadata: paymentData.metadata || {}
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return { success: false, error: 'Failed to create transaction' };
    }

    // Deduct credits from buyer
    const deductSuccess = await deductCredit(
      paymentData.buyer_id,
      paymentData.credit_amount,
      'purchase_payment',
      `Purchase payment via credit gateway - Transaction #${transaction.id}`,
      transaction.id.toString()
    );

    if (!deductSuccess) {
      // Rollback transaction
      await supabase
        .from('credit_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      return { success: false, error: 'Failed to process credit payment' };
    }

    // Handle automatic or manual transfer
    if (settings.automatic_transfer) {
      await processSellerCreditTransfer(transaction.id, netCreditAmount);
    } else {
      // Schedule transfer after delay
      await scheduleSellerCreditTransfer(transaction.id, settings.transfer_delay_hours);
    }

    // Update transaction status
    await supabase
      .from('credit_transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    // Award loyalty points for purchase
    await awardLoyaltyPoints(
      paymentData.buyer_id,
      Math.floor(paymentData.credit_amount / 10), // 1 point per $10
      'credit_purchase',
      `Credit purchase - Transaction #${transaction.id}`
    );

    return { success: true, transaction_id: transaction.id };
  } catch (error) {
    console.error('Error processing credit payment:', error);
    return { success: false, error: 'Payment processing failed' };
  }
};

// Process seller credit transfer (automatic mode)
export const processSellerCreditTransfer = async (
  transactionId: number,
  netAmount: number
): Promise<boolean> => {
  try {
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .select('seller_id, product_id, bundle_id')
      .eq('id', transactionId)
      .single();

    if (!transaction) return false;

    // Add credits to seller account
    const success = await addCredit(
      transaction.seller_id,
      netAmount,
      'sale_earnings',
      `Sale earnings from credit payment - Transaction #${transactionId}`,
      transactionId.toString()
    );

    if (success) {
      // Update transaction with transfer completion
      await supabase
        .from('credit_transactions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      // Award seller loyalty points
      await awardLoyaltyPoints(
        transaction.seller_id,
        Math.floor(netAmount / 5), // 1 point per $5 earned
        'credit_sale',
        `Credit sale earnings - Transaction #${transactionId}`
      );
    }

    return success;
  } catch (error) {
    console.error('Error processing seller credit transfer:', error);
    return false;
  }
};

// Schedule seller credit transfer (manual mode)
export const scheduleSellerCreditTransfer = async (
  transactionId: number,
  delayHours: number
): Promise<boolean> => {
  try {
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + delayHours);

    const { error } = await supabase
      .from('scheduled_credit_transfers')
      .insert({
        transaction_id: transactionId,
        scheduled_at: scheduledTime.toISOString(),
        status: 'pending'
      });

    if (error) {
      console.error('Error scheduling credit transfer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error scheduling seller credit transfer:', error);
    return false;
  }
};

// Process scheduled transfers (to be run by cron job)
export const processScheduledTransfers = async (): Promise<void> => {
  try {
    const { data: scheduledTransfers } = await supabase
      .from('scheduled_credit_transfers')
      .select(`
        *,
        credit_transactions (
          seller_id,
          credit_amount,
          gateway_fee
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString());

    if (!scheduledTransfers || scheduledTransfers.length === 0) return;

    for (const transfer of scheduledTransfers) {
      const transaction = transfer.credit_transactions;
      const netAmount = transaction.credit_amount - transaction.gateway_fee;

      const success = await processSellerCreditTransfer(transfer.transaction_id, netAmount);

      if (success) {
        await supabase
          .from('scheduled_credit_transfers')
          .update({ status: 'completed' })
          .eq('id', transfer.id);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled transfers:', error);
  }
};

// Get credit transaction history
export const getCreditTransactionHistory = async (
  userId: string,
  userType: 'buyer' | 'seller' | 'both' = 'both'
): Promise<CreditTransaction[]> => {
  let query = supabase
    .from('credit_transactions')
    .select(`
      *,
      buyer:profiles!buyer_id (
        first_name,
        last_name
      ),
      seller:profiles!seller_id (
        first_name,
        last_name
      ),
      products (
        title,
        images
      ),
      bundles (
        title,
        images
      )
    `);

  if (userType === 'buyer') {
    query = query.eq('buyer_id', userId);
  } else if (userType === 'seller') {
    query = query.eq('seller_id', userId);
  } else {
    query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit transaction history:', error);
    return [];
  }

  return data || [];
};

// Calculate credit payment breakdown
export const calculateCreditPayment = async (
  totalAmount: number,
  creditAmount: number
): Promise<{
  totalAmount: number;
  creditAmount: number;
  gatewayFee: number;
  netCreditAmount: number;
  remainingAmount: number;
  breakdown: {
    description: string;
    amount: number;
  }[];
}> => {
  const settings = await getCreditGatewaySettings();
  const gatewayFeeRate = settings?.gateway_fee_percentage || 2.5;

  const gatewayFee = (creditAmount * gatewayFeeRate) / 100;
  const netCreditAmount = creditAmount - gatewayFee;
  const remainingAmount = totalAmount - creditAmount;

  return {
    totalAmount,
    creditAmount,
    gatewayFee,
    netCreditAmount,
    remainingAmount,
    breakdown: [
      { description: 'Total Order Amount', amount: totalAmount },
      { description: 'Credits Applied', amount: -creditAmount },
      { description: 'Gateway Fee', amount: gatewayFee },
      { description: 'Remaining Balance', amount: remainingAmount }
    ]
  };
};

// Refund credit transaction
export const refundCreditTransaction = async (
  transactionId: number,
  refundAmount?: number
): Promise<boolean> => {
  try {
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!transaction || transaction.status !== 'completed') {
      return false;
    }

    const refundValue = refundAmount || transaction.credit_amount;

    // Refund credits to buyer
    const buyerRefundSuccess = await addCredit(
      transaction.buyer_id,
      refundValue,
      'refund',
      `Refund for Transaction #${transactionId}`,
      transactionId.toString()
    );

    // Deduct credits from seller
    const sellerDeductSuccess = await deductCredit(
      transaction.seller_id,
      refundValue - transaction.gateway_fee,
      'refund_deduction',
      `Refund deduction for Transaction #${transactionId}`,
      transactionId.toString()
    );

    if (buyerRefundSuccess && sellerDeductSuccess) {
      await supabase
        .from('credit_transactions')
        .update({ status: 'refunded' })
        .eq('id', transactionId);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error processing refund:', error);
    return false;
  }
};

// Get gateway analytics
export const getCreditGatewayAnalytics = async (days: number = 30) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('amount, credit_amount, gateway_fee, created_at, status')
    .gte('created_at', dateFrom.toISOString())
    .eq('transaction_type', 'purchase');

  if (error) {
    console.error('Error fetching gateway analytics:', error);
    return {
      totalTransactions: 0,
      totalVolume: 0,
      totalCreditsProcessed: 0,
      totalFees: 0,
      averageTransaction: 0,
      successRate: 0
    };
  }

  const transactions = data || [];
  const completedTransactions = transactions.filter(t => t.status === 'completed');

  return {
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalCreditsProcessed: transactions.reduce((sum, t) => sum + t.credit_amount, 0),
    totalFees: transactions.reduce((sum, t) => sum + t.gateway_fee, 0),
    averageTransaction: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
      : 0,
    successRate: transactions.length > 0 
      ? (completedTransactions.length / transactions.length) * 100 
      : 0
  };
};