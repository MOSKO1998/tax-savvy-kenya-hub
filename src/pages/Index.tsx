
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { TaxCalendar } from "@/components/TaxCalendar";
import { DocumentManager } from "@/components/DocumentManager";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Settings } from "@/components/Settings";
import { UserManagement } from "@/components/UserManagement";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, userRole, loading, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-7 w-7 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Compliance Hub</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your dashboard</p>
          <Button onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "clients":
        if (!hasPermission("client_management") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <ClientManagement />;
      case "calendar":
        if (!hasPermission("tax_management") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <TaxCalendar />;
      case "documents":
        if (!hasPermission("document_view") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <DocumentManager />;
      case "notifications":
        return <NotificationCenter />;
      case "users":
        if (!hasPermission("user_management")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <UserManagement />;
      case "settings":
        if (!hasPermission("system_settings") && !hasPermission("all")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={userRole}
        hasPermission={hasPermission}
      />
      <div className="flex-1 flex flex-col">
        <Header currentUser={userRole} onLogout={handleLogout} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
