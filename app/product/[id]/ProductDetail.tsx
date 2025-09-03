
'use client';
import { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import MessageCenter from '../../../components/MessageCenter';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  const product = {
    id: productId,
    title: 'iPhone 15 Pro Max 256GB - Brand New Sealed',
    price: 1199.00,
    originalPrice: 1299.00,
    images: [
      'https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20in%20professional%20product%20photography%2C%20premium%20smartphone%20on%20clean%20white%20background%20with%20elegant%20shadows%20and%20studio%20lighting&width=600&height=600&seq=prod-main&orientation=squarish',
      'https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20back%20view%20showing%20camera%20system%2C%20professional%20product%20shot%20with%20clean%20background%20and%20premium%20lighting&width=600&height=600&seq=prod-back&orientation=squarish',
      'https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20side%20profile%20with%20accessories%2C%20professional%20product%20photography%20on%20white%20background&width=600&height=600&seq=prod-side&orientation=squarish'
    ],
    seller: {
      id: 'seller123',
      name: 'TechHub Store',
      rating: 4.9,
      reviews: 2847,
      location: 'New York, NY',
      verified: true
    },
    condition: 'New',
    shipping: 'Free',
    returns: '30-day returns',
    description: 'Brand new iPhone 15 Pro Max 256GB in original sealed packaging. This is the latest model featuring the powerful A17 Pro chip, titanium design, and advanced camera system. Perfect for photography enthusiasts and power users.',
    features: [
      'A17 Pro chip with 6-core GPU',
      '6.7-inch Super Retina XDR display',
      'Pro camera system with 48MP Main',
      '256GB storage capacity',
      'Face ID for secure authentication',
      'MagSafe and Qi wireless charging'
    ],
    type: 'buy_now',
    watchers: 127,
    views: 3428,
    acceptsOffers: true
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span>Home</span>
          <i className="ri-arrow-right-s-line"></i>
          <span>Electronics</span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900 font-medium">iPhone 15 Pro Max</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                      <img
                        src={product.images[selectedImage]}
                        alt={product.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex space-x-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                            selectedImage === index ? 'border-[#004080]' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover object-top"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-3xl font-bold text-[#004080]">${product.price.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">${product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                          {product.condition}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <i className="ri-eye-line"></i>
                          <span>{product.views.toLocaleString()} views</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="ri-heart-line"></i>
                          <span>{product.watchers} watching</span>
                        </span>
                      </div>

                      {product.acceptsOffers && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <i className="ri-hand-coin-line text-blue-600"></i>
                            <span className="text-sm font-medium text-blue-800">Make an Offer Available</span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">This seller accepts reasonable offers</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#004080] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{product.seller.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{product.seller.name}</p>
                            {product.seller.verified && (
                              <i className="ri-verified-badge-fill text-blue-500"></i>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`ri-star-${i < Math.floor(product.seller.rating) ? 'fill' : 'line'} text-yellow-400 text-xs`}></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({product.seller.reviews.toLocaleString()})</span>
                          </div>
                          <p className="text-sm text-gray-600">{product.seller.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="ri-truck-line text-green-600"></i>
                        <span className="text-gray-700">{product.shipping} shipping</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="ri-refresh-line text-blue-600"></i>
                        <span className="text-gray-700">{product.returns}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full bg-[#004080] text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        Buy It Now
                      </button>
                      
                      <button className="w-full bg-[#FFA500] text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 cursor-pointer whitespace-nowrap">
                        Add to Cart
                      </button>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowMessageCenter(true)}
                          className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
                        >
                          <i className="ri-message-2-line"></i>
                          <span>Contact Seller</span>
                        </button>
                        <button
                          onClick={() => setIsWatching(!isWatching)}
                          className={`px-4 py-3 rounded-lg border cursor-pointer ${
                            isWatching 
                              ? 'bg-red-50 border-red-200 text-red-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <i className={`${isWatching ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border mt-8 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <i className="ri-check-line text-green-600"></i>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="ri-shopping-cart-line text-blue-600"></i>
                    <div>
                      <p className="font-medium text-gray-900">Buy It Now</p>
                      <p className="text-sm text-gray-600">Instant purchase</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#004080]">${product.price.toLocaleString()}</span>
                </div>
                
                {product.acceptsOffers && (
                  <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="ri-hand-coin-line text-blue-600"></i>
                      <div>
                        <p className="font-medium text-blue-900">Make an Offer</p>
                        <p className="text-sm text-blue-700">Negotiate price</p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Available</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-medium text-green-600">{product.shipping}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Returns</span>
                  <span className="font-medium">{product.returns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Delivery</span>
                  <span className="font-medium">2-3 business days</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Policies</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• All items are shipped within 1 business day</p>
                <p>• 30-day return policy for all items</p>
                <p>• Items must be returned in original condition</p>
                <p>• Return shipping costs paid by buyer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageCenter && (
        <MessageCenter
          productTitle={product.title}
          productImage={product.images[0]}
          sellerId={product.seller.id}
          sellerName={product.seller.name}
          onClose={() => setShowMessageCenter(false)}
        />
      )}
      
      <Footer />
    </div>
  );
}
