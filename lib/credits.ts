
'use client';
import { supabase } from './supabase';
import { awardLoyaltyPoints, checkListingForPoints, awardSalePoints } from './loyalty-points';

export interface CreditTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  source: string;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface UserCreditBalance {
  user_id: string;
  total_earned: number;
  total_spent: number;
  current_balance: number;
  listings_count: number;
  updated_at: string;
}

export const getCreditBalance = async (userId: string): Promise<UserCreditBalance | null> => {
  const { data, error } = await supabase
    .from('user_credit_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching credit balance:', error);
    return null;
  }

  if (!data) {
    // Create initial balance record
    const { data: newBalance, error: createError } = await supabase
      .from('user_credit_balances')
      .insert({
        user_id: userId,
        total_earned: 0,
        total_spent: 0,
        current_balance: 0,
        listings_count: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating credit balance:', createError);
      return null;
    }

    return newBalance;
  }

  return data;
};

export const addCredit = async (
  userId: string, 
  amount: number, 
  source: string, 
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    // Add credit transaction
    const { error: transactionError } = await supabase
      .from('marketplace_credits')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'earned',
        source: source,
        description: description,
        reference_id: referenceId
      });

    if (transactionError) {
      console.error('Error adding credit transaction:', transactionError);
      return false;
    }

    // Update balance
    const balance = await getCreditBalance(userId);
    if (!balance) return false;

    const { error: balanceError } = await supabase
      .from('user_credit_balances')
      .update({
        total_earned: balance.total_earned + amount,
        current_balance: balance.current_balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.error('Error updating credit balance:', balanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addCredit:', error);
    return false;
  }
};

export const deductCredit = async (
  userId: string,
  amount: number,
  source: string,
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    const balance = await getCreditBalance(userId);
    if (!balance || balance.current_balance < amount) {
      return false; // Insufficient credits
    }

    // Add spending transaction
    const { error: transactionError } = await supabase
      .from('marketplace_credits')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'spent',
        source: source,
        description: description,
        reference_id: referenceId
      });

    if (transactionError) {
      console.error('Error adding deduct transaction:', transactionError);
      return false;
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_credit_balances')
      .update({
        total_spent: balance.total_spent + amount,
        current_balance: balance.current_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.error('Error updating credit balance:', balanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deductCredit:', error);
    return false;
  }
};

export const spendCredits = async (
  userId: string, 
  amount: number, 
  source: string, 
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    const balance = await getCreditBalance(userId);
    if (!balance || balance.current_balance < amount) {
      return false; // Insufficient credits
    }

    // Add spending transaction
    const { error: transactionError } = await supabase
      .from('marketplace_credits')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'spent',
        source: source,
        description: description,
        reference_id: referenceId
      });

    if (transactionError) {
      console.error('Error adding spend transaction:', transactionError);
      return false;
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_credit_balances')
      .update({
        total_spent: balance.total_spent + amount,
        current_balance: balance.current_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.error('Error updating credit balance:', balanceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in spendCredits:', error);
    return false;
  }
};

export const getCreditHistory = async (userId: string): Promise<CreditTransaction[]> => {
  const { data, error } = await supabase
    .from('marketplace_credits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit history:', error);
    return [];
  }

  return data || [];
};

export const checkAndRewardFirstListings = async (userId: string): Promise<void> => {
  try {
    const balance = await getCreditBalance(userId);
    if (!balance) return;

    const { data: userListings } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', userId);

    const listingsCount = userListings?.length || 0;

    // Check if user qualifies for first 5 listings bonus
    if (listingsCount <= 5 && balance.listings_count < listingsCount) {
      const creditsToAdd = Math.min(5, listingsCount) - balance.listings_count;
      
      if (creditsToAdd > 0) {
        await addCredit(
          userId,
          creditsToAdd * 1, // $1 per listing
          'first_5_listings',
          `Earned $${creditsToAdd} marketplace credit for your first ${listingsCount} listing${listingsCount > 1 ? 's' : ''}`
        );

        // Update listings count
        await supabase
          .from('user_credit_balances')
          .update({
            listings_count: listingsCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }

    // Apply promotional boosts for first 3 listings
    await applyFirstTimeSellerBoosts(userId, listingsCount);

    // Award loyalty points for new listings
    if (userListings && userListings.length > 0) {
      for (const listing of userListings) {
        await checkListingForPoints(userId, listing);
      }
    }
  } catch (error) {
    console.error('Error checking first listings reward:', error);
  }
};

export const applyFirstTimeSellerBoosts = async (userId: string, listingsCount: number): Promise<void> => {
  try {
    if (listingsCount > 3) return; // Only for first 3 listings

    // Get the most recent listings
    const { data: recentListings } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!recentListings || recentListings.length === 0) return;

    // Check which listings don't already have promotional boosts
    const { data: existingBoosts } = await supabase
      .from('promotional_boosts')
      .select('listing_id')
      .eq('user_id', userId)
      .eq('boost_type', 'first_time_seller');

    const boostedListingIds = existingBoosts?.map(boost => boost.listing_id) || [];
    const newListings = recentListings.filter(listing => !boostedListingIds.includes(listing.id));

    // Apply promotional boosts to new listings
    for (const listing of newListings) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day boost

      await supabase
        .from('promotional_boosts')
        .insert({
          user_id: userId,
          listing_id: listing.id,
          boost_type: 'first_time_seller',
          boost_status: 'active',
          expires_at: expiresAt.toISOString()
        });

      // Add bonus credits for getting the boost
      await addCredit(
        userId,
        2, // $2 bonus for each promotional boost
        'promotional_boost',
        'Bonus credit for receiving first-time seller promotional boost',
        listing.id
      );
    }
  } catch (error) {
    console.error('Error applying first-time seller boosts:', error);
  }
};

export const getActivePromotionalBoosts = async (userId?: string, listingId?: string) => {
  let query = supabase
    .from('promotional_boosts')
    .select(`
      *,
      products (
        id,
        title,
        images,
        price,
        seller_id
      )
    `)
    .eq('boost_status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promotional boosts:', error);
    return [];
  }

  return data || [];
};

export const getBoostedListings = async (boostType?: string) => {
  let query = supabase
    .from('promotional_boosts')
    .select(`
      *,
      products (
        *,
        profiles!seller_id (
          id,
          first_name,
          last_name,
          verified
        )
      )
    `)
    .eq('boost_status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (boostType) {
    query = query.eq('boost_type', boostType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching boosted listings:', error);
    return [];
  }

  return data || [];
};

export const getPromotionCost = (type: string): number => {
  const costs = {
    'featured_listing': 2.99,
    'boost_visibility': 1.99,
    'premium_placement': 4.99,
    'listing_fee_waiver': 0.50
  };
  
  return costs[type as keyof typeof costs] || 0;
};
