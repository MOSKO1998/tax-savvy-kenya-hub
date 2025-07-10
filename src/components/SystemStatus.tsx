
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Users, FileText, Calendar, Bell, Settings, BarChart3, Activity } from "lucide-react";

export const SystemStatus = () => {
  const systemModules = [
    {
      name: "Dashboard Overview",
      status: "operational",
      description: "Main dashboard with statistics and quick actions",
      icon: BarChart3
    },
    {
      name: "Client Management",
      status: "operational",
      description: "Add, edit, and manage client information",
      icon: Users
    },
    {
      name: "Tax Obligations",
      status: "operational",
      description: "Track and manage tax deadlines and obligations",
      icon: FileText
    },
    {
      name: "Document Manager",
      status: "operational",
      description: "Upload and organize tax documents",
      icon: FileText
    },
    {
      name: "Tax Calendar",
      status: "operational",
      description: "Calendar view of tax deadlines and events",
      icon: Calendar
    },
    {
      name: "Report Generator",
      status: "operational",
      description: "Generate compliance and tax reports",
      icon: BarChart3
    },
    {
      name: "Notification Center",
      status: "operational",
      description: "System notifications and alerts",
      icon: Bell
    },
    {
      name: "System Health Monitor",
      status: "operational",
      description: "Monitor system performance and health",
      icon: Activity
    },
    {
      name: "User Management",
      status: "operational",
      description: "Manage users, roles, and permissions",
      icon: Users
    },
    {
      name: "Settings",
      status: "operational",
      description: "System configuration and preferences",
      icon: Settings
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
        <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
      </div>

      <div className="grid gap-4">
        {systemModules.map((module) => {
          const StatusIcon = getStatusIcon(module.status);
          const ModuleIcon = module.icon;
          
          return (
            <Card key={module.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ModuleIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(module.status)}`} />
                    {getStatusBadge(module.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
