
import { 
  Calendar, 
  FileText, 
  Home, 
  Users, 
  Bell,
  Settings,
  UserCog,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: any;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, permission: null },
  { id: "clients", label: "Clients", icon: Users, permission: "client_management" },
  { id: "obligations", label: "Tax Obligations", icon: Calendar, permission: "tax_management" },
  { id: "calendar", label: "Tax Calendar", icon: Calendar, permission: "tax_management" },
  { id: "documents", label: "Documents", icon: FileText, permission: "document_view" },
  { id: "notifications", label: "Notifications", icon: Bell, permission: null },
  { id: "users", label: "User Management", icon: UserCog, permission: "user_management" },
  { id: "security", label: "Security", icon: Shield, permission: "system_settings" },
  { id: "settings", label: "Settings", icon: Settings, permission: "system_settings" },
];

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    if (userRole.permissions?.includes('all')) return true;
    return userRole.permissions?.includes(permission) || userRole.permissions?.includes('view_only') || false;
  };

  const getVisibleMenuItems = () => {
    return menuItems.filter(item => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">TaxTracker</span>
        </div>
      </div>
      
      {/* User Info */}
      {userRole && (
        <div className="px-6 pb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-medium text-blue-900 text-sm">{userRole.name}</p>
            <p className="text-blue-700 text-xs">{userRole.role}</p>
            <p className="text-blue-600 text-xs">{userRole.department}</p>
          </div>
        </div>
      )}
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isDisabled = item.permission && !hasPermission(item.permission);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => !isDisabled && setActiveTab(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
