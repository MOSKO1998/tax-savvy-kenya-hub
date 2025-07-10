
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { demoDataService } from '@/services/demoDataService';

export const useTaxObligations = () => {
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isDemoMode } = useAuth();

  useEffect(() => {
    fetchObligations();
  }, [user, isDemoMode]);

  const fetchObligations = async () => {
    setLoading(true);
    
    if (isDemoMode) {
      console.log('Demo mode: Loading sample obligations');
      setObligations(demoDataService.getDemoObligations(user?.email));
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('No user authenticated, clearing obligations');
      setObligations([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching tax obligations for user:', user.id);
      
      const { data, error } = await supabase
        .from('tax_obligations')
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tax obligations:', error);
        throw error;
      }
      
      console.log('Tax obligations fetched successfully:', data?.length || 0, 'records');
      setObligations(data || []);
    } catch (error) {
      console.error('Error fetching tax obligations:', error);
      setObligations([]);
    } finally {
      setLoading(false);
    }
  };

  const addObligation = async (obligationData: any) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot add real obligations');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('Adding new tax obligation:', obligationData);
      
      const { data, error } = await supabase
        .from('tax_obligations')
        .insert([{
          ...obligationData,
          created_by: user.id,
          due_date: obligationData.due_date.toISOString().split('T')[0]
        }])
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error adding obligation:', error);
        throw error;
      }
      
      console.log('Tax obligation added successfully:', data);
      setObligations(prev => [...prev, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding obligation:', error);
      return { success: false, error };
    }
  };

  const updateObligation = async (id: string, updates: any) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot update real obligations');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    try {
      console.log('Updating tax obligation:', id, updates);
      
      const updateData = {
        ...updates,
        due_date: updates.due_date instanceof Date 
          ? updates.due_date.toISOString().split('T')[0] 
          : updates.due_date
      };
      
      const { data, error } = await supabase
        .from('tax_obligations')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating obligation:', error);
        throw error;
      }
      
      console.log('Tax obligation updated successfully:', data);
      setObligations(prev => prev.map(obligation => 
        obligation.id === id ? data : obligation
      ));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating obligation:', error);
      return { success: false, error };
    }
  };

  const deleteObligation = async (id: string) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot delete real obligations');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    try {
      console.log('Deleting tax obligation:', id);
      
      const { error } = await supabase
        .from('tax_obligations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting obligation:', error);
        throw error;
      }
      
      console.log('Tax obligation deleted successfully');
      setObligations(prev => prev.filter(obligation => obligation.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting obligation:', error);
      return { success: false, error };
    }
  };

  return {
    obligations,
    loading,
    addObligation,
    updateObligation,
    deleteObligation,
    refetch: fetchObligations
  };
};
