
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useNotifications } from "@/hooks/useNotifications";
import { QuickActions } from "./QuickActions";
import { format } from "date-fns";

interface DashboardOverviewProps {
  onQuickAction: (action: string) => void;
  userRole: any;
}

export const DashboardOverview = ({ onQuickAction, userRole }: DashboardOverviewProps) => {
  const { user } = useAuth();
  const { clients } = useClients();
  const { obligations } = useTaxObligations();
  const { unreadCount } = useNotifications();

  // Calculate real-time statistics
  const totalClients = clients.length;
  const totalObligations = obligations.length;
  const pendingObligations = obligations.filter(o => o.status === 'pending').length;
  const overdueObligations = obligations.filter(o => {
    const dueDate = new Date(o.due_date);
    return o.status === 'pending' && dueDate < new Date();
  }).length;
  const completedObligations = obligations.filter(o => o.status === 'completed').length;

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = obligations.filter(o => {
    const dueDate = new Date(o.due_date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return o.status === 'pending' && dueDate >= today && dueDate <= nextWeek;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Calculate total amounts
  const totalAmountDue = obligations
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Active Obligations",
      value: pendingObligations,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: `${overdueObligations} overdue`,
      changeType: overdueObligations > 0 ? "negative" : "neutral"
    },
    {
      title: "Completed This Month",
      value: completedObligations,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Amount Due (KES)",
      value: `${totalAmountDue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "This month",
      changeType: "neutral"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your tax compliance overview for today
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => onQuickAction('notifications')}
            className="relative"
          >
            <Badge className="absolute -top-2 -right-2 bg-red-500">
              {unreadCount}
            </Badge>
            View Notifications
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions onAction={onQuickAction} userRole={userRole} />
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Deadlines</span>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onQuickAction('tax-calendar')}
              >
                View Calendar
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming deadlines in the next 7 days</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => onQuickAction('obligations')}
                  >
                    Add Tax Obligation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.slice(0, 5).map((obligation) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(obligation.due_date).getTime() - new Date().getTime()) / 
                      (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={obligation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{obligation.title}</h4>
                          <p className="text-sm text-gray-600">
                            {obligation.clients?.name || 'No client assigned'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {format(new Date(obligation.due_date), "PPP")}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={daysUntilDue <= 2 ? "destructive" : "default"}
                            className={daysUntilDue <= 2 ? "" : "bg-orange-100 text-orange-800"}
                          >
                            {daysUntilDue === 0 ? 'Due Today' : 
                             daysUntilDue === 1 ? 'Due Tomorrow' : 
                             `${daysUntilDue} days`}
                          </Badge>
                          {daysUntilDue <= 2 && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {upcomingDeadlines.length > 5 && (
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => onQuickAction('tax-calendar')}
                    >
                      View {upcomingDeadlines.length - 5} more deadlines
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obligations.slice(0, 3).map((obligation) => (
              <div key={obligation.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  obligation.status === 'completed' ? 'bg-green-100' :
                  obligation.status === 'pending' ? 'bg-orange-100' :
                  'bg-red-100'
                }`}>
                  <FileText className={`h-4 w-4 ${
                    obligation.status === 'completed' ? 'text-green-600' :
                    obligation.status === 'pending' ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{obligation.title}</h4>
                  <p className="text-sm text-gray-600">
                    {obligation.clients?.name || 'No client'} • {obligation.tax_type.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {format(new Date(obligation.created_at), "PPP")}
                  </p>
                </div>
                <Badge className={
                  obligation.status === 'completed' ? 'bg-green-100 text-green-800' :
                  obligation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }>
                  {obligation.status}
                </Badge>
              </div>
            ))}
            {obligations.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => onQuickAction('obligations')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
