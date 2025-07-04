
import { useState } from "react";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, DollarSign, FileText, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const taxTypes = [
  { value: "vat", label: "VAT" },
  { value: "paye", label: "PAYE" },
  { value: "corporate_tax", label: "Corporate Tax" },
  { value: "withholding_tax", label: "Withholding Tax" },
  { value: "customs_duty", label: "Customs Duty" },
  { value: "excise_tax", label: "Excise Tax" }
];

const statusTypes = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800" }
];

export const KenyaTaxObligations = () => {
  const { obligations, loading, addObligation, updateObligation, deleteObligation } = useTaxObligations();
  const { clients } = useClients();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTaxType, setFilterTaxType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tax_type: "",
    client_id: "",
    due_date: "",
    amount: "",
    status: "pending"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      tax_type: "",
      client_id: "",
      due_date: "",
      amount: "",
      status: "pending"
    });
    setEditingObligation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.tax_type || !formData.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const obligationData = {
        ...formData,
        due_date: new Date(formData.due_date),
        amount: formData.amount ? parseFloat(formData.amount) : null,
      };

      let result;
      if (editingObligation) {
        result = await updateObligation(editingObligation.id, obligationData);
      } else {
        result = await addObligation(obligationData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: editingObligation ? "Tax obligation updated successfully" : "Tax obligation added successfully",
        });
        setDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to save tax obligation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving obligation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (obligation: any) => {
    setEditingObligation(obligation);
    setFormData({
      title: obligation.title,
      description: obligation.description || "",
      tax_type: obligation.tax_type,
      client_id: obligation.client_id || "",
      due_date: obligation.due_date,
      amount: obligation.amount?.toString() || "",
      status: obligation.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tax obligation?")) {
      const result = await deleteObligation(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Tax obligation deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete tax obligation",
          variant: "destructive",
        });
      }
    }
  };

  // Filter obligations based on search and filters
  const filteredObligations = obligations.filter(obligation => {
    const matchesSearch = searchTerm === "" || 
      obligation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obligation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obligation.tax_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obligation.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || obligation.status === filterStatus;
    const matchesTaxType = filterTaxType === "all" || obligation.tax_type === filterTaxType;
    
    return matchesSearch && matchesStatus && matchesTaxType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tax Obligations</h1>
        </div>
        <div className="text-center py-8">Loading tax obligations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tax Obligations</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Obligation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingObligation ? "Edit Tax Obligation" : "Add New Tax Obligation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter obligation title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tax_type">Tax Type *</Label>
                <Select value={formData.tax_type} onValueChange={(value) => setFormData(prev => ({ ...prev, tax_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client_id">Client</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingObligation ? "Update" : "Add"} Obligation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search obligations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusTypes.map(status => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTaxType} onValueChange={setFilterTaxType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {taxTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Obligations List */}
      <div className="grid gap-4">
        {filteredObligations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" || filterTaxType !== "all" 
                  ? "No tax obligations match your search criteria"
                  : "No tax obligations found. Add your first tax obligation to get started."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredObligations.map((obligation) => (
            <Card key={obligation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{obligation.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {taxTypes.find(t => t.value === obligation.tax_type)?.label || obligation.tax_type}
                      </Badge>
                      <Badge className={statusTypes.find(s => s.value === obligation.status)?.color || "bg-gray-100 text-gray-800"}>
                        {statusTypes.find(s => s.value === obligation.status)?.label || obligation.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(obligation)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(obligation.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Due: {format(new Date(obligation.due_date), 'MMM d, yyyy')}</span>
                  </div>
                  {obligation.amount && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span>KES {obligation.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {obligation.clients && (
                    <div className="flex items-center">
                      <span className="text-gray-500">Client: {obligation.clients.name}</span>
                    </div>
                  )}
                </div>
                {obligation.description && (
                  <p className="text-gray-600 mt-3 text-sm">{obligation.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
