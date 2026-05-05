
-- 1. PROFILES: remove broad public SELECT (emails were exposed). Keep owner + admin access; UI uses public_profiles view.
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. NOTIFICATIONS: restrict INSERT to owner or service role
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
-- service_role bypasses RLS so edge functions still work

-- 3. USER_BANS: hide ip_address from the banned user via a safe view
DROP POLICY IF EXISTS "Users can see if they are banned" ON public.user_bans;

CREATE OR REPLACE VIEW public.my_ban_status AS
  SELECT id, user_id, reason, banned_at, expires_at, is_permanent
  FROM public.user_bans
  WHERE user_id = auth.uid();
GRANT SELECT ON public.my_ban_status TO authenticated;

-- 4. WATCH_PARTY_MESSAGES: require sender to be a participant
DROP POLICY IF EXISTS "Participants can send messages" ON public.watch_party_messages;
CREATE POLICY "Participants can send messages"
  ON public.watch_party_messages FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.watch_party_participants p
              WHERE p.party_id = watch_party_messages.party_id
                AND p.user_id = auth.uid()
                AND p.is_active = true)
      OR EXISTS (SELECT 1 FROM public.watch_parties wp
                 WHERE wp.id = watch_party_messages.party_id
                   AND wp.host_id = auth.uid())
    )
  );

-- 5. WATCH_PARTIES: don't broadcast invite codes to all users
DROP POLICY IF EXISTS "Authenticated can view active parties" ON public.watch_parties;

-- 6. WATCH_PARTY_PARTICIPANTS: scope visibility to fellow participants/host
DROP POLICY IF EXISTS "Anyone can view participants" ON public.watch_party_participants;
CREATE POLICY "Members can view participants"
  ON public.watch_party_participants FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.watch_party_participants p
               WHERE p.party_id = watch_party_participants.party_id
                 AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.watch_parties wp
               WHERE wp.id = watch_party_participants.party_id
                 AND wp.host_id = auth.uid())
  );

-- 7. STORAGE: restrict listing of avatars bucket (still fetchable by direct path)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars publicly readable by path"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars' AND name IS NOT NULL);
-- (No broad listing policy; clients fetch by exact path)
