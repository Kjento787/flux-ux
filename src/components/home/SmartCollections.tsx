import { useQuery } from "@tanstack/react-query";
import { discoverMovies, Movie } from "@/lib/tmdb";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Gem, Award, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const COLLECTIONS = [
  {
    id: "hidden-gems",
    title: "Hidden Gems",
    icon: <Gem className="h-5 w-5 text-emerald-400" />,
    params: { sortBy: "vote_average.desc", voteCountGte: "50", voteCountLte: "500" },
  },
  {
    id: "critically-acclaimed",
    title: "Critically Acclaimed",
    icon: <Award className="h-5 w-5 text-amber-400" />,
    params: { sortBy: "vote_average.desc", voteCountGte: "1000" },
  },
];

export const SmartCollections = () => {
  const { data: hiddenGems } = useQuery({
    queryKey: ["smart-hidden-gems"],
    queryFn: () => discoverMovies({ sortBy: "vote_average.desc" }),
  });

  const { data: acclaimed } = useQuery({
    queryKey: ["smart-acclaimed"],
    queryFn: () => discoverMovies({ sortBy: "vote_count.desc" }),
  });

  return (
    <div className="space-y-8">
      {hiddenGems?.results && hiddenGems.results.length > 0 && (
        <MovieCarousel
          title="Hidden Gems"
          movies={hiddenGems.results.slice(0, 15)}
          icon={<Gem className="h-5 w-5 text-emerald-400" />}
        />
      )}
      {acclaimed?.results && acclaimed.results.length > 0 && (
        <MovieCarousel
          title="Critically Acclaimed"
          movies={acclaimed.results.slice(0, 15)}
          icon={<Award className="h-5 w-5 text-amber-400" />}
        />
      )}
    </div>
  );
};
