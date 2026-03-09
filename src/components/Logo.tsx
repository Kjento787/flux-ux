import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const location = useLocation();
  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-4xl"
  };

  const isLandingOrProfiles = location.pathname === "/" || location.pathname === "/profiles";
  const linkTo = isLandingOrProfiles ? "/" : "/home";

  return (
    <Link to={linkTo} className={`flex items-center gap-3 group ${className}`}>
      {/* Holographic Logo Icon */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="relative w-8 h-8 md:w-10 md:h-10">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-holo-violet via-holo-cyan to-holo-magenta opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Inner shape */}
          <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-primary via-accent to-holo-cyan flex items-center justify-center overflow-hidden">
            {/* Prismatic shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* B Letter */}
            <span className="font-display font-black text-white text-sm md:text-base drop-shadow-lg">B</span>
          </div>
          
          {/* Corner accent */}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-holo-cyan rounded-full animate-pulse" />
        </div>
      </motion.div>
      
      {showText && (
        <div className={`font-display font-black tracking-[0.15em] uppercase ${sizeClasses[size]}`}>
          <motion.span 
            className="text-gradient-aurora inline-block"
            whileHover={{ scale: 1.02 }}
          >
            BLOX
          </motion.span>
          <motion.span 
            className="text-foreground inline-block ml-0.5"
            whileHover={{ scale: 1.02 }}
          >
            WAVE
          </motion.span>
        </div>
      )}
    </Link>
  );
};
