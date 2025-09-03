'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

interface WishlistMatch {
  id: string;
  title: string;
  max_price: number;
  category: string;
  description: string;
  urgency_level: string;
  buyer_name: string;
  created_at: string;
}

interface SellerNotification {
  id: string;
  title: string;
  message: string;
  type: 'wishlist_match' | 'new_request';
  data: WishlistMatch;
  read: boolean;
  created_at: string;
}

export default function WishlistMatchNotifier() {
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.account_type === 'seller') {
      loadSellerNotifications();
      subscribeToNotifications();
    }
  }, [user, profile]);

  const loadSellerNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seller_notifications')
        .select(`
          *,
          wishlist_items!notification_data (
            id,
            title,
            description,
            category,
            max_price,
            urgency_level,
            profiles!user_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('seller_id', user.id)
        .eq('type', 'wishlist_match')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading seller notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel('seller-wishlist-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'seller_notifications',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.type === 'wishlist_match') {
            loadSellerNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('seller_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const createListingFromWishlist = async (wishlistItem: WishlistMatch) => {
    // Store wishlist data in localStorage for the sell page
    localStorage.setItem('wishlist_match_data', JSON.stringify({
      title: wishlistItem.title,
      description: wishlistItem.description,
      category: wishlistItem.category,
      suggestedPrice: wishlistItem.max_price,
      buyer_info: `Requested by ${wishlistItem.buyer_name}`,
      urgency: wishlistItem.urgency_level
    }));

    // Navigate to sell page
    window.location.href = '/sell/quick?wishlist_match=true';
  };

  if (!user || profile?.account_type !== 'seller' || notifications.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-[#004080] cursor-pointer"
      >
        <i className="ri-notification-3-line text-xl"></i>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Buyer Requests</h3>
              <span className="text-xs text-gray-500">{notifications.length} new</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Buyers are looking for items you might have</p>
          </div>

          <div className="divide-y max-h-80 overflow-y-auto">
            {notifications.map((notification) => {
              const wishlistItem = notification.data;
              return (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      wishlistItem.urgency_level === 'high' ? 'bg-red-500' :
                      wishlistItem.urgency_level === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {wishlistItem.title}
                        </h4>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {wishlistItem.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Max: ${wishlistItem.max_price}</span>
                        <span className="capitalize">{wishlistItem.urgency_level} priority</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => createListingFromWishlist(wishlistItem)}
                          className="bg-[#004080] text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                        >
                          Create Listing
                        </button>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-500 text-xs hover:text-gray-700 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Link
                href="/seller/notifications"
                className="text-[#004080] text-sm font-medium hover:text-blue-700 cursor-pointer"
              >
                View All Notifications
              </Link>
              <Link
                href="/wishlist"
                className="text-gray-600 text-sm hover:text-gray-800 cursor-pointer"
              >
                Browse Buyer Requests
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}