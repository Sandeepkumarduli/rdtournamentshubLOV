import React, { useState, useRef, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OTPInputProps {
  phoneNumber: string;
  onVerificationSuccess: (verificationId: string, code: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  verificationId: string | null;
}

const OTPInput: React.FC<OTPInputProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onResend,
  isLoading = false,
  verificationId
}) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const maxAttempts = 5;

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (attempts >= maxAttempts) {
      toast({
        title: "Too Many Attempts",
        description: "Please request a new OTP",
        variant: "destructive",
      });
      return;
    }

    if (!verificationId) {
      toast({
        title: "Error",
        description: "No verification ID found. Please request a new OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setAttempts(prev => prev + 1);
      onVerificationSuccess(verificationId, otp);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResend = () => {
    if (canResend) {
      setCountdown(30);
      setCanResend(false);
      setAttempts(0);
      setOtp('');
      onResend();
    }
  };

  const maskedPhone = phoneNumber.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1*****$3');

  return (
    <Card className="gaming-card w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Phone className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-xl">Verify Your Phone</CardTitle>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to<br />
          <span className="font-medium text-foreground">{maskedPhone}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
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

        <div className="text-center text-sm text-muted-foreground">
          {attempts > 0 && (
            <p className="text-destructive mb-2">
              Attempts: {attempts}/{maxAttempts}
            </p>
          )}
          {canResend ? (
            <Button
              variant="link"
              onClick={handleResend}
              className="p-0 h-auto text-primary"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Resend OTP
            </Button>
          ) : (
            <p>Resend OTP in {countdown}s</p>
          )}
        </div>

        <Button
          onClick={handleVerifyOTP}
          disabled={otp.length !== 6 || isLoading || attempts >= maxAttempts}
          className="w-full"
          variant="gaming"
        >
          {isLoading ? (
            "Verifying..."
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify OTP
            </>
          )}
        </Button>

        {attempts >= maxAttempts && (
          <div className="text-center text-sm text-destructive">
            Too many failed attempts. Please request a new OTP.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPInput;