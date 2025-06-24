import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";

export const ReportGenerator = () => {
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  
  const { isDemoMode } = useAuth();
  const { clients } = useClients();
  const { obligations } = useTaxObligations();

  const reportTypes = [
    {
      id: "client_summary",
      name: "Client Summary Report",
      description: "Overview of all clients and their current status",
      icon: Users
    },
    {
      id: "tax_obligations",
      name: "Tax Obligations Report",
      description: "Detailed report of all tax obligations by status and date",
      icon: FileText
    },
    {
      id: "compliance_status",
      name: "Compliance Status Report",
      description: "Current compliance status across all clients",
      icon: AlertCircle
    },
    {
      id: "overdue_obligations",
      name: "Overdue Obligations Report",
      description: "All overdue tax obligations requiring immediate attention",
      icon: Calendar
    },
    {
      id: "financial_summary",
      name: "Financial Summary Report",
      description: "Financial overview including amounts due and paid",
      icon: BarChart3
    },
    {
      id: "monthly_breakdown",
      name: "Monthly Breakdown Report",
      description: "Month-by-month breakdown of obligations and compliance",
      icon: FileSpreadsheet
    }
  ];

  const statuses = [
    { id: "pending", name: "Pending", color: "orange" },
    { id: "completed", name: "Completed", color: "green" },
    { id: "overdue", name: "Overdue", color: "red" },
    { id: "in_progress", name: "In Progress", color: "blue" }
  ];

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const generateReport = async () => {
    if (!reportType) {
      alert("Please select a report type");
      return;
    }

    setGenerating(true);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would implement actual report generation logic
      // For now, we'll just show success message
      const reportData = {
        type: reportType,
        dateRange: { from: dateFrom, to: dateTo },
        clients: selectedClients.length > 0 ? selectedClients : clients.map(c => c.id),
        statuses: selectedStatuses.length > 0 ? selectedStatuses : statuses.map(s => s.id),
        format,
        generatedAt: new Date().toISOString(),
        totalClients: clients.length,
        totalObligations: obligations.length,
        isDemoData: isDemoMode
      };

      console.log("Generated report data:", reportData);
      
      // In a real implementation, you would:
      // 1. Send this data to a backend service
      // 2. Generate the actual report (PDF, Excel, etc.)
      // 3. Provide download link
      
      alert(`Report generated successfully! Format: ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const selectedReportType = reportTypes.find(rt => rt.id === reportType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-gray-900">Generate Reports</h2>
          {isDemoMode && (
            <Badge variant="secondary" className="text-orange-600 border-orange-600 bg-orange-50">
              Demo Data
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Type Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Report Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        reportType === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-6 w-6 mt-1 ${
                          reportType === type.id ? "text-blue-600" : "text-gray-600"
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <DatePicker 
                    date={dateFrom} 
                    onSelect={setDateFrom}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <DatePicker 
                    date={dateTo} 
                    onSelect={setDateTo}
                    placeholder="Select end date"
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Clients (Leave empty for all clients)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${client.id}`}
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => handleClientToggle(client.id)}
                      />
                      <label
                        htmlFor={`client-${client.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {client.name}
                      </label>
                    </div>
                  ))}
                </div>
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {isDemoMode ? "Demo mode - using sample clients" : "No clients available"}
                  </p>
                )}
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label>Status (Leave empty for all statuses)</Label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.id}`}
                        checked={selectedStatuses.includes(status.id)}
                        onCheckedChange={() => handleStatusToggle(status.id)}
                      />
                      <label
                        htmlFor={`status-${status.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Badge variant="outline" className={`bg-${status.color}-100 text-${status.color}-800`}>
                          {status.name}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview & Generation */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedReportType ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <selectedReportType.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">{selectedReportType.name}</h3>
                      <p className="text-sm text-blue-700">{selectedReportType.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Report Will Include:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {selectedClients.length > 0 ? `${selectedClients.length} selected clients` : `All clients (${clients.length})`}</li>
                      <li>• {selectedStatuses.length > 0 ? `${selectedStatuses.length} selected statuses` : "All statuses"}</li>
                      <li>• {dateFrom ? `From ${dateFrom.toLocaleDateString()}` : "All dates"}</li>
                      <li>• {dateTo ? `To ${dateTo.toLocaleDateString()}` : "To current date"}</li>
                      <li>• Total obligations: {obligations.length}</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={generateReport} 
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Select a report type to preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportType("overdue_obligations");
                  setSelectedStatuses(["overdue"]);
                }}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Overdue Items
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportType("monthly_breakdown");
                  setDateFrom(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                  setDateTo(new Date());
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                This Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportType("client_summary");
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                All Clients
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
