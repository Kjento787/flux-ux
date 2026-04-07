import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Tv, Clock, Star, Flame, Trophy, Share2 } from "lucide-react";

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
      const { data } = await supabase.from("user_statistics").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["yearly-reviews", userId],
    queryFn: async () => {
      const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", userId!);
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
      const { count } = await supabase.from("user_achievements").select("*", { count: "exact", head: true }).eq("user_id", userId!);
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
    { icon: Film, label: "Movies Watched", value: moviesWatched },
    { icon: Tv, label: "TV Shows Watched", value: tvWatched },
    { icon: Clock, label: "Hours Watched", value: hours },
    { icon: Star, label: "Reviews Written", value: reviewCount },
    { icon: Flame, label: "Longest Streak", value: `${longestStreak} days` },
    { icon: Trophy, label: "Achievements", value: achievementCount },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{year} Recap</h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what your year on Flux-UX looked like</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {recapCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="border-border/30 bg-card/50">
                  <CardContent className="p-5 text-center">
                    <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">You reached</p>
              <p className="text-4xl font-bold text-primary mb-1">Level {level}</p>
              <p className="text-sm text-muted-foreground">
                with {(xpData?.total_xp || 0).toLocaleString()} total XP earned
              </p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> Share Your Recap
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default YearlyRecap;
