
'use client';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function SellPage() {
  const benefits = [
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Low Fees',
      description: 'Keep more of your profits with competitive selling fees'
    },
    {
      icon: 'ri-global-line',
      title: 'Global Reach',
      description: 'Sell to millions of buyers worldwide'
    },
    {
      icon: 'ri-customer-service-2-line',
      title: '24/7 Support',
      description: 'Get help whenever you need it from our seller support team'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Seller Protection',
      description: 'Protected against fraudulent claims and chargebacks'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Selling Today</h1>
          <p className="text-xl text-gray-600">Choose how you want to sell your items</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Link href="/sell/quick" className="group cursor-pointer">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-shopping-cart-fill text-3xl text-white"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600">
                  Quick Sell
                </h3>
                <p className="text-gray-600 mb-4">
                  List your item for immediate sale with Buy It Now or Make an Offer options
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  Get started <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sell/bundle" className="group cursor-pointer">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-green-500 to-blue-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-stack-fill text-3xl text-white"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600">
                  Create Bundle
                </h3>
                <p className="text-gray-600 mb-4">
                  Group multiple items together for bundle deals and increased sales
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  Create bundle <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sell/classified" className="group cursor-pointer">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-newspaper-fill text-3xl text-white"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600">
                  Classified Ads
                </h3>
                <p className="text-gray-600 mb-4">
                  Post classified ads for services, rentals, and local items
                </p>
                <div className="flex items-center text-orange-600 font-semibold">
                  Post an ad <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sellers Choose Us</h2>
          <p className="text-lg text-gray-600">Everything you need to succeed as a seller</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`${benefit.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to Start Selling?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-[#FFA500] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 cursor-pointer whitespace-nowrap">
              Create Seller Account
            </Link>
            <Link href="/seller/dashboard" className="bg-[#004080] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 cursor-pointer whitespace-nowrap">
              Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
