
-- Make avatars bucket private to stop public listing; expose files only via signed URLs or owner reads
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

DROP POLICY IF EXISTS "Public avatars read" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage avatars" ON storage.objects;

CREATE POLICY "Users read own avatar folder"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own avatar folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar folder"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar folder"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins manage avatars"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

-- Revoke direct execute on SECURITY DEFINER helpers; RLS still works via policy expressions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_email(uuid) FROM authenticated;
