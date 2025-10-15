import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';

interface PhoneLoginRequest {
  phone: string;
  otp?: string;
  type?: 'send' | 'verify';
  userId?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables:', { 
        supabaseUrl: !!supabaseUrl, 
        supabaseAnonKey: !!supabaseAnonKey 
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { phone, otp, type, userId }: PhoneLoginRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Format phone number to E.164 format
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    console.log(`Processing request - Type: ${type}, Phone: ${formattedPhone}, UserId: ${userId || 'none'}`);

    // Send OTP using Supabase Auth
    if (type === 'send') {
      console.log(`Attempting to send OTP to: ${formattedPhone}`);
      
      // For verification during signup, we still use signInWithOtp but allow user creation
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        return new Response(
          JSON.stringify({ 
            error: error.message || "Failed to send OTP",
            details: error
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      console.log('OTP sent successfully');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "OTP sent successfully via SMS"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify OTP using Supabase Auth
    if (type === 'verify' && otp) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        return new Response(
          JSON.stringify({ error: error.message || "Invalid OTP" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      if (!data.session) {
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          session: data.session,
          user: data.user
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request type" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in phone-login:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
