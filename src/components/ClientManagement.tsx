
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { sanitizeInput, validateEmail, validatePhoneNumber, validateTaxId } from "@/utils/inputValidation";
import { Edit, Trash2, Plus, X } from "lucide-react";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  tax_id?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  address?: string;
  client_type: string;
  created_at: string;
}

export const ClientManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    client_type: 'individual'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const { clients, loading, addClient, updateClient, deleteClient, refetch } = useClients();

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      errors.phone = 'Please enter a valid Kenya phone number';
    }

    if (formData.tax_id && !validateTaxId(formData.tax_id)) {
      errors.tax_id = 'Please enter a valid KRA PIN (e.g., A001234567P)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasPermission('client_management') && !hasPermission('all')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage clients",
        variant: "destructive",
      });
      return;
    }

    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim(),
      tax_id: formData.tax_id.toUpperCase().trim(),
      address: sanitizeInput(formData.address),
      client_type: formData.client_type,
    };

    let result;
    if (editingClient) {
      result = await updateClient(editingClient.id, sanitizedData);
    } else {
      result = await addClient(sanitizedData);
    }

    if (result.success) {
      toast({
        title: "Success",
        description: `Client ${editingClient ? 'updated' : 'created'} successfully`,
      });
      resetForm();
      refetch();
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editingClient ? 'update' : 'create'} client. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      tax_id: client.tax_id || '',
      address: client.address || '',
      client_type: client.client_type
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!hasPermission('client_management') && !hasPermission('all')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete clients",
        variant: "destructive",
      });
      return;
    }

    const result = await deleteClient(clientId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      refetch();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      tax_id: '',
      address: '',
      client_type: 'individual'
    });
    setFormErrors({});
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Management</h1>
        {(hasPermission('client_management') || hasPermission('all')) && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {editingClient ? 'Edit Client' : 'Add New Client'}
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254712345678"
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="tax_id">KRA PIN</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  placeholder="A001234567P"
                  className={formErrors.tax_id ? 'border-red-500' : ''}
                />
                {formErrors.tax_id && <p className="text-red-500 text-sm mt-1">{formErrors.tax_id}</p>}
              </div>

              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Select value={formData.client_type} onValueChange={(value) => handleInputChange('client_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
                {editingClient ? 'Update Client' : 'Create Client'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <p className="text-gray-600 capitalize">{client.client_type}</p>
                  {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                  {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                  {client.tax_id && <p className="text-sm text-gray-500">KRA PIN: {client.tax_id}</p>}
                  {client.address && <p className="text-sm text-gray-500">{client.address}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-400">
                    Created: {new Date(client.created_at).toLocaleDateString()}
                  </div>
                  {(hasPermission('client_management') || hasPermission('all')) && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the client "{client.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(client.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No clients found. Add your first client to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
