
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const clients = [
    {
      id: 1,
      name: "ABC Manufacturing Ltd",
      pin: "P051234567X",
      yearEnd: "2023-12-31",
      status: "active",
      compliance: "good",
      nextDeadline: "VAT Return - Jan 20, 2024",
      accountant: "John Kamau",
      address: "Nairobi, Kenya"
    },
    {
      id: 2,
      name: "XYZ Services Ltd",
      pin: "P051234568Y",
      yearEnd: "2024-03-31",
      status: "active",
      compliance: "warning",
      nextDeadline: "PAYE Return - Jan 22, 2024",
      accountant: "Mary Wanjiku",
      address: "Mombasa, Kenya"
    },
    {
      id: 3,
      name: "Kenya Exports Co.",
      pin: "P051234569Z",
      yearEnd: "2023-06-30",
      status: "active",
      compliance: "critical",
      nextDeadline: "Corporation Tax - Jan 25, 2024",
      accountant: "Peter Mwangi",
      address: "Kisumu, Kenya"
    },
    {
      id: 4,
      name: "Tech Solutions Ltd",
      pin: "P051234570A",
      yearEnd: "2023-12-31",
      status: "inactive",
      compliance: "good",
      nextDeadline: "Withholding Tax - Jan 28, 2024",
      accountant: "Jane Achieng",
      address: "Nakuru, Kenya"
    }
  ];

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case "good":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplianceIcon = (compliance: string) => {
    switch (compliance) {
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
      case "critical":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.pin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Client Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by client name or PIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Client</DropdownMenuItem>
                    <DropdownMenuItem>View Documents</DropdownMenuItem>
                    <DropdownMenuItem>Generate Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">KRA PIN:</span>
                  <span className="text-sm font-mono">{client.pin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Year End:</span>
                  <span className="text-sm">{client.yearEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accountant:</span>
                  <span className="text-sm">{client.accountant}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Badge 
                  variant={client.status === "active" ? "default" : "secondary"}
                >
                  {client.status}
                </Badge>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getComplianceColor(client.compliance)}`}>
                  {getComplianceIcon(client.compliance)}
                  <span className="capitalize">{client.compliance}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Next Deadline:</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{client.nextDeadline}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No clients found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
