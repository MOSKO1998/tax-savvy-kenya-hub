
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  FileText,
  AlertTriangle
} from "lucide-react";

export const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Clients",
      value: "127",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Upcoming Deadlines",
      value: "23",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Overdue Tasks",
      value: "5",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Completed This Month",
      value: "89",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const upcomingDeadlines = [
    {
      client: "ABC Manufacturing Ltd",
      task: "VAT Return Filing",
      dueDate: "2024-01-20",
      status: "pending",
      priority: "high"
    },
    {
      client: "XYZ Services Ltd",
      task: "PAYE Return",
      dueDate: "2024-01-22",
      status: "in-progress",
      priority: "medium"
    },
    {
      client: "Kenya Exports Co.",
      task: "Corporation Tax",
      dueDate: "2024-01-25",
      status: "pending",
      priority: "high"
    },
    {
      client: "Tech Solutions Ltd",
      task: "Withholding Tax",
      dueDate: "2024-01-28",
      status: "pending",
      priority: "low"
    }
  ];

  const recentActivities = [
    {
      action: "Filed VAT return",
      client: "ABC Manufacturing Ltd",
      time: "2 hours ago",
      user: "John Kamau"
    },
    {
      action: "Uploaded financial statements",
      client: "XYZ Services Ltd",
      time: "4 hours ago",
      user: "Mary Wanjiku"
    },
    {
      action: "Completed PAYE calculation",
      client: "Kenya Exports Co.",
      time: "1 day ago",
      user: "Peter Mwangi"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{deadline.client}</p>
                    <p className="text-sm text-gray-600">{deadline.task}</p>
                    <p className="text-xs text-gray-500">Due: {deadline.dueDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={deadline.priority === 'high' ? 'destructive' : 
                              deadline.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {deadline.priority}
                    </Badge>
                    <Badge variant="outline">
                      {deadline.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">Client: {activity.client}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VAT Returns</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">PAYE Returns</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Corporation Tax</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
