
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  FolderOpen,
  Bell,
  BarChart3,
  UserCheck,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: any;
}

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, hasPermission, isDemoMode } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      permission: null,
      badge: null
    },
    {
      id: "clients",
      name: "Clients",
      icon: Users,
      permission: "client_management",
      badge: null
    },
    {
      id: "obligations",
      name: "Tax Obligations",
      icon: FileText,
      permission: "tax_management",
      badge: null
    },
    {
      id: "calendar",
      name: "Tax Calendar",
      icon: Calendar,
      permission: null,
      badge: null
    },
    {
      id: "documents",
      name: "Documents",
      icon: FolderOpen,
      permission: "document_view",
      badge: null
    },
    {
      id: "reports",
      name: "Reports",
      icon: BarChart3,
      permission: "tax_management",
      badge: "New"
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      permission: null,
      badge: null
    }
  ];

  const adminItems = [
    {
      id: "users",
      name: "User Management",
      icon: UserCheck,
      permission: "user_management"
    },
    {
      id: "security",
      name: "Security Dashboard",
      icon: Shield,
      permission: "system_settings"
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      permission: "system_settings"
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const isAccessible = (permission: string | null) => {
    if (!permission) return true;
    return hasPermission(permission) || hasPermission('view_only') || isDemoMode;
  };

  const isAdminAccessible = (permission: string) => {
    return hasPermission(permission) || hasPermission('all');
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">CS&A Hub</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && userRole && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {userRole.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userRole.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userRole.role} - {userRole.department}
              </p>
            </div>
          </div>
          {isDemoMode && (
            <Badge variant="secondary" className="mt-2 text-orange-600 border-orange-600 bg-orange-50">
              Demo Mode
            </Badge>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const accessible = isAccessible(item.permission);
            
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  collapsed ? 'px-2' : 'px-3'
                } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => accessible && setActiveTab(item.id)}
                disabled={!accessible}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>

        {/* Admin Section */}
        {adminItems.some(item => isAdminAccessible(item.permission)) && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            {!collapsed && (
              <p className="text-xs font-medium text-gray-500 mb-2 px-3">ADMINISTRATION</p>
            )}
            <div className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const accessible = isAdminAccessible(item.permission);
                
                if (!accessible) return null;
                
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      collapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
            collapsed ? 'px-2' : 'px-3'
          }`}
          onClick={handleSignOut}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};
