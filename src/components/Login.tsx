
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Calendar, User } from "lucide-react";

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Demo accounts
  const demoAccounts = [
    {
      id: 1,
      email: "admin@taxtrucker.com",
      password: "admin123",
      name: "John Admin",
      role: "Admin",
      department: "Management",
      permissions: ["all"]
    },
    {
      id: 2,
      email: "taxstaff@taxtrucker.com",
      password: "tax123",
      name: "Jane Tax Officer",
      role: "Tax Staff",
      department: "Tax",
      permissions: ["tax_management", "client_management", "document_view"]
    },
    {
      id: 3,
      email: "readonly@taxtrucker.com",
      password: "read123",
      name: "Mike Viewer",
      role: "Readonly",
      department: "Audit",
      permissions: ["view_only"]
    },
    {
      id: 4,
      email: "it@taxtrucker.com",
      password: "it123",
      name: "Sarah IT Support",
      role: "IT",
      department: "IT",
      permissions: ["system_settings", "user_management"]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      const user = demoAccounts.find(
        account => account.email === formData.email && account.password === formData.password
      );
      
      if (user) {
        onLogin(user);
      } else {
        alert("Invalid credentials. Please use demo accounts or check your login details.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (account: any) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(account);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Tax Tracker Hub</h1>
            <p className="text-gray-600 mt-2">Kenya's premier tax compliance platform</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <p className="text-center text-gray-600">Sign in to your account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Button variant="link" className="text-sm p-0">
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <Separator className="my-6" />

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> Use the demo accounts on the right to test different user roles and permissions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Demo Accounts */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Demo Accounts</CardTitle>
              <p className="text-gray-600">Click any account below to login instantly</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleDemoLogin(account)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.email}</p>
                      <div className="flex space-x-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {account.role}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {account.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Password: {account.password}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2024 Tax Tracker Hub. Built for Kenya's tax compliance needs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
