
'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabase';

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  max_price: number;
  condition_preference: string;
  urgency_level: 'low' | 'medium' | 'high';
  status: 'active' | 'matched' | 'fulfilled';
  match_count: number;
  created_at: string;
}

interface MatchedListing {
  id: string;
  wishlist_item_id: string;
  product_id: string;
  seller_id: string;
  match_score: number;
  status: 'pending' | 'viewed' | 'interested' | 'declined';
  created_at: string;
  product: {
    title: string;
    price: number;
    images: string[];
    condition: string;
    seller: {
      first_name: string;
      last_name: string;
      verified: boolean;
    };
  };
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [matches, setMatches] = useState<MatchedListing[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    max_price: '',
    condition_preference: 'any',
    urgency_level: 'medium' as const
  });

  useEffect(() => {
    if (user) {
      loadWishlistData();
    }
  }, [user]);

  const loadWishlistData = async () => {
    try {
      const [wishlistResponse, matchesResponse] = await Promise.all([
        supabase
          .from('wishlist_items')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('wishlist_matches')
          .select(`
            *,
            products (
              title,
              price,
              images,
              condition,
              profiles!seller_id (
                first_name,
                last_name,
                verified
              )
            )
          `)
          .eq('buyer_id', user?.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      setWishlistItems(wishlistResponse.data || []);
      setMatches(matchesResponse.data || []);
    } catch (error) {
      console.error('Error loading wishlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWishlistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          max_price: parseFloat(newItem.max_price) || null,
          condition_preference: newItem.condition_preference,
          urgency_level: newItem.urgency_level,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setWishlistItems(prev => [data, ...prev]);
      setNewItem({
        title: '',
        description: '',
        category: '',
        max_price: '',
        condition_preference: 'any',
        urgency_level: 'medium'
      });
      setShowAddForm(false);

      // Trigger seller notifications
      await notifySellers(data);
    } catch (error) {
      console.error('Error adding wishlist item:', error);
    }
  };

  const notifySellers = async (wishlistItem: WishlistItem) => {
    try {
      await supabase.functions.invoke('notify-sellers-wishlist', {
        body: {
          wishlist_item: wishlistItem,
          buyer_id: user?.id
        }
      });
    } catch (error) {
      console.error('Error notifying sellers:', error);
    }
  };

  const respondToMatch = async (matchId: string, status: 'interested' | 'declined') => {
    try {
      await supabase
        .from('wishlist_matches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', matchId);

      setMatches(prev => prev.filter(match => match.id !== matchId));
    } catch (error) {
      console.error('Error responding to match:', error);
    }
  };

  const deleteWishlistItem = async (itemId: string) => {
    try {
      await supabase
        .from('wishlist_items')
        .update({ status: 'inactive' })
        .eq('id', itemId);

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-line text-3xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to access your wishlist</h2>
          <p className="text-gray-600 mb-8">Create wishlist items and get notified when sellers have what you want</p>
          <Link href="/login" className="bg-[#004080] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">Tell sellers what you're looking for and get instant matches</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#004080] to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2"
            >
              <i className="ri-add-line text-xl"></i>
              <span>Add Wishlist Item</span>
            </button>
          </div>

          <div className="flex space-x-1 bg-white rounded-lg p-1 mt-6 w-fit">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer whitespace-nowrap ${
                activeTab === 'items'
                  ? 'bg-[#004080] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Wishlist ({wishlistItems.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-[#004080] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New Matches ({matches.length})
            </button>
          </div>
        </div>

        {activeTab === 'items' && (
          <div className="space-y-6">
            {wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.urgency_level === 'high' ? 'bg-red-500' :
                          item.urgency_level === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {item.urgency_level} priority
                        </span>
                      </div>
                      <button
                        onClick={() => deleteWishlistItem(item.id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      {item.max_price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Max Price:</span>
                          <span className="font-bold text-[#004080]">${item.max_price}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Condition:</span>
                        <span className="font-medium capitalize">{item.condition_preference}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'active' ? 'bg-green-500' :
                          item.status === 'matched' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <i className="ri-eye-line"></i>
                        <span>{item.match_count} matches</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-heart-add-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No wishlist items yet</h3>
                <p className="text-gray-600 mb-8">Add items you're looking for and get notified when sellers have them</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-[#004080] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <img
                        src={match.product.images[0] || 'https://readdy.ai/api/search-image?query=product%20placeholder%20simple%20clean%20minimal%20background%20professional%20lighting&width=400&height=300&seq=placeholder1&orientation=landscape'}
                        alt={match.product.title}
                        className="w-24 h-24 rounded-xl object-cover object-top"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{match.product.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-gray-600">by</span>
                              <span className="font-medium text-gray-900">
                                {match.product.seller.first_name} {match.product.seller.last_name}
                              </span>
                              {match.product.seller.verified && (
                                <i className="ri-verified-badge-fill text-blue-500"></i>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#004080]">${match.product.price}</p>
                            <div className="flex items-center space-x-1 text-sm text-green-600 mt-1">
                              <i className="ri-check-line"></i>
                              <span>{match.match_score}% match</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <i className="ri-shield-check-line"></i>
                            <span>Condition: {match.product.condition}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="ri-time-line"></i>
                            <span>Listed {new Date(match.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => respondToMatch(match.id, 'interested')}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                          >
                            I'm Interested
                          </button>
                          <Link
                            href={`/product/${match.product_id}`}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => respondToMatch(match.id, 'declined')}
                            className="text-gray-500 hover:text-red-500 cursor-pointer"
                          >
                            <i className="ri-close-line text-xl"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-notification-off-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600">When sellers list items that match your wishlist, they'll appear here</p>
              </div>
            )}
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Wishlist Item</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={addWishlistItem} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are you looking for? *
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., iPhone 15 Pro Max, MacBook Air M2, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description & Details
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe specific features, colors, or requirements..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{newItem.description.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({...prev, category: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                    >
                      <option value="">Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports & Recreation</option>
                      <option value="books">Books & Media</option>
                      <option value="automotive">Automotive</option>
                      <option value="collectibles">Collectibles</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={newItem.max_price}
                        onChange={(e) => setNewItem(prev => ({...prev, max_price: e.target.value}))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition Preference</label>
                    <select
                      value={newItem.condition_preference}
                      onChange={(e) => setNewItem(prev => ({...prev, condition_preference: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                    >
                      <option value="any">Any condition</option>
                      <option value="new">New only</option>
                      <option value="like-new">Like new or better</option>
                      <option value="good">Good or better</option>
                      <option value="fair">Fair or better</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                    <select
                      value={newItem.urgency_level}
                      onChange={(e) => setNewItem(prev => ({...prev, urgency_level: e.target.value as any}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                    >
                      <option value="low">Low - I can wait</option>
                      <option value="medium">Medium - Preferred soon</option>
                      <option value="high">High - Need ASAP</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#004080] to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    Add to Wishlist
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}