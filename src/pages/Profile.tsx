import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Clock, Bookmark, Trash2, Play, Settings, Loader2,
  Film, Tv, Star, Grid3X3, LayoutList, Users,
  Trophy, Activity, ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileSettings } from "@/components/ProfileSettings";
import { FollowStats } from "@/components/FollowStats";
import { Recommendations } from "@/components/Recommendations";
import { DiscordLinkBanner } from "@/components/DiscordLinkBanner";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { SharedWatchlists } from "@/components/social/SharedWatchlists";
import { WatchStatsDashboard } from "@/components/profile/WatchStatsDashboard";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { AchievementsBadges } from "@/components/profile/AchievementsBadges";
import { GenreTasteProfile } from "@/components/profile/GenreTasteProfile";
import { getContinueWatching, removeWatchProgress, WatchProgress } from "@/lib/watchHistory";
import { getImageUrl, fetchMovieDetails, fetchTVDetails } from "@/lib/tmdb";
import { useProfile } from "@/hooks/useProfile";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";

interface WatchlistItemWithDetails {
  id: string;
  content_id: number;
  content_type: "movie" | "tv";
  added_at: string;
  title: string;
  poster_path: string | null;
  vote_average?: number;
  year?: string;
}

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
    <h2 className="text-base font-semibold">{title}</h2>
  </div>
);

