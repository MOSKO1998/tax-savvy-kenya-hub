
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuickActions } from "@/components/QuickActions";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  DollarSign
} from "lucide-react";

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview = ({ setActiveTab }: DashboardOverviewProps) => {
  const { userRole } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const { obligations, loading: obligationsLoading } = useTaxObligations();
  const { unreadCount } = useNotifications();

  const totalClients = clients?.length || 0;
  const totalObligations = obligations?.length || 0;
  const pendingObligations = obligations?.filter(o => o.status === 'pending')?.length || 0;
  const overdueObligations = obligations?.filter(o => o.status === 'overdue')?.length || 0;
  const completedObligations = obligations?.filter(o => o.status === 'completed')?.length || 0;

  const totalAmount = obligations?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

  const quickStats = [
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      loading: clientsLoading,
      onClick: () => setActiveTab("clients")
    },
    {
      title: "Tax Obligations",
      value: totalObligations.toString(),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading: obligationsLoading,
      onClick: () => setActiveTab("obligations")
    },
    {
      title: "Pending Tasks",
      value: pendingObligations.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      loading: obligationsLoading,
      onClick: () => setActiveTab("obligations")
    },
    {
      title: "Overdue Items",
      value: overdueObligations.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      loading: obligationsLoading,
      onClick: () => setActiveTab("obligations")
    }
  ];

  const recentObligations = obligations?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back, {userRole?.name || 'User'}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole?.role || 'User'} - {userRole?.department || 'General'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tax Obligations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tax Obligations</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("obligations")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {obligationsLoading ? (
                <p className="text-gray-500">Loading obligations...</p>
              ) : recentObligations.length > 0 ? (
                recentObligations.map((obligation) => (
                  <div key={obligation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{obligation.title}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(obligation.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {obligation.amount && (
                        <span className="text-sm font-medium text-gray-900">
                          KES {obligation.amount.toLocaleString()}
                        </span>
                      )}
                      <Badge 
                        variant={
                          obligation.status === 'completed' ? 'default' :
                          obligation.status === 'overdue' ? 'destructive' : 'secondary'
                        }
                      >
                        {obligation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent obligations</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Obligations</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{completedObligations}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unread Notifications</span>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">{unreadCount}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => setActiveTab("system-health")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View System Health
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={setActiveTab} userRole={userRole} />
    </div>
  );
};
