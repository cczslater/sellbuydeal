'use client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          account_type: 'buyer' | 'seller';
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          account_type: 'buyer' | 'seller';
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          account_type?: 'buyer' | 'seller';
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          original_price: number | null;
          category: string;
          condition: string;
          images: string[];
          type: 'auction' | 'fixed';
          status: 'active' | 'draft' | 'sold' | 'ended';
          views: number;
          watchers: number;
          features: string[];
          shipping_cost: number;
          return_policy: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          category: string;
          condition: string;
          images: string[];
          type: 'auction' | 'fixed';
          status?: 'active' | 'draft' | 'sold' | 'ended';
          views?: number;
          watchers?: number;
          features: string[];
          shipping_cost: number;
          return_policy: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          category?: string;
          condition?: string;
          images?: string[];
          type?: 'auction' | 'fixed';
          status?: 'active' | 'draft' | 'sold' | 'ended';
          views?: number;
          watchers?: number;
          features?: string[];
          shipping_cost?: number;
          return_policy?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      auctions: {
        Row: {
          id: string;
          product_id: string;
          current_bid: number;
          min_increment: number;
          total_bids: number;
          end_time: string;
          winner_id: string | null;
          status: 'active' | 'ended' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          current_bid: number;
          min_increment: number;
          total_bids?: number;
          end_time: string;
          winner_id?: string | null;
          status?: 'active' | 'ended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          current_bid?: number;
          min_increment?: number;
          total_bids?: number;
          end_time?: string;
          winner_id?: string | null;
          status?: 'active' | 'ended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      bids: {
        Row: {
          id: string;
          auction_id: string;
          bidder_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          auction_id: string;
          bidder_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          auction_id?: string;
          bidder_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          product_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          type: 'text' | 'offer' | 'system';
          offer_amount: number | null;
          offer_status: 'pending' | 'accepted' | 'declined' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          type: 'text' | 'offer' | 'system';
          offer_amount?: number | null;
          offer_status?: 'pending' | 'accepted' | 'declined' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          type?: 'text' | 'offer' | 'system';
          offer_amount?: number | null;
          offer_status?: 'pending' | 'accepted' | 'declined' | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          amount: number;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id: string | null;
          shipping_address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          amount: number;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id?: string | null;
          shipping_address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          amount?: number;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_payment_intent_id?: string | null;
          shipping_address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};