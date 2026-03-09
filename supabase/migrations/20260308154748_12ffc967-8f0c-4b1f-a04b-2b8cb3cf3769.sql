-- Recreate public_profiles view WITHOUT security_invoker so all users can discover others
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT id, display_name, avatar_url, bio, created_at
  FROM public.profiles;

-- Grant access
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;