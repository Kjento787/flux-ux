import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, Flame, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TIER_COLORS: Record<string, string> = {
  bronze: "text-orange-400",
  silver: "text-gray-300",
  gold: "text-yellow-400",
  platinum: "text-cyan-300",
  diamond: "text-purple-400",
};

const getLevelTier = (level: number) => {
  if (level >= 50) return { name: "Diamond", color: TIER_COLORS.diamond, icon: "💎" };
  if (level >= 30) return { name: "Platinum", color: TIER_COLORS.platinum, icon: "🏆" };
  if (level >= 15) return { name: "Gold", color: TIER_COLORS.gold, icon: "🥇" };
  if (level >= 5) return { name: "Silver", color: TIER_COLORS.silver, icon: "🥈" };
  return { name: "Bronze", color: TIER_COLORS.bronze, icon: "🥉" };
};

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  display_name: string | null;
  avatar_url: string | null;
}

const Leaderboard = () => {
  const { data: xpLeaderboard = [] } = useQuery({
    queryKey: ["leaderboard-xp"],
    queryFn: async () => {
      const { data: xpData } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, level, current_streak")
        .order("total_xp", { ascending: false })
        .limit(50);

      if (!xpData?.length) return [];

      const userIds = xpData.map(x => x.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return xpData.map(x => ({
        ...x,
        display_name: profileMap.get(x.user_id)?.display_name || "Anonymous",
        avatar_url: profileMap.get(x.user_id)?.avatar_url || null,
      })) as LeaderboardEntry[];
    },
  });

  const { data: streakLeaderboard = [] } = useQuery({
    queryKey: ["leaderboard-streaks"],
    queryFn: async () => {
      const { data: xpData } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, level, current_streak")
        .order("current_streak", { ascending: false })
        .limit(50);

      if (!xpData?.length) return [];

      const userIds = xpData.map(x => x.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return xpData.map(x => ({
        ...x,
        display_name: profileMap.get(x.user_id)?.display_name || "Anonymous",
        avatar_url: profileMap.get(x.user_id)?.avatar_url || null,
      })) as LeaderboardEntry[];
    },
  });

  const renderLeaderboard = (entries: LeaderboardEntry[], sortBy: "xp" | "streak") => (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const tier = getLevelTier(entry.level);
        const isTop3 = i < 3;

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={cn(
              "border-border/30 bg-card/50 transition-all",
              isTop3 && "border-primary/30 bg-primary/5"
            )}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  i === 1 ? "bg-gray-400/20 text-gray-300" :
                  i === 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-muted text-muted-foreground"
                )}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                </div>

                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {(entry.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.display_name}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs", tier.color)}>
                      {tier.icon} Lv.{entry.level}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {sortBy === "xp" ? (
                    <div>
                      <p className="font-bold text-sm text-primary">{entry.total_xp.toLocaleString()} XP</p>
                      {entry.current_streak > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end">
                          <Flame className="h-3 w-3 text-orange-400" /> {entry.current_streak}d
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-sm flex items-center gap-1 justify-end">
                        <Flame className="h-4 w-4 text-orange-400" /> {entry.current_streak} days
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.total_xp.toLocaleString()} XP</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      {entries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No entries yet. Start watching to climb the ranks!</p>
        </div>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground">Top watchers and streakers</p>
            </div>
          </div>

          <Tabs defaultValue="xp" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="xp" className="gap-1.5">
                <Zap className="h-4 w-4" /> XP Rankings
              </TabsTrigger>
              <TabsTrigger value="streaks" className="gap-1.5">
                <Flame className="h-4 w-4" /> Streaks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp">{renderLeaderboard(xpLeaderboard, "xp")}</TabsContent>
            <TabsContent value="streaks">{renderLeaderboard(streakLeaderboard, "streak")}</TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
