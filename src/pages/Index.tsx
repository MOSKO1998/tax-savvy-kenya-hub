
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { TaxCalendar } from "@/components/TaxCalendar";
import { KenyaTaxObligations } from "@/components/KenyaTaxObligations";
import { DocumentManager } from "@/components/DocumentManager";
import { ReportGenerator } from "@/components/ReportGenerator";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SystemHealth } from "@/components/SystemHealth";
import { Settings } from "@/components/Settings";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TestComponent } from "@/components/TestComponent";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index component rendering, loading:', loading, 'user:', user);

  useEffect(() => {
    console.log('Index useEffect - loading:', loading, 'user:', user);
    if (!loading && !user) {
      console.log('Redirecting to auth...');
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleNotificationClick = () => {
    setActiveTab("notifications");
  };

  const handleSettingsClick = () => {
    setActiveTab("settings");
  };

  const handleQuickAction = (action: string) => {
    setActiveTab(action);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onQuickAction={handleQuickAction} userRole={userRole} />;
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
        return <SystemHealth />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardOverview onQuickAction={handleQuickAction} userRole={userRole} />;
    }
  };

  if (loading) {
    console.log('Showing loading screen');
    return <LoadingScreen message="Initializing Tax Compliance Hub..." />;
  }

  if (!user) {
    console.log('No user, showing loading screen before redirect');
    return <LoadingScreen message="Redirecting to login..." />;
  }

  console.log('Rendering main app interface');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            className="fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto"
          />
        </div>
        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            setSidebarOpen={setSidebarOpen} 
            onNotificationClick={handleNotificationClick}
            onSettingsClick={handleSettingsClick}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
