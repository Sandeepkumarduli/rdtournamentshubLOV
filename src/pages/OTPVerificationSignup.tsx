import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GamepadIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseOTP } from '@/hooks/useFirebaseOTP';
import OTPInput from '@/components/OTPInput';
import { supabase } from '@/integrations/supabase/client';

interface SignupData {
  username: string;
  email: string;
  password: string;
  bgmiId: string;
  phone: string;
}

const OTPVerificationSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { sendOTP, verifyOTP, isLoading, verificationId } = useFirebaseOTP();
  
  const [signupData, setSignupData] = useState<SignupData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const data = location.state?.signupData;
    if (!data) {
      navigate('/signup');
      return;
    }
    setSignupData(data);
    
    // Send OTP automatically when component mounts
    sendOTP(data.phone);
  }, [location.state, navigate, sendOTP]);

  const handleVerificationSuccess = async (verificationId: string, code: string) => {
    if (!signupData) return;
    
    setIsVerifying(true);
    
    try {
      // Verify OTP with Firebase
      const isVerified = await verifyOTP(verificationId, code);
      
      if (isVerified) {
        // Create Supabase account after OTP verification
        const { data, error } = await signUp(signupData.email, signupData.password, signupData.username);
        
        if (error) {
          toast({
            title: "Account Creation Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          // Update profile with additional info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              bgmi_id: signupData.bgmiId,
              display_name: signupData.username,
              phone: signupData.phone,
            })
            .eq('user_id', data.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }

          toast({
            title: "Account Created Successfully!",
            description: "Welcome to RDTH. You can now login with your credentials.",
          });
          
          navigate('/login');
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
    if (signupData) {
      sendOTP(signupData.phone);
    }
  };

  const handleGoBack = () => {
    navigate('/signup', { state: { formData: signupData } });
  };

  if (!signupData) {
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
          <p className="text-muted-foreground">Complete your account verification</p>
        </div>

        <div className="flex justify-center mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Signup
          </Button>
        </div>

        <div className="flex justify-center">
          <OTPInput
            phoneNumber={signupData.phone}
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

export default OTPVerificationSignup;