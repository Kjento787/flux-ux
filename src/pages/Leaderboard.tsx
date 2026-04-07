import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
        .from("user_xp").select("user_id, total_xp, level, current_streak")
        .order("total_xp", { ascending: false }).limit(50);
      if (!xpData?.length) return [];
      const userIds = xpData.map(x => x.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles").select("id, display_name, avatar_url").in("id", userIds);
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
        .from("user_xp").select("user_id, total_xp, level, current_streak")
        .order("current_streak", { ascending: false }).limit(50);
      if (!xpData?.length) return [];
      const userIds = xpData.map(x => x.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles").select("id, display_name, avatar_url").in("id", userIds);
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
      {entries.map((entry, i) => (
        <Card key={entry.user_id} className={cn(
          "border-border/30 bg-card/50",
          i < 3 && "border-primary/20"
        )}>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs",
              i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
            </div>

            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {(entry.display_name || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{entry.display_name}</p>
              <p className="text-xs text-muted-foreground">Lv.{entry.level}</p>
            </div>

            <div className="text-right">
              {sortBy === "xp" ? (
                <p className="font-bold text-sm text-primary">{entry.total_xp.toLocaleString()} XP</p>
              ) : (
                <p className="font-bold text-sm flex items-center gap-1 justify-end">
                  <Flame className="h-3.5 w-3.5 text-primary" /> {entry.current_streak}d
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {entries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No entries yet</p>
        </div>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Top watchers and streakers</p>
          </div>

          <Tabs defaultValue="xp" className="space-y-6">
            <TabsList className="bg-card/80 border border-border/50">
              <TabsTrigger value="xp" className="gap-1.5">
                <Zap className="h-3.5 w-3.5" /> XP
              </TabsTrigger>
              <TabsTrigger value="streaks" className="gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Streaks
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
