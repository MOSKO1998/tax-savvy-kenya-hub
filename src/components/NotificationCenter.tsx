
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import { NotificationStats } from "./NotificationStats";

export const NotificationCenter = () => {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "deadline",
      title: "VAT Return Due Tomorrow",
      message: "ABC Manufacturing Ltd VAT return is due tomorrow (Jan 20, 2024)",
      timestamp: "2024-01-19 09:00",
      read: false,
      priority: "high",
      client: "ABC Manufacturing Ltd"
    },
    {
      id: 2,
      type: "overdue",
      title: "PAYE Return Overdue",
      message: "XYZ Services Ltd PAYE return was due yesterday. Penalties may apply.",
      timestamp: "2024-01-19 08:30",
      read: false,
      priority: "critical",
      client: "XYZ Services Ltd"
    },
    {
      id: 3,
      type: "document",
      title: "Document Uploaded",
      message: "Financial statements uploaded for Kenya Exports Co.",
      timestamp: "2024-01-18 16:45",
      read: true,
      priority: "low",
      client: "Kenya Exports Co."
    },
    {
      id: 4,
      type: "reminder",
      title: "Weekly Review Reminder",
      message: "Time for your weekly client compliance review",
      timestamp: "2024-01-18 14:00",
      read: false,
      priority: "medium",
      client: null
    },
    {
      id: 5,
      type: "approval",
      title: "Document Approved",
      message: "Corporation tax computation approved for Kenya Exports Co.",
      timestamp: "2024-01-18 11:20",
      read: true,
      priority: "low",
      client: "Kenya Exports Co."
    },
    {
      id: 6,
      type: "deadline",
      title: "Corporation Tax Due Soon",
      message: "Kenya Exports Co. corporation tax due in 7 days (Jan 25, 2024)",
      timestamp: "2024-01-18 09:00",
      read: false,
      priority: "medium",
      client: "Kenya Exports Co."
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "high-priority") return ["critical", "high"].includes(notification.priority);
    if (filter === "deadlines") return ["deadline", "overdue"].includes(notification.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
            <p className="text-gray-500">No notifications found for the selected filter.</p>
          </CardContent>
        </Card>
      )}

      <NotificationStats />
    </div>
  );
};
