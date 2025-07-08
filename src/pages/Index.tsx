
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TestComponent } from "@/components/TestComponent";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index component rendering, loading:', loading, 'user:', user);

  useEffect(() => {
    console.log('Index useEffect - loading:', loading, 'user:', user);
    
    // Simulate some loading time to see if components render
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    if (!loading && !user) {
      console.log('No user found, redirecting to auth...');
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || isLoading) {
    console.log('Showing loading screen');
    return <LoadingScreen message="Loading Tax Compliance Hub..." />;
  }

  if (!user) {
    console.log('No user, showing test component');
    return <TestComponent />;
  }

  console.log('Rendering main interface');
  return <TestComponent />;
};

export default Index;
