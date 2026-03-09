import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Clock, Bookmark, Trash2, Play, Settings, Loader2,
  Film, Tv, Star, Edit3, Grid3X3, LayoutList, Users, ArrowRight,
  Trophy, Palette, Activity, Sparkles, ChevronRight, Bell, Users as UsersIcon,
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
import { AuroraBackground, OrbitalRings } from "@/components/effects/ParticleField";
import { getContinueWatching, removeWatchProgress, WatchProgress } from "@/lib/watchHistory";
import { getImageUrl, fetchMovieDetails, fetchTVDetails } from "@/lib/tmdb";
import { useProfile } from "@/hooks/useProfile";
import { useWatchlist } from "@/hooks/useWatchlist";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

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
    <div className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</div>
    <h2 className="text-lg font-bold font-display">{title}</h2>
  </div>
);

const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="text-center py-16 glass-holo rounded-2xl">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
      <Icon className="h-8 w-8 text-primary/60" />
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm max-w-xs mx-auto">{description}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, userId } = useProfile();
  const { watchlist, isLoading: watchlistLoading, removeFromWatchlist } = useWatchlist();
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

  useEffect(() => {
    setContinueWatching(getContinueWatching());
  }, []);

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

  if (!isAuthenticated) return null;

  const isWatchlistLoading = watchlistLoading || detailsLoading;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* ===== Profile Hero with Holographic Effects ===== */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          {/* Holographic background effects */}
          <AuroraBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <div className="absolute top-0 left-1/3 w-[600px] h-[300px] rounded-full bg-holo-violet/10 blur-[100px] animate-pulse-glow" />
          <div className="absolute top-10 right-1/4 w-[400px] h-[200px] rounded-full bg-holo-cyan/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: "1s" }} />

          <div className="relative container mx-auto px-4 md:px-8 lg:px-12 pt-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar with holographic ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group flex-shrink-0"
              >
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-holo-violet via-holo-cyan to-holo-magenta blur-xl opacity-40 animate-spin-slow" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 to-holo-cyan/30 animate-pulse" />
                <Avatar className="relative w-28 h-28 md:w-36 md:h-36 border-2 border-primary/30 ring-4 ring-background">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="bg-surface-2 text-4xl font-black font-display text-gradient">
                    {profile?.display_name?.[0]?.toUpperCase() || <User className="h-14 w-14" />}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h1 className="text-3xl md:text-4xl font-black font-display leading-tight text-gradient-aurora">
                    {profile?.display_name || "My Profile"}
                  </h1>
                  {profile?.bio && (
                    <p className="text-muted-foreground mt-1 max-w-xl line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60">
                    {memberSince && <span>Member since {memberSince}</span>}
                  </div>
                </motion.div>

                {userId && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <FollowStats userId={userId} />
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 pt-1">
                  <Link to="/profiles">
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <Users className="h-3.5 w-3.5" />
                      Switch Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all" onClick={() => setActiveTab("settings")}>
                    <Settings className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Main Content ===== */}
        <main className="container mx-auto px-4 md:px-8 lg:px-12 pb-16 space-y-8">
          <DiscordLinkBanner />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass-strong h-12 p-1.5 rounded-2xl w-full sm:w-auto flex-wrap">
              <TabsTrigger value="overview" className="gap-1.5 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-holo-indigo data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon text-xs font-medium transition-all">
                <Activity className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="continue" className="gap-1.5 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-holo-indigo data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon text-xs font-medium transition-all">
                <Clock className="h-3.5 w-3.5" />
                Continue
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5 bg-holo-cyan/20 text-holo-cyan border-0">{continueWatching.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="gap-1.5 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-holo-indigo data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon text-xs font-medium transition-all">
                <Bookmark className="h-3.5 w-3.5" />
                My List
                {!isWatchlistLoading && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5 bg-holo-cyan/20 text-holo-cyan border-0">{watchlistWithDetails.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 px-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-holo-indigo data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon text-xs font-medium transition-all">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW TAB ===== */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Dashboard */}
              <section>
                <SectionHeader icon={<Activity className="h-4 w-4" />} title="Your Stats" />
                <WatchStatsDashboard />
              </section>

              {/* Two-column layout: Activity + Genres */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                  <SectionHeader icon={<Clock className="h-4 w-4" />} title="Recent Activity" />
                  <div className="mt-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin glass-holo rounded-2xl p-4">
                    <ActivityFeed />
                  </div>
                </section>

                <section>
                  <SectionHeader icon={<Palette className="h-4 w-4" />} title="Your Taste" />
                  <div className="mt-3 glass-holo rounded-2xl p-4">
                    <GenreTasteProfile />
                  </div>
                </section>
              </div>

              {/* Achievements */}
              <section>
                <SectionHeader icon={<Trophy className="h-4 w-4" />} title="Achievements" />
                <div className="mt-3 glass-holo rounded-2xl p-4">
                  <AchievementsBadges />
                </div>
              </section>

              {/* Recommendations */}
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 p-4 rounded-2xl glass-holo hover:shadow-hover transition-all group"
                    >
                      <Link to={`/movie/${item.movieId}`} className="flex-shrink-0">
                        <div className="w-32 md:w-40 aspect-video rounded-xl overflow-hidden bg-surface-2 relative">
                          {item.backdropPath ? (
                            <img src={getImageUrl(item.backdropPath, "w300")} alt={item.title} className="w-full h-full object-cover" />
                          ) : item.posterPath ? (
                            <img src={getImageUrl(item.posterPath, "w200")} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-10 w-10 text-foreground fill-current" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-3">
                            <div className="h-full bg-gradient-to-r from-primary to-holo-cyan rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link to={`/movie/${item.movieId}`}>
                          <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{formatTime(item.currentTime)} watched</span>
                          <span>•</span>
                          <span>{Math.round(item.progress)}% complete</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/movie/${item.movieId}`}>
                          <Button className="rounded-xl gap-2 btn-holo">
                            <Play className="h-4 w-4 fill-current" />
                            Resume
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl"
                          onClick={() => handleRemoveProgress(item.movieId)}>
                          <Trash2 className="h-4 w-4" />
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
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : watchlistWithDetails.length === 0 ? (
                <EmptyState icon={Bookmark} title="Your list is empty" description="Save movies and TV shows to your list to watch them later." />
              ) : (
                <>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")}
                      className={cn("h-9 w-9 rounded-xl", viewMode === "grid" && "bg-primary/10 text-primary")}>
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}
                      className={cn("h-9 w-9 rounded-xl", viewMode === "list" && "bg-primary/10 text-primary")}>
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>

                  {viewMode === "grid" ? (
                    <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {watchlistWithDetails.map((item, i) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative">
                          <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}
                            className="block rounded-2xl overflow-hidden glass transition-all hover:scale-105 hover:shadow-hover card-3d">
                            <div className="aspect-[2/3] relative">
                              {item.poster_path ? (
                                <img src={getImageUrl(item.poster_path, "w300")} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-surface-2 flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge className={cn("text-xs border-0", item.content_type === "tv" ? "bg-holo-cyan/80" : "bg-primary/80")}>
                                  {item.content_type === "tv" ? <Tv className="h-3 w-3 mr-1" /> : <Film className="h-3 w-3 mr-1" />}
                                  {item.content_type === "tv" ? "TV" : "Movie"}
                                </Badge>
                              </div>
                              {item.vote_average && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-xs">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  {item.vote_average.toFixed(1)}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <Button size="sm" className="w-full btn-holo gap-2">
                                  <Play className="h-4 w-4 fill-current" /> Watch
                                </Button>
                              </div>
                            </div>
                          </Link>
                          <div className="mt-2 px-1">
                            <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.year}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-lg"
                            onClick={(e) => { e.preventDefault(); handleRemoveFromList(item.content_id, item.content_type); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="grid gap-3">
                      {watchlistWithDetails.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-4 p-4 rounded-2xl glass-holo hover:shadow-hover transition-all group"
                        >
                          <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`} className="flex-shrink-0">
                            <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-surface-2">
                              {item.poster_path ? (
                                <img src={getImageUrl(item.poster_path, "w200")} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}>
                              <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge className={cn("text-xs border-0", item.content_type === "tv" ? "bg-holo-cyan/20 text-holo-cyan" : "bg-primary/20 text-primary")}>
                                {item.content_type === "tv" ? "TV Series" : "Movie"}
                              </Badge>
                              {item.year && <span className="text-sm text-muted-foreground">{item.year}</span>}
                              {item.vote_average && (
                                <span className="text-sm flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={item.content_type === "tv" ? `/tv/${item.content_id}` : `/movie/${item.content_id}`}>
                              <Button className="rounded-xl gap-2 btn-holo">
                                <Play className="h-4 w-4 fill-current" />
                                Watch
                              </Button>
                            </Link>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl"
                              onClick={() => handleRemoveFromList(item.content_id, item.content_type)}>
                              <Trash2 className="h-4 w-4" />
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
            <TabsContent value="settings" className="space-y-6">
              <div className="glass-holo rounded-2xl p-6">
                <ProfileSettings />
              </div>
              <div className="glass-holo rounded-2xl p-6">
                <NotificationPreferences />
              </div>
              <div className="glass-holo rounded-2xl p-6">
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
