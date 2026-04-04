import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HubSectionProps {
  title: string;
  icon: LucideIcon;
  movies: Movie[];
  genreId?: number;
  searchQuery?: string;
  accentColor?: string;
  className?: string;
}

export const HubSection = ({
  title,
  icon: Icon,
  movies,
  genreId,
  searchQuery,
  className,
}: HubSectionProps) => {
  const displayMovies = movies.slice(0, 6);
  const linkPath = genreId ? `/genre/${genreId}` : searchQuery ? `/search?q=${searchQuery}` : "/movies";

  if (!displayMovies.length) return null;

  return (
    <section className={cn("px-4 md:px-8 lg:px-12", className)}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
        <Link to={linkPath} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          See All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayMovies.map((movie) => {
          const isTV = movie.media_type === "tv";
          const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
          const imageUrl = getImageUrl(movie.backdrop_path, "w780") || getImageUrl(movie.poster_path, "w500");

          return (
            <Link
              key={movie.id}
              to={detailPath}
              className="group relative rounded-lg overflow-hidden aspect-video block bg-muted"
            >
              <img
                src={imageUrl}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mt-1.5 px-0.5">
                <h3 className="font-medium text-xs line-clamp-1">{movie.title || movie.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
