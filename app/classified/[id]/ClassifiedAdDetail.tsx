'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '../../../lib/supabase';
export const dynamic = "force-dynamic";
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

interface ClassifiedAdDetailProps {
  adId: string;
}

export default function ClassifiedAdDetail({ adId }: ClassifiedAdDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [ad, setAd] = useState<ClassifiedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedAds, setRelatedAds] = useState<ClassifiedAd[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (adId) {
      loadClassifiedAd();
    }
  }, [adId]);

  const loadClassifiedAd = async () => {
    try {
      // Load the specific ad
      const { data: adData, error: adError } = await supabase
        .from('classified_ads')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('id', adId)
        .single();

      if (adError) {
        console.error('Error loading classified ad:', adError);
        router.push('/classifieds');
        return;
      }

      setAd(adData);

      // Increment view count
      await supabase
        .from('classified_ads')
        .update({ views: (adData.views || 0) + 1 })
        .eq('id', adId);

      // Load related ads
      const { data: relatedData } = await supabase
        .from('classified_ads')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('category', adData.category)
        .neq('id', adId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .limit(4);

      setRelatedAds(relatedData || []);
    } catch (error) {
      console.error('Error in loadClassifiedAd:', error);
      router.push('/classifieds');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      alert('Please sign in to contact the seller');
      router.push('/login');
      return;
    }

    if (ad?.contact_method === 'message') {
      setShowContactModal(true);
    } else {
      // For phone or email contact, show contact info directly
      showContactInfo();
    }
  };

  const showContactInfo = () => {
    if (!ad) return;

    let contactInfo = '';
    if (ad.contact_method === 'phone' && ad.phone) {
      contactInfo = `Phone: ${ad.phone}`;
    } else if (ad.contact_method === 'email' && ad.email) {
      contactInfo = `Email: ${ad.email}`;
    } else if (ad.contact_method === 'both') {
      contactInfo = `Phone: ${ad.phone}\nEmail: ${ad.email}`;
    }

    alert(`Contact Information:\n${contactInfo}`);
  };

  const sendMessage = async () => {
    if (!user || !ad || !contactMessage.trim()) return;

    setSendingMessage(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: ad.seller_id,
          subject: `Re: ${ad.title}`,
          content: contactMessage,
          message_type: 'classified_inquiry',
          status: 'unread'
        });

      if (error) {
        throw error;
      }

      alert('Message sent successfully!');
      setShowContactModal(false);
      setContactMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading classified ad...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-3xl text-red-500"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ad Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">This classified ad may have expired or been removed.</p>
          <Link href="/classifieds" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap">
            Browse All Ads
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-orange-600 cursor-pointer">Home</Link></li>
            <li><i className="ri-arrow-right-s-line"></i></li>
            <li><Link href="/classifieds" className="hover:text-orange-600 cursor-pointer">Classifieds</Link></li>
            <li><i className="ri-arrow-right-s-line"></i></li>
            <li><Link href={`/classifieds?category=${encodeURIComponent(ad.category)}`} className="hover:text-orange-600 cursor-pointer">{ad.category}</Link></li>
            <li><i className="ri-arrow-right-s-line"></i></li>
            <li className="text-gray-900 truncate">{ad.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            {ad.images && ad.images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {ad.images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {ad.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${ad.title} ${index + 2}`}
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ad Details */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getAdTypeColor(ad.ad_type)}`}>
                      <i className={`${getAdTypeIcon(ad.ad_type)} mr-2`}></i>
                      {ad.ad_type}
                    </span>
                    <span className="text-sm text-gray-500">{ad.category}</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{ad.title}</h1>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-1">
                      <i className="ri-map-pin-line"></i>
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-eye-line"></i>
                      <span>{ad.views || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-calendar-line"></i>
                      <span>Posted {formatDate(ad.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-time-line"></i>
                      <span>{getDaysRemaining(ad.expires_at)} days left</span>
                    </div>
                  </div>
                </div>
                
                {ad.price && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">${ad.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Price</div>
                  </div>
                )}
              </div>

              <div className="prose prose-lg max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {ad.description}
                </div>
              </div>
            </div>

            {/* Seller Info & Contact */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                    {ad.profiles?.avatar_url ? (
                      <img
                        src={ad.profiles.avatar_url}
                        alt={ad.profiles.full_name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <i className="ri-user-line text-xl text-orange-600"></i>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {ad.profiles?.full_name || 'Anonymous User'}
                    </h4>
                    <p className="text-sm text-gray-600">Member since {formatDate(ad.created_at)}</p>
                  </div>
                </div>
                
                {user?.id !== ad.seller_id && (
                  <button
                    onClick={handleContactSeller}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2"
                  >
                    <i className="ri-message-line"></i>
                    <span>Contact Seller</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{ad.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900 capitalize">{ad.ad_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{ad.location}</span>
                </div>
                {ad.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="font-bold text-orange-600">${ad.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium text-gray-900">{formatDate(ad.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires</span>
                  <span className="font-medium text-red-600">{getDaysRemaining(ad.expires_at)} days</span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Safety Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Meet in a public place</li>
                    <li>• Never send money in advance</li>
                    <li>• Trust your instincts</li>
                    <li>• Verify seller identity</li>
                    <li>• Report suspicious activity</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Related Ads */}
            {relatedAds.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Ads</h3>
                <div className="space-y-4">
                  {relatedAds.map((relatedAd) => (
                    <Link
                      key={relatedAd.id}
                      href={`/classified/${relatedAd.id}`}
                      className="block group cursor-pointer"
                    >
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {relatedAd.images && relatedAd.images.length > 0 ? (
                            <img
                              src={relatedAd.images[0]}
                              alt={relatedAd.title}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                              <i className={`${getAdTypeIcon(relatedAd.ad_type)} text-orange-500`}></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-sm">
                            {relatedAd.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{relatedAd.location}</p>
                          {relatedAd.price && (
                            <p className="text-sm font-semibold text-orange-600 mt-1">
                              ${relatedAd.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Contact Seller</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Re: {ad.title}</h4>
                <p className="text-sm text-gray-600">Send a message to the seller about this ad</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Hi, I'm interested in your ad. Could you tell me more about..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !contactMessage.trim()}
                  className={`flex-1 py-3 rounded-2xl font-bold whitespace-nowrap ${
                    sendingMessage || !contactMessage.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer'
                  }`}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
