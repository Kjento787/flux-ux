
-- Notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT,
  content_id INTEGER,
  content_type TEXT,
  poster_path TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Service can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  discord_dm_enabled BOOLEAN NOT NULL DEFAULT true,
  new_seasons BOOLEAN NOT NULL DEFAULT true,
  new_releases BOOLEAN NOT NULL DEFAULT true,
  social_activity BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Shared watchlists
CREATE TABLE public.shared_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_watchlists ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shared_watchlist_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.shared_watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(watchlist_id, user_id)
);

ALTER TABLE public.shared_watchlist_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shared_watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.shared_watchlists(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  added_by UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(watchlist_id, content_id, content_type)
);

ALTER TABLE public.shared_watchlist_items ENABLE ROW LEVEL SECURITY;

-- Shared watchlist RLS policies
CREATE POLICY "Anyone can view public shared watchlists" ON public.shared_watchlists
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Members can view shared watchlists" ON public.shared_watchlists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shared_watchlist_members WHERE watchlist_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create shared watchlists" ON public.shared_watchlists
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update shared watchlists" ON public.shared_watchlists
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Owners can delete shared watchlists" ON public.shared_watchlists
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Shared watchlist members RLS
CREATE POLICY "Members can view membership" ON public.shared_watchlist_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.shared_watchlist_members m WHERE m.watchlist_id = watchlist_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON public.shared_watchlist_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shared_watchlists w WHERE w.id = watchlist_id AND w.created_by = auth.uid())
  );

CREATE POLICY "Users can join via insert" ON public.shared_watchlist_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Shared watchlist items RLS
CREATE POLICY "Members can view items" ON public.shared_watchlist_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shared_watchlist_members m WHERE m.watchlist_id = watchlist_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shared_watchlists w WHERE w.id = watchlist_id AND (w.is_public = true OR w.created_by = auth.uid()))
  );

CREATE POLICY "Members can add items" ON public.shared_watchlist_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.shared_watchlist_members m WHERE m.watchlist_id = watchlist_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shared_watchlists w WHERE w.id = watchlist_id AND w.created_by = auth.uid())
  );

CREATE POLICY "Members can remove items" ON public.shared_watchlist_items
  FOR DELETE TO authenticated USING (
    added_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.shared_watchlists w WHERE w.id = watchlist_id AND w.created_by = auth.uid())
  );

-- Index for notifications performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
