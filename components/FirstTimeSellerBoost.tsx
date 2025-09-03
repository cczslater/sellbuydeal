'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getActivePromotionalBoosts } from '../lib/credits';

export default function FirstTimeSellerBoost() {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBoosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBoosts = async () => {
    if (!user) return;
    
    try {
      const activeBoosts = await getActivePromotionalBoosts(user.id);
      setBoosts(activeBoosts.filter(boost => boost.boost_type === 'first_time_seller'));
    } catch (error) {
      console.error('Error loading promotional boosts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || boosts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-star-line text-lg"></i>
            </div>
            <span className="bg-white/20 text-xs font-medium px-2 py-1 rounded-full">
              FIRST-TIME SELLER
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Your Listings Are Featured!</h3>
          <p className="text-purple-100 text-sm mb-3">
            {boosts.length} of your first 3 listings are getting special homepage placement and priority visibility.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <i className="ri-eye-line"></i>
              <span>3x More Views</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-home-line"></i>
              <span>Homepage Featured</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-search-line"></i>
              <span>Top Search Results</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{boosts.length}/3</div>
          <div className="text-xs text-purple-100">Boosted Listings</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {boosts.map((boost) => {
            const expiresAt = new Date(boost.expires_at);
            const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={boost.id} className="bg-white/10 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1 truncate">{boost.products?.title}</h4>
                <div className="flex items-center justify-between text-xs text-purple-100">
                  <span>${boost.products?.price}</span>
                  <span>{daysLeft} days left</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}