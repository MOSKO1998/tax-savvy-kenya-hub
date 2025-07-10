
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  message: string;
  lastChecked: Date;
}

export const HealthCheck = () => {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    const statuses: HealthStatus[] = [];

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      statuses.push({
        service: 'Database',
        status: error ? 'unhealthy' : 'healthy',
        message: error ? `Connection failed: ${error.message}` : 'Connected successfully',
        lastChecked: new Date()
      });
    } catch (error) {
      statuses.push({
        service: 'Database',
        status: 'unhealthy',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date()
      });
    }

    // Check authentication
    try {
      const { data: { session } } = await supabase.auth.getSession();
      statuses.push({
        service: 'Authentication',
        status: 'healthy',
        message: session ? 'User authenticated' : 'No active session',
        lastChecked: new Date()
      });
    } catch (error) {
      statuses.push({
        service: 'Authentication',
        status: 'warning',
        message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date()
      });
    }

    // Check application status
    statuses.push({
      service: 'Application',
      status: 'healthy',
      message: 'React application running',
      lastChecked: new Date()
    });

    setHealthStatuses(statuses);
    setIsLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: 'healthy' | 'unhealthy' | 'warning') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'unhealthy' | 'warning') => {
    const variants = {
      healthy: 'default',
      unhealthy: 'destructive',
      warning: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>System Health Check</CardTitle>
          <CardDescription>
            Monitor the health of application services
          </CardDescription>
        </div>
        <Button
          onClick={checkHealth}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthStatuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div>
                  <div className="font-medium">{status.service}</div>
                  <div className="text-sm text-muted-foreground">
                    {status.message}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(status.status)}
                <div className="text-xs text-muted-foreground">
                  {status.lastChecked.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
