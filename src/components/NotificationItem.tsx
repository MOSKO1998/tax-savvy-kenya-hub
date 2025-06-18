
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
  client: string | null;
}

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
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

  return (
    <Card 
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
  );
};
