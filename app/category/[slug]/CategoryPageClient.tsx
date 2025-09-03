
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { supabase } from '../../../lib/supabase';
export const dynamic = "force-dynamic";
interface CategoryPageClientProps {
  slug: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
  seller_id: string;
  condition: string;
  status: string;
  type: 'auction' | 'fixed';
  views: number;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [slug, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (
            first_name,
            last_name
          )
        `)
        .eq('status', 'active');

      // Apply category filter if not 'all'
      if (slug !== 'all') {
        query = query.eq('category', getCategoryName(slug).toLowerCase());
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('views', { ascending: false });
      }

      const { data, error, count } = await query.limit(20);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (slug: string) => {
    const categories: { [key: string]: string } = {
      'electronics': 'Electronics',
      'fashion': 'Fashion',
      'home-garden': 'Home & Garden',
      'automotive': 'Automotive',
      'sports-outdoors': 'Sports & Outdoors',
      'collectibles-art': 'Collectibles & Art'
    };
    return categories[slug] || 'Category';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auction':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'auction':
        return 'Auction';
      default:
        return 'Buy Now';
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border p-4 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-24"></div>
                <div className="h-3 bg-gray-200 rounded mb-1 w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-[#004080]">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link href="/categories" className="hover:text-[#004080]">Categories</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900 font-medium">{getCategoryName(slug)}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getCategoryName(slug)}</h1>
              <p className="text-gray-600">{totalCount} items found</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                >
                  <option value="best-match">Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="ending">Ending Soonest</option>
                </select>
              </div>
              
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 cursor-pointer ${viewMode === 'grid' ? 'bg-[#004080] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <i className="ri-grid-line text-lg"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 cursor-pointer ${viewMode === 'list' ? 'bg-[#004080] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <i className="ri-list-unordered text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Min"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="text"
                      placeholder="Max"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button className="text-[#004080] text-sm font-medium hover:text-blue-700 cursor-pointer whitespace-nowrap">Apply</button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Condition</h3>
                <div className="space-y-2">
                  {['New', 'Like New', 'Excellent', 'Good', 'Fair'].map(condition => (
                    <label key={condition} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Listing Type</h3>
                <div className="space-y-2">
                  {['Buy Now', 'Auction', 'Make Offer'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Shipping</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Free Shipping</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Local Pickup</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>
          
          <main className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-shopping-bag-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-8">No items are currently listed in this category.</p>
                <Link 
                  href="/sell" 
                  className="bg-[#FFA500] text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap inline-block"
                >
                  Be the first to sell in this category
                </Link>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {products.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                      {viewMode === 'grid' ? (
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                          <div className="relative">
                            <img
                              src={product.images[0] || 'https://readdy.ai/api/search-image?query=product%20placeholder%20image%20on%20clean%20white%20background&width=300&height=300&seq=placeholder&orientation=squarish'}
                              alt={product.title}
                              className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}>
                                {getTypeLabel(product.type)}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <button className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors cursor-pointer">
                                <i className="ri-heart-line text-gray-600"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors line-clamp-2">
                              {product.title}
                            </h3>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-2xl font-bold text-[#004080]">{formatPrice(product.price)}</span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p className="font-medium">
                                {product.profiles?.first_name} {product.profiles?.last_name}
                              </p>
                              <p className="capitalize">{product.condition}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {product.views} views
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 border border-gray-100">
                          <div className="flex space-x-4">
                            <div className="w-32 h-32 flex-shrink-0">
                              <img
                                src={product.images[0] || 'https://readdy.ai/api/search-image?query=product%20placeholder%20image%20on%20clean%20white%20background&width=300&height=300&seq=placeholder&orientation=squarish'}
                                alt={product.title}
                                className="w-full h-full object-cover object-top rounded-lg"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#004080] transition-colors">
                                  {product.title}
                                </h3>
                                <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                                  <i className="ri-heart-line text-gray-600"></i>
                                </button>
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xl font-bold text-[#004080]">{formatPrice(product.price)}</span>
                                {product.original_price && product.original_price > product.price && (
                                  <span className="text-sm text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}>
                                  {getTypeLabel(product.type)}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="font-medium">
                                  {product.profiles?.first_name} {product.profiles?.last_name}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{product.condition}</span>
                                <span>•</span>
                                <span>{product.views} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                
                <div className="mt-12 flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-2 text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap">
                      <i className="ri-arrow-left-line"></i>
                    </button>
                    {[1, 2, 3, 4, 5].map(page => (
                      <button
                        key={page}
                        className={`px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                          page === 1
                            ? 'bg-[#004080] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-3 py-2 text-gray-500">...</span>
                    <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer whitespace-nowrap">
                      {Math.ceil(totalCount / 20)}
                    </button>
                    <button className="px-3 py-2 text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap">
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </nav>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
