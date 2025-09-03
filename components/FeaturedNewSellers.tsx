'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBoostedListings } from '../lib/credits';

export default function FeaturedNewSellers() {
  const [boostedListings, setBoostedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoostedListings();
  }, []);

  const loadBoostedListings = async () => {
    try {
      const listings = await getBoostedListings('first_time_seller');
      setBoostedListings(listings.slice(0, 8)); // Show up to 8 listings
    } catch (error) {
      console.error('Error loading boosted listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || boostedListings.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <i className="ri-star-line text-white"></i>
            </div>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              NEW SELLER SPOTLIGHT
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured First-Time Sellers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing items from new sellers just starting their journey on our marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boostedListings.map((boost) => {
            const product = boost.products;
            const seller = product?.profiles;
            
            return (
              <Link
                key={boost.id}
                href={`/product/${product?.id}`}
                className="group bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer relative"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW SELLER
                  </span>
                </div>
                
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  {product?.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 object-top"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#004080] transition-colors">
                    {product?.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 bg-[#004080] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {seller?.first_name?.[0] || 'S'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {seller?.first_name} {seller?.last_name}
                    </span>
                    {seller?.verified && (
                      <i className="ri-verified-badge-fill text-blue-500 text-sm"></i>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FFA500]">
                      ${product?.price?.toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <i className="ri-star-fill text-yellow-400 text-sm"></i>
                      <span className="text-sm text-gray-600">Featured</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <i className="ri-time-line"></i>
                        <span>
                          {Math.ceil((new Date(boost.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days featured
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <i className="ri-eye-line"></i>
                        <span>Premium boost</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Selling?</h3>
            <p className="text-gray-600 mb-4">
              Join our marketplace and get your first 3 listings featured for free!
            </p>
            <Link href="/sell" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 cursor-pointer whitespace-nowrap">
              Start Selling Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}