import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FollowStatsProps {
  userId: string;
}

export const FollowStats = ({ userId }: FollowStatsProps) => {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      setFollowers(followersResult.count || 0);
      setFollowing(followingResult.count || 0);
      setLoading(false);
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>
          <strong className="text-foreground">{followers}</strong>{' '}
          <span className="text-muted-foreground">followers</span>
        </span>
      </div>
      <span>
        <strong className="text-foreground">{following}</strong>{' '}
        <span className="text-muted-foreground">following</span>
      </span>
    </div>
  );
};
