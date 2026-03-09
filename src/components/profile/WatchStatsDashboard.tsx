import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Tv, Clock, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

const StatCard = ({ icon, label, value, delay = 0 }: StatCardProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="border-border/30 bg-card/50 hover:border-primary/20 transition-all">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const WatchStatsDashboard = ({ userId }: { userId?: string }) => {
  const { data: stats } = useQuery({
    queryKey: ["user-statistics", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_statistics").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const moviesWatched = stats?.movies_watched || 0;
  const tvWatched = stats?.tv_shows_watched || 0;
  const totalTime = stats?.total_watch_time || 0;
  const reviewsCount = stats?.reviews_count || 0;
  const commentsCount = stats?.comments_count || 0;
  const hours = Math.floor(totalTime / 60);
  const timeDisplay = hours > 0 ? `${hours}h ${totalTime % 60}m` : `${totalTime}m`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard icon={<Film className="h-5 w-5 text-primary" />} label="Movies Watched" value={moviesWatched} delay={0} />
      <StatCard icon={<Tv className="h-5 w-5 text-primary" />} label="TV Shows" value={tvWatched} delay={0.05} />
      <StatCard icon={<Clock className="h-5 w-5 text-primary" />} label="Watch Time" value={timeDisplay} delay={0.1} />
      <StatCard icon={<Star className="h-5 w-5 text-primary" />} label="Reviews" value={reviewsCount} delay={0.15} />
      <StatCard icon={<MessageSquare className="h-5 w-5 text-primary" />} label="Comments" value={commentsCount} delay={0.2} />
    </div>
  );
};
