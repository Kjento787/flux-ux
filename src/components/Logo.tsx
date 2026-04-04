import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <span className={cn("font-bold tracking-wide select-none", sizeClasses[size], className)}>
      <span className="text-primary">FLUX</span>
      <span className="text-muted-foreground">-UX</span>
    </span>
  );
};
