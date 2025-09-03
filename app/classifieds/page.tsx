'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

interface ClassifiedAd {
  id: string;
  title: string;
  description: string;
  category: string;
  ad_type: string;
  price: number | null;
  location: string;
  images: string[];
  contact_method: string;
  phone: string | null;
  email: string | null;
  seller_id: string;
  status: string;
  views: number;
  expires_at: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

function ClassifiedsContent() {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'All Categories',
    'Services',
    'Real Estate', 
    'Vehicles',
    'Jobs',
    'Community',
    'For Sale',
    'Housing',
    'Gigs',
    'Personals',
    'Other'
  ];

  const adTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'service', label: 'Services' },
    { value: 'rental', label: 'Rentals' },
    { value: 'job', label: 'Jobs' },
    { value: 'wanted', label: 'Wanted' },
    { value: 'event', label: 'Events' },
    { value: 'community', label: 'Community' }
  ];

  useEffect(() => {
    loadClassifiedAds();
  }, [selectedCategory, selectedType, sortBy, searchQuery]);

  const loadClassifiedAds = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('classified_ads')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString());

      if (selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedType !== 'all') {
        query = query.eq('ad_type', selectedType);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true, nullsLast: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false, nullsLast: true });
          break;
        case 'views':
          query = query.order('views', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading classified ads:', error);
        return;
      }

      setAds(data || []);
    } catch (error) {
      console.error('Error in loadClassifiedAds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdTypeIcon = (type: string) => {
    const icons = {
      service: 'ri-tools-line',
      rental: 'ri-home-line',
      job: 'ri-briefcase-line',
      wanted: 'ri-search-line',
      event: 'ri-calendar-event-line',
      community: 'ri-group-line'
    };
    return icons[type as keyof typeof icons] || 'ri-newspaper-line';
  };

  const getAdTypeColor = (type: string) => {
    const colors = {
      service: 'bg-blue-100 text-blue-800',
      rental: 'bg-green-100 text-green-800',
      job: 'bg-purple-100 text-purple-800',
      wanted: 'bg-orange-100 text-orange-800',
      event: 'bg-pink-100 text-pink-800',
      community: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const incrementViews = async (adId: string) => {
    await supabase
      .from('classified_ads')
      .update({ views: ads.find(ad => ad.id === adId)?.views + 1 || 1 })
      .eq('id', adId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Classified Ads
          </h1>
          <p className="text-xl text-gray-600 mb-8">Find local services, jobs, rentals, and community connections</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sell/classified" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
              Post Your Ad
            </Link>
            <div className="text-sm text-gray-600">
              {ads.length} active ads • Updated daily
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ads..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {adTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Link
                key={ad.id}
                href={`/classified/${ad.id}`}
                className="group cursor-pointer"
                onClick={() => incrementViews(ad.id)}
              >
                <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:scale-105">
                  {ad.images && ad.images.length > 0 ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 object-top"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                        <i className={`${getAdTypeIcon(ad.ad_type)} text-2xl text-white`}></i>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getAdTypeColor(ad.ad_type)}`}>
                        <i className={`${getAdTypeIcon(ad.ad_type)} mr-1`}></i>
                        {ad.ad_type}
                      </span>
                      {ad.price && (
                        <span className="text-lg font-bold text-orange-600">
                          ${ad.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {ad.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ad.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <i className="ri-map-pin-line"></i>
                        <span>{ad.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <i className="ri-eye-line"></i>
                          <span>{ad.views || 0}</span>
                        </div>
                        <span>{formatTimeAgo(ad.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-newspaper-line text-3xl text-orange-500"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No ads found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to post a classified ad in your area'
              }
            </p>
            <Link href="/sell/classified" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
              Post the First Ad
            </Link>
          </div>
        )}

        {/* Categories Grid */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.slice(1).map((category, index) => {
              const icons = {
                'Services': 'ri-tools-line',
                'Real Estate': 'ri-home-line', 
                'Vehicles': 'ri-car-line',
                'Jobs': 'ri-briefcase-line',
                'Community': 'ri-group-line',
                'For Sale': 'ri-shopping-bag-line',
                'Housing': 'ri-building-line',
                'Gigs': 'ri-hand-coin-line',
                'Personals': 'ri-user-heart-line',
                'Other': 'ri-more-line'
              };
              const icon = icons[category as keyof typeof icons] || 'ri-price-tag-line';
              const count = ads.filter(ad => ad.category === category).length;
              
              return (
                <Link
                  key={category}
                  href={`/classifieds?category=${encodeURIComponent(category)}`}
                  className="bg-white rounded-2xl shadow-sm border p-6 text-center hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i className={`${icon} text-xl text-orange-600`}></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category}</h3>
                  <p className="text-sm text-gray-500">{count} ads</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function ClassifiedsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classifieds...</p>
        </div>
      </div>
    }>
      <ClassifiedsContent />
    </Suspense>
  );
}