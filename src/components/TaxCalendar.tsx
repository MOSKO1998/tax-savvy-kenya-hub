import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  AlertCircle,
  Plus,
  Settings,
  FileText
} from "lucide-react";
import { KenyaTaxObligations } from "./KenyaTaxObligations";
import { AddTaxObligation } from "./AddTaxObligation";

export const TaxCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1));
  const [activeView, setActiveView] = useState("calendar");
  const [showAddObligation, setShowAddObligation] = useState(false);

  const taxEvents = [
    {
      date: 9,
      title: "PAYE Returns Due",
      type: "monthly",
      status: "upcoming",
      clients: ["ABC Manufacturing", "XYZ Services", "Tech Solutions"],
      authority: "KRA",
      form: "P9A"
    },
    {
      date: 15,
      title: "NSSF & NHIF Returns",
      type: "monthly", 
      status: "upcoming",
      clients: ["ABC Manufacturing", "XYZ Services", "Tech Solutions"],
      authority: "NSSF/NHIF",
      form: "Multiple"
    },
    {
      date: 20,
      title: "VAT Returns Due",
      type: "monthly",
      status: "critical",
      clients: ["ABC Manufacturing", "Kenya Exports Co."],
      authority: "KRA",
      form: "VAT 3"
    },
    {
      date: 20,
      title: "Withholding Tax Due",
      type: "monthly",
      status: "pending",
      clients: ["Tech Solutions", "XYZ Services"],
      authority: "KRA",
      form: "WHT"
    },
    {
      date: 25,
      title: "Corporation Tax Due",
      type: "annual",
      status: "upcoming",
      clients: ["Kenya Exports Co."],
      authority: "KRA",
      form: "IT1"
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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = taxEvents.filter(event => event.date === day);
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-28 p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm ${
                  event.status === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                  event.status === 'upcoming' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
                title={`${event.title} - ${event.authority} (${event.form})`}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs opacity-75">{event.authority}</div>
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

  if (showAddObligation) {
    return (
      <div className="space-y-6">
        <AddTaxObligation onClose={() => setShowAddObligation(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Tax Calendar</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowAddObligation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Obligation
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="obligations">Kenya Tax Guide</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0">
                    {renderCalendarDays()}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                        <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Due: {monthNames[currentDate.getMonth()]} {event.date}, {currentDate.getFullYear()}
                          </p>
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Authority:</span> {event.authority} | 
                            <span className="font-medium"> Form:</span> {event.form}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Affected Clients:</p>
                            {event.clients.map((client, clientIndex) => (
                              <p key={clientIndex} className="text-xs text-gray-600">• {client}</p>
                            ))}
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Remind
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

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
        </TabsContent>

        <TabsContent value="obligations">
          <KenyaTaxObligations />
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Kenya Tax Compliance Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Comprehensive compliance checking will be available with backend integration.
                  This will include automated verification of filing status, penalty calculations,
                  and compliance scoring for each client.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Monthly Obligations</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• PAYE Returns (9th)</li>
                      <li>• NSSF/NHIF (15th)</li>
                      <li>• VAT Returns (20th)</li>
                      <li>• Withholding Tax (20th)</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Annual Obligations</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Corporation Tax (6 months after year end)</li>
                      <li>• Annual Return CR12 (42 days after AGM)</li>
                      <li>• Audited Accounts Filing</li>
                      <li>• Tax Computation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
