
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AdvancedSearch from '../../components/AdvancedSearch';
import { getProducts } from '../../lib/database';

function BrowseContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams?.get('search') || '',
    category: searchParams?.get('category') || '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    type: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filterParams: any = {};
        if (filters.search) filterParams.search = filters.search;
        if (filters.category) filterParams.category = filters.category;
        if (filters.condition) filterParams.condition = filters.condition;
        if (filters.minPrice) filterParams.minPrice = Number(filters.minPrice);
        if (filters.maxPrice) filterParams.maxPrice = Number(filters.maxPrice);
        if (filters.type) filterParams.type = filters.type;

        const data = await getProducts(filterParams);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse All Listings</h1>
          <p className="text-gray-600">Find the perfect item from our marketplace</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AdvancedSearch filters={filters} onFiltersChange={setFilters} />
          </aside>

          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${products.length} items found`}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004080] pr-8">
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                    <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img
                          src={product.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20simple%20clean%20background%20modern%20minimalist%20style&width=300&height=300&seq=${product.id}&orientation=squarish`}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 object-top"
                        />
                        {product.type === 'auction' && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Auction
                            </span>
                          </div>
                        )}
                        <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="ri-heart-line text-gray-600"></i>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-[#004080]">${product.price}</span>
                          <div className="flex items-center space-x-1">
                            <i className="ri-eye-line text-sm text-gray-500"></i>
                            <span className="text-sm text-gray-500">{product.views || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{product.condition}</span>
                          {product.profiles?.verified && (
                            <span className="text-green-600 flex items-center">
                              <i className="ri-verified-badge-fill mr-1"></i>
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{product.category}</span>
                          <span>{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-search-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No items found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filters.search || filters.category || filters.condition || filters.minPrice || filters.maxPrice
                    ? "Try adjusting your search filters to find what you're looking for."
                    : "Be the first to add products to our marketplace. Start selling today!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sell" className="bg-[#FFA500] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                    Start Selling
                  </Link>
                  {(filters.search || filters.category || filters.condition || filters.minPrice || filters.maxPrice) && (
                    <button
                      onClick={() => setFilters({
                        search: '',
                        category: '',
                        condition: '',
                        minPrice: '',
                        maxPrice: '',
                        type: ''
                      })}
                      className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
