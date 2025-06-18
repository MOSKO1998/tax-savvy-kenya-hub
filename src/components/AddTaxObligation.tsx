
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTaxObligationProps {
  onClose?: () => void;
}

export const AddTaxObligation = ({ onClose }: AddTaxObligationProps) => {
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const clients = [
    "ABC Manufacturing Ltd",
    "XYZ Services Co",
    "Tech Solutions Inc",
    "Kenya Exports Co",
    "Green Energy Ltd",
    "Smart Retail Chain",
    "Professional Services LLP",
    "Construction Corp"
  ];

  const toggleClient = (client: string) => {
    setSelectedClients(prev => 
      prev.includes(client) 
        ? prev.filter(c => c !== client)
        : [...prev, client]
    );
  };

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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="obligation-title">Obligation Title *</Label>
            <Input 
              id="obligation-title" 
              placeholder="e.g., VAT Returns, PAYE Returns" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-authority">Tax Authority *</Label>
            <Select>
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
            placeholder="Describe the tax obligation and requirements"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select>
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
            <Select>
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="penalty-info">Penalty Information</Label>
          <Textarea 
            id="penalty-info" 
            placeholder="Describe penalties for late filing or non-compliance"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Assign to Clients</Label>
          <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {clients.map((client) => (
                <label key={client} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client)}
                    onChange={() => toggleClient(client)}
                    className="rounded"
                  />
                  <span className="text-sm">{client}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Selected: {selectedClients.length} client(s)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-days">Reminder (days before due)</Label>
            <Select>
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
              placeholder="e.g., ITX Form, P9A Form" 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Obligation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
