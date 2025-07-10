
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthCoreContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthCoreContext = createContext<AuthCoreContextType | undefined>(undefined);

export const useAuthCore = () => {
  const context = useContext(AuthCoreContext);
  if (context === undefined) {
    throw new Error('useAuthCore must be used within an AuthCoreProvider');
  }
  return context;
};

const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('lovable.app') ||
                     window.location.hostname.includes('127.0.0.1');

export const AuthCoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (!mounted) return;
        
        console.log('Initial session:', session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email === 'demo@chandariashah.com') {
          setIsDemoMode(true);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email === 'demo@chandariashah.com') {
          setIsDemoMode(true);
        } else {
          setIsDemoMode(false);
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Handle demo login without creating invalid UUID
      if (email === 'demo@chandariashah.com' && password === 'demo123') {
        console.log('Demo login detected, using regular Supabase auth');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in result:', { data, error });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, metadata: any = {}) => {
    try {
      console.log('Attempting sign up for:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: metadata.username || fullName.toLowerCase().replace(/\s+/g, '_'),
            company_name: metadata.company_name || 'Default Company',
          },
        },
      });
      
      console.log('Sign up result:', { data, error });
      
      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setIsDemoMode(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isDemoMode,
    signIn,
    signUp,
    signOut,
  };

  return <AuthCoreContext.Provider value={value}>{children}</AuthCoreContext.Provider>;
};
