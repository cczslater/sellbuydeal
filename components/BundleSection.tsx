
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBundles } from '../lib/database';

export default function BundleSection() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      const bundleData = await getBundles({ status: 'active' });
      setBundles(bundleData.slice(0, 6)); // Show top 6 bundles
    } catch (error) {
      console.error('Error loading bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">Bundle Deals</h2>
            <p className="text-gray-700 text-lg">Save more when you buy items together</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-white rounded-t-3xl shadow-lg"></div>
                <div className="p-4 space-y-3 bg-white rounded-b-3xl shadow-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bundles.length === 0) {
    return null; // Don't show section if no bundles
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">Bundle Deals</h2>
          <p className="text-gray-700 text-lg">Save more when you buy items together</p>
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
                className="bg-white rounded-3xl shadow-lg border hover:shadow-2xl transition-all cursor-pointer group transform hover:scale-105 duration-300"
              >
                <div className="relative">
                  <img
                    src={bundle.images?.[0] || bundle.bundle_items?.[0]?.products?.images?.[0] || `https://readdy.ai/api/search-image?query=bundle%20deal%20products%20collection%20package%20set%20bright%20colorful%20ecommerce%20style%20cheerful%20background%20vibrant&width=400&height=240&seq=${bundle.id}&orientation=landscape`}
                    alt={bundle.title}
                    className="w-full h-48 object-cover object-top rounded-t-3xl group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <i className="ri-gift-2-fill mr-1"></i>
                      Bundle Deal
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                      <i className="ri-stack-fill mr-1"></i>
                      {bundle.bundle_items?.length || 0} Items
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors text-lg">
                    {bundle.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {bundle.description}
                  </p>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4 bg-gray-50 rounded-full px-3 py-2">
                    <i className="ri-user-3-fill text-[#004080]"></i>
                    <span className="font-medium">{bundle.profiles?.first_name} {bundle.profiles?.last_name}</span>
                    {bundle.profiles?.verified && (
                      <i className="ri-verified-badge-fill text-green-600"></i>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent">
                        ${bundle.total_price?.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${originalTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full text-sm font-bold inline-flex items-center shadow-lg">
                      <i className="ri-price-tag-3-fill mr-1"></i>
                      Save ${bundle.savings_amount?.toFixed(2)} ({((bundle.savings_amount / originalTotal) * 100).toFixed(0)}% off)
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/bundles" className="bg-gradient-to-r from-[#004080] to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 cursor-pointer whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-lg">
            <i className="ri-gift-2-fill mr-2"></i>
            View All Bundle Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
