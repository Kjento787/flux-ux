import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X, Baby } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface ViewerProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  is_kids: boolean;
}

const AVATAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(270, 60%, 55%)",
  "hsl(340, 65%, 55%)",
];

const ProfileSelect = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ViewerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [isKids, setIsKids] = useState(false);

  useEffect(() => { checkAuthAndLoad(); }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { navigate("/"); return; }
    await loadProfiles(session.user.id);
  };

  const loadProfiles = async (userId: string) => {
    const { data, error } = await supabase.from("viewer_profiles").select("*").eq("user_id", userId).order("created_at");
    if (error) { toast.error("Failed to load profiles"); return; }
    if (!data || data.length === 0) {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
      const { data: newProfile, error: createError } = await supabase
        .from("viewer_profiles").insert({ user_id: userId, name: profile?.display_name || "User", is_kids: false }).select().single();
      if (!createError && newProfile) setProfiles([newProfile]);
    } else {
      setProfiles(data);
    }
    setLoading(false);
  };

  const selectProfile = (profile: ViewerProfile) => {
    if (editing) return;
    localStorage.setItem("activeViewerProfile", JSON.stringify(profile));
    navigate("/home");
  };

  const addProfile = async () => {
    if (!newName.trim()) return;
    if (profiles.length >= 5) { toast.error("Maximum 5 profiles allowed"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from("viewer_profiles").insert({ user_id: session.user.id, name: newName.trim(), is_kids: isKids }).select().single();
    if (error) { toast.error("Failed to create profile"); return; }
    setProfiles([...profiles, data]);
    setNewName(""); setIsKids(false); setAddingNew(false);
    toast.success("Profile created!");
  };

  const deleteProfile = async (id: string) => {
    if (profiles.length <= 1) { toast.error("You must have at least one profile"); return; }
    const { error } = await supabase.from("viewer_profiles").delete().eq("id", id);
    if (error) { toast.error("Failed to delete profile"); return; }
    setProfiles(profiles.filter(p => p.id !== id));
    toast.success("Profile deleted");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("activeViewerProfile");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="absolute top-6 left-6"><Logo size="sm" /></div>
        <button
          onClick={handleSignOut}
          className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Who's Watching?</h1>
          <p className="text-muted-foreground text-sm mb-12">Select a profile to get started</p>

          {/* Profiles Grid */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-10 mb-10">
            <AnimatePresence>
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  onClick={() => selectProfile(profile)}
                >
                  <div className="relative">
                    <div
                      className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold transition-all duration-300 group-hover:scale-105 border-2"
                      style={{
                        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] + "15",
                        borderColor: AVATAR_COLORS[index % AVATAR_COLORS.length] + "40",
                      }}
                    >
                      <span style={{ color: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {profile.is_kids ? "🧒" : profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {editing && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {profile.name}
                  </span>
                  {profile.is_kids && (
                    <span className="text-xs text-primary font-semibold -mt-2">KIDS</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Profile */}
            {profiles.length < 5 && !addingNew && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => setAddingNew(true)}
              >
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-2 border-dashed border-border flex items-center justify-center transition-all group-hover:border-primary/50 group-hover:scale-105">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                  Add Profile
                </span>
              </motion.div>
            )}
          </div>

          {/* Add Profile Form */}
          <AnimatePresence>
            {addingNew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 max-w-sm mx-auto"
              >
                <div className="rounded-xl p-6 space-y-4 bg-card/50 border border-border/30">
                  <Input
                    placeholder="Profile name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-11"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && addProfile()}
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setIsKids(!isKids)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isKids ? "bg-primary border-primary" : "border-border"}`}
                    >
                      {isKids && <Check className="h-3 w-3 text-primary-foreground" />}
                    </button>
                    <span className="text-sm flex items-center gap-1.5">
                      <Baby className="h-4 w-4" /> Kids Profile
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={addProfile} className="flex-1">
                      Create
                    </Button>
                    <Button variant="ghost" onClick={() => { setAddingNew(false); setNewName(""); setIsKids(false); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setEditing(!editing)}
              className="border-border/30"
            >
              {editing ? (
                <><Check className="h-4 w-4 mr-2" /> Done</>
              ) : (
                <><Pencil className="h-4 w-4 mr-2" /> Manage Profiles</>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ProfileSelect;
