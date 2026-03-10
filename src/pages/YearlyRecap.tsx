import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Clock, Star, Flame, Trophy, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const YearlyRecap = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data: stats } = useQuery({
    queryKey: ["yearly-stats", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["yearly-reviews", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!);
      return count || 0;
    },
    enabled: !!userId,
  });

  const { data: xpData } = useQuery({
    queryKey: ["yearly-xp", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: achievementCount = 0 } = useQuery({
    queryKey: ["yearly-achievements", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("user_achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!);
      return count || 0;
    },
    enabled: !!userId,
  });

  const moviesWatched = stats?.movies_watched || 0;
  const tvWatched = stats?.tv_shows_watched || 0;
  const totalTime = stats?.total_watch_time || 0;
  const hours = Math.floor(totalTime / 60);
  const level = xpData?.level || 1;
  const longestStreak = xpData?.longest_streak || 0;

  const recapCards = [
    {
      icon: <Film className="h-10 w-10" />,
      label: "Movies Watched",
      value: moviesWatched,
      color: "from-blue-600/20 to-blue-900/10 border-blue-600/30",
      iconColor: "text-blue-400",
    },
    {
      icon: <Tv className="h-10 w-10" />,
      label: "TV Shows Watched",
      value: tvWatched,
      color: "from-purple-600/20 to-purple-900/10 border-purple-600/30",
      iconColor: "text-purple-400",
    },
    {
      icon: <Clock className="h-10 w-10" />,
      label: "Hours Watched",
      value: hours,
      color: "from-emerald-600/20 to-emerald-900/10 border-emerald-600/30",
      iconColor: "text-emerald-400",
    },
    {
      icon: <Star className="h-10 w-10" />,
      label: "Reviews Written",
      value: reviewCount,
      color: "from-amber-600/20 to-amber-900/10 border-amber-600/30",
      iconColor: "text-amber-400",
    },
    {
      icon: <Flame className="h-10 w-10" />,
      label: "Longest Streak",
      value: `${longestStreak} days`,
      color: "from-orange-600/20 to-orange-900/10 border-orange-600/30",
      iconColor: "text-orange-400",
    },
    {
      icon: <Trophy className="h-10 w-10" />,
      label: "Achievements Unlocked",
      value: achievementCount,
      color: "from-yellow-600/20 to-yellow-900/10 border-yellow-600/30",
      iconColor: "text-yellow-400",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Year in Review</span>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                {year} Recap
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what your year on Flux-UX looked like
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {recapCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <Card className={cn("border bg-gradient-to-br overflow-hidden", card.color)}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("flex-shrink-0", card.iconColor)}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{card.value}</p>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Level card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">You reached</p>
                <p className="text-6xl font-bold text-primary mb-2">Level {level}</p>
                <p className="text-muted-foreground">
                  with {(xpData?.total_xp || 0).toLocaleString()} total XP earned
                </p>
                <Button variant="outline" className="mt-6 gap-2">
                  <Share2 className="h-4 w-4" /> Share Your Recap
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default YearlyRecap;
