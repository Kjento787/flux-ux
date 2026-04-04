import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchNowPlayingMovies,
  fetchTrendingAll,
  fetchTrendingTV,
  discoverMovies,
  discoverTV,
} from "@/lib/tmdb";
import { getContinueWatching, WatchProgress, removeWatchProgress } from "@/lib/watchHistory";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { MovieCarousel } from "@/components/MovieCarousel";
import { PageTransition } from "@/components/PageTransition";
import { Movie } from "@/lib/tmdb";

const Index = () => {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const { getHistory } = useWatchHistory();

  useEffect(() => {
    const progressItems = getContinueWatching();
    const historyItems = getHistory();
    const progressIds = new Set(progressItems.map((p) => p.movieId));
    const historyAsMovies: WatchProgress[] = historyItems
      .filter((h) => !progressIds.has(h.contentId))
      .slice(0, 10)
      .map((h) => ({
        movieId: h.contentId,
        title: h.title,
        posterPath: h.posterPath,
        backdropPath: null,
        progress: 0,
        currentTime: 0,
        duration: 0,
        lastWatched: h.lastWatched,
      }));
    setContinueWatching([...progressItems, ...historyAsMovies].slice(0, 15));
  }, [getHistory]);

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetchTrendingMovies("week"),
  });
  const { data: trendingAllData } = useQuery({
    queryKey: ["trending-all"],
    queryFn: () => fetchTrendingAll("day"),
  });
  const { data: trendingTVData } = useQuery({
    queryKey: ["trending-tv"],
    queryFn: () => fetchTrendingTV("week"),
  });
  const { data: popularData } = useQuery({
    queryKey: ["popular"],
    queryFn: () => fetchPopularMovies(),
  });
  const { data: topRatedData } = useQuery({
    queryKey: ["topRated"],
    queryFn: () => fetchTopRatedMovies(),
  });
  const { data: upcomingData } = useQuery({
    queryKey: ["upcoming"],
    queryFn: () => fetchUpcomingMovies(),
  });
  const { data: nowPlayingData } = useQuery({
    queryKey: ["nowPlaying"],
    queryFn: () => fetchNowPlayingMovies(),
  });
  const { data: actionData } = useQuery({
    queryKey: ["discover-action"],
    queryFn: () => discoverMovies({ withGenres: "28", sortBy: "popularity.desc" }),
  });
  const { data: comedyData } = useQuery({
    queryKey: ["discover-comedy"],
    queryFn: () => discoverMovies({ withGenres: "35", sortBy: "popularity.desc" }),
  });
  const { data: horrorData } = useQuery({
    queryKey: ["discover-horror"],
    queryFn: () => discoverMovies({ withGenres: "27", sortBy: "popularity.desc" }),
  });
  const { data: animeData } = useQuery({
    queryKey: ["discover-anime"],
    queryFn: () => discoverTV({ withGenres: "16", sortBy: "popularity.desc" }),
  });

  const continueWatchingMovies: Movie[] = continueWatching
    .filter((item) => item.posterPath)
    .map((item) => ({
      id: item.movieId,
      title: item.title,
      poster_path: item.posterPath,
      backdrop_path: item.backdropPath,
      overview: "",
      release_date: "",
      vote_average: 0,
      vote_count: 0,
      genre_ids: [],
      popularity: 0,
      adult: false,
      original_language: "",
    }));

  const progressData = continueWatching.reduce(
    (acc, item) => ({ ...acc, [item.movieId]: item.progress }),
    {} as Record<number, number>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {trendingData?.results && <HeroBanner movies={trendingData.results} />}

        <main className="py-6 space-y-8">
          {/* Continue Watching */}
          {continueWatchingMovies.length > 0 && (
            <MovieCarousel
              title="Continue Watching"
              movies={continueWatchingMovies}
              showProgress
              progressData={progressData}
              onRemove={(movieId) => {
                removeWatchProgress(movieId);
                setContinueWatching((prev) => prev.filter((p) => p.movieId !== movieId));
              }}
            />
          )}

          {/* Latest Update */}
          {nowPlayingData?.results && (
            <MovieCarousel title="Latest Update" movies={nowPlayingData.results} linkTo="/movies" />
          )}

          {/* Trending */}
          {trendingAllData?.results && (
            <MovieCarousel title="Trending Now" movies={trendingAllData.results} linkTo="/trending" />
          )}

          {/* Popular */}
          {popularData?.results && (
            <MovieCarousel title="Popular" movies={popularData.results} linkTo="/movies" />
          )}

          {/* Trending TV */}
          {trendingTVData?.results && (
            <MovieCarousel title="TV Shows" movies={trendingTVData.results} linkTo="/trending" />
          )}

          {/* Top Rated */}
          {topRatedData?.results && (
            <MovieCarousel title="Top Rated" movies={topRatedData.results} linkTo="/movies" />
          )}

          {/* Action */}
          {actionData?.results && (
            <MovieCarousel title="Action" movies={actionData.results} linkTo="/genre/28" />
          )}

          {/* Comedy */}
          {comedyData?.results && (
            <MovieCarousel title="Comedy" movies={comedyData.results} linkTo="/genre/35" />
          )}

          {/* Horror */}
          {horrorData?.results && (
            <MovieCarousel title="Horror" movies={horrorData.results} linkTo="/genre/27" />
          )}

          {/* Anime */}
          {animeData?.results && (
            <MovieCarousel title="Anime" movies={animeData.results} linkTo="/genres" />
          )}

          {/* Coming Soon */}
          {upcomingData?.results && (
            <MovieCarousel title="Coming Soon" movies={upcomingData.results} linkTo="/coming-soon" />
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
