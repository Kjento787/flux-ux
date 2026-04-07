import { useQuery } from "@tanstack/react-query";
import { fetchUpcomingMovies, getImageUrl, Movie } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

const ComingSoon = () => {
  const { data: upcomingData, isLoading } = useQuery({
    queryKey: ["upcoming-movies"],
    queryFn: () => fetchUpcomingMovies(1),
  });

  const { data: upcomingPage2 } = useQuery({
    queryKey: ["upcoming-movies-2"],
    queryFn: () => fetchUpcomingMovies(2),
  });

  const { addFavorite, removeFavorite, isFavorited } = useFavorites();

  const allUpcoming = [
    ...(upcomingData?.results || []),
    ...(upcomingPage2?.results || []),
  ].filter((m) => {
    const releaseDate = new Date(m.release_date);
    return releaseDate > new Date();
  });

  const handleNotify = (movie: Movie) => {
    const isFav = isFavorited(movie.id, "movie");
    if (isFav) {
      removeFavorite.mutate({ tmdb_id: movie.id, content_type: "movie" });
    } else {
      addFavorite.mutate({
        tmdb_id: movie.id,
        title: movie.title || movie.name || "",
        content_type: "movie",
        poster_path: movie.poster_path || undefined,
        release_date: movie.release_date,
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Coming Soon</h1>
            <p className="text-sm text-muted-foreground mt-1">Upcoming releases you won't want to miss</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allUpcoming.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard movie={movie} />
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotify(movie);
                      }}
                    >
                      <Bell className={cn("h-3.5 w-3.5", isFavorited(movie.id, "movie") && "fill-primary text-primary")} />
                    </Button>
                  </div>
                  {movie.release_date && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="text-[10px] bg-card/80 backdrop-blur-sm text-foreground border-border/50 gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(movie.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Badge>
                    </div>
                  )}
                </div>
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
