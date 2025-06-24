
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { demoDataService } from '@/services/demoDataService';

export const useTaxObligations = () => {
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isDemoMode } = useAuth();

  const fetchObligations = async () => {
    if (isDemoMode) {
      setObligations(demoDataService.getDemoTaxObligations());
      setLoading(false);
      return;
    }

    if (!user) {
      setObligations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tax_obligations')
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      return { success: false, error: 'Demo mode active' };
    }

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('tax_obligations')
        .insert([{
          ...obligationData,
          created_by: user.id
        }])
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      
      setObligations(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding obligation:', error);
      return { success: false, error };
    }
  };

  const updateObligation = async (id: string, updates: any) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot update real obligations');
      return { success: false, error: 'Demo mode active' };
    }

    try {
      const { data, error } = await supabase
        .from('tax_obligations')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      
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
      return { success: false, error: 'Demo mode active' };
    }

    try {
      const { error } = await supabase
        .from('tax_obligations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
