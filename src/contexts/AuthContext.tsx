import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user && session.user.id !== lastUserId.current) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    const fetchProfile = async (userId: string, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (error) throw error;
          setProfile(data || null);
          lastUserId.current = userId;
          return;
        } catch (error) {
          console.error('Error in fetchProfile:', (error as Error).message);
          if (i === retries - 1) {
            setProfile(null);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && session.user.id !== lastUserId.current) {
        setLoading(true);
        await fetchProfile(session.user.id);
        setLoading(false);
      } else if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata: { full_name: string; user_type: string }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          user_type: metadata.user_type
        }
      }
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    lastUserId.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
