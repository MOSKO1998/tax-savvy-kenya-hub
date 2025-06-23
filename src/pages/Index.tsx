
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
import { Login } from "@/components/Login";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, userRole, loading, hasPermission, isDemoMode } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && userRole) {
      if (isDemoMode) {
        toast({
          title: "Demo Mode Active!",
          description: "You're viewing demo data for Chandaria Shah & Associates",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${userRole.name} (${userRole.role})`,
        });
        
        // Show readonly notification for new users
        if (userRole.role === 'readonly') {
          toast({
            title: "Readonly Access",
            description: "Contact your administrator for editing permissions",
            variant: "default",
          });
        }
      }
    }
  }, [user, userRole, isDemoMode]);

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
    return <Login />;
  }

  const handleQuickAction = (action: string) => {
    setActiveTab(action);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onQuickAction={handleQuickAction} userRole={userRole} />;
      case "clients":
        return hasPermission('client_management') || hasPermission('view_only') || isDemoMode
          ? <ClientManagement /> 
          : <div className="p-6 text-center text-red-600">Access Denied - Insufficient Permissions</div>;
      case "obligations":
        return hasPermission('tax_management') || hasPermission('view_only') || isDemoMode
          ? <KenyaTaxObligations />
          : <div className="p-6 text-center text-red-600">Access Denied - Insufficient Permissions</div>;
      case "calendar":
        return <TaxCalendar />;
      case "documents":
        return hasPermission('document_view') || hasPermission('view_only') || isDemoMode
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
        return <DashboardOverview onQuickAction={handleQuickAction} userRole={userRole} />;
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
