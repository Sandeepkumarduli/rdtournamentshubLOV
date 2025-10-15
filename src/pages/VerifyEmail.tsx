import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, Mail, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const VerifyEmail = () => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { email, phone, password, username, bgmiId } = location.state || {};

  useEffect(() => {
    if (!email || !phone || !password) {
      navigate('/signup');
      return;
    }

    // Send email verification
    const sendEmailVerification = async () => {
      try {
        // Create account with email verification required
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              display_name: username,
              bgmi_id: bgmiId,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/verify-email`,
          }
        });

        if (error) {
          console.error('Email verification error:', error);
          toast({
            title: "Email Verification Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (data.user) {
          console.log('Email verification sent to:', email);
          toast({
            title: "Verification Email Sent",
            description: `Please check your email at ${email} and click the verification link.`,
          });
        }
      } catch (error) {
        console.error('Error sending email verification:', error);
        toast({
          title: "Error",
          description: "Failed to send verification email. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    sendEmailVerification();
  }, [email, phone, password, username, bgmiId, navigate, toast]);

  const handleManualRefresh = async () => {
    console.log('Refresh button clicked'); // Debug log
    setIsChecking(true);
    try {
      console.log('Checking email verification...'); // Debug log
      
      // Since we don't have a session, we need to check verification differently
      // We'll try to sign in with the email/password to get the current user status
      if (email && password) {
        console.log('Attempting to sign in to check verification status...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
        console.log('Sign in result:', { signInData, signInError });
        
        if (signInError) {
          // If sign in fails, it might be because email is not verified yet
          if (signInError.message.includes('Email not confirmed')) {
            toast({
              title: "Not Verified Yet",
              description: "Please check your email and click the confirmation link first.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: signInError.message,
              variant: "destructive",
            });
          }
          return;
        }
        
        // If sign in succeeds, check if email is confirmed
        if (signInData?.user?.email_confirmed_at) {
          setEmailVerified(true);
          toast({
            title: "Email Verified!",
            description: "Your email has been confirmed successfully.",
          });
          
          // Sign out immediately since we only needed to check verification
          await supabase.auth.signOut();
        } else {
          toast({
            title: "Not Verified Yet",
            description: "Please check your email and click the confirmation link first.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Missing Information",
          description: "Cannot check verification without email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
      toast({
        title: "Error",
        description: "Failed to check verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinueToPhone = () => {
    navigate('/verify-phone', { 
      state: { 
        phone, 
        email,
        password,
        username,
        bgmiId
      } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isLoading ? (
        <LoadingSpinner fullScreen size="lg" />
      ) : (
        <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              RDTH - RD Tournaments Hub
            </h1>
          </div>
          <p className="text-muted-foreground">Step 1: Verify your email</p>
        </div>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <span className="text-green-500 font-medium">Verified ✓</span>
              ) : (
                <span className="text-yellow-500 font-medium">Pending verification...</span>
              )}
            </div>

            {!emailVerified && (
              <>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Please check your email inbox</p>
                  <p className="text-xs text-muted-foreground">
                    We've sent a confirmation link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click the link in the email to verify your account.
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleManualRefresh}
                  className="w-full"
                  disabled={isChecking}
                >
                  {isChecking ? "Checking..." : "Refresh Status"}
                </Button>
              </>
            )}

            {emailVerified && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                  <p className="text-sm text-green-500 font-medium">
                    ✓ Email verified successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can now proceed to verify your phone number.
                  </p>
                </div>
                
                <Button 
                  variant="gaming" 
                  onClick={handleContinueToPhone}
                  className="w-full"
                >
                  Continue to Phone Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline">
            ← Back to Signup
          </Link>
        </div>
      </div>
      )}
    </div>
  );
};

export default VerifyEmail;
