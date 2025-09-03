'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getBundles } from '../../lib/database';

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books & Media' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Health' }
  ];

  useEffect(() => {
    loadBundles();
  }, [selectedCategory, searchQuery]);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const filters: any = { status: 'active' };
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const bundleData = await getBundles(filters);
      setBundles(bundleData);
    } catch (error) {
      console.error('Error loading bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bundle Deals</h1>
          <p className="text-xl text-gray-600">Save more when you buy multiple items together</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bundle deals..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl shadow-sm border">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-gift-line text-3xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bundle Deals Found</h2>
            <p className="text-gray-600 mb-8">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or category filters' 
                : 'Be the first to create an amazing bundle deal!'
              }
            </p>
            <Link href="/sell/bundle" className="bg-[#FFA500] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap">
              Create Bundle Deal
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">{bundles.length} bundle deals found</p>
              <div className="text-sm text-gray-500">
                Sorted by newest first
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle: any) => {
                const originalTotal = bundle.bundle_items?.reduce((sum: number, item: any) => 
                  sum + (item.individual_price * item.quantity), 0
                ) || 0;
                
                return (
                  <Link 
                    key={bundle.id} 
                    href={`/bundle/${bundle.id}`}
                    className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={bundle.images?.[0] || bundle.bundle_items?.[0]?.products?.images?.[0] || `https://readdy.ai/api/search-image?query=bundle%20deal%20products%20collection%20package%20set%20modern%20ecommerce%20style%20clean%20background&width=400&height=240&seq=${bundle.id}&orientation=landscape`}
                        alt={bundle.title}
                        className="w-full h-48 object-cover object-top rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Bundle Deal
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                          {bundle.bundle_items?.length || 0} Items
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors">
                        {bundle.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {bundle.description}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        <i className="ri-user-line"></i>
                        <span>{bundle.profiles?.first_name} {bundle.profiles?.last_name}</span>
                        {bundle.profiles?.verified && (
                          <i className="ri-verified-badge-line text-green-600"></i>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-bold text-[#004080]">
                            ${bundle.total_price?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${originalTotal.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium inline-block">
                          Save ${bundle.savings_amount?.toFixed(2)} ({((bundle.savings_amount / originalTotal) * 100).toFixed(0)}% off)
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}