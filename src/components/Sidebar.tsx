
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
    <div className="w-64 bg-gradient-to-b from-blue-50 to-white border-r border-blue-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-blue-200">
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/lovable-uploads/0ef251d1-5854-45d3-87ec-f84e8e6b8846.png" 
            alt="Chandaria Shah & Associates" 
            className="h-16 w-16 object-contain"
          />
          <div className="text-center">
            <h2 className="font-bold text-blue-600 text-sm">Chandaria Shah</h2>
            <p className="text-xs text-gray-600">& Associates</p>
            <p className="text-xs text-blue-500 font-medium mt-1">Tax Compliance Hub</p>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      {userRole && (
        <div className="px-6 py-4 border-b border-blue-100">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="font-medium text-blue-900 text-sm">{userRole.name}</p>
            <p className="text-blue-700 text-xs">{userRole.role}</p>
            <p className="text-blue-600 text-xs">{userRole.department}</p>
          </div>
        </div>
      )}
      
      <nav className="flex-1 px-4 py-4">
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
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">© 2024 Chandaria Shah & Associates</p>
          <p className="text-xs text-blue-600">Professional Tax Services</p>
        </div>
      </div>
    </div>
  );
};
