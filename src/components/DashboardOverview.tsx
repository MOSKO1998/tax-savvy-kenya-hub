
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActions } from "@/components/QuickActions";
import { SystemHealthMonitor } from "@/components/SystemHealthMonitor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { demoDataService } from "@/services/demoDataService";
import { 
  Users, 
  Calendar, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock
} from "lucide-react";

interface DashboardOverviewProps {
  onQuickAction?: (action: string) => void;
  userRole?: any;
}

export const DashboardOverview = ({ onQuickAction, userRole }: DashboardOverviewProps) => {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeObligations: 0,
    overdueTasks: 0,
    completedThisMonth: 0,
    totalRevenue: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      fetchDemoStats();
    } else {
      fetchDashboardStats();
    }
  }, [isDemoMode]);

  const fetchDemoStats = () => {
    const demoClients = demoDataService.getDemoClients();
    const demoObligations = demoDataService.getDemoTaxObligations();
    const demoDocuments = demoDataService.getDemoDocuments();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const activeObligations = demoObligations.filter(o => o.status === 'pending').length;
    const overdueTasks = demoObligations.filter(o => 
      o.status === 'pending' && new Date(o.due_date) < now
    ).length;
    
    const completedThisMonth = demoObligations.filter(o => 
      o.status === 'completed' && 
      o.completed_at &&
      new Date(o.completed_at).getMonth() === currentMonth &&
      new Date(o.completed_at).getFullYear() === currentYear
    ).length;

    const totalRevenue = demoObligations.reduce((sum, o) => 
      sum + (o.amount || 0), 0
    );

    setStats({
      totalClients: demoClients.length,
      activeObligations,
      overdueTasks,
      completedThisMonth,
      totalRevenue,
      pendingDocuments: demoDocuments.length
    });
    setLoading(false);
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Fetch tax obligations
      const { data: obligations } = await supabase
        .from('tax_obligations')
        .select('*');

      // Fetch documents count
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const activeObligations = obligations?.filter(o => o.status === 'pending').length || 0;
      const overdueTasks = obligations?.filter(o => 
        o.status === 'pending' && new Date(o.due_date) < now
      ).length || 0;
      
      const completedThisMonth = obligations?.filter(o => 
        o.status === 'completed' && 
        o.completed_at &&
        new Date(o.completed_at).getMonth() === currentMonth &&
        new Date(o.completed_at).getFullYear() === currentYear
      ).length || 0;

      const totalRevenue = obligations?.reduce((sum, o) => 
        sum + (parseFloat(o.amount?.toString() || '0') || 0), 0
      ) || 0;

      setStats({
        totalClients: clientsCount || 0,
        activeObligations,
        overdueTasks,
        completedThisMonth,
        totalRevenue,
        pendingDocuments: documentsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">
            Welcome back, {userRole?.name || 'User'}! 
            {isDemoMode && (
              <span className="text-blue-600 font-medium"> - Demo Mode</span>
            )}
            {userRole?.companyName && !isDemoMode && (
              <span className="text-blue-600 font-medium"> - {userRole.companyName}</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/0ef251d1-5854-45d3-87ec-f84e8e6b8846.png" 
            alt="Chandaria Shah & Associates" 
            className="h-12 w-12 object-contain"
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-600">Chandaria Shah & Associates</p>
            <p className="text-xs text-gray-500">Tax Compliance Platform</p>
            {isDemoMode && (
              <p className="text-xs text-orange-500 font-medium">Demo Mode Active</p>
            )}
          </div>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-semibold text-orange-800">Demo Mode Active</h3>
              <p className="text-xs text-orange-700">
                You're viewing demo data for Chandaria Shah & Associates. Sign up to access your own account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalClients}</p>
                <p className="text-sm text-blue-700">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">{stats.activeObligations}</p>
                <p className="text-sm text-green-700">Active Obligations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{stats.overdueTasks}</p>
                <p className="text-sm text-red-700">Overdue Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.completedThisMonth}</p>
                <p className="text-sm text-purple-700">Completed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-orange-700">Total Tax Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-900">{stats.pendingDocuments}</p>
                <p className="text-sm text-indigo-700">Documents Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} userRole={userRole} />

      {/* System Health Monitor */}
      <SystemHealthMonitor />
    </div>
  );
};
