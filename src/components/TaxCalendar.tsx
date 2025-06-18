
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  AlertCircle
} from "lucide-react";

export const TaxCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // January 2024

  const taxEvents = [
    {
      date: 9,
      title: "PAYE Returns Due",
      type: "monthly",
      status: "upcoming",
      clients: ["ABC Manufacturing", "XYZ Services", "Tech Solutions"]
    },
    {
      date: 20,
      title: "VAT Returns Due",
      type: "monthly",
      status: "critical",
      clients: ["ABC Manufacturing", "Kenya Exports Co."]
    },
    {
      date: 25,
      title: "Corporation Tax Due",
      type: "annual",
      status: "upcoming",
      clients: ["Kenya Exports Co."]
    },
    {
      date: 30,
      title: "Withholding Tax Due",
      type: "monthly",
      status: "pending",
      clients: ["Tech Solutions", "XYZ Services"]
    }
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = taxEvents.filter(event => event.date === day);
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-24 p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded truncate ${
                  event.status === 'critical' ? 'bg-red-100 text-red-800' :
                  event.status === 'upcoming' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Tax Calendar</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Upcoming Deadlines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxEvents
                  .sort((a, b) => a.date - b.date)
                  .map((event, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Due: {monthNames[currentDate.getMonth()]} {event.date}, {currentDate.getFullYear()}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Affected Clients:</p>
                        {event.clients.map((client, clientIndex) => (
                          <p key={clientIndex} className="text-xs text-gray-600">• {client}</p>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs">Critical (Due soon)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-xs">Upcoming</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Pending</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
