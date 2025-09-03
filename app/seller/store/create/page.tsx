
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import SellerSidebar from '../../../../components/SellerSidebar';
import Link from 'next/link';
import { getCurrentUser } from '../../../../lib/auth';
import { createStore } from '../../../../lib/database';

export default function CreateStore() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    category: '',
    businessType: '',
    returnPolicy: '',
    shippingPolicy: ''
  });
  const router = useRouter();

  const steps = [
    { number: 1, title: 'Basic Information', icon: 'ri-information-line' },
    { number: 2, title: 'Store Branding', icon: 'ri-palette-line' },
    { number: 3, title: 'Policies & Settings', icon: 'ri-settings-line' },
    { number: 4, title: 'Review & Launch', icon: 'ri-rocket-line' }
  ];

  const categories = [
    'Electronics & Technology',
    'Fashion & Accessories', 
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Toys & Games',
    'Books & Media',
    'Automotive',
    'Collectibles & Art',
    'Business & Industrial'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.storeName || !formData.storeDescription || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        alert('Please log in to create a store');
        router.push('/login');
        return;
      }

      // Create store in database
      await createStore(user.id, formData);

      // Redirect to store page
      router.push('/seller/store');
    } catch (error) {
      console.error('Error creating store:', error);
      alert('Failed to create store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <SellerSidebar />

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link href="/sell" className="text-[#004080] hover:text-blue-700 font-medium mb-4 inline-flex items-center cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Selling Options
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Store</h1>
              <p className="text-gray-600">Set up your professional storefront in just a few steps</p>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step.number <= currentStep 
                        ? 'bg-[#004080] text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <i className={`${step.icon} text-lg`}></i>
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${
                        step.number <= currentStep ? 'text-[#004080]' : 'text-gray-600'
                      }`}>
                        Step {step.number}
                      </p>
                      <p className="text-sm text-gray-600">{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 ${
                        step.number < currentStep ? 'bg-[#004080]' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      placeholder="Enter your store name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Choose a memorable name for your store</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Description *</label>
                    <textarea
                      rows={4}
                      value={formData.storeDescription}
                      onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                      placeholder="Describe what your store offers..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">{500 - formData.storeDescription.length} characters remaining</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Category *</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name="businessType" 
                          value="individual"
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="mr-3" 
                        />
                        <div>
                          <p className="font-medium">Individual Seller</p>
                          <p className="text-sm text-gray-600">Personal sales and side business</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name="businessType" 
                          value="business"
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="mr-3" 
                        />
                        <div>
                          <p className="font-medium">Registered Business</p>
                          <p className="text-sm text-gray-600">Company or LLC with tax ID</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Branding</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <i className="ri-image-line text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 mb-2">Upload your store logo</p>
                      <p className="text-sm text-gray-500 mb-4">Recommended size: 200x200 pixels, PNG or JPG</p>
                      <button className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        Choose File
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <i className="ri-landscape-line text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 mb-2">Upload a banner for your store</p>
                      <p className="text-sm text-gray-500 mb-4">Recommended size: 1200x400 pixels, PNG or JPG</p>
                      <button className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        Choose File
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Colors</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input type="color" defaultValue="#004080" className="w-12 h-10 rounded border" />
                          <span className="text-sm text-gray-600">#004080</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Accent Color</label>
                        <div className="flex items-center space-x-3">
                          <input type="color" defaultValue="#FFA500" className="w-12 h-10 rounded border" />
                          <span className="text-sm text-gray-600">#FFA500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Policies & Settings</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy *</label>
                    <textarea
                      rows={4}
                      value={formData.returnPolicy}
                      onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
                      placeholder="Describe your return policy..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy *</label>
                    <textarea
                      rows={4}
                      value={formData.shippingPolicy}
                      onChange={(e) => handleInputChange('shippingPolicy', e.target.value)}
                      placeholder="Describe your shipping policy..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Options</label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Standard Shipping (5-7 business days)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Express Shipping (2-3 business days)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-gray-700">International Shipping</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Credit/Debit Cards</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">PayPal</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-gray-700">Apple Pay</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-gray-700">Bank Transfer</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Launch</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Store Preview</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Store Name:</span>
                        <span className="font-medium">{formData.storeName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{formData.category || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Business Type:</span>
                        <span className="font-medium capitalize">{formData.businessType || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium">{formData.storeDescription ? `${formData.storeDescription.substring(0, 50)}...` : 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <i className="ri-information-line text-xl text-blue-600 mt-0.5"></i>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Your store will be created and available immediately</li>
                          <li>• You can start adding products right away</li>
                          <li>• Your store will be reviewed within 24 hours</li>
                          <li>• You'll receive email confirmation once approved</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" id="terms" className="mr-3" />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <span className="text-[#004080] underline cursor-pointer">Terms of Service</span> and <span className="text-[#004080] underline cursor-pointer">Seller Agreement</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index + 1 <= currentStep ? 'bg-[#004080]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap ${
                      isSubmitting 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-[#FFA500] text-white hover:bg-orange-600'
                    }`}
                  >
                    {isSubmitting ? 'Creating Store...' : 'Launch Store'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
