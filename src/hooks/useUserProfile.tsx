
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthCore } from './useAuthCore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  companyName: string;
  role: string;
  department: string;
  permissions: string[];
  status: string;
}

export const useUserProfile = () => {
  const { user, isDemoMode } = useAuthCore();
  const [userRole, setUserRole] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const createDemoUser = (): UserProfile => ({
    id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@chandariashah.com',
    username: 'demo',
    companyName: 'Chandaria Shah & Associates',
    role: 'admin',
    department: 'management',
    permissions: ['all'],
    status: 'active'
  });

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      return;
    }

    if (isDemoMode) {
      setUserRole(createDemoUser());
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
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
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

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
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, isDemoMode]);

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    if (userRole.permissions?.includes('all')) return true;
    return userRole.permissions?.includes(permission) || false;
  };

  return {
    userRole,
    loading,
    hasPermission,
  };
};
