import { Link, useLocation } from "react-router-dom";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const location = useLocation();
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isLandingOrProfiles = location.pathname === "/" || location.pathname === "/profiles";
  const linkTo = isLandingOrProfiles ? "/" : "/home";

  return (
    <Link to={linkTo} className={`flex items-center gap-2 group ${className}`}>
      {showText && (
        <span className={`font-bold tracking-wide ${sizeClasses[size]}`}>
          <span className="text-primary">FLUX</span>
          <span className="text-muted-foreground">-UX</span>
        </span>
      )}
    </Link>
  );
};
