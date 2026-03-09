import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import {
  Swords, Laugh, Ghost, Rocket, Heart, Sparkles, Drama,
  Mountain, Music, Baby, Clapperboard, Scroll, Skull, Compass,
} from "lucide-react";
import { discoverMovies, discoverTV, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HubData {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  genreId: number;
  isTV?: boolean;
}

const hubs: HubData[] = [
  { id: 1, name: "Action", description: "High-octane thrills", icon: Swords, color: "hsl(40, 65%, 55%)", genreId: 28 },
  { id: 2, name: "Comedy", description: "Laughs guaranteed", icon: Laugh, color: "hsl(40, 65%, 55%)", genreId: 35 },
  { id: 3, name: "Horror", description: "Fear the unknown", icon: Ghost, color: "hsl(40, 50%, 40%)", genreId: 27 },
  { id: 4, name: "Sci-Fi", description: "Beyond imagination", icon: Rocket, color: "hsl(40, 65%, 55%)", genreId: 878 },
  { id: 5, name: "Romance", description: "Love stories", icon: Heart, color: "hsl(35, 70%, 50%)", genreId: 10749 },
  { id: 6, name: "Anime", description: "Japanese animation", icon: Sparkles, color: "hsl(40, 65%, 55%)", genreId: 16, isTV: true },
  { id: 7, name: "Drama", description: "Powerful narratives", icon: Drama, color: "hsl(40, 65%, 55%)", genreId: 18 },
  { id: 8, name: "Adventure", description: "Epic journeys", icon: Compass, color: "hsl(40, 65%, 55%)", genreId: 12 },
  { id: 9, name: "Thriller", description: "Edge of your seat", icon: Skull, color: "hsl(40, 50%, 40%)", genreId: 53 },
  { id: 10, name: "Documentary", description: "Real stories", icon: Clapperboard, color: "hsl(40, 65%, 55%)", genreId: 99 },
  { id: 11, name: "Music", description: "Feel the rhythm", icon: Music, color: "hsl(40, 65%, 55%)", genreId: 10402 },
  { id: 12, name: "Family", description: "For everyone", icon: Baby, color: "hsl(40, 65%, 55%)", genreId: 10751 },
  { id: 13, name: "Fantasy", description: "Magical worlds", icon: Mountain, color: "hsl(40, 65%, 55%)", genreId: 14 },
  { id: 14, name: "History", description: "Stories of the past", icon: Scroll, color: "hsl(40, 65%, 55%)", genreId: 36 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const HubCard = ({ hub, index }: { hub: HubData; index: number }) => {
  const { data } = useQuery({
    queryKey: ["hub-preview", hub.genreId, hub.isTV],
    queryFn: () => hub.isTV
      ? discoverTV({ withGenres: String(hub.genreId), sortBy: "popularity.desc" })
      : discoverMovies({ withGenres: String(hub.genreId), sortBy: "popularity.desc" }),
  });

  const Icon = hub.icon;
  const previewMovies = data?.results?.slice(0, 4) || [];

  return (
    <motion.div custom={index} variants={fadeUp}>
      <Link
        to={`/genre/${hub.genreId}`}
        className="group relative rounded-2xl overflow-hidden aspect-[4/3] block transition-all duration-500 hover:shadow-[0_0_50px_hsl(var(--primary)/0.2)]"
      >
        {/* Background Images */}
        <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-50 group-hover:opacity-70 transition-opacity duration-500">
          {previewMovies.map((movie) => (
            <div key={movie.id} className="relative overflow-hidden">
              <img
                src={getImageUrl(movie.poster_path, "w300")}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30 group-hover:from-background/90 group-hover:via-background/50 group-hover:to-background/20 transition-all duration-500" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div
            className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-glow"
          >
            <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide group-hover:text-primary transition-colors">
            {hub.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {hub.description}
          </p>
        </div>

        {/* Hover border */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none"
        />
      </Link>
    </motion.div>
  );
};

const Hubs = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Cinematic Hero */}
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/6 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }} />

          <motion.div
            initial="hidden"
            animate="visible"
            className="relative max-w-4xl mx-auto text-center px-4"
          >
            <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
              Curated Collections
            </motion.p>
            <motion.h1 custom={1} variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-display">
              Browse by <span className="text-primary">Hub</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked genre collections — your gateway to discovering something incredible.
            </motion.p>
          </motion.div>
        </section>

        {/* Hubs Grid */}
        <main className="px-4 md:px-8 lg:px-12 pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
          >
            {hubs.map((hub, index) => (
              <HubCard key={hub.id} hub={hub} index={index} />
            ))}
          </motion.div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Hubs;
