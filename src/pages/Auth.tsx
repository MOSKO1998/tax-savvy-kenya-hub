
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Login error:', error);
          toast({
            title: "Login Error",
            description: error.message || "Invalid email or password",
            variant: "destructive",
          });
        } else {
          console.log('Login successful');
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
          navigate("/");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Attempting signup with:', formData.email);
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          console.error('Signup error:', error);
          toast({
            title: "Sign Up Error",
            description: error.message || "Failed to create account",
            variant: "destructive",
          });
        } else {
          console.log('Signup successful');
          toast({
            title: "Success",
            description: "Account created successfully!",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    console.log('Attempting demo login');
    
    try {
      const { error } = await signIn("demo@chandariashah.com", "demo123");
      if (error) {
        console.error('Demo login error:', error);
        toast({
          title: "Demo Login Failed",
          description: "Please try creating a new account instead",
          variant: "destructive",
        });
      } else {
        console.log('Demo login successful');
        toast({
          title: "Demo Mode",
          description: "Welcome to the demo!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Demo login exception:', error);
      toast({
        title: "Demo Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Compliance Hub</h1>
          <p className="text-gray-600 mt-2">Kenya's premier tax compliance platform</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-center text-gray-600">
              {isLogin ? "Sign in to your account" : "Sign up for a new account"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

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

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full"
                disabled={loading}
              >
                <User className="h-4 w-4 mr-2" />
                Try Demo Login
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </div>

            <Alert className="mt-4">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Credentials:</strong><br />
                Email: demo@chandariashah.com<br />
                Password: demo123
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
