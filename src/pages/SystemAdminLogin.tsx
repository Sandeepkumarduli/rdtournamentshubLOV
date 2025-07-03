import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ShieldCheck, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo system admin credentials
    if (formData.username === "1234" && formData.password === "1234") {
      localStorage.setItem("userAuth", JSON.stringify({
        username: "systemadmin",
        role: "systemadmin",
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "System Admin Login Successful!",
        description: "Welcome to the system administration dashboard",
      });
      
      navigate("/system-admin-dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid system admin credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              System Control
            </h1>
          </div>
          <p className="text-muted-foreground">Highest level system administration access</p>
        </div>

        <Card className="gaming-card-glow border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              System Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">System Admin ID</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter system admin ID"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">System Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter system password"
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

              <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1 text-primary">Demo Credentials:</p>
                <p className="text-primary/80">Username: 1234</p>
                <p className="text-primary/80">Password: 1234</p>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <Crown className="h-4 w-4" />
                Access System Control
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                ← Back to Player Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminLogin;