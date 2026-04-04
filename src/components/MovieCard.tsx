import { useState } from "react";
import { Link } from "react-router-dom";
import { Film, X } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

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

  const backdropUrl = getImageUrl(movie.backdrop_path, "w780");
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const imageUrl = backdropUrl || posterUrl;
  const title = movie.title || movie.name || "Unknown";
  const isTV = movie.media_type === "tv";
  const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  const sizeClasses = {
    default: "w-[240px] sm:w-[280px] md:w-[300px] lg:w-[320px]",
    large: "w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px]",
    compact: "w-[200px] sm:w-[240px] md:w-[260px]",
  };

  return (
    <div className={cn("flex-shrink-0", sizeClasses[variant])} style={style}>
      <Link
        to={detailPath}
        className={cn("group relative block rounded-lg overflow-hidden", className)}
      >
        {/* Landscape card */}
        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
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
          <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

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
        </div>

        {/* Title below card */}
        <div className="mt-2 px-0.5">
          <h3 className="font-medium text-sm line-clamp-1 text-foreground">{title}</h3>
        </div>
      </Link>
    </div>
  );
};
