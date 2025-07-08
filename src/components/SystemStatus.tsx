
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Cloud, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemCheck {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  icon: React.ComponentType<any>;
}

export const SystemStatus = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runSystemChecks = async () => {
    setIsLoading(true);
    const newChecks: SystemCheck[] = [];

    // Database Connection Check
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      newChecks.push({
        name: 'Database Connection',
        status: 'success',
        message: 'Connected to Supabase successfully',
        icon: Database
      });
    } catch (error) {
      newChecks.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Failed to connect to database',
        icon: Database
      });
    }

    // Nextcloud Connection Check
    try {
      const nextcloudUrl = import.meta.env.VITE_NEXTCLOUD_URL || 'https://cloud.audit.ke';
      const response = await fetch(`${nextcloudUrl}/status.php`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        newChecks.push({
          name: 'Nextcloud Connection',
          status: 'success',
          message: 'Nextcloud server is accessible',
          icon: Cloud
        });
      } else {
        throw new Error('Server not accessible');
      }
    } catch (error) {
      newChecks.push({
        name: 'Nextcloud Connection',
        status: 'warning',
        message: 'Nextcloud server check failed - may work in production',
        icon: Cloud
      });
    }

    // Environment Variables Check
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length === 0) {
      newChecks.push({
        name: 'Environment Configuration',
        status: 'success',
        message: 'All required environment variables are set',
        icon: Server
      });
    } else {
      newChecks.push({
        name: 'Environment Configuration',
        status: 'error',
        message: `Missing variables: ${missingVars.join(', ')}`,
        icon: Server
      });
    }

    setChecks(newChecks);
    setIsLoading(false);
  };

  useEffect(() => {
    runSystemChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Status</h2>
        <Button 
          onClick={runSystemChecks} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {checks.map((check, index) => {
          const IconComponent = check.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <IconComponent className="h-4 w-4" />
                  {check.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(check.status)}
                  {getStatusIcon(check.status)}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{check.message}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {checks.some(check => check.status === 'error') && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some system components are not working properly. Please check your configuration and network connectivity.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Application Version:</span>
            <span className="text-sm">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Environment:</span>
            <span className="text-sm">{import.meta.env.MODE}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Build Time:</span>
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
