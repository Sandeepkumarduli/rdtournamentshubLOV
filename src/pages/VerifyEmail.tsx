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
  
  const { email, phone, userId, password } = location.state || {};

  useEffect(() => {
    if (!email || !phone || !userId) {
      navigate('/signup');
      return;
    }

    // Handle session exchange from email verification redirect
    const handleEmailVerificationRedirect = async () => {
      // Check if we have hash params (Supabase adds tokens in URL hash after verification)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('🔑 Found access token in URL, exchanging for session...');
        try {
          // Set the session from the URL tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log('🔐 setSession result:', data?.session?.user?.email, 'confirmed_at:', data?.session?.user?.confirmed_at, error);
          
          // Check if email is actually confirmed
          const isConfirmed = !!data?.session?.user?.confirmed_at;
          
          if (isConfirmed) {
            console.log('✅ Email confirmed from verification link!');
            setEmailVerified(true);
            setIsLoading(false);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            return true;
          } else {
            console.log('⚠️ Session established but email not confirmed yet - confirmed_at is null');
            setIsLoading(false);
          }
          
          if (error) {
            console.error('❌ Session exchange error:', error);
          }
        } catch (err) {
          console.error('❌ Session exchange failed:', err);
        }
      }
      return false;
    };

    // Try to exchange session from URL first
    handleEmailVerificationRedirect().then((wasRedirect) => {
      if (wasRedirect) return; // Session was set from redirect, no need to poll
      
      // If not from redirect, set up polling and listeners
      setupVerificationCheck();
    });

    function setupVerificationCheck() {
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event, 'confirmed_at:', session?.user?.confirmed_at);
        
        const isConfirmed = !!session?.user?.confirmed_at;
        
        if (isConfirmed) {
          console.log('✅ Email verified via auth state change!');
          setEmailVerified(true);
          setIsLoading(false);
        }
      });

      // Check for email confirmation from redirect
      const checkEmailConfirmation = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📧 Initial session check:', {
          email: session?.user?.email,
          confirmed_at: session?.user?.confirmed_at,
          email_confirmed_at: session?.user?.email_confirmed_at,
          last_sign_in_at: session?.user?.last_sign_in_at,
          created_at: session?.user?.created_at
        });
        
        if (!session) {
          console.log('⚠️ No session found');
          setIsLoading(false);
          return;
        }
        
        // ONLY check confirmed_at - this is the definitive field
        const isConfirmed = !!session?.user?.confirmed_at;
        
        console.log('🔍 Is email confirmed?', isConfirmed);
        
        if (isConfirmed) {
          console.log('✅ Email is verified!');
          setEmailVerified(true);
        } else {
          console.log('⏳ Email not confirmed yet - confirmed_at is null');
        }
        setIsLoading(false);
      };

      checkEmailConfirmation();

      // Poll for email verification every 3 seconds
      const interval = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        const isConfirmed = !!session?.user?.confirmed_at;
        
        console.log('🔄 Polling:', {
          email: session?.user?.email,
          confirmed_at: session?.user?.confirmed_at,
          isConfirmed
        });
        
        if (isConfirmed) {
          console.log('✅ Verified via polling!');
          setEmailVerified(true);
          clearInterval(interval);
        }
      }, 3000);
      
      return () => {
        clearInterval(interval);
        subscription.unsubscribe();
      };
    }
  }, [email, phone, userId, navigate]);

  const handleManualRefresh = async () => {
    setIsChecking(true);
    try {
      // Refresh the session to get latest data
      await supabase.auth.refreshSession();
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('🔄 Manual check:', {
        email: session?.user?.email,
        confirmed_at: session?.user?.confirmed_at
      });
      
      if (error) {
        console.error('Session error:', error);
      }
      
      const isConfirmed = !!session?.user?.confirmed_at;
      
      if (isConfirmed) {
        setEmailVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your email has been confirmed successfully.",
        });
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please check your email and click the confirmation link first.",
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
        userId,
        password,
        email
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
