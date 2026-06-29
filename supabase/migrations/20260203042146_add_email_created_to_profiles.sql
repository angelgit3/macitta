-- 1. Add columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. Update trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_name, full_name, avatar_url, email, created_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'user_name', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email, -- Capture email from auth.users
    new.created_at -- Capture creation time from auth.users
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;
