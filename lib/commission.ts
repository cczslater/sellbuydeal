
'use client';
import { supabase } from './supabase';
import { awardSalePoints } from './loyalty-points';

export interface CommissionSetting {
  id: number;
  listing_type: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerEarning {
  id: number;
  seller_id: string;
  product_id?: string;
  bundle_id?: string;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  promotion_fees: number;
  net_earnings: number;
  listing_type: string;
  status: string;
  sale_date: string;
  created_at: string;
}

export interface PayoutRequest {
  id: number;
  seller_id: string;
  requested_amount: number;
  total_commission: number;
  total_promotion_fees: number;
  final_payout_amount: number;
  payout_method: string;
  payout_details: any;
  status: string;
  admin_notes?: string;
  requested_at: string;
  processed_at?: string;
}

export interface SellerEarningsSummary {
  total_sales: number;
  total_commissions: number;
  total_promotion_fees: number;
  available_earnings: number;
  pending_earnings: number;
}

// Commission Settings Management
export const getCommissionSettings = async (): Promise<CommissionSetting[]> => {
  const { data, error } = await supabase
    .from('commission_settings')
    .select('*')
    .order('listing_type');

  if (error) {
    console.error('Error fetching commission settings:', error);
    return [];
  }

  return data || [];
};

export const updateCommissionSetting = async (
  id: number, 
  updates: Partial<CommissionSetting>
): Promise<boolean> => {
  const { error } = await supabase
    .from('commission_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating commission setting:', error);
    return false;
  }

  return true;
};

export const getCommissionRate = async (listingType: string): Promise<number> => {
  const { data, error } = await supabase
    .from('commission_settings')
    .select('commission_rate')
    .eq('listing_type', listingType)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error getting commission rate:', error);
    return 5.0; // Default fallback
  }

  return data?.commission_rate || 5.0;
};

// Seller Earnings Management
export const recordSale = async (saleData: {
  seller_id: string;
  product_id?: string;
  bundle_id?: string;
  sale_amount: number;
  listing_type: string;
  promotion_fees?: number;
}): Promise<boolean> => {
  try {
    // Get commission rate for this listing type
    const commissionRate = await getCommissionRate(saleData.listing_type);
    const commissionAmount = (saleData.sale_amount * commissionRate) / 100;
    const promotionFees = saleData.promotion_fees || 0;
    const netEarnings = saleData.sale_amount - commissionAmount - promotionFees;

    const { error } = await supabase
      .from('seller_earnings')
      .insert({
        seller_id: saleData.seller_id,
        product_id: saleData.product_id,
        bundle_id: saleData.bundle_id,
        sale_amount: saleData.sale_amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        promotion_fees: promotionFees,
        net_earnings: netEarnings,
        listing_type: saleData.listing_type,
        status: 'available' // Immediately available for payout
      });

    if (error) {
      console.error('Error recording sale:', error);
      return false;
    }

    // Award loyalty points for successful sale
    await awardSalePoints(saleData.seller_id, {
      id: saleData.product_id || saleData.bundle_id,
      title: 'Item sold' // You might want to pass actual product title
    });

    return true;
  } catch (error) {
    console.error('Error in recordSale:', error);
    return false;
  }
};

export const getSellerEarnings = async (sellerId: string): Promise<SellerEarning[]> => {
  const { data, error } = await supabase
    .from('seller_earnings')
    .select(`
      *,
      products (
        title,
        images
      ),
      bundles (
        title,
        images
      )
    `)
    .eq('seller_id', sellerId)
    .order('sale_date', { ascending: false });

  if (error) {
    console.error('Error fetching seller earnings:', error);
    return [];
  }

  return data || [];
};

