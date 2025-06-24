
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  userRole?: any;
}

export const Header = ({ userRole }: HeaderProps) => {
  const { signOut, isDemoMode } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Don't fetch notifications for demo users
    if (isDemoMode || !userRole?.id) {
      // Set demo notifications for demo mode
      if (isDemoMode) {
        const demoNotifications = [
          {
            id: 'demo-1',
            title: 'Welcome to Demo Mode',
            message: 'You are currently viewing demo data',
            type: 'system_alert',
            read: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            title: 'Tax Deadline Reminder',
            message: 'VAT return due in 5 days',
            type: 'deadline_reminder',
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
      }
      return;
    }

    let channel: any = null;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userRole.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    const subscribeToNotifications = () => {
      channel = supabase
        .channel(`notifications-${userRole.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userRole.id}`
          },
          (payload) => {
            console.log('Notification update:', payload);
            fetchNotifications();
          }
        )
        .subscribe();
    };

    fetchNotifications();
    subscribeToNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userRole?.id, isDemoMode]);

  const markAsRead = async (notificationId: string) => {
    if (isDemoMode) {
      // Handle demo mode locally
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline_reminder':
        return '⏰';
      case 'system_alert':
        return '🔔';
      case 'document_uploaded':
        return '📄';
      case 'compliance_update':
        return '📋';
      default:
        return '📌';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/26146ce5-9226-4721-877a-24eb240daffe.png" 
              alt="Chandaria Shah & Associates" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                Tax Compliance Hub
              </h1>
              <p className="text-xs text-gray-500">Chandaria Shah & Associates</p>
            </div>
          </div>
          {userRole?.companyName && (
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
              {userRole.companyName}
            </Badge>
          )}
          {isDemoMode && (
            <Badge variant="secondary" className="text-orange-600 border-orange-600 bg-orange-50">
              Demo Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userRole?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userRole?.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole?.role} - {userRole?.department}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
