
'use client';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#004080] via-blue-500 to-purple-600 text-white overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: 'url(https://readdy.ai/api/search-image?query=Ultra%20bright%20vibrant%20digital%20marketplace%20explosion%20of%20colors%2C%20neon%20shopping%20atmosphere%20with%20electric%20blue%20pink%20purple%20gradients%2C%20floating%20holographic%20shopping%20bags%2C%20golden%20sparkles%20and%20confetti%2C%20futuristic%20e-commerce%20paradise%2C%20rainbow%20light%20trails%2C%20crystal%20clear%20bright%20backgrounds%2C%20energetic%20festival%20celebration%20with%20dazzling%20light%20effects%2C%20super%20colorful%20product%20displays%2C%20luminous%20shopping%20experience&width=1200&height=600&seq=hero-ultra-bright&orientation=landscape)'
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Buy, Make an Offer
            <span className="block bg-gradient-to-r from-[#FFA500] to-yellow-400 bg-clip-text text-transparent">& List for Free!</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-blue-50">
            Join millions of buyers and sellers in the world's most trusted marketplace. 
            From fixed prices to negotiations, find deals or start your business today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/browse" className="bg-gradient-to-r from-[#FFA500] to-yellow-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-500 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg">
              <i className="ri-shopping-bag-3-fill mr-2"></i>
              Start Shopping
            </Link>
            <Link href="/sell" className="bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#004080] transform hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg">
              <i className="ri-store-3-fill mr-2"></i>
              Become a Seller
            </Link>
          </div>

          <div className="text-center mb-16">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <i className="ri-shopping-bag-fill text-white"></i>
                </div>
                <span className="text-white font-medium">Buy It Now</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <i className="ri-hand-coin-fill text-white"></i>
                </div>
                <span className="text-white font-medium">Make Offer</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <i className="ri-newspaper-fill text-white"></i>
                </div>
                <span className="text-white font-medium">Classifieds</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-shield-check-fill text-white"></i>
                </div>
                <span className="text-white font-medium">Secure</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <i className="ri-shopping-bag-3-fill text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy a Deal</h3>
              <p className="text-blue-100">Find amazing products at fixed prices instantly</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <i className="ri-hand-coin-fill text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make an Offer</h3>
              <p className="text-blue-100">Negotiate prices directly with sellers</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <i className="ri-newspaper-fill text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">List a Classified</h3>
              <p className="text-blue-100">Post local ads and services for free</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements for extra brightness */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-orange-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-green-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </section>
  );
}
