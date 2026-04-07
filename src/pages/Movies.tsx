import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { SearchFilters, FilterState } from "@/components/SearchFilters";
import { MovieCardSkeleton } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { discoverMovies, fetchGenres, searchMovies, fetchTrendingAll } from "@/lib/tmdb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "popularity.desc",
    year: "",
    genre: "",
    rating: "",
  });
  const [page, setPage] = useState(1);

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  });

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["discover", filters, page, searchQuery],
    queryFn: () => {
      if (searchQuery) return searchMovies(searchQuery, page);
      return discoverMovies({
        page,
        sortBy: filters.sortBy,
        year: filters.year ? parseInt(filters.year) : undefined,
        withGenres: filters.genre,
        voteAverageGte: filters.rating ? parseInt(filters.rating) : undefined,
      });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    setSearchQuery("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : "Explore Movies"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {moviesData?.total_results
                ? `${moviesData.total_results.toLocaleString()} movies found`
                : "Discover thousands of films"}
            </p>
          </div>

          <SearchFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            genres={genresData?.genres || []}
            className="mb-8"
          />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
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
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, moviesData.total_pages) },
                      (_, i) => {
                        let pageNum: number;
                        if (moviesData.total_pages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= moviesData.total_pages - 2) pageNum = moviesData.total_pages - 4 + i;
                        else pageNum = page - 2 + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setPage(pageNum)}
                            className={cn("w-9 h-9 text-sm", page === pageNum && "bg-primary")}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.min(moviesData.total_pages, 500)}
                    className="gap-1.5"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
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

export default Movies;
