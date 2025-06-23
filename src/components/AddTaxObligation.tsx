
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { demoDataService } from "@/services/demoDataService";
import { CalendarIcon, Plus, X, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTaxObligationProps {
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const AddTaxObligation = ({ onClose, trigger }: AddTaxObligationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [obligation, setObligation] = useState({
    title: "",
    description: "",
    tax_authority: "",
    frequency: "",
    priority: "medium",
    penalty_info: "",
    reminder_days: "7",
    reference_number: ""
  });
  
  const { toast } = useToast();
  const { isDemoMode } = useAuth();

  // Use demo clients for demo mode, empty array for real users
  const clients = isDemoMode ? demoDataService.getDemoClients() : [];

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(c => c !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = () => {
    if (!obligation.title || !obligation.tax_authority || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tax Obligation Created",
      description: `${obligation.title} has been created and assigned to ${selectedClients.length} client(s).`,
    });

    // Reset form
    setObligation({
      title: "",
      description: "",
      tax_authority: "",
      frequency: "",
      priority: "medium",
      penalty_info: "",
      reminder_days: "7",
      reference_number: ""
    });
    setSelectedClients([]);
    setDueDate(undefined);
    handleClose();
  };

  const content = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="obligation-title">Obligation Title *</Label>
          <Input 
            id="obligation-title" 
            value={obligation.title}
            onChange={(e) => setObligation({ ...obligation, title: e.target.value })}
            placeholder="e.g., VAT Returns, PAYE Returns" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-authority">Tax Authority *</Label>
          <Select value={obligation.tax_authority} onValueChange={(value) => setObligation({ ...obligation, tax_authority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select authority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kra">KRA (Kenya Revenue Authority)</SelectItem>
              <SelectItem value="registrar">Registrar of Companies</SelectItem>
              <SelectItem value="nssf">NSSF</SelectItem>
              <SelectItem value="nhif">NHIF</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={obligation.description}
          onChange={(e) => setObligation({ ...obligation, description: e.target.value })}
          placeholder="Describe the tax obligation and requirements"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <Select value={obligation.frequency} onValueChange={(value) => setObligation({ ...obligation, frequency: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Select value={obligation.priority} onValueChange={(value) => setObligation({ ...obligation, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="penalty-info">Penalty Information</Label>
        <Textarea 
          id="penalty-info" 
          value={obligation.penalty_info}
          onChange={(e) => setObligation({ ...obligation, penalty_info: e.target.value })}
          placeholder="Describe penalties for late filing or non-compliance"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Assign to Clients</Label>
        <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
          {clients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clients.map((client) => (
                <label key={client.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{client.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {isDemoMode ? "Demo clients will appear here" : "No clients available. Add clients first."}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Selected: {selectedClients.length} client(s)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reminder-days">Reminder (days before due)</Label>
          <Select value={obligation.reminder_days} onValueChange={(value) => setObligation({ ...obligation, reminder_days: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reminder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference-number">Reference/Form Number</Label>
          <Input 
            id="reference-number" 
            value={obligation.reference_number}
            onChange={(e) => setObligation({ ...obligation, reference_number: e.target.value })}
            placeholder="e.g., ITX Form, P9A Form" 
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Create Obligation
        </Button>
      </div>
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Tax Obligation</span>
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Tax Obligation</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};
