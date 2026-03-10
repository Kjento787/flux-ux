import { useQuery } from "@tanstack/react-query";
import { fetchUpcomingMovies, getImageUrl, Movie } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { MovieCard } from "@/components/MovieCard";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

const ComingSoon = () => {
  const { data: upcomingData, isLoading } = useQuery({
    queryKey: ["upcoming-movies"],
    queryFn: () => fetchUpcomingMovies(1),
  });

  const { data: upcomingPage2 } = useQuery({
    queryKey: ["upcoming-movies-2"],
    queryFn: () => fetchUpcomingMovies(2),
  });

  const { favorites, toggleFavorite } = useFavorites();

  const allUpcoming = [
    ...(upcomingData?.results || []),
    ...(upcomingPage2?.results || []),
  ].filter((m) => {
    const releaseDate = new Date(m.release_date);
    return releaseDate > new Date();
  });

  // Featured upcoming movie
  const featured = allUpcoming.find((m) => m.backdrop_path && m.vote_count > 0);

  const handleNotify = (movie: Movie) => {
    toggleFavorite({
      tmdb_id: movie.id,
      title: movie.title || movie.name || "",
      content_type: "movie",
      poster_path: movie.poster_path,
      release_date: movie.release_date,
    });
    const isFav = favorites.some((f) => f.tmdb_id === movie.id);
    toast.success(isFav ? "Removed from notifications" : "You'll be notified when it releases!");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        {featured && (
          <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
            <img
              src={getImageUrl(featured.backdrop_path, "original")}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 container mx-auto px-4 pb-12">
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1 mb-3">
                <Calendar className="h-3 w-3" />
                {new Date(featured.release_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-2">{featured.title}</h2>
              <p className="text-muted-foreground max-w-xl line-clamp-2 mb-4">{featured.overview}</p>
              <Button
                onClick={() => handleNotify(featured)}
                className="gap-2 rounded-xl"
                variant={favorites.some((f) => f.tmdb_id === featured.id) ? "secondary" : "default"}
              >
                <Bell className="h-4 w-4" />
                {favorites.some((f) => f.tmdb_id === featured.id) ? "Notifications On" : "Notify Me"}
              </Button>
            </div>
          </section>
        )}

        <main className="container mx-auto px-4 pt-8 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Coming Soon</h1>
              <p className="text-muted-foreground">Upcoming releases you won't want to miss</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allUpcoming.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative group"
                >
                  <MovieCard movie={movie} />
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full backdrop-blur-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotify(movie);
                      }}
                    >
                      <Bell className={cn("h-4 w-4", favorites.some((f) => f.tmdb_id === movie.id) && "fill-primary text-primary")} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ComingSoon;
