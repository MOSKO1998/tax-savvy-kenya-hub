
import { ReactNode } from 'react';
import { AuthCoreProvider, useAuthCore } from './useAuthCore';
import { useUserProfile } from './useUserProfile';
import { useSecurityMonitor } from './useSecurityMonitor';

interface AuthContextType {
  user: any;
  session: any;
  userRole: any;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useAuth = (): AuthContextType => {
  const authCore = useAuthCore();
  const { userRole, hasPermission } = useUserProfile();
  
  return {
    ...authCore,
    userRole,
    hasPermission,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthCoreProvider>
      {children}
    </AuthCoreProvider>
  );
};
