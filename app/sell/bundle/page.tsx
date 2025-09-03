
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../components/AuthProvider';
import { getSellerProducts, createBundle } from '../../../lib/database';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}

interface BundleItem extends Product {
  quantity: number;
  selected: boolean;
}

export default function CreateBundle() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<BundleItem[]>([]);
  const [bundleImages, setBundleImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (user) {
      loadSellerProducts();
    }
  }, [user]);

  const loadSellerProducts = async () => {
    try {
      const userProducts = await getSellerProducts(user!.id, 'active');
      setProducts(userProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, quantity: 1, selected: true }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  const handleBundleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (bundleImages.length + files.length > 5) {
      alert('Maximum 5 bundle images allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum 10MB per image.`);
        return false;
      }
      return true;
    });

    setBundleImages(prev => [...prev, ...validFiles]);
  };

  const removeBundleImage = (index: number) => {
    setBundleImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const originalTotal = selectedProducts.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Suggest 10% discount for bundles
    const suggestedDiscount = originalTotal * 0.1;
    const bundlePrice = originalTotal - suggestedDiscount;
    
    return { originalTotal, bundlePrice, savings: suggestedDiscount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedProducts.length < 2) return;

    setSubmitting(true);
    try {
      const { bundlePrice, savings } = calculateTotals();
      
      // Convert images to URLs (in a real app, you'd upload to storage)
      const imageUrls = bundleImages.map((file, index) => 
        `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.title%29%7D%20bundle%20deal%20collection%20set%20package%20high%20quality%20professional%20photography&width=800&height=800&seq=${user.id}-bundle-${Date.now()}-${index}&orientation=squarish`
      );
      
      const bundleData = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        total_price: bundlePrice,
        savings_amount: savings,
        category: formData.category,
        images: imageUrls,
        items: selectedProducts.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          individual_price: item.price
        }))
      };

      await createBundle(bundleData);
      router.push('/seller/listings');
    } catch (error) {
      console.error('Error creating bundle:', error);
      alert('Failed to create bundle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#004080] to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-user-line text-2xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to create bundle deals</p>
          <Link href="/login" className="bg-gradient-to-r from-[#004080] to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading your products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { originalTotal, bundlePrice, savings } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Create Bundle Deal
          </h1>
          <p className="text-xl text-gray-600">Combine products for irresistible package deals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bundle Information */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bundle Information</h2>
              <p className="text-gray-600">Create an compelling package that buyers can't resist</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Bundle Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Winter Fashion Bundle, Ultimate Tech Essentials Set"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Bundle Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what makes this bundle special, the value it provides, and why buyers should choose it over individual items..."
                  rows={4}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-lg transition-all"
                  maxLength={500}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">{formData.description.length}/500 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Bundle Category *</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 appearance-none text-lg transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="books">Books & Media</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="beauty">Beauty & Health</option>
                    <option value="toys">Toys & Games</option>
                    <option value="collectibles">Collectibles & Art</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Images */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bundle Images</h2>
              <p className="text-gray-600">Showcase your bundle with attractive photos</p>
            </div>

            <div className="border-3 border-dashed border-green-300 rounded-3xl p-12 text-center bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleBundleImageUpload}
                className="hidden"
                id="bundle-image-upload"
              />
              <label htmlFor="bundle-image-upload" className="cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <i className="ri-image-add-line text-3xl text-white"></i>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">Upload Bundle Images</p>
                <p className="text-gray-600 mb-4">Show the complete package</p>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-semibold inline-block hover:shadow-lg transform hover:scale-105 transition-all">
                  Choose Images
                </div>
                <p className="text-sm text-gray-500 mt-4">JPG, PNG, WEBP • Max 10MB each • Up to 5 images</p>
              </label>
            </div>

            {bundleImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {bundleImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Bundle ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBundleImage(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Products for Bundle</h2>
                <p className="text-gray-600">Choose items that complement each other perfectly</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{selectedProducts.length}</div>
                <div className="text-sm text-gray-500">Selected</div>
              </div>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <i className="ri-shopping-bag-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Products</h3>
                <p className="text-gray-600 mb-8 text-lg">You need active products to create a bundle</p>
                <Link href="/sell/quick" className="bg-gradient-to-r from-[#FFA500] to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
                  Create Your First Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => {
                  const selected = selectedProducts.find(p => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`border-2 rounded-2xl p-6 transition-all cursor-pointer transform hover:scale-105 ${
                        selected 
                          ? 'border-green-500 bg-green-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                      }`}
                      onClick={() => toggleProductSelection(product)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                            selected 
                              ? 'bg-green-500 border-green-500 shadow-lg' 
                              : 'border-gray-300 hover:border-green-300'
                          }`}>
                            {selected && <i className="ri-check-line text-white text-lg font-bold"></i>}
                          </div>
                        </div>
                        
                        <img
                          src={product.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20simple%20clean%20background%20modern%20minimalist%20style&width=100&height=100&seq=${product.id}&orientation=squarish`}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-2xl object-top shadow-md"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.title}</h3>
                          <p className="text-sm text-gray-600 capitalize mb-2">{product.category}</p>
                          <p className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</p>
                        </div>
                        
                        {selected && (
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-sm font-semibold text-gray-700">Qty:</span>
                            <div className="flex items-center border-2 border-gray-300 rounded-xl bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, selected.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-xl transition-colors"
                              >
                                <i className="ri-subtract-line"></i>
                              </button>
                              <span className="w-12 h-8 flex items-center justify-center border-l border-r border-gray-300 font-bold">
                                {selected.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, selected.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-xl transition-colors"
                              >
                                <i className="ri-add-line"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bundle Pricing */}
          {selectedProducts.length >= 2 && (
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Bundle Pricing Summary</h2>
                <p className="text-green-100 text-lg">Smart savings that attract buyers</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-green-100">Individual Items Total:</span>
                  <span className="font-bold line-through">${originalTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xl">
                  <span className="text-green-100">Bundle Savings:</span>
                  <span className="font-bold text-yellow-300">-${savings.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center text-2xl">
                    <span className="font-bold">Bundle Price:</span>
                    <span className="font-bold text-yellow-300">${bundlePrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-2xl p-4 mt-6">
                  <div className="flex items-center justify-center space-x-3">
                    <i className="ri-discount-percent-line text-2xl text-yellow-300"></i>
                    <span className="text-lg font-bold text-center">
                      Customers save ${savings.toFixed(2)} ({((savings/originalTotal)*100).toFixed(0)}%) with this bundle!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Link href="/sell" className="text-gray-600 hover:text-gray-800 font-semibold cursor-pointer flex items-center space-x-2">
                <i className="ri-arrow-left-line text-xl"></i>
                <span>Back to Sell Options</span>
              </Link>
              
              <div className="flex items-center space-x-6">
                {selectedProducts.length < 2 && (
                  <p className="text-sm text-red-600 font-medium">Select at least 2 products to create a bundle</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || selectedProducts.length < 2 || !formData.title || !formData.description || !formData.category}
                  className={`px-12 py-4 rounded-2xl font-bold text-lg transform transition-all whitespace-nowrap ${
                    submitting || selectedProducts.length < 2 || !formData.title || !formData.description || !formData.category
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-2xl hover:scale-105 cursor-pointer'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Bundle...</span>
                    </div>
                  ) : (
                    'Create Bundle Deal'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
