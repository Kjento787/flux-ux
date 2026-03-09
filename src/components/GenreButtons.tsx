import { Link } from "react-router-dom";
import { Genre } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import {
  Sword,
  Laugh,
  Film,
  Ghost,
  Heart,
  Wand2,
  Rocket,
  History,
  Music2,
  Search,
  Skull,
  Sparkles,
  Tv,
  Shield,
  Bomb,
  Clapperboard,
  Users,
  Baby,
  Zap,
  Drama,
} from "lucide-react";

const genreIcons: Record<number, React.ElementType> = {
  28: Bomb,
  12: Sword,
  16: Sparkles,
  35: Laugh,
  80: Shield,
  99: Film,
  18: Tv,
  10751: Heart,
  14: Wand2,
  36: History,
  27: Ghost,
  10402: Music2,
  9648: Search,
  10749: Heart,
  878: Rocket,
  53: Skull,
  10752: Bomb,
  37: Sword,
  10759: Zap,
  10762: Baby,
  10763: Clapperboard,
  10764: Users,
  10765: Wand2,
  10766: Drama,
  10767: Laugh,
  10768: Shield,
};

const customCategories = [
  { id: "korean", name: "K-Drama", icon: Drama, path: "/search?q=korean" },
  { id: "anime", name: "Anime", icon: Sparkles, path: "/search?q=anime" },
  { id: "bollywood", name: "Bollywood", icon: Film, path: "/search?q=bollywood" },
];

interface GenreButtonsProps {
  genres: Genre[];
  selectedGenre?: number;
  className?: string;
  showAllGenres?: boolean;
}

export const GenreButtons = ({ genres, selectedGenre, className, showAllGenres = false }: GenreButtonsProps) => {
  const displayGenres = showAllGenres ? genres : genres.slice(0, 8);
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayGenres.map((genre, index) => {
        const Icon = genreIcons[genre.id] || Film;
        const isSelected = selectedGenre === genre.id;
        
        return (
          <Link 
            key={genre.id} 
            to={`/genre/${genre.id}`}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full",
              "text-xs md:text-sm font-medium",
              "bg-secondary/50 backdrop-blur-sm border border-border/30",
              "transition-all duration-200",
              "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105",
              isSelected 
                ? "bg-primary text-primary-foreground border-primary" 
                : "text-foreground/80"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>{genre.name}</span>
          </Link>
        );
      })}
      
      {customCategories.map((category, index) => {
        const Icon = category.icon;
        return (
          <Link 
            key={category.id} 
            to={category.path}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full",
              "text-xs md:text-sm font-medium",
              "bg-primary/10 backdrop-blur-sm border border-primary/30",
              "text-primary",
              "transition-all duration-200",
              "hover:bg-primary hover:text-primary-foreground hover:scale-105"
            )}
            style={{ animationDelay: `${(displayGenres.length + index) * 30}ms` }}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
};
