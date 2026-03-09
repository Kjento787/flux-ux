import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, Star, Info, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Movie, getImageUrl, fetchMovieVideos, fetchTVVideos } from "@/lib/tmdb";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface QuickPreviewCardProps {
  movie: Movie;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
}

export const QuickPreviewCard = ({ movie, className, style, index = 0 }: QuickPreviewCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isTV = movie.media_type === "tv";
  const contentType = isTV ? "tv" : "movie";
  const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const title = movie.title || movie.name || "Unknown";
  const year = (movie.release_date || movie.first_air_date)?.split("-")[0] || "";
  const inList = isInWatchlist(movie.id, contentType);
  const isPending = addToWatchlist.isPending || removeFromWatchlist.isPending;

  const { data: videoData } = useQuery({
    queryKey: ["video-preview", movie.id, contentType],
    queryFn: () => isTV ? fetchTVVideos(movie.id) : fetchMovieVideos(movie.id),
    enabled: isHovered,
    staleTime: Infinity,
  });

  const trailer = videoData?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || videoData?.results?.[0];

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const toggleWatchList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      removeFromWatchlist.mutate({ contentId: movie.id, contentType });
    } else {
      addToWatchlist.mutate({ contentId: movie.id, contentType });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
        className
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={detailPath} className="block">
        <div className={cn(
          "relative rounded-xl overflow-hidden transition-all duration-500",
          isHovered && "scale-[1.12] z-30 shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.25)]"
        )}>
          <div className="aspect-[2/3] relative bg-secondary rounded-xl overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-shimmer rounded-xl" />
            )}
            
            {isHovered && trailer ? (
              <div className="absolute inset-0 bg-background">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  className="w-full h-full"
                  allow="autoplay"
                  title={title}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/60 hover:bg-background/80"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={title}
                className={cn(
                  "w-full h-full object-cover transition-all duration-700",
                  isHovered ? "scale-110 brightness-75" : "scale-100",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
            )}

            {/* Glow ring */}
            <div className={cn(
              "absolute inset-0 rounded-xl transition-all duration-500 pointer-events-none",
              isHovered ? "ring-1 ring-primary/30 ring-inset" : ""
            )} />

            {/* Rating Badge */}
            {movie.vote_average > 0 && !isHovered && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-background/70 backdrop-blur-md text-[10px] font-bold">
                <Star className="h-3 w-3 text-primary fill-primary" />
                {movie.vote_average.toFixed(1)}
              </div>
            )}
          </div>

          {/* Expanded Info on Hover */}
          {isHovered && (
            <div className="absolute left-0 right-0 -bottom-1 translate-y-full bg-card/95 backdrop-blur-xl rounded-b-xl p-3 shadow-2xl border-t border-border/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Button 
                  size="icon" 
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 fill-current" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full border border-foreground/10"
                  onClick={toggleWatchList}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : inList ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full border border-foreground/10 ml-auto"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="font-bold text-sm line-clamp-1 mb-1 font-display">{title}</h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary font-bold">
                  {Math.round(movie.vote_average * 10)}% Match
                </span>
                <span>{year}</span>
                <span className="px-1.5 border border-foreground/20 rounded text-[10px] font-bold">HD</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {!isHovered && (
        <div className="mt-2 px-1">
          <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>
      )}
    </motion.div>
  );
};
