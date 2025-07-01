
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Mail,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useClients } from "@/hooks/useClients";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "./SearchInput";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const KenyaTaxObligations = () => {
  const [isAddObligationOpen, setIsAddObligationOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTaxType, setSelectedTaxType] = useState("all");
  
  const { obligations, loading, addObligation, updateObligation, deleteObligation } = useTaxObligations();
  const { clients } = useClients();
  const { toast } = useToast();

  const { searchTerm, setSearchTerm, filteredData: searchFilteredObligations } = useSearch(
    obligations, 
    ['title', 'description', 'tax_type']
  );

  // Apply additional filters
  const filteredObligations = searchFilteredObligations.filter(obligation => {
    const statusMatch = selectedStatus === "all" || obligation.status === selectedStatus;
    const taxTypeMatch = selectedTaxType === "all" || obligation.tax_type === selectedTaxType;
    return statusMatch && taxTypeMatch;
  });

  const [newObligation, setNewObligation] = useState({
    title: '',
    description: '',
    tax_type: 'paye',
    due_date: new Date(),
    client_id: '',
    amount: 0,
    status: 'pending' as const,
    reminder_emails: [] as string[]
  });

  const [reminderEmail, setReminderEmail] = useState('');

  const taxTypes = [
    { value: 'paye', label: 'PAYE' },
    { value: 'vat', label: 'VAT' },
    { value: 'corporate_tax', label: 'Corporate Tax' },
    { value: 'withholding_tax', label: 'Withholding Tax' },
    { value: 'customs_duty', label: 'Customs Duty' },
    { value: 'excise_tax', label: 'Excise Tax' }
  ];

  const resetForm = () => {
    setNewObligation({
      title: '',
      description: '',
      tax_type: 'paye',
      due_date: new Date(),
      client_id: '',
      amount: 0,
      status: 'pending',
      reminder_emails: []
    });
    setReminderEmail('');
    setEditingObligation(null);
    setIsAddObligationOpen(false);
  };

  const handleSaveObligation = async () => {
    if (!newObligation.title.trim()) {
      toast({
        title: "Error",
        description: "Obligation title is required",
        variant: "destructive"
      });
      return;
    }

    const selectedClient = clients.find(c => c.id === newObligation.client_id);
    const obligationData = {
      ...newObligation,
      client_name: selectedClient?.name || ''
    };

    const result = editingObligation 
      ? await updateObligation(editingObligation.id, obligationData)
      : await addObligation(obligationData);

    if (result.success) {
      toast({
        title: "Success",
        description: `Tax obligation ${editingObligation ? 'updated' : 'added'} successfully`
      });
      resetForm();
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editingObligation ? 'update' : 'add'} tax obligation`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteObligation = async (obligationId: string) => {
    if (window.confirm('Are you sure you want to delete this tax obligation?')) {
      const result = await deleteObligation(obligationId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Tax obligation deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete tax obligation",
          variant: "destructive"
        });
      }
    }
  };

  const startEditing = (obligation: any) => {
    setNewObligation({
      title: obligation.title,
      description: obligation.description || '',
      tax_type: obligation.tax_type,
      due_date: new Date(obligation.due_date),
      client_id: obligation.client_id || '',
      amount: obligation.amount || 0,
      status: obligation.status,
      reminder_emails: obligation.reminder_emails || []
    });
    setEditingObligation(obligation);
    setIsAddObligationOpen(true);
  };

  const addReminderEmail = () => {
    if (reminderEmail && reminderEmail.includes('@')) {
      setNewObligation(prev => ({
        ...prev,
        reminder_emails: [...prev.reminder_emails, reminderEmail]
      }));
      setReminderEmail('');
    }
  };

  const removeReminderEmail = (index: number) => {
    setNewObligation(prev => ({
      ...prev,
      reminder_emails: prev.reminder_emails.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tax obligations...</p>
        </div>
      </div>
    );
  }

  const pendingCount = obligations.filter(o => o.status === 'pending').length;
  const completedCount = obligations.filter(o => o.status === 'completed').length;
  const overdueCount = obligations.filter(o => {
    const dueDate = new Date(o.due_date);
    return o.status === 'pending' && dueDate < new Date();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tax Obligations</h2>
          <p className="text-gray-600 mt-1">Manage all tax obligations and compliance requirements</p>
        </div>
        <Button onClick={() => setIsAddObligationOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Obligation
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{obligations.length}</p>
                <p className="text-sm text-gray-600">Total Obligations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search obligations by title, description, or tax type..."
              className="flex-1"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tax Types</SelectItem>
                {taxTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Obligations List */}
      <div className="space-y-4">
        {filteredObligations.map((obligation) => {
          const dueDate = new Date(obligation.due_date);
          const isOverdue = obligation.status === 'pending' && dueDate < new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={obligation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(isOverdue ? 'overdue' : obligation.status)}
                      <h3 className="text-lg font-semibold">{obligation.title}</h3>
                      <Badge className={getStatusColor(isOverdue ? 'overdue' : obligation.status)}>
                        {isOverdue ? 'Overdue' : obligation.status}
                      </Badge>
                      <Badge variant="outline">
                        {taxTypes.find(t => t.value === obligation.tax_type)?.label || obligation.tax_type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {format(dueDate, "PPP")}</span>
                        {obligation.status === 'pending' && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            daysUntilDue < 0 ? 'bg-red-100 text-red-800' :
                            daysUntilDue <= 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                             daysUntilDue === 0 ? 'Due today' :
                             daysUntilDue === 1 ? 'Due tomorrow' :
                             `${daysUntilDue} days left`}
                          </span>
                        )}
                      </div>
                      
                      {obligation.clients?.name && (
                        <div>
                          <span className="font-medium">Client:</span> {obligation.clients.name}
                        </div>
                      )}
                      
                      {obligation.amount && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>KES {obligation.amount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {obligation.description && (
                      <p className="text-gray-600 mb-3">{obligation.description}</p>
                    )}

                    {obligation.reminder_emails && obligation.reminder_emails.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Reminders: {obligation.reminder_emails.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(obligation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteObligation(obligation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredObligations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus !== "all" || selectedTaxType !== "all" 
                ? 'No obligations found' 
                : 'No tax obligations yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== "all" || selectedTaxType !== "all"
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by adding your first tax obligation'
              }
            </p>
            {!searchTerm && selectedStatus === "all" && selectedTaxType === "all" && (
              <Button onClick={() => setIsAddObligationOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Obligation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Obligation Dialog */}
      <Dialog open={isAddObligationOpen} onOpenChange={setIsAddObligationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {editingObligation ? 'Edit Tax Obligation' : 'Add New Tax Obligation'}
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newObligation.title}
                  onChange={(e) => setNewObligation({ ...newObligation, title: e.target.value })}
                  placeholder="e.g., PAYE Returns"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_type">Tax Type *</Label>
                <Select
                  value={newObligation.tax_type}
                  onValueChange={(value) => setNewObligation({ ...newObligation, tax_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newObligation.due_date.toISOString().split('T')[0]}
                  onChange={(e) => setNewObligation({ ...newObligation, due_date: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_id">Client</Label>
                <Select
                  value={newObligation.client_id}
                  onValueChange={(value) => setNewObligation({ ...newObligation, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client assigned</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newObligation.amount}
                  onChange={(e) => setNewObligation({ ...newObligation, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newObligation.status}
                  onValueChange={(value: 'pending' | 'completed' | 'overdue') => 
                    setNewObligation({ ...newObligation, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newObligation.description}
                onChange={(e) => setNewObligation({ ...newObligation, description: e.target.value })}
                placeholder="Additional details about this tax obligation"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Reminder Emails</Label>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                <Button type="button" onClick={addReminderEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newObligation.reminder_emails.map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeReminderEmail(index)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveObligation}>
                {editingObligation ? 'Update' : 'Add'} Obligation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
