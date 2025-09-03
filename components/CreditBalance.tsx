'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getCreditBalance, UserCreditBalance } from '../lib/credits';

export default function CreditBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserCreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBalance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBalance = async () => {
    if (!user) return;
    
    try {
      const userBalance = await getCreditBalance(user.id);
      setBalance(userBalance);
    } catch (error) {
      console.error('Error loading credit balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  return (
    <div className="bg-gradient-to-r from-[#FFA500] to-orange-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-orange-100 mb-1">Marketplace Credits</p>
          <p className="text-2xl font-bold">${balance?.current_balance?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-orange-100">
            Earned: ${balance?.total_earned?.toFixed(2) || '0.00'} • 
            Spent: ${balance?.total_spent?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <i className="ri-coins-line text-2xl"></i>
        </div>
      </div>
    </div>
  );
}