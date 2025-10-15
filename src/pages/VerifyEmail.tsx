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

    // Check if this is a redirect from email verification
    const checkEmailVerificationRedirect = async () => {
      try {
        // Check URL parameters for email verification tokens
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Email verification tokens found in URL');
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
          } else if (data.session?.user?.email_confirmed_at) {
            console.log('Email verification detected from URL tokens');
            setEmailVerified(true);
            toast({
              title: "Email Verified!",
              description: "Your email has been confirmed successfully.",
            });
            setIsLoading(false);
            return true;
          }
        }
        
        // Fallback: check existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email_confirmed_at) {
          console.log('Email verification detected from existing session');
          setEmailVerified(true);
          toast({
            title: "Email Verified!",
            description: "Your email has been confirmed successfully.",
          });
          setIsLoading(false);
          return true; // Email is verified
        }
      } catch (error) {
        console.error('Error checking email verification redirect:', error);
      }
      return false; // Email not verified
    };

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
          
          // Handle specific error cases
          if (error.message.includes('User already registered')) {
            toast({
              title: "Email Already Exists",
              description: "This email is already registered. Please try logging in instead.",
              variant: "destructive",
            });
            setTimeout(() => navigate('/login'), 2000);
          } else {
            toast({
              title: "Email Verification Failed",
              description: error.message,
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Check if user is already verified
          if (data.user.email_confirmed_at) {
            console.log('User already verified:', email);
            setEmailVerified(true);
            toast({
              title: "Email Already Verified",
              description: "This email is already verified. You can proceed to phone verification.",
            });
          } else {
            console.log('Email verification sent to:', email);
            toast({
              title: "Verification Email Sent",
              description: `Please check your email at ${email} and click the verification link.`,
            });
          }
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

    // First check if this is a redirect from email verification
    checkEmailVerificationRedirect().then((isVerified) => {
      if (!isVerified) {
        // If not verified, send the verification email
        sendEmailVerification();
      }
    });
  }, [email, phone, password, username, bgmiId, navigate, toast]);

  // Poll for email verification every 3 seconds (like the original main code)
  useEffect(() => {
    if (emailVerified) return; // Stop polling if already verified

    const pollForVerification = async () => {
      try {
        let session = null;
        
        // First try to get existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        session = existingSession;
        
        // If no session exists, try to sign in to check verification status
        if (!session && email && password) {
          console.log('No session found, attempting sign-in to check verification...');
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (!signInError && signInData.session) {
            session = signInData.session;
            console.log('Sign-in successful, checking verification status...');
            
            // Sign out immediately after checking (we only needed to verify)
            setTimeout(() => {
              supabase.auth.signOut();
            }, 1000);
          }
        }
        
        console.log('Polling check - session:', session?.user?.email_confirmed_at);
        
        if (session?.user?.email_confirmed_at) {
          console.log('Email verification detected via polling');
          setEmailVerified(true);
          toast({
            title: "Email Verified!",
            description: "Your email has been confirmed successfully.",
          });
        }
      } catch (error) {
        console.error('Error polling for verification:', error);
      }
    };

    // Check immediately
    pollForVerification();

    // Then poll every 3 seconds
    const interval = setInterval(pollForVerification, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [emailVerified, toast]);

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
