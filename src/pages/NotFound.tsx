
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="text-6xl font-bold text-gray-400 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Looking for something specific?</p>
            <div className="space-y-2 text-sm">
              <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Manage Clients
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/obligations')} className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Tax Obligations
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/documents')} className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Document Manager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
