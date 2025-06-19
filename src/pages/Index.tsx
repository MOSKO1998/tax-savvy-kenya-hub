
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { KenyaTaxObligations } from "@/components/KenyaTaxObligations";
import { TaxCalendar } from "@/components/TaxCalendar";
import { DocumentManager } from "@/components/DocumentManager";
import { NotificationCenter } from "@/components/NotificationCenter";
import { UserManagement } from "@/components/UserManagement";
import { Settings } from "@/components/Settings";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, userRole, loading, hasPermission } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && userRole) {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userRole.name} (${userRole.role})`,
      });
    }
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Tax Compliance Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tax Compliance Hub</h1>
          <p className="text-gray-600 mb-8">Please sign in to access the system</p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "clients":
        return hasPermission('client_management') || hasPermission('view_only') 
          ? <ClientManagement /> 
          : <div className="p-6 text-center text-red-600">Access Denied - Insufficient Permissions</div>;
      case "obligations":
        return hasPermission('tax_management') || hasPermission('view_only')
          ? <KenyaTaxObligations />
          : <div className="p-6 text-center text-red-600">Access Denied - Insufficient Permissions</div>;
      case "calendar":
        return <TaxCalendar />;
      case "documents":
        return hasPermission('document_view') || hasPermission('view_only')
          ? <DocumentManager />
          : <div className="p-6 text-center text-red-600">Access Denied - Insufficient Permissions</div>;
      case "notifications":
        return <NotificationCenter />;
      case "users":
        return hasPermission('user_management') || hasPermission('all')
          ? <UserManagement />
          : <div className="p-6 text-center text-red-600">Access Denied - Admin Only</div>;
      case "security":
        return hasPermission('system_settings') || hasPermission('all')
          ? <SecurityDashboard />
          : <div className="p-6 text-center text-red-600">Access Denied - Admin/IT Only</div>;
      case "settings":
        return hasPermission('system_settings') || hasPermission('all')
          ? <Settings />
          : <div className="p-6 text-center text-red-600">Access Denied - Admin/IT Only</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={userRole} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
