import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PhoneLoginRequest {
  phone: string;
  otp?: string;
  type?: 'send' | 'verify';
  userId?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('🚀 Edge function called');
  console.log('📡 Method:', req.method);
  console.log('🌐 Origin:', req.headers.get('origin'));
  
  if (req.method === "OPTIONS") {
    console.log('✅ Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Parsing request body...');
    const body = await req.json();
    console.log('📦 Request body:', body);
    
    const { phone, otp, type, userId }: PhoneLoginRequest = body;

    if (!phone) {
      console.log('❌ No phone number provided');
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('📞 Processing phone:', phone, 'Type:', type);

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log('🔑 Environment check:', { 
      supabaseUrl: !!supabaseUrl, 
      supabaseAnonKey: !!supabaseAnonKey 
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing environment variables');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
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

    console.log('📱 Formatted phone:', formattedPhone);

    // Send OTP using Supabase Auth
    if (type === 'send') {
      console.log('📤 Sending OTP...');
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        console.error('❌ Error sending OTP:', error);
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

      console.log('✅ OTP sent successfully');
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
      console.log('🔍 Verifying OTP...');
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('❌ Error verifying OTP:', error);
        return new Response(
          JSON.stringify({ error: error.message || "Invalid OTP" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      if (!data.session) {
        console.log('❌ No session created');
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      console.log('✅ OTP verified successfully');
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

    console.log('❌ Invalid request type');
    return new Response(
      JSON.stringify({ error: "Invalid request type" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});