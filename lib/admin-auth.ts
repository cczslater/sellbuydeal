
'use client';
import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export const adminLogin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    console.log('Admin login attempt for:', email);
    
    // Query admin users table with provided credentials
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single();

    console.log('Database query result:', { data, error });

    if (error) {
      console.error('Admin user fetch error:', error);
      return null;
    }

    if (!data) {
      console.log('No admin user found with provided credentials');
      return null;
    }

    console.log('Admin user found:', data.name);

    // Update last login timestamp (non-blocking)
    setTimeout(async () => {
      try {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (updateError) {
          console.warn('Could not update last login:', updateError);
        } else {
          console.log('Last login updated successfully');
        }
      } catch (updateError) {
        console.warn('Error updating last login:', updateError);
      }
    }, 100);

    console.log('Admin login successful for:', data.name);
    return data;
  } catch (error) {
    console.error('Admin login unexpected error:', error);
    return null;
  }
};

export const getCurrentAdmin = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  
  const adminData = localStorage.getItem('admin_user');
  if (!adminData) return null;
  
  try {
    const admin = JSON.parse(adminData);
    console.log('Retrieved admin from localStorage:', admin?.name);
    return admin;
  } catch (error) {
    console.error('Error parsing admin data from localStorage:', error);
    localStorage.removeItem('admin_user');
    return null;
  }
};

export const setCurrentAdmin = (admin: AdminUser): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('admin_user', JSON.stringify(admin));
    console.log('Admin user saved to localStorage:', admin.name);
  } catch (error) {
    console.error('Error saving admin to localStorage:', error);
  }
};

export const clearCurrentAdmin = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_user');
  console.log('Admin user cleared from localStorage');
};

export const isAdminAuthenticated = (): boolean => {
  const admin = getCurrentAdmin();
  const isAuth = admin !== null && admin.is_active;
  console.log('Admin authentication check:', isAuth, admin?.name);
  return isAuth;
};
