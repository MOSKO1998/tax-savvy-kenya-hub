
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, UserPlus, Calendar, FileText, Bell, Settings } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
  userRole?: any;
}

export const QuickActions = ({ onAction, userRole }: QuickActionsProps) => {
  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    if (userRole.permissions?.includes('all')) return true;
    return userRole.permissions?.includes(permission) || false;
  };

  const actions = [
    {
      id: 'upload-document',
      label: 'Upload Document',
      icon: Upload,
      permission: 'document_create',
      action: () => onAction('documents')
    },
    {
      id: 'add-client',
      label: 'Add Client',
      icon: UserPlus,
      permission: 'client_management',
      action: () => onAction('clients')
    },
    {
      id: 'create-obligation',
      label: 'New Tax Obligation',
      icon: Calendar,
      permission: 'tax_management',
      action: () => onAction('obligations')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      permission: 'report_generation',
      action: () => onAction('documents')
    },
    {
      id: 'notifications',
      label: 'View Notifications',
      icon: Bell,
      permission: null,
      action: () => onAction('notifications')
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      permission: 'system_settings',
      action: () => onAction('settings')
    }
  ];

  const availableActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                onClick={action.action}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
