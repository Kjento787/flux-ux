import { useState, useEffect } from "react";
import { Clock, Star, MessageSquare, UserPlus, Play, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "review" | "comment" | "follow";
  created_at: string;
  details: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const userId = session.user.id;

      const [reviewsRes, commentsRes, followsRes] = await Promise.all([
        supabase.from("reviews").select("id, content_id, content_type, rating, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("comments").select("id, content_id, content_type, comment_text, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("user_follows").select("id, following_id, created_at").eq("follower_id", userId).order("created_at", { ascending: false }).limit(10),
      ]);

      const items: ActivityItem[] = [
        ...(reviewsRes.data || []).map(r => ({
          id: r.id, type: "review" as const, created_at: r.created_at,
          details: `Rated a ${r.content_type} ★${r.rating}/10`,
        })),
        ...(commentsRes.data || []).map(c => ({
          id: c.id, type: "comment" as const, created_at: c.created_at,
          details: `Commented: "${c.comment_text.slice(0, 60)}${c.comment_text.length > 60 ? "…" : ""}"`,
        })),
        ...(followsRes.data || []).map(f => ({
          id: f.id, type: "follow" as const, created_at: f.created_at,
          details: "Followed a user",
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

      setActivities(items);
      setLoading(false);
    };
    fetchActivity();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "review": return <Star className="h-4 w-4 text-primary fill-primary" />;
      case "comment": return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case "follow": return <UserPlus className="h-4 w-4 text-emerald-400" />;
      default: return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-card/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl bg-card/40 border border-border/20">
        <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No recent activity yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Start watching, reviewing, and commenting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/40 border border-border/20 hover:border-border/40 transition-all"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-1">{item.details}</p>
          </div>
          <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
