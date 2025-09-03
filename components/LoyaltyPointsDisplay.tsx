'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getLoyaltyPointsBalance, LoyaltyPointsBalance, getUserPointsRank } from '../lib/loyalty-points';

export default function LoyaltyPointsDisplay() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LoyaltyPointsBalance | null>(null);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPointsData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPointsData = async () => {
    if (!user) return;
    
    try {
      const [pointsBalance, rank] = await Promise.all([
        getLoyaltyPointsBalance(user.id),
        getUserPointsRank(user.id)
      ]);
      
      setBalance(pointsBalance);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading points data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-trophy-line text-sm"></i>
            </div>
            <p className="text-sm text-purple-100">Loyalty Points</p>
          </div>
          <p className="text-2xl font-bold">{balance?.current_balance?.toLocaleString() || '0'}</p>
          <div className="flex items-center space-x-4 text-xs text-purple-100 mt-1">
            <span>Earned: {balance?.points_earned?.toLocaleString() || '0'}</span>
            <span>Rank: #{userRank}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <i className="ri-award-line text-2xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <div className="text-lg font-bold">{balance?.total_listings || 0}</div>
          <div className="text-xs text-purple-100">Listings</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{balance?.high_quality_listings || 0}</div>
          <div className="text-xs text-purple-100">Quality</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{balance?.successful_sales || 0}</div>
          <div className="text-xs text-purple-100">Sales</div>
        </div>
      </div>
    </div>
  );
}