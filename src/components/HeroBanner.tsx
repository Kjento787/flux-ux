import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleField, AuroraBackground, GridPattern } from "./effects/ParticleField";

interface HeroBannerProps {
  movies: Movie[];
}

export const HeroBanner = ({ movies }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const featuredMovies = movies.slice(0, 6);
  const currentMovie = featuredMovies[currentIndex];

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [featuredMovies.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, currentIndex]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, 8000);
    return () => clearInterval(timer);
  }, [goToNext, isPaused]);

  if (!currentMovie) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[105vh] overflow-hidden bg-surface-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Aurora Background Effect */}
      <AuroraBackground className="z-[1]" />
      
      {/* Grid Pattern */}
      <GridPattern className="z-[2]" />
      
      {/* Particle Field */}
      <ParticleField count={15} className="z-[3]" />

      {/* Background Images with Holographic Tint */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-[4]"
        >
          <img
            src={getImageUrl(currentMovie.backdrop_path, "w780")}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-top"
          />
          {/* Holographic color overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-holo-violet/10 via-transparent to-holo-cyan/10 mix-blend-color" />
        </motion.div>
      </AnimatePresence>

      {/* Multi-Layer Gradients */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 z-[5] bg-gradient-to-t from-background via-transparent to-background/50" />
      <div className="absolute bottom-0 left-0 right-0 h-[60%] z-[5] bg-gradient-to-t from-background via-background/95 to-transparent" />
      
      {/* Scanline effect */}
      <div 
        className="absolute inset-0 z-[6] pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.03) 2px, hsl(var(--foreground) / 0.03) 4px)",
        }}
      />

      {/* Vignette with holographic tint */}
      <div className="absolute inset-0 z-[6] bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_100%)]" />

      {/* Content Container */}
      <div
        className="absolute inset-0 z-[10] flex items-end pb-36 md:pb-48 lg:pb-56"
      >
        <div className="w-full px-4 md:px-8 lg:px-12 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Holographic Category Tag */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/30 mb-4"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-holo-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-holo-cyan to-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-aurora font-display">
                  Trending Now
                </span>
              </motion.div>

              {/* Title with Holographic Glow */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 leading-[0.9] tracking-[-0.02em] font-display">
                <span className="relative">
                  <span className="text-foreground text-shadow-neon">{currentMovie.title}</span>
                </span>
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm md:text-base">
                <div className="flex items-center gap-1.5 text-holo-cyan">
                  <Star className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                  <span className="font-bold">{currentMovie.vote_average.toFixed(1)}</span>
                </div>
                {currentMovie.release_date && (
                  <span className="text-foreground/50 font-medium">
                    {currentMovie.release_date.split("-")[0]}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full glass text-[10px] font-bold tracking-wider border-primary/20">
                  4K HDR
                </span>
                {currentMovie.adult && (
                  <span className="px-2.5 py-0.5 bg-destructive/90 rounded-full text-xs font-bold">
                    18+
                  </span>
                )}
              </div>

              {/* Overview */}
              <p className="text-sm md:text-base lg:text-lg text-foreground/60 mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl">
                {currentMovie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/movie/${currentMovie.id}`}>
                  <Button
                    size="lg"
                    className="h-12 md:h-14 px-8 md:px-10 rounded-2xl btn-holo font-bold text-sm md:text-base uppercase tracking-wider gap-2.5"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Watch Now
                  </Button>
                </Link>
                <Link to={`/movie/${currentMovie.id}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 md:h-14 px-8 md:px-10 rounded-2xl glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-bold text-sm md:text-base uppercase tracking-wider gap-2.5 transition-all duration-300"
                  >
                    <Info className="h-5 w-5" />
                    Details
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-2xl glass border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Holographic Slide Indicators */}
      <div
        className="absolute bottom-10 md:bottom-14 left-4 md:left-8 lg:left-12 flex items-center gap-2 z-20"
      >
        {featuredMovies.map((movie, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative h-1.5 rounded-full transition-all duration-500 overflow-hidden",
              index === currentIndex
                ? "w-14 bg-primary/30"
                : "w-6 bg-foreground/20 hover:bg-foreground/40"
            )}
            aria-label={`Go to ${movie.title}`}
          >
            {index === currentIndex && (
              <motion.span
                className="absolute inset-0 rounded-full bg-gradient-to-r from-holo-cyan via-primary to-holo-magenta"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: isPaused ? 999 : 8, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Thumbnail Strip */}
      <div
        className="absolute bottom-10 md:bottom-14 right-4 md:right-8 lg:right-12 hidden lg:flex gap-2.5 z-20"
      >
        {featuredMovies.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative w-20 xl:w-24 h-12 xl:h-14 rounded-xl overflow-hidden transition-all duration-500",
              index === currentIndex
                ? "ring-2 ring-primary shadow-neon scale-110"
                : "opacity-30 hover:opacity-60 grayscale hover:grayscale-0 scale-100"
            )}
          >
            <img
              src={getImageUrl(movie.backdrop_path, "w300")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 border-2 border-primary/50 rounded-xl" />
            )}
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-display">Explore</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-primary/30 flex justify-center pt-2"
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-0.5 h-2 rounded-full bg-gradient-to-b from-primary to-holo-cyan" />
        </motion.div>
      </motion.div>
    </section>
  );
};
