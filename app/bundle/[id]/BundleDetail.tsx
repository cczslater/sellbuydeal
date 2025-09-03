'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getBundle, incrementBundleViews } from '../../../lib/database';
import { useAuth } from '../../../components/AuthProvider';

interface BundleDetailProps {
  bundleId: string;
}

export default function BundleDetail({ bundleId }: BundleDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [bundle, setBundle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    loadBundle();
  }, [bundleId]);

  const loadBundle = async () => {
    try {
      const bundleData = await getBundle(bundleId);
      setBundle(bundleData);
      
      // Increment views
      await incrementBundleViews(bundleId);
    } catch (error) {
      console.error('Error loading bundle:', error);
      router.push('/not-found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Add bundle to cart logic
    alert(`Added ${bundle.title} to cart!`);
  };

  const handleBuyNow = () => {
    // Direct to checkout with bundle
    router.push(`/checkout?bundle=${bundleId}&quantity=${selectedQuantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bundle details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h1>
          <Link href="/categories" className="text-[#004080] hover:text-blue-700 font-medium cursor-pointer">
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [
    ...(bundle.images || []),
    ...bundle.bundle_items?.flatMap((item: any) => item.products?.images || []).slice(0, 6) || []
  ].filter(Boolean);

  const originalTotal = bundle.bundle_items?.reduce((sum: number, item: any) => 
    sum + (item.individual_price * item.quantity), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-800 cursor-pointer">Home</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link href="/categories" className="hover:text-gray-800 cursor-pointer">Categories</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="capitalize">{bundle.category}</span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-800">Bundle Deal</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="relative">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[currentImageIndex]}
                    alt={bundle.title}
                    className="w-full h-96 object-cover object-top rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="ri-image-line text-4xl text-gray-400"></i>
                  </div>
                )}

                {allImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev > 0 ? prev - 1 : allImages.length - 1
                      )}
                      className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 cursor-pointer"
                    >
                      <i className="ri-arrow-left-s-line text-gray-800"></i>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev < allImages.length - 1 ? prev + 1 : 0
                      )}
                      className="w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 cursor-pointer"
                    >
                      <i className="ri-arrow-right-s-line text-gray-800"></i>
                    </button>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex space-x-2 mt-4">
                  {allImages.slice(0, 5).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        currentImageIndex === index ? 'border-[#004080]' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                  {allImages.length > 5 && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{allImages.length - 5}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included in This Bundle</h3>
              <div className="space-y-4">
                {bundle.bundle_items?.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={item.products?.images?.[0] || `https://readdy.ai/api/search-image?query=product%20placeholder%20image%20simple%20clean%20background%20modern%20minimalist%20style&width=64&height=64&seq=${item.product_id}&orientation=squarish`}
                      alt={item.products?.title}
                      className="w-16 h-16 object-cover object-top rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.products?.title}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-[#004080]">
                        Individual: ${item.individual_price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-[#FFA500] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Bundle Deal
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mt-3">{bundle.title}</h1>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-bold text-[#004080]">
                    ${bundle.total_price?.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${originalTotal.toFixed(2)}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    Save ${bundle.savings_amount?.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {((bundle.savings_amount / originalTotal) * 100).toFixed(0)}% savings compared to buying individually
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <i className="ri-user-line text-gray-600"></i>
                  <Link 
                    href={`/seller/${bundle.profiles?.id}`}
                    className="font-medium text-[#004080] hover:text-blue-700 cursor-pointer"
                  >
                    {bundle.profiles?.first_name} {bundle.profiles?.last_name}
                  </Link>
                  {bundle.profiles?.verified && (
                    <i className="ri-verified-badge-line text-green-600"></i>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <i className="ri-eye-line"></i>
                    <span>{bundle.views || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-package-line"></i>
                    <span>{bundle.bundle_items?.length || 0} items</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-lg w-32">
                    <button
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-l border-r border-gray-300 flex-1 text-center">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#FFA500] text-white py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap"
                >
                  Buy Bundle Now - ${(bundle.total_price * selectedQuantity).toFixed(2)}
                </button>
                
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-[#004080] text-[#004080] py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 cursor-pointer whitespace-nowrap"
                >
                  Add Bundle to Cart
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <i className="ri-shield-check-line text-green-600"></i>
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-truck-line text-blue-600"></i>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-arrow-go-back-line text-orange-600"></i>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Description</h3>
              <p className="text-gray-700 leading-relaxed">{bundle.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}