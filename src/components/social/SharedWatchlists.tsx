import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users, Lock, Globe, Trash2, Copy, Share2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/tmdb";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface SharedWatchlist {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
}

interface SharedWatchlistItem {
  id: string;
  content_id: number;
  content_type: string;
  title: string;
  poster_path: string | null;
  added_by: string;
}

export const SharedWatchlists = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListPublic, setNewListPublic] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: watchlists = [], isLoading } = useQuery({
    queryKey: ["shared-watchlists", userId],
    queryFn: async () => {
      if (!userId) return [];
      // Get watchlists user created or is a member of
      const { data: owned } = await supabase
        .from("shared_watchlists")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      const { data: memberOf } = await supabase
        .from("shared_watchlist_members")
        .select("watchlist_id")
        .eq("user_id", userId);

      const memberIds = (memberOf || []).map((m: any) => m.watchlist_id);
      let memberLists: any[] = [];
      if (memberIds.length > 0) {
        const { data } = await supabase
          .from("shared_watchlists")
          .select("*")
          .in("id", memberIds);
        memberLists = data || [];
      }

      const all = [...(owned || []), ...memberLists];
      const unique = Array.from(new Map(all.map((w) => [w.id, w])).values());
      return unique as SharedWatchlist[];
    },
    enabled: !!userId,
  });

  const createList = useMutation({
    mutationFn: async () => {
      if (!userId || !newListName.trim()) throw new Error("Name required");
      const { data, error } = await supabase
        .from("shared_watchlists")
        .insert({ name: newListName.trim(), created_by: userId, is_public: newListPublic })
        .select()
        .single();
      if (error) throw error;
      // Add creator as owner member
      await supabase.from("shared_watchlist_members").insert({
        watchlist_id: data.id,
        user_id: userId,
        role: "owner",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-watchlists"] });
      toast.success("List created!");
      setNewListName("");
      setCreateOpen(false);
    },
    onError: () => toast.error("Failed to create list"),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shared_watchlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-watchlists"] });
      toast.success("List deleted");
    },
  });

  const copyInviteLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#/shared-list/${id}`);
    toast.success("Invite link copied!");
  };

  if (!userId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold font-display">Shared Lists</h2>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader>
              <DialogTitle>Create Shared List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>List Name</Label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Movie Night Picks"
                  maxLength={50}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public List
                </Label>
                <Switch checked={newListPublic} onCheckedChange={setNewListPublic} />
              </div>
              <Button onClick={() => createList.mutate()} disabled={!newListName.trim()} className="w-full">
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 rounded-xl bg-card/60" />
          ))}
        </div>
      ) : watchlists.length === 0 ? (
        <Card className="bg-card/60 border-border/30">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No shared lists yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create a list and invite friends to collaborate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {watchlists.map((list, i) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-card/60 border-border/30 hover:border-primary/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Film className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{list.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px]">
                            {list.is_public ? <Globe className="h-2.5 w-2.5 mr-1" /> : <Lock className="h-2.5 w-2.5 mr-1" />}
                            {list.is_public ? "Public" : "Private"}
                          </Badge>
                          {list.created_by === userId && (
                            <Badge variant="secondary" className="text-[9px]">Owner</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyInviteLink(list.id)}>
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      {list.created_by === userId && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteList.mutate(list.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
