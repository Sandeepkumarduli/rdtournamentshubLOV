import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PhoneLoginRequest {
  phone: string;
  otp?: string;
  type?: 'signup' | 'verify' | 'login';
}

// Store OTPs in memory (for demo - use database in production)
const otpStore = new Map<string, { otp: string; expires: number }>();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, type }: PhoneLoginRequest = await req.json();

    if (!phone) {
      throw new Error("Phone number is required");
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Format phone number
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    // Handle OTP verification
    if (type === 'verify' && otp) {
      const stored = otpStore.get(formattedPhone);
      
      if (!stored) {
        return new Response(
          JSON.stringify({ error: "No OTP found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (Date.now() > stored.expires) {
        otpStore.delete(formattedPhone);
        return new Response(
          JSON.stringify({ error: "OTP expired. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (stored.otp !== otp) {
        return new Response(
          JSON.stringify({ error: "Invalid OTP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // OTP is valid, look up user and generate magic link
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email")
        .eq("phone", formattedPhone)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: "No account found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        profile.user_id
      );

      if (userError || !user) {
        throw new Error("User not found");
      }

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
      });

      if (error) throw error;

      otpStore.delete(formattedPhone);

      return new Response(
        JSON.stringify({ 
          user_id: profile.user_id,
          email: user.email,
          magic_link: data.properties.action_link
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle OTP sending (for signup or login)
    if (type === 'signup' || type === 'login') {
      // Generate 6-digit OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP (expires in 10 minutes)
      otpStore.set(formattedPhone, {
        otp: generatedOTP,
        expires: Date.now() + 10 * 60 * 1000
      });

      console.log(`OTP for ${formattedPhone}: ${generatedOTP}`);

      // TODO: Integrate with SMS provider to send OTP
      // For now, just log it and return success

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "OTP sent successfully",
          // Include OTP in response for development only
          otp: generatedOTP
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default behavior: look up user and generate magic link
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email")
      .eq("phone", formattedPhone)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ 
          error: "No account found with this phone number. Please sign up first." 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      profile.user_id
    );

    if (userError || !user) {
      throw new Error("User not found in auth system");
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        user_id: profile.user_id,
        email: user.email,
        magic_link: data.properties.action_link
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
