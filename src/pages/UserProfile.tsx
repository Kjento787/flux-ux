import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FollowButton } from "@/components/FollowButton";
import { FollowStats } from "@/components/FollowStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Star, MessageSquare, Film, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState, useEffect } from "react";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["user-reviews", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", id)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Profile Hero */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-0 left-1/3 w-[600px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />

          <div className="relative container mx-auto px-4 md:px-8 lg:px-12 pt-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 blur-lg opacity-50" />
                <Avatar className="relative w-28 h-28 md:w-36 md:h-36 border-2 border-primary/20 ring-2 ring-background">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-card text-4xl font-black font-display text-primary">
                    {profile.display_name?.[0]?.toUpperCase() || <User className="h-14 w-14" />}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <div className="flex-1 space-y-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h1 className="text-3xl md:text-4xl font-black font-display">{profile.display_name || "Anonymous"}</h1>
                  {profile.bio && <p className="text-muted-foreground mt-1 max-w-xl">{profile.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60">
                    {memberSince && <span>Member since {memberSince}</span>}
                  </div>
                </motion.div>

                {id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <FollowStats userId={id} />
                  </motion.div>
                )}

                {id && currentUserId && currentUserId !== id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <FollowButton targetUserId={id} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Reviews */}
        <main className="container mx-auto px-4 md:px-8 lg:px-12 pb-16 space-y-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Film, label: "Movies Watched", value: stats.movies_watched || 0 },
                { icon: Film, label: "TV Shows", value: stats.tv_shows_watched || 0 },
                { icon: Star, label: "Reviews", value: stats.reviews_count || 0 },
                { icon: Clock, label: "Watch Time", value: `${Math.round((stats.total_watch_time || 0) / 60)}h` },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Card className="bg-card/60 border-border/30">
                    <CardContent className="p-4 text-center">
                      <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-black font-display">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <section>
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Recent Reviews
              </h2>
              <div className="space-y-3">
                {reviews.map((review: any, i: number) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card/60 border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {review.content_type === "tv" ? "TV" : "Movie"} #{review.content_id}
                            </Badge>
                            <span className="flex items-center gap-1 text-primary text-sm font-bold">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {review.rating}/10
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{review.review_text}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default UserProfile;
