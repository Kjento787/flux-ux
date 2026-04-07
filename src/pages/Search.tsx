import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { SearchFilters, FilterState } from "@/components/SearchFilters";
import { MovieCardSkeleton } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchMulti, fetchGenres, discoverMovies } from "@/lib/tmdb";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Film, Tv, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "popularity.desc",
    year: "",
    genre: "",
    rating: "",
  });
  const [page, setPage] = useState(1);
  const [contentFilter, setContentFilter] = useState<"all" | "movie" | "tv">("all");

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  });

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["search", searchQuery, filters, page],
    queryFn: () => {
      if (searchQuery) return searchMulti(searchQuery, page);
      return discoverMovies({
        page,
        sortBy: filters.sortBy,
        year: filters.year ? parseInt(filters.year) : undefined,
        withGenres: filters.genre,
        voteAverageGte: filters.rating ? parseInt(filters.rating) : undefined,
      });
    },
    enabled: !!searchQuery || Object.values(filters).some((v) => v),
  });

  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    if (query) setSearchParams({ q: query });
    else setSearchParams({});
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const filteredResults = moviesData?.results.filter(item => {
    if (contentFilter === "all") return true;
    return item.media_type === contentFilter;
  }) || [];

  const movieCount = moviesData?.results.filter(r => r.media_type === "movie").length || 0;
  const tvCount = moviesData?.results.filter(r => r.media_type === "tv").length || 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {searchQuery ? (
                <>Results for <span className="text-primary">"{searchQuery}"</span></>
              ) : (
                "Search & Discover"
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Find your next favorite movie or TV show
            </p>
          </div>

          <SearchFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            genres={genresData?.genres || []}
            className="mb-6"
          />

          {/* Content Type Filter Pills */}
          {searchQuery && moviesData?.results && moviesData.results.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {([
                { key: "all" as const, label: "All", count: moviesData.results.length },
                { key: "movie" as const, label: "Movies", count: movieCount },
                { key: "tv" as const, label: "TV Shows", count: tvCount },
              ]).map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={contentFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContentFilter(key)}
                  className="text-xs gap-1.5"
                >
                  {label}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{count}</Badge>
                </Button>
              ))}
            </div>
          )}

          {!searchQuery && !Object.values(filters).some((v) => v) ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Start Searching</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Enter a search term or use the filters above
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Found <span className="text-foreground font-medium">{moviesData?.total_results.toLocaleString()}</span> results
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredResults.map((movie) => (
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
                    {Array.from({ length: Math.min(5, moviesData.total_pages) }, (_, i) => {
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
                    })}
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

export default Search;
