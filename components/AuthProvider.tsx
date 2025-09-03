
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserProfile, createOrUpdateProfile, UserProfile } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (currentUser: User) => {
    try {
      console.log('Loading profile for user:', currentUser.id);
      
      let userProfile = await getUserProfile(currentUser.id);
      
      // If no profile exists, try to create one with basic info
      if (!userProfile && currentUser.email) {
        console.log('No profile found, creating basic profile...');
        userProfile = await createOrUpdateProfile(currentUser.id, currentUser.email, {
          firstName: currentUser.email.split('@')[0],
          lastName: '',
          accountType: 'buyer'
        });
      }
      
      if (userProfile) {
        setProfile(userProfile);
        console.log('Profile loaded:', userProfile);
      } else {
        console.log('Could not load or create profile');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Found session for user:', session.user.email);
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          console.log('No session found');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setLoading(true);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut: handleSignOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
