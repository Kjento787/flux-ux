import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  tier: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
}

const TIER_STYLES: Record<string, string> = {
  bronze: "from-primary/10 to-primary/5 border-primary/20",
  silver: "from-muted/30 to-muted/10 border-border/40",
  gold: "from-primary/20 to-primary/10 border-primary/30",
  platinum: "from-primary/30 to-primary/15 border-primary/40",
};

export const AchievementsBadges = ({ userId }: { userId?: string }) => {
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("achievements").select("*").order("category", { ascending: true });
      return (data || []) as Achievement[];
    },
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_achievements").select("*").eq("user_id", userId!);
      return (data || []) as UserAchievement[];
    },
    enabled: !!userId,
  });

  const { data: userXp } = useQuery({
    queryKey: ["user-xp", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const totalXp = userXp?.total_xp || 0;
  const level = userXp?.level || 1;
  const streak = userXp?.current_streak || 0;
  const xpProgress = (totalXp % 100);

  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="space-y-6">
      {/* XP Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">Level {level}</p>
            <Progress value={xpProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-lg font-semibold capitalize mb-3">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.filter((a) => a.category === cat).map((achievement, i) => {
              const unlocked = unlockedIds.has(achievement.id);
              return (
                <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className={cn("border transition-all relative overflow-hidden", unlocked ? `bg-gradient-to-br ${TIER_STYLES[achievement.tier] || TIER_STYLES.bronze}` : "bg-card/30 border-border/20 opacity-60")}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn("text-2xl flex-shrink-0", !unlocked && "grayscale opacity-50")}>{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate">{achievement.title}</p>
                          {!unlocked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{achievement.description}</p>
                        <Badge variant="outline" className="text-[10px] mt-1 px-1.5 py-0">+{achievement.xp_reward} XP</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {achievements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Achievements loading...</p>
        </div>
      )}
    </div>
  );
};
