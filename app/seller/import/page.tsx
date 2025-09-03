
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SellerSidebar from '@/components/SellerSidebar';
import EbayImporter from '@/components/EbayImporter';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('ebay');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <SellerSidebar />
          
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Listings</h1>
              <p className="text-gray-600">Import your existing listings from other platforms</p>
            </div>

            <div className="mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('ebay')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'ebay'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-shopping-bag-line mr-2"></i>
                  eBay Import
                </button>
                <button
                  onClick={() => setActiveTab('amazon')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'amazon'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-amazon-line mr-2"></i>
                  Amazon (Coming Soon)
                </button>
                <button
                  onClick={() => setActiveTab('csv')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === 'csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-file-text-line mr-2"></i>
                  CSV Import
                </button>
              </div>
            </div>

            {activeTab === 'ebay' && (
              <div>
                <EbayImporter onImportComplete={() => {
                  // Show success message or redirect
                }} />
                
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-information-line text-blue-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">How eBay Import Works</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>URL Import:</strong> Paste any eBay listing URL to import individual items</li>
                        <li>• <strong>CSV Import:</strong> Upload a CSV file with multiple listings (download template below)</li>
                        <li>• <strong>Auto-mapping:</strong> We automatically extract title, price, images, and description</li>
                        <li>• <strong>Review & Edit:</strong> Review imported listings before publishing to your store</li>
                        <li>• <strong>Bulk Actions:</strong> Select and publish multiple listings at once</li>
                      </ul>
                      <div className="mt-4">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <i className="ri-download-line mr-1"></i>
                          Download CSV Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'amazon' && (
              <div className="bg-white rounded-lg border p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="ri-amazon-line text-orange-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Amazon Import Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  We're working on Amazon integration to help you import your Amazon listings seamlessly.
                </p>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 whitespace-nowrap">
                  <i className="ri-notification-line mr-2"></i>
                  Notify When Ready
                </button>
              </div>
            )}

            {activeTab === 'csv' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="ri-file-text-line text-green-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold">CSV Bulk Import</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Upload a CSV file with your product listings. Perfect for migrating from other platforms or bulk adding inventory.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Required Columns</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">title</span>
                          <span className="text-gray-400">Product name</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">price</span>
                          <span className="text-gray-400">Price in USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">description</span>
                          <span className="text-gray-400">Product details</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">category</span>
                          <span className="text-gray-400">Product category</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">condition</span>
                          <span className="text-gray-400">Item condition</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">quantity</span>
                          <span className="text-gray-400">Stock amount</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Optional Columns</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">shipping</span>
                          <span className="text-gray-400">Shipping cost</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">weight</span>
                          <span className="text-gray-400">Item weight</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">tags</span>
                          <span className="text-gray-400">Search keywords</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">sku</span>
                          <span className="text-gray-400">Product SKU</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">brand</span>
                          <span className="text-gray-400">Brand name</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">image_url</span>
                          <span className="text-gray-400">Product image</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                      <i className="ri-download-line mr-2"></i>
                      Download Template
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                      <i className="ri-eye-line mr-2"></i>
                      View Sample
                    </button>
                  </div>
                </div>

                <EbayImporter onImportComplete={() => {}} />
              </div>
            )}

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-magic-line text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Smart Mapping</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Our AI automatically maps your product data to the right fields and suggests improvements.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-categorization</li>
                  <li>• Price optimization suggestions</li>
                  <li>• SEO-friendly titles</li>
                  <li>• Image enhancement</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-shield-check-line text-green-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Quality Control</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Every imported listing goes through quality checks before publishing.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Duplicate detection</li>
                  <li>• Policy compliance</li>
                  <li>• Image validation</li>
                  <li>• Data completeness</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
