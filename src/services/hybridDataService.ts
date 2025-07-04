
import { supabase } from '@/integrations/supabase/client';
import { localDB } from '@/lib/localDatabase';

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
    fallbackEnabled: true,
    syncInterval: 30,
    autoSync: true
  };

  private syncTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<HybridConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  async getClients(forceSource?: DataSource): Promise<any[]> {
    const source = forceSource || this.config.preferredSource;
    
    try {
      if (source === 'cloud' || source === 'hybrid') {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }

        if (!this.config.fallbackEnabled) {
          throw error;
        }
      }

      // Fallback to local or if local is preferred
      if ((source === 'local' || this.config.fallbackEnabled) && localDB.getConnectionStatus()) {
        const result = await localDB.query('SELECT * FROM clients ORDER BY created_at DESC');
        return result.rows;
      }

      return [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (this.config.fallbackEnabled && source !== 'local') {
        return this.getClients('local');
      }
      throw error;
    }
  }

  async getTaxObligations(forceSource?: DataSource): Promise<any[]> {
    const source = forceSource || this.config.preferredSource;
    
    try {
      if (source === 'cloud' || source === 'hybrid') {
        const { data, error } = await supabase
          .from('tax_obligations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }

        if (!this.config.fallbackEnabled) {
          throw error;
        }
      }

      // Fallback to local
      if ((source === 'local' || this.config.fallbackEnabled) && localDB.getConnectionStatus()) {
        const result = await localDB.query('SELECT * FROM tax_obligations ORDER BY created_at DESC');
        return result.rows;
      }

      return [];
    } catch (error) {
      console.error('Error fetching tax obligations:', error);
      if (this.config.fallbackEnabled && source !== 'local') {
        return this.getTaxObligations('local');
      }
      throw error;
    }
  }

  async createClient(clientData: any, forceSource?: DataSource): Promise<{ success: boolean; data?: any; error?: any }> {
    const source = forceSource || this.config.preferredSource;
    
    try {
      if (source === 'cloud' || source === 'hybrid') {
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();

        if (!error && data) {
          // If hybrid, also save to local
          if (source === 'hybrid' && localDB.getConnectionStatus()) {
            await this.saveClientToLocal(data);
          }
          return { success: true, data };
        }

        if (!this.config.fallbackEnabled) {
          return { success: false, error };
        }
      }

      // Fallback to local
      if ((source === 'local' || this.config.fallbackEnabled) && localDB.getConnectionStatus()) {
        const id = crypto.randomUUID();
        const newClient = {
          ...clientData,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await this.saveClientToLocal(newClient);
        return { success: true, data: newClient };
      }

      return { success: false, error: 'No available data source' };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error };
    }
  }

  private async saveClientToLocal(client: any): Promise<void> {
    const query = `
      INSERT INTO clients (id, name, email, phone, tax_id, address, client_type, status, created_by, assigned_to, company_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        tax_id = EXCLUDED.tax_id,
        address = EXCLUDED.address,
        client_type = EXCLUDED.client_type,
        status = EXCLUDED.status,
        assigned_to = EXCLUDED.assigned_to,
        company_id = EXCLUDED.company_id,
        updated_at = EXCLUDED.updated_at
    `;
    
    await localDB.query(query, [
      client.id,
      client.name,
      client.email,
      client.phone,
      client.tax_id,
      client.address,
      client.client_type,
      client.status,
      client.created_by,
      client.assigned_to,
      client.company_id,
      client.created_at,
      client.updated_at
    ]);
  }

  async syncData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting data synchronization...');
      
      // Check both connections
      const cloudAvailable = await this.checkCloudConnection();
      const localAvailable = localDB.getConnectionStatus() || await localDB.connect();

      if (!cloudAvailable && !localAvailable) {
        return { success: false, message: 'No data sources available' };
      }

      let syncCount = 0;

      // Sync from cloud to local
      if (cloudAvailable && localAvailable) {
        const { data: cloudClients } = await supabase.from('clients').select('*');
        if (cloudClients) {
          for (const client of cloudClients) {
            await this.saveClientToLocal(client);
            syncCount++;
          }
        }
      }

      return { 
        success: true, 
        message: `Synchronized ${syncCount} records between cloud and local storage` 
      };
    } catch (error) {
      console.error('Sync error:', error);
      return { 
        success: false, 
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  private async checkCloudConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('clients').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  updateConfig(newConfig: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.autoSync && !this.syncTimer) {
      this.startAutoSync();
    } else if (!this.config.autoSync && this.syncTimer) {
      this.stopAutoSync();
    }
  }

  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.syncData().catch(console.error);
    }, this.config.syncInterval * 60 * 1000);
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  getConfig(): HybridConfig {
    return { ...this.config };
  }
}

export const hybridDataService = new HybridDataService();
