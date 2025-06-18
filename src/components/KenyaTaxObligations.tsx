
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Calendar, Users } from "lucide-react";

export const KenyaTaxObligations = () => {
  const kenyaObligations = [
    {
      id: 1,
      title: "PAYE Returns",
      description: "Pay As You Earn tax returns for employees",
      dueDate: "9th of every month",
      frequency: "Monthly",
      authority: "KRA",
      penalty: "25% of tax due or KES 10,000 (whichever is higher)",
      status: "upcoming",
      affectedClients: 15,
      nextDue: "2024-01-09"
    },
    {
      id: 2,
      title: "VAT Returns",
      description: "Value Added Tax returns for registered businesses",
      dueDate: "20th of every month",
      frequency: "Monthly", 
      authority: "KRA",
      penalty: "5% of tax due per month or KES 10,000 (whichever is higher)",
      status: "critical",
      affectedClients: 8,
      nextDue: "2024-01-20"
    },
    {
      id: 3,
      title: "Withholding Tax",
      description: "Tax withheld on payments to suppliers and service providers",
      dueDate: "20th of every month",
      frequency: "Monthly",
      authority: "KRA", 
      penalty: "25% of tax due",
      status: "pending",
      affectedClients: 12,
      nextDue: "2024-01-20"
    },
    {
      id: 4,
      title: "Corporation Tax",
      description: "Tax on company profits",
      dueDate: "6 months after year end",
      frequency: "Annual",
      authority: "KRA",
      penalty: "20% of tax due + 2% per month",
      status: "upcoming",
      affectedClients: 25,
      nextDue: "2024-06-30"
    },
    {
      id: 5,
      title: "Annual Return (CR12)",
      description: "Annual return filed with Registrar of Companies",
      dueDate: "Within 42 days after AGM",
      frequency: "Annual",
      authority: "Registrar of Companies",
      penalty: "KES 5,000 + KES 100 per day of delay",
      status: "upcoming",
      affectedClients: 25,
      nextDue: "2024-03-15"
    },
    {
      id: 6,
      title: "NSSF Returns",
      description: "National Social Security Fund contributions",
      dueDate: "15th of every month",
      frequency: "Monthly",
      authority: "NSSF",
      penalty: "25% of contribution due",
      status: "upcoming",
      affectedClients: 15,
      nextDue: "2024-01-15"
    },
    {
      id: 7,
      title: "NHIF Returns",
      description: "National Hospital Insurance Fund contributions",
      dueDate: "15th of every month", 
      frequency: "Monthly",
      authority: "NHIF",
      penalty: "25% of contribution due",
      status: "upcoming",
      affectedClients: 15,
      nextDue: "2024-01-15"
    },
    {
      id: 8,
      title: "Rental Income Tax",
      description: "Tax on rental income from property",
      dueDate: "20th of every month",
      frequency: "Monthly",
      authority: "KRA",
      penalty: "25% of tax due",
      status: "pending",
      affectedClients: 5,
      nextDue: "2024-01-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Kenya Tax Obligations</h3>
          <p className="text-gray-600">Comprehensive list of tax obligations in Kenya</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Obligation
        </Button>
      </div>

      <div className="grid gap-4">
        {kenyaObligations.map((obligation) => (
          <Card key={obligation.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(obligation.status)}
                  <div>
                    <CardTitle className="text-lg">{obligation.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{obligation.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(obligation.status)}>
                  {obligation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Due Date</p>
                  <p className="text-sm text-gray-600">{obligation.dueDate}</p>
                  <p className="text-xs text-gray-500">Next: {obligation.nextDue}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Authority</p>
                  <p className="text-sm text-gray-600">{obligation.authority}</p>
                  <p className="text-xs text-gray-500">{obligation.frequency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Affected Clients</p>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{obligation.affectedClients} clients</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800">Penalty for Late Filing</p>
                <p className="text-sm text-red-700">{obligation.penalty}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm">Set Reminder</Button>
                <Button variant="outline" size="sm">Assign Clients</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
