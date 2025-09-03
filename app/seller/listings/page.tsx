
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import ListingPromotions from '../../../components/ListingPromotions';
import Link from 'next/link';
import { getCurrentUser } from '../../../lib/auth';
import { getSellerProducts, getSellerBundles } from '../../../lib/database';

export default function SellerListings() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromotions, setShowPromotions] = useState<string | null>(null);
  const [listings, setListings] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const [products, bundleDeals] = await Promise.all([
          getSellerProducts(user.id),
          getSellerBundles(user.id)
        ]);
        setListings(products);
        setBundles(bundleDeals);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auction':
        return 'ri-auction-line';
      case 'bundle':
        return 'ri-gift-line';
      case 'fixed':
        return 'ri-price-tag-3-line';
      default:
        return 'ri-shopping-bag-line';
    }
  };

  // Combine products and bundles with type indicator
  const allListings = [
    ...listings.map(item => ({ ...item, listingType: 'product' })),
    ...bundles.map(item => ({ ...item, listingType: 'bundle', type: 'bundle' }))
  ];

  const filteredListings = allListings.filter(listing => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'bundles' && listing.listingType === 'bundle') ||
      (activeTab !== 'bundles' && listing.status === activeTab);
    
    const matchesSearch = searchQuery === '' || 
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handlePromotionApplied = () => {
    setShowPromotions(null);
    loadListings();
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
              <p className="text-gray-600">Loading your listings...</p>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
                <p className="text-gray-600">Manage your products and bundle deals</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/sell/bundle" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap">
                  Create Bundle
                </Link>
                <Link href="/sell/quick" className="bg-[#FFA500] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                  Create Listing
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: 'All Items', count: allListings.length },
                    { key: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
                    { key: 'bundles', label: 'Bundles', count: bundles.length },
                    { key: 'draft', label: 'Drafts', count: listings.filter(l => l.status === 'draft').length },
                    { key: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length }
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
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent text-sm"
                  />
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredListings.length > 0 ? (
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <div key={`${listing.listingType}-${listing.id}`}>
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <img
                            src={listing.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20simple%20clean%20background%20modern%20minimalist%20style&width=64&height=64&seq=${listing.id}&orientation=squarish`}
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded-lg object-top"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                                  {listing.listingType === 'bundle' && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                      Bundle Deal
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <i className={`${getTypeIcon(listing.type || 'fixed')}`}></i>
                                    <span className="capitalize">
                                      {listing.listingType === 'bundle' ? 'Bundle' : (listing.type || 'fixed')}
                                    </span>
                                  </div>
                                  <span>
                                    {listing.listingType === 'bundle' 
                                      ? `$${listing.total_price?.toFixed(2)}`
                                      : `$${listing.price?.toFixed(2)}`
                                    }
                                  </span>
                                  <span>{listing.views || 0} views</span>
                                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                  {listing.listingType === 'bundle' && (
                                    <span>{listing.bundle_items?.length || 0} items</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(listing.status)}`}>
                                  {listing.status}
                                </span>
                                
                                <div className="flex items-center space-x-2">
                                  {listing.listingType === 'product' && (
                                    <button
                                      onClick={() => setShowPromotions(showPromotions === listing.id ? null : listing.id)}
                                      className="text-[#FFA500] hover:text-orange-600 text-sm font-medium cursor-pointer whitespace-nowrap flex items-center space-x-1"
                                    >
                                      <i className="ri-megaphone-line"></i>
                                      <span>Promote</span>
                                    </button>
                                  )}
                                  
                                  <Link
                                    href={listing.listingType === 'bundle' 
                                      ? `/bundle/${listing.id}` 
                                      : `/product/${listing.id}`
                                    }
                                    className="text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer"
                                  >
                                    {listing.listingType === 'bundle' ? 'View Bundle' : 'Edit'}
                                  </Link>
                                  
                                  <button className="text-gray-600 hover:text-gray-800 cursor-pointer">
                                    <i className="ri-more-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {showPromotions === listing.id && listing.listingType === 'product' && (
                        <div className="mt-4 p-6 border border-blue-200 rounded-lg bg-blue-50">
                          <ListingPromotions
                            listingId={listing.id}
                            listingTitle={listing.title}
                            onPromotionApplied={handlePromotionApplied}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first listing or bundle deal</p>
                  <div className="flex items-center justify-center space-x-3">
                    <Link href="/sell/bundle" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 cursor-pointer whitespace-nowrap">
                      Create Bundle
                    </Link>
                    <Link href="/sell/quick" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                      Create Listing
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
