import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, GamepadIcon, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_CREDENTIALS } from "@/config/auth";
import LoadingSpinner from "@/components/LoadingSpinner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (formData.username === DEFAULT_CREDENTIALS.user.username && 
        formData.password === DEFAULT_CREDENTIALS.user.password) {
      localStorage.setItem("userAuth", JSON.stringify({
        username: formData.username,
        role: "user",
        email: DEFAULT_CREDENTIALS.user.email,
        wallet: { balance: 100 },
        teams: []
      }));
      
      toast({
        title: "Login Successful!",
        description: "Welcome to BGMI Tournament Hub",
      });
      
      navigate("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Use 1234/1234 for demo access",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BGMI Tournament Hub
            </h1>
          </div>
          <p className="text-muted-foreground">Login to access your gaming dashboard</p>
        </div>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-center text-xl">Player Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" variant="gaming" className="w-full">
                Login to Dashboard
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up here
                </Link>
              </div>
              
              <div className="flex gap-2">
                <Button variant="gaming-outline" size="sm" asChild className="flex-1">
                  <Link to="/adminlogin">
                    <Shield className="h-4 w-4" />
                    Admin Login
                  </Link>
                </Button>
                <Button variant="gaming-outline" size="sm" asChild className="flex-1">
                  <Link to="/systemadminlogin">
                    <Shield className="h-4 w-4" />
                    System Admin
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;