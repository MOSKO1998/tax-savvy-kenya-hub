import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sanitizeInput, validateEmail, validatePhoneNumber, validateTaxId } from "@/utils/inputValidation";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  tax_id?: string;
}

export const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    // Security: Validate and sanitize all inputs
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

  const handleSubmit = async (e) => {
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

    try {
      // Security: Sanitize all input data before submission
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        tax_id: formData.tax_id.toUpperCase().trim(),
        address: sanitizeInput(formData.address),
        client_type: formData.client_type,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('clients')
        .insert([sanitizedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client created successfully",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        address: '',
        client_type: 'individual'
      });
      setIsFormOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
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
            Add New Client
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
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

              <div className="flex gap-2">
                <Button type="submit">Create Client</Button>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <p className="text-gray-600">{client.client_type}</p>
                  {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                  {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                  {client.tax_id && <p className="text-sm text-gray-500">KRA PIN: {client.tax_id}</p>}
                </div>
                <div className="text-sm text-gray-400">
                  Created: {new Date(client.created_at).toLocaleDateString()}
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
