'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getProducts } from '../../lib/database';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: '',
    type: ''
  });

  useEffect(() => {
    loadProducts();
  }, [query, category, sortBy, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const results = await getProducts({
        search: query,
        category: category || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        condition: filters.condition || undefined,
        type: filters.type as any || undefined
      });
      
      // Sort results
      const sorted = [...results].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'popular':
            return (b.views || 0) - (a.views || 0);
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
      
      setProducts(sorted);
    } catch (error) {
      console.error('Error loading search results:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search Results for "${query}"` : 'Browse Products'}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${products.length} items found`}
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] text-sm pr-8"
                  >
                    <option value="">Any Condition</option>
                    <option value="new">New</option>
                    <option value="like new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] text-sm pr-8"
                  >
                    <option value="">All Types</option>
                    <option value="fixed">Buy It Now</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>

                <button
                  onClick={() => setFilters({ minPrice: '', maxPrice: '', condition: '', type: '' })}
                  className="w-full text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004080] text-sm pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-list-unordered text-lg"></i>
                </button>
                <button className="p-2 text-[#004080] cursor-pointer">
                  <i className="ri-grid-fill text-lg"></i>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={product.images?.[0] || `https://readdy.ai/api/search-image?query=$%7Bproduct.title%7D%20$%7Bproduct.category%7D%20product%20image%20clean%20background%20modern%20style&width=400&height=300&seq=${product.id}&orientation=landscape`}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-t-2xl object-top"
                      />
                      {product.type === 'auction' && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Auction
                        </span>
                      )}
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md cursor-pointer">
                        <i className="ri-heart-line text-gray-600 hover:text-red-500"></i>
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-[#004080]">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {product.views || 0} views
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500 capitalize">
                          {product.condition}
                        </span>
                        <span className="text-xs text-gray-500">
                          By {product.profiles?.first_name} {product.profiles?.last_name}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-search-line text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Link href="/browse" className="text-[#004080] hover:text-blue-700 font-medium cursor-pointer">
                  Browse All Products →
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search results...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}