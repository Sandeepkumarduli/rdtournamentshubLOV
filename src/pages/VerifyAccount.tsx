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
  
  const { email, phone, userId } = location.state || {};

  useEffect(() => {
    if (!email || !phone) {
      navigate('/signup');
      return;
    }

    // Send initial OTP
    sendPhoneOTP();

    // Check email verification status periodically
    const interval = setInterval(checkEmailVerification, 3000);
    return () => clearInterval(interval);
  }, [email, phone]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkEmailVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  const sendPhoneOTP = async () => {
    setIsSendingOTP(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) throw error;

      setCountdown(60);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phone}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again later.",
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
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

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

  useEffect(() => {
    if (emailVerified && phoneVerified) {
      toast({
        title: "Account Verified!",
        description: "You can now login to your account",
      });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [emailVerified, phoneVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH - RD Tournaments Hub
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
                <p className="text-xs text-muted-foreground">
                  Please check your email and click the confirmation link
                </p>
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

                  <Button
                    variant="outline"
                    onClick={sendPhoneOTP}
                    className="w-full"
                    disabled={countdown > 0 || isSendingOTP}
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend OTP in ${countdown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
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
