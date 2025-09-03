'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function BuyerProtectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shield-check-line text-3xl text-green-600"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buyer Protection Program</h1>
          <p className="text-xl text-gray-600">
            Shop with confidence knowing your purchases are protected
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Money Back Guarantee</h3>
              <p className="text-gray-600">Get your money back if the item doesn't match the description</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-truck-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Shipping Protection</h3>
              <p className="text-gray-600">Coverage for lost, damaged, or delayed shipments</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-2-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our support team is here to help resolve any issues</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Covered</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Item Not as Described</h3>
                    <p className="text-gray-600">If the item significantly differs from the listing description or photos</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Item Not Received</h3>
                    <p className="text-gray-600">If you don't receive your item within the expected timeframe</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Damaged in Transit</h3>
                    <p className="text-gray-600">If the item arrives damaged due to shipping issues</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Unauthorized Transactions</h3>
                    <p className="text-gray-600">Protection against fraudulent purchases on your account</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to File a Claim</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Seller</h4>
                  <p className="text-sm text-gray-600">Try to resolve the issue directly with the seller first</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Open Case</h4>
                  <p className="text-sm text-gray-600">If unresolved, open a buyer protection case</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Investigation</h4>
                  <p className="text-sm text-gray-600">Our team reviews the case and evidence provided</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Resolution</h4>
                  <p className="text-sm text-gray-600">Receive refund or replacement based on our findings</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-blue-600 text-xl mt-1"></i>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Claims must be filed within 30 days of delivery</li>
                    <li>• Keep all communication and documentation related to your purchase</li>
                    <li>• Protection applies to eligible items and transactions</li>
                    <li>• Maximum coverage of $2,500 per transaction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Have questions about buyer protection or need to file a claim?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a href="/contact" className="bg-[#004080] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
              Contact Support
            </a>
            <a href="/help" className="border border-[#004080] text-[#004080] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 cursor-pointer whitespace-nowrap">
              Visit Help Center
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}