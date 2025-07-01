
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Database, 
  Wifi, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthMetrics {
  database: 'healthy' | 'warning' | 'error';
  authentication: 'healthy' | 'warning' | 'error';
  users: number;
  clients: number;
  obligations: number;
  documents: number;
  lastUpdated: Date;
}

export const SystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      const healthData: SystemHealthMetrics = {
        database: 'healthy',
        authentication: 'healthy',
        users: 0,
        clients: 0,
        obligations: 0,
        documents: 0,
        lastUpdated: new Date()
      };

      // Check database connectivity
      try {
        const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        healthData.database = dbError ? 'error' : 'healthy';
      } catch (error) {
        healthData.database = 'error';
      }

      // Check authentication
      try {
        const { data: { session } } = await supabase.auth.getSession();
        healthData.authentication = session ? 'healthy' : 'warning';
      } catch (error) {
        healthData.authentication = 'error';
      }

      // Get counts
      if (hasPermission('view_reports') || hasPermission('all')) {
        try {
          const [
            { count: usersCount },
            { count: clientsCount },
            { count: obligationsCount },
            { count: documentsCount }
          ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('clients').select('*', { count: 'exact', head: true }),
            supabase.from('tax_obligations').select('*', { count: 'exact', head: true }),
            supabase.from('documents').select('*', { count: 'exact', head: true })
          ]);

          healthData.users = usersCount || 0;
          healthData.clients = clientsCount || 0;
          healthData.obligations = obligationsCount || 0;
          healthData.documents = documentsCount || 0;
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      }

      setMetrics(healthData);
    } catch (error) {
      console.error('Error checking system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [hasPermission]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Server className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!hasPermission('view_reports') && !hasPermission('all')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to view system health metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Monitor system status and performance</p>
        </div>
        <Button onClick={checkSystemHealth} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {metrics && (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">Database</p>
                      <p className="text-sm text-gray-600">Connection status</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metrics.database)}
                    <Badge className={getStatusColor(metrics.database)}>
                      {metrics.database}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold">Authentication</p>
                      <p className="text-sm text-gray-600">Auth service status</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metrics.authentication)}
                    <Badge className={getStatusColor(metrics.authentication)}>
                      {metrics.authentication}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics.users}</p>
                <p className="text-sm text-gray-600">Users</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics.clients}</p>
                <p className="text-sm text-gray-600">Clients</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics.obligations}</p>
                <p className="text-sm text-gray-600">Obligations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Server className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{metrics.documents}</p>
                <p className="text-sm text-gray-600">Documents</p>
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 text-center">
                Last updated: {metrics.lastUpdated.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading system health metrics...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
