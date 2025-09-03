'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-arrow-go-back-line text-3xl text-blue-600"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
          <p className="text-xl text-gray-600">
            Easy returns and hassle-free refunds for your peace of mind
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Policy Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-calendar-check-line text-xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">30-Day Return Window</h3>
                <p className="text-gray-600">
                  Most items can be returned within 30 days of delivery for a full refund
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-truck-line text-xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Return Shipping</h3>
                <p className="text-gray-600">
                  We provide prepaid return labels for eligible items and situations
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Important Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Return policies may vary by seller - always check individual listings</li>
                <li>• Items must be in original condition with original packaging</li>
                <li>• Some categories have different return windows (electronics: 15 days)</li>
                <li>• Custom or personalized items cannot be returned unless defective</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return an Item</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Go to Your Orders</h3>
                  <p className="text-gray-600">
                    Find the item you want to return in your order history and click "Return Item"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Select Return Reason</h3>
                  <p className="text-gray-600">
                    Choose the reason for your return from the dropdown menu and provide details
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Print Return Label</h3>
                  <p className="text-gray-600">
                    Download and print the prepaid return shipping label we provide
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pack and Ship</h3>
                  <p className="text-gray-600">
                    Pack the item securely with original packaging and drop off at any authorized location
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#004080] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Your Refund</h3>
                  <p className="text-gray-600">
                    Once we receive and process your return, your refund will be issued within 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Conditions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-4">✓ Returnable Items</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Unopened items in original packaging</li>
                  <li>• Items with all original accessories</li>
                  <li>• Items without signs of wear or damage</li>
                  <li>• Items with original tags attached</li>
                  <li>• Electronics with original manuals/cables</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-4">✗ Non-Returnable Items</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Personalized or custom items</li>
                  <li>• Perishable goods</li>
                  <li>• Digital downloads</li>
                  <li>• Items damaged by buyer</li>
                  <li>• Items returned after 30 days</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <i className="ri-time-line text-blue-600 text-xl mt-1"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                  <p className="text-gray-600">Refunds are typically processed within 2-3 business days after we receive your return</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <i className="ri-bank-card-line text-blue-600 text-xl mt-1"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Refund Method</h3>
                  <p className="text-gray-600">Refunds will be issued to your original payment method (credit card, PayPal, etc.)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <i className="ri-money-dollar-circle-line text-blue-600 text-xl mt-1"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Refund Amount</h3>
                  <p className="text-gray-600">Full purchase price plus applicable taxes. Original shipping costs may not be refunded</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-gray-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with a Return?</h2>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help you with any return questions
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a href="/account" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                View My Orders
              </a>
              <a href="/contact" className="border border-[#004080] text-[#004080] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 cursor-pointer whitespace-nowrap">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}