import { useState } from 'react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export const useFirebaseOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const { toast } = useToast();

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        console.log('🔧 Setting up reCAPTCHA verifier...');
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('✅ reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('⏰ reCAPTCHA expired');
          }
        });
        console.log('✅ reCAPTCHA verifier created');
      }
      return window.recaptchaVerifier;
    } catch (error) {
      console.error('❌ Error setting up reCAPTCHA:', error);
      throw error;
    }
  };

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    // Check if Firebase auth is available
    if (!auth) {
      toast({
        title: "Service Unavailable",
        description: "Firebase authentication is not configured. Please contact support.",
        variant: "destructive",
      });
      return false;
    }

    // Prevent sending OTP if already loading
    if (isLoading) {
      console.log('⏳ OTP send already in progress, skipping...');
      return false;
    }

    try {
      console.log('📞 Attempting to send OTP to:', phoneNumber);
      setIsLoading(true);
      
      // Format phone number to international format
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        // Assuming Indian numbers, add +91
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
      }
      console.log('📞 Formatted phone number:', formattedPhone);
      
      const recaptchaVerifier = setupRecaptcha();
      console.log('📞 Calling signInWithPhoneNumber...');
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      setVerificationId(confirmationResult.verificationId);
      console.log('✅ OTP sent successfully, verification ID:', confirmationResult.verificationId);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${formattedPhone}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      toast({
        title: "Failed to Send OTP",
        description: "OTP service is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (verificationId: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    setVerificationId(null);
  };

  return {
    sendOTP,
    verifyOTP,
    resetRecaptcha,
    isLoading,
    verificationId,
  };
};

// Extend window interface for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}