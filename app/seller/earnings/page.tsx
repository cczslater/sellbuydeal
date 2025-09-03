'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';
import { 
  getSellerEarnings, 
  getSellerEarningsSummary, 
  requestPayout,
  getPayoutRequests,
  calculateCommission,
  SellerEarning,
  SellerEarningsSummary,
  PayoutRequest
} from '../../../lib/commission';

export default function SellerEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<SellerEarning[]>([]);
  const [summary, setSummary] = useState<SellerEarningsSummary>({
    total_sales: 0,
    total_commissions: 0,
    total_promotion_fees: 0,
    available_earnings: 0,
    pending_earnings: 0
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutDetails, setPayoutDetails] = useState<any>({});
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user]);

  const loadEarningsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [earningsData, summaryData, payoutsData] = await Promise.all([
        getSellerEarnings(user.id),
        getSellerEarningsSummary(user.id),
        getPayoutRequests(user.id)
      ]);

      setEarnings(earningsData);
      setSummary(summaryData);
      setPayoutRequests(payoutsData);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (!user || summary.available_earnings <= 0) return;

    setRequesting(true);
    try {
      const success = await requestPayout({
        seller_id: user.id,
        payout_method: payoutMethod,
        payout_details: payoutDetails
      });

      if (success) {
        alert('Payout request submitted successfully! We will process it within 2-3 business days.');
        setShowPayoutModal(false);
        setPayoutDetails({});
        await loadEarningsData();
      } else {
        alert('Failed to submit payout request. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('An error occurred while submitting your payout request.');
    } finally {
      setRequesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      available: 'bg-green-100 text-green-800',
      paid_out: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPayoutStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
              <p className="text-gray-600">Loading your earnings...</p>
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Earnings</h1>
                <p className="text-gray-600">Track your sales performance and manage payouts</p>
              </div>
              
              {summary.available_earnings > 0 && (
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center space-x-2"
                >
                  <i className="ri-bank-line"></i>
                  <span>Request Payout</span>
                </button>
              )}
            </div>
          </div>

          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">${summary.total_sales.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Gross revenue</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-line-chart-line text-xl text-blue-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-green-600">${summary.available_earnings.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Ready for payout</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-xl text-green-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Platform Commission</p>
                  <p className="text-2xl font-bold text-red-600">${summary.total_commissions.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Marketplace fees</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="ri-percent-line text-xl text-red-600"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Promotion Fees</p>
                  <p className="text-2xl font-bold text-orange-600">${summary.total_promotion_fees.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Marketing costs</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="ri-megaphone-line text-xl text-orange-600"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'overview', label: 'Earnings Overview' },
                  { key: 'history', label: 'Sales History' },
                  { key: 'payouts', label: 'Payout History' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-white text-[#004080] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {summary.available_earnings > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="ri-money-dollar-circle-line text-xl text-green-600"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-800">Ready for Payout</h3>
                            <p className="text-green-700">You have ${summary.available_earnings.toFixed(2)} available for withdrawal</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPayoutModal(true)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap"
                        >
                          Request Payout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-money-dollar-circle-line text-2xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No available earnings</h3>
                      <p className="text-gray-600 mb-6">Start selling items to earn money</p>
                      <Link
                        href="/sell/quick"
                        className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap"
                      >
                        Create Your First Listing
                      </Link>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-information-line text-blue-600"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">How Our Commission System Works</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• <strong>Auctions:</strong> 3% commission deducted at payout</p>
                          <p>• <strong>Buy It Now:</strong> 5% commission deducted at payout</p>
                          <p>• <strong>Make Offer:</strong> 5% commission deducted at payout</p>
                          <p>• <strong>Promotion Fees:</strong> Any unpaid promotion costs are also deducted</p>
                          <p>• <strong>Instant Credit:</strong> Earnings appear immediately after sale</p>
                          <p>• <strong>Transparent:</strong> See exactly what you'll receive before requesting payout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {earnings.length > 0 ? (
                    <div className="space-y-4">
                      {earnings.map((earning) => (
                        <div key={earning.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <i className={`${
                                  earning.listing_type === 'auction' ? 'ri-auction-line' :
                                  earning.listing_type === 'buy_it_now' ? 'ri-shopping-cart-line' :
                                  'ri-hand-coin-line'
                                } text-xl text-gray-600`}></i>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="font-semibold text-gray-900 capitalize">
                                    {earning.listing_type.replace('_', ' ')} Sale
                                  </h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                                    {earning.status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{new Date(earning.sale_date).toLocaleDateString()}</span>
                                  <span>{earning.commission_rate}% commission</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ${earning.sale_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500 space-y-1">
                                <div>Commission: -${earning.commission_amount.toFixed(2)}</div>
                                {earning.promotion_fees > 0 && (
                                  <div>Promo Fees: -${earning.promotion_fees.toFixed(2)}</div>
                                )}
                                <div className="font-medium text-green-600">
                                  Net: ${earning.net_earnings.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-line-chart-line text-2xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No sales history</h3>
                      <p className="text-gray-600">Your sales will appear here once you start selling</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payouts' && (
                <div>
                  {payoutRequests.length > 0 ? (
                    <div className="space-y-4">
                      {payoutRequests.map((payout) => (
                        <div key={payout.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  Payout Request #{payout.id}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                                  {payout.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Requested: {new Date(payout.requested_at).toLocaleDateString()}</span>
                                <span>Method: {payout.payout_method.toUpperCase()}</span>
                                {payout.processed_at && (
                                  <span>Processed: {new Date(payout.processed_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                ${payout.final_payout_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Final amount
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-bank-line text-2xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payout history</h3>
                      <p className="text-gray-600">Your payout requests will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Request Payout</h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800">Available for Withdrawal</h4>
                  <p className="text-2xl font-bold text-green-600">${summary.available_earnings.toFixed(2)}</p>
                  <p className="text-sm text-green-700 mt-1">
                    This amount already has all commissions and fees deducted
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 pr-8"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                {payoutMethod === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                    <input
                      type="email"
                      value={payoutDetails.email || ''}
                      onChange={(e) => setPayoutDetails({...payoutDetails, email: e.target.value})}
                      placeholder="your-email@paypal.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                )}

                {payoutMethod === 'bank' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                      <input
                        type="text"
                        value={payoutDetails.accountNumber || ''}
                        onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                        placeholder="Enter account number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                      <input
                        type="text"
                        value={payoutDetails.routingNumber || ''}
                        onChange={(e) => setPayoutDetails({...payoutDetails, routingNumber: e.target.value})}
                        placeholder="Enter routing number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        required
                      />
                    </div>
                  </>
                )}

                {payoutMethod === 'crypto' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={payoutDetails.walletAddress || ''}
                      onChange={(e) => setPayoutDetails({...payoutDetails, walletAddress: e.target.value})}
                      placeholder="Enter your crypto wallet address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayoutRequest}
                  disabled={requesting}
                  className={`flex-1 py-3 rounded-lg font-medium whitespace-nowrap ${
                    requesting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  }`}
                >
                  {requesting ? 'Requesting...' : 'Request Payout'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-information-line text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Processing Time</p>
                    <p className="text-xs text-blue-700">
                      Payout requests are typically processed within 2-3 business days. You'll receive an email confirmation once completed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}