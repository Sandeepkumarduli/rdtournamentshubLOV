import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Shield, Settings, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await signIn(formData.email, formData.password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This account does not have admin privileges",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Admin Login Successful!",
        description: "Welcome to the admin dashboard",
      });
      navigate("/org-dashboard");
    }
    
    setIsLoading(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length !== 12 || !phoneNumber.startsWith('+91')) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with +91 prefix",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      toast({
        title: "OTP Sent Successfully",
        description: "Check your phone for the verification code",
      });
      
      navigate("/admin-otp-verification", { state: { phone: phoneNumber } });
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </div>
          <p className="text-muted-foreground">Administrator access to tournament management</p>
        </div>

        <Card className="gaming-card-glow">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter admin email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Admin Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter admin password"
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

                  <Button type="submit" variant="gaming" className="w-full" disabled={isLoading}>
                    <Shield className="h-4 w-4" />
                    {isLoading ? "Signing In..." : "Access Admin Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <form onSubmit={handlePhoneLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Admin Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91XXXXXXXXXX"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Format: +91 followed by 10 digits</p>
                  </div>

                  <Button type="submit" variant="gaming" className="w-full" disabled={isLoading}>
                    <Phone className="h-4 w-4" />
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
                  ← Back to Player Login
                </Link>
                {" | "}
                <Link to="/admin-signup" className="text-primary hover:underline">
                  Create Admin Account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
