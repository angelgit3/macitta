CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, created_at)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 8)), 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email, -- Capture email from auth.users
    new.created_at -- Capture creation time from auth.users
  );
  return new;
END;
$function$;;
