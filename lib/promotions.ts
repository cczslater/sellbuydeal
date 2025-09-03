'use client';
import { supabase } from './supabase';
import { spendCredits } from './credits';

export interface PromotionSetting {
  id: number;
  promotion_type: string;
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingPromotion {
  id: number;
  user_id: string;
  listing_id: string;
  promotion_type: string;
  amount_paid: number;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export const getPromotionSettings = async (): Promise<PromotionSetting[]> => {
  const { data, error } = await supabase
    .from('admin_promotion_settings')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching promotion settings:', error);
    return [];
  }

  return data || [];
};

export const updatePromotionSetting = async (
  id: number, 
  updates: Partial<PromotionSetting>
): Promise<boolean> => {
  const { error } = await supabase
    .from('admin_promotion_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating promotion setting:', error);
    return false;
  }

  return true;
};

export const applyListingPromotion = async (
  userId: string,
  listingId: string,
  promotionType: string
): Promise<boolean> => {
  try {
    // Get promotion settings
    const { data: settings } = await supabase
      .from('admin_promotion_settings')
      .select('*')
      .eq('promotion_type', promotionType)
      .eq('is_active', true)
      .single();

    if (!settings) {
      console.error('Promotion type not found or inactive');
      return false;
    }

    // Check if user can afford promotion
    const spendSuccess = await spendCredits(
      userId,
      settings.price,
      `promotion_${promotionType}`,
      `Applied ${settings.description}`,
      listingId
    );

    if (!spendSuccess) {
      return false;
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.duration_days);

    // Deactivate any existing promotion of same type for this listing
    await supabase
      .from('listing_promotions')
      .update({ status: 'replaced' })
      .eq('listing_id', listingId)
      .eq('promotion_type', promotionType)
      .eq('status', 'active');

    // Create new promotion
    const { error } = await supabase
      .from('listing_promotions')
      .insert({
        user_id: userId,
        listing_id: listingId,
        promotion_type: promotionType,
        amount_paid: settings.price,
        status: 'active',
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('Error creating listing promotion:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error applying listing promotion:', error);
    return false;
  }
};

export const getListingPromotions = async (
  userId?: string,
  listingId?: string
): Promise<ListingPromotion[]> => {
  let query = supabase
    .from('listing_promotions')
    .select('*')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listing promotions:', error);
    return [];
  }

  return data || [];
};

export const getPromotedListingsForHomepage = async () => {
  const { data, error } = await supabase
    .from('listing_promotions')
    .select(`
      *,
      products!inner (
        *,
        profiles!seller_id (
          id,
          first_name,
          last_name,
          verified
        )
      )
    `)
    .eq('promotion_type', 'homepage_promotion')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('starts_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching homepage promotions:', error);
    return [];
  }

  return data || [];
};

export const getTopMovedListings = async (category?: string) => {
  let query = supabase
    .from('listing_promotions')
    .select(`
      *,
      products!inner (
        *,
        profiles!seller_id (
          id,
          first_name,
          last_name,
          verified
        )
      )
    `)
    .in('promotion_type', ['move_to_top', 'featured_listing', 'premium_placement'])
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString());

  if (category) {
    query = query.eq('products.category', category);
  }

  const { data, error } = await query.order('starts_at', { ascending: false });

  if (error) {
    console.error('Error fetching top moved listings:', error);
    return [];
  }

  return data || [];
};

export const getUserPromotionHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('listing_promotions')
    .select(`
      *,
      admin_promotion_settings!promotion_type (
        description
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user promotion history:', error);
    return [];
  }

  return data || [];
};

export const expireOldPromotions = async () => {
  const { error } = await supabase
    .from('listing_promotions')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error expiring old promotions:', error);
    return false;
  }

  return true;
};