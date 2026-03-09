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
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

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

        {/* Cinematic Header */}
        <section className="relative pt-24 pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-primary/6 blur-[120px]" />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }} />

          <motion.div
            initial="hidden"
            animate="visible"
            className="relative container mx-auto px-4 md:px-8 lg:px-12"
          >
            <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
              Search & Discover
            </motion.p>
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-2 font-display"
            >
              {searchQuery ? (
                <>Results for <span className="text-primary">"{searchQuery}"</span></>
              ) : (
                <>Discover <span className="text-primary">Everything</span></>
              )}
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-muted-foreground mb-8">
              Find your next favorite movie or TV show
            </motion.p>

            <motion.div custom={3} variants={fadeUp}>
              <SearchFilters
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                genres={genresData?.genres || []}
                className="mb-6"
              />
            </motion.div>

            {/* Content Type Filter Pills */}
            {searchQuery && moviesData?.results && moviesData.results.length > 0 && (
              <motion.div custom={4} variants={fadeUp} className="flex flex-wrap gap-2 mb-4">
                {([
                  { key: "all" as const, icon: Sparkles, label: "All", count: moviesData.results.length },
                  { key: "movie" as const, icon: Film, label: "Movies", count: movieCount },
                  { key: "tv" as const, icon: Tv, label: "TV Shows", count: tvCount },
                ]).map(({ key, icon: Icon, label, count }) => (
                  <Button
                    key={key}
                    variant={contentFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContentFilter(key)}
                    className={cn(
                      "rounded-full gap-2 border-border/30 text-xs font-bold uppercase tracking-wider",
                      contentFilter === key && "shadow-glow"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    <Badge variant="secondary" className="ml-1 bg-secondary/80 text-xs">{count}</Badge>
                  </Button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </section>

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pb-16">
          {!searchQuery && !Object.values(filters).some((v) => v) ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-glow">
                <SearchIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 font-display">Start Searching</h2>
              <p className="text-muted-foreground max-w-md">
                Enter a search term or use the filters above to discover movies and TV shows
              </p>
            </motion.div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <SearchIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3 font-display">No Results Found</h2>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search terms or filters
              </p>
            </motion.div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-muted-foreground mb-6 text-sm">
                  Found <span className="text-foreground font-semibold">{moviesData?.total_results.toLocaleString()}</span> results
                </p>
              )}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerGrid}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              >
                {filteredResults.map((movie) => (
                  <motion.div key={movie.id} variants={gridItem}>
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Premium Pagination */}
              {moviesData && moviesData.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-14">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl gap-2 border-border/30 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1.5">
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
                          className={cn(
                            "w-10 h-10 rounded-xl text-sm font-bold",
                            page === pageNum && "bg-primary shadow-glow"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.min(moviesData.total_pages, 500)}
                    className="rounded-xl gap-2 border-border/30 bg-card/50 backdrop-blur-sm hover:bg-card/80"
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
