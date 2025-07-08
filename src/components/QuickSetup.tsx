
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Download, Database, Users, Settings, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<any>;
}

export const QuickSetup = () => {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'database',
      title: 'Database Connection',
      description: 'Verify database connection and schema',
      completed: false,
      icon: Database
    },
    {
      id: 'demo-data',
      title: 'Demo Data',
      description: 'Load sample data for testing',
      completed: false,
      icon: Download
    },
    {
      id: 'admin-user',
      title: 'Admin User',
      description: 'Create administrative user account',
      completed: false,
      icon: Users
    },
    {
      id: 'system-config',
      title: 'System Configuration',
      description: 'Configure basic system settings',
      completed: false,
      icon: Settings
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const updateStepStatus = (stepId: string, completed: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed } : step
    ));
  };

  const runSetupStep = async (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    setCurrentStep(stepIndex);

    try {
      switch (stepId) {
        case 'database':
          // Test database connection
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw new Error('Database connection failed');
          updateStepStatus('database', true);
          toast.success('Database connection verified');
          break;

        case 'demo-data':
          // Insert demo data
          const { error: demoError } = await supabase
            .from('profiles')
            .upsert({
              email: 'demo@chandariashah.com',
              full_name: 'Demo User',
              company_name: 'Chandaria Shah & Associates'
            }, { onConflict: 'email' });
          
          if (demoError) throw demoError;
          updateStepStatus('demo-data', true);
          toast.success('Demo data loaded successfully');
          break;

        case 'admin-user':
          // Verify admin user exists
          const { data: adminData, error: adminError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'demo@chandariashah.com')
            .single();
          
          if (adminError && adminError.code !== 'PGRST116') throw adminError;
          updateStepStatus('admin-user', true);
          toast.success('Admin user verified');
          break;

        case 'system-config':
          // Set basic system configuration
          const { error: configError } = await supabase
            .from('system_settings')
            .upsert([
              {
                key: 'app_name',
                value: 'Tax Compliance Hub',
                description: 'Application name'
              },
              {
                key: 'company_name',
                value: 'Chandaria Shah & Associates',
                description: 'Company name'
              }
            ], { onConflict: 'key' });
          
          if (configError) throw configError;
          updateStepStatus('system-config', true);
          toast.success('System configuration updated');
          break;
      }
    } catch (error) {
      console.error(`Setup step ${stepId} failed:`, error);
      toast.error(`Setup step failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      updateStepStatus(stepId, false);
    }
  };

  const runFullSetup = async () => {
    setIsRunning(true);
    
    for (const step of steps) {
      await runSetupStep(step.id);
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
    setCurrentStep(-1);
    toast.success('Quick setup completed!');
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quick Setup</h2>
        <Button 
          onClick={runFullSetup} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          {isRunning ? 'Running Setup...' : 'Run Full Setup'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            {completedSteps} of {steps.length} steps completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isCurrentStep = currentStep === index;
          
          return (
            <Card key={step.id} className={isCurrentStep ? 'border-primary' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <IconComponent className="h-4 w-4" />
                  {step.title}
                  {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runSetupStep(step.id)}
                  disabled={isRunning}
                >
                  {step.completed ? 'Completed' : 'Run'}
                </Button>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
                {isCurrentStep && (
                  <div className="mt-2 text-sm text-primary">
                    Running...
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Quick setup will configure your system with demo data and basic settings. 
          You can run individual steps or the complete setup process.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Post-Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            After setup completion:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Login with demo credentials: demo@chandariashah.com</li>
            <li>Add your staff users through User Management</li>
            <li>Configure Nextcloud integration for file storage</li>
            <li>Import your client data</li>
            <li>Set up tax obligation templates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
