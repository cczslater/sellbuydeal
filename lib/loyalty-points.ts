'use client';
import { supabase } from './supabase';
import { addCredit } from './credits';
import { applyListingPromotion } from './promotions';

export interface LoyaltyPointsBalance {
  id: number;
  user_id: string;
  points_earned: number;
  points_spent: number;
  current_balance: number;
  total_listings: number;
  high_quality_listings: number;
  successful_sales: number;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: number;
  user_id: string;
  points: number;
  transaction_type: 'earned' | 'spent';
  source: string;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: number;
  reward_type: 'boost' | 'credit' | 'giveaway' | 'special';
  reward_name: string;
  description: string;
  points_cost: number;
  reward_value: number;
  is_active: boolean;
}

export interface GiveawayEntry {
  id: number;
  user_id: string;
  giveaway_id: number;
  entry_type: string;
  points_spent: number;
  created_at: string;
}

// Get user's loyalty points balance
export const getLoyaltyPointsBalance = async (userId: string): Promise<LoyaltyPointsBalance | null> => {
  const { data, error } = await supabase
    .from('listing_loyalty_points')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching loyalty points balance:', error);
    return null;
  }

  if (!data) {
    // Create initial balance record
    const { data: newBalance, error: createError } = await supabase
      .from('listing_loyalty_points')
      .insert({
        user_id: userId,
        points_earned: 0,
        points_spent: 0,
        current_balance: 0,
        total_listings: 0,
        high_quality_listings: 0,
        successful_sales: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating loyalty points balance:', createError);
      return null;
    }

    return newBalance;
  }

  return data;
};

// Award points for various actions
export const awardLoyaltyPoints = async (
  userId: string,
  points: number,
  source: string,
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    // Add points transaction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: points,
        transaction_type: 'earned',
        source: source,
        description: description,
        reference_id: referenceId
      });

    if (transactionError) {
      console.error('Error adding points transaction:', transactionError);
      return false;
    }

    // Update balance
    const balance = await getLoyaltyPointsBalance(userId);
    if (!balance) return false;

    const updates: any = {
      points_earned: balance.points_earned + points,
      current_balance: balance.current_balance + points,
      updated_at: new Date().toISOString()
    };

    // Update specific counters based on source
    if (source === 'new_listing') {
      updates.total_listings = balance.total_listings + 1;
    } else if (source === 'high_quality_listing') {
      updates.high_quality_listings = balance.high_quality_listings + 1;
    } else if (source === 'successful_sale') {
      updates.successful_sales = balance.successful_sales + 1;
    }

    const { error: balanceError } = await supabase
      .from('listing_loyalty_points')
      .update(updates)
      .eq('user_id', userId);

    if (balanceError) {
      console.error('Error updating loyalty points balance:', balanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in awardLoyaltyPoints:', error);
    return false;
  }
};

