
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseMigration } from './DatabaseMigration';
import { SystemStatus } from './SystemStatus';
import { QuickSetup } from './QuickSetup';
import { Settings as SettingsIcon, Database, Monitor, Wrench } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Migration
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <QuickSetup />
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <DatabaseMigration />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4">
            {/* Advanced settings can be added here */}
            <div className="text-center p-8 text-muted-foreground">
              Advanced settings coming soon...
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
