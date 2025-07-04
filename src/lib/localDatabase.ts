
import { Pool } from 'pg';

interface LocalDBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class LocalDatabaseManager {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor(private config: LocalDBConfig) {}

  async connect(): Promise<boolean> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      console.log('Local database connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to local database:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool || !this.isConnected) {
      throw new Error('Database not connected');
    }
    
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const localDB = new LocalDatabaseManager({
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: parseInt(process.env.LOCAL_DB_PORT || '5432'),
  database: process.env.LOCAL_DB_NAME || 'tax_compliance_hub',
  user: process.env.LOCAL_DB_USER || 'tax_admin',
  password: process.env.LOCAL_DB_PASSWORD || 'tax_secure_2024',
});

export { LocalDatabaseManager };
