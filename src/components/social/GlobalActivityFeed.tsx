import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Film, Tv, Star, MessageSquare, Bookmark, Users, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ActivityItem {
  id: string;
  type: "review" | "comment" | "watchlist" | "follow";
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  content_id?: number;
  content_type?: string;
  title?: string;
  rating?: number;
  created_at: string;
}

export const GlobalActivityFeed = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  // Get users that the current user follows
  const { data: followingIds = [] } = useQuery({
    queryKey: ["following-ids", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId);
      return data?.map((f) => f.following_id) || [];
    },
    enabled: !!userId,
  });

  // Get recent reviews from followed users
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["global-activity", followingIds],
    queryFn: async () => {
      if (followingIds.length === 0) return [];

      // Fetch recent reviews from followed users
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, user_id, content_id, content_type, rating, created_at")
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch profiles for the users
      const userIds = [...new Set((reviews || []).map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return (reviews || []).map((r) => ({
        id: r.id,
        type: "review" as const,
        user_id: r.user_id,
        display_name: profileMap.get(r.user_id)?.display_name || "User",
        avatar_url: profileMap.get(r.user_id)?.avatar_url || null,
        content_id: r.content_id,
        content_type: r.content_type,
        rating: r.rating,
        created_at: r.created_at,
      }));
    },
    enabled: followingIds.length > 0,
  });

  if (!userId) return null;

  if (followingIds.length === 0) {
    return (
      <section className="px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display">Friends Activity</h2>
        </div>
        <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-8 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Follow other users to see their activity here</p>
          <Link to="/discover" className="text-primary text-sm mt-2 inline-block hover:underline">
            Discover users →
          </Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display">Friends Activity</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-4 rounded-xl bg-card/60">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (activities.length === 0) return null;

  return (
    <section className="px-4 md:px-8 lg:px-12">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold font-display">Friends Activity</h2>
      </div>
      <div className="space-y-2">
        {activities.slice(0, 10).map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/20 hover:border-primary/20 transition-all"
          >
            <Link to={`/user/${activity.user_id}`}>
              <Avatar className="h-9 w-9 border border-border/30">
                <AvatarImage src={activity.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {activity.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <Link to={`/user/${activity.user_id}`} className="font-semibold hover:text-primary transition-colors">
                  {activity.display_name}
                </Link>
                {activity.type === "review" && (
                  <span className="text-muted-foreground"> rated a {activity.content_type}</span>
                )}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {activity.rating && (
                  <span className="flex items-center gap-0.5 text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    {activity.rating}/10
                  </span>
                )}
                <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {activity.content_id && (
              <Link
                to={activity.content_type === "tv" ? `/tv/${activity.content_id}` : `/movie/${activity.content_id}`}
                className="text-xs text-primary hover:underline flex-shrink-0"
              >
                View →
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
