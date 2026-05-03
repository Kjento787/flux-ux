import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCarousel } from "@/components/MovieCarousel";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageTransition } from "@/components/PageTransition";
import { fetchKDramas, fetchKMovies } from "@/lib/tmdb";

const KDrama = () => {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["kdrama", "trending"],
    queryFn: () => fetchKDramas("popularity.desc"),
  });
  const { data: topRated } = useQuery({
    queryKey: ["kdrama", "top"],
    queryFn: () => fetchKDramas("vote_average.desc"),
  });
  const { data: latest } = useQuery({
    queryKey: ["kdrama", "latest"],
    queryFn: () => fetchKDramas("first_air_date.desc"),
  });
  const { data: romance } = useQuery({
    queryKey: ["kdrama", "romance"],
    queryFn: () => fetchKDramas("popularity.desc", 1, "10749"),
  });
  const { data: thriller } = useQuery({
    queryKey: ["kdrama", "thriller"],
    queryFn: () => fetchKDramas("popularity.desc", 1, "9648,80"),
  });
  const { data: comedy } = useQuery({
    queryKey: ["kdrama", "comedy"],
    queryFn: () => fetchKDramas("popularity.desc", 1, "35"),
  });
  const { data: kmovies } = useQuery({
    queryKey: ["kmovies", "popular"],
    queryFn: () => fetchKMovies("popularity.desc"),
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16 space-y-8">
          <header className="mb-2">
            <h1 className="text-2xl font-bold">K-Drama</h1>
            <p className="text-sm text-muted-foreground mt-1">
              The best of Korean dramas and films, curated for you.
            </p>
          </header>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {trending?.results && (
            <MovieCarousel title="Trending K-Dramas" movies={trending.results} />
          )}
          {latest?.results && (
            <MovieCarousel title="Latest Releases" movies={latest.results} />
          )}
          {romance?.results && (
            <MovieCarousel title="Romance" movies={romance.results} />
          )}
          {thriller?.results && (
            <MovieCarousel title="Thriller & Mystery" movies={thriller.results} />
          )}
          {comedy?.results && (
            <MovieCarousel title="Comedy" movies={comedy.results} />
          )}
          {topRated?.results && (
            <MovieCarousel title="Top Rated" movies={topRated.results} />
          )}
          {kmovies?.results && (
            <MovieCarousel title="Korean Movies" movies={kmovies.results} />
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default KDrama;
