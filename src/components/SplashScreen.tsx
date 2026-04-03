import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 1800);
    const doneTimer = setTimeout(onComplete, 2400);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="relative flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="font-bold tracking-wide text-4xl md:text-5xl">
              <span className="text-primary">FLUX</span>
              <span className="text-muted-foreground">-UX</span>
            </span>
          </motion.div>

          <motion.div
            className="w-24 h-[2px] bg-border rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 1, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
