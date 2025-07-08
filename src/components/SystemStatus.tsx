
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Cloud, HardDrive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { localDB } from '@/lib/localDatabase';
import { nextcloudService } from '@/services/nextcloudService';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'checking';
  supabase: 'connected' | 'disconnected' | 'checking';
  nextcloud: 'connected' | 'disconnected' | 'checking';
  localStorage: 'available' | 'unavailable';
}

export const SystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'checking',
    supabase: 'checking',
    nextcloud: 'checking',
    localStorage: 'available'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkSystemStatus = async () => {
    setIsChecking(true);
    
    // Check local database
    try {
      const dbConnected = await localDB.connect();
      setStatus(prev => ({ ...prev, database: dbConnected ? 'connected' : 'disconnected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'disconnected' }));
    }

    // Check Supabase
    try {
      const { data, error } = await supabase.from('clients').select('id').limit(1);
      setStatus(prev => ({ ...prev, supabase: error ? 'disconnected' : 'connected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, supabase: 'disconnected' }));
    }

    // Check Nextcloud
    try {
      const result = await nextcloudService.testConnection();
      setStatus(prev => ({ ...prev, nextcloud: result.success ? 'connected' : 'disconnected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, nextcloud: 'disconnected' }));
    }

    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setStatus(prev => ({ ...prev, localStorage: 'available' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, localStorage: 'unavailable' }));
    }

    setLastCheck(new Date());
    setIsChecking(false);
  };

  useEffect(() => {
    checkSystemStatus();
    
    // Auto-check every 5 minutes
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'disconnected':
      case 'unavailable':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Disconnected</Badge>;
      case 'checking':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Checking...</Badge>;
      default:
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>
          Current status of all system components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Local Database</span>
            </div>
            {getStatusBadge(status.database)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="font-medium">Supabase Cloud</span>
            </div>
            {getStatusBadge(status.supabase)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="font-medium">Nextcloud Storage</span>
            </div>
            {getStatusBadge(status.nextcloud)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="font-medium">Local Storage</span>
            </div>
            {getStatusBadge(status.localStorage)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : 'Never checked'}
          </div>
          <Button 
            onClick={checkSystemStatus} 
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
