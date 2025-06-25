
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, User, Building, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    companyName: ""
  });

  // Demo account credentials
  const demoAccount = {
    email: "demo@chandariashah.com",
    password: "demo123"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Login attempt for:', loginData.email);
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Login error:', error);
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Signup attempt for:', signupData.email);
      
      // Validate required fields
      if (!signupData.email || !signupData.password || !signupData.fullName || !signupData.username || !signupData.companyName) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (signupData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { error } = await signUp(
        signupData.email, 
        signupData.password, 
        signupData.fullName,
        {
          username: signupData.username,
          company_name: signupData.companyName
        }
      );
      
      if (error) {
        console.error('Signup error:', error);
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message?.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message?.includes('Unable to validate email address')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message?.toLowerCase().includes('database')) {
          errorMessage = 'There was an issue creating your account. Please try again or contact support if the problem persists.';
        }
        
        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Signup successful');
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully. You can now sign in.",
        });
        
        // Switch to login tab and pre-fill email
        setActiveTab("login");
        setLoginData(prev => ({ ...prev, email: signupData.email }));
        
        // Clear signup form
        setSignupData({
          email: "",
          password: "",
          fullName: "",
          username: "",
          companyName: ""
        });
      }
    } catch (error) {
      console.error('Signup exception:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log('Demo login attempt');
      const { error } = await signIn(demoAccount.email, demoAccount.password);
      
      if (error) {
        toast({
          title: "Demo Login Failed",
          description: "Demo account not available. Please create a new account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demo Mode",
          description: "You are now logged in with demo data.",
        });
      }
    } catch (error) {
      console.error('Demo login exception:', error);
      toast({
        title: "Demo Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/26146ce5-9226-4721-877a-24eb240daffe.png" 
              alt="Chandaria Shah & Associates" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Tax Compliance Hub</h1>
          <p className="text-gray-600 text-sm">Chandaria Shah & Associates LLP</p>
          <p className="text-blue-500 text-xs mt-1">Certified Public Accountants (K)</p>
        </div>

        <Card className="shadow-xl border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
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
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50" 
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <User className="h-4 w-4 mr-2" />
                  Demo Login
                </Button>

                <Alert className="border-blue-200 bg-blue-50">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Demo Credentials:</strong><br />
                    Email: demo@chandariashah.com<br />
                    Password: demo123
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        className="pl-10"
                        value={signupData.username}
                        onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="company-name"
                        type="text"
                        placeholder="Enter your company name"
                        className="pl-10"
                        value={signupData.companyName}
                        onChange={(e) => setSignupData(prev => ({ ...prev, companyName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password * (min. 6 characters)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
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

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <Alert className="border-blue-200 bg-blue-50">
                  <UserPlus className="h-4 w-4" />
                  <AlertDescription>
                    <strong>New users get full admin access</strong> to manage their company's tax compliance data with Chandaria Shah & Associates.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 Chandaria Shah & Associates LLP</p>
          <p className="text-xs text-blue-600">Certified Public Accountants - Kenya</p>
        </div>
      </div>
    </div>
  );
};
