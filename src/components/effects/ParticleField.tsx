import { useMemo } from "react";

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

const COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(240, 80%, 55%)",
  "hsl(188, 94%, 53%)",
  "hsl(300, 85%, 60%)",
  "hsl(330, 85%, 65%)",
];

export const ParticleField = ({ count = 25, className = "" }: ParticleFieldProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const color = COLORS[i % COLORS.length];
      const size = Math.random() * 3 + 1;
      return {
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: size,
          height: size,
          backgroundColor: color,
          filter: `blur(${size / 2}px)`,
          boxShadow: `0 0 ${size * 2}px ${color}`,
          animationDuration: `${Math.random() * 10 + 10}s`,
          animationDelay: `${Math.random() * 5}s`,
        } as React.CSSProperties,
      };
    });
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-float"
          style={p.style}
        />
      ))}
    </div>
  );
};

export const OrbitalRings = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10 animate-spin-slow" style={{ animationDuration: "60s" }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5 animate-spin-slow" style={{ animationDuration: "90s", animationDirection: "reverse" }} />
  </div>
);

export const AuroraBackground = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <div
      className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full opacity-30 animate-aurora-1"
      style={{ background: "radial-gradient(ellipse at center, hsl(262 83% 58% / 0.4), transparent 70%)", filter: "blur(60px)" }}
    />
    <div
      className="absolute -top-[20%] -right-[30%] w-[70%] h-[70%] rounded-full opacity-25 animate-aurora-2"
      style={{ background: "radial-gradient(ellipse at center, hsl(188 94% 53% / 0.3), transparent 70%)", filter: "blur(80px)" }}
    />
  </div>
);

export const GridPattern = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute inset-0 pointer-events-none opacity-[0.03] ${className}`}
    style={{
      backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
    }}
  />
);

export const Scanlines = ({ className = "" }: { className?: string }) => (
  <div
    className={`absolute inset-0 pointer-events-none opacity-[0.02] ${className}`}
    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.1) 2px, hsl(var(--foreground) / 0.1) 4px)" }}
  />
);
