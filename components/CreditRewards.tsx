'use client';
import { useState } from 'react';

interface CreditReward {
  id: string;
  title: string;
  description: string;
  creditAmount: number;
  icon: string;
  requirement: string;
  completed: boolean;
  progress?: number;
  maxProgress?: number;
}

interface CreditRewardsProps {
  userListingsCount: number;
}

export default function CreditRewards({ userListingsCount }: CreditRewardsProps) {
  const rewards: CreditReward[] = [
    {
      id: 'first_listing',
      title: 'First Listing Bonus',
      description: 'Get $1 credit for creating your first listing',
      creditAmount: 1,
      icon: 'ri-star-line',
      requirement: 'Create 1 listing',
      completed: userListingsCount >= 1,
      progress: Math.min(userListingsCount, 1),
      maxProgress: 1
    },
    {
      id: 'first_5_listings',
      title: 'Starter Seller Bonus',
      description: 'Earn $1 credit for each of your first 5 listings',
      creditAmount: 5,
      icon: 'ri-medal-line',
      requirement: 'Create 5 listings',
      completed: userListingsCount >= 5,
      progress: Math.min(userListingsCount, 5),
      maxProgress: 5
    },
    {
      id: 'power_seller',
      title: 'Power Seller Rewards',
      description: 'Unlock premium features and bonus credits',
      creditAmount: 25,
      icon: 'ri-vip-crown-line',
      requirement: 'Create 25 listings',
      completed: userListingsCount >= 25,
      progress: Math.min(userListingsCount, 25),
      maxProgress: 25
    }
  ];

  const upcomingOffers = [
    {
      title: 'Weekend Special',
      description: 'Double credits on all successful sales',
      validUntil: '2024-01-21',
      icon: 'ri-calendar-event-line'
    },
    {
      title: 'Referral Bonus',
      description: 'Get $5 credits for each friend you refer',
      icon: 'ri-user-add-line'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className={`border rounded-xl p-4 transition-colors ${
              reward.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  reward.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <i className={`${reward.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-[#FFA500]">
                        ${reward.creditAmount}
                      </span>
                      {reward.completed && (
                        <i className="ri-check-line text-green-500 text-xl"></i>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                  
                  {reward.progress !== undefined && reward.maxProgress && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{reward.progress}/{reward.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            reward.completed ? 'bg-green-500' : 'bg-[#FFA500]'
                          }`}
                          style={{ width: `${(reward.progress / reward.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">{reward.requirement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Offers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingOffers.map((offer, index) => (
            <div key={index} className="bg-gradient-to-r from-[#004080] to-blue-700 rounded-xl p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`${offer.icon} text-lg`}></i>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{offer.title}</h4>
                  <p className="text-sm text-blue-100">{offer.description}</p>
                  {'validUntil' in offer && (
                    <p className="text-xs text-blue-200 mt-1">Valid until {offer.validUntil}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="ri-information-line text-yellow-600"></i>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">How to Use Credits</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Promote your listings for better visibility</li>
              <li>• Waive listing fees on future items</li>
              <li>• Unlock premium seller features</li>
              <li>• Credits never expire on active accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}