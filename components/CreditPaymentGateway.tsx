'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getCreditBalance } from '../lib/credits';
import { processCreditPayment, calculateCreditPayment, getCreditGatewaySettings } from '../lib/credit-gateway';

interface CreditPaymentGatewayProps {
  totalAmount: number;
  productId?: string;
  bundleId?: string;
  sellerId: string;
  onPaymentComplete: (result: any) => void;
  onClose: () => void;
}

export default function CreditPaymentGateway({
  totalAmount,
  productId,
  bundleId,
  sellerId,
  onPaymentComplete,
  onClose
}: CreditPaymentGatewayProps) {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'credits_only' | 'credits_partial' | 'mixed'>('credits_only');
  const [backupPaymentMethod, setBackupPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null);
  const [gatewaySettings, setGatewaySettings] = useState<any>(null);
  const [showBackupPayment, setShowBackupPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (creditAmount > 0) {
      updatePaymentBreakdown();
    }
  }, [creditAmount, totalAmount]);

  const loadData = async () => {
    if (!user) return;

    const [balance, settings] = await Promise.all([
      getCreditBalance(user.id),
      getCreditGatewaySettings()
    ]);

    setCreditBalance(balance?.current_balance || 0);
    setGatewaySettings(settings);

    // Set initial credit amount
    const maxCredit = Math.min(balance?.current_balance || 0, totalAmount);
    setCreditAmount(maxCredit);

    // Determine payment method
    if (maxCredit >= totalAmount) {
      setPaymentMethod('credits_only');
    } else if (maxCredit > 0 && settings?.allow_partial_credits) {
      setPaymentMethod('credits_partial');
      setShowBackupPayment(true);
    } else {
      setPaymentMethod('mixed');
      setShowBackupPayment(true);
    }
  };

  const updatePaymentBreakdown = async () => {
    const breakdown = await calculateCreditPayment(totalAmount, creditAmount);
    setPaymentBreakdown(breakdown);
  };

  const handlePaymentMethodChange = (method: 'credits_only' | 'credits_partial' | 'mixed') => {
    setPaymentMethod(method);
    
    if (method === 'credits_only') {
      setCreditAmount(Math.min(creditBalance, totalAmount));
      setShowBackupPayment(false);
    } else {
      setShowBackupPayment(true);
    }
  };

  const handleCreditAmountChange = (amount: number) => {
    const maxAmount = Math.min(creditBalance, totalAmount);
    const validAmount = Math.max(0, Math.min(amount, maxAmount));
    setCreditAmount(validAmount);

    if (validAmount < totalAmount && paymentMethod === 'credits_only') {
      setPaymentMethod('credits_partial');
      setShowBackupPayment(true);
    } else if (validAmount === totalAmount) {
      setPaymentMethod('credits_only');
      setShowBackupPayment(false);
    }
  };

  const processPayment = async () => {
    if (!user || !paymentBreakdown) return;

    setProcessing(true);

    try {
      const result = await processCreditPayment({
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId,
        bundle_id: bundleId,
        total_amount: totalAmount,
        credit_amount: creditAmount,
        payment_method: paymentMethod,
        backup_payment_method: showBackupPayment ? backupPaymentMethod : undefined,
        metadata: {
          gateway_used: true,
          backup_payment_required: showBackupPayment
        }
      });

      if (result.success) {
        onPaymentComplete({
          success: true,
          transaction_id: result.transaction_id,
          credit_amount: creditAmount,
          remaining_amount: paymentBreakdown.remainingAmount
        });
      } else {
        alert(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!gatewaySettings?.gateway_enabled) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Credit Gateway Unavailable</h3>
          <p className="text-gray-600 mb-6">The credit payment gateway is currently unavailable. Please use an alternative payment method.</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Credit Payment Gateway</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          <p className="text-orange-100">Pay using your marketplace credits</p>
        </div>

        <div className="p-8">
          {/* Credit Balance Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#FFA500] rounded-full flex items-center justify-center">
                  <i className="ri-coins-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Available Credits</h3>
                  <p className="text-2xl font-bold text-[#FFA500]">${creditBalance.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {creditBalance < totalAmount && (
              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-yellow-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Insufficient Credits</p>
                    <p className="text-xs text-yellow-700">
                      You need ${(totalAmount - creditBalance).toFixed(2)} more to pay entirely with credits.
                      {gatewaySettings?.allow_partial_credits && ' You can use partial credits with a backup payment method.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>
            <div className="space-y-3">
              {/* Credits Only */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'credits_only' && creditBalance >= totalAmount
                  ? 'border-[#FFA500] bg-orange-50'
                  : creditBalance < totalAmount
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credits_only"
                  checked={paymentMethod === 'credits_only'}
                  onChange={() => handlePaymentMethodChange('credits_only')}
                  disabled={creditBalance < totalAmount}
                  className="mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pay with Credits Only</p>
                  <p className="text-sm text-gray-600">
                    Use ${totalAmount.toFixed(2)} from your credit balance
                  </p>
                </div>
                {creditBalance >= totalAmount && (
                  <div className="text-green-600">
                    <i className="ri-check-line text-xl"></i>
                  </div>
                )}
              </label>

              {/* Partial Credits */}
              {gatewaySettings?.allow_partial_credits && creditBalance > 0 && (
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'credits_partial'
                    ? 'border-[#FFA500] bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credits_partial"
                    checked={paymentMethod === 'credits_partial'}
                    onChange={() => handlePaymentMethodChange('credits_partial')}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Partial Credits + Backup Payment</p>
                    <p className="text-sm text-gray-600">
                      Use available credits and pay remaining with another method
                    </p>
                  </div>
                </label>
              )}

              {/* Mixed Payment */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'mixed'
                  ? 'border-[#FFA500] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mixed"
                  checked={paymentMethod === 'mixed'}
                  onChange={() => handlePaymentMethodChange('mixed')}
                  className="mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Custom Credit Amount</p>
                  <p className="text-sm text-gray-600">
                    Choose how much of your credits to use
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Credit Amount Slider */}
          {(paymentMethod === 'mixed' || paymentMethod === 'credits_partial') && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Credit Amount to Use</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-[#FFA500]">${creditAmount.toFixed(2)}</span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => handleCreditAmountChange(parseFloat(e.target.value) || 0)}
                    min="0"
                    max={Math.min(creditBalance, totalAmount)}
                    step="0.01"
                    className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={Math.min(creditBalance, totalAmount)}
                  step="0.01"
                  value={creditAmount}
                  onChange={(e) => handleCreditAmountChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>$0.00</span>
                  <span>${Math.min(creditBalance, totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Breakdown */}
          {paymentBreakdown && (
            <div className="mb-8 bg-gray-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h4>
              <div className="space-y-3">
                {paymentBreakdown.breakdown.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{item.description}</span>
                    <span className={`font-medium ${
                      item.amount < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">
                    {paymentBreakdown.remainingAmount > 0 ? 'Remaining Balance' : 'Total Paid with Credits'}
                  </span>
                  <span className="font-bold text-lg text-[#FFA500]">
                    ${paymentBreakdown.remainingAmount > 0 
                      ? paymentBreakdown.remainingAmount.toFixed(2)
                      : paymentBreakdown.creditAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Backup Payment Method */}
          {showBackupPayment && paymentBreakdown?.remainingAmount > 0 && (
            <div className="mb-8 bg-blue-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Backup Payment Method</h4>
              <p className="text-sm text-gray-600 mb-4">
                Choose how to pay the remaining ${paymentBreakdown.remainingAmount.toFixed(2)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[{
                  value: 'card',
                  label: 'Credit Card',
                  icon: 'ri-bank-card-line'
                }, {
                  value: 'paypal',
                  label: 'PayPal',
                  icon: 'ri-paypal-line'
                }, {
                  value: 'apple',
                  label: 'Apple Pay',
                  icon: 'ri-apple-line'
                }, {
                  value: 'google',
                  label: 'Google Pay',
                  icon: 'ri-google-line'
                }].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      backupPaymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="backupPayment"
                      value={method.value}
                      checked={backupPaymentMethod === method.value}
                      onChange={(e) => setBackupPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <i className={`${method.icon} text-xl mr-2 text-gray-600`}></i>
                    <span className="font-medium text-gray-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Gateway Information */}
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <i className="ri-shield-check-line text-green-600 mt-1"></i>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Secure Credit Gateway</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Gateway fee: {gatewaySettings?.gateway_fee_percentage || 2.5}% on credit transactions</li>
                  <li>• {gatewaySettings?.automatic_transfer 
                    ? 'Automatic transfer to seller account' 
                    : `Transfer delay: ${gatewaySettings?.transfer_delay_hours || 24} hours`}</li>
                  <li>• Full transaction history and tracking</li>
                  <li>• Secure encrypted processing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={processPayment}
              disabled={processing || creditAmount <= 0}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all cursor-pointer whitespace-nowrap ${
                processing || creditAmount <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFA500] to-orange-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <i className="ri-secure-payment-line mr-2"></i>
                  Pay ${creditAmount.toFixed(2)} with Credits
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}