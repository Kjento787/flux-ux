import { useState, useEffect } from 'react';
import { Film, Tv, Clock, Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getContinueWatching } from '@/lib/watchHistory';

interface Statistics {
  moviesWatched: number;
  tvShowsWatched: number;
  totalWatchTime: number;
  reviewsCount: number;
  commentsCount: number;
}

export const UserStatistics = () => {
  const [stats, setStats] = useState<Statistics>({
    moviesWatched: 0,
    tvShowsWatched: 0,
    totalWatchTime: 0,
    reviewsCount: 0,
    commentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Get watch history from local storage
      const watchHistory = getContinueWatching();
      const moviesWatched = watchHistory.filter(w => w.progress > 70).length;
      const totalWatchTime = watchHistory.reduce((sum, w) => sum + w.currentTime, 0);

      // Get reviews count from database
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get comments count from database
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats({
        moviesWatched,
        tvShowsWatched: 0, // Will track separately in future
        totalWatchTime,
        reviewsCount: reviewsCount || 0,
        commentsCount: commentsCount || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours < 1) {
      const mins = Math.floor(seconds / 60);
      return `${mins} min`;
    }
    return `${hours}h`;
  };

  const statItems = [
    { icon: Film, label: 'Movies Watched', value: stats.moviesWatched, color: 'text-blue-500' },
    { icon: Tv, label: 'TV Shows', value: stats.tvShowsWatched, color: 'text-purple-500' },
    { icon: Clock, label: 'Watch Time', value: formatWatchTime(stats.totalWatchTime), color: 'text-green-500' },
    { icon: Star, label: 'Reviews', value: stats.reviewsCount, color: 'text-yellow-500' },
    { icon: MessageSquare, label: 'Comments', value: stats.commentsCount, color: 'text-primary' },
  ];

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 w-12 rounded-lg bg-muted mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Your Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statItems.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className={`${color} mb-2`}>
                <Icon className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
