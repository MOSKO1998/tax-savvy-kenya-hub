
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";

export const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Clients",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Obligations",
      value: "15",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Due This Week",
      value: "3",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Overdue",
      value: "1",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "VAT Return submitted for ABC Ltd",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      action: "PAYE deadline reminder sent",
      time: "4 hours ago",
      status: "pending"
    },
    {
      id: 3,
      action: "New client XYZ Corp added",
      time: "1 day ago",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">VAT Return - ABC Ltd</p>
                  <p className="text-xs text-red-600">Due: Tomorrow</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">PAYE - Multiple Clients</p>
                  <p className="text-xs text-orange-600">Due: In 3 days</p>
                </div>
                <Badge variant="secondary">Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Corporate Tax - XYZ Corp</p>
                  <p className="text-xs text-blue-600">Due: Next week</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">Add Client</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">New Obligation</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-2">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Schedule Task</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center space-y-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
