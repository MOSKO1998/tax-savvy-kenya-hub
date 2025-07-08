
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Database, 
  User, 
  Key, 
  Cloud, 
  CheckCircle,
  AlertTriangle,
  Copy
} from 'lucide-react';

export const QuickSetup = () => {
  const [dbSettings, setDbSettings] = useState({
    host: 'localhost',
    port: '5432',
    database: 'tax_compliance_hub',
    username: 'tax_admin',
    password: 'secure_password_123'
  });
  
  const [nextcloudSettings, setNextcloudSettings] = useState({
    url: 'https://cloud.audit.ke',
    username: 'it@csa.co.ke',
    password: 'Wakatiimefika@1998'
  });

  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const dockerComposeCommand = `docker-compose -f local-setup/docker-compose.yml up -d`;
  const envFileContent = `DATABASE_URL=postgresql://${dbSettings.username}:${dbSettings.password}@${dbSettings.host}:${dbSettings.port}/${dbSettings.database}
NEXTCLOUD_URL=${nextcloudSettings.url}
NEXTCLOUD_USERNAME=${nextcloudSettings.username}
NEXTCLOUD_PASSWORD=${nextcloudSettings.password}
VITE_SUPABASE_URL=https://hqjmoxufpgaulcwujruv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxam1veHVmcGdhdWxjd3VqcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTA0NDMsImV4cCI6MjA2NTcyNjQ0M30.DMBiE8fVvq3k9PP7kwZjYfEfS2HKASbOKL3dbACAja0`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Setup Guide
          </CardTitle>
          <CardDescription>
            Configure your Tax Compliance Hub deployment settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="docker" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="docker">Docker</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="xampp">XAMPP</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="docker" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium">Docker Deployment (Recommended)</h3>
                </div>
                
                <div className="space-y-2">
                  <Label>1. Start all services with Docker Compose:</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <code className="flex-1 text-sm">{dockerComposeCommand}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dockerComposeCommand, 'Docker command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Application</h4>
                    <p className="text-sm text-muted-foreground">http://localhost:3000</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">pgAdmin</h4>
                    <p className="text-sm text-muted-foreground">http://localhost:8080</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">PostgreSQL</h4>
                    <p className="text-sm text-muted-foreground">localhost:5432</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-medium">Manual Installation Steps</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Install PostgreSQL</p>
                      <code className="text-sm text-muted-foreground">sudo apt install postgresql postgresql-contrib</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Install Node.js 18+</p>
                      <code className="text-sm text-muted-foreground">curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Setup Database</p>
                      <code className="text-sm text-muted-foreground">sudo -u postgres createuser -P tax_admin</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">Install Dependencies</p>
                      <code className="text-sm text-muted-foreground">npm install && npm run dev</code>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="xampp" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium">XAMPP Setup</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Install XAMPP</p>
                      <code className="text-sm text-muted-foreground">wget https://www.apachefriends.org/xampp-files/8.2.12/xampp-linux-x64-8.2.12-0-installer.run</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Install PostgreSQL separately</p>
                      <code className="text-sm text-muted-foreground">sudo apt install postgresql postgresql-contrib</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Start XAMPP</p>
                      <code className="text-sm text-muted-foreground">sudo /opt/lampp/lampp start</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">Run Application</p>
                      <code className="text-sm text-muted-foreground">npm run dev</code>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="env" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-medium">Environment Configuration</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Database Settings</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        placeholder="Host"
                        value={dbSettings.host}
                        onChange={(e) => setDbSettings({...dbSettings, host: e.target.value})}
                      />
                      <Input
                        placeholder="Port"
                        value={dbSettings.port}
                        onChange={(e) => setDbSettings({...dbSettings, port: e.target.value})}
                      />
                      <Input
                        placeholder="Database"
                        value={dbSettings.database}
                        onChange={(e) => setDbSettings({...dbSettings, database: e.target.value})}
                      />
                      <Input
                        placeholder="Username"
                        value={dbSettings.username}
                        onChange={(e) => setDbSettings({...dbSettings, username: e.target.value})}
                      />
                      <Input
                        placeholder="Password"
                        type="password"
                        value={dbSettings.password}
                        onChange={(e) => setDbSettings({...dbSettings, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Nextcloud Settings</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <Input
                        placeholder="Nextcloud URL"
                        value={nextcloudSettings.url}
                        onChange={(e) => setNextcloudSettings({...nextcloudSettings, url: e.target.value})}
                      />
                      <Input
                        placeholder="Username"
                        value={nextcloudSettings.username}
                        onChange={(e) => setNextcloudSettings({...nextcloudSettings, username: e.target.value})}
                      />
                      <Input
                        placeholder="Password"
                        type="password"
                        value={nextcloudSettings.password}
                        onChange={(e) => setNextcloudSettings({...nextcloudSettings, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Generated .env.local file</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(envFileContent, 'Environment file')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <textarea
                      className="w-full h-32 p-3 mt-2 text-sm font-mono bg-gray-100 rounded-lg"
                      value={envFileContent}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