const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="h-7 w-7 text-primary/60" />
    </div>
    <h3 className="font-semibold text-base mb-1">{title}</h3>
    <p className="text-muted-foreground text-sm max-w-xs mx-auto">{description}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, userId } = useProfile();
  const { watchlist, isLoading: watchlistLoading, removeFromWatchlist } = useWatchlist();
  const { trackActivity, syncStats } = useAchievementChecker();
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (!session?.user) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  // Track daily activity and sync stats on profile load
  useEffect(() => {
    if (isAuthenticated && userId) {
      trackActivity();
      syncStats();
    }
  }, [isAuthenticated, userId, trackActivity, syncStats]);

  useEffect(() => {
    setContinueWatching(getContinueWatching());
  }, []);

  // Fetch user XP for the header
  const { data: userXp } = useQuery({
    queryKey: ["user-xp-header", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: watchlistWithDetails = [], isLoading: detailsLoading } = useQuery({
    queryKey: ["watchlist-details", watchlist],
    queryFn: async () => {
      if (!watchlist || watchlist.length === 0) return [];
      const details = await Promise.all(
        watchlist.map(async (item) => {
          try {
            if (item.content_type === "movie") {
              const data = await fetchMovieDetails(item.content_id);
              return { ...item, title: data.title || "Unknown", poster_path: data.poster_path, vote_average: data.vote_average, year: data.release_date?.split("-")[0] };
            } else {
              const data = await fetchTVDetails(item.content_id);
              return { ...item, title: data.name || "Unknown", poster_path: data.poster_path, vote_average: data.vote_average, year: data.first_air_date?.split("-")[0] };
            }
          } catch {
            return { ...item, title: "Unknown", poster_path: null };
          }
        })
      );
      return details as WatchlistItemWithDetails[];
    },
    enabled: !!watchlist && watchlist.length > 0,
  });

  const handleRemoveProgress = (movieId: number) => {
    removeWatchProgress(movieId);
    setContinueWatching(getContinueWatching());
  };

  const handleRemoveFromList = (contentId: number, contentType: "movie" | "tv") => {
    removeFromWatchlist.mutate({ contentId, contentType });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const level = userXp?.level || 1;
  const totalXp = userXp?.total_xp || 0;
  const xpInLevel = totalXp % 100;
  const streak = userXp?.current_streak || 0;

  if (!isAuthenticated) return null;

  const isWatchlistLoading = watchlistLoading || detailsLoading;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* ===== Profile Hero ===== */}
        <section className="pt-24 pb-8 border-b border-border/30">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-20 h-20 border-2 border-border/50">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="bg-card text-2xl font-bold text-primary">
                    {profile?.display_name?.[0]?.toUpperCase() || <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.display_name || "My Profile"}
                  </h1>
                  {profile?.bio && (
                    <p className="text-muted-foreground text-sm mt-1 max-w-xl line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {memberSince && <span>Member since {memberSince}</span>}
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Trophy className="h-3 w-3" /> Level {level}
                    </span>
                    {streak > 0 && (
                      <span className="flex items-center gap-1">🔥 {streak} day streak</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 max-w-xs">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{xpInLevel}/100 XP</span>
                    <Progress value={xpInLevel} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground">Lv {level + 1}</span>
                  </div>
                </div>

                {userId && <FollowStats userId={userId} />}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/profiles">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Users className="h-3 w-3" />
                      Switch Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setActiveTab("settings")}>
                    <Settings className="h-3 w-3" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Main Content ===== */}
        <main className="container mx-auto px-4 md:px-8 lg:px-12 py-6 pb-16 space-y-6">
          <DiscordLinkBanner />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/80 border border-border/50 h-10 p-1 rounded-lg w-full sm:w-auto">
              <TabsTrigger value="overview" className="gap-1.5 px-3 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium">
                <Activity className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="continue" className="gap-1.5 px-3 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                Continue
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{continueWatching.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="gap-1.5 px-3 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium">
                <Bookmark className="h-3.5 w-3.5" />
                My List
                {!isWatchlistLoading && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{watchlistWithDetails.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 px-3 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW TAB ===== */}
            <TabsContent value="overview" className="space-y-6">
              <section>
                <SectionHeader icon={<Activity className="h-4 w-4" />} title="Your Stats" />
                <WatchStatsDashboard userId={userId || undefined} />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                  <SectionHeader icon={<Clock className="h-4 w-4" />} title="Recent Activity" />
                  <div className="max-h-[400px] overflow-y-auto pr-1 rounded-xl border border-border/30 bg-card/30 p-4">
                    <ActivityFeed />
                  </div>
                </section>

                <section>
                  <SectionHeader icon={<ChevronRight className="h-4 w-4" />} title="Your Taste" />
                  <div className="rounded-xl border border-border/30 bg-card/30 p-4">
                    <GenreTasteProfile />
                  </div>
                </section>
              </div>

              <section>
                <SectionHeader icon={<Trophy className="h-4 w-4" />} title="Achievements" />
                <div className="rounded-xl border border-border/30 bg-card/30 p-4">
                  <AchievementsBadges userId={userId || undefined} />
                </div>
              </section>

              <section>
                <Recommendations />
              </section>
            </TabsContent>

            {/* ===== CONTINUE WATCHING TAB ===== */}
            <TabsContent value="continue" className="space-y-4">
              {continueWatching.length === 0 ? (
                <EmptyState icon={Clock} title="Nothing in progress" description="Start watching movies and TV shows, and they'll appear here." />
              ) : (
                <div className="grid gap-3">
                  {continueWatching.map((item, i) => (
                    <motion.div
                      key={item.movieId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-4 p-3 rounded-xl border border-border/30 bg-card/50 hover:border-primary/20 transition-all group"
                    >
                      <Link to={`/movie/${item.movieId}`} className="flex-shrink-0">
                        <div className="w-32 md:w-40 aspect-video rounded-lg overflow-hidden bg-secondary relative">
                          {item.backdropPath ? (
                            <img src={getImageUrl(item.backdropPath, "w300")} alt={item.title} className="w-full h-full object-cover" />
                          ) : item.posterPath ? (
                            <img src={getImageUrl(item.posterPath, "w200")} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-8 w-8 text-foreground fill-current" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link to={`/movie/${item.movieId}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{formatTime(item.currentTime)} watched</span>
                          <span>•</span>
                          <span>{Math.round(item.progress)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/movie/${item.movieId}`}>
                          <Button size="sm" className="rounded-lg gap-1.5">
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Resume
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                          onClick={() => handleRemoveProgress(item.movieId)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ===== WATCHLIST TAB ===== */}
            <TabsContent value="watchlist" className="space-y-4">
              {isWatchlistLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : watchlistWithDetails.length === 0 ? (
                <EmptyState icon={Bookmark} title="Your list is empty" description="Save movies and TV shows to your list to watch them later." />
              ) : (
                <>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")}
                      className={cn("h-8 w-8 rounded-lg", viewMode === "grid" && "bg-primary/10 text-primary")}>
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}
                      className={cn("h-8 w-8 rounded-lg", viewMode === "list" && "bg-primary/10 text-primary")}>
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {watchlistWithDetails.map((item, i) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group relative">
                          <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}
                            className="block rounded-lg overflow-hidden border border-border/30 transition-all hover:border-primary/30 hover:scale-[1.02]">
                            <div className="aspect-[2/3] relative">
                              {item.poster_path ? (
                                <img src={getImageUrl(item.poster_path, "w300")} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge className={cn("text-[10px] border-0", item.content_type === "tv" ? "bg-accent text-accent-foreground" : "bg-primary/80 text-primary-foreground")}>
                                  {item.content_type === "tv" ? "TV" : "Movie"}
                                </Badge>
                              </div>
                              {item.vote_average && (
                                <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[10px]">
                                  <Star className="h-2.5 w-2.5 text-primary fill-primary" />
                                  {item.vote_average.toFixed(1)}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <Button size="sm" className="w-full gap-1 text-xs h-7">
                                  <Play className="h-3 w-3 fill-current" /> Watch
                                </Button>
                              </div>
                            </div>
                          </Link>
                          <div className="mt-1.5 px-0.5">
                            <p className="font-medium text-xs line-clamp-1">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.year}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-md"
                            onClick={(e) => { e.preventDefault(); handleRemoveFromList(item.content_id, item.content_type); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {watchlistWithDetails.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex gap-3 p-3 rounded-xl border border-border/30 bg-card/50 hover:border-primary/20 transition-all group"
                        >
                          <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`} className="flex-shrink-0">
                            <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                              {item.poster_path ? (
                                <img src={getImageUrl(item.poster_path, "w200")} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}>
                              <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {item.content_type === "tv" ? "TV" : "Movie"}
                              </Badge>
                              {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
                              {item.vote_average && (
                                <span className="text-xs flex items-center gap-0.5">
                                  <Star className="h-3 w-3 text-primary fill-primary" />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}>
                              <Button size="sm" className="rounded-lg gap-1.5 h-8">
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Watch
                              </Button>
                            </Link>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                              onClick={() => handleRemoveFromList(item.content_id, item.content_type)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* ===== SETTINGS TAB ===== */}
            <TabsContent value="settings" className="space-y-4">
              <div className="rounded-xl border border-border/30 bg-card/50 p-5">
                <ProfileSettings />
              </div>
              <div className="rounded-xl border border-border/30 bg-card/50 p-5">
                <NotificationPreferences />
              </div>
              <div className="rounded-xl border border-border/30 bg-card/50 p-5">
                <SharedWatchlists />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Profile;
