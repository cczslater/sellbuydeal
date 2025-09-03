
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts } from '../lib/database';

export default function FeaturedListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ status: 'active' });
        setProducts(data.slice(0, 8)); // Show max 8 products
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">Featured Listings</h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">Discover amazing products from trusted sellers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl h-80 animate-pulse shadow-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">Featured Listings</h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">Discover amazing products from trusted sellers</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-[#FFA500] to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <i className="ri-shopping-bag-3-fill text-4xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No listings yet</h3>
            <p className="text-gray-700 mb-10 max-w-md mx-auto text-lg">
              Be the first to add products to our marketplace. Start selling today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sell" className="bg-gradient-to-r from-[#FFA500] to-yellow-400 text-white px-8 py-4 rounded-full font-semibold hover:from-orange-500 hover:to-yellow-500 cursor-pointer whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-lg">
                <i className="ri-add-circle-fill mr-2"></i>
                Start Selling
              </Link>
              <Link href="/register" className="bg-white border-2 border-[#004080] text-[#004080] px-8 py-4 rounded-full font-semibold hover:bg-blue-50 cursor-pointer whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-lg">
                <i className="ri-user-add-fill mr-2"></i>
                Join Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                <div className="bg-white rounded-3xl shadow-lg border hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    <img
                      src={product.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20bright%20colorful%20background%20modern%20minimalist%20style%20cheerful%20vibrant&width=300&height=300&seq=${product.id}&orientation=squarish`}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 object-top"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                        <i className="ri-heart-line text-lg text-red-400 hover:text-red-500 cursor-pointer"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#004080] transition-colors duration-300">{product.title}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent">${product.price}</span>
                      <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                        <i className="ri-eye-fill text-sm text-gray-500"></i>
                        <span className="text-sm text-gray-600 font-medium">{product.views || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">{product.condition}</span>
                      {product.profiles?.verified && (
                        <span className="text-green-600 flex items-center font-medium">
                          <i className="ri-verified-badge-fill mr-1"></i>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/browse" className="bg-gradient-to-r from-[#004080] to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 cursor-pointer whitespace-nowrap transform hover:scale-105 transition-all duration-300 shadow-lg">
              <i className="ri-search-2-fill mr-2"></i>
              View All Listings
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
