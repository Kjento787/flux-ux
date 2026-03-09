import { useState } from "react";
import { MessageCircle, X, Info, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const DiscordLinkBanner = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [discordId, setDiscordId] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const alreadyLinked = !!(profile as any)?.discord_user_id;

  if (loading || dismissed || alreadyLinked) return null;

  const handleLink = async () => {
    const trimmed = discordId.trim();
    if (!trimmed || trimmed.length < 15) {
      toast.error("Please enter a valid Discord User ID");
      return;
    }
    setSaving(true);
    await updateProfile({ discord_user_id: trimmed } as any);

    try {
      const { error } = await supabase.functions.invoke("discord-send-dm", {
        body: { discord_user_id: trimmed, display_name: profile?.display_name },
      });
      if (error) throw error;
      toast.success("Discord linked — check your DMs!");
    } catch {
      toast.info("Discord ID saved, but couldn't send a DM. Make sure you share a server with the Bloxwave bot.");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6 relative overflow-hidden rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/10 backdrop-blur-sm p-5"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5865F2]/20 flex-shrink-0">
            <MessageCircle className="h-6 w-6 text-[#5865F2]" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-bold text-sm">🔔 Get notified on Discord when your favorites release!</h3>
            <p className="text-xs text-muted-foreground">
              Link your Discord User ID to receive DM alerts for upcoming movies & shows you track.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Your Discord User ID"
              className="font-mono text-sm h-10 w-full sm:w-56"
              maxLength={20}
            />
            <Button
              onClick={handleLink}
              disabled={saving || !discordId.trim()}
              size="sm"
              className="h-10 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white flex-shrink-0"
            >
              {saving ? "Linking..." : "Link"}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-1.5 mt-3 text-[10px] text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>Discord → Settings → Advanced → Enable Developer Mode → Right-click your name → Copy User ID</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
