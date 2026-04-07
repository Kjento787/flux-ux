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
import { User, Star, Film, Clock } from "lucide-react";
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
      const { data, error } = await supabase.from("public_profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["user-reviews", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await supabase.from("reviews").select("*").eq("user_id", id).eq("is_approved", true).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase.from("user_statistics").select("*").eq("user_id", id).single();
      return data;
    },
    enabled: !!id,
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <p className="text-muted-foreground text-sm">User not found</p>
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

        <section className="pt-24 pb-8 border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <Avatar className="w-20 h-20 border-2 border-border/50">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-card text-xl font-bold text-primary">
                  {profile.display_name?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <h1 className="text-2xl font-bold">{profile.display_name || "Anonymous"}</h1>
                {profile.bio && <p className="text-sm text-muted-foreground max-w-xl">{profile.bio}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {memberSince && <span>Member since {memberSince}</span>}
                </div>
                {id && <FollowStats userId={id} />}
                {id && currentUserId && currentUserId !== id && (
                  <FollowButton targetUserId={id} />
                )}
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Film, label: "Movies", value: stats.movies_watched || 0 },
                { icon: Film, label: "TV Shows", value: stats.tv_shows_watched || 0 },
                { icon: Star, label: "Reviews", value: stats.reviews_count || 0 },
                { icon: Clock, label: "Watch Time", value: `${Math.round((stats.total_watch_time || 0) / 60)}h` },
              ].map((stat) => (
                <Card key={stat.label} className="bg-card/50 border-border/30">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reviews.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4">Recent Reviews</h2>
              <div className="space-y-2">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="bg-card/50 border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {review.content_type === "tv" ? "TV" : "Movie"} #{review.content_id}
                          </Badge>
                          <span className="flex items-center gap-1 text-primary text-sm font-bold">
                            <Star className="h-3 w-3 fill-current" />
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
