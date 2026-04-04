import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="font-bold tracking-wide text-3xl md:text-4xl">
          <span className="text-primary">FLUX</span>
          <span className="text-muted-foreground">-UX</span>
        </span>
        <div className="w-20 h-0.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full animate-[loadBar_1s_ease-in-out_forwards]"
          />
        </div>
      </div>
      <style>{`
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
