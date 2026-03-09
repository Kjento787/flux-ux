import { useState } from "react";
import { Send, Rocket, Wrench, Sparkles, RefreshCw, Check, Clock, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TYPE_META: Record<string, { emoji: string; label: string; icon: typeof Rocket; color: string }> = {
  publish: { emoji: "🚀", label: "Publish", icon: Rocket, color: "text-blue-400" },
  fix: { emoji: "🔧", label: "Bug Fix", icon: Wrench, color: "text-amber-400" },
  feature: { emoji: "✨", label: "Feature", icon: Sparkles, color: "text-emerald-400" },
  update: { emoji: "🔄", label: "Update", icon: RefreshCw, color: "text-primary" },
};

const EMBED_COLORS: Record<string, string> = {
  fix: "#f59e0b",
  feature: "#22c55e",
  publish: "#3b82f6",
  update: "#d4a44a",
};

interface PendingChangelog {
  id: string;
  type: string;
  version: string | null;
  changes: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  site_visible: boolean;
}

export const ChangelogPoster = () => {
  const queryClient = useQueryClient();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const { data: changelogs = [], isLoading } = useQuery({
    queryKey: ["pending-changelogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_changelogs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as PendingChangelog[];
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (changelog: PendingChangelog) => {
      setPublishingId(changelog.id);
      const { error } = await supabase.functions.invoke("discord-changelog", {
        body: {
          type: changelog.type,
          version: changelog.version || undefined,
          changes: changelog.changes,
        },
      });
      if (error) throw error;

      // Mark as published
      await supabase
        .from("pending_changelogs")
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq("id", changelog.id);
    },
    onSuccess: () => {
      toast.success("Changelog published to Discord!");
      queryClient.invalidateQueries({ queryKey: ["pending-changelogs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish");
    },
    onSettled: () => setPublishingId(null),
  });

  const sitePublishMutation = useMutation({
    mutationFn: async (changelog: PendingChangelog) => {
      const { error } = await supabase
        .from("pending_changelogs")
        .update({ site_visible: true })
        .eq("id", changelog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Changelog published to site!");
      queryClient.invalidateQueries({ queryKey: ["pending-changelogs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish to site");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pending_changelogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["pending-changelogs"] });
    },
  });

  const pending = changelogs.filter((c) => !c.is_published);
  const published = changelogs.filter((c) => c.is_published);

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">📋 Changelog Updates</CardTitle>
        <CardDescription>
          Pre-written changelogs ready to publish to Discord — just click the button
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm text-center py-6">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending changelogs</p>
            <p className="text-xs mt-1">They'll appear here automatically after updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {pending.length} pending update{pending.length !== 1 ? "s" : ""}
            </p>
            {pending.map((cl) => {
              const meta = TYPE_META[cl.type] || TYPE_META.update;
              const Icon = meta.icon;
              const isPublishing = publishingId === cl.id;

              return (
                <div
                  key={cl.id}
                  className="rounded-xl border border-border/40 bg-background/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", meta.color)} />
                      <span className="font-medium text-sm">{meta.label}</span>
                      {cl.version && (
                        <Badge variant="outline" className="text-xs">
                          v{cl.version}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteMutation.mutate(cl.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Discord Preview */}
                  <div className="bg-[#313338] p-3">
                    <div
                      className="border-l-4 rounded bg-[#2b2d31] p-2.5"
                      style={{ borderColor: EMBED_COLORS[cl.type] || EMBED_COLORS.update }}
                    >
                      <p className="text-[#00a8fc] text-xs font-semibold mb-1.5">
                        {meta.emoji} {meta.label}
                        {cl.version ? ` — v${cl.version}` : ""}
                      </p>
                      {cl.changes.map((c, i) => (
                        <p key={i} className="text-[#dcddde] text-xs leading-relaxed">
                          {">"} • {c}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Publish buttons */}
                  <div className="p-3 flex gap-2">
                    <Button
                      onClick={() => sitePublishMutation.mutate(cl)}
                      disabled={cl.site_visible || sitePublishMutation.isPending}
                      variant={cl.site_visible ? "secondary" : "outline"}
                      className="flex-1 gap-2 rounded-lg"
                      size="sm"
                    >
                      {cl.site_visible ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      {cl.site_visible ? "On Site" : "Publish to Site"}
                    </Button>
                    <Button
                      onClick={() => publishMutation.mutate(cl)}
                      disabled={isPublishing}
                      className="flex-1 gap-2 rounded-lg"
                      size="sm"
                    >
                      {isPublishing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isPublishing ? "..." : "Discord"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Published history */}
        {published.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recently Published</p>
            <div className="space-y-1.5">
              {published.slice(0, 5).map((cl) => {
                const meta = TYPE_META[cl.type] || TYPE_META.update;
                return (
                  <div key={cl.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>
                      {meta.emoji} {meta.label}
                      {cl.version ? ` v${cl.version}` : ""}
                    </span>
                    <span className="ml-auto">
                      {cl.published_at
                        ? new Date(cl.published_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
