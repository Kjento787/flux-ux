import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface HubSectionProps {
  title: string;
  icon: LucideIcon;
  movies: Movie[];
  genreId?: number;
  searchQuery?: string;
  accentColor?: string;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, type: "spring" as const, stiffness: 260, damping: 22 }
  })
};

export const HubSection = ({ 
  title, 
  icon: Icon, 
  movies, 
  genreId,
  searchQuery,
  accentColor = "hsl(var(--primary))",
  className 
}: HubSectionProps) => {
  const displayMovies = movies.slice(0, 6);
  const linkPath = genreId ? `/genre/${genreId}` : searchQuery ? `/search?q=${searchQuery}` : "/movies";

  if (!displayMovies.length) return null;

  return (
    <section className={cn("px-4 md:px-8 lg:px-12", className)}>
      {/* Hub Header */}
      <motion.div 
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-lg border border-white/10"
            style={{ backgroundColor: `${accentColor}15`, boxShadow: `0 0 20px ${accentColor}20` }}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: accentColor }} />
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
          <div className="hidden md:block h-px w-16 bg-gradient-to-r from-primary/30 to-transparent ml-2" />
        </div>
        <Link 
          to={linkPath}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link flex items-center gap-1"
        >
          See All
          <span className="inline-block transition-transform group-hover/link:translate-x-0.5">→</span>
        </Link>
      </motion.div>

      {/* Hub Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {displayMovies.map((movie, index) => {
          const isTV = movie.media_type === "tv";
          const detailPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
          
          return (
            <motion.div
              key={movie.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              <Link
                to={detailPath}
                className={cn(
                  "group relative rounded-lg overflow-hidden aspect-[2/3] block",
                  "transition-all duration-500 hover:scale-105 hover:z-10"
                )}
                style={{ 
                  boxShadow: `0 4px 16px -4px transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 32px -4px ${accentColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 16px -4px transparent`;
                }}
              >
                <img
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{movie.title || movie.name}</h3>
                  </div>
                </div>

                {/* Accent Border on Hover */}
                <div 
                  className="absolute inset-0 rounded-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ borderColor: accentColor }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
