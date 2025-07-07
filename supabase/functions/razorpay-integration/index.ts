import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.50.3'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOrderRequest {
  amount: number
  currency?: string
  receipt?: string
}

interface WebhookPayload {
  event: string
  payload: {
    payment: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
        method: string
        created_at: number
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    'https://rwhxtiiyfsjdqftwpsis.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aHh0aWl5ZnNqZHFmdHdwc2lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUzMDA1MCwiZXhwIjoyMDY3MTA2MDUwfQ.A1AUzfhKVGWsQ5JtMaOPdD6LqwRJJEL0SWOLlJdUmfE'
  )

  const url = new URL(req.url)
  const path = url.pathname

  try {
    if (path === '/razorpay-integration/create-order' && req.method === 'POST') {
      return await handleCreateOrder(req, supabase)
    } else if (path === '/razorpay-integration/webhook' && req.method === 'POST') {
      return await handleWebhook(req, supabase)
    } else if (path === '/razorpay-integration/verify-payment' && req.method === 'POST') {
      return await handleVerifyPayment(req, supabase)
    } else {
      return new Response('Not Found', { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function handleCreateOrder(req: Request, supabase: any) {
  const { amount, currency = 'INR', receipt }: CreateOrderRequest = await req.json()
  
  // Get user from auth header
  const authorization = req.headers.get('Authorization')
  if (!authorization) {
    throw new Error('Authorization header is required')
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(
    authorization.replace('Bearer ', '')
  )

  if (userError || !user) {
    throw new Error('Invalid user token')
  }

  // Validate amount (minimum 100 paise = 1 INR)
  if (amount < 100) {
    throw new Error('Minimum amount is ₹1')
  }

  // Create Razorpay order
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  const orderData = {
    amount: amount, // amount in paise
    currency: currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  }

  const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
  
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  if (!razorpayResponse.ok) {
    const errorData = await razorpayResponse.text()
    console.error('Razorpay API Error:', errorData)
    throw new Error('Failed to create Razorpay order')
  }

  const razorpayOrder = await razorpayResponse.json()

  // Store order in database
  const { error: dbError } = await supabase
    .from('payment_orders')
    .insert({
      user_id: user.id,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
    })

  if (dbError) {
    console.error('Database error:', dbError)
    throw new Error('Failed to store order in database')
  }

  return new Response(
    JSON.stringify({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

async function handleWebhook(req: Request, supabase: any) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  
  if (!signature) {
    throw new Error('No signature found')
  }

  // Verify webhook signature
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  if (webhookSecret) {
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }
  }

  const payload: WebhookPayload = JSON.parse(body)
  console.log('Webhook received:', payload.event)

  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment.entity
    
    // Update payment order status
    await supabase
      .from('payment_orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', payment.order_id)

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: (await supabase
          .from('payment_orders')
          .select('user_id')
          .eq('razorpay_order_id', payment.order_id)
          .single()).data?.user_id,
        type: 'deposit',
        amount: payment.amount / 100, // Convert paise to rupees
        description: 'Wallet top-up via Razorpay',
        status: 'completed',
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        payment_method: payment.method,
        gateway: 'razorpay',
        gateway_response: payment,
      })

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
    } else {
      // Update wallet balance
      const userId = (await supabase
        .from('payment_orders')
        .select('user_id')
        .eq('razorpay_order_id', payment.order_id)
        .single()).data?.user_id

      if (userId) {
        const { data: currentBalance } = await supabase
          .from('wallet_balances')
          .select('balance')
          .eq('user_id', userId)
          .single()

        const newBalance = (currentBalance?.balance || 0) + (payment.amount / 100)
        
        await supabase
          .from('wallet_balances')
          .upsert({
            user_id: userId,
            balance: newBalance,
          })
      }
    }
  }

  return new Response('OK', { headers: corsHeaders })
}

async function handleVerifyPayment(req: Request, supabase: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
  
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!razorpayKeySecret) {
    throw new Error('Razorpay secret not configured')
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = createHmac('sha256', razorpayKeySecret)
    .update(body)
    .digest('hex')

  const isValid = expectedSignature === razorpay_signature

  if (isValid) {
    // Update payment order status
    await supabase
      .from('payment_orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
  }

  return new Response(
    JSON.stringify({ verified: isValid }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}