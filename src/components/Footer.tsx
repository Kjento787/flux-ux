import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { Film, Tv, Compass, Search, User, Bookmark, LogIn, FileText, Shield, Cookie, AlertTriangle, Sparkles, Zap, Users, Trophy } from "lucide-react";

const footerLinks = {
  browse: [
    { to: "/home", label: "Home", icon: Sparkles },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/genres", label: "Series", icon: Tv },
    { to: "/hubs", label: "Hubs", icon: Compass },
    { to: "/trending", label: "Trending", icon: Zap },
  ],
  social: [
    { to: "/parties", label: "Watch Parties", icon: Users },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/profile", label: "My List", icon: Bookmark },
  ],
  legal: [
    { to: "/terms", label: "Terms of Service", icon: FileText },
    { to: "/privacy", label: "Privacy Policy", icon: Shield },
    { to: "/cookies", label: "Cookie Policy", icon: Cookie },
    { to: "/dmca", label: "DMCA", icon: AlertTriangle },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 md:mt-24">
      {/* Gradient divider */}
      <div className="relative h-px w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-flux-cyan/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-flux-magenta/40 to-primary/30 blur-sm" />
      </div>

      <div className="bg-surface-0/95 backdrop-blur-xl">
        {/* Subtle aurora effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[250px] h-[150px] bg-flux-cyan/10 rounded-full blur-[80px]" />
        </div>

        <motion.div
          className="relative w-full px-4 md:px-8 lg:px-12 py-12 md:py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mb-12">
            {/* Brand */}
            <motion.div className="col-span-2 md:col-span-1" variants={itemVariants}>
              <Logo className="mb-5" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Your universe of entertainment. Unlimited movies and TV shows in stunning quality.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="inline-block h-1.5 w-10 rounded-full bg-gradient-to-r from-primary to-flux-cyan" />
                <span className="inline-block h-1.5 w-5 rounded-full bg-gradient-to-r from-flux-cyan to-flux-magenta opacity-60" />
                <span className="inline-block h-1.5 w-2.5 rounded-full bg-flux-magenta opacity-30" />
              </div>
            </motion.div>

            {/* Browse */}
            <motion.div variants={itemVariants}>
              <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gradient-aurora mb-5">
                Browse
              </h4>
              <ul className="space-y-3">
                {footerLinks.browse.map(({ to, label, icon: Icon }) => (
                  <li key={`${to}-${label}`}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <div className="p-1 rounded-md bg-surface-2 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-3 w-3 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Social */}
            <motion.div variants={itemVariants}>
              <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gradient-aurora mb-5">
                Social
              </h4>
              <ul className="space-y-3">
                {footerLinks.social.map(({ to, label, icon: Icon }) => (
                  <li key={`${to}-${label}`}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <div className="p-1 rounded-md bg-surface-2 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-3 w-3 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div variants={itemVariants}>
              <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gradient-aurora mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <div className="p-1 rounded-md bg-surface-2 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-3 w-3 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div variants={itemVariants}>
            <div className="relative h-px w-full overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground/60 font-display tracking-wider">
                © {currentYear} FLUX-UX. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground/60">
                  Powered by{" "}
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/70 hover:text-primary transition-colors duration-300"
                  >
                    TMDB
                  </a>
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-flux-cyan animate-pulse" />
                  <span className="text-[10px] text-flux-cyan font-display tracking-wider">ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};
