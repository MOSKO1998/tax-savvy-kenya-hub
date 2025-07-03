
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  AlertCircle,
  Mail,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface TaxObligation {
  id?: string;
  title: string;
  description?: string;
  due_date: Date;
  tax_type: string;
  client_id?: string;
  client_name?: string;
  amount?: number;
  status: 'pending' | 'completed' | 'overdue';
  reminder_emails?: string[];
}

export const TaxCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingObligation, setEditingObligation] = useState<TaxObligation | null>(null);
  const [newObligation, setNewObligation] = useState<TaxObligation>({
    title: '',
    description: '',
    due_date: new Date(),
    tax_type: 'paye',
    client_id: '',
    client_name: '',
    amount: 0,
    status: 'pending',
    reminder_emails: []
  });
  const [reminderEmail, setReminderEmail] = useState('');
  
  const { isDemoMode } = useAuth();
  const { obligations, loading, addObligation, updateObligation, deleteObligation } = useTaxObligations();
  const { clients } = useClients();
  const { toast } = useToast();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const taxTypes = [
    { value: 'paye', label: 'PAYE' },
    { value: 'vat', label: 'VAT' },
    { value: 'corporate_tax', label: 'Corporation Tax' },
    { value: 'withholding_tax', label: 'Withholding Tax' },
    { value: 'customs_duty', label: 'Customs Duty' },
    { value: 'excise_tax', label: 'Excise Tax' }
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

  const getObligationsForDate = (day: number) => {
    return obligations.filter(obligation => {
      const obligationDate = new Date(obligation.due_date);
      return obligationDate.getDate() === day &&
             obligationDate.getMonth() === currentDate.getMonth() &&
             obligationDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleSaveObligation = async () => {
    if (!newObligation.title || !newObligation.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const obligationData = {
      ...newObligation,
      client_id: newObligation.client_id || null,
      reminder_emails: newObligation.reminder_emails?.filter(email => email.length > 0)
    };

    if (editingObligation) {
      const result = await updateObligation(editingObligation.id!, obligationData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Tax obligation updated successfully"
        });
        setEditingObligation(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to update tax obligation",
          variant: "destructive"
        });
      }
    } else {
      const result = await addObligation(obligationData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Tax obligation added successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add tax obligation",
          variant: "destructive"
        });
      }
    }

    resetForm();
  };

  const handleDeleteObligation = async (id: string) => {
    const result = await deleteObligation(id);
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
  };

  const resetForm = () => {
    setNewObligation({
      title: '',
      description: '',
      due_date: new Date(),
      tax_type: 'paye',
      client_id: '',
      client_name: '',
      amount: 0,
      status: 'pending',
      reminder_emails: []
    });
    setReminderEmail('');
    setShowAddForm(false);
    setEditingObligation(null);
  };

  const addReminderEmail = () => {
    if (reminderEmail && reminderEmail.includes('@')) {
      setNewObligation(prev => ({
        ...prev,
        reminder_emails: [...(prev.reminder_emails || []), reminderEmail]
      }));
      setReminderEmail('');
    }
  };

  const removeReminderEmail = (index: number) => {
    setNewObligation(prev => ({
      ...prev,
      reminder_emails: prev.reminder_emails?.filter((_, i) => i !== index) || []
    }));
  };

  const startEditing = (obligation: any) => {
    setNewObligation({
      title: obligation.title,
      description: obligation.description || '',
      due_date: new Date(obligation.due_date),
      tax_type: obligation.tax_type,
      client_id: obligation.client_id || '',
      client_name: obligation.clients?.name || obligation.client_name || '',
      amount: obligation.amount || 0,
      status: obligation.status,
      reminder_emails: obligation.reminder_emails || []
    });
    setEditingObligation(obligation);
    setShowAddForm(true);
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setNewObligation(prev => ({
      ...prev,
      client_id: clientId,
      client_name: selectedClient?.name || ''
    }));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayObligations = getObligationsForDate(day);
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-32 p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayObligations.map((obligation, index) => (
              <div
                key={obligation.id || index}
                className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm ${
                  obligation.status === 'overdue' ? 'bg-red-100 text-red-800 border border-red-200' :
                  obligation.status === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-green-100 text-green-800 border border-green-200'
                }`}
                onClick={() => startEditing(obligation)}
                title={`${obligation.title} - ${obligation.tax_type.toUpperCase()}`}
              >
                <div className="font-medium">{obligation.title}</div>
                <div className="text-xs opacity-75">{obligation.tax_type.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Tax Calendar</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Tax Calendar</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tax Obligation
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingObligation ? 'Edit Tax Obligation' : 'Add New Tax Obligation'}
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newObligation.title}
                  onChange={(e) => setNewObligation(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., PAYE Returns"
                />
              </div>
              <div>
                <Label htmlFor="tax_type">Tax Type *</Label>
                <Select
                  value={newObligation.tax_type}
                  onValueChange={(value) => setNewObligation(prev => ({ ...prev, tax_type: value }))}
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
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newObligation.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newObligation.due_date ? format(newObligation.due_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newObligation.due_date}
                      onSelect={(date) => date && setNewObligation(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={newObligation.client_id} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newObligation.amount}
                  onChange={(e) => setNewObligation(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newObligation.status}
                  onValueChange={(value: 'pending' | 'completed' | 'overdue') => 
                    setNewObligation(prev => ({ ...prev, status: value }))
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newObligation.description}
                onChange={(e) => setNewObligation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this tax obligation"
                rows={3}
              />
            </div>

            <div>
              <Label>Reminder Emails</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
                <Button type="button" onClick={addReminderEmail}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newObligation.reminder_emails?.map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{email}</span>
                    <button onClick={() => removeReminderEmail(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSaveObligation}>
                <Save className="h-4 w-4 mr-2" />
                {editingObligation ? 'Update' : 'Save'} Obligation
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                {obligations.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tax obligations yet. Add your first one to get started!</p>
                ) : (
                  obligations
                    .filter(obligation => new Date(obligation.due_date) >= new Date())
                    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                    .slice(0, 5)
                    .map((obligation) => (
                      <div key={obligation.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{obligation.title}</h4>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditing(obligation)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteObligation(obligation.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Due: {format(new Date(obligation.due_date), "PPP")}
                        </p>
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Type:</span> {obligation.tax_type.toUpperCase()}
                          {obligation.clients?.name && (
                            <> | <span className="font-medium">Client:</span> {obligation.clients.name}</>
                          )}
                        </div>
                        <Badge className={
                          obligation.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          obligation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {obligation.status}
                        </Badge>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
