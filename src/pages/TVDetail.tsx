import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  Calendar,
  ChevronLeft,
  Tv,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
  ChevronRight,
  List,
  Bell,
  BellOff,
  MessageCircle,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCarousel } from "@/components/MovieCarousel";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ReviewSection } from "@/components/ReviewSection";
import { TMDBReviews } from "@/components/TMDBReviews";
import { WatchlistButton } from "@/components/WatchlistButton";
import { VideoPlayerRevamped } from "@/components/VideoPlayerRevamped";
import { AgeVerificationDialog } from "@/components/AgeVerificationDialog";
import { CommentsSection } from "@/components/CommentsSection";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  fetchTVDetails,
  fetchSimilarTV,
  fetchTVVideos,
  getImageUrl,
  isTVAdultRated,
} from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: "easeOut" as const },
  }),
};

const TVDetail = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = parseInt(id || "0");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false);
  const [discordInput, setDiscordInput] = useState("");
  const [savingDiscord, setSavingDiscord] = useState(false);

  const { isFavorited, addFavorite, removeFavorite, userId } = useFavorites();
  const { profile, updateProfile } = useProfile();

  const { data: tvShow, isLoading } = useQuery({
    queryKey: ["tv", tvId],
    queryFn: () => fetchTVDetails(tvId),
    enabled: !!tvId,
  });

  const { data: similarData } = useQuery({
    queryKey: ["similarTV", tvId],
    queryFn: () => fetchSimilarTV(tvId),
    enabled: !!tvId,
  });

  const { data: videosData } = useQuery({
    queryKey: ["tvVideos", tvId],
    queryFn: () => fetchTVVideos(tvId),
    enabled: !!tvId,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

  useEffect(() => {
    if (tvShow?.seasons && tvShow.seasons.length > 0) {
      const validSeasons = tvShow.seasons.filter(s => s.season_number > 0);
      if (validSeasons.length > 0 && selectedSeason === null) {
        setSelectedSeason(validSeasons[0].season_number);
        setSelectedEpisode(1);
      }
    }
  }, [tvShow, selectedSeason]);

  const handleSeasonChange = (newSeason: number) => {
    if (newSeason !== selectedSeason) {
      setSelectedSeason(newSeason);
      setSelectedEpisode(1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tvId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreview(true), 2000);
    return () => clearTimeout(timer);
  }, [tvId]);

  const isAdult = tvShow ? isTVAdultRated(tvShow) : false;
  const isFav = tvShow ? isFavorited(tvShow.id, "tv") : false;

  const doAddFavoriteTv = () => {
    if (!tvShow) return;
    const realSeasons = (tvShow.seasons || []).filter((s: any) => s.season_number > 0);
    addFavorite.mutate({
      tmdb_id: tvShow.id,
      content_type: "tv",
      title: tvShow.name,
      release_date: (tvShow as any).next_episode_to_air?.air_date || tvShow.first_air_date,
      poster_path: tvShow.poster_path,
      last_known_seasons: realSeasons.length,
    });
  };

  const toggleNotify = () => {
    if (!tvShow) return;
    if (isFav) {
      removeFavorite.mutate({ tmdb_id: tvShow.id, content_type: "tv" });
    } else if (!profile?.discord_user_id) {
      setDiscordInput("");
      setDiscordDialogOpen(true);
    } else {
      doAddFavoriteTv();
    }
  };

  const handleSaveDiscordAndNotify = async () => {
    const trimmed = discordInput.trim();
    if (!trimmed || trimmed.length < 15) {
      toast.error("Please enter a valid Discord User ID (15+ digits)");
      return;
    }
    setSavingDiscord(true);
    const success = await updateProfile({ discord_user_id: trimmed });
    if (success) {
      supabase.functions.invoke("discord-send-dm", {
        body: { discord_user_id: trimmed, display_name: profile?.display_name },
      }).catch(() => {});
      setDiscordDialogOpen(false);
      doAddFavoriteTv();
      toast.success("Discord linked! You'll get DM notifications now 🔔");
    }
    setSavingDiscord(false);
  };

  const handlePlay = () => {
    if (isAdult) {
      setShowAgeVerification(true);
    } else {
      setIsPlaying(true);
    }
  };

  const handleAgeConfirm = () => {
    setShowAgeVerification(false);
    setIsPlaying(true);
  };

  const handleNextEpisode = () => {
    if (selectedEpisode < episodeCount) {
      setSelectedEpisode(prev => prev + 1);
      setPlayerKey(prev => prev + 1);
    } else if (tvShow?.seasons) {
      const validSeasons = tvShow.seasons.filter(s => s.season_number > 0);
      const currentSeasonIndex = validSeasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex < validSeasons.length - 1) {
        const nextSeason = validSeasons[currentSeasonIndex + 1];
        setSelectedSeason(nextSeason.season_number);
        setSelectedEpisode(1);
        setPlayerKey(prev => prev + 1);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
      setPlayerKey(prev => prev + 1);
    } else if (tvShow?.seasons) {
      const validSeasons = tvShow.seasons.filter(s => s.season_number > 0);
      const currentSeasonIndex = validSeasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex > 0) {
        const prevSeason = validSeasons[currentSeasonIndex - 1];
        setSelectedSeason(prevSeason.season_number);
        const prevSeasonEpisodes = prevSeason.episode_count || 1;
        setSelectedEpisode(prevSeasonEpisodes);
        setPlayerKey(prev => prev + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <h1 className="text-2xl font-bold mb-4">TV Show Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trailer = tvShow.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || videosData?.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const creator = tvShow.credits?.crew.find((c) => c.job === "Creator" || c.job === "Executive Producer");
  const cast = tvShow.credits?.cast.slice(0, 12) || [];
  const currentSeason = tvShow.seasons?.find(s => s.season_number === selectedSeason);
  const episodeCount = currentSeason?.episode_count || 10;
  const validSeasons = tvShow.seasons?.filter(s => s.season_number > 0) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <AgeVerificationDialog
          open={showAgeVerification}
          onConfirm={handleAgeConfirm}
          onCancel={() => setShowAgeVerification(false)}
          title={tvShow.name}
        />

        {isPlaying && (
          <VideoPlayerRevamped
            key={playerKey}
            contentId={tvShow.id}
            contentType="tv"
            title={tvShow.name}
            subtitle={`Season ${selectedSeason}, Episode ${selectedEpisode}`}
            season={selectedSeason || 1}
            episode={selectedEpisode}
            totalEpisodes={episodeCount}
            totalSeasons={validSeasons.length}
            onClose={() => setIsPlaying(false)}
            onNextEpisode={handleNextEpisode}
            onPreviousEpisode={handlePreviousEpisode}
            onEpisodeSelect={(ep) => {
              setSelectedEpisode(ep);
              setPlayerKey(prev => prev + 1);
            }}
            onSeasonSelect={(s) => {
              setSelectedSeason(s);
              setSelectedEpisode(1);
              setPlayerKey(prev => prev + 1);
            }}
          />
        )}

        {showTrailer && trailer && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
              <h2 className="text-lg font-semibold">{tvShow.name} - Trailer</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTrailer(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 w-full">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        )}

        {/* Immersive Hero */}
        <section className="relative min-h-screen">
          <div className="absolute inset-0">
            <motion.img
              src={getImageUrl(tvShow.backdrop_path, "original")}
              alt={tvShow.name}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
            />
            {showPreview && trailer && (
              <div className="absolute inset-0">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${previewMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&showinfo=0`}
                  className="w-full h-full object-cover scale-125"
                  allow="autoplay"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
            {/* Film grain texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          </div>

          <div className="relative container mx-auto px-4 md:px-8 lg:px-12 pt-32 pb-16 min-h-screen flex flex-col justify-end">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Link
                to="/"
                className="absolute top-24 left-4 md:left-8 lg:left-12 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors glass px-4 py-2 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </motion.div>

            {showPreview && trailer && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-24 right-4 md:right-8 lg:right-12 glass rounded-full h-10 w-10"
                onClick={() => setPreviewMuted(!previewMuted)}
              >
                {previewMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            )}

            <div className="max-w-3xl space-y-6">
              {/* Badges */}
              <motion.div className="flex items-center gap-3 flex-wrap" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 gap-1">
                  <Tv className="h-3.5 w-3.5" />
                  TV Series
                </Badge>
                {isAdult && (
                  <Badge variant="destructive" className="gap-1 text-sm px-3 py-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    18+
                  </Badge>
                )}
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                  {tvShow.vote_average.toFixed(1)}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-border/50">
                  {tvShow.first_air_date?.split("-")[0]}
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight font-display"
                style={{ textShadow: '0 4px 30px hsl(var(--primary) / 0.15)' }}
                variants={fadeUp} initial="hidden" animate="visible" custom={1}
              >
                {tvShow.name}
              </motion.h1>

              {tvShow.tagline && (
                <motion.p
                  className="text-xl md:text-2xl text-primary/70 italic font-light font-display"
                  variants={fadeUp} initial="hidden" animate="visible" custom={2}
                >
                  "{tvShow.tagline}"
                </motion.p>
              )}

              {/* Stats */}
              <motion.div className="flex flex-wrap gap-6 text-sm font-medium" variants={fadeUp} initial="hidden" animate="visible" custom={2.5}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{tvShow.number_of_seasons} Seasons</span>
                </div>
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" />
                  <span>{tvShow.number_of_episodes} Episodes</span>
                </div>
                {tvShow.status && (
                  <Badge variant="secondary" className="px-3">
                    {tvShow.status}
                  </Badge>
                )}
              </motion.div>

              {/* Genres */}
              <motion.div className="flex flex-wrap gap-2" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                {tvShow.genres.map((genre) => (
                  <Badge 
                    key={genre.id} 
                    variant="secondary" 
                    className="px-4 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </motion.div>

              <motion.p
                className="text-base md:text-lg text-foreground/80 leading-relaxed line-clamp-3"
                variants={fadeUp} initial="hidden" animate="visible" custom={4}
              >
                {tvShow.overview}
              </motion.p>

              {/* Season/Episode Selector */}
              <motion.div className="flex flex-wrap gap-4 items-center pt-2" variants={fadeUp} initial="hidden" animate="visible" custom={4.5}>
                <div className="glass rounded-xl p-1.5 flex gap-1 overflow-x-auto hide-scrollbar max-w-full border border-border/30">
                  {validSeasons.slice(0, 8).map((season) => (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                        selectedSeason === season.season_number
                          ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                          : "hover:bg-secondary/50"
                      )}
                    >
                      S{season.season_number}
                    </button>
                  ))}
                  {validSeasons.length > 8 && (
                    <span className="px-4 py-2 text-sm text-muted-foreground">+{validSeasons.length - 8} more</span>
                  )}
                </div>
              </motion.div>

              {/* Episode Grid */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
                <ScrollArea className="w-full pb-4">
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(episodeCount, 20) }, (_, i) => i + 1).map((ep) => (
                      <button
                        key={ep}
                        onClick={() => setSelectedEpisode(ep)}
                        className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-lg font-semibold transition-all duration-200",
                          selectedEpisode === ep
                            ? "bg-primary text-primary-foreground scale-110 shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                            : "bg-card/50 hover:bg-card border border-border/30 hover:border-primary/30"
                        )}
                      >
                        {ep}
                      </button>
                    ))}
                    {episodeCount > 20 && (
                      <span className="flex items-center px-4 text-sm text-muted-foreground">+{episodeCount - 20} more</span>
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="flex flex-wrap items-center gap-4 pt-4" variants={fadeUp} initial="hidden" animate="visible" custom={5.5}>
                <Button 
                  size="lg" 
                  onClick={handlePlay}
                  className="h-14 px-8 text-lg font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-3 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-shadow duration-300"
                >
                  <Play className="h-6 w-6 fill-current" />
                  S{selectedSeason} E{selectedEpisode}
                </Button>

                {trailer && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setShowTrailer(true)}
                    className="h-14 px-8 text-lg font-semibold rounded-lg glass gap-3 border-border/50 hover:border-primary/50 transition-colors duration-300"
                  >
                    <Tv className="h-5 w-5" />
                    Trailer
                  </Button>
                )}

                {isAuthenticated && (
                  <WatchlistButton
                    contentId={tvId}
                    contentType="tv"
                    size="lg"
                    variant="outline"
                    className="h-14 w-14 rounded-lg glass border-border/50 hover:border-primary/50"
                  />
                )}

                {isAuthenticated && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={toggleNotify}
                    disabled={addFavorite.isPending || removeFavorite.isPending}
                    className={cn(
                      "h-14 px-6 rounded-lg gap-2 font-semibold transition-all duration-300",
                      isFav
                        ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
                        : "glass border-border/50 hover:border-primary/50"
                    )}
                  >
                    {isFav ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    {isFav ? "Notifying" : "Notify Me"}
                  </Button>
                )}
              </motion.div>

              {creator && (
                <motion.div className="text-sm pt-2" variants={fadeUp} initial="hidden" animate="visible" custom={6}>
                  <span className="text-muted-foreground">Created by </span>
                  <span className="font-semibold text-primary/90">{creator.name}</span>
                </motion.div>
              )}

              {/* Gold accent line */}
              <motion.div
                className="h-px w-24 bg-gradient-to-r from-primary/60 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </div>
          </div>
        </section>

        {/* Cast & Reviews */}
        <motion.section
          className="relative z-10 -mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            <Tabs defaultValue="cast" className="space-y-8">
              <TabsList className="glass inline-flex h-12 p-1 rounded-xl border border-border/30">
                <TabsTrigger value="cast" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Cast</TabsTrigger>
                <TabsTrigger value="seasons" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Seasons</TabsTrigger>
                <TabsTrigger value="reviews" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="cast" className="space-y-8">
                <h2 className="text-2xl font-bold font-display">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {cast.map((person, i) => (
                    <motion.div 
                      key={person.id} 
                      className="group p-4 rounded-xl bg-card/50 hover:bg-card transition-all duration-300 text-center border border-transparent hover:border-primary/20"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted mb-3 ring-2 ring-border group-hover:ring-primary/60 transition-all duration-300 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
                        {person.profile_path ? (
                          <img
                            src={getImageUrl(person.profile_path, "w200")}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm line-clamp-1">{person.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {person.character}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="seasons" className="space-y-6">
                <h2 className="text-2xl font-bold font-display">All Seasons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validSeasons.map((season, i) => (
                    <motion.button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl text-left transition-all",
                        selectedSeason === season.season_number
                          ? "bg-primary/10 border-2 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                          : "bg-card/50 hover:bg-card border-2 border-transparent hover:border-primary/20"
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {season.poster_path ? (
                          <img
                            src={getImageUrl(season.poster_path, "w200")}
                            alt={season.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            S{season.season_number}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1">{season.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {season.episode_count} Episodes
                        </p>
                        {season.air_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {season.air_date.split("-")[0]}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        selectedSeason === season.season_number ? "text-primary" : "text-muted-foreground"
                      )} />
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-8">
                <TMDBReviews contentId={tvId} contentType="tv" />
                <div className="border-t border-border/30 pt-8">
                  <ReviewSection
                    contentId={tvId}
                    contentType="tv"
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.section>

        {/* Comments */}
        <motion.section
          className="container mx-auto px-4 md:px-8 lg:px-12 py-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <CommentsSection contentId={tvId} contentType="tv" />
        </motion.section>

        {/* Similar Shows */}
        {similarData?.results && similarData.results.length > 0 && (
          <section className="py-12">
            <MovieCarousel title="More Like This" movies={similarData.results} />
          </section>
        )}

        <Footer />

        {/* Discord ID Dialog */}
        <Dialog open={discordDialogOpen} onOpenChange={setDiscordDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#5865F2]" />
                Link Discord for Notifications
              </DialogTitle>
              <DialogDescription>
                Enter your Discord User ID to receive DM alerts when new seasons of this show release.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                value={discordInput}
                onChange={(e) => setDiscordInput(e.target.value)}
                placeholder="Your Discord User ID (e.g. 123456789012345678)"
                className="font-mono text-sm"
                maxLength={20}
              />
              <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/30 rounded-lg p-2.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Discord → Settings → Advanced → Enable Developer Mode → Right-click your name → Copy User ID</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveDiscordAndNotify}
                  disabled={savingDiscord || !discordInput.trim()}
                  className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  {savingDiscord ? "Saving..." : "Save & Notify Me"}
                </Button>
                <Button variant="ghost" onClick={() => { setDiscordDialogOpen(false); doAddFavoriteTv(); }} className="text-muted-foreground">
                  Skip
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default TVDetail;
