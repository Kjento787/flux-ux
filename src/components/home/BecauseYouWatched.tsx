import { useQuery } from "@tanstack/react-query";
import { fetchMovieDetails, fetchTVDetails, Movie } from "@/lib/tmdb";
import { MovieCarousel } from "@/components/MovieCarousel";
import { getContinueWatching } from "@/lib/watchHistory";
import { supabase } from "@/integrations/supabase/client";
import { History } from "lucide-react";

const fetchSimilar = async (contentId: number, type: "movie" | "tv"): Promise<Movie[]> => {
  const { data } = await supabase.functions.invoke("tmdb-proxy", {
    body: { endpoint: `/${type}/${contentId}/similar`, params: {} },
  });
  return data?.results?.slice(0, 12) || [];
};

export const BecauseYouWatched = () => {
  const continueWatching = getContinueWatching();
  const recentItem = continueWatching[0];

  const { data: similarMovies } = useQuery({
    queryKey: ["because-you-watched", recentItem?.movieId],
    queryFn: () => fetchSimilar(recentItem!.movieId, "movie"),
    enabled: !!recentItem,
  });

  if (!recentItem || !similarMovies?.length) return null;

  return (
    <MovieCarousel
      title={`Because You Watched "${recentItem.title}"`}
      movies={similarMovies}
      icon={<History className="h-5 w-5 text-primary" />}
    />
  );
};
