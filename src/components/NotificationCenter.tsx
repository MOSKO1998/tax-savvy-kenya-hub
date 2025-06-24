
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import { NotificationStats } from "./NotificationStats";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { demoDataService } from "@/services/demoDataService";

export const NotificationCenter = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, userRole } = useAuth();

  useEffect(() => {
    if (isDemoMode) {
      // Use demo notifications
      setNotifications(demoDataService.getDemoNotifications());
      setLoading(false);
    } else if (userRole?.id) {
      // Fetch real notifications from Supabase
      fetchNotifications();
    }
  }, [isDemoMode, userRole?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userRole.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "high-priority") return ["critical", "high"].includes(notification.priority);
    if (filter === "deadlines") return ["deadline", "overdue", "deadline_reminder"].includes(notification.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationHeader unreadCount={unreadCount} />
      <NotificationFilters filter={filter} setFilter={setFilter} />

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all" ? "No notifications" : "No notifications found"}
            </h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? isDemoMode 
                  ? "You're in demo mode. Real notifications will appear when you have a live account."
                  : "You'll receive notifications here when there are updates or deadlines."
                : "No notifications found for the selected filter."
              }
            </p>
          </CardContent>
        </Card>
      )}

      <NotificationStats />
    </div>
  );
};
