'use client';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CategoriesPage() {
  const mainCategories = [
    {
      name: 'Electronics',
      icon: 'ri-smartphone-line',
      itemCount: '125,430',
      subcategories: ['Smartphones', 'Laptops', 'Gaming', 'Audio', 'Cameras'],
      image: 'https://readdy.ai/api/search-image?query=Modern%20electronics%20collection%20with%20smartphones%2C%20laptops%2C%20headphones%2C%20cameras%20arranged%20professionally%20on%20clean%20white%20background%20with%20elegant%20lighting%20and%20shadows&width=300&height=200&seq=cat-electronics&orientation=landscape'
    },
    {
      name: 'Fashion',
      icon: 'ri-shirt-line',
      itemCount: '89,210',
      subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags'],
      image: 'https://readdy.ai/api/search-image?query=Fashion%20clothing%20and%20accessories%2C%20stylish%20apparel%2C%20shoes%2C%20handbags%2C%20and%20jewelry%20displayed%20in%20elegant%20boutique%20setting%20with%20soft%20lighting&width=300&height=200&seq=cat-fashion&orientation=landscape'
    },
    {
      name: 'Home & Garden',
      icon: 'ri-home-4-line',
      itemCount: '76,890',
      subcategories: ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Tools'],
      image: 'https://readdy.ai/api/search-image?query=Beautiful%20home%20decor%20items%2C%20furniture%2C%20plants%2C%20and%20garden%20accessories%20in%20modern%20interior%20design%20setting%20with%20natural%20lighting&width=300&height=200&seq=cat-home&orientation=landscape'
    },
    {
      name: 'Automotive',
      icon: 'ri-car-line',
      itemCount: '45,230',
      subcategories: ['Parts', 'Accessories', 'Tools', 'Tires', 'Audio'],
      image: 'https://readdy.ai/api/search-image?query=Car%20parts%20and%20automotive%20accessories%2C%20professional%20mechanic%20tools%2C%20and%20vehicle%20components%20in%20clean%20workshop%20environment&width=300&height=200&seq=cat-auto&orientation=landscape'
    },
    {
      name: 'Sports & Outdoors',
      icon: 'ri-football-line',
      itemCount: '34,560',
      subcategories: ['Exercise', 'Outdoor Gear', 'Team Sports', 'Water Sports', 'Winter Sports'],
      image: 'https://readdy.ai/api/search-image?query=Sports%20equipment%20and%20fitness%20gear%20including%20basketballs%2C%20tennis%20rackets%2C%20workout%20equipment%20on%20athletic%20field%20background&width=300&height=200&seq=cat-sports&orientation=landscape'
    },
    {
      name: 'Collectibles & Art',
      icon: 'ri-trophy-line',
      itemCount: '67,890',
      subcategories: ['Coins', 'Stamps', 'Trading Cards', 'Antiques', 'Art'],
      image: 'https://readdy.ai/api/search-image?query=Vintage%20collectibles%20and%20antique%20items%2C%20rare%20coins%2C%20stamps%2C%20and%20valuable%20art%20pieces%20displayed%20in%20elegant%20showcase%20setting&width=300&height=200&seq=cat-collectibles&orientation=landscape'
    },
    {
      name: 'Books & Media',
      icon: 'ri-book-open-line',
      itemCount: '92,340',
      subcategories: ['Books', 'Movies', 'Music', 'Games', 'Magazines'],
      image: 'https://readdy.ai/api/search-image?query=Books%2C%20movies%2C%20music%20albums%2C%20and%20media%20collection%20arranged%20in%20cozy%20library%20setting%20with%20warm%20lighting%20and%20wooden%20shelves&width=300&height=200&seq=cat-books&orientation=landscape'
    },
    {
      name: 'Health & Beauty',
      icon: 'ri-heart-pulse-line',
      itemCount: '28,750',
      subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Health'],
      image: 'https://readdy.ai/api/search-image?query=Beauty%20and%20health%20products%2C%20skincare%20items%2C%20cosmetics%2C%20and%20wellness%20products%20arranged%20elegantly%20on%20marble%20background%20with%20soft%20lighting&width=300&height=200&seq=cat-beauty&orientation=landscape'
    },
    {
      name: 'Toys & Hobbies',
      icon: 'ri-gamepad-line',
      itemCount: '41,680',
      subcategories: ['Action Figures', 'Building Sets', 'Dolls', 'RC Toys', 'Puzzles'],
      image: 'https://readdy.ai/api/search-image?query=Colorful%20toys%20and%20hobby%20items%2C%20action%20figures%2C%20building%20blocks%2C%20and%20games%20arranged%20playfully%20on%20bright%20background&width=300&height=200&seq=cat-toys&orientation=landscape'
    },
    {
      name: 'Business & Industrial',
      icon: 'ri-briefcase-line',
      itemCount: '15,920',
      subcategories: ['Office Supplies', 'Equipment', 'Safety', 'Manufacturing', 'Packaging'],
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20equipment%20and%20industrial%20tools%2C%20office%20supplies%2C%20and%20manufacturing%20equipment%20in%20modern%20workplace%20setting&width=300&height=200&seq=cat-business&orientation=landscape'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop All Categories</h1>
            <p className="text-lg text-gray-600">Discover millions of items across every category</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {mainCategories.map((category, index) => (
              <Link key={index} href={`/category/${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} className="group cursor-pointer">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="flex">
                    <div className="flex-1 p-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-[#004080] rounded-full flex items-center justify-center">
                          <i className={`${category.icon} text-2xl text-white`}></i>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h3>
                          <p className="text-gray-600">{category.itemCount} items</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        {category.subcategories.map((sub, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <i className="ri-arrow-right-s-line text-[#FFA500] mr-1"></i>
                            {sub}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-[#004080] group-hover:text-[#FFA500] transition-colors">
                        <span className="font-medium">Browse Category</span>
                        <i className="ri-arrow-right-line ml-2"></i>
                      </div>
                    </div>
                    
                    <div className="w-48 relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-5 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}