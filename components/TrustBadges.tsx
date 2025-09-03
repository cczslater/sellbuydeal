
'use client';

export default function TrustBadges() {
  const badges = [
    {
      icon: 'ri-shield-check-fill',
      title: 'Buyer Protection',
      description: '100% guaranteed refunds',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: 'ri-rocket-2-fill',
      title: 'Fast Shipping',
      description: 'Free delivery on orders over $50',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: 'ri-customer-service-2-fill',
      title: '24/7 Support',
      description: 'Live chat available anytime',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: 'ri-secure-payment-fill',
      title: 'Secure Payments',
      description: 'Encrypted and protected',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: 'ri-verified-badge-fill',
      title: 'Verified Sellers',
      description: 'ID checked and approved',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: 'ri-exchange-box-fill',
      title: 'Easy Returns',
      description: '30-day return policy',
      gradient: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">
            Why Choose Our Marketplace?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the safest, fastest, and most reliable way to buy and sell online
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className={`text-center p-6 rounded-2xl ${badge.bgColor} hover:shadow-xl transform hover:scale-105 transition-all duration-300 group`}>
              <div className={`w-16 h-16 bg-gradient-to-br ${badge.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:rotate-6 transition-all duration-300`}>
                <i className={`${badge.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors duration-300">{badge.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{badge.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-8 py-4 shadow-lg">
            <i className="ri-award-fill text-2xl text-[#FFA500]"></i>
            <span className="text-lg font-semibold text-gray-800">Trusted by over 1M+ users worldwide</span>
            <i className="ri-global-fill text-2xl text-[#004080]"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
