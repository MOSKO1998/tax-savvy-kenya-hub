
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { KenyaTaxObligations } from "@/components/KenyaTaxObligations";
import { DocumentManager } from "@/components/DocumentManager";
import { TaxCalendar } from "@/components/TaxCalendar";
import { ReportGenerator } from "@/components/ReportGenerator";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SystemHealth } from "@/components/SystemHealth";
import { Settings } from "@/components/Settings";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clients':
        setActiveTab('clients');
        break;
      case 'obligations':
        setActiveTab('obligations');
        break;
      case 'documents':
        setActiveTab('documents');
        break;
      case 'tax-calendar':
      case 'calendar':
        setActiveTab('calendar');
        break;
      case 'reports':
        setActiveTab('reports');
        break;
      case 'notifications':
        setActiveTab('notifications');
        break;
      case 'settings':
        setActiveTab('settings');
        break;
      case 'system-health':
        setActiveTab('system-health');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderActiveTab = () => {
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

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
