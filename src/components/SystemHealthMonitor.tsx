
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/components/SystemStatus";
import { HealthCheck } from "@/components/HealthCheck";
import { Activity, Server, Database, Wifi, RefreshCw } from "lucide-react";

export const SystemHealthMonitor = () => {
  const [systemHealth, setSystemHealth] = useState({
    overall: "healthy",
    database: "connected",
    api: "operational",
    storage: "available",
    lastChecked: new Date()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshHealth = async () => {
    setIsRefreshing(true);
    // Simulate health check
    setTimeout(() => {
      setSystemHealth({
        ...systemHealth,
        lastChecked: new Date()
      });
      setIsRefreshing(false);
    }, 2000);
  };

  const healthMetrics = [
    {
      name: "Database Connection",
      status: systemHealth.database,
      icon: Database,
      value: "Connected"
    },
    {
      name: "API Services",
      status: systemHealth.api,
      icon: Server,
      value: "Operational"
    },
    {
      name: "Network Status",
      status: "connected",
      icon: Wifi,
      value: "Online"
    },
    {
      name: "System Load",
      status: "normal",
      icon: Activity,
      value: "Normal"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
          <p className="text-gray-600">Monitor system performance and status</p>
        </div>
        <Button 
          onClick={refreshHealth} 
          disabled={isRefreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">Healthy</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Checked */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Health Check</span>
            <span className="text-sm font-medium">
              {systemHealth.lastChecked.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Health Check */}
      <HealthCheck />

      {/* System Status */}
      <SystemStatus />
    </div>
  );
};
