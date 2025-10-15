import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamepadIcon, Mail, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { email, phone, userId, password } = location.state || {};

  useEffect(() => {
    if (!email || !phone || !userId) {
      navigate('/signup');
      return;
    }

    // Listen for auth state changes (when user clicks verification link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    });

    // Check for email confirmation from redirect
    const checkEmailConfirmation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
      }
    };

    checkEmailConfirmation();

    // Poll for email verification every 3 seconds
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
        clearInterval(interval);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [email, phone, userId, navigate]);

  const handleManualRefresh = async () => {
    setIsChecking(true);
    try {
      // Refresh the session first
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setEmailVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your email has been confirmed successfully.",
        });
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please check your email and click the confirmation link.",
        });
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinueToPhone = () => {
    navigate('/verify-phone', { 
      state: { 
        phone, 
        userId,
        password,
        email
      } 
    });
  };

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
    </div>
  );
};

export default VerifyEmail;
