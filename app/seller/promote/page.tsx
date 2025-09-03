
'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PromotionOptions from '../../../components/PromotionOptions';
import { useAuth } from '../../../components/AuthProvider';
import { getCreditBalance } from '../../../lib/credits';
import { supabase } from '../../../lib/supabase';

interface UserListing {
  id: string;
  title: string;
  status: string;
  views: number;
  price: number;
  created_at: string;
}

export default function PromotePage() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [selectedListing, setSelectedListing] = useState('');
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Load credit balance
      const balance = await getCreditBalance(user.id);
      setCreditBalance(balance?.current_balance || 0);

      // Load user's actual listings
      const { data: listings, error } = await supabase
        .from('products')
        .select('id, title, status, views, price, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading listings:', error);
        setUserListings([]);
      } else {
        setUserListings(listings || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionApplied = () => {
    loadData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-2xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to promote your listings</p>
            <Link href="/login" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promote Your Listings</h1>
          <p className="text-gray-600">Use your marketplace credits to boost visibility and get more views</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border mb-8">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Select Listing to Promote</h3>
                <p className="text-gray-600">Choose which listing you want to boost</p>
              </div>
              <div className="p-6">
                {userListings.length > 0 ? (
                  <div className="space-y-4">
                    {userListings.map((listing) => (
                      <label key={listing.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="selectedListing"
                          value={listing.id}
                          checked={selectedListing === listing.id}
                          onChange={(e) => setSelectedListing(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border rounded-lg p-4 transition-colors ${
                          selectedListing === listing.id
                            ? 'border-[#004080] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {listing.status}
                                </span>
                                <span className="text-sm text-gray-600">{listing.views || 0} views</span>
                                <span className="text-sm text-gray-600">${listing.price?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedListing === listing.id
                                ? 'border-[#004080] bg-[#004080]'
                                : 'border-gray-300'
                            }`}>
                              {selectedListing === listing.id && (
                                <i className="ri-check-line text-white text-sm"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings</h3>
                    <p className="text-gray-600 mb-6">You need to create listings before you can promote them</p>
                    <Link href="/sell/quick" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                      Create Your First Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {selectedListing && userListings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border">
                <div className="p-6">
                  <PromotionOptions
                    productId={selectedListing}
                    currentBalance={creditBalance}
                    onPromotionApplied={handlePromotionApplied}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-orange-100 mb-1">Available Credits</p>
                  <p className="text-3xl font-bold">${creditBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-coins-line text-2xl"></i>
                </div>
              </div>
              <Link href="/account?tab=credits" className="text-sm text-orange-100 hover:text-white underline cursor-pointer">
                View credit history →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-eye-line text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">More Views</h4>
                    <p className="text-sm text-gray-600">Get 2-3x more visibility for your listings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-search-line text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Higher Rankings</h4>
                    <p className="text-sm text-gray-600">Appear higher in search results</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-purple-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Faster Sales</h4>
                    <p className="text-sm text-gray-600">Items sell up to 40% faster</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Need More Credits?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Earn credits by creating listings, making sales, or referring friends.
                  </p>
                  <Link href="/sell" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline cursor-pointer">
                    Create New Listing →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