// Spend points on rewards
export const spendLoyaltyPoints = async (
  userId: string,
  points: number,
  source: string,
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    const balance = await getLoyaltyPointsBalance(userId);
    if (!balance || balance.current_balance < points) {
      return false; // Insufficient points
    }

    // Add spending transaction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: -points,
        transaction_type: 'spent',
        source: source,
        description: description,
        reference_id: referenceId
      });

    if (transactionError) {
      console.error('Error adding points spending transaction:', transactionError);
      return false;
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('listing_loyalty_points')
      .update({
        points_spent: balance.points_spent + points,
        current_balance: balance.current_balance - points,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.error('Error updating loyalty points balance:', balanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in spendLoyaltyPoints:', error);
    return false;
  }
};

// Get points transaction history
export const getPointsHistory = async (userId: string): Promise<PointsTransaction[]> => {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching points history:', error);
    return [];
  }

  return data || [];
};

// Get available loyalty rewards
export const getLoyaltyRewards = async (): Promise<LoyaltyReward[]> => {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost', { ascending: true });

  if (error) {
    console.error('Error fetching loyalty rewards:', error);
    return [];
  }

  return data || [];
};

// Redeem a loyalty reward
export const redeemLoyaltyReward = async (
  userId: string,
  rewardId: number,
  listingId?: string
): Promise<boolean> => {
  try {
    // Get reward details
    const { data: reward } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (!reward) {
      console.error('Reward not found or inactive');
      return false;
    }

    // Check if user has enough points
    const success = await spendLoyaltyPoints(
      userId,
      reward.points_cost,
      `redeem_${reward.reward_type}`,
      `Redeemed: ${reward.reward_name}`,
      rewardId.toString()
    );

    if (!success) {
      return false;
    }

    // Apply the reward based on type
    switch (reward.reward_type) {
      case 'boost':
        if (listingId) {
          // Apply promotion to listing
          const promotionType = reward.reward_name.includes('Featured') ? 'featured_listing' : 
                               reward.reward_name.includes('Homepage') ? 'homepage_promotion' : 
                               'move_to_top';
          await applyPromotionFromPoints(userId, listingId, promotionType);
        }
        break;

      case 'credit':
        // Add marketplace credit
        await addCredit(
          userId,
          reward.reward_value,
          'loyalty_points_redemption',
          `Loyalty points reward: ${reward.reward_name}`,
          rewardId.toString()
        );
        break;

      case 'giveaway':
        // Enter into giveaway
        await supabase
          .from('giveaway_entries')
          .insert({
            user_id: userId,
            giveaway_id: Math.floor(Math.random() * 1000), // Simple giveaway ID
            entry_type: reward.reward_name,
            points_spent: reward.points_cost
          });
        break;

      case 'special':
        // Handle special rewards (would need additional implementation)
        console.log(`Special reward ${reward.reward_name} redeemed by user ${userId}`);
        break;
    }

    return true;
  } catch (error) {
    console.error('Error redeeming loyalty reward:', error);
    return false;
  }
};

// Helper function to apply promotions using points
const applyPromotionFromPoints = async (
  userId: string,
  listingId: string,
  promotionType: string
): Promise<boolean> => {
  try {
    // Get promotion settings to determine duration
    const { data: settings } = await supabase
      .from('admin_promotion_settings')
      .select('*')
      .eq('promotion_type', promotionType)
      .eq('is_active', true)
      .single();

    const durationDays = settings?.duration_days || 3;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Deactivate any existing promotion of same type for this listing
    await supabase
      .from('listing_promotions')
      .update({ status: 'replaced' })
      .eq('listing_id', listingId)
      .eq('promotion_type', promotionType)
      .eq('status', 'active');

    // Create new promotion (free from points)
    const { error } = await supabase
      .from('listing_promotions')
      .insert({
        user_id: userId,
        listing_id: listingId,
        promotion_type: promotionType,
        amount_paid: 0, // Free from points
        status: 'active',
        expires_at: expiresAt.toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Error applying promotion from points:', error);
    return false;
  }
};

// Check and award points for new listing
export const checkListingForPoints = async (userId: string, listingData: any): Promise<void> => {
  try {
    // Award base points for listing
    await awardLoyaltyPoints(
      userId,
      10,
      'new_listing',
      'Created a new listing',
      listingData.id
    );

    // Check for high-quality listing bonus
    if (isHighQualityListing(listingData)) {
      await awardLoyaltyPoints(
        userId,
        25,
        'high_quality_listing',
        'High-quality listing with excellent photos and description',
        listingData.id
      );
    }
  } catch (error) {
    console.error('Error checking listing for points:', error);
  }
};

// Award points for successful sale
export const awardSalePoints = async (userId: string, saleData: any): Promise<void> => {
  try {
    await awardLoyaltyPoints(
      userId,
      50,
      'successful_sale',
      `Item sold: ${saleData.title || 'Product'}`,
      saleData.id
    );
  } catch (error) {
    console.error('Error awarding sale points:', error);
  }
};

// Helper function to determine if listing is high-quality
const isHighQualityListing = (listingData: any): boolean => {
  const hasMultiplePhotos = listingData.images && listingData.images.length >= 3;
  const hasGoodDescription = listingData.description && listingData.description.length >= 100;
  const hasGoodTitle = listingData.title && listingData.title.length >= 10;
  
  return hasMultiplePhotos && hasGoodDescription && hasGoodTitle;
};

// Get leaderboard data
export const getPointsLeaderboard = async (limit: number = 10): Promise<any[]> => {
  const { data, error } = await supabase
    .from('listing_loyalty_points')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        verified
      )
    `)
    .order('current_balance', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
};

// Get user rank
export const getUserPointsRank = async (userId: string): Promise<number> => {
  try {
    const { data: userBalance } = await supabase
      .from('listing_loyalty_points')
      .select('current_balance')
      .eq('user_id', userId)
      .single();

    if (!userBalance) return 0;

    const { count } = await supabase
      .from('listing_loyalty_points')
      .select('*', { count: 'exact', head: true })
      .gt('current_balance', userBalance.current_balance);

    return (count || 0) + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return 0;
  }
};