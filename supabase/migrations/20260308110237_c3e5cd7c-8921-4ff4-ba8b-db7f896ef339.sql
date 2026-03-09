
-- Watch Parties
CREATE TABLE public.watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'movie',
  title TEXT NOT NULL,
  poster_path TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_time_seconds NUMERIC DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE public.watch_party_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(party_id, user_id)
);

CREATE TABLE public.watch_party_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievements & Gamification
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- Watch Parties RLS
CREATE POLICY "Anyone can view active parties" ON public.watch_parties FOR SELECT USING (is_active = true);
CREATE POLICY "Host can manage party" ON public.watch_parties FOR ALL TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "Participants can view party" ON public.watch_parties FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.watch_party_participants WHERE party_id = watch_parties.id AND user_id = auth.uid()));

CREATE POLICY "Anyone can view participants" ON public.watch_party_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join parties" ON public.watch_party_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave parties" ON public.watch_party_participants FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host can manage participants" ON public.watch_party_participants FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.watch_parties WHERE id = watch_party_participants.party_id AND host_id = auth.uid()));

CREATE POLICY "Participants can view messages" ON public.watch_party_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.watch_party_participants WHERE party_id = watch_party_messages.party_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.watch_parties WHERE id = watch_party_messages.party_id AND host_id = auth.uid()));
CREATE POLICY "Participants can send messages" ON public.watch_party_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Achievements RLS
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can grant achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view user xp" ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "Users can manage own xp" ON public.user_xp FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own xp" ON public.user_xp FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Enable realtime for watch parties
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_parties;

-- Seed default achievements
INSERT INTO public.achievements (slug, title, description, icon, category, xp_reward, requirement_type, requirement_value, tier) VALUES
('first_watch', 'First Watch', 'Watch your first movie or show', '🎬', 'watching', 10, 'movies_watched', 1, 'bronze'),
('movie_buff', 'Movie Buff', 'Watch 10 movies', '🍿', 'watching', 50, 'movies_watched', 10, 'silver'),
('cinephile', 'Cinephile', 'Watch 50 movies', '🎥', 'watching', 200, 'movies_watched', 50, 'gold'),
('movie_legend', 'Movie Legend', 'Watch 100 movies', '👑', 'watching', 500, 'movies_watched', 100, 'platinum'),
('tv_addict', 'TV Addict', 'Watch 10 TV shows', '📺', 'watching', 50, 'tv_watched', 10, 'silver'),
('binge_master', 'Binge Master', 'Watch 50 TV shows', '🔥', 'watching', 200, 'tv_watched', 50, 'gold'),
('first_review', 'Critic Debut', 'Write your first review', '✍️', 'social', 15, 'reviews_count', 1, 'bronze'),
('prolific_critic', 'Prolific Critic', 'Write 10 reviews', '📝', 'social', 75, 'reviews_count', 10, 'silver'),
('voice_heard', 'Voice Heard', 'Leave your first comment', '💬', 'social', 10, 'comments_count', 1, 'bronze'),
('social_butterfly', 'Social Butterfly', 'Leave 25 comments', '🦋', 'social', 100, 'comments_count', 25, 'silver'),
('streak_3', 'On a Roll', '3-day watch streak', '🔥', 'streaks', 30, 'streak', 3, 'bronze'),
('streak_7', 'Week Warrior', '7-day watch streak', '⚡', 'streaks', 75, 'streak', 7, 'silver'),
('streak_30', 'Monthly Master', '30-day watch streak', '💎', 'streaks', 300, 'streak', 30, 'gold'),
('genre_explorer', 'Genre Explorer', 'Watch from 5 different genres', '🧭', 'discovery', 50, 'genres_explored', 5, 'silver'),
('party_host', 'Party Host', 'Host your first watch party', '🎉', 'social', 25, 'parties_hosted', 1, 'bronze'),
('watchlist_curator', 'Watchlist Curator', 'Add 20 items to your watchlist', '📋', 'discovery', 40, 'watchlist_count', 20, 'silver');
