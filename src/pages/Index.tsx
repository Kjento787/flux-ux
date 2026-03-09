import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { LoadingSpinner, HeroBannerSkeleton } from "@/components/LoadingSpinner";
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
  getImageUrl,
} from "@/lib/tmdb";
import { getContinueWatching, WatchProgress, removeWatchProgress } from "@/lib/watchHistory";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import {
  History, Flame, Star, Tv, Swords, Laugh, Ghost, Rocket, Heart, Sparkles,
  Play, ChevronRight, ArrowRight, Clock, TrendingUp, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { Top10Row } from "@/components/home/Top10Row";
import { HubSection } from "@/components/home/HubSection";
import { SpotlightBanner } from "@/components/home/SpotlightBanner";
import { MoodBrowser } from "@/components/home/MoodBrowser";
import { NewReleasesRow } from "@/components/home/NewReleasesRow";
import { LeavingSoonRow } from "@/components/home/LeavingSoonRow";
import { PreviewCarousel } from "@/components/home/PreviewCarousel";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Recommendations } from "@/components/Recommendations";
import { ForYouSection } from "@/components/home/ForYouSection";
import { BecauseYouWatched } from "@/components/home/BecauseYouWatched";
import { SmartCollections } from "@/components/home/SmartCollections";
import { GlobalActivityFeed } from "@/components/social/GlobalActivityFeed";
import { PageTransition } from "@/components/PageTransition";
import { Movie } from "@/lib/tmdb";

