
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { demoDataService } from '@/services/demoDataService';

export const useClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isDemoMode } = useAuth();

  const fetchClients = async () => {
    if (isDemoMode) {
      setClients(demoDataService.getDemoClients(user?.email));
      setLoading(false);
      return;
    }

    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: any) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot add real clients');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding client:', error);
      return { success: false, error };
    }
  };

  const updateClient = async (id: string, updates: any) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot update real clients');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, error };
    }
  };

  const deleteClient = async (id: string) => {
    if (isDemoMode) {
      console.log('Demo mode: Cannot delete real clients');
      return { success: false, error: 'Demo mode active - changes not saved' };
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, isDemoMode]);

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};
