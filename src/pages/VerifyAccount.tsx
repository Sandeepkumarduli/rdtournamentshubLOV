import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, Mail, Phone, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { email, phone, userId, password } = location.state || {};

  useEffect(() => {
    if (!email || !phone || !userId) {
      // Check if user came from email confirmation link
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User confirmed email, redirect to login
          toast({
            title: "Email Verified!",
            description: "Your email has been confirmed. Please login to continue.",
          });
          setTimeout(() => navigate('/login'), 2000);
        } else {
          navigate('/signup');
        }
      };
      checkSession();
      return;
    }

    // Ensure user is logged in after signup
    const ensureSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session exists, sign in the user
      if (!session && password) {
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      }
    };

    ensureSession();

    // Check for email confirmation from redirect
    const checkEmailConfirmation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    };

    checkEmailConfirmation();

    // Poll for email verification every 3 seconds
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [email, phone, userId, password, navigate, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Automatically send OTP when page loads after signup
  useEffect(() => {
    if (phone && userId) {
      // Wait a bit for session to be ready, then send OTP
      const timer = setTimeout(() => {
        sendPhoneOTP();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phone, userId]);

  const checkEmailVerification = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  const handleManualRefresh = () => {
    toast({
      title: "Checking Status",
      description: "Refreshing email verification status...",
    });
    checkEmailVerification();
  };

  const sendPhoneOTP = async () => {
    setIsSendingOTP(true);
    try {
      // Use edge function to send OTP for verification (not for auth)
      const { data, error } = await supabase.functions.invoke('phone-login', {
        phone: phone, 
        type: 'send', 
        userId: userId
      });

      if (error) throw error;
      
      if (data?.error) throw new Error(data.error);

      setCountdown(60);
      
      toast({
        title: "OTP Sent",
        description: "Verification code sent to your phone via SMS",
      });
    } catch (error: any) {
      console.error('OTP Error:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Unable to send verification code. Please configure phone provider in Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
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
      // Verify OTP via edge function
      const { data, error } = await supabase.functions.invoke('phone-login', {
        phone: phone, 
        otp: otp, 
        type: 'verify', 
        userId: userId
      });

      if (error) throw error;
      
      if (data?.error) throw new Error(data.error);

      // Update profile to mark phone as verified
      if (userId) {
        await supabase
          .from('profiles')
          .update({ phone: phone })
          .eq('user_id', userId);
      }

      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
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

  const handleSkipPhoneVerification = () => {
    setPhoneVerified(true);
    toast({
      title: "Phone Verification Skipped",
      description: "You can verify your phone number later from your profile",
    });
  };

  useEffect(() => {
    if (emailVerified || phoneVerified) {
      toast({
        title: "Account Verified!",
        description: "You can now login to your account",
      });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [emailVerified, phoneVerified, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH
            </h1>
          </div>
          <p className="text-muted-foreground">Verify your account</p>
        </div>

        <div className="space-y-4">
          {/* Email Verification Card */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{email}</span>
                {emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="text-sm">
                Status: {emailVerified ? (
                  <span className="text-green-500 font-medium">Confirmed</span>
                ) : (
                  <span className="text-yellow-500 font-medium">Pending</span>
                )}
              </div>
              {!emailVerified && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Please check your email and click the confirmation link
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualRefresh}
                    className="w-full"
                  >
                    Refresh Email Status
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Phone Verification Card */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{phone}</span>
                {phoneVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              {!phoneVerified && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter 6-digit OTP</label>
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
                    className="w-full"
                    disabled={isVerifying || otp.length !== 6}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Phone"
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={sendPhoneOTP}
                      className="flex-1"
                      disabled={countdown > 0 || isSendingOTP}
                    >
                      {isSendingOTP ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        `Resend in ${countdown}s`
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkipPhoneVerification}
                      className="flex-1"
                    >
                      Skip for Now
                    </Button>
                  </div>
                </>
              )}
              
              {phoneVerified && (
                <p className="text-sm text-green-500 font-medium">
                  Phone number verified successfully!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline">
            ← Back to Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
