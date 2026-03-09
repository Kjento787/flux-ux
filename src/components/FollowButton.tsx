import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const FollowButton = ({ targetUserId, variant = 'secondary', size = 'sm' }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkFollowStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);

      if (session.user.id === targetUserId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId)
        .single();

      setIsFollowing(!!data);
      setLoading(false);
    };

    checkFollowStatus();
  }, [targetUserId]);

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (currentUserId === targetUserId) {
      return;
    }

    setLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) {
        toast.error('Failed to unfollow');
        console.error(error);
      } else {
        setIsFollowing(false);
        toast.success('Unfollowed');
      }
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        });

      if (error) {
        toast.error('Failed to follow');
        console.error(error);
      } else {
        setIsFollowing(true);
        toast.success('Following');
      }
    }

    setLoading(false);
  };

  // Don't show button if it's the user's own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  // Don't show if not logged in
  if (!currentUserId && !loading) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};
