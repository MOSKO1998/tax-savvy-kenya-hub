
import { Bell, Search, Settings, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { CSABrand } from "./CSABrand";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header = ({ setSidebarOpen, onNotificationClick, onSettingsClick }: HeaderProps) => {
  const { user, signOut, isDemoMode, userRole } = useAuth();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <CSABrand />
          {isDemoMode && (
            <Badge variant="secondary" className="text-orange-600 border-orange-600 bg-orange-50">
              Demo Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {userRole?.name || user?.email || 'Guest'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
