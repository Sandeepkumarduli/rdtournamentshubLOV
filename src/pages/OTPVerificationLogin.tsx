import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GamepadIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

interface LoginData {
  email: string;
  password: string;
  user: any;
  phone: string;
}

const OTPVerificationLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const data = location.state?.loginData;
    if (!data) {
      navigate('/login');
      return;
    }
    setLoginData(data);
    
    // Send OTP automatically when component mounts
    const sendInitialOTP = async () => {
      try {
        const { data: otpData, error } = await supabase.functions.invoke('phone-login', {
          body: { phone: data.phone, type: 'send' }
        });

        if (error) throw error;
        if (otpData?.error) throw new Error(otpData.error);

        setCountdown(60);
        toast({
          title: "OTP Sent",
          description: "Verification code sent to your phone via SMS",
        });
      } catch (error: any) {
        toast({
          title: "Failed to Send OTP",
          description: error.message || "Unable to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    };

    sendInitialOTP();
  }, [location.state, navigate, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (!loginData || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('phone-login', {
        body: { phone: loginData.phone, otp, type: 'verify' }
      });

      if (error || data.error) {
        throw new Error(data?.error || error?.message || "Failed to verify OTP");
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
        
        toast({
          title: "Login Successful!",
          description: "Welcome back to RDTH"
        });
        
        // Check if user is frozen and redirect accordingly
        try {
          const { data: freezeRecord } = await supabase
            .from('user_freeze_status')
            .select('is_frozen')
            .eq('user_id', loginData.user.id)
            .maybeSingle();
          
          if (freezeRecord?.is_frozen) {
            console.log('🚫 User is frozen, redirecting to reports page');
            navigate("/dashboard/report");
          } else {
            console.log('✅ User is active, redirecting to dashboard');
            navigate("/dashboard");
          }
        } catch (err) {
          console.error('Error checking freeze status during login:', err);
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
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!loginData) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('phone-login', {
        body: { phone: loginData.phone, type: 'send' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCountdown(60);
      toast({
        title: "OTP Resent",
        description: "Verification code sent to your phone via SMS",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Unable to resend OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  if (!loginData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH
            </h1>
          </div>
          <p className="text-muted-foreground">Verify your identity to continue</p>
        </div>

        <div className="flex justify-center mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

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

          <Button 
            onClick={handleVerifyOTP}
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              className="flex-1"
              disabled={countdown > 0 || isLoading}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationLogin;