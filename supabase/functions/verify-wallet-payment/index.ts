import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    if (session.metadata.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    const amount = parseInt(session.metadata.amount);

    // Update wallet balance
    const { data: walletData, error: walletError } = await supabaseClient
      .from("wallet_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (walletError) throw walletError;

    const newBalance = (walletData.balance || 0) + amount;

    const { error: updateError } = await supabaseClient
      .from("wallet_balances")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "credit",
        amount: amount,
        description: `Wallet top-up via Stripe - $${amount}`,
        status: "completed",
        gateway: "stripe",
        payment_method: "card",
        gateway_response: {
          session_id: sessionId,
          payment_intent: session.payment_intent,
        },
      });

    if (transactionError) throw transactionError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: newBalance,
        amount: amount 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
