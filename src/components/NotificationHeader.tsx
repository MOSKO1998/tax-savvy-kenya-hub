
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Settings } from "lucide-react";

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader = ({ unreadCount }: NotificationHeaderProps) => {
  return (
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
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>
    </div>
  );
};
