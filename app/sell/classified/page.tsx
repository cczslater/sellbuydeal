'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '../../../lib/supabase';

export default function CreateClassifiedAd() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ad_type: 'service',
    price: '',
    contact_method: 'message',
    phone: '',
    email: '',
    location: '',
    duration: '30',
    images: [] as File[]
  });

  const categories = [
    'Services',
    'Real Estate',
    'Vehicles',
    'Jobs',
    'Community',
    'For Sale',
    'Housing',
    'Gigs',
    'Personals',
    'Other'
  ];

  const adTypes = [
    { value: 'service', label: 'Service Offered', icon: 'ri-tools-line', description: 'Professional services, repairs, consulting' },
    { value: 'rental', label: 'For Rent', icon: 'ri-home-line', description: 'Property rentals, equipment rentals' },
    { value: 'job', label: 'Job Posting', icon: 'ri-briefcase-line', description: 'Employment opportunities' },
    { value: 'wanted', label: 'Wanted', icon: 'ri-search-line', description: 'Looking for items or services' },
    { value: 'event', label: 'Event', icon: 'ri-calendar-event-line', description: 'Announcements, gatherings' },
    { value: 'community', label: 'Community', icon: 'ri-group-line', description: 'Local community posts' }
  ];

  const contactMethods = [
    { value: 'message', label: 'Platform Messages', icon: 'ri-message-line' },
    { value: 'phone', label: 'Phone Call', icon: 'ri-phone-line' },
    { value: 'email', label: 'Email', icon: 'ri-mail-line' },
    { value: 'both', label: 'Phone & Email', icon: 'ri-contacts-line' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed for classified ads');
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

  const calculateCost = () => {
    const baseCost = 2.99; // Base cost for classified ads
    const durationMultiplier = {
      '7': 1,
      '30': 1.5,
      '60': 2,
      '90': 2.5
    };
    return baseCost * (durationMultiplier[formData.duration as keyof typeof durationMultiplier] || 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to post a classified ad');
      return;
    }

    // Show payment modal
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      setProcessingPayment(false);
      setShowPaymentModal(false);
      await createClassifiedAd();
    }, 2000);
  };

  const createClassifiedAd = async () => {
    setLoading(true);

    try {
      const imageUrls = formData.images.map((file, index) => 
        `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.title%20%20%20%20%20%20%20formData.category%29%7D%20classified%20ad%20image%20professional%20clean%20modern%20style&width=800&height=600&seq=${user.id}-classified-${Date.now()}-${index}&orientation=landscape`
      );

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(formData.duration));

      const adData = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ad_type: formData.ad_type,
        price: formData.price ? parseFloat(formData.price) : null,
        contact_method: formData.contact_method,
        phone: formData.phone || null,
        email: formData.email || null,
        location: formData.location,
        duration_days: parseInt(formData.duration),
        expires_at: expirationDate.toISOString(),
        images: imageUrls,
        status: 'active',
        views: 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('classified_ads')
        .insert([adData]);

      if (error) {
        throw error;
      }

      alert('Classified ad posted successfully!');
      router.push('/classifieds');
    } catch (error) {
      console.error('Error creating classified ad:', error);
      alert('Failed to create classified ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <i className="ri-newspaper-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-600 mb-8 text-lg">Sign in to post classified ads and connect with your local community</p>
            <Link href="/login" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
              Sign In to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Post Classified Ad
          </h1>
          <p className="text-xl text-gray-600">Reach your local community with targeted advertising</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Ad Type Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What are you advertising?</h3>
                <p className="text-gray-600">Choose the type that best describes your ad</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adTypes.map(type => (
                  <label key={type.value} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="ad_type"
                      value={type.value}
                      checked={formData.ad_type === type.value}
                      onChange={(e) => handleInputChange('ad_type', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-2xl p-6 transition-all transform group-hover:scale-105 ${ 
                      formData.ad_type === type.value
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}>
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center ${ 
                          formData.ad_type === type.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <i className={`${type.icon} text-xl`}></i>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ad Details</h3>
                <p className="text-gray-600">Provide clear and detailed information</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Write a clear, descriptive title..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide detailed information about your ad..."
                    rows={5}
                    maxLength={1000}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-lg placeholder-gray-400"
                  />
                  <p className="text-sm text-gray-500 mt-2">{formData.description.length}/1000 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Category *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 appearance-none text-lg transition-all"
                      >
                        <option value="">Choose category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Price {formData.ad_type === 'service' || formData.ad_type === 'rental' ? '(Optional)' : '*'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-2xl font-bold text-orange-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-2xl font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State or ZIP code"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Preferences</h3>
                <p className="text-gray-600">How should interested people contact you?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactMethods.map(method => (
                  <label key={method.value} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="contact_method"
                      value={method.value}
                      checked={formData.contact_method === method.value}
                      onChange={(e) => handleInputChange('contact_method', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-2xl p-4 transition-all ${ 
                      formData.contact_method === method.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ 
                          formData.contact_method === method.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <i className={`${method.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{method.label}</h4>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {(formData.contact_method === 'phone' || formData.contact_method === 'both') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg transition-all"
                  />
                </div>
              )}

              {(formData.contact_method === 'email' || formData.contact_method === 'both') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg transition-all"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Images</h3>
                <p className="text-gray-600">Photos help your ad get more responses</p>
              </div>

              <div className="border-3 border-dashed border-orange-300 rounded-3xl p-12 text-center bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="classified-image-upload"
                />
                <label htmlFor="classified-image-upload" className="cursor-pointer">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <i className="ri-image-add-line text-3xl text-white"></i>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Upload Images</p>
                  <p className="text-gray-600 mb-4">Add photos to make your ad more appealing</p>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-2xl font-semibold inline-block hover:shadow-lg transform hover:scale-105 transition-all">
                    Choose Images
                  </div>
                  <p className="text-sm text-gray-500 mt-4">JPG, PNG, WEBP • Max 10MB each • Up to 5 images</p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ad Duration</h3>
                <p className="text-gray-600">How long should your ad run?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '7', label: '1 Week', price: 2.99 },
                  { value: '30', label: '1 Month', price: 4.49 },
                  { value: '60', label: '2 Months', price: 5.99 },
                  { value: '90', label: '3 Months', price: 7.49 }
                ].map(option => (
                  <label key={option.value} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="duration"
                      value={option.value}
                      checked={formData.duration === option.value}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-2xl p-6 text-center transition-all transform group-hover:scale-105 ${ 
                      formData.duration === option.value
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}>
                      <div className="text-lg font-bold text-gray-900 mb-2">{option.label}</div>
                      <div className="text-2xl font-bold text-orange-500">${option.price}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Link href="/sell" className="text-gray-600 hover:text-gray-800 font-semibold cursor-pointer flex items-center space-x-2">
                <i className="ri-arrow-left-line"></i>
                <span>Back to Options</span>
              </Link>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-orange-500">${calculateCost().toFixed(2)}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-12 py-4 rounded-2xl font-bold text-lg transform transition-all whitespace-nowrap ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-2xl hover:scale-105 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    `Post Ad - $${calculateCost().toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-newspaper-line text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">Post Your Classified Ad</h3>
              <p className="text-orange-100">Secure payment for ad placement</p>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Classified Ad ({formData.duration} days)</span>
                    <span className="font-semibold">${calculateCost().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-orange-500">${calculateCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="credits"
                        checked={paymentMethod === 'credits'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-orange-500"
                      />
                      <div className="flex items-center space-x-2">
                        <i className="ri-coins-line text-xl text-gray-600"></i>
                        <span>Marketplace Credits</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-orange-500"
                      />
                      <div className="flex items-center space-x-2">
                        <i className="ri-bank-card-line text-xl text-gray-600"></i>
                        <span>Credit/Debit Card</span>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className={`flex-1 py-3 rounded-2xl font-bold whitespace-nowrap ${
                    processingPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer'
                  }`}
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay $${calculateCost().toFixed(2)}`
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="ri-shield-check-line text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
                    <p className="text-xs text-blue-700">
                      Your classified ad will go live immediately after payment and run for the selected duration.
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