import { supabase } from '@/integrations/supabase/client';

type DataSource = 'cloud' | 'local' | 'hybrid';

interface HybridConfig {
  preferredSource: DataSource;
  fallbackEnabled: boolean;
  syncInterval: number; // in minutes
  autoSync: boolean;
}

class HybridDataService {
  private config: HybridConfig = {
    preferredSource: 'cloud',
    fallbackEnabled: false,
    syncInterval: 30,
    autoSync: false
  };

  constructor(config?: Partial<HybridConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  async getClients(forceSource?: DataSource): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getTaxObligations(forceSource?: DataSource): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tax_obligations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching tax obligations:', error);
      return [];
    }
  }

  async createClient(clientData: any, forceSource?: DataSource): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (!error && data) {
        return { success: true, data };
      }

      return { success: false, error };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error };
    }
  }

  async syncData(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Local synchronization not available in this version'
    };
  }

  updateConfig(newConfig: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): HybridConfig {
    return { ...this.config };
  }
}

export const hybridDataService = new HybridDataService();