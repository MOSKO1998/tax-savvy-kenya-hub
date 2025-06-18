
import { Card, CardContent } from "@/components/ui/card";

export const NotificationStats = () => {
  return (
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
  );
};
