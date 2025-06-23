
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { monitorFailedLogins, monitorSuccessfulLogin } = useSecurityMonitor();

  // Demo user data
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if it's demo mode
          if (session.user.email === 'demo@chandariashah.com') {
            setIsDemoMode(true);
            setUserRole(createDemoUser());
          } else {
            setIsDemoMode(false);
            // Monitor successful login
            monitorSuccessfulLogin(session.user.id);
            
            // Fetch user role and profile data with timeout
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
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
                
                if (profile) {
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
      // Handle demo login
      if (email === 'demo@chandariashah.com' && password === 'demo123') {
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
        
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        monitorFailedLogins(email);
      }
      
      return { error };
    } catch (error) {
      monitorFailedLogins(email);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, metadata: any = {}) => {
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
    return { error };
  };

  const signOut = async () => {
    if (isDemoMode) {
      // Handle demo logout
      setUser(null);
      setSession(null);
      setUserRole(null);
      setIsDemoMode(false);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsDemoMode(false);
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
