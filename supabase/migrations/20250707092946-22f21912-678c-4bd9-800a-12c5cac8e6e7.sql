-- Extend transactions table for Razorpay integration
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'manual';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS gateway_response JSONB;

-- Create payment_orders table for tracking Razorpay orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_orders
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_orders
CREATE POLICY "Users can view their own payment orders" 
ON public.payment_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create payment orders" 
ON public.payment_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update payment orders" 
ON public.payment_orders 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();