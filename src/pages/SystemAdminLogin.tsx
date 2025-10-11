import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ShieldCheck, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, session, loading } = useAuth();

  // Debug: Check if user is already logged in
  console.log('🔍 SystemAdminLogin component - Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userId: user?.id
  });

  // Show loading spinner while checking auth state
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login Successful!",
          description: "Welcome back to RDTH"
        });

        // Check if user is frozen and redirect accordingly
        const { data: freezeRecord } = await supabase
          .from('user_freeze_status')
          .select('is_frozen')
          .eq('user_id', data.user.id)
          .maybeSingle();

        // Also check user's role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, display_name, email')
          .eq('user_id', data.user.id)
          .single();

        console.log('🔍 SystemAdminLogin freeze check result:', freezeRecord);
        console.log('🔍 User profile:', profile);
        console.log('🔍 Profile error:', profileError);

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
          toast({
            title: "Profile Error",
            description: "Could not fetch user profile. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        // Use setTimeout to ensure navigation happens after toast
        setTimeout(() => {
          if (freezeRecord?.is_frozen) {
            console.log('🚫 User is frozen, redirecting to reports page');
            navigate("/dashboard/report");
          } else {
            console.log('✅ User is active, checking role for redirect');
            
            // Redirect based on user role
            if (profile.role === 'admin') {
              console.log('🔄 Admin user, redirecting to org-dashboard');
              navigate("/org-dashboard");
            } else if (profile.role === 'systemadmin') {
              console.log('🔄 System admin user, redirecting to system-admin-dashboard');
              navigate("/system-admin-dashboard");
            } else {
              console.log('🔄 Regular user, redirecting to dashboard');
              navigate("/dashboard");
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error during login:', err);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
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
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email">System Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter system admin email"
                  autoComplete="off"
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
                    autoComplete="off"
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


              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                <Crown className="h-4 w-4" />
                {isLoading ? "Signing In..." : "Access System Control"}
              </Button>
            </form>

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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminLogin;