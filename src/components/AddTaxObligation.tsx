
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
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { CalendarIcon, Plus, X, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTaxObligationProps {
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const AddTaxObligation = ({ onClose, trigger }: AddTaxObligationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [obligation, setObligation] = useState({
    title: "",
    description: "",
    tax_type: "",
    amount: ""
  });
  
  const { toast } = useToast();
  const { isDemoMode } = useAuth();
  const { clients } = useClients();
  const { addObligation } = useTaxObligations();

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async () => {
    if (!obligation.title || !obligation.tax_type || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Cannot add real tax obligations in demo mode. Please sign up for a real account.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const obligationData = {
      title: obligation.title,
      description: obligation.description,
      tax_type: obligation.tax_type,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      amount: obligation.amount ? parseFloat(obligation.amount) : null,
      client_id: selectedClient || null,
      status: 'pending'
    };

    const result = await addObligation(obligationData);
    
    if (result.success) {
      toast({
        title: "Tax Obligation Created",
        description: `${obligation.title} has been created successfully.`,
      });

      // Reset form
      setObligation({
        title: "",
        description: "",
        tax_type: "",
        amount: ""
      });
      setSelectedClient("");
      setDueDate(undefined);
      handleClose();
    } else {
      toast({
        title: "Error",
        description: "Failed to create tax obligation. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
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
          <Label htmlFor="tax-type">Tax Type *</Label>
          <Select value={obligation.tax_type} onValueChange={(value) => setObligation({ ...obligation, tax_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select tax type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vat">VAT</SelectItem>
              <SelectItem value="paye">PAYE</SelectItem>
              <SelectItem value="corporate_tax">Corporate Tax</SelectItem>
              <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
              <SelectItem value="customs_duty">Customs Duty</SelectItem>
              <SelectItem value="excise_tax">Excise Tax</SelectItem>
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
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (KES)</Label>
          <Input 
            id="amount" 
            type="number"
            value={obligation.amount}
            onChange={(e) => setObligation({ ...obligation, amount: e.target.value })}
            placeholder="0.00" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client (Optional)</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? "Creating..." : "Create Obligation"}
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
