import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, Star, Tv, Film, Loader2, X, Bell, BellOff } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";

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
    <div className={cn("flex-shrink-0", sizeClasses[variant])} style={style}>
      <Link
        to={detailPath}
        className={cn("group relative block rounded-lg overflow-hidden", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                isHovered ? "scale-105" : "scale-100",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Film className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Hover overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Media Type Badge */}
          {movie.media_type && (
            <div className={cn(
              "absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 text-[10px] font-medium",
              isHovered ? "opacity-0" : "opacity-100"
            )}>
              {isTV ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
              <span>{isTV ? "TV" : "Film"}</span>
            </div>
          )}

          {/* Rating */}
          {movie.vote_average > 0 && (
            <div className={cn(
              "absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 text-[10px] font-medium",
              isHovered ? "opacity-0" : "opacity-100"
            )}>
              <Star className="h-3 w-3 text-primary fill-primary" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 z-20 h-7 w-7 rounded bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5 text-destructive-foreground" />
            </button>
          )}

          {/* Progress Bar */}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/80 z-10">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Hover Actions */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {movie.vote_average > 0 && (
                <span className="text-primary font-medium flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span>{year}</span>}
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="flex-1 h-8 rounded text-xs gap-1 bg-primary text-primary-foreground">
                <Play className="h-3.5 w-3.5 fill-current" /> Play
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded"
                onClick={toggleWatchList}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : inList ? <Check className="h-3.5 w-3.5 text-primary" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
              {userId && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded"
                  onClick={toggleNotify}
                  disabled={isNotifyPending}
                >
                  {isNotifyPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isFav ? <BellOff className="h-3.5 w-3.5 text-primary" /> : <Bell className="h-3.5 w-3.5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Title below card */}
        <div className={cn("mt-2 px-0.5", isHovered ? "opacity-0" : "opacity-100")}>
          <h3 className="font-medium text-xs line-clamp-1 md:text-sm">{title}</h3>
          <p className="text-[10px] text-muted-foreground md:text-xs">{year}</p>
        </div>
      </Link>
    </div>
  );
};
