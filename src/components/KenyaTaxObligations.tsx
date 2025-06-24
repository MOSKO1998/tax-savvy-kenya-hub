
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddTaxObligation } from "@/components/AddTaxObligation";
import { useAuth } from "@/hooks/useAuth";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { 
  Plus, 
  Search, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2
} from "lucide-react";

export const KenyaTaxObligations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { isDemoMode } = useAuth();
  const { obligations, loading, updateObligation } = useTaxObligations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleMarkComplete = async (obligationId: string) => {
    const result = await updateObligation(obligationId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    if (result.success) {
      // Success feedback handled by the hook
    }
  };

  const filteredObligations = obligations.filter(obligation => {
    const matchesSearch = obligation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obligation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || obligation.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: obligations.length,
    pending: obligations.filter(o => o.status === "pending").length,
    overdue: obligations.filter(o => o.status === "overdue").length,
    completed: obligations.filter(o => o.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Kenya Tax Obligations</h2>
        <AddTaxObligation 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Obligation
            </Button>
          }
        />
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("overdue")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("completed")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search obligations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="w-full sm:w-auto"
              >
                All
              </Button>
              <Button 
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                className="w-full sm:w-auto"
              >
                Pending
              </Button>
              <Button 
                variant={filterStatus === "overdue" ? "default" : "outline"}
                onClick={() => setFilterStatus("overdue")}
                className="w-full sm:w-auto"
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Obligations List */}
      <div className="space-y-4">
        {filteredObligations.map((obligation) => (
          <Card key={obligation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{obligation.title}</h3>
                    <Badge className={getStatusColor(obligation.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(obligation.status)}
                        <span className="capitalize">{obligation.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600">{obligation.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {obligation.due_date}</span>
                    </div>
                    {obligation.amount && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Amount: KES {obligation.amount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span>Type: {obligation.tax_type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    {obligation.clients && (
                      <div>
                        <span>Client: {obligation.clients.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {obligation.status !== "completed" && !isDemoMode && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkComplete(obligation.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredObligations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {isDemoMode 
                ? "Demo tax obligations will appear here when you log in with demo credentials." 
                : "No tax obligations found. Add your first obligation to get started."
              }
            </p>
            {!isDemoMode && (
              <AddTaxObligation 
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Obligation
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
