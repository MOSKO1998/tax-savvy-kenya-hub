import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Activity
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export const Sidebar = ({ activeTab, setActiveTab, className }: SidebarProps) => {
  const { signOut, userRole, hasPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: null
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      permission: "view_clients"
    },
    {
      id: "obligations",
      label: "Tax Obligations",
      icon: FileText,
      permission: "view_obligations"
    },
    {
      id: "documents",
      label: "Documents",
      icon: Upload,
      permission: "view_documents"
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      permission: "view_calendar"
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
      permission: null
    },
    {
      id: "system-health",
      label: "System Health",
      icon: Activity,
      permission: "view_reports"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      permission: "manage_settings"
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission) || hasPermission('all')
  );

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-4">
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
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                isActive && "bg-blue-50 text-blue-700 border-blue-200",
                isCollapsed && "px-2"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.label}
              {!isCollapsed && item.id === "notifications" && (
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
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
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};
