import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyPhone = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { phone, userId, password, email } = location.state || {};

  useEffect(() => {
    if (!phone || !userId) {
      navigate('/signup');
      return;
    }

    // Ensure user has valid session before sending OTP
    const ensureSessionAndSendOTP = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, sign in first
      if (!session && email && password) {
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      }
      
      // Wait a moment for session to be ready, then send OTP
      setTimeout(() => {
        sendPhoneOTP();
      }, 1000);
    };

    ensureSessionAndSendOTP();
  }, [phone, userId, email, password]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendPhoneOTP = async () => {
    setIsSendingOTP(true);
    try {
      // Link phone number to existing account and send OTP
      const { error } = await supabase.auth.updateUser({
        phone: phone
      });

      if (error) throw error;

      setCountdown(60);
      
      toast({
        title: "OTP Sent",
        description: "Verification code sent to your phone via SMS",
      });
    } catch (error: any) {
      console.error('OTP Error:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Unable to send verification code. Please try again.",
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
      // Verify the phone OTP
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'phone_change'
      });

      if (error) throw error;

      // Update profile to mark phone as verified
      if (userId) {
        await supabase
          .from('profiles')
          .update({ phone: phone })
          .eq('user_id', userId);
      }

      toast({
        title: "Account Created Successfully!",
        description: "Both email and phone have been verified. You can now login.",
      });

      // Sign out the user so they need to login properly
      await supabase.auth.signOut();

      setTimeout(() => navigate('/login'), 2000);
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
          <p className="text-muted-foreground">Step 2: Verify your phone number</p>
        </div>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Verifying: {phone}</p>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit OTP sent to your phone
              </p>
            </div>

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
              variant="gaming"
              className="w-full"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Create Account"
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
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/verify-email" className="text-primary hover:underline">
            ← Back to Email Verification
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
