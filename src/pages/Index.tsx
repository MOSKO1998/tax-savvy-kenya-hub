
import { useState } from "react";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { TaxCalendar } from "@/components/TaxCalendar";
import { DocumentManager } from "@/components/DocumentManager";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Settings } from "@/components/Settings";
import { UserManagement } from "@/components/UserManagement";
import { Login } from "@/components/Login";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  permissions: string[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // Check if user has permission to access a feature
  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.permissions.includes("all")) return true;
    return currentUser.permissions.includes(permission);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview currentUser={currentUser} />;
      case "clients":
        if (!hasPermission("client_management") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <ClientManagement currentUser={currentUser} />;
      case "calendar":
        if (!hasPermission("tax_management") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <TaxCalendar currentUser={currentUser} />;
      case "documents":
        if (!hasPermission("document_view") && !hasPermission("view_only")) {
          return <div className="text-center py-12">
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>;
        }
        return <DocumentManager currentUser={currentUser} />;
      case "notifications":
        return <NotificationCenter currentUser={currentUser} />;
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
        return <Settings currentUser={currentUser} />;
      default:
        return <DashboardOverview currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        hasPermission={hasPermission}
      />
      <div className="flex-1 flex flex-col">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
