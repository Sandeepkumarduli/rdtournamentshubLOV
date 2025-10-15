import { useState, useEffect } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [showPasswordOtpVerification, setShowPasswordOtpVerification] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  // Function to mask phone number for security (show first 1 and last 3 digits)
  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length <= 4) return cleanPhone;
    
    const firstPart = cleanPhone.substring(0, 1);
    const lastPart = cleanPhone.substring(cleanPhone.length - 3);
    const maskedMiddle = '*'.repeat(cleanPhone.length - 4);
    
    return `${firstPart}${maskedMiddle}${lastPart}`;
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let emailToUse = formData.email;

    // Check if input is an email or username
    const isEmail = formData.email.includes('@');
    
    if (!isEmail) {
      // If it's not an email, treat it as username and lookup email from profiles
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('display_name', formData.email)
        .single();

      if (lookupError || !profile?.email) {
        toast({
          title: "Login Failed",
          description: "Username not found. Please check your username or use email to login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      emailToUse = profile.email;
    }

    const { data, error } = await signIn(emailToUse, formData.password);

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
      // Get user's phone number from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', data.user.id)
        .single();

      if (profileError || !profile?.phone) {
        toast({
          title: "Phone Number Required",
          description: "Please update your profile with a phone number to enable two-factor authentication.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign out temporarily before OTP verification
      await supabase.auth.signOut();

      // Send OTP to user's phone using direct Supabase auth
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: profile.phone,
          options: {
            shouldCreateUser: true,
          }
        });

        if (otpError) throw otpError;

        // Store user ID and phone, show OTP verification UI
        setPendingUserId(data.user.id);
        setUserPhoneNumber(profile.phone);
        setShowPasswordOtpVerification(true);
        setCountdown(60);
        
        toast({
          title: "OTP Sent",
          description: "Please verify your phone number to complete login",
        });
      } catch (error: any) {
        toast({
          title: "Failed to Send OTP",
          description: error.message || "Unable to send OTP. Please try again.",
          variant: "destructive",
        });
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

    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Indian phone number",
        variant: "destructive",
      });
      return;
    }

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (error || !profile) {
      toast({
        title: "Account Not Found",
        description: "No account exists with this phone number. Please sign up first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (otpError) throw otpError;

      setCountdown(60);
      setOtpSent(true);
      
      toast({
        title: "OTP Sent",
        description: "Verification code sent to your phone via SMS",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Unable to send OTP. Please configure phone provider in Supabase.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        throw new Error(error.message || "Failed to verify OTP");
      }

      if (!data.session) {
        throw new Error("Failed to create session");
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
        
        const user = data.user;
        
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
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    if (phoneNumber) {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
      }

      supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      }).then(({ error }) => {
        if (!error) {
          setCountdown(60);
          toast({
            title: "OTP Resent",
            description: "Verification code sent to your phone via SMS",
          });
        } else {
          toast({
            title: "Failed to Send OTP",
            description: error.message || "Unable to send OTP. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleVerifyPasswordOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: userPhoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) {
        throw new Error(error.message || "Failed to verify OTP");
      }

      if (!data.session) {
        throw new Error("Failed to create session");
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
        
        toast({
          title: "Login Successful!",
          description: "Welcome back to RDTH"
        });

        try {
          const { data: freezeRecord } = await supabase
            .from('user_freeze_status')
            .select('is_frozen')
            .eq('user_id', pendingUserId)
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
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendPasswordOTP = () => {
    if (userPhoneNumber) {
      supabase.auth.signInWithOtp({
        phone: userPhoneNumber,
        options: {
          shouldCreateUser: true,
        }
      }).then(({ error }) => {
        if (!error) {
          setCountdown(60);
          toast({
            title: "OTP Resent",
            description: "Verification code sent to your phone via SMS",
          });
        } else {
          toast({
            title: "Failed to Resend OTP",
            description: error.message || "Unable to resend OTP. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH
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
                  Email/Username
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                {!showPasswordOtpVerification ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email or Username</Label>
                      <Input 
                        id="email" 
                        type="text" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        placeholder="Enter your email or username" 
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
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        For security, please verify your identity with the OTP sent to {maskPhoneNumber(userPhoneNumber)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button 
                      onClick={handleVerifyPasswordOTP}
                      variant="gaming" 
                      className="w-full"
                      disabled={isVerifying || otp.length !== 6}
                    >
                      {isVerifying ? <LoadingSpinner /> : "Verify & Complete Login"}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendPasswordOTP}
                        className="flex-1"
                        disabled={countdown > 0}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setShowPasswordOtpVerification(false);
                          setOtp("");
                          setPendingUserId(null);
                        }}
                        disabled={isVerifying}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                )}
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

                    <Button type="submit" variant="gaming" className="w-full" disabled={isLoading}>
                      {isLoading ? <LoadingSpinner /> : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit OTP sent to {maskPhoneNumber(phoneNumber)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>

                    <Button 
                      onClick={handleVerifyOTP}
                      variant="gaming" 
                      className="w-full"
                      disabled={isVerifying || otp.length !== 6}
                    >
                      {isVerifying ? <LoadingSpinner /> : "Verify & Login"}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOTP}
                        className="flex-1"
                        disabled={countdown > 0}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        disabled={isVerifying}
                      >
                        Change Number
                      </Button>
                    </div>
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
      </div>
    </div>;
};
export default Login;