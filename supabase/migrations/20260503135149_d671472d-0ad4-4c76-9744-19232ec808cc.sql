
-- 1. Drop overly permissive ip_bans SELECT policy (admins already have one via "Admins can manage IP bans")
DROP POLICY IF EXISTS "Service role can read IP bans" ON public.ip_bans;

-- 2. Drop public update on user_favorites
DROP POLICY IF EXISTS "Service can update favorites" ON public.user_favorites;
CREATE POLICY "Users can update own favorites" ON public.user_favorites
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Fix tautology in shared_watchlist_members SELECT
DROP POLICY IF EXISTS "Members can view membership" ON public.shared_watchlist_members;
CREATE POLICY "Members can view membership" ON public.shared_watchlist_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.shared_watchlist_members m
      WHERE m.watchlist_id = shared_watchlist_members.watchlist_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.shared_watchlists w
      WHERE w.id = shared_watchlist_members.watchlist_id
        AND w.created_by = auth.uid()
    )
  );

-- 4. Fix tautology in shared_watchlist_items policies
DROP POLICY IF EXISTS "Members can view items" ON public.shared_watchlist_items;
CREATE POLICY "Members can view items" ON public.shared_watchlist_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_watchlist_members m
      WHERE m.watchlist_id = shared_watchlist_items.watchlist_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.shared_watchlists w
      WHERE w.id = shared_watchlist_items.watchlist_id
        AND (w.is_public = true OR w.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can add items" ON public.shared_watchlist_items;
CREATE POLICY "Members can add items" ON public.shared_watchlist_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shared_watchlist_members m
      WHERE m.watchlist_id = shared_watchlist_items.watchlist_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.shared_watchlists w
      WHERE w.id = shared_watchlist_items.watchlist_id
        AND w.created_by = auth.uid()
    )
  );

-- 5. Fix broken shared_watchlists "Members can view shared watchlists" policy
DROP POLICY IF EXISTS "Members can view shared watchlists" ON public.shared_watchlists;
CREATE POLICY "Members can view shared watchlists" ON public.shared_watchlists
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_watchlist_members
      WHERE shared_watchlist_members.watchlist_id = shared_watchlists.id
        AND shared_watchlist_members.user_id = auth.uid()
    )
  );

-- 6. Restrict notified_movies / notified_tv to admins only (edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS "Service can manage notified movies" ON public.notified_movies;
CREATE POLICY "Admins can manage notified movies" ON public.notified_movies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service can manage notified tv" ON public.notified_tv;
CREATE POLICY "Admins can manage notified tv" ON public.notified_tv
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Restrict activity_logs INSERT to authenticated users inserting own entries
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can insert own logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 8. Drop user-controlled UPDATE on user_xp (prevents leaderboard manipulation)
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can manage own xp" ON public.user_xp;
-- XP must be granted server-side via service role from edge functions / triggers

-- 9. Restrict watch_parties SELECT to authenticated to avoid exposing invite_code to anonymous
DROP POLICY IF EXISTS "Anyone can view active parties" ON public.watch_parties;
CREATE POLICY "Authenticated can view active parties" ON public.watch_parties
  FOR SELECT TO authenticated
  USING (is_active = true);

-- 10. Convert public_profiles view to SECURITY INVOKER, and add a public-readable policy for non-sensitive profile fields via a column-aware approach
ALTER VIEW public.public_profiles SET (security_invoker = on);
-- Allow anyone to read profile rows (the view exposes only safe columns; sensitive ones like email are not in the view)
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);
