
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  timestamp: string;
}

export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unhealthy',
    checks: {
      database: false,
      auth: false,
      storage: false
    },
    timestamp: new Date().toISOString()
  });

  const checkHealth = async () => {
    const checks = {
      database: false,
      auth: false,
      storage: false
    };

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      checks.database = !dbError;

      // Check auth service
      const { error: authError } = await supabase.auth.getSession();
      checks.auth = !authError;

      // Check storage (if available)
      try {
        const { error: storageError } = await supabase.storage.listBuckets();
        checks.storage = !storageError;
      } catch {
        checks.storage = false;
      }

    } catch (error) {
      console.error('Health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(check => check);
    
    setHealth({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    });

    return health;
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { health, checkHealth };
};

// Simple health endpoint component
export const HealthEndpoint = () => {
  const { health } = useHealthCheck();
  
  // This would typically be served at /health endpoint
  if (typeof window !== 'undefined' && window.location.pathname === '/health') {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px' }}>
        <h1>Health Check</h1>
        <p>Status: {health.status.toUpperCase()}</p>
        <p>Timestamp: {health.timestamp}</p>
        <h2>Service Checks:</h2>
        <ul>
          <li>Database: {health.checks.database ? '✅ OK' : '❌ FAIL'}</li>
          <li>Authentication: {health.checks.auth ? '✅ OK' : '❌ FAIL'}</li>
          <li>Storage: {health.checks.storage ? '✅ OK' : '❌ FAIL'}</li>
        </ul>
      </div>
    );
  }

  return null;
};
