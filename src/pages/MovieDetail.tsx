import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Star,
  ChevronLeft,
  Film,
  X,
  AlertTriangle,
  Share2,
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
import {
  fetchMovieDetails,
  fetchSimilarMovies,
  fetchMovieVideos,
  getImageUrl,
  isAdultRated,
} from "@/lib/tmdb";
import { getMovieProgress } from "@/lib/watchHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);

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

  const isAdult = movie ? isAdultRated(movie) : false;

  const handlePlay = () => {
    if (isAdult) setShowAgeVerification(true);
    else setIsPlaying(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: movie?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  const formatRuntime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
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
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const trailer =
    movie.videos?.results.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videosData?.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const cast = movie.credits?.cast.slice(0, 8) || [];
  const progress = getMovieProgress(movieId);
  const progressPercent = progress?.progress || 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <AgeVerificationDialog
          open={showAgeVerification}
          onConfirm={() => { setShowAgeVerification(false); setIsPlaying(true); }}
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
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="text-base font-semibold">{movie.title} — Trailer</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTrailer(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Top: poster + info */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] gap-6 md:gap-8">
            <div className="rounded-lg overflow-hidden bg-card/50 border border-border/30 max-w-[260px] mx-auto md:mx-0">
              {movie.poster_path ? (
                <img
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center text-muted-foreground text-sm">
                  No Poster
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {isAdult && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    18+
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
                <Badge variant="outline">{movie.release_date?.split("-")[0]}</Badge>
                {movie.runtime > 0 && (
                  <Badge variant="outline">{formatRuntime(movie.runtime)}</Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-sm text-muted-foreground italic">"{movie.tagline}"</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <Link key={g.id} to={`/genre/${g.id}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                {movie.overview}
              </p>

              {progressPercent > 0 && (
                <div className="max-w-md">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Continue watching</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button onClick={handlePlay} size="lg" className="gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  {progressPercent > 0 ? "Continue" : "Play"}
                </Button>
                {trailer && (
                  <Button variant="outline" size="lg" onClick={() => setShowTrailer(true)} className="gap-2 border-border/30">
                    <Film className="h-4 w-4" />
                    Trailer
                  </Button>
                )}
                {isAuthenticated && (
                  <WatchlistButton
                    contentId={movieId}
                    contentType="movie"
                    size="lg"
                    variant="outline"
                    className="border-border/30"
                  />
                )}
                <Button variant="outline" size="lg" onClick={handleShare} className="border-border/30">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {director && (
                <div className="text-sm text-muted-foreground pt-2">
                  Director: <span className="text-foreground">{director.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold mb-4">Cast</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {cast.map((p) => (
                  <div key={p.id} className="text-center">
                    <div className="aspect-square rounded-full overflow-hidden bg-card/50 border border-border/30 mb-2">
                      {p.profile_path ? (
                        <img
                          src={getImageUrl(p.profile_path, "w200")}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">—</div>
                      )}
                    </div>
                    <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{p.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-10 space-y-6">
            <h2 className="text-lg font-semibold">Reviews</h2>
            <TMDBReviews contentId={movieId} contentType="movie" />
            <div className="border-t border-border/30 pt-6">
              <ReviewSection
                contentId={movieId}
                contentType="movie"
                isAuthenticated={isAuthenticated}
              />
            </div>
          </section>

          {/* Comments */}
          <section className="mt-10">
            <CommentsSection contentId={movieId} contentType="movie" />
          </section>

          {/* Similar */}
          {similarData?.results && similarData.results.length > 0 && (
            <section className="mt-10 -mx-4 md:-mx-8 lg:-mx-12">
              <MovieCarousel title="More Like This" movies={similarData.results} />
            </section>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default MovieDetail;
