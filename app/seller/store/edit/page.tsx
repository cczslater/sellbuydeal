
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import SellerSidebar from '../../../../components/SellerSidebar';
import Link from 'next/link';
import { getCurrentUser } from '../../../../lib/auth';
import { getUserStore, updateStore } from '../../../../lib/database';

export default function EditStore() {
  const router = useRouter();
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    category: '',
    business_type: '',
    return_policy: '',
    shipping_policy: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    tax_id: '',
    website_url: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    store_hours: '',
    shipping_zones: [],
    payment_methods: [],
    store_policies: ''
  });

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

  const businessTypes = [
    { value: 'individual', label: 'Individual Seller' },
    { value: 'business', label: 'Registered Business' },
    { value: 'llc', label: 'Limited Liability Company' },
    { value: 'corporation', label: 'Corporation' }
  ];

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const store = await getUserStore(user.id);
        if (store) {
          setStoreData(store);
          setFormData({
            store_name: store.store_name || '',
            store_description: store.store_description || '',
            category: store.category || '',
            business_type: store.business_type || '',
            return_policy: store.return_policy || '',
            shipping_policy: store.shipping_policy || '',
            contact_email: store.contact_email || '',
            contact_phone: store.contact_phone || '',
            business_address: store.business_address || '',
            tax_id: store.tax_id || '',
            website_url: store.website_url || '',
            social_facebook: store.social_facebook || '',
            social_instagram: store.social_instagram || '',
            social_twitter: store.social_twitter || '',
            store_hours: store.store_hours || '',
            shipping_zones: store.shipping_zones || [],
            payment_methods: store.payment_methods || [],
            store_policies: store.store_policies || ''
          });
        } else {
          router.push('/seller/store/create');
        }
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!storeData) return;

    try {
      setIsSaving(true);
      await updateStore(storeData.id, formData);
      setUnsavedChanges(false);
      alert('Store updated successfully!');
      router.push('/seller/store');
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'basic', name: 'Basic Information', icon: 'ri-information-line' },
    { id: 'contact', name: 'Contact Details', icon: 'ri-phone-line' },
    { id: 'business', name: 'Business Info', icon: 'ri-building-line' },
    { id: 'policies', name: 'Policies', icon: 'ri-file-text-line' },
    { id: 'social', name: 'Social Media', icon: 'ri-share-line' },
    { id: 'settings', name: 'Store Settings', icon: 'ri-settings-line' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#004080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your store...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <SellerSidebar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link href="/seller/store" className="text-[#004080] hover:text-blue-700 font-medium mb-4 inline-flex items-center cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to My Store
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Store</h1>
                  <p className="text-gray-600">Update your store information and settings</p>
                </div>
                <div className="flex items-center space-x-3">
                  {unsavedChanges && (
                    <span className="text-orange-600 text-sm font-medium">Unsaved changes</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !unsavedChanges}
                    className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
                      isSaving || !unsavedChanges
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFA500] text-white hover:bg-orange-600 cursor-pointer'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left cursor-pointer whitespace-nowrap ${
                          activeSection === section.id
                            ? 'bg-[#004080] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <i className={`${section.icon} text-lg`}></i>
                        <span className="font-medium">{section.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                  {activeSection === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                          <input
                            type="text"
                            value={formData.store_name}
                            onChange={(e) => handleInputChange('store_name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                            placeholder="Your store name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8"
                          >
                            <option value="">Select category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Description *</label>
                        <textarea
                          rows={4}
                          value={formData.store_description}
                          onChange={(e) => handleInputChange('store_description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="Describe what your store offers..."
                          maxLength={500}
                        />
                        <p className="text-sm text-gray-500 mt-1">{500 - formData.store_description.length} characters remaining</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Business Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {businessTypes.map((type) => (
                            <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="business_type"
                                value={type.value}
                                checked={formData.business_type === type.value}
                                onChange={(e) => handleInputChange('business_type', e.target.value)}
                                className="mr-3"
                              />
                              <span className="font-medium">{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="w-16 h-16 bg-[#004080] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-white">{formData.store_name.charAt(0).toUpperCase() || 'S'}</span>
                          </div>
                          <p className="text-gray-600 mb-2">Current Logo</p>
                          <button className="bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                            Upload New Logo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'contact' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                          <input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                            placeholder="contact@yourstore.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                          <input
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                        <textarea
                          rows={3}
                          value={formData.business_address}
                          onChange={(e) => handleInputChange('business_address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="123 Business St, City, State, ZIP"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Hours</label>
                        <textarea
                          rows={3}
                          value={formData.store_hours}
                          onChange={(e) => handleInputChange('store_hours', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => handleInputChange('website_url', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection === 'business' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                        <input
                          type="text"
                          value={formData.tax_id}
                          onChange={(e) => handleInputChange('tax_id', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                          placeholder="XX-XXXXXXX"
                        />
                        <p className="text-sm text-gray-500 mt-1">For registered businesses only</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Methods Accepted</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Credit Cards', 'PayPal', 'Apple Pay', 'Google Pay', 'Bitcoin', 'Bank Transfer'].map((method) => (
                            <label key={method} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.payment_methods.includes(method)}
                                onChange={(e) => {
                                  const methods = e.target.checked
                                    ? [...formData.payment_methods, method]
                                    : formData.payment_methods.filter(m => m !== method);
                                  handleInputChange('payment_methods', methods);
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">{method}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Zones</label>
                        <div className="space-y-2">
                          {['Local (Same City)', 'Regional (Same State)', 'National', 'International'].map((zone) => (
                            <label key={zone} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.shipping_zones.includes(zone)}
                                onChange={(e) => {
                                  const zones = e.target.checked
                                    ? [...formData.shipping_zones, zone]
                                    : formData.shipping_zones.filter(z => z !== zone);
                                  handleInputChange('shipping_zones', zones);
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">{zone}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'policies' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Policies</h2>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy *</label>
                        <textarea
                          rows={4}
                          value={formData.return_policy}
                          onChange={(e) => handleInputChange('return_policy', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="Describe your return policy..."
                          maxLength={500}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy *</label>
                        <textarea
                          rows={4}
                          value={formData.shipping_policy}
                          onChange={(e) => handleInputChange('shipping_policy', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="Describe your shipping policy..."
                          maxLength={500}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Policies</label>
                        <textarea
                          rows={6}
                          value={formData.store_policies}
                          onChange={(e) => handleInputChange('store_policies', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          placeholder="Privacy policy, terms of service, warranty information..."
                          maxLength={1000}
                        />
                      </div>
                    </div>
                  )}

                  {activeSection === 'social' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media Links</h2>
                        <p className="text-gray-600">Connect your social media accounts to build trust with customers</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i className="ri-facebook-fill text-white text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
                            <input
                              type="url"
                              value={formData.social_facebook}
                              onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                              placeholder="https://facebook.com/yourstore"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <i className="ri-instagram-line text-white text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Profile</label>
                            <input
                              type="url"
                              value={formData.social_instagram}
                              onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                              placeholder="https://instagram.com/yourstore"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center">
                            <i className="ri-twitter-x-line text-white text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Profile</label>
                            <input
                              type="url"
                              value={formData.social_twitter}
                              onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                              placeholder="https://twitter.com/yourstore"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'settings' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Auto-accept offers</h4>
                            <p className="text-sm text-gray-600">Automatically accept offers above a certain percentage</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004080]"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Show inventory count</h4>
                            <p className="text-sm text-gray-600">Display remaining quantity to buyers</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004080]"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Vacation mode</h4>
                            <p className="text-sm text-gray-600">Hide your store temporarily</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004080]"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email notifications</h4>
                            <p className="text-sm text-gray-600">Receive notifications for orders and messages</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004080]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                        <div className="border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium text-red-900 mb-2">Delete Store</h4>
                          <p className="text-sm text-red-700 mb-4">
                            Permanently delete your store and all associated data. This action cannot be undone.
                          </p>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap">
                            Delete Store
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
