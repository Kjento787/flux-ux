
-- Allow users to update their own participant records (needed for leaving parties)
CREATE POLICY "Users can update own participation"
ON public.watch_party_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow admins to manage all watch parties
CREATE POLICY "Admins can manage all parties"
ON public.watch_parties
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage all participants
CREATE POLICY "Admins can manage all participants"
ON public.watch_party_participants
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
