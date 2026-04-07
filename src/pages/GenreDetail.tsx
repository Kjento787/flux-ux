import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMoviesByGenre, fetchGenres } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GenreDetail = () => {
  const { id } = useParams();
  const genreId = parseInt(id || "0");
  const [page, setPage] = useState(1);

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  });

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["genre-movies", genreId, page],
    queryFn: () => fetchMoviesByGenre(genreId, page),
    enabled: !!genreId,
  });

  const genreName = genresData?.genres?.find((g) => g.id === genreId)?.name || "Genre";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{genreName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {moviesData?.total_results
                ? `${moviesData.total_results.toLocaleString()} titles`
                : "Discover films in this genre"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {moviesData?.results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {moviesData && moviesData.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {Math.min(moviesData.total_pages, 500)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.min(moviesData.total_pages, 500)}
                    className="gap-1.5"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default GenreDetail;
