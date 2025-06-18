
import { useState } from "react";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ClientManagement } from "@/components/ClientManagement";
import { TaxCalendar } from "@/components/TaxCalendar";
import { DocumentManager } from "@/components/DocumentManager";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "clients":
        return <ClientManagement />;
      case "calendar":
        return <TaxCalendar />;
      case "documents":
        return <DocumentManager />;
      case "notifications":
        return <NotificationCenter />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
