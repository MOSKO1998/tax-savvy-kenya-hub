
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Filter,
  MarkAsRead,
  Settings
} from "lucide-react";

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "document":
      case "approval":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "high-priority") return ["critical", "high"].includes(notification.priority);
    if (filter === "deadlines") return ["deadline", "overdue"].includes(notification.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <MarkAsRead className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: "Unread" },
              { id: "high-priority", label: "High Priority" },
              { id: "deadlines", label: "Deadlines" }
            ].map((filterOption) => (
              <Button
                key={filterOption.id}
                variant={filter === filterOption.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.id)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all hover:shadow-md ${
              !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.client && (
                        <p className="text-xs text-gray-500 mt-1">
                          Client: {notification.client}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          Mark as Read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-gray-600">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-sm text-gray-600">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">2</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
