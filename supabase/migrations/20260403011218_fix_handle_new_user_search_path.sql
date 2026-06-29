CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  email_domain text;
  email_local text;
  user_role text;
BEGIN
  email_domain := split_part(new.email, '@', 2);
  email_local := split_part(new.email, '@', 1);

  -- Reject non-institutional emails
  IF email_domain != 'upt.edu.mx' THEN
    RAISE EXCEPTION 'Solo se permiten correos institucionales @upt.edu.mx';
  END IF;

  -- Auto-detect role: numeric local part = student, otherwise = teacher
  IF email_local ~ '^\d+$' THEN
    user_role := 'student';
  ELSE
    user_role := 'teacher';
  END IF;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, role, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_name', email_local || '_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    user_role,
    new.created_at
  );
  RETURN new;
END;
$function$;;
