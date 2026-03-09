import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Tv, Film, Users, MessageCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Preferences {
  in_app_enabled: boolean;
  discord_dm_enabled: boolean;
  new_seasons: boolean;
  new_releases: boolean;
  social_activity: boolean;
}

export const NotificationPreferences = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences>({
    in_app_enabled: true,
    discord_dm_enabled: true,
    new_seasons: true,
    new_releases: true,
    social_activity: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setPrefs({
          in_app_enabled: data.in_app_enabled,
          discord_dm_enabled: data.discord_dm_enabled,
          new_seasons: data.new_seasons,
          new_releases: data.new_releases,
          social_activity: data.social_activity,
        });
      }
      return data;
    },
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...prefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Notification preferences saved!");
    },
    onError: () => toast.error("Failed to save preferences"),
  });

  const toggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!userId) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Control how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channels */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Channels</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                In-App Notifications
              </Label>
              <p className="text-xs text-muted-foreground">Show notifications in the bell icon</p>
            </div>
            <Switch checked={prefs.in_app_enabled} onCheckedChange={() => toggle("in_app_enabled")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#5865F2]" />
                Discord DMs
              </Label>
              <p className="text-xs text-muted-foreground">Receive Discord direct messages</p>
            </div>
            <Switch checked={prefs.discord_dm_enabled} onCheckedChange={() => toggle("discord_dm_enabled")} />
          </div>
        </div>

        <div className="h-px bg-border/30" />

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                New Seasons
              </Label>
              <p className="text-xs text-muted-foreground">When tracked TV shows get new seasons</p>
            </div>
            <Switch checked={prefs.new_seasons} onCheckedChange={() => toggle("new_seasons")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                New Releases
              </Label>
              <p className="text-xs text-muted-foreground">When favorited upcoming content releases</p>
            </div>
            <Switch checked={prefs.new_releases} onCheckedChange={() => toggle("new_releases")} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Social Activity
              </Label>
              <p className="text-xs text-muted-foreground">When followers review or comment</p>
            </div>
            <Switch checked={prefs.social_activity} onCheckedChange={() => toggle("social_activity")} />
          </div>
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};
