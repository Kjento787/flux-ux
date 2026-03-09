import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Smile, 
  Zap, 
  Brain, 
  Heart, 
  Ghost, 
  Sparkles,
  Flame,
  Moon
} from "lucide-react";

interface Mood {
  id: string;
  name: string;
  icon: React.ElementType;
  keywords: string;
  gradient: string;
  glowColor: string;
}

const moods: Mood[] = [
  { 
    id: "feel-good", 
    name: "Feel Good", 
    icon: Smile, 
    keywords: "comedy feel good happy",
    gradient: "from-amber-500/90 to-yellow-600/90",
    glowColor: "rgba(245, 158, 11, 0.4)"
  },
  { 
    id: "thrilling", 
    name: "Thrilling", 
    icon: Zap, 
    keywords: "thriller suspense action",
    gradient: "from-red-500/90 to-rose-700/90",
    glowColor: "rgba(239, 68, 68, 0.4)"
  },
  { 
    id: "mind-bending", 
    name: "Mind-Bending", 
    icon: Brain, 
    keywords: "psychological mystery twist",
    gradient: "from-violet-500/90 to-purple-700/90",
    glowColor: "rgba(139, 92, 246, 0.4)"
  },
  { 
    id: "romantic", 
    name: "Romantic", 
    icon: Heart, 
    keywords: "romance love relationship",
    gradient: "from-pink-400/90 to-rose-600/90",
    glowColor: "rgba(236, 72, 153, 0.4)"
  },
  { 
    id: "spooky", 
    name: "Spooky", 
    icon: Ghost, 
    keywords: "horror scary supernatural",
    gradient: "from-slate-500/90 to-slate-800/90",
    glowColor: "rgba(100, 116, 139, 0.4)"
  },
  { 
    id: "fantasy", 
    name: "Fantastical", 
    icon: Sparkles, 
    keywords: "fantasy magic adventure",
    gradient: "from-cyan-400/90 to-blue-600/90",
    glowColor: "rgba(34, 211, 238, 0.4)"
  },
  { 
    id: "intense", 
    name: "Intense", 
    icon: Flame, 
    keywords: "drama intense emotional",
    gradient: "from-orange-500/90 to-red-700/90",
    glowColor: "rgba(249, 115, 22, 0.4)"
  },
  { 
    id: "chill", 
    name: "Chill Night", 
    icon: Moon, 
    keywords: "documentary slow calm",
    gradient: "from-indigo-400/90 to-blue-700/90",
    glowColor: "rgba(99, 102, 241, 0.4)"
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

interface MoodBrowserProps {
  className?: string;
}

export const MoodBrowser = ({ className }: MoodBrowserProps) => {
  return (
    <section className={cn("px-4 md:px-8 lg:px-12", className)}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-5"
      >
        <h2 className="font-display text-xl md:text-2xl font-bold">Browse by Mood</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {moods.map((mood) => {
          const Icon = mood.icon;
          return (
            <motion.div key={mood.id} variants={cardVariants}>
              <Link
                to={`/search?q=${encodeURIComponent(mood.keywords)}`}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-2.5 p-5 md:p-6 rounded-xl",
                  "bg-gradient-to-br backdrop-blur-sm",
                  "border border-white/10",
                  "transition-all duration-500",
                  "hover:scale-[1.08] hover:-translate-y-1",
                  mood.gradient
                )}
                style={{
                  boxShadow: `0 4px 20px -4px transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 32px -4px ${mood.glowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 20px -4px transparent`;
                }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </div>

                <Icon className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs md:text-sm font-semibold text-white text-center drop-shadow-lg">
                  {mood.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
