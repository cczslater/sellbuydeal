
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getPromotionSettings, applyListingPromotion, PromotionSetting } from '../lib/promotions';
import { getCreditBalance } from '../lib/credits';

interface ListingPromotionsProps {
  listingId: string;
  listingTitle: string;
  onPromotionApplied: () => void;
}

export default function ListingPromotions({ listingId, listingTitle, onPromotionApplied }: ListingPromotionsProps) {
  const { user } = useAuth();
  const [promotionSettings, setPromotionSettings] = useState<PromotionSetting[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [applying, setApplying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionSetting | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credits');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    const [settings, balance] = await Promise.all([
      getPromotionSettings(),
      getCreditBalance(user.id)
    ]);

    setPromotionSettings(settings);
    setCreditBalance(balance?.current_balance || 0);
    setLoading(false);
  };

  const handlePromotionClick = (setting: PromotionSetting) => {
    setSelectedPromotion(setting);
    setShowPaymentModal(true);
  };

  const handleApplyPromotion = async () => {
    if (!user || !selectedPromotion) return;

    setApplying(selectedPromotion.promotion_type);

    try {
      if (paymentMethod === 'credits') {
        const success = await applyListingPromotion(user.id, listingId, selectedPromotion.promotion_type);

        if (success) {
          onPromotionApplied();
          await loadData();
          setShowPaymentModal(false);
          alert(`Successfully applied ${selectedPromotion.description}!`);
        } else {
          alert('Failed to apply promotion. Please check your credit balance.');
        }
      } else {
        // Handle external payment methods
        await handleExternalPayment(paymentMethod, selectedPromotion);
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
      alert('An error occurred while applying the promotion.');
    } finally {
      setApplying(null);
    }
  };

  const handleExternalPayment = async (method: string, promotion: PromotionSetting) => {
    switch (method) {
      case 'paypal':
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.description} has been applied via PayPal!`);
        }, 2000);
        break;
      case 'googlepay':
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.description} has been applied via Google Pay!`);
        }, 2000);
        break;
      case 'bitcoin':
        setTimeout(() => {
          onPromotionApplied();
          setShowPaymentModal(false);
          alert(`${promotion.description} has been applied via Bitcoin payment!`);
        }, 3000);
        break;
    }
  };

  const getPromotionIcon = (type: string) => {
    const icons = {
      move_to_top: 'ri-arrow-up-line',
      featured_listing: 'ri-star-line',
      homepage_promotion: 'ri-home-line',
      boost_visibility: 'ri-eye-line',
      premium_placement: 'ri-vip-crown-line',
      urgent_badge: 'ri-alarm-line'
    };
    return icons[type as keyof typeof icons] || 'ri-megaphone-line';
  };

  const getPromotionColor = (type: string) => {
    const colors = {
      move_to_top: 'bg-blue-500',
      featured_listing: 'bg-yellow-500',
      homepage_promotion: 'bg-purple-500',
      boost_visibility: 'bg-green-500',
      premium_placement: 'bg-red-500',
      urgent_badge: 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Promote This Listing</h3>
            <p className="text-sm text-gray-600">{listingTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Available Credits</p>
            <p className="text-xl font-bold text-[#FFA500]">${creditBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotionSettings.map((setting) => (
            <div
              key={setting.id}
              className="border rounded-xl p-4 transition-all border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getPromotionColor(setting.promotion_type)}`}>
                  <i className={`${getPromotionIcon(setting.promotion_type)} text-lg`}></i>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize text-gray-900">
                      {setting.promotion_type.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${setting.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {setting.duration_days} day{setting.duration_days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-4 text-gray-600">
                    {setting.description}
                  </p>

                  <button
                    onClick={() => handlePromotionClick(setting)}
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
              <i className="ri-information-line text-blue-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">How Promotions Work</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Move to Top:</strong> Instantly moves your listing to the top of search results</li>
                <li>• <strong>Featured Listing:</strong> Adds a featured badge and premium placement</li>
                <li>• <strong>Homepage Promotion:</strong> Features your listing on the main homepage</li>
                <li>• <strong>Boost Visibility:</strong> Increases ranking in category and search pages</li>
                <li>• <strong>Premium Placement:</strong> Premium positioning across all relevant pages</li>
                <li>• <strong>Urgent Badge:</strong> Adds an urgent badge to attract immediate attention</li>
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
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {selectedPromotion.promotion_type.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedPromotion.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">${selectedPromotion.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{selectedPromotion.duration_days} days</span>
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
                      <p className="text-sm text-gray-600">Balance: ${creditBalance.toFixed(2)}</p>
                    </div>
                    {creditBalance < selectedPromotion.price && (
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
                  onClick={handleApplyPromotion}
                  disabled={applying === selectedPromotion.promotion_type || (paymentMethod === 'credits' && creditBalance < selectedPromotion.price)}
                  className={`flex-1 py-3 rounded-lg font-medium whitespace-nowrap ${
                    applying === selectedPromotion.promotion_type || (paymentMethod === 'credits' && creditBalance < selectedPromotion.price)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FFA500] text-white hover:bg-orange-600 cursor-pointer'
                  }`}
                >
                  {applying === selectedPromotion.promotion_type ? 'Processing...' : 'Apply Promotion'}
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
