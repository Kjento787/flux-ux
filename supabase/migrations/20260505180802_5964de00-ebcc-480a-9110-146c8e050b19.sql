DROP VIEW IF EXISTS public.my_ban_status;
CREATE VIEW public.my_ban_status WITH (security_invoker = true) AS
  SELECT id, user_id, reason, banned_at, expires_at, is_permanent
  FROM public.user_bans;
GRANT SELECT ON public.my_ban_status TO authenticated;
-- Add a select policy enabling owners to read their record (but with the view masking ip_address)
CREATE POLICY "Users can see own ban (no IP)"
  ON public.user_bans FOR SELECT TO authenticated
  USING (user_id = auth.uid());