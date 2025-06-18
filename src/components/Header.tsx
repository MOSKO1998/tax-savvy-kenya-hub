
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User,
  LogOut,
  Shield,
  Calendar as CalendarIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentUser?: any;
  onLogout?: () => void;
}

export const Header = ({ currentUser, onLogout }: HeaderProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800";
      case "Tax Staff": return "bg-blue-100 text-blue-800";
      case "Readonly": return "bg-gray-100 text-gray-800";
      case "IT": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin": return Shield;
      case "Tax Staff": return CalendarIcon;
      case "Readonly": return User;
      case "IT": return Shield;
      default: return User;
    }
  };

  const RoleIcon = currentUser ? getRoleIcon(currentUser.role) : User;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-2">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(currentUser.role)}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {currentUser.role}
                      </Badge>
                      <Badge variant="outline">
                        {currentUser.department}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Security</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
