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

  const createNewUserProfile = (email: string, name: string): UserProfile => ({
    id: user?.id || 'new-user-id',
    name: name || email.split('@')[0],
    email: email,
    username: email.split('@')[0],
    companyName: '', // New organizations start empty
    role: 'admin', // First user in organization gets admin
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
        // First check if profile exists
        const { data: profile, error: profileError } = await supabase
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
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
          return;
        }

        if (profile) {
          // Existing user
          setUserRole({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            username: profile.username || profile.email.split('@')[0],
            companyName: profile.company_name || '',
            role: profile.user_roles?.role || 'readonly',
            department: profile.user_roles?.department || 'tax',
            permissions: profile.user_roles?.permissions || ['view_only'],
            status: profile.user_roles?.status || 'active'
          });
        } else {
          // New user - create profile
          console.log('Creating new user profile for:', user.email);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              username: user.email.split('@')[0],
              company_name: user.user_metadata?.company_name || ''
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin', // First user gets admin
              department: 'management',
              permissions: ['all'],
              status: 'active'
            });

          if (roleError) {
            console.error('Error creating user role:', roleError);
          }

          // Set the new user profile
          setUserRole(createNewUserProfile(user.email, newProfile.full_name));
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        // Fallback for new users
        if (user?.email) {
          setUserRole(createNewUserProfile(user.email, user.user_metadata?.full_name || ''));
        }
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || isDemoMode) return { success: false, error: 'Cannot update in demo mode' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          username: updates.username,
          company_name: updates.companyName
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      if (userRole) {
        setUserRole({
          ...userRole,
          name: updates.name || userRole.name,
          username: updates.username || userRole.username,
          companyName: updates.companyName || userRole.companyName
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  };

  return {
    userRole,
    loading,
    hasPermission,
    updateProfile
  };
};
