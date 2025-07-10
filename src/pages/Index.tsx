
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { KenyaTaxObligations } from "@/components/KenyaTaxObligations";
import { DocumentManager } from "@/components/DocumentManager";
import { TaxCalendar } from "@/components/TaxCalendar";
import { ReportGenerator } from "@/components/ReportGenerator";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SystemHealthMonitor } from "@/components/SystemHealthMonitor";
import { Settings } from "@/components/Settings";
import { UserManagement } from "@/components/UserManagement";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  console.log('Index component rendering, loading:', loading, 'user:', user);

  useEffect(() => {
    console.log('Index useEffect - loading:', loading, 'user:', user);
    
    if (!loading) {
      setIsLoading(false);
      
      if (!user) {
        console.log('No user found, redirecting to auth...');
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    console.log('Signing out...');
    await signOut();
    navigate("/auth");
  };

  if (loading || isLoading) {
    console.log('Showing loading screen');
    return <LoadingScreen message="Loading Tax Compliance Hub..." />;
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    navigate("/auth");
    return <LoadingScreen message="Redirecting to login..." />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "clients":
        return <ClientManagement />;
      case "obligations":
        return <KenyaTaxObligations />;
      case "documents":
        return <DocumentManager />;
      case "calendar":
        return <TaxCalendar />;
      case "reports":
        return <ReportGenerator />;
      case "notifications":
        return <NotificationCenter />;
      case "system-health":
        return <SystemHealthMonitor />;
      case "settings":
        return <Settings />;
      case "user-management":
        return <UserManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  console.log('Rendering main interface for user:', user.email);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tax Compliance Hub</h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === "dashboard" && "Overview and quick actions"}
                {activeTab === "clients" && "Manage your clients"}
                {activeTab === "obligations" && "Track tax obligations and deadlines"}
                {activeTab === "documents" && "Upload and manage documents"}
                {activeTab === "calendar" && "View upcoming deadlines and events"}
                {activeTab === "reports" && "Generate compliance reports"}
                {activeTab === "notifications" && "System notifications and alerts"}
                {activeTab === "system-health" && "Monitor system performance"}
                {activeTab === "settings" && "System configuration and preferences"}
                {activeTab === "user-management" && "Manage users, roles and permissions"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
