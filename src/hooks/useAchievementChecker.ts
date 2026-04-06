import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  slug: string;
  title: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

export const useAchievementChecker = () => {
  const checkAndGrantAchievements = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;

    // Fetch all achievements and user's unlocked ones
    const [{ data: allAchievements }, { data: userAchievements }, { data: stats }, { data: xpRow }] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
      supabase.from('user_statistics').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_xp').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (!allAchievements) return;

    const unlockedIds = new Set((userAchievements || []).map(ua => ua.achievement_id));

    // Get current user metrics
    const metrics: Record<string, number> = {
      movies_watched: stats?.movies_watched || 0,
      tv_watched: stats?.tv_shows_watched || 0,
      reviews_count: stats?.reviews_count || 0,
      comments_count: stats?.comments_count || 0,
      streak: xpRow?.current_streak || 0,
      watchlist_count: 0,
      genres_explored: 0,
      parties_hosted: 0,
    };

    // Fetch additional metrics
    const [{ count: watchlistCount }, { count: partiesCount }] = await Promise.all([
      supabase.from('watchlists').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('watch_parties').select('*', { count: 'exact', head: true }).eq('host_id', userId),
    ]);

    metrics.watchlist_count = watchlistCount || 0;
    metrics.parties_hosted = partiesCount || 0;

    // Check each achievement
    let xpEarned = 0;
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements as Achievement[]) {
      if (unlockedIds.has(achievement.id)) continue;

      const currentValue = metrics[achievement.requirement_type] || 0;
      if (currentValue >= achievement.requirement_value) {
        // Grant achievement
        const { error } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

        if (!error) {
          xpEarned += achievement.xp_reward;
          newlyUnlocked.push(achievement);
        }
      }
    }

    // Award XP if any earned
    if (xpEarned > 0) {
      if (xpRow) {
        const newTotal = (xpRow.total_xp || 0) + xpEarned;
        const newLevel = Math.floor(newTotal / 100) + 1;
        await supabase.from('user_xp').update({
          total_xp: newTotal,
          level: newLevel,
        }).eq('user_id', userId);
      } else {
        const newLevel = Math.floor(xpEarned / 100) + 1;
        await supabase.from('user_xp').insert({
          user_id: userId,
          total_xp: xpEarned,
          level: newLevel,
        });
      }
    }

    // Show toasts for new achievements
    for (const a of newlyUnlocked) {
      toast.success(`${a.icon} Achievement Unlocked: ${a.title}`, {
        description: `+${a.xp_reward} XP earned!`,
        duration: 5000,
      });
    }

    return newlyUnlocked;
  }, []);

  const trackActivity = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: xpRow } = await supabase.from('user_xp').select('*').eq('user_id', userId).maybeSingle();

    if (xpRow) {
      if (xpRow.last_activity_date === today) return; // Already tracked today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = xpRow.last_activity_date === yesterdayStr ? (xpRow.current_streak || 0) + 1 : 1;
      const longestStreak = Math.max(newStreak, xpRow.longest_streak || 0);

      await supabase.from('user_xp').update({
        last_activity_date: today,
        current_streak: newStreak,
        longest_streak: longestStreak,
        total_xp: (xpRow.total_xp || 0) + 5, // 5 XP for daily login
        level: Math.floor(((xpRow.total_xp || 0) + 5) / 100) + 1,
      }).eq('user_id', userId);
    } else {
      await supabase.from('user_xp').insert({
        user_id: userId,
        last_activity_date: today,
        current_streak: 1,
        longest_streak: 1,
        total_xp: 5,
        level: 1,
      });
    }

    // Also ensure user_statistics row exists
    const { data: statsRow } = await supabase.from('user_statistics').select('id').eq('user_id', userId).maybeSingle();
    if (!statsRow) {
      // Count actual reviews and comments
      const [{ count: reviewsCount }, { count: commentsCount }] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      await supabase.from('user_statistics').insert({
        user_id: userId,
        reviews_count: reviewsCount || 0,
        comments_count: commentsCount || 0,
      });
    }

    // Check achievements after tracking activity
    await checkAndGrantAchievements();
  }, [checkAndGrantAchievements]);

  const syncStats = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;

    const [{ count: reviewsCount }, { count: commentsCount }] = await Promise.all([
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    const { data: existing } = await supabase.from('user_statistics').select('id').eq('user_id', userId).maybeSingle();

    if (existing) {
      await supabase.from('user_statistics').update({
        reviews_count: reviewsCount || 0,
        comments_count: commentsCount || 0,
      }).eq('user_id', userId);
    } else {
      await supabase.from('user_statistics').insert({
        user_id: userId,
        reviews_count: reviewsCount || 0,
        comments_count: commentsCount || 0,
      });
    }
  }, []);

  return { checkAndGrantAchievements, trackActivity, syncStats };
};
