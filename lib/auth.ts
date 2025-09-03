
'use client';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
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
}

export const signUp = async (email: string, password: string, userData: {
  firstName: string;
  lastName: string;
  accountType: 'buyer' | 'seller';
}) => {
  console.log('Starting signup process...');
  
  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Signup error:', error);
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned from signup');
  }

  console.log('Auth user created:', data.user.id);

  // Wait a moment for auth to process
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create profile immediately
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        first_name: userData.firstName,
        last_name: userData.lastName,
        account_type: userData.accountType,
        verified: true,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw here, let the user continue and create profile later
    } else {
      console.log('Profile created successfully');
    }
  } catch (err) {
    console.error('Profile creation failed:', err);
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  console.log('Starting signin process...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Signin error:', error);
    throw error;
  }

  console.log('Signin successful:', data.user?.email);
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    
    console.log('Profile fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('Profile fetch error:', err);
    return null;
  }
};

export const createOrUpdateProfile = async (userId: string, email: string, userData: {
  firstName: string;
  lastName: string;
  accountType: 'buyer' | 'seller';
}): Promise<UserProfile | null> => {
  try {
    // First try to get existing profile
    const existingProfile = await getUserProfile(userId);
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        account_type: userData.accountType,
        verified: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return null;
    }

    console.log('Profile created successfully:', data);
    return data;
  } catch (err) {
    console.error('Create/update profile error:', err);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return data;
};
