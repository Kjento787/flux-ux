import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
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
    <section className={cn("mx-4 md:mx-8 lg:mx-12", className)}>
      <Link to={detailPath} className="block relative rounded-lg overflow-hidden aspect-[21/9] md:aspect-[3/1] bg-muted group">
        <img
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">{label}</span>
          <h2 className="text-xl md:text-2xl font-bold mt-1">{title}</h2>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1 hidden sm:block max-w-md">{movie.overview}</p>
        </div>
      </Link>
    </section>
  );
};
