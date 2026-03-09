import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Genre } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  genres: Genre[];
  className?: string;
}

export interface FilterState {
  sortBy: string;
  year: string;
  genre: string;
  rating: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const sortOptions = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
  { value: "revenue.desc", label: "Highest Revenue" },
];

const ratingOptions = [
  { value: "all", label: "Any Rating" },
  { value: "9", label: "9+ Stars" },
  { value: "8", label: "8+ Stars" },
  { value: "7", label: "7+ Stars" },
  { value: "6", label: "6+ Stars" },
];

export const SearchFilters = ({
  onSearch,
  onFilterChange,
  genres,
  className,
}: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "popularity.desc",
    year: "all",
    genre: "all",
    rating: "all",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const apiFilters = {
      ...newFilters,
      year: newFilters.year === "all" ? "" : newFilters.year,
      genre: newFilters.genre === "all" ? "" : newFilters.genre,
      rating: newFilters.rating === "all" ? "" : newFilters.rating,
    };
    onFilterChange(apiFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      sortBy: "popularity.desc",
      year: "all",
      genre: "all",
      rating: "all",
    };
    setFilters(defaultFilters);
    onFilterChange({ sortBy: "popularity.desc", year: "", genre: "", rating: "" });
  };

  const hasActiveFilters =
    filters.year !== "all" || filters.genre !== "all" || filters.rating !== "all" || filters.sortBy !== "popularity.desc";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder="Search movies, actors, directors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-28 h-14 text-lg bg-card/60 backdrop-blur-sm border-border/30 focus:border-primary/50 rounded-2xl placeholder:text-muted-foreground/50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <Button
            type="button"
            variant={showFilters ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-10 rounded-xl gap-1.5 font-semibold text-xs uppercase tracking-wider",
              showFilters && "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
              hasActiveFilters && !showFilters && "border-primary/40 text-primary"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Button>
        </div>
      </form>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/20">
              {/* Gold accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-2xl" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary gap-1">
                    <X className="h-3.5 w-3.5" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                    <SelectTrigger className="bg-secondary/30 border-border/30 rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</label>
                  <Select value={filters.year} onValueChange={(v) => updateFilter("year", v)}>
                    <SelectTrigger className="bg-secondary/30 border-border/30 rounded-xl h-10">
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Year</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Genre</label>
                  <Select value={filters.genre} onValueChange={(v) => updateFilter("genre", v)}>
                    <SelectTrigger className="bg-secondary/30 border-border/30 rounded-xl h-10">
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={String(genre.id)}>{genre.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Rating</label>
                  <Select value={filters.rating} onValueChange={(v) => updateFilter("rating", v)}>
                    <SelectTrigger className="bg-secondary/30 border-border/30 rounded-xl h-10">
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
