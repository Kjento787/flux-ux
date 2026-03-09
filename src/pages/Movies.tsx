import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";
import { SearchFilters, FilterState } from "@/components/SearchFilters";
import { MovieCardSkeleton } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { discoverMovies, fetchGenres, searchMovies, getImageUrl, fetchTrendingAll } from "@/lib/tmdb";
import { Play, Star, ChevronLeft, ChevronRight, Film, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

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

  const { data: trendingData } = useQuery({
    queryKey: ["trendingMovies"],
    queryFn: () => fetchTrendingAll(),
  });

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["discover", filters, page, searchQuery],
    queryFn: () => {
      if (searchQuery) {
        return searchMovies(searchQuery, page);
      }
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

  const featuredMovie = (trendingData as any)?.results?.find(
    (m: any) => m.media_type === "movie" && m.backdrop_path
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Cinematic Hero */}
        {featuredMovie && !searchQuery && page === 1 && (
          <section className="relative h-[65vh] min-h-[520px] overflow-hidden">
            {/* Ken Burns backdrop */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.08] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
              <img
                src={getImageUrl(featuredMovie.backdrop_path, "original")}
                alt={featuredMovie.title || featuredMovie.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }} />

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

            {/* Content */}
            <div className="relative container mx-auto px-4 md:px-8 lg:px-12 h-full flex items-end pb-20">
              <div className="max-w-2xl space-y-5">
                <motion.div
                  className="flex items-center gap-3"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 px-3 py-1">
                    <TrendingUp className="h-3 w-3" />
                    Trending Now
                  </Badge>
                  {featuredMovie.vote_average && (
                    <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {featuredMovie.vote_average.toFixed(1)}
                    </Badge>
                  )}
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black font-display"
                  style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.3)" }}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  {featuredMovie.title || featuredMovie.name}
                </motion.h1>

                <motion.p
                  className="text-lg text-muted-foreground line-clamp-2 max-w-xl"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  {featuredMovie.overview}
                </motion.p>

                <motion.div
                  className="flex gap-4 pt-2"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                >
                  <Link to={`/movie/${featuredMovie.id}`}>
                    <Button size="lg" className="rounded-xl gap-2 h-12 px-8 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                      <Play className="h-5 w-5 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link to={`/movie/${featuredMovie.id}`}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl gap-2 h-12 px-8 border-primary/30 bg-background/30 backdrop-blur-md hover:bg-primary/10"
                    >
                      <Film className="h-5 w-5" />
                      Details
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        <main
          className={cn(
            "container mx-auto px-4 md:px-8 lg:px-12 pb-16",
            featuredMovie && !searchQuery && page === 1
              ? "-mt-10 relative z-10"
              : "pt-24"
          )}
        >
          {/* Header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold font-display">
                {searchQuery ? `Results for "${searchQuery}"` : "Explore Movies"}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {moviesData?.total_results
                ? `${moviesData.total_results.toLocaleString()} movies found`
                : "Discover thousands of films curated for you"}
            </p>
          </motion.div>

          {/* Search and Filters */}
          <SearchFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            genres={genresData?.genres || []}
            className="mb-10"
          />

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.03 },
                  },
                }}
              >
                {moviesData?.results.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
                      },
                    }}
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {moviesData && moviesData.total_pages > 1 && (
                <motion.div
                  className="flex items-center justify-center gap-3 mt-14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl gap-2 border-primary/20 hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {Array.from(
                      { length: Math.min(5, moviesData.total_pages) },
                      (_, i) => {
                        let pageNum: number;
                        if (moviesData.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= moviesData.total_pages - 2) {
                          pageNum = moviesData.total_pages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                              page === pageNum
                                ? "bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                                : "hover:bg-primary/10"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.min(moviesData.total_pages, 500)}
                    className="rounded-xl gap-2 border-primary/20 hover:bg-primary/10"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
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
