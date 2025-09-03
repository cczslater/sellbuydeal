'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  getLoyaltyRewards, 
  getLoyaltyPointsBalance, 
  redeemLoyaltyReward,
  getPointsHistory,
  getPointsLeaderboard,
  LoyaltyReward,
  LoyaltyPointsBalance,
  PointsTransaction
} from '../lib/loyalty-points';

export default function LoyaltyRewardsCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [balance, setBalance] = useState<LoyaltyPointsBalance | null>(null);
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [selectedListingId, setSelectedListingId] = useState('');

  useEffect(() => {
    loadRewardsData();
  }, [user]);

  const loadRewardsData = async () => {
    setLoading(true);
    try {
      const [rewardsData, leaderboardData] = await Promise.all([
        getLoyaltyRewards(),
        getPointsLeaderboard(10)
      ]);

      setRewards(rewardsData);
      setLeaderboard(leaderboardData);

      if (user) {
        const [balanceData, historyData] = await Promise.all([
          getLoyaltyPointsBalance(user.id),
          getPointsHistory(user.id)
        ]);
        
        setBalance(balanceData);
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = (reward: LoyaltyReward) => {
    setSelectedReward(reward);
    if (reward.reward_type === 'boost') {
      setShowRedeemModal(true);
    } else {
      redeemReward(reward.id);
    }
  };

  const redeemReward = async (rewardId: number, listingId?: string) => {
    if (!user) return;

    setRedeeming(rewardId);
    try {
      const success = await redeemLoyaltyReward(user.id, rewardId, listingId);
      
      if (success) {
        alert('Reward redeemed successfully!');
        await loadRewardsData();
        setShowRedeemModal(false);
        setSelectedListingId('');
      } else {
        alert('Failed to redeem reward. Please check your points balance.');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('An error occurred while redeeming the reward.');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    const icons = {
      boost: 'ri-rocket-line',
      credit: 'ri-coins-line',
      giveaway: 'ri-gift-line',
      special: 'ri-vip-crown-line'
    };
    return icons[type as keyof typeof icons] || 'ri-award-line';
  };

  const getRewardColor = (type: string) => {
    const colors = {
      boost: 'from-blue-500 to-cyan-600',
      credit: 'from-green-500 to-emerald-600',
      giveaway: 'from-purple-500 to-pink-600',
      special: 'from-yellow-500 to-orange-600'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Rewards</h2>
            <p className="text-gray-600">Redeem your points for exclusive rewards and benefits</p>
          </div>
          {balance && (
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {balance.current_balance.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Available Points</div>
            </div>
          )}
        </div>

        {/* Points Achievement Summary */}
        {balance && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <i className="ri-trophy-line text-2xl text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Achievement Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{balance.total_listings}</div>
                    <div className="text-sm text-gray-600">Total Listings</div>
                    <div className="text-xs text-green-600">+{balance.total_listings * 10} pts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{balance.high_quality_listings}</div>
                    <div className="text-sm text-gray-600">Quality Listings</div>
                    <div className="text-xs text-green-600">+{balance.high_quality_listings * 25} pts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{balance.successful_sales}</div>
                    <div className="text-sm text-gray-600">Sales Made</div>
                    <div className="text-xs text-green-600">+{balance.successful_sales * 50} pts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{balance.points_earned}</div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                    <div className="text-xs text-gray-500">All time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'rewards', label: 'Redeem Rewards', icon: 'ri-gift-line' },
            { key: 'history', label: 'Points History', icon: 'ri-history-line' },
            { key: 'leaderboard', label: 'Leaderboard', icon: 'ri-trophy-line' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`h-24 bg-gradient-to-r ${getRewardColor(reward.reward_type)} flex items-center justify-center`}>
                  <i className={`${getRewardIcon(reward.reward_type)} text-4xl text-white`}></i>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{reward.reward_name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        reward.reward_type === 'boost' ? 'bg-blue-100 text-blue-800' :
                        reward.reward_type === 'credit' ? 'bg-green-100 text-green-800' :
                        reward.reward_type === 'giveaway' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reward.reward_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{reward.points_cost}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{reward.description}</p>

                  {reward.reward_value > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-semibold text-green-600">
                          ${reward.reward_value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleRedemption(reward)}
                    disabled={!balance || balance.current_balance < reward.points_cost || redeeming === reward.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium cursor-pointer whitespace-nowrap transition-colors ${
                      !balance || balance.current_balance < reward.points_cost
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : redeeming === reward.id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                    }`}
                  >
                    {redeeming === reward.id ? 'Redeeming...' : 
                     !balance || balance.current_balance < reward.points_cost ? 'Insufficient Points' : 
                     'Redeem Reward'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {history.length > 0 ? (
                history.map((transaction) => (
                  <div key={transaction.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === 'earned' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        <i className={`${
                          transaction.transaction_type === 'earned' 
                            ? 'ri-add-line' 
                            : 'ri-subtract-line'
                        } text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.source.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.transaction_type === 'earned' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.points}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-history-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No points history yet</h3>
                  <p className="text-gray-600">Start creating listings to earn your first points!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-2xl border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Points Leaderboard</h3>
              <p className="text-gray-600 text-sm">Top point earners this month</p>
            </div>
            <div className="divide-y">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {entry.profiles?.first_name} {entry.profiles?.last_name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{entry.total_listings} listings</span>
                        <span>•</span>
                        <span>{entry.successful_sales} sales</span>
                        {entry.profiles?.verified && (
                          <>
                            <span>•</span>
                            <div className="flex items-center text-blue-600">
                              <i className="ri-verified-badge-fill text-sm mr-1"></i>
                              <span>Verified</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">
                      {entry.current_balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Earn Points Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-lightbulb-line text-xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How to Earn Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-add-line text-green-600"></i>
                    </div>
                    <span className="font-semibold text-green-600">+10 Points</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Create a Listing</h4>
                  <p className="text-sm text-gray-600">Every new listing earns you points</p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-camera-line text-blue-600"></i>
                    </div>
                    <span className="font-semibold text-blue-600">+25 Points</span>
                  </div>
                  <h4 className="font-medium text-gray-900">High-Quality Photos</h4>
                  <p className="text-sm text-gray-600">3+ photos with good descriptions</p>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <i className="ri-hand-coin-line text-orange-600"></i>
                    </div>
                    <span className="font-semibold text-orange-600">+50 Points</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Successful Sale</h4>
                  <p className="text-sm text-gray-600">Complete a transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Modal for Boost Rewards */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Redeem Boost Reward</h3>
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800">{selectedReward.reward_name}</h4>
                  <p className="text-sm text-purple-700">{selectedReward.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-purple-600">{selectedReward.points_cost} points</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Listing to Boost
                </label>
                <input
                  type="text"
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  placeholder="Enter listing ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can find the listing ID in your seller dashboard
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={() => redeemReward(selectedReward.id, selectedListingId)}
                  disabled={!selectedListingId}
                  className={`flex-1 py-3 rounded-lg font-medium whitespace-nowrap ${
                    !selectedListingId
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                  }`}
                >
                  Redeem Boost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}