export const getSellerEarningsSummary = async (sellerId: string): Promise<SellerEarningsSummary> => {
  try {
    // Try using RPC function first
    const { data, error } = await supabase
      .rpc('get_seller_available_earnings', { seller_uuid: sellerId });

    if (error || !data || data.length === 0) {
      // Fallback: Direct query if RPC function doesn't exist
      console.log('RPC function not found, using direct query');
      const { data: earnings, error: earningsError } = await supabase
        .from('seller_earnings')
        .select('sale_amount, commission_amount, promotion_fees, net_earnings, status')
        .eq('seller_id', sellerId);

      if (earningsError) {
        console.error('Error fetching earnings summary:', earningsError);
        return {
          total_sales: 0,
          total_commissions: 0,
          total_promotion_fees: 0,
          available_earnings: 0,
          pending_earnings: 0
        };
      }

      // Calculate summary manually
      const summary = earnings.reduce((acc, earning) => {
        acc.total_sales += earning.sale_amount;
        acc.total_commissions += earning.commission_amount;
        acc.total_promotion_fees += earning.promotion_fees;
        
        if (earning.status === 'available') {
          acc.available_earnings += earning.net_earnings;
        } else if (earning.status === 'pending') {
          acc.pending_earnings += earning.net_earnings;
        }
        
        return acc;
      }, {
        total_sales: 0,
        total_commissions: 0,
        total_promotion_fees: 0,
        available_earnings: 0,
        pending_earnings: 0
      });

      return summary;
    }

    return data[0] || {
      total_sales: 0,
      total_commissions: 0,
      total_promotion_fees: 0,
      available_earnings: 0,
      pending_earnings: 0
    };
  } catch (error) {
    console.error('Error in getSellerEarningsSummary:', error);
    return {
      total_sales: 0,
      total_commissions: 0,
      total_promotion_fees: 0,
      available_earnings: 0,
      pending_earnings: 0
    };
  }
};

// Payout Management
export const requestPayout = async (payoutData: {
  seller_id: string;
  payout_method: string;
  payout_details: any;
}): Promise<boolean> => {
  try {
    // Get seller's available earnings
    const earnings = await getSellerEarningsSummary(payoutData.seller_id);
    
    if (earnings.available_earnings <= 0) {
      throw new Error('No available earnings to withdraw');
    }

    // Calculate final payout (available earnings already have commissions deducted)
    const requestedAmount = earnings.available_earnings;
    const totalCommission = 0; // Already deducted from earnings
    const totalPromotionFees = 0; // Already deducted from earnings
    const finalPayoutAmount = requestedAmount;

    const { error } = await supabase
      .from('payout_requests')
      .insert({
        seller_id: payoutData.seller_id,
        requested_amount: requestedAmount,
        total_commission: totalCommission,
        total_promotion_fees: totalPromotionFees,
        final_payout_amount: finalPayoutAmount,
        payout_method: payoutData.payout_method,
        payout_details: payoutData.payout_details,
        status: 'pending'
      });

    if (error) {
      console.error('Error creating payout request:', error);
      return false;
    }

    // Mark earnings as requested (paid_out status)
    await supabase
      .from('seller_earnings')
      .update({ status: 'paid_out' })
      .eq('seller_id', payoutData.seller_id)
      .eq('status', 'available');

    return true;
  } catch (error) {
    console.error('Error in requestPayout:', error);
    return false;
  }
};

export const getPayoutRequests = async (sellerId?: string): Promise<PayoutRequest[]> => {
  let query = supabase
    .from('payout_requests')
    .select('*');

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  const { data, error } = await query.order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching payout requests:', error);
    return [];
  }

  return data || [];
};

export const updatePayoutRequest = async (
  payoutId: number, 
  updates: Partial<PayoutRequest>
): Promise<boolean> => {
  const { error } = await supabase
    .from('payout_requests')
    .update({
      ...updates,
      processed_at: updates.status === 'completed' || updates.status === 'failed' 
        ? new Date().toISOString() 
        : undefined
    })
    .eq('id', payoutId);

  if (error) {
    console.error('Error updating payout request:', error);
    return false;
  }

  return true;
};

// Helper function to calculate commission for display
export const calculateCommission = async (
  saleAmount: number, 
  listingType: string,
  promotionFees: number = 0
): Promise<{
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  promotionFees: number;
  netEarnings: number;
}> => {
  const commissionRate = await getCommissionRate(listingType);
  const commissionAmount = (saleAmount * commissionRate) / 100;
  const netEarnings = saleAmount - commissionAmount - promotionFees;

  return {
    saleAmount,
    commissionRate,
    commissionAmount,
    promotionFees,
    netEarnings
  };
};
