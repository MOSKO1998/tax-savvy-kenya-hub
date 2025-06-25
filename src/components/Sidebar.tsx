import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
  BarChart3,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { CSABrand } from "./CSABrand";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: any;
}

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission, isDemoMode } = useAuth();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: "view_dashboard"
    },
    {
      id: "clients",
      label: "Client Management",
      icon: Users,
      permission: "manage_clients"
    },
    {
      id: "tax-calendar",
      label: "Tax Calendar",
      icon: Calendar,
      permission: "view_calendar"
    },
    {
      id: "documents",
      label: "Document Manager",
      icon: FileText,
      permission: "manage_documents"
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      permission: "view_reports"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      permission: "view_notifications",
      badge: 3
    }
  ];

  const adminItems = [
    {
      id: "users",
      label: "User Management",
      icon: Users,
      permission: "manage_users"
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      permission: "manage_companies"
    },
    {
      id: "security",
      label: "Security Dashboard",
      icon: Shield,
      permission: "view_security"
    },
    {
      id: "system-health",
      label: "System Health",
      icon: Settings,
      permission: "view_system"
    }
  ];

  const bottomItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      permission: "view_settings"
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      permission: "view_help"
    }
  ];

  const hasAdminPermissions = hasPermission('all') || userRole?.role === 'admin';

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <CSABrand showFullName={true} />
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">Demo</Badge>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Main
              </h3>
            )}
            {navigationItems.map((item) => {
              if (!hasPermission(item.permission) && !hasPermission('all')) return null;
              
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${collapsed ? 'px-3' : 'px-3'}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">
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
          {hasAdminPermissions && (
            <div className="space-y-1 pt-4">
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Administration
                </h3>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${collapsed ? 'px-3' : 'px-3'}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          if (!hasPermission(item.permission) && !hasPermission('all')) return null;
          
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${collapsed ? 'px-3' : 'px-3'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {userRole?.name || 'User'}
            </p>
            <p className="text-gray-500 capitalize">
              {userRole?.role || 'readonly'} • {userRole?.department || 'tax'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
