
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Server, Wifi, AlertCircle, CheckCircle } from "lucide-react";

interface SystemHealth {
  database: 'online' | 'offline' | 'slow';
  nextcloud: 'online' | 'offline' | 'error';
  api: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
}

export const SystemHealthMonitor = () => {
  const [health, setHealth] = useState<SystemHealth>({
    database: 'online',
    nextcloud: 'online',
    api: 'healthy',
    lastChecked: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    try {
      // Simulate health checks - in real app, these would be actual API calls
      const dbStatus = Math.random() > 0.1 ? 'online' : 'slow';
      const nextcloudStatus = Math.random() > 0.05 ? 'online' : 'error';
      const apiStatus = Math.random() > 0.08 ? 'healthy' : 'degraded';

      setHealth({
        database: dbStatus,
        nextcloud: nextcloudStatus,
        api: apiStatus,
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'slow':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'error':
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return CheckCircle;
      case 'slow':
      case 'degraded':
        return AlertCircle;
      case 'offline':
      case 'error':
      case 'down':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <Badge className={getStatusColor(health.database)}>
              {health.database}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Nextcloud</span>
            </div>
            <Badge className={getStatusColor(health.nextcloud)}>
              {health.nextcloud}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">API</span>
            </div>
            <Badge className={getStatusColor(health.api)}>
              {health.api}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Last checked: {health.lastChecked.toLocaleTimeString()}
          {isLoading && <span className="ml-2 animate-pulse">Checking...</span>}
        </div>
      </CardContent>
    </Card>
  );
};
