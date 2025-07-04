
import { supabase } from '@/integrations/supabase/client';
import { localDB } from '@/lib/localDatabase';

interface ExportOptions {
  includeClients: boolean;
  includeTaxObligations: boolean;
  includeDocuments: boolean;
  includeNotifications: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

class DataExportService {
  async exportToLocal(options: ExportOptions): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('Starting data export to local database...');
      
      // Check local database connection
      if (!localDB.getConnectionStatus()) {
        const connected = await localDB.connect();
        if (!connected) {
          return { success: false, message: 'Failed to connect to local database' };
        }
      }

      const stats = {
        clients: 0,
        taxObligations: 0,
        documents: 0,
        notifications: 0
      };

      // Export clients
      if (options.includeClients) {
        const { data: clients, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (clients && clients.length > 0) {
          for (const client of clients) {
            await this.insertOrUpdateClient(client);
            stats.clients++;
          }
        }
      }

      // Export tax obligations
      if (options.includeTaxObligations) {
        let query = supabase
          .from('tax_obligations')
          .select('*')
          .order('created_at', { ascending: false });

        if (options.dateRange) {
          query = query
            .gte('due_date', options.dateRange.from)
            .lte('due_date', options.dateRange.to);
        }

        const { data: obligations, error } = await query;

        if (error) throw error;

        if (obligations && obligations.length > 0) {
          for (const obligation of obligations) {
            await this.insertOrUpdateTaxObligation(obligation);
            stats.taxObligations++;
          }
        }
      }

      // Export documents
      if (options.includeDocuments) {
        const { data: documents, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (documents && documents.length > 0) {
          for (const document of documents) {
            await this.insertOrUpdateDocument(document);
            stats.documents++;
          }
        }
      }

      // Export notifications
      if (options.includeNotifications) {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (options.dateRange) {
          query = query
            .gte('created_at', options.dateRange.from)
            .lte('created_at', options.dateRange.to);
        }

        const { data: notifications, error } = await query;

        if (error) throw error;

        if (notifications && notifications.length > 0) {
          for (const notification of notifications) {
            await this.insertOrUpdateNotification(notification);
            stats.notifications++;
          }
        }
      }

      return {
        success: true,
        message: 'Data exported successfully',
        stats
      };

    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async insertOrUpdateClient(client: any): Promise<void> {
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

  private async insertOrUpdateTaxObligation(obligation: any): Promise<void> {
    const query = `
      INSERT INTO tax_obligations (id, title, description, tax_type, due_date, amount, status, client_id, created_by, assigned_to, completed_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        tax_type = EXCLUDED.tax_type,
        due_date = EXCLUDED.due_date,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        client_id = EXCLUDED.client_id,
        assigned_to = EXCLUDED.assigned_to,
        completed_at = EXCLUDED.completed_at,
        updated_at = EXCLUDED.updated_at
    `;
    
    await localDB.query(query, [
      obligation.id,
      obligation.title,
      obligation.description,
      obligation.tax_type,
      obligation.due_date,
      obligation.amount,
      obligation.status,
      obligation.client_id,
      obligation.created_by,
      obligation.assigned_to,
      obligation.completed_at,
      obligation.created_at,
      obligation.updated_at
    ]);
  }

  private async insertOrUpdateDocument(document: any): Promise<void> {
    const query = `
      INSERT INTO documents (id, title, description, document_type, file_path, file_size, mime_type, client_id, obligation_id, uploaded_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        document_type = EXCLUDED.document_type,
        file_path = EXCLUDED.file_path,
        file_size = EXCLUDED.file_size,
        mime_type = EXCLUDED.mime_type,
        client_id = EXCLUDED.client_id,
        obligation_id = EXCLUDED.obligation_id,
        updated_at = EXCLUDED.updated_at
    `;
    
    await localDB.query(query, [
      document.id,
      document.title,
      document.description,
      document.document_type,
      document.file_path,
      document.file_size,
      document.mime_type,
      document.client_id,
      document.obligation_id,
      document.uploaded_by,
      document.created_at,
      document.updated_at
    ]);
  }

  private async insertOrUpdateNotification(notification: any): Promise<void> {
    const query = `
      INSERT INTO notifications (id, user_id, title, message, type, read, data, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        type = EXCLUDED.type,
        read = EXCLUDED.read,
        data = EXCLUDED.data
    `;
    
    await localDB.query(query, [
      notification.id,
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.read,
      JSON.stringify(notification.data),
      notification.created_at
    ]);
  }

  async importFromLocal(options: ExportOptions): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('Starting data import from local database...');
      
      if (!localDB.getConnectionStatus()) {
        const connected = await localDB.connect();
        if (!connected) {
          return { success: false, message: 'Failed to connect to local database' };
        }
      }

      const stats = {
        clients: 0,
        taxObligations: 0,
        documents: 0,
        notifications: 0
      };

      // Import clients
      if (options.includeClients) {
        const result = await localDB.query('SELECT * FROM clients ORDER BY created_at DESC');
        for (const client of result.rows) {
          await this.syncClientToSupabase(client);
          stats.clients++;
        }
      }

      // Import tax obligations
      if (options.includeTaxObligations) {
        let query = 'SELECT * FROM tax_obligations ORDER BY created_at DESC';
        const params: string[] = [];
        
        if (options.dateRange) {
          query += ' WHERE due_date >= $1 AND due_date <= $2';
          params.push(options.dateRange.from, options.dateRange.to);
        }

        const result = await localDB.query(query, params);
        for (const obligation of result.rows) {
          await this.syncTaxObligationToSupabase(obligation);
          stats.taxObligations++;
        }
      }

      return {
        success: true,
        message: 'Data imported successfully',
        stats
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async syncClientToSupabase(client: any): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .upsert({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        tax_id: client.tax_id,
        address: client.address,
        client_type: client.client_type,
        status: client.status,
        created_by: client.created_by,
        assigned_to: client.assigned_to,
        company_id: client.company_id,
        created_at: client.created_at,
        updated_at: client.updated_at
      });

    if (error) throw error;
  }

  private async syncTaxObligationToSupabase(obligation: any): Promise<void> {
    const { error } = await supabase
      .from('tax_obligations')
      .upsert({
        id: obligation.id,
        title: obligation.title,
        description: obligation.description,
        tax_type: obligation.tax_type,
        due_date: obligation.due_date,
        amount: obligation.amount,
        status: obligation.status,
        client_id: obligation.client_id,
        created_by: obligation.created_by,
        assigned_to: obligation.assigned_to,
        completed_at: obligation.completed_at,
        created_at: obligation.created_at,
        updated_at: obligation.updated_at
      });

    if (error) throw error;
  }
}

export const dataExportService = new DataExportService();
