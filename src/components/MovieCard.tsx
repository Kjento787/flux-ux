import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, Star, Tv, Film, Loader2, X, Bell, BellOff, Sparkles } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showProgress?: boolean;
  progress?: number;
  style?: React.CSSProperties;
  variant?: "default" | "large" | "compact";
  index?: number;
  onRemove?: () => void;
}

export const MovieCard = ({ 
  movie, 
  className, 
  showProgress, 
  progress, 
  style,
  variant = "default",
  index = 0,
  onRemove,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isFavorited, addFavorite, removeFavorite, userId } = useFavorites();
  
  const imageUrl = getImageUrl(movie.poster_path, "w500");
  const title = movie.title || movie.name || "Unknown";
  const year = (movie.release_date || movie.first_air_date)?.split("-")[0] || "";
  const isTV = movie.media_type === "tv";
  const contentType = isTV ? "tv" : "movie";
  const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const inList = isInWatchlist(movie.id, contentType);
  const isPending = addToWatchlist.isPending || removeFromWatchlist.isPending;
  const isFav = isFavorited(movie.id, contentType);
  const isNotifyPending = addFavorite.isPending || removeFavorite.isPending;

  const toggleWatchList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      removeFromWatchlist.mutate({ contentId: movie.id, contentType });
    } else {
      addToWatchlist.mutate({ contentId: movie.id, contentType });
    }
  };

  const toggleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite.mutate({ tmdb_id: movie.id, content_type: contentType });
    } else {
      addFavorite.mutate({
        tmdb_id: movie.id,
        content_type: contentType,
        title,
        release_date: movie.release_date || movie.first_air_date,
        poster_path: movie.poster_path,
      });
    }
  };

  const sizeClasses = {
    default: "w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]",
    large: "w-[180px] sm:w-[200px] md:w-[240px] lg:w-[280px]",
    compact: "w-[120px] sm:w-[140px] md:w-[160px]",
  };

  return (
    <div
      className={cn("flex-shrink-0", sizeClasses[variant])}
      style={style}
    >
      <Link
        to={detailPath}
        className={cn(
          "group relative block rounded-2xl overflow-hidden",
          "transition-all duration-500 ease-out",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Container with 3D Effect */}
        <div 
          className={cn(
            "aspect-[2/3] relative overflow-hidden rounded-2xl transition-all duration-500 card-3d",
            isHovered && "shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.35)]"
          )}
          style={{
            transform: isHovered ? "translateY(-8px) rotateX(5deg) rotateY(-2deg)" : "translateY(0) rotateX(0) rotateY(0)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface-2 animate-shimmer rounded-2xl" />
          )}
          
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-all duration-700 rounded-2xl",
                isHovered ? "scale-110 brightness-75" : "scale-100",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-surface-2 flex items-center justify-center rounded-2xl">
              <Film className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Holographic Shimmer Effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none",
            "bg-gradient-to-br from-holo-cyan/0 via-white/10 to-holo-magenta/0",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Hover Gradient */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-opacity duration-500",
            "bg-gradient-to-t from-background via-background/50 to-transparent",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Holographic Border Glow */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none",
            isHovered 
              ? "ring-1 ring-primary/50 shadow-[inset_0_0_20px_hsl(var(--primary)/0.1)]" 
              : "ring-0 ring-transparent"
          )} />

          {/* Media Type Badge */}
          {movie.media_type && (
            <div className={cn(
              "absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl glass text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border-primary/20",
              isHovered ? "opacity-0 -translate-y-2" : "opacity-100"
            )}>
              {isTV ? <Tv className="h-3 w-3 text-holo-cyan" /> : <Film className="h-3 w-3 text-primary" />}
              <span>{isTV ? "TV" : "Film"}</span>
            </div>
          )}

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className={cn(
              "absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl glass text-[10px] font-bold transition-all duration-300 border-primary/20",
              isHovered ? "opacity-0 -translate-y-2" : "opacity-100"
            )}>
              <Star className="h-3 w-3 text-holo-cyan fill-holo-cyan" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 z-20 h-7 w-7 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/80 border-destructive/50"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Progress Bar */}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-2/80 rounded-b-2xl overflow-hidden z-10">
              <div
                className="h-full bg-gradient-to-r from-primary via-holo-cyan to-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Hover Actions */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 transition-all duration-400",
            isHovered 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-6 pointer-events-none"
          )}>
            <h3 className="font-bold text-sm line-clamp-1 text-foreground mb-1 font-display">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-foreground/60 mb-2">
              {movie.vote_average > 0 && (
                <span className="text-holo-cyan font-bold flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span>{year}</span>}
              <span className="px-1.5 py-0.5 rounded-md glass text-[9px] font-bold border-primary/20">HDR</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 h-9 rounded-xl btn-holo font-bold text-[10px] uppercase tracking-wider gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Play
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-xl glass border-primary/20 hover:border-primary/40"
                onClick={toggleWatchList}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : inList ? (
                  <Check className="h-3.5 w-3.5 text-holo-cyan" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
              {userId && (
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "h-9 w-9 rounded-xl glass",
                    isFav 
                      ? "border-holo-cyan/40 text-holo-cyan" 
                      : "border-primary/20"
                  )}
                  onClick={toggleNotify}
                  disabled={isNotifyPending}
                >
                  {isNotifyPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFav ? (
                    <BellOff className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Title below card */}
        <div className={cn(
          "mt-3 px-0.5 transition-opacity duration-300",
          isHovered ? "opacity-0" : "opacity-100"
        )}>
          <h3 className="font-semibold text-xs line-clamp-1 md:text-sm">{title}</h3>
          <p className="text-[10px] text-muted-foreground md:text-xs">{year}</p>
        </div>
      </Link>
    </div>
  );
};
