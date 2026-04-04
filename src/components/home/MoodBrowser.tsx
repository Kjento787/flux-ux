import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Smile, Zap, Brain, Heart, Ghost, Sparkles, Flame, Moon
} from "lucide-react";

const moods = [
  { id: "feel-good", name: "Feel Good", icon: Smile, keywords: "comedy feel good happy" },
  { id: "thrilling", name: "Thrilling", icon: Zap, keywords: "thriller suspense action" },
  { id: "mind-bending", name: "Mind-Bending", icon: Brain, keywords: "psychological mystery twist" },
  { id: "romantic", name: "Romantic", icon: Heart, keywords: "romance love relationship" },
  { id: "spooky", name: "Spooky", icon: Ghost, keywords: "horror scary supernatural" },
  { id: "fantasy", name: "Fantastical", icon: Sparkles, keywords: "fantasy magic adventure" },
  { id: "intense", name: "Intense", icon: Flame, keywords: "drama intense emotional" },
  { id: "chill", name: "Chill Night", icon: Moon, keywords: "documentary slow calm" },
];

interface MoodBrowserProps {
  className?: string;
}

export const MoodBrowser = ({ className }: MoodBrowserProps) => {
  return (
    <section className={cn("px-4 md:px-8 lg:px-12", className)}>
      <h2 className="text-lg md:text-xl font-bold mb-3">Browse by Mood</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {moods.map((mood) => {
          const Icon = mood.icon;
          return (
            <Link
              key={mood.id}
              to={`/search?q=${encodeURIComponent(mood.keywords)}`}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-foreground">{mood.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
