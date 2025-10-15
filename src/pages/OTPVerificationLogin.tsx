import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GamepadIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseOTP } from '@/hooks/useFirebaseOTP';
import OTPInput from '@/components/OTPInput';
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
  const { sendOTP, verifyOTP, isLoading, verificationId } = useFirebaseOTP();
  
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const data = location.state?.loginData;
    if (!data) {
      navigate('/login');
      return;
    }
    setLoginData(data);
    
    // Send OTP automatically when component mounts, but only once
    if (!otpSent && !isLoading) {
      console.log('🚀 Auto-sending OTP on component mount');
      sendOTP(data.phone).then((success) => {
        if (success) {
          setOtpSent(true);
        }
      });
    }
  }, [location.state, navigate, sendOTP, otpSent, isLoading]);

  const handleVerificationSuccess = async (verificationId: string, code: string) => {
    if (!loginData) return;
    
    setIsVerifying(true);
    
    try {
      // Verify OTP with Firebase
      const isVerified = await verifyOTP(verificationId, code);
      
      if (isVerified) {
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
          navigate("/dashboard"); // Default fallback
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    if (loginData) {
      console.log('🔄 Manually resending OTP');
      sendOTP(loginData.phone).then((success) => {
        if (success) {
          setOtpSent(true);
        }
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
              RDTH - RD Tournaments Hub
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

        <div className="flex justify-center">
          <OTPInput
            phoneNumber={loginData.phone}
            onVerificationSuccess={handleVerificationSuccess}
            onResend={handleResendOTP}
            isLoading={isLoading || isVerifying}
            verificationId={verificationId}
          />
        </div>

        {/* Hidden recaptcha container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default OTPVerificationLogin;