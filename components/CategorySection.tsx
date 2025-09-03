
'use client';
import Link from 'next/link';

export default function CategorySection() {
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      icon: 'ri-smartphone-fill',
      gradient: 'from-blue-500 to-purple-600',
      image: 'https://readdy.ai/api/search-image?query=modern%20electronics%20devices%20smartphones%20laptops%20tablets%20bright%20colorful%20background%20vibrant%20product%20photography%20studio%20lighting%20cheerful%20atmosphere&width=400&height=300&seq=cat-electronics-bright&orientation=landscape',
      count: 0
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      icon: 'ri-shirt-fill',
      gradient: 'from-pink-500 to-rose-600',
      image: 'https://readdy.ai/api/search-image?query=fashion%20clothing%20apparel%20shirts%20dresses%20bright%20colorful%20background%20vibrant%20style%20cheerful%20product%20photography%20studio%20lighting&width=400&height=300&seq=cat-fashion-bright&orientation=landscape',
      count: 0
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      icon: 'ri-home-4-fill',
      gradient: 'from-green-500 to-emerald-600',
      image: 'https://readdy.ai/api/search-image?query=home%20decor%20furniture%20garden%20tools%20bright%20colorful%20interior%20design%20vibrant%20cheerful%20atmosphere%20product%20photography%20studio%20lighting&width=400&height=300&seq=cat-home-bright&orientation=landscape',
      count: 0
    },
    {
      name: 'Sports',
      slug: 'sports',
      icon: 'ri-football-fill',
      gradient: 'from-orange-500 to-red-600',
      image: 'https://readdy.ai/api/search-image?query=sports%20equipment%20fitness%20gear%20athletic%20products%20bright%20energetic%20colorful%20background%20vibrant%20product%20photography%20studio%20lighting&width=400&height=300&seq=cat-sports-bright&orientation=landscape',
      count: 0
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      icon: 'ri-book-fill',
      gradient: 'from-indigo-500 to-blue-600',
      image: 'https://readdy.ai/api/search-image?query=books%20media%20educational%20materials%20bright%20colorful%20background%20vibrant%20cheerful%20learning%20atmosphere%20product%20photography%20studio%20lighting&width=400&height=300&seq=cat-books-bright&orientation=landscape',
      count: 0
    },
    {
      name: 'Automotive',
      slug: 'automotive',
      icon: 'ri-car-fill',
      gradient: 'from-gray-600 to-slate-700',
      image: 'https://readdy.ai/api/search-image?query=automotive%20parts%20car%20accessories%20bright%20colorful%20garage%20environment%20vibrant%20mechanical%20tools%20product%20photography%20studio%20lighting&width=400&height=300&seq=cat-auto-bright&orientation=landscape',
      count: 0
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#004080] to-purple-600 bg-clip-text text-transparent mb-4">Shop by Category</h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">Find exactly what you're looking for in our organized categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group bg-white rounded-3xl shadow-lg border hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 group-hover:from-black/5 group-hover:to-black/20 transition-all duration-300"></div>
                <div className="absolute top-4 left-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                    <i className={`${category.icon} text-2xl text-white`}></i>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-gray-700">{category.count} items</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#004080] transition-colors duration-300">{category.name}</h3>
                    <p className="text-sm text-gray-600">Explore amazing deals</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFA500] to-yellow-400 rounded-full flex items-center justify-center group-hover:from-orange-400 group-hover:to-yellow-300 transition-all duration-300">
                    <i className="ri-arrow-right-line text-xl text-white transform group-hover:translate-x-1 transition-transform duration-300"></i>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/categories" className="bg-gradient-to-r from-[#004080] to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap">
            <i className="ri-grid-fill mr-2"></i>
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
