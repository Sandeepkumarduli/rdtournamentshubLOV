import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.50.3'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

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
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('🎯 Edge function called')
    console.log('📡 Request method:', req.method)
    console.log('🔑 Request headers:', Object.fromEntries(req.headers.entries()))
    
    const body = await req.json()
    console.log('📨 Request body:', body)
    
    // Handle different actions based on request body
    if (body.amount) {
      console.log('🎯 Routing to create order')
      // This is a create order request
      return await handleCreateOrder(req, body, supabase)
    } else if (body.razorpay_order_id && body.razorpay_payment_id) {
      console.log('🎯 Routing to verify payment')
      // This is a verify payment request
      return await handleVerifyPayment(req, body, supabase)
    } else {
      console.log('❌ Invalid request body')
      return new Response('Invalid request', { status: 400, headers: corsHeaders })
    }
  } catch (error) {
    console.error('❌ Main error:', error)
    console.error('❌ Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function handleCreateOrder(req: Request, body: any, supabase: any) {
  console.log('🚀 Creating Razorpay order...')
  
  const { amount, currency, receipt } = body
  console.log('📝 Request data:', { amount, currency, receipt })

  // Validate required parameters
  if (!amount || !currency || !receipt) {
    console.error('❌ Missing required parameters:', { amount, currency, receipt })
    return new Response(
      JSON.stringify({ error: 'Missing required parameters: amount, currency, receipt' }),
      { status: 400, headers: corsHeaders }
    );
  }
  
  // Get user from auth header
  const authorization = req.headers.get('Authorization')
  console.log('🔑 Authorization header:', authorization ? `Present (${authorization.substring(0, 20)}...)` : 'Missing')
  
  if (!authorization) {
    console.error('❌ Missing authorization header')
    throw new Error('Authorization header is required')
  }

  // Extract token from Bearer format
  const token = authorization.replace('Bearer ', '')
  console.log('🎫 Token extracted, length:', token.length)

  // Try a simpler approach - just use the service role client with RLS
  console.log('🔄 Attempting database query to validate user...')
  
  let userId: string;
  
  // Decode the JWT to get user ID (basic decode, no verification since Supabase handles that)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🆔 Token payload user ID:', payload.sub)
    
    // Use service role client to check if user exists
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', payload.sub)
      .single()
    
    console.log('👤 User profile lookup:', { userProfile, error: profileError?.message })
    
    if (profileError || !userProfile) {
      throw new Error('User not found in database')
    }
    
    // Store user ID for later use
    userId = userProfile.user_id
    console.log('✅ User authenticated:', userId)
    
  } catch (decodeError) {
    console.error('❌ Token decode error:', decodeError)
    throw new Error('Invalid token format')
  }

  // Validate amount (minimum 100 paise = 1 INR)
  if (amount < 100) {
    console.log('❌ Amount validation failed:', amount)
    return new Response(
      JSON.stringify({ error: 'Minimum amount is ₹1' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Create Razorpay order
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  console.log('🔐 Razorpay credentials status:', { keyId: razorpayKeyId ? 'Configured' : 'Missing', keySecret: razorpayKeySecret ? 'Configured' : 'Missing' })

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  const orderData = {
    amount: amount, // amount in paise
    currency: currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  }

  const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
  console.log('🔒 Making Razorpay API call...')
  
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  console.log('📡 Razorpay API response status:', razorpayResponse.status)

  if (!razorpayResponse.ok) {
    const errorData = await razorpayResponse.text()
    console.error('❌ Razorpay API Error:', errorData)
    throw new Error('Failed to create Razorpay order: ' + errorData)
  }

  const razorpayOrder = await razorpayResponse.json()
  console.log('✅ Razorpay order created:', razorpayOrder.id)

  // Store order in database
  console.log('💾 Storing order in database...')
  const { error: dbError } = await supabase
    .from('payment_orders')
    .insert({
      user_id: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
    })

  if (dbError) {
    console.error('❌ Database error:', dbError)
    throw new Error('Failed to store order in database: ' + dbError.message)
  }
  
  console.log('✅ Order stored successfully')

  const responseData = {
    order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key_id: razorpayKeyId,
  }
  
  console.log('✅ Returning success response:', responseData)
  
  return new Response(
    JSON.stringify(responseData),
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

async function handleVerifyPayment(req: Request, body: any, supabase: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
  
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!razorpayKeySecret) {
    throw new Error('Razorpay secret not configured')
  }

  // Verify signature
  const signatureData = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = createHmac('sha256', razorpayKeySecret)
    .update(signatureData)
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