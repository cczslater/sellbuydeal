'use client';
import { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SellerSidebar from '../../../components/SellerSidebar';

export default function SellerAccount() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <SellerSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your account settings and verification</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="border-b">
              <nav className="flex space-x-8 px-8">
                {['profile', 'verification', 'payment', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-[#004080] text-[#004080]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-[#004080] rounded-full flex items-center justify-center">
                      <span className="text-3xl text-white font-semibold">S</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Sarah Johnson</h3>
                      <p className="text-gray-600">sarah.johnson@email.com</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Verified Seller
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Pro Seller
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="Sarah"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Johnson"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue="sarah.johnson@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                      <textarea
                        rows={3}
                        defaultValue="123 Business Street, Suite 100, New York, NY 10001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                        maxLength={500}
                      />
                    </div>
                    
                    <button className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
              
              {activeTab === 'verification' && (
                <div className="space-y-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3">
                      <i className="ri-shield-check-line text-2xl text-green-600"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Account Verified</h3>
                        <p className="text-green-600">Your seller account has been successfully verified</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Identity Verification</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Government-issued ID verified for account security
                      </p>
                      <button className="text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer">
                        View Details
                      </button>
                    </div>
                    
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Business Verification</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Business registration and tax information verified
                      </p>
                      <button className="text-[#004080] hover:text-blue-700 text-sm font-medium cursor-pointer">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'payment' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VISA</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">**** **** **** 1234</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Primary
                        </span>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PP</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">PayPal Account</p>
                            <p className="text-sm text-gray-600">sarah.johnson@email.com</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i className="ri-more-2-line"></i>
                        </button>
                      </div>
                    </div>
                    
                    <button className="mt-4 bg-[#004080] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'shipping' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
                    
                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping From Address</label>
                        <textarea
                          rows={3}
                          defaultValue="123 Business Street, Suite 100, New York, NY 10001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent resize-none"
                          maxLength={500}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Handling Time</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent pr-8">
                          <option value="1">1 business day</option>
                          <option value="2">2 business days</option>
                          <option value="3">3 business days</option>
                          <option value="5">5 business days</option>
                        </select>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Shipping Services</h4>
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
                            <span className="text-gray-700">Overnight Shipping (1 business day)</span>
                          </label>
                        </div>
                      </div>
                      
                      <button className="bg-[#004080] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                        Save Shipping Settings
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}