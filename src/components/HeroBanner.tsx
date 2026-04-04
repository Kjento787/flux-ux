import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  movies: Movie[];
}

export const HeroBanner = ({ movies }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = movies.slice(0, 6);
  const current = featured[currentIndex];

  const goTo = useCallback((i: number) => {
    setCurrentIndex(i);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % featured.length);
  }, [featured.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  if (!current) return null;

  return (
    <section className="relative w-full aspect-[16/7] md:aspect-[16/6] overflow-hidden bg-surface-0">
      {/* Backdrop image */}
      <Link to={`/movie/${current.id}`} className="block w-full h-full">
        <img
          src={getImageUrl(current.backdrop_path, "original")}
          alt={current.title || current.name}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </Link>

      {/* Left arrow */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
      </button>

      {/* Right arrow */}
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              i === currentIndex
                ? "bg-primary scale-110"
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
