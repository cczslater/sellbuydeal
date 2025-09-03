
'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import VideoUploader from '../../../components/VideoUploader';
import EbayImporter from '../../../components/EbayImporter';
import { useAuth } from '../../../components/AuthProvider';
import { createProduct } from '../../../lib/database';
import { checkAndRewardFirstListings } from '../../../lib/credits';
import { supabase } from '../../../lib/supabase';

export default function QuickSellPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFirstTimeBoost, setShowFirstTimeBoost] = useState(false);
  const [userListingsCount, setUserListingsCount] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [wishlistMatch, setWishlistMatch] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    images: [] as File[],
    type: 'fixed',
    shipping_cost: '0',
    listingType: 'buy_it_now',
    quantity: 1,
    weight: '',
    shippingPrice: '',
    tags: ''
  });

  useEffect(() => {
    if (user) {
      checkFirstTimeSeller();
    }
  }, [user]);

  const checkFirstTimeSeller = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', user.id);

      const count = data?.length || 0;
      setUserListingsCount(count);
      setShowFirstTimeBoost(count < 3);
    } catch (error) {
      console.error('Error checking first-time seller status:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('wishlist_match') === 'true') {
      const matchData = localStorage.getItem('wishlist_match_data');
      if (matchData) {
        const data = JSON.parse(matchData);
        setWishlistMatch(data);
        setFormData(prev => ({
          ...prev,
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          price: data.suggestedPrice?.toString() || '',
          listingType: data.listingType || 'buy_it_now'
        }));
        localStorage.removeItem('wishlist_match_data');
      }
    }
  }, []);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books & Media',
    'Automotive',
    'Toys & Games',
    'Health & Beauty',
    'Music',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'Brand New', description: 'Never used, in original packaging', icon: 'ri-price-tag-3-line' },
    { value: 'like-new', label: 'Like New', description: 'Used once or twice, excellent condition', icon: 'ri-star-line' },
    { value: 'good', label: 'Good', description: 'Used but well maintained', icon: 'ri-thumb-up-line' },
    { value: 'fair', label: 'Fair', description: 'Shows wear but fully functional', icon: 'ri-tools-line' },
    { value: 'poor', label: 'Poor', description: 'Significant wear, may need repair', icon: 'ri-settings-line' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
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

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedVideo) {
      total += 2.99; // Video upgrade cost
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to create a listing');
      return;
    }

    if (formData.images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    const total = calculateTotal();

    // Show payment modal if there are charges
    if (total > 0) {
      setShowPaymentModal(true);
      return;
    }

    // Create listing directly if no charges
    await createListing();
  };

  const handlePayment = async () => {
    setProcessingPayment(true);

    // Simulate payment processing
    setTimeout(async () => {
      setProcessingPayment(false);
      setShowPaymentModal(false);
      await createListing();
    }, 2000);
  };

  const createListing = async () => {
    setLoading(true);

    try {
      const imageUrls = formData.images.map((file, index) =>
        `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.title%29%7D%20product%20image%20high%20quality%20professional%20photography&width=800&height=800&seq=${user.id}-${Date.now()}-${index}&orientation=squarish`
      );

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        images: imageUrls,
        type: formData.type,
        shipping_cost: parseFloat(formData.shippingPrice || '0'),
        seller_id: user.id,
        status: 'active',
        has_video: selectedVideo ? true : false,
        listingType: formData.listingType
      };

      const product = await createProduct(productData);

      await checkAndRewardFirstListings(user.id);

      alert('Listing created successfully!');
      router.push(`/product/${product.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-[#004080] to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <i className="ri-user-line text-4xl text-white"></i>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Premium Marketplace</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Sign in to start selling your items to millions of buyers worldwide with our advanced selling tools</p>
            <Link href="/login" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#004080] to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap">
              <i className="ri-login-circle-line mr-2 text-xl"></i>
              Sign In to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FFA500] to-orange-600 text-white rounded-full text-sm font-medium mb-6">
            <i className="ri-rocket-line mr-2"></i>
            Premium Quick Sell Experience
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#004080] to-blue-600 bg-clip-text text-transparent mb-4">
            Quick Sell
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            List your item in minutes with our intelligent selling assistant and advanced features
          </p>

          <div className="flex items-center justify-center space-x-8 mb-8">
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="group flex items-center px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg"
            >
              <i className="ri-download-cloud-2-line mr-2 group-hover:scale-110 transition-transform"></i>
              Import from eBay
            </button>

            <div className="flex items-center text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-sm">Or create manually below</span>
            </div>
          </div>
        </div>

        {/* eBay Importer */}
        {showImporter && (
          <div className="mb-12 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">eBay Import Assistant</h3>
              <p className="text-blue-100">Import your existing eBay listings instantly</p>
            </div>
            <div className="p-8">
              <EbayImporter onImportComplete={() => {
                setShowImporter(false);
              }} />
            </div>
          </div>
        )}

        {/* Wishlist Match Alert */}
        {wishlistMatch && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-heart-3-fill text-green-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Wishlist Match Detected!</h3>
                <p className="text-green-700 mb-4">
                  Great news! Your item matches what {wishlistMatch.buyerCount} buyers are looking for. 
                  This increases your chances of a quick sale by 3x!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">
                      Suggested Price: ${wishlistMatch.suggestedPrice}
                    </span>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-800">
                      {wishlistMatch.buyerCount} interested buyers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First Time Seller Boost */}
        {showFirstTimeBoost && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-gift-line text-purple-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">🚀 First-Time Seller Boost Active!</h3>
                <p className="text-purple-700 mb-4">
                  Your first {Math.min(3, 3 - userListingsCount)} listings get FREE promotional boosts worth $15 each! 
                  Plus earn $1 credit for each of your first 5 listings.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-800">7 Days</div>
                    <div className="text-xs text-purple-600">Featured Badge</div>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-800">5x</div>
                    <div className="text-xs text-purple-600">More Visibility</div>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-800">$15</div>
                    <div className="text-xs text-purple-600">Free Promotion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#004080] to-blue-600 p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Your Listing</h2>
            <p className="text-blue-100">Fill in the details below to list your item</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-information-line text-blue-600"></i>
                    </div>
                    Basic Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
                        placeholder="Enter a descriptive title for your item..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {formData.title.length}/80 characters • Be specific and descriptive
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          required
                        >
                          <option value="">Select category...</option>
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe your item in detail. Include condition, features, and any defects..."
                        required
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500 characters</p>
                    </div>
                  </div>
                </div>

                {/* Condition Selection */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-shield-check-line text-green-600"></i>
                    </div>
                    Item Condition
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {conditions.map((condition) => (
                      <label
                        key={condition.value}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          formData.condition === condition.value
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={condition.value}
                          checked={formData.condition === condition.value}
                          onChange={(e) => handleInputChange('condition', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          formData.condition === condition.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          <i className={`${condition.icon} text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{condition.label}</h4>
                          <p className="text-sm text-gray-600">{condition.description}</p>
                        </div>
                        {formData.condition === condition.value && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <i className="ri-check-line text-white text-sm"></i>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Image Upload */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-image-line text-purple-600"></i>
                    </div>
                    Photos ({formData.images.length}/10)
                  </h3>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-camera-line text-3xl text-white"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Photos</h4>
                        <p className="text-gray-600 mb-4">Drag & drop or click to upload</p>
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                          <i className="ri-upload-line mr-2"></i>
                          Choose Files
                        </div>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                            >
                              <i className="ri-close-line text-sm"></i>
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">📸 Photo Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use natural lighting for best results</li>
                        <li>• Show multiple angles and any flaws</li>
                        <li>• First photo becomes your main listing image</li>
                        <li>• High-quality photos increase sales by 40%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-settings-line text-orange-600"></i>
                    </div>
                    Additional Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Shipping Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.shippingPrice}
                          onChange={(e) => handleInputChange('shippingPrice', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="vintage, rare, collectible, mint condition..."
                    />
                    <p className="text-xs text-gray-500 mt-2">Add relevant tags to help buyers find your item</p>
                  </div>
                </div>

                {/* Video Upload */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-video-line text-yellow-600"></i>
                      </div>
                      Premium Video
                    </h3>
                    <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      +$2.99
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">Add a video to showcase your item in action. Videos increase engagement by 300%!</p>
                  
                  <VideoUploader
                    onVideoSelect={setSelectedVideo}
                    selectedVideo={selectedVideo}
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to List?</h3>
                  <p className="text-gray-600">Review your listing and publish when ready</p>
                </div>
                
                {calculateTotal() > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-[#FFA500]">${calculateTotal().toFixed(2)}</p>
                      {selectedVideo && (
                        <p className="text-xs text-gray-500">Includes premium video</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  Save Draft
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-[#004080] to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 inline-block"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <i className="ri-rocket-line mr-3"></i>
                      Publish Listing
                    </>
                  )}
                </button>
              </div>

              {showFirstTimeBoost && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    🎉 <strong>Free promotional boost will be applied automatically!</strong> Your listing will be featured for 7 days.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="ri-secure-payment-line text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold mb-3">Complete Your Listing</h3>
              <p className="text-orange-100 text-lg">Secure payment for premium upgrades</p>
            </div>

            <div className="p-8">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h4>
                <div className="space-y-3">
                  {selectedVideo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Premium Video Upload</span>
                      <span className="font-semibold text-lg">$2.99</span>
                    </div>
                  )}
                  <div className="border-t border-orange-200 pt-3 flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-[#FFA500]">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="space-y-3">
                    {[{
                      value: 'card',
                      icon: 'ri-bank-card-line',
                      label: 'Credit/Debit Card',
                      description: 'Secure payment with your card'
                    }, {
                      value: 'credits',
                      icon: 'ri-coins-line',
                      label: 'Marketplace Credits',
                      description: 'Use your account credits'
                    }].map((method) => (
                      <label key={method.value} className="flex items-center space-x-4 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#FFA500] hover:bg-orange-50 transition-all duration-300">
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-[#FFA500]"
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <i className={`${method.icon} text-2xl text-gray-600`}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className={`flex-1 py-4 rounded-2xl font-bold whitespace-nowrap ${
                    processingPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FFA500] to-orange-600 text-white hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer'
                  }`}
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay $${calculateTotal().toFixed(2)}`
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <i className="ri-shield-check-line text-blue-600 mt-1"></i>
                  <div>
                    <p className="text-sm text-blue-800 font-semibold">100% Secure Payment</p>
                    <p className="text-xs text-blue-700">
                      Your payment is encrypted and secure. Premium upgrades will be applied to your listing immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
