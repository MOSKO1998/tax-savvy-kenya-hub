
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email === 'demo@chandariashah.com' && isDevelopment) {
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
        
        console.log('Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email === 'demo@chandariashah.com' && isDevelopment) {
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
      if (isDevelopment && email === 'demo@chandariashah.com' && password === 'demo123') {
        const mockUser = {
          id: 'demo-user-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'demo@chandariashah.com',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: { 
            full_name: 'Demo User',
            company_name: 'Chandaria Shah & Associates'
          },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        const mockSession = {
          user: mockUser,
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: 'bearer'
        } as Session;

        setSession(mockSession);
        setUser(mockUser);
        setIsDemoMode(true);
        
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, metadata: any = {}) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: metadata.username,
            company_name: metadata.company_name,
          },
        },
      });
      
      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if (isDemoMode) {
        setUser(null);
        setSession(null);
        setIsDemoMode(false);
        return;
      }
      
      await supabase.auth.signOut();
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
