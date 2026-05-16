
-- 1. Remove user-facing SELECT on user_bans; expose via view that excludes ip_address
DROP POLICY IF EXISTS "Users can see own ban (no IP)" ON public.user_bans;

CREATE OR REPLACE VIEW public.my_ban_status
WITH (security_invoker = true) AS
SELECT id, user_id, reason, banned_at, expires_at, is_permanent
FROM public.user_bans
WHERE user_id = auth.uid();

GRANT SELECT ON public.my_ban_status TO authenticated;

-- 2. Avatars bucket: prevent enumeration (LIST) but keep public direct-path reads
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars read" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars list" ON storage.objects;

CREATE POLICY "Public avatars read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- 3. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_empty_watch_party() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_user_email(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
