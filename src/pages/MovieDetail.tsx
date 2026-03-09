import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  Clock,
  Calendar,
  ChevronLeft,
  Film,
  X,
  AlertTriangle,
  Plus,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Info,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCarousel } from "@/components/MovieCarousel";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ReviewSection } from "@/components/ReviewSection";
import { TMDBReviews } from "@/components/TMDBReviews";
import { WatchlistButton } from "@/components/WatchlistButton";
import { VideoPlayerRevamped } from "@/components/VideoPlayerRevamped";
import { CommentsSection } from "@/components/CommentsSection";
import { AgeVerificationDialog } from "@/components/AgeVerificationDialog";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchMovieDetails,
  fetchSimilarMovies,
  fetchMovieVideos,
  getImageUrl,
  isAdultRated,
} from "@/lib/tmdb";
import { getMovieProgress } from "@/lib/watchHistory";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: "easeOut" as const },
  }),
};

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => fetchMovieDetails(movieId),
    enabled: !!movieId,
  });

  const { data: similarData } = useQuery({
    queryKey: ["similar", movieId],
    queryFn: () => fetchSimilarMovies(movieId),
    enabled: !!movieId,
  });

  const { data: videosData } = useQuery({
    queryKey: ["movieVideos", movieId],
    queryFn: () => fetchMovieVideos(movieId),
    enabled: !!movieId,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreview(true), 2000);
    return () => clearTimeout(timer);
  }, [movieId]);

  const isAdult = movie ? isAdultRated(movie) : false;

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

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || videosData?.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const cast = movie.credits?.cast.slice(0, 12) || [];
  const writers = movie.credits?.crew.filter((c) => c.job === "Writer" || c.job === "Screenplay").slice(0, 3) || [];
  const progress = getMovieProgress(movieId);
  const progressPercent = progress?.progress || 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <AgeVerificationDialog
          open={showAgeVerification}
          onConfirm={handleAgeConfirm}
          onCancel={() => setShowAgeVerification(false)}
          title={movie.title}
        />

        {isPlaying && (
          <VideoPlayerRevamped
            contentId={movie.id}
            contentType="movie"
            title={movie.title}
            onClose={() => setIsPlaying(false)}
          />
        )}

        {showTrailer && trailer && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
              <h2 className="text-lg font-semibold">{movie.title} - Trailer</h2>
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
          {/* Full Background with Video Preview */}
          <div className="absolute inset-0">
            {showPreview && trailer ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${previewMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&showinfo=0`}
                  className="w-full h-full object-cover scale-125"
                  allow="autoplay"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            ) : (
              <motion.img
                src={getImageUrl(movie.backdrop_path, "original")}
                alt={movie.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: "easeOut" }}
              />
            )}
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
            {/* Film grain texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 md:px-8 lg:px-12 pt-32 pb-16 min-h-screen flex flex-col justify-end">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/"
                className="absolute top-24 left-4 md:left-8 lg:left-12 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors glass px-4 py-2 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </motion.div>

            {/* Volume Control for Preview */}
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
                {isAdult && (
                  <Badge variant="destructive" className="gap-1 text-sm px-3 py-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    18+
                  </Badge>
                )}
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                  <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-border/50">
                  {movie.release_date?.split("-")[0]}
                </Badge>
                {movie.runtime && (
                  <Badge variant="outline" className="px-3 py-1 border-border/50">
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight font-display"
                style={{ textShadow: '0 4px 30px hsl(var(--primary) / 0.15)' }}
                variants={fadeUp} initial="hidden" animate="visible" custom={1}
              >
                {movie.title}
              </motion.h1>

              {/* Tagline */}
              {movie.tagline && (
                <motion.p
                  className="text-xl md:text-2xl text-primary/70 italic font-light font-display"
                  variants={fadeUp} initial="hidden" animate="visible" custom={2}
                >
                  "{movie.tagline}"
                </motion.p>
              )}

              {/* Genres */}
              <motion.div className="flex flex-wrap gap-2" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                {movie.genres.map((genre) => (
                  <Link key={genre.id} to={`/genre/${genre.id}`}>
                    <Badge 
                      variant="secondary" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-4 py-1.5 text-sm hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    >
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </motion.div>

              {/* Overview */}
              <motion.p
                className="text-base md:text-lg text-foreground/80 leading-relaxed line-clamp-3"
                variants={fadeUp} initial="hidden" animate="visible" custom={4}
              >
                {movie.overview}
              </motion.p>

              {/* Progress Bar */}
              {progressPercent > 0 && (
                <motion.div className="max-w-md" variants={fadeUp} initial="hidden" animate="visible" custom={4.5}>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Continue where you left off</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div className="flex flex-wrap items-center gap-4 pt-4" variants={fadeUp} initial="hidden" animate="visible" custom={5}>
                <Button 
                  size="lg" 
                  onClick={handlePlay}
                  className="h-14 px-8 text-lg font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-3 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-shadow duration-300"
                >
                  <Play className="h-6 w-6 fill-current" />
                  {progressPercent > 0 ? "Continue" : "Play"}
                </Button>

                {trailer && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setShowTrailer(true)}
                    className="h-14 px-8 text-lg font-semibold rounded-lg glass gap-3 border-border/50 hover:border-primary/50 transition-colors duration-300"
                  >
                    <Film className="h-5 w-5" />
                    Trailer
                  </Button>
                )}

                {isAuthenticated && (
                  <WatchlistButton
                    contentId={movieId}
                    contentType="movie"
                    size="lg"
                    variant="outline"
                    className="h-14 w-14 rounded-lg glass border-border/50 hover:border-primary/50"
                  />
                )}

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-14 rounded-lg glass border-border/50 hover:border-primary/50"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Credits */}
              <motion.div className="flex flex-wrap gap-x-8 gap-y-2 pt-4 text-sm" variants={fadeUp} initial="hidden" animate="visible" custom={6}>
                {director && (
                  <div>
                    <span className="text-muted-foreground">Director: </span>
                    <span className="font-semibold text-primary/90">{director.name}</span>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Writers: </span>
                    <span className="font-semibold text-primary/90">{writers.map(w => w.name).join(", ")}</span>
                  </div>
                )}
              </motion.div>

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

        {/* Details Section */}
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
                <TabsTrigger value="cast" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Cast & Crew</TabsTrigger>
                <TabsTrigger value="details" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Details</TabsTrigger>
                <TabsTrigger value="reviews" className="px-6 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Reviews</TabsTrigger>
              </TabsList>

              {/* Cast Tab */}
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

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-card/50 border border-border/30 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 font-display">
                      <Info className="h-5 w-5 text-primary" />
                      Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{movie.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Release Date</span>
                        <span className="font-medium">{movie.release_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runtime</span>
                        <span className="font-medium">{movie.runtime ? formatRuntime(movie.runtime) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language</span>
                        <span className="font-medium uppercase">{movie.original_language}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-card/50 border border-border/30 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 font-display">
                      <Star className="h-5 w-5 text-primary" />
                      Ratings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-black text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}>
                          {movie.vote_average.toFixed(1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.round(movie.vote_average / 2)
                                    ? "text-primary fill-primary"
                                    : "text-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {movie.vote_count.toLocaleString()} votes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-card/50 border border-border/30 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 font-display">
                      <Heart className="h-5 w-5 text-primary" />
                      Popularity
                    </h3>
                    <div className="space-y-3">
                      <div className="text-4xl font-black text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}>
                        #{Math.round(movie.popularity)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Popularity score based on views, votes, and searches
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-8">
                <TMDBReviews contentId={movieId} contentType="movie" />
                <div className="border-t border-border/30 pt-8">
                  <ReviewSection
                    contentId={movieId}
                    contentType="movie"
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
          <CommentsSection contentId={movieId} contentType="movie" />
        </motion.section>

        {/* Similar Movies */}
        {similarData?.results && similarData.results.length > 0 && (
          <section className="py-12">
            <MovieCarousel title="More Like This" movies={similarData.results} />
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
};

export default MovieDetail;
