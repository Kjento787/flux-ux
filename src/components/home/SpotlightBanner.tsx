import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Play, Info, Star } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SpotlightBannerProps {
  movie: Movie;
  label?: string;
  className?: string;
}

export const SpotlightBanner = ({ movie, label = "Featured", className }: SpotlightBannerProps) => {
  const isTV = movie.media_type === "tv";
  const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const title = movie.title || movie.name || "Unknown";

  return (
    <section className={cn("relative mx-4 md:mx-8 lg:mx-12 rounded-2xl overflow-hidden", className)}>
      {/* Background Image */}
      <div className="relative aspect-[21/9] md:aspect-[3/1]">
        <img
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-6 md:px-10 lg:px-14 max-w-2xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 text-shadow-lg leading-tight">
            {title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-3 text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
            </div>
            {(movie.release_date || movie.first_air_date) && (
              <span className="text-foreground/60">
                {(movie.release_date || movie.first_air_date)?.split("-")[0]}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-foreground/70 line-clamp-2 mb-4 hidden sm:block">
            {movie.overview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to={detailPath}>
              <Button size="sm" className="h-9 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold text-xs uppercase tracking-wider gap-2">
                <Play className="h-4 w-4 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link to={detailPath}>
              <Button size="sm" variant="secondary" className="h-9 px-5 rounded-full font-bold text-xs uppercase tracking-wider gap-2">
                <Info className="h-4 w-4" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="absolute inset-0 rounded-2xl border border-border/30 pointer-events-none" />
    </section>
  );
};