
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Bell, 
  BarChart3, 
  LogOut,
  Upload,
  Activity,
  UserCog,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export const Sidebar = ({ activeTab, setActiveTab, className }: SidebarProps) => {
  const { signOut, userRole, hasPermission } = useAuth();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: null,
      description: "Overview and analytics"
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      permission: "view_clients",
      description: "Manage client information"
    },
    {
      id: "obligations",
      label: "Tax Obligations",
      icon: FileText,
      permission: "view_obligations",
      description: "Track tax deadlines and obligations"
    },
    {
      id: "documents",
      label: "Documents",
      icon: Upload,
      permission: "view_documents",
      description: "Upload and manage documents"
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      permission: "view_calendar",
      description: "View deadlines and events"
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      permission: "view_reports",
      description: "Generate compliance reports"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      permission: null,
      description: "System alerts and updates"
    },
    {
      id: "system-health",
      label: "System Health",
      icon: Activity,
      permission: "view_reports",
      description: "Monitor system performance"
    },
    {
      id: "user-management",
      label: "User Management",
      icon: UserCog,
      permission: "user_management",
      description: "Manage users and roles"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      permission: "manage_settings",
      description: "System configuration"
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission) || hasPermission('all')
  );

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-gray-900">Tax Compliance</h2>
                <p className="text-xs text-gray-600">Hub</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-12 group relative",
                isActive && "bg-blue-50 text-blue-700 border-blue-200",
                isCollapsed ? "px-2" : "px-3"
              )}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
              {!isCollapsed && item.id === "notifications" && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
              {isCollapsed && item.id === "notifications" && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && userRole && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">{userRole.name}</p>
            <p className="text-xs text-gray-600">{userRole.email}</p>
            <Badge variant="outline" className="mt-1">
              {userRole.role}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn("w-full justify-start", isCollapsed && "px-2")}
          onClick={signOut}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};
