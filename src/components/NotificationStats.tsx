import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTaxObligations } from "@/hooks/useTaxObligations";

export const NotificationStats = () => {
  const [stats, setStats] = useState({
    critical: 0,
    highPriority: 0,
    unread: 0,
    completed: 0
  });
  const { isDemoMode, userRole } = useAuth();
  const { obligations } = useTaxObligations();

  useEffect(() => {
    if (isDemoMode) {
      // Demo stats
      setStats({
        critical: 2,
        highPriority: 3,
        unread: 4,
        completed: 2
      });
    } else if (userRole?.id) {
      fetchNotificationStats();
    }
  }, [isDemoMode, userRole?.id]);

  const fetchNotificationStats = async () => {
    try {
      // Get notification stats
      const { data: notifications } = await supabase
        .from('notifications')
        .select('type, read')
        .eq('user_id', userRole.id);

      if (notifications) {
        const unreadCount = notifications.filter(n => !n.read).length;
        const criticalCount = notifications.filter(n => 
          ['deadline_reminder', 'overdue'].includes(n.type) && !n.read
        ).length;
        
        // Calculate stats based on real data
        const overdueObligations = obligations.filter(o => 
          o.status === 'overdue' || 
          (o.status === 'pending' && new Date(o.due_date) < new Date())
        ).length;

        const completedObligations = obligations.filter(o => 
          o.status === 'completed'
        ).length;

        setStats({
          critical: Math.max(criticalCount, overdueObligations),
          highPriority: unreadCount,
          unread: unreadCount,
          completed: completedObligations
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      // Fallback to obligation-based stats
      const overdueCount = obligations.filter(o => 
        o.status === 'overdue' || 
        (o.status === 'pending' && new Date(o.due_date) < new Date())
      ).length;

      const completedCount = obligations.filter(o => 
        o.status === 'completed'
      ).length;

      setStats({
        critical: overdueCount,
        highPriority: obligations.filter(o => o.status === 'pending').length,
        unread: 0,
        completed: completedCount
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.highPriority}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          <div className="text-sm text-gray-600">Unread</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </CardContent>
      </Card>
    </div>
  );
};
