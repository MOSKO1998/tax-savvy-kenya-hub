
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useAuth();
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

  if (loading || isLoading) {
    console.log('Showing loading screen');
    return <LoadingScreen message="Loading Tax Compliance Hub..." />;
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    navigate("/auth");
    return <LoadingScreen message="Redirecting to login..." />;
  }

  console.log('Rendering main interface for user:', user.email);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tax Compliance Hub</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" && <DashboardOverview />}
          {activeTab !== "dashboard" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
