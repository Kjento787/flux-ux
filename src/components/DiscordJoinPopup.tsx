import { useState, useEffect } from "react";
import { X, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "discord-join-popup-dismissed";

export const DiscordJoinPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl border border-[#5865F2]/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-[#5865F2]/10 overflow-hidden"
        >
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#5865F2] via-[#7289DA] to-[#5865F2]" />

          <div className="p-5 relative">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#5865F2]/15">
                <MessageCircle className="h-5 w-5 text-[#5865F2]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Join our Discord!</h3>
                <p className="text-xs text-muted-foreground">Stay updated & chat with the community</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Get early access to new features, report bugs, suggest ideas, and hang out with other Flux-UX users.
            </p>

            <div className="flex gap-2">
              <Button
                asChild
                size="sm"
                className="flex-1 h-9 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs"
              >
                <a href="https://discord.gg/RfmekVnTUN" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Join Discord
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
                className="h-9 text-xs text-muted-foreground"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
