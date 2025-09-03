
'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { spendCredits, getPromotionCost } from '../lib/credits';

interface PromotionOptionsProps {
  productId: string;
  currentBalance: number;
  onPromotionApplied: () => void;
}

export default function PromotionOptions({ productId, currentBalance, onPromotionApplied }: PromotionOptionsProps) {
  const { user } = useAuth();
  const [applying, setApplying] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('credits');

  const promotions = [
    {
      id: 'featured_listing',
      title: 'Featured Listing',
      description: 'Display your item at the top of search results for 7 days',
      cost: getPromotionCost('featured_listing'),
      duration: '7 days',
      icon: 'ri-star-line',
      benefits: ['Top placement in search', 'Featured badge', '3x more views']
    },
    {
      id: 'boost_visibility',
      title: 'Boost Visibility',
      description: 'Increase your listing visibility in category pages',
      cost: getPromotionCost('boost_visibility'),
      duration: '3 days',
      icon: 'ri-eye-line',
      benefits: ['Higher search ranking', 'Category page priority', '2x more views']
    },
    {
      id: 'premium_placement',
      title: 'Premium Placement',
      description: 'Get premium positioning across all relevant pages',
      cost: getPromotionCost('premium_placement'),
      duration: '14 days',
      icon: 'ri-vip-crown-line',
      benefits: ['Premium badge', 'Homepage featuring', 'Email newsletter inclusion']
    },
    {
      id: 'listing_fee_waiver',
      title: 'Next Listing Free',
      description: 'Waive the listing fee for your next item',
      cost: getPromotionCost('listing_fee_waiver'),
      duration: 'Next listing',
      icon: 'ri-coupon-line',
      benefits: ['No listing fees', 'Save on insertion costs', 'Stack with other offers']
    }
  ];

  const handlePromotionClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowPaymentModal(true);
  };

  const applyPromotion = async () => {
    if (!user || !selectedPromotion) return;

    setApplying(selectedPromotion.id);

    try {
      if (paymentMethod === 'credits') {
        const success = await spendCredits(
          user.id,
          selectedPromotion.cost,
          selectedPromotion.id,
          `Applied ${selectedPromotion.title} promotion to listing`,
          productId
        );

        if (success) {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${selectedPromotion.title} has been applied to your listing!`);
        } else {
          alert('Failed to apply promotion. Please try again.');
        }
      } else {
        // Handle external payment methods
        handleExternalPayment(paymentMethod, selectedPromotion);
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
      alert('An error occurred while applying the promotion.');
    } finally {
      setApplying(null);
    }
  };

  const handleExternalPayment = (method: string, promotion: any) => {
    switch (method) {
      case 'paypal':
        // Simulate PayPal payment
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.title} has been applied via PayPal!`);
        }, 2000);
        break;
      case 'googlepay':
        // Simulate Google Pay payment
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.title} has been applied via Google Pay!`);
        }, 2000);
        break;
      case 'bitcoin':
        // Simulate Bitcoin payment
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.title} has been applied via Bitcoin payment!`);
        }, 3000);
        break;
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Promote Your Listing</h3>
          <div className="text-sm text-gray-600">
            Available Credits: <span className="font-medium text-[#FFA500]">${currentBalance.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="border rounded-xl p-4 hover:border-[#FFA500] transition-all">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#FFA500] rounded-full flex items-center justify-center text-white">
                  <i className={`${promotion.icon} text-lg`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{promotion.title}</h4>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#FFA500]">${promotion.cost}</p>
                      <p className="text-xs text-gray-500">{promotion.duration}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-3 text-gray-600">{promotion.description}</p>

                  <ul className="text-xs text-gray-500 space-y-1 mb-4">
                    {promotion.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <i className="ri-check-line text-green-500"></i>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePromotionClick(promotion)}
                    className="w-full bg-[#004080] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Promote Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-lightbulb-line text-blue-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Earn More Credits</h4>
              <p className="text-sm text-blue-700 mb-2">
                Create more listings to earn credits automatically. Each of your first 5 listings earns $1 credit!
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Successful sales earn bonus credits</li>
                <li>• Refer friends for instant $5 credits</li>
                <li>• Participate in seasonal promotions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Choose Payment Method</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900">{selectedPromotion.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedPromotion.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FFA500]">${selectedPromotion.cost}</span>
                    <span className="text-sm text-gray-500">{selectedPromotion.duration}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credits"
                    checked={paymentMethod === 'credits'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-[#FFA500] rounded-full flex items-center justify-center">
                      <i className="ri-coins-line text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Marketplace Credits</p>
                      <p className="text-sm text-gray-600">Balance: ${currentBalance.toFixed(2)}</p>
                    </div>
                    {currentBalance < selectedPromotion.cost && (
                      <span className="text-xs text-red-600 font-medium">Insufficient</span>
                    )}
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PP</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="googlepay"
                    checked={paymentMethod === 'googlepay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Google Pay</p>
                      <p className="text-sm text-gray-600">Quick payment with Google</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bitcoin"
                    checked={paymentMethod === 'bitcoin'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="ri-coin-line text-white"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Bitcoin</p>
                      <p className="text-sm text-gray-600">Pay with cryptocurrency</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={applyPromotion}
                  disabled={applying === selectedPromotion.id || (paymentMethod === 'credits' && currentBalance < selectedPromotion.cost)}
                  className={`flex-1 py-3 rounded-lg font-medium whitespace-nowrap ${
                    applying === selectedPromotion.id || (paymentMethod === 'credits' && currentBalance < selectedPromotion.cost)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FFA500] text-white hover:bg-orange-600 cursor-pointer'
                  }`}
                >
                  {applying === selectedPromotion.id ? 'Processing...' : 'Apply Promotion'}
                </button>
              </div>

              {paymentMethod !== 'credits' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-600 mt-0.5"></i>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">External Payment</p>
                      <p className="text-xs text-blue-700">
                        You'll be redirected to {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'googlepay' ? 'Google Pay' : 'Bitcoin payment'} to complete your transaction securely.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
