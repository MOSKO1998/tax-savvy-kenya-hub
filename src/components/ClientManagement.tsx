
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Calendar,
  Building2,
  Eye,
  Search
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "./SearchInput";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const ClientManagement = () => {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { obligations, addObligation } = useTaxObligations();
  const { toast } = useToast();

  const { searchTerm, setSearchTerm, filteredData: filteredClients } = useSearch(
    clients, 
    ['name', 'email', 'tax_id', 'phone']
  );

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    client_type: 'individual'
  });

  const [newObligation, setNewObligation] = useState({
    title: '',
    description: '',
    tax_type: 'paye',
    due_date: new Date(),
    amount: 0,
    status: 'pending' as const,
    reminder_emails: [] as string[]
  });

  const [reminderEmail, setReminderEmail] = useState('');

  const resetForms = () => {
    setNewClient({
      name: '',
      email: '',
      phone: '',
      tax_id: '',
      address: '',
      client_type: 'individual'
    });
    setNewObligation({
      title: '',
      description: '',
      tax_type: 'paye',
      due_date: new Date(),
      amount: 0,
      status: 'pending',
      reminder_emails: []
    });
    setReminderEmail('');
    setEditingClient(null);
    setIsAddClientOpen(false);
  };

  const handleSaveClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    const result = editingClient 
      ? await updateClient(editingClient.id, newClient)
      : await addClient(newClient);

    if (result.success) {
      toast({
        title: "Success",
        description: `Client ${editingClient ? 'updated' : 'added'} successfully`
      });
      resetForms();
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editingClient ? 'update' : 'add'} client`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all associated obligations.')) {
      const result = await deleteClient(clientId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Client deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete client",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddObligation = async () => {
    if (!viewingClient || !newObligation.title.trim()) {
      toast({
        title: "Error",
        description: "Obligation title is required",
        variant: "destructive"
      });
      return;
    }

    const result = await addObligation({
      ...newObligation,
      client_id: viewingClient.id,
      client_name: viewingClient.name
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Tax obligation added successfully"
      });
      setNewObligation({
        title: '',
        description: '',
        tax_type: 'paye',
        due_date: new Date(),
        amount: 0,
        status: 'pending',
        reminder_emails: []
      });
      setReminderEmail('');
    } else {
      toast({
        title: "Error",
        description: "Failed to add tax obligation",
        variant: "destructive"
      });
    }
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

  const startEditing = (client: any) => {
    setNewClient({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      tax_id: client.tax_id || '',
      address: client.address || '',
      client_type: client.client_type || 'individual'
    });
    setEditingClient(client);
    setIsAddClientOpen(true);
  };

  const getClientObligations = (clientId: string) => {
    return obligations.filter(o => o.client_id === clientId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600 mt-1">Manage your clients and their tax obligations</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search clients by name, email, tax ID, or phone..."
            className="w-full max-w-md"
          />
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const clientObligations = getClientObligations(client.id);
          const pendingCount = clientObligations.filter(o => o.status === 'pending').length;
          const completedCount = clientObligations.filter(o => o.status === 'completed').length;
          
          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {client.client_type === 'corporate' ? (
                        <Building2 className="h-6 w-6 text-blue-600" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.tax_id && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Tax ID: {client.tax_id}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-orange-600">{pendingCount} pending</span>
                    <span className="text-green-600">{completedCount} completed</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {client.client_type}
                  </Badge>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingClient(client)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first client'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddClientOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={newClient.client_type}
                onValueChange={(value) => setNewClient({ ...newClient, client_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="+254..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={newClient.tax_id}
                onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value })}
                placeholder="Tax identification number"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="Enter client address"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={resetForms}>
              Cancel
            </Button>
            <Button onClick={handleSaveClient}>
              {editingClient ? 'Update' : 'Add'} Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={(open) => !open && setViewingClient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {viewingClient?.client_type === 'corporate' ? (
                <Building2 className="h-6 w-6" />
              ) : (
                <User className="h-6 w-6" />
              )}
              <span>{viewingClient?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {viewingClient && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="obligations">Tax Obligations</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Name:</span>
                        <span>{viewingClient.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <Badge>{viewingClient.client_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant={viewingClient.status === 'active' ? 'default' : 'secondary'}>
                          {viewingClient.status}
                        </Badge>
                      </div>
                      {viewingClient.email && (
                        <div className="flex justify-between">
                          <span className="font-medium">Email:</span>
                          <span>{viewingClient.email}</span>
                        </div>
                      )}
                      {viewingClient.phone && (
                        <div className="flex justify-between">
                          <span className="font-medium">Phone:</span>
                          <span>{viewingClient.phone}</span>
                        </div>
                      )}
                      {viewingClient.tax_id && (
                        <div className="flex justify-between">
                          <span className="font-medium">Tax ID:</span>
                          <span>{viewingClient.tax_id}</span>
                        </div>
                      )}
                      {viewingClient.address && (
                        <div>
                          <span className="font-medium">Address:</span>
                          <p className="mt-1 text-sm">{viewingClient.address}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const clientObligations = getClientObligations(viewingClient.id);
                        const pending = clientObligations.filter(o => o.status === 'pending').length;
                        const completed = clientObligations.filter(o => o.status === 'completed').length;
                        const overdue = clientObligations.filter(o => {
                          const dueDate = new Date(o.due_date);
                          return o.status === 'pending' && dueDate < new Date();
                        }).length;
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium">Total Obligations:</span>
                              <Badge variant="outline">{clientObligations.length}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Pending:</span>
                              <Badge className="bg-orange-100 text-orange-800">{pending}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Completed:</span>
                              <Badge className="bg-green-100 text-green-800">{completed}</Badge>
                            </div>
                            {overdue > 0 && (
                              <div className="flex justify-between">
                                <span className="font-medium">Overdue:</span>
                                <Badge className="bg-red-100 text-red-800">{overdue}</Badge>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="obligations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Tax Obligation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={newObligation.title}
                          onChange={(e) => setNewObligation({ ...newObligation, title: e.target.value })}
                          placeholder="e.g., PAYE Returns"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Type</Label>
                        <Select
                          value={newObligation.tax_type}
                          onValueChange={(value) => setNewObligation({ ...newObligation, tax_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paye">PAYE</SelectItem>
                            <SelectItem value="vat">VAT</SelectItem>
                            <SelectItem value="corporate_tax">Corporate Tax</SelectItem>
                            <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
                            <SelectItem value="customs_duty">Customs Duty</SelectItem>
                            <SelectItem value="excise_tax">Excise Tax</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={newObligation.due_date.toISOString().split('T')[0]}
                          onChange={(e) => setNewObligation({ ...newObligation, due_date: new Date(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (KES)</Label>
                        <Input
                          type="number"
                          value={newObligation.amount}
                          onChange={(e) => setNewObligation({ ...newObligation, amount: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newObligation.description}
                        onChange={(e) => setNewObligation({ ...newObligation, description: e.target.value })}
                        placeholder="Additional details..."
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
                    <Button onClick={handleAddObligation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Obligation
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Current Obligations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getClientObligations(viewingClient.id).map((obligation) => (
                        <div key={obligation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{obligation.title}</h4>
                            <p className="text-sm text-gray-600">
                              {obligation.tax_type.toUpperCase()} • Due: {format(new Date(obligation.due_date), "PPP")}
                            </p>
                            {obligation.amount && (
                              <p className="text-sm text-gray-600">
                                Amount: KES {obligation.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Badge className={
                            obligation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            obligation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {obligation.status}
                          </Badge>
                        </div>
                      ))}
                      {getClientObligations(viewingClient.id).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No tax obligations yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Document management coming soon</p>
                      <p className="text-sm text-gray-400 mt-1">
                        This will integrate with Nextcloud for document storage
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
