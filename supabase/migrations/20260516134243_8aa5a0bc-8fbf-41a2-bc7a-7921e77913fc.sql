
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- Remove all SELECT policies on avatars; public bucket serves files via public URL without needing a SELECT policy
DROP POLICY IF EXISTS "Users read own avatar folder" ON storage.objects;
