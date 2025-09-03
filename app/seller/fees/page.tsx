
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import { getCommissionSettings, CommissionSetting } from '../../../lib/commission';
import { getPromotionSettings } from '../../../lib/promotions';

interface FeeExample {
  saleAmount: number;
  listingType: string;
  commissionRate: number;
  commissionAmount: number;
  promotionFee: number;
  netEarnings: number;
}

export default function SellerFees() {
  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([]);
  const [promotionPrices, setPromotionPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedExample, setSelectedExample] = useState(100);
  const [isInteractive, setIsInteractive] = useState(false);
  const [customAmount, setCustomAmount] = useState('100');

  useEffect(() => {
    loadFeesData();
  }, []);

  const loadFeesData = async () => {
    try {
      const [commissions, promotions] = await Promise.all([
        getCommissionSettings(),
        getPromotionSettings()
      ]);

      const activeCommissions = commissions.filter(c => c.is_active);
      const expectedTypes = ['buy_it_now', 'make_offer', 'classified'];
      const filteredCommissions = expectedTypes.map(type => 
        activeCommissions.find(c => c.listing_type === type)
      ).filter(Boolean) as CommissionSetting[];

      setCommissionSettings(filteredCommissions);
      setPromotionPrices({
        featured_listing: promotions.find(p => p.promotion_type === 'featured_listing')?.price || 2.99,
        top_placement: promotions.find(p => p.promotion_type === 'top_placement')?.price || 4.99,
        homepage_spotlight: promotions.find(p => p.promotion_type === 'homepage_spotlight')?.price || 9.99,
        video_upload: 2.99
      });
    } catch (error) {
      console.error('Error loading fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeeExample = (saleAmount: number, listingType: string): FeeExample => {
    const commission = commissionSettings.find(c => c.listing_type === listingType);
    const commissionRate = commission?.commission_rate || 5.0;
    const commissionAmount = (saleAmount * commissionRate) / 100;

    return {
      saleAmount,
      listingType,
      commissionRate,
      commissionAmount,
      promotionFee: 0,
      netEarnings: saleAmount - commissionAmount
    };
  };

  const feeExamples = [
    { amount: 25, label: '$25 Sale' },
    { amount: 50, label: '$50 Sale' },
    { amount: 100, label: '$100 Sale' },
    { amount: 250, label: '$250 Sale' },
    { amount: 500, label: '$500 Sale' }
  ];

  const getListingTypeInfo = (type: string) => {
    const info = {
      buy_it_now: {
        label: 'Buy It Now',
        description: 'Fixed price listings with immediate purchase',
        icon: 'ri-shopping-cart-line',
        color: 'bg-green-100 text-green-800'
      },
      make_offer: {
        label: 'Make Offer',
        description: 'Allow buyers to negotiate prices - commission only on final agreed price after successful sale',
        icon: 'ri-hand-coin-line',
        color: 'bg-blue-100 text-blue-800'
      },
      classified: {
        label: 'Classified Ads',
        description: 'Simple listing for local sales and services',
        icon: 'ri-newspaper-line',
        color: 'bg-orange-100 text-orange-800'
      }
    };
    return info[type as keyof typeof info] || info.buy_it_now;
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    setSelectedExample(numValue);
  };

  const getVolumeIncentive = (monthlyVolume: number) => {
    if (monthlyVolume >= 5000) return { rate: 3.5, tier: 'Diamond' };
    if (monthlyVolume >= 2500) return { rate: 4.0, tier: 'Gold' };
    if (monthlyVolume >= 1000) return { rate: 4.5, tier: 'Silver' };
    return { rate: 5.0, tier: 'Standard' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading fees information...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <SellerSidebar />

        <main className="flex-1 p-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#004080] to-blue-600 rounded-3xl p-8 mb-8 text-white">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Sell with Confidence</h1>
                  <p className="text-xl text-blue-100">No Listing Fees • Simple Commission Structure • Instant Earnings</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <i className="ri-money-dollar-circle-line text-2xl text-green-300"></i>
                    <div>
                      <p className="font-bold text-lg">NO UPFRONT COSTS</p>
                      <p className="text-sm text-blue-100">Commission only when you cash out</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <i className="ri-flashlight-line text-2xl text-yellow-300"></i>
                    <div>
                      <p className="font-bold text-lg">INSTANT EARNINGS</p>
                      <p className="text-sm text-blue-100">Money appears immediately after sale</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <i className="ri-eye-line text-2xl text-purple-300"></i>
                    <div>
                      <p className="font-bold text-lg">TRANSPARENT FEES</p>
                      <p className="text-sm text-blue-100">See exactly what you'll pay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Structure & Volume Incentives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-percent-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Commission Structure</h3>
                  <p className="text-gray-600">Only charged when you request payout</p>
                </div>
              </div>

              <div className="space-y-4">
                {commissionSettings.map((setting) => {
                  const info = getListingTypeInfo(setting.listing_type);
                  return (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${info.color}`}>
                          <i className={`${info.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{info.label}</h4>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{setting.commission_rate}%</div>
                        <div className="text-sm text-gray-500">Commission</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Make Offer Clarification */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Make Offer Sales</p>
                    <p className="text-xs text-blue-700">
                      • Commission applies only to final agreed price after successful sale<br/>
                      • No fees for rejected or canceled offers<br/>
                      • Payment processed when buyer completes purchase
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-vip-crown-line text-xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Volume-Based Incentives</h3>
                  <p className="text-gray-600">Lower rates for power sellers</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <i className="ri-trophy-line text-lg text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Diamond Tier</h4>
                      <p className="text-sm text-gray-600">$5,000+ monthly sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">3.5%</div>
                    <div className="text-sm text-gray-500">Commission</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <i className="ri-medal-line text-lg text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Gold Tier</h4>
                      <p className="text-sm text-gray-600">$2,500+ monthly sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">4.0%</div>
                    <div className="text-sm text-gray-500">Commission</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <i className="ri-award-line text-lg text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Silver Tier</h4>
                      <p className="text-sm text-gray-600">$1,000+ monthly sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-600">4.5%</div>
                    <div className="text-sm text-gray-500">Commission</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-lg text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Standard Tier</h4>
                      <p className="text-sm text-gray-600">Up to $1,000 monthly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">5.0%</div>
                    <div className="text-sm text-gray-500">Commission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Fee Calculator */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-calculator-line text-xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Interactive Fee Calculator</h3>
                <p className="text-gray-600">See your real-time earnings breakdown</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Sale Amount</h4>
                  <button
                    onClick={() => setIsInteractive(!isInteractive)}
                    className={`px-3 py-1 text-xs rounded-full cursor-pointer whitespace-nowrap ${
                      isInteractive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isInteractive ? 'Interactive Mode' : 'Quick Examples'}
                  </button>
                </div>

                {isInteractive ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enter Custom Amount</label>
                      <div className="flex items-center">
                        <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent text-lg"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Or use the slider</label>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        value={selectedExample}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSelectedExample(value);
                          setCustomAmount(value.toString());
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$10</span>
                        <span>$1000</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {feeExamples.map((example) => (
                      <button
                        key={example.amount}
                        onClick={() => {
                          setSelectedExample(example.amount);
                          setCustomAmount(example.amount.toString());
                        }}
                        className={`px-4 py-3 rounded-lg font-medium text-sm cursor-pointer whitespace-nowrap transition-colors ${
                          selectedExample === example.amount
                            ? 'bg-[#004080] text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Real-Time Earnings Breakdown</h4>
                <div className="space-y-4">
                  {commissionSettings.map((setting) => {
                    const example = calculateFeeExample(selectedExample, setting.listing_type);
                    const info = getListingTypeInfo(setting.listing_type);

                    return (
                      <div key={setting.id} className="border rounded-lg p-4 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${info.color}`}>
                              <i className={`${info.icon} text-sm`}></i>
                            </div>
                            <span className="font-medium text-gray-900">{info.label}</span>
                          </div>
                          <span className="text-sm text-gray-600">{setting.commission_rate}% fee</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sale Amount:</span>
                            <span className="font-medium">${example.saleAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Commission ({example.commissionRate}%):</span>
                            <span>-${example.commissionAmount.toFixed(2)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between text-lg font-semibold text-green-600">
                            <span>You Earn:</span>
                            <span>${example.netEarnings.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Promotion ROI Examples */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-megaphone-line text-xl text-orange-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Promotion Success Stories</h3>
                <p className="text-gray-600">See how promotions boost your sales</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <i className="ri-star-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Featured Listing</h4>
                    <p className="text-sm text-yellow-600 font-medium">${promotionPrices.featured_listing} investment</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 italic mb-2">
                    "Using Featured Listing helped me sell my vintage guitar 3x faster! Worth every penny."
                  </p>
                  <p className="text-xs text-gray-500">- Sarah M., Vintage Instruments</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average views increase:</span>
                    <span className="font-semibold text-green-600">+280%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sale speed improvement:</span>
                    <span className="font-semibold text-green-600">3x faster</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI:</span>
                    <span className="font-semibold text-green-600">800%+</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <i className="ri-flashlight-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Homepage Spotlight</h4>
                    <p className="text-sm text-purple-600 font-medium">${promotionPrices.homepage_spotlight} investment</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 italic mb-2">
                    "Homepage featuring brought 15 serious inquiries in one day. Sold at asking price!"
                  </p>
                  <p className="text-xs text-gray-500">- Mike D., Electronics Seller</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Homepage visibility:</span>
                    <span className="font-semibold text-green-600">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average inquiries:</span>
                    <span className="font-semibold text-green-600">+1200%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion rate:</span>
                    <span className="font-semibold text-green-600">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="ri-arrow-up-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Top Placement</h4>
                    <p className="text-sm text-blue-600 font-medium">${promotionPrices.top_placement} investment</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 italic mb-2">
                    "Moving to the top of search results doubled my daily views consistently."
                  </p>
                  <p className="text-xs text-gray-500">- Jennifer L., Fashion Reseller</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Search position:</span>
                    <span className="font-semibold text-green-600">#1-3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">View increase:</span>
                    <span className="font-semibold text-green-600">+150%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-blue-600">3 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-lightbulb-line text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Promotion Pro Tip</h4>
                  <p className="text-sm text-green-700">
                    Use Featured Listing for items $50+, Top Placement for competitive categories, and Homepage Spotlight for unique/high-value items. Stack promotions for maximum impact!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <i className="ri-user-heart-line text-xl text-teal-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Buyer Fee Transparency</h3>
                <p className="text-gray-600">What your buyers pay (beyond item price)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Buyer Fees</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-gray-700">Platform Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-gray-700">Transaction Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-gray-700">Payment Processing</span>
                    <span className="font-medium text-blue-600">Included</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Shipping Information</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Local Pickup:</strong> Free (arranged between buyer & seller)
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Seller Shipping:</strong> Calculated by seller's location and item weight
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Estimated Range:</strong> $5-15 for most items within US
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Competitive Advantage</h4>
                  <p className="text-sm text-blue-700">
                    Unlike other platforms, we don't charge buyers any platform fees. This means more competitive pricing for your items and higher conversion rates for your listings!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-shield-check-line text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">How Our Fee System Works</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• <strong>No Upfront Costs:</strong> Commission only charged when you cash out</p>
                    <p>• <strong>Instant Earnings:</strong> Money appears in your account immediately after sale</p>
                    <p>• <strong>Transparent Fees:</strong> See exactly what you'll pay before requesting payout</p>
                    <p>• <strong>Optional Promotions:</strong> Choose which marketing services to use</p>
                    <p>• <strong>Volume Discounts:</strong> Higher sales volume = lower commission rates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-lightbulb-line text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Tips to Maximize Earnings</h4>
                  <div className="text-sm text-green-700 space-y-2">
                    <p>• <strong>Quality Photos:</strong> High-quality images sell faster and for more money</p>
                    <p>• <strong>Detailed Descriptions:</strong> Complete info builds buyer confidence</p>
                    <p>• <strong>Competitive Pricing:</strong> Research similar items for optimal pricing</p>
                    <p>• <strong>Strategic Promotions:</strong> Use featured listings for high-value items</p>
                    <p>• <strong>Volume Selling:</strong> Reach higher tiers for better commission rates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
