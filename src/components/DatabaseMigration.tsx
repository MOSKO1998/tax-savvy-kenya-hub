import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Database, Download, Upload, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataExportService } from '@/services/dataExportService';
import { hybridDataService } from '@/services/hybridDataService';

interface ExportOptions {
  includeClients: boolean;
  includeTaxObligations: boolean;
  includeDocuments: boolean;
  includeNotifications: boolean;
}

export const DatabaseMigration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [localConnected, setLocalConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeClients: true,
    includeTaxObligations: true,
    includeDocuments: true,
    includeNotifications: false
  });

  React.useEffect(() => {
    checkLocalConnection();
  }, []);

  const checkLocalConnection = async () => {
    try {
      // Simulate local DB connection check
      setLocalConnected(false); // Always false since local DB is not available
    } catch (error) {
      console.error('Local DB connection check failed:', error);
      setLocalConnected(false);
    }
  };

  const handleExportToLocal = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await dataExportService.exportToLocal(exportOptions);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success) {
        toast({
          title: "Export Successful",
          description: `Exported ${result.stats?.clients || 0} clients, ${result.stats?.taxObligations || 0} tax obligations, ${result.stats?.documents || 0} documents, ${result.stats?.notifications || 0} notifications`,
        });
        setLastSync(new Date().toLocaleString());
      } else {
        toast({
          title: "Export Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImportFromLocal = async () => {
    setIsImporting(true);
    
    try {
      const result = await dataExportService.importFromLocal(exportOptions);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.stats?.clients || 0} clients, ${result.stats?.taxObligations || 0} tax obligations`,
        });
        setLastSync(new Date().toLocaleString());
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const result = await hybridDataService.syncData();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
        });
        setLastSync(new Date().toLocaleString());
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration & Synchronization
          </CardTitle>
          <CardDescription>
            Export data from cloud to local PostgreSQL database or sync between both systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div>
                <p className="font-medium">Local PostgreSQL Database</p>
                <p className="text-sm text-muted-foreground">
                  Connection to local database instance
                </p>
              </div>
            </div>
            <Badge variant={localConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {localConnected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {localConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {!localConnected && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Local database not connected</p>
                <p>Make sure PostgreSQL is running and configured properly. Check the local setup guide for instructions.</p>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="clients"
                  checked={exportOptions.includeClients}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeClients: checked }))
                  }
                />
                <Label htmlFor="clients">Clients</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="obligations"
                  checked={exportOptions.includeTaxObligations}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeTaxObligations: checked }))
                  }
                />
                <Label htmlFor="obligations">Tax Obligations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="documents"
                  checked={exportOptions.includeDocuments}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeDocuments: checked }))
                  }
                />
                <Label htmlFor="documents">Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={exportOptions.includeNotifications}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeNotifications: checked }))
                  }
                />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exporting data...</span>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportToLocal}
              disabled={!localConnected || isExporting || isImporting || isSyncing}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export to Local'}
            </Button>
            
            <Button
              onClick={handleImportFromLocal}
              disabled={!localConnected || isExporting || isImporting || isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import from Local'}
            </Button>
            
            <Button
              onClick={handleSync}
              disabled={!localConnected || isExporting || isImporting || isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isSyncing ? 'Syncing...' : 'Bi-Directional Sync'}
            </Button>

            <Button
              onClick={checkLocalConnection}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Test Connection
            </Button>
          </div>

          {/* Last Sync Info */}
          {lastSync && (
            <div className="text-sm text-muted-foreground">
              Last synchronized: {lastSync}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
