import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    if (isLoading) {
      console.log('⏳ OTP send already in progress, skipping...');
      return false;
    }

    try {
      console.log('📞 Attempting to send OTP...');
      setIsLoading(true);
      
      // Format phone number to international format
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        // Assuming Indian numbers, add +91
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      console.log('✅ OTP sent successfully');
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your phone`,
      });
      
      return true;
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      
      toast({
        title: "Failed to Send OTP",
        description: error.message || "OTP service is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Format phone number
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Phone Verified",
          description: "Your phone number has been successfully verified",
        });
        return true;
      }
      
      return false;
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

  return {
    sendOTP,
    verifyOTP,
    isLoading,
  };
};
