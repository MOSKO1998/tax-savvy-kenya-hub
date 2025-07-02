
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityMonitor } from './useSecurityMonitor';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: any | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Security: Environment-based demo mode toggle
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('lovable.app') ||
                     window.location.hostname.includes('127.0.0.1');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { monitorFailedLogins, monitorSuccessfulLogin } = useSecurityMonitor();

  // Demo user data - only available in development
  const createDemoUser = () => {
    const demoUser = {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@chandariashah.com',
      username: 'demo',
      companyName: 'Chandaria Shah & Associates',
      role: 'admin',
      department: 'management',
      permissions: ['all'],
      status: 'active'
    };
    return demoUser;
  };

  // Security: Password strength validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  // Security: Rate limiting check
  const checkRateLimit = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        user_identifier: email,
        max_attempts: 5,
        window_minutes: 15
      });
      
      if (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }
      
      return data;
    } catch (error) {
      console.error('Rate limit check exception:', error);
      return true; // Allow on error
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Security: Check if it's demo mode (only in development)
          if (isDevelopment && session.user.email === 'demo@chandariashah.com') {
            console.log('Demo mode activated (development only)');
            setIsDemoMode(true);
            setUserRole(createDemoUser());
          } else {
            setIsDemoMode(false);
            // Monitor successful login
            monitorSuccessfulLogin(session.user.id);
            
            // Fetch user role and profile data with timeout
            setTimeout(async () => {
              try {
                console.log('Fetching user profile for:', session.user.id);
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select(`
                    *,
                    user_roles (
                      role,
                      department,
                      status,
                      permissions
                    )
                  `)
                  .eq('id', session.user.id)
                  .single();
                
                if (error) {
                  console.error('Error fetching user profile:', error);
                } else if (profile) {
                  console.log('User profile loaded:', profile);
                  setUserRole({
                    id: profile.id,
                    name: profile.full_name,
                    email: profile.email,
                    username: profile.username,
                    companyName: profile.company_name,
                    role: profile.user_roles?.role || 'readonly',
                    department: profile.user_roles?.department || 'tax',
                    permissions: profile.user_roles?.permissions || ['view_only'],
                    status: profile.user_roles?.status || 'active'
                  });
                }
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            }, 0);
          }
        } else {
          setUserRole(null);
          setIsDemoMode(false);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Security: Check rate limiting
      const rateLimitOk = await checkRateLimit(email);
      if (!rateLimitOk) {
        return { error: { message: 'Too many login attempts. Please try again in 15 minutes.' } };
      }
      
      // Security: Handle demo login (only in development)
      if (isDevelopment && email === 'demo@chandariashah.com' && password === 'demo123') {
        // Create a properly structured mock user for demo mode
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
        setUserRole(createDemoUser());
        setLoading(false);
        
        console.log('Demo login successful (development only)');
        return { error: null };
      }

      // Security: Block demo login in production
      if (!isDevelopment && email === 'demo@chandariashah.com') {
        return { error: { message: 'Demo access is not available in production environment.' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        monitorFailedLogins(email);
      } else {
        console.log('Sign in successful for:', email);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      monitorFailedLogins(email);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, metadata: any = {}) => {
    try {
      console.log('Attempting sign up for:', email, 'with metadata:', metadata);
      
      // Security: Validate password strength
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        return { error: { message: 'Password requirements not met: ' + passwordErrors.join(', ') } };
      }

      // Security: Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { error: { message: 'Please enter a valid email address.' } };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: metadata.username,
            company_name: metadata.company_name,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful for:', email);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      
      if (isDemoMode) {
        // Handle demo logout
        setUser(null);
        setSession(null);
        setUserRole(null);
        setIsDemoMode(false);
        console.log('Demo logout successful');
        return;
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsDemoMode(false);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    if (userRole.permissions?.includes('all')) return true;
    return userRole.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    isDemoMode,
    signIn,
    signUp,
    signOut,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