const Index = () => {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const { getHistory } = useWatchHistory();

  useEffect(() => {
    const progressItems = getContinueWatching();
    const historyItems = getHistory();
    const progressIds = new Set(progressItems.map(p => p.movieId));
    const historyAsMovies: WatchProgress[] = historyItems
      .filter(h => !progressIds.has(h.contentId))
      .slice(0, 10)
      .map(h => ({
        movieId: h.contentId, title: h.title, posterPath: h.posterPath,
        backdropPath: null, progress: 0, currentTime: 0, duration: 0, lastWatched: h.lastWatched,
      }));
    setContinueWatching([...progressItems, ...historyAsMovies].slice(0, 15));
  }, [getHistory]);

  // Core data
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"], queryFn: () => fetchTrendingMovies("week"),
  });
  const { data: trendingAllData } = useQuery({
    queryKey: ["trending-all"], queryFn: () => fetchTrendingAll("day"),
  });
  const { data: trendingTVData } = useQuery({
    queryKey: ["trending-tv"], queryFn: () => fetchTrendingTV("week"),
  });
  const { data: popularData } = useQuery({
    queryKey: ["popular"], queryFn: () => fetchPopularMovies(),
  });
  const { data: topRatedData } = useQuery({
    queryKey: ["topRated"], queryFn: () => fetchTopRatedMovies(),
  });
  const { data: upcomingData } = useQuery({
    queryKey: ["upcoming"], queryFn: () => fetchUpcomingMovies(),
  });
  const { data: nowPlayingData } = useQuery({
    queryKey: ["nowPlaying"], queryFn: () => fetchNowPlayingMovies(),
  });
  const { data: actionData } = useQuery({
    queryKey: ["discover-action"], queryFn: () => discoverMovies({ withGenres: "28", sortBy: "popularity.desc" }),
  });
  const { data: comedyData } = useQuery({
    queryKey: ["discover-comedy"], queryFn: () => discoverMovies({ withGenres: "35", sortBy: "popularity.desc" }),
  });
  const { data: horrorData } = useQuery({
    queryKey: ["discover-horror"], queryFn: () => discoverMovies({ withGenres: "27", sortBy: "popularity.desc" }),
  });
  const { data: scifiData } = useQuery({
    queryKey: ["discover-scifi"], queryFn: () => discoverMovies({ withGenres: "878", sortBy: "popularity.desc" }),
  });
  const { data: romanceData } = useQuery({
    queryKey: ["discover-romance"], queryFn: () => discoverMovies({ withGenres: "10749", sortBy: "popularity.desc" }),
  });
  const { data: animeData } = useQuery({
    queryKey: ["discover-anime"], queryFn: () => discoverTV({ withGenres: "16", sortBy: "popularity.desc" }),
  });

  // Continue watching movies
  const continueWatchingMovies: Movie[] = continueWatching
    .filter((item) => item.posterPath)
    .map((item) => ({
      id: item.movieId, title: item.title, poster_path: item.posterPath,
      backdrop_path: item.backdropPath, overview: "", release_date: "",
      vote_average: 0, vote_count: 0, genre_ids: [], popularity: 0,
      adult: false, original_language: "",
    }));

  const progressData = continueWatching.reduce(
    (acc, item) => ({ ...acc, [item.movieId]: item.progress }),
    {} as Record<number, number>
  );

  if (trendingLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroBannerSkeleton />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const spotlightMovie = popularData?.results?.[5];
  const spotlightMovie2 = topRatedData?.results?.[3];

  // Featured picks — 3 hand-picked looking tiles for the editorial section
  const editorialPicks = nowPlayingData?.results?.slice(0, 3) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        {/* ===== HERO ===== */}
        {trendingData?.results && <HeroBanner movies={trendingData.results} />}

        {/* ===== MAIN CONTENT ===== */}
        <main className="relative z-10 -mt-24 md:-mt-32 lg:-mt-40 space-y-6 md:space-y-8">

          {/* Continue Watching */}
          {continueWatchingMovies.length > 0 && (
            <MovieCarousel
              title="Continue Watching"
              movies={continueWatchingMovies}
              showProgress progressData={progressData}
              icon={<History className="h-5 w-5 text-primary" />}
              onRemove={(movieId) => {
                removeWatchProgress(movieId);
                setContinueWatching(prev => prev.filter(p => p.movieId !== movieId));
              }}
            />
          )}

          {/* ===== EDITORIAL PICKS — Asymmetric Grid ===== */}
          {editorialPicks.length >= 3 && (
            <section className="px-4 md:px-8 lg:px-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl md:text-2xl font-bold">Editor's Picks</h2>
                  </div>
                  <Link to="/movies" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                  {/* Large featured card */}
                  <Link to={`/movie/${editorialPicks[0].id}`} className="md:col-span-7 group relative rounded-2xl overflow-hidden aspect-[16/9]">
                    <img
                      src={getImageUrl(editorialPicks[0].backdrop_path, "w780")}
                      alt={editorialPicks[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 md:p-8">
                      <Badge className="bg-primary/20 text-primary border-primary/30 mb-2 text-[10px] uppercase tracking-wider font-bold">
                        <TrendingUp className="h-3 w-3 mr-1" /> Now Playing
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-black font-display mb-1">{editorialPicks[0].title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-md hidden sm:block">{editorialPicks[0].overview}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Button size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground shadow-glow h-9 px-5 text-xs font-bold uppercase tracking-wider">
                          <Play className="h-3.5 w-3.5 fill-current" /> Watch
                        </Button>
                        <div className="flex items-center gap-1 text-primary text-sm">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold">{editorialPicks[0].vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Two stacked cards */}
                  <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
                    {editorialPicks.slice(1, 3).map((movie, i) => (
                      <Link key={movie.id} to={`/movie/${movie.id}`} className="group relative rounded-xl overflow-hidden aspect-video md:aspect-[2.2/1]">
                        <img
                          src={getImageUrl(movie.backdrop_path, "w780")}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-3 md:p-4">
                          <h3 className="font-bold text-sm md:text-base line-clamp-1">{movie.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-primary text-xs">
                              <Star className="h-3 w-3 fill-current" /> {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{movie.release_date?.split("-")[0]}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* AI-Powered For You */}
          <ForYouSection />

          {/* Because You Watched */}
          <BecauseYouWatched />

          {/* Smart Collections */}
          <SmartCollections />

          {/* Personalized Recommendations */}
          <Recommendations />

          {/* Friends Activity */}
          <GlobalActivityFeed />

          {/* Top 10 Trending */}
          {trendingAllData?.results && (
            <Top10Row title="in Your Country Today" movies={trendingAllData.results} />
          )}

          {/* ===== QUICK ACCESS BAR ===== */}
          <section className="px-4 md:px-8 lg:px-12">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
              {[
                { label: "Coming Soon", href: "/coming-soon", icon: Clock },
                { label: "Action", href: "/genre/28", icon: Swords },
                { label: "Comedy", href: "/genre/35", icon: Laugh },
                { label: "Horror", href: "/genre/27", icon: Ghost },
                { label: "Sci-Fi", href: "/genre/878", icon: Rocket },
                { label: "Romance", href: "/genre/10749", icon: Heart },
                { label: "All Genres", href: "/genres", icon: Sparkles },
              ].map((item) => (
                <Link key={item.label} to={item.href}>
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5 border-border/30 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 whitespace-nowrap text-xs h-8 px-4">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </section>

          {/* Mood Browser */}
          <MoodBrowser />

          {/* Just Added */}
          {nowPlayingData?.results && (
            <NewReleasesRow title="Just Added" movies={nowPlayingData.results} />
          )}

          {/* Spotlight Banner */}
          {spotlightMovie && (
            <SpotlightBanner movie={spotlightMovie} label="Spotlight" />
          )}

          {/* Popular */}
          {popularData?.results && (
            <PreviewCarousel
              title="Popular Right Now"
              movies={popularData.results}
              icon={<Flame className="h-5 w-5 text-primary" />}
            />
          )}

          {/* Action Hub */}
          {actionData?.results && (
            <HubSection title="Action Hub" icon={Swords} movies={actionData.results} genreId={28} accentColor="hsl(40, 65%, 55%)" />
          )}

          {/* Trending TV Shows */}
          {trendingTVData?.results && (
            <PreviewCarousel
              title="Trending TV Shows"
              movies={trendingTVData.results}
              icon={<Tv className="h-5 w-5 text-primary" />}
            />
          )}

          {/* Comedy Hub */}
          {comedyData?.results && (
            <HubSection title="Comedy Hub" icon={Laugh} movies={comedyData.results} genreId={35} accentColor="hsl(40, 65%, 55%)" />
          )}

          {/* Spotlight 2 */}
          {spotlightMovie2 && (
            <SpotlightBanner movie={spotlightMovie2} label="Editor's Pick" />
          )}

          {/* Critically Acclaimed */}
          {topRatedData?.results && (
            <PreviewCarousel
              title="Critically Acclaimed"
              movies={topRatedData.results}
              icon={<Star className="h-5 w-5 text-primary" />}
            />
          )}

          {/* Horror Hub */}
          {horrorData?.results && (
            <HubSection title="Horror Hub" icon={Ghost} movies={horrorData.results} genreId={27} accentColor="hsl(40, 50%, 40%)" />
          )}

          {/* Sci-Fi Hub */}
          {scifiData?.results && (
            <HubSection title="Sci-Fi Hub" icon={Rocket} movies={scifiData.results} genreId={878} accentColor="hsl(40, 65%, 55%)" />
          )}

          {/* Leaving Soon */}
          {topRatedData?.results && (
            <LeavingSoonRow title="Last Chance to Watch" movies={topRatedData.results.slice(10, 20)} />
          )}

          {/* Romance Hub */}
          {romanceData?.results && (
            <HubSection title="Romance Hub" icon={Heart} movies={romanceData.results} genreId={10749} accentColor="hsl(35, 70%, 50%)" />
          )}

          {/* Anime Hub */}
          {animeData?.results && (
            <HubSection title="Anime Hub" icon={Sparkles} movies={animeData.results} searchQuery="anime" accentColor="hsl(40, 65%, 55%)" />
          )}

          {/* Coming Soon */}
          {upcomingData?.results && (
            <MovieCarousel
              title="Coming Soon"
              movies={upcomingData.results}
              icon={<Sparkles className="h-5 w-5 text-primary" />}
            />
          )}

        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
