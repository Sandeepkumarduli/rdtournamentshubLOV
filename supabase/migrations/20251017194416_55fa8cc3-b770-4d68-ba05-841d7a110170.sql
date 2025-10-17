-- Add unique_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN unique_code TEXT UNIQUE;

-- Create function to generate unique 5-digit code
CREATE OR REPLACE FUNCTION public.generate_unique_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 5-digit code
    new_code := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE unique_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Update the handle_new_user trigger function to include unique_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, bgmi_id, phone, unique_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'bgmi_id',
    NEW.raw_user_meta_data ->> 'phone',
    generate_unique_code()
  );
  
  INSERT INTO public.wallet_balances (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

-- Generate codes for existing users (if any remain after DB clear)
UPDATE public.profiles 
SET unique_code = generate_unique_code()
WHERE unique_code IS NULL;