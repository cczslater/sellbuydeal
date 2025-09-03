
'use client';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';
import Link from 'next/link';
import { getCurrentUser } from '../../../lib/auth';
import { getUserStore, updateStore, getSellerProducts } from '../../../lib/database';

export default function SellerStore() {
  const [activeTab, setActiveTab] = useState('overview');
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    return_policy: '',
    shipping_policy: ''
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const [store, products] = await Promise.all([
          getUserStore(user.id),
          getSellerProducts(user.id, 'active')
        ]);

        if (store) {
          setStoreData(store);
          setFormData({
            store_name: store.store_name,
            store_description: store.store_description,
            return_policy: store.return_policy || 'We offer a 30-day return policy for all items. Items must be in original condition with all accessories and packaging.',
            shipping_policy: store.shipping_policy || 'All orders are processed within 1-2 business days. We offer free standard shipping on orders over $50.'
          });
        }

        setStoreProducts(products || []);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (field) => {
    if (!storeData) return;

    try {
      setIsUpdating(true);
      await updateStore(storeData.id, { [field]: formData[field] });
      alert('Changes saved successfully!');
      await loadStoreData(); // Reload data
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate actual store stats from real data
  const storeStats = [
    { 
      label: 'Store Views', 
      value: storeData?.total_views || 0, 
      change: '+0%', 
      icon: 'ri-eye-line' 
    },
    { 
      label: 'Followers', 
      value: storeData?.followers_count || 0, 
      change: '+0%', 
      icon: 'ri-user-heart-line' 
    },
    { 
      label: 'Total Items', 
      value: storeProducts.length.toString(), 
      change: '+' + (storeProducts.length > 0 ? storeProducts.length : 0), 
      icon: 'ri-shopping-bag-line' 
    },
    { 
      label: 'Store Rating', 
      value: storeData?.average_rating ? storeData.average_rating.toFixed(1) : 'New', 
      change: 'New Store', 
      icon: 'ri-star-fill' 
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your store...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-store-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Found</h3>
              <p className="text-gray-600 mb-4">Create your store to start selling</p>
              <Link href="/seller/store/create" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                Create Store
              </Link>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Store</h1>
                <p className="text-gray-600">Manage your storefront and brand presence</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link href={`/store/${storeData.store_name.toLowerCase().replace(/\\s+/g, '-')}`} className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                  View Public Store
                </Link>
                <Link href="/seller/store/edit" className="bg-[#FFA500] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                  Edit Store
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {storeStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center">
                    <i className={`${stat.icon} text-xl text-white`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="border-b">
              <nav className="flex space-x-8 px-8">
                {['overview', 'branding', 'policies'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-[#004080] text-[#004080]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="relative bg-gradient-to-r from-[#004080] to-blue-600 rounded-2xl p-8 text-white overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20"
                      style={{
                        backgroundImage: 'url(https://readdy.ai/api/search-image?query=Professional%20electronics%20store%20banner%20with%20modern%20technology%20products%2C%20clean%20and%20sophisticated%20business%20atmosphere%2C%20blue%20and%20orange%20color%20scheme%2C%20high-end%20retail%20environment&width=800&height=300&seq=store-banner&orientation=landscape)'
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold">{storeData.store_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{storeData.store_name}</h2>
                          <p className="text-blue-100">{storeData.category || 'Online Store'}</p>
                        </div>
                      </div>
                      <p className="text-lg text-blue-100 max-w-2xl">
                        {storeData.store_description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Your Products</h3>
                      <Link href="/seller/listings" className="text-[#004080] hover:text-blue-700 font-medium cursor-pointer">
                        Manage All Products
                      </Link>
                    </div>

                    {storeProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {storeProducts.slice(0, 3).map((item) => (
                          <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <img
                              src={item.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20simple%20clean%20background%20modern%20minimalist%20style&width=200&height=200&seq=${item.id}&orientation=squarish`}
                              alt={item.title}
                              className="w-full h-48 object-cover object-top rounded-lg mb-4"
                            />
                            <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-[#004080]">${item.price}</p>
                              <p className="text-sm text-gray-600">{item.views || 0} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                        <p className="text-gray-600 mb-4">Add your first product to start selling</p>
                        <Link href="/sell/quick" className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                          Add Product
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-8">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                      <input
                        type="text"
                        value={formData.store_name}
                        onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                      <textarea
                        rows={4}
                        value={formData.store_description}
                        onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-[#004080] rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">{storeData.store_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="text-gray-600 mb-2">Current Logo</p>
                        <button className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                          Upload New Logo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <i className="ri-image-line text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600 mb-2">Upload a banner image for your store</p>
                        <button className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                          Upload Banner
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave('store_name')}
                      disabled={isUpdating}
                      className={`px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap ${
                        isUpdating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#FFA500] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'policies' && (
                <div className="space-y-8">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                      <textarea
                        rows={4}
                        value={formData.return_policy}
                        onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy</label>
                      <textarea
                        rows={4}
                        value={formData.shipping_policy}
                        onChange={(e) => setFormData({ ...formData, shipping_policy: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
                      <textarea
                        rows={4}
                        defaultValue="By purchasing from our store, you agree to our terms and conditions. All sales are final unless otherwise stated in our return policy. We reserve the right to cancel any order for any reason."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave('return_policy')}
                      disabled={isUpdating}
                      className={`px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap ${
                        isUpdating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#004080] text-white hover:bg-blue-700'
                      }`}
                    >
                      {isUpdating ? 'Saving...' : 'Save Policies'}
                    </button>
                  </form>
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
