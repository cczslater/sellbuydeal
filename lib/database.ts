
'use client';
import { supabase } from './supabase';

export const getProducts = async (filters?: {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  type?: 'auction' | 'fixed';
  status?: 'active' | 'draft' | 'sold' | 'ended';
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles!seller_id (
        id,
        first_name,
        last_name,
        verified
      )
    `);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.log('Database error, returning empty array:', error);
    return [];
  }

  return data || [];
};

export const getProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles!seller_id (
        id,
        first_name,
        last_name,
        verified,
        phone,
        address
      )
    `)
    .eq('id', productId)
    .single();

  if (error) throw error;
  return data;
};

export const createProduct = async (productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (productId: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSellerProducts = async (sellerId: string, status?: string) => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const incrementProductViews = async (productId: string) => {
  try {
    const { error } = await supabase.rpc('increment_product_views', {
      product_id: productId
    });

    if (error) {
      console.log('RPC function not found, using direct update');
      const { data: product } = await supabase
        .from('products')
        .select('views')
        .eq('id', productId)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ 
            views: (product.views || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);
      }
    }
  } catch (error) {
    console.error('Error incrementing product views:', error);
  }
};

export const getAuction = async (productId: string) => {
  const { data, error } = await supabase
    .from('auctions')
    .select(`
      *,
      products (
        title,
        images,
        seller_id
      )
    `)
    .eq('product_id', productId)
    .single();

  if (error) throw error;
  return data;
};

export const placeBid = async (auctionId: string, bidderId: string, amount: number) => {
  const { data: bidData, error: bidError } = await supabase
    .from('bids')
    .insert({
      auction_id: auctionId,
      bidder_id: bidderId,
      amount: amount
    })
    .select()
    .single();

  if (bidError) throw bidError;

  const { error: updateError } = await supabase
    .from('auctions')
    .update({
      current_bid: amount,
      total_bids: supabase.raw('total_bids + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('id', auctionId);

  if (updateError) throw updateError;

  return bidData;
};

export const getMessages = async (productId: string, userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id (
        id,
        first_name,
        last_name
      ),
      receiver:profiles!receiver_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq('product_id', productId)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const sendMessage = async (messageData: {
  product_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'offer' | 'system';
  offer_amount?: number;
}) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOfferStatus = async (messageId: string, status: 'accepted' | 'declined') => {
  const { data, error } = await supabase
    .from('messages')
    .update({ offer_status: status })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createStore = async (userId: string, storeData: {
  storeName: string;
  storeDescription: string;
  category: string;
  businessType: string;
  returnPolicy: string;
  shippingPolicy: string;
}) => {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      user_id: userId,
      store_name: storeData.storeName,
      store_description: storeData.storeDescription,
      category: storeData.category,
      business_type: storeData.businessType,
      return_policy: storeData.returnPolicy,
      shipping_policy: storeData.shippingPolicy,
      total_views: 0,
      followers_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserStore = async (userId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateStore = async (storeId: string, updates: any) => {
  const { data, error } = await supabase
    .from('stores')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createBundle = async (bundleData: {
  seller_id: string;
  title: string;
  description: string;
  total_price: number;
  savings_amount: number;
  category: string;
  images?: string[];
  items: Array<{
    product_id: string;
    quantity: number;
    individual_price: number;
  }>;
}) => {
  const { data: bundle, error: bundleError } = await supabase
    .from('bundles')
    .insert({
      seller_id: bundleData.seller_id,
      title: bundleData.title,
      description: bundleData.description,
      total_price: bundleData.total_price,
      savings_amount: bundleData.savings_amount,
      category: bundleData.category,
      images: bundleData.images || []
    })
    .select()
    .single();

  if (bundleError) throw bundleError;

  const bundleItems = bundleData.items.map(item => ({
    bundle_id: bundle.id,
    product_id: item.product_id,
    quantity: item.quantity,
    individual_price: item.individual_price
  }));

  const { error: itemsError } = await supabase
    .from('bundle_items')
    .insert(bundleItems);

  if (itemsError) throw itemsError;

  return bundle;
};

export const getBundles = async (filters?: {
  seller_id?: string;
  category?: string;
  status?: string;
  search?: string;
}) => {
  let query = supabase
    .from('bundles')
    .select(`
      *,
      profiles!seller_id (
        id,
        first_name,
        last_name,
        verified
      ),
      bundle_items (
        id,
        quantity,
        individual_price,
        products (
          id,
          title,
          images,
          price
        )
      )
    `);

  if (filters?.seller_id) {
    query = query.eq('seller_id', filters.seller_id);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'active');
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.log('Database error, returning empty array:', error);
    return [];
  }

  return data || [];
};

export const getBundle = async (bundleId: string) => {
  const { data, error } = await supabase
    .from('bundles')
    .select(`
      *,
      profiles!seller_id (
        id,
        first_name,
        last_name,
        verified,
        phone,
        address
      ),
      bundle_items (
        id,
        quantity,
        individual_price,
        products (
          id,
          title,
          description,
          images,
          price,
          condition,
          category
        )
      )
    `)
    .eq('id', bundleId)
    .single();

  if (error) throw error;
  return data;
};

export const updateBundle = async (bundleId: string, updates: any) => {
  const { data, error } = await supabase
    .from('bundles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', bundleId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSellerBundles = async (sellerId: string, status?: string) => {
  let query = supabase
    .from('bundles')
    .select(`
      *,
      bundle_items (
        id,
        quantity,
        products (
          id,
          title,
          images
        )
      )
    `)
    .eq('seller_id', sellerId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const incrementBundleViews = async (bundleId: string) => {
  try {
    const { error } = await supabase.rpc('increment_bundle_views', {
      bundle_id: bundleId
    });

    if (error) {
      console.log('RPC function not found, using direct update');
      const { data: bundle } = await supabase
        .from('bundles')
        .select('views')
        .eq('id', bundleId)
        .single();

      if (bundle) {
        await supabase
          .from('bundles')
          .update({ 
            views: (bundle.views || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', bundleId);
      }
    }
  } catch (error) {
    console.error('Error incrementing bundle views:', error);
  }
};
