import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, GamepadIcon, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useFirebaseOTP } from "@/hooks/useFirebaseOTP";
import OTPInput from "@/components/OTPInput";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const { sendOTP, verifyOTP, isLoading: otpLoading, verificationId } = useFirebaseOTP();

  const handleLogin = async (e: React.FormEvent) => {
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
      toast({
        title: "Login Successful!",
        description: "Welcome back to RDTH"
      });
      
      try {
        const { data: freezeRecord } = await supabase
          .from('user_freeze_status')
          .select('is_frozen')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (freezeRecord?.is_frozen) {
          navigate("/dashboard/report");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error('Error checking freeze status during login:', err);
        navigate("/dashboard");
      }
    }
    
    setIsLoading(false);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Indian phone number",
        variant: "destructive",
      });
      return;
    }

    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    // Check if account exists with this phone
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', formattedPhone)
      .single();

    if (error || !profile) {
      toast({
        title: "Account Not Found",
        description: "No account exists with this phone number. Please sign up first.",
        variant: "destructive",
      });
      return;
    }

    // Send OTP
    const success = await sendOTP(phoneNumber);
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = async (verificationId: string, code: string) => {
    if (!verificationId || !code) return;
    
    setIsVerifying(true);
    
    try {
      // Verify OTP
      const verified = await verifyOTP(verificationId, code);
      
      if (verified) {
        // Format phone number
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
        }

        // Call edge function to get magic link
        const { data, error } = await supabase.functions.invoke('phone-login', {
          body: { phone: formattedPhone }
        });

        if (error || data.error) {
          throw new Error(data?.error || error?.message || "Failed to login");
        }

        // Use the magic link to sign in
        if (data.magic_link) {
          // Extract the token from the magic link
          const url = new URL(data.magic_link);
          const token = url.searchParams.get('token');
          const type = url.searchParams.get('type');

          if (token && type) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: type as any,
            });

            if (verifyError) throw verifyError;

            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              toast({
                title: "Login Successful!",
                description: "Welcome back to RDTH"
              });

              try {
                const { data: freezeRecord } = await supabase
                  .from('user_freeze_status')
                  .select('is_frozen')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (freezeRecord?.is_frozen) {
                  navigate("/dashboard/report");
                } else {
                  navigate("/dashboard");
                }
              } catch (err) {
                console.error('Error checking freeze status:', err);
                navigate("/dashboard");
              }
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login with phone number",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    sendOTP(phoneNumber);
  };
  return <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH - RD Tournaments Hub
            </h1>
          </div>
          <p className="text-muted-foreground">Login to access your gaming dashboard</p>
        </div>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-center text-xl">Player Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      placeholder="Enter your email" 
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
                        onChange={e => setFormData({ ...formData, password: e.target.value })} 
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" variant="gaming" className="w-full font-normal" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner /> : "Login to Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        placeholder="+91 9876543210" 
                        required 
                      />
                      <p className="text-xs text-muted-foreground">
                        Login with the phone number linked to your account
                      </p>
                    </div>

                    <Button type="submit" variant="gaming" className="w-full" disabled={otpLoading}>
                      {otpLoading ? <LoadingSpinner /> : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit OTP sent to {phoneNumber}
                      </p>
                    </div>

                    <OTPInput
                      phoneNumber={phoneNumber}
                      onVerificationSuccess={handleVerifyOTP}
                      onResend={handleResendOTP}
                      isLoading={otpLoading || isVerifying}
                      verificationId={verificationId}
                    />

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                      }}
                      disabled={isVerifying}
                    >
                      Change Number
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up here
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-primary hover:underline text-sm"
                >
                  ← Back to Homepage
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden recaptcha container for Firebase */}
        <div id="recaptcha-container"></div>
      </div>
    </div>;
};
export default Login;