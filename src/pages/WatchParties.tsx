import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { searchMulti, getImageUrl } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, PartyPopper, Play, Link as LinkIcon, Film } from "lucide-react";

const WatchParties = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movieSearch, setMovieSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data: parties = [] } = useQuery({
    queryKey: ["my-watch-parties", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("watch_parties").select("*").eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["party-create-search", movieSearch],
    queryFn: async () => {
      const res = await searchMulti(movieSearch);
      return res.results?.filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 8) || [];
    },
    enabled: movieSearch.length > 2,
  });

  const createParty = useMutation({
    mutationFn: async () => {
      if (!userId || !newTitle.trim()) throw new Error("Title required");
      const { data, error } = await supabase.from("watch_parties").insert({
        host_id: userId,
        title: newTitle.trim(),
        content_id: selectedMovie?.id || 0,
        content_type: selectedMovie?.media_type || "movie",
        poster_path: selectedMovie?.poster_path || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Watch party created!");
      setDialogOpen(false);
      setNewTitle("");
      setSelectedMovie(null);
      setMovieSearch("");
      navigate(`/party/${data.id}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const joinParty = () => {
    if (!joinCode.trim()) return;
    navigate(`/party?code=${joinCode.trim()}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Watch Parties</h1>
              <p className="text-sm text-muted-foreground mt-1">Watch together with friends in real-time</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create Party
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/30 max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Watch Party</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs">Party Name</Label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Movie night with friends" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Pick a Movie or Show</Label>
                    <Input value={movieSearch} onChange={(e) => setMovieSearch(e.target.value)} placeholder="Search..." className="mt-1" />
                    {selectedMovie && (
                      <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                        {selectedMovie.poster_path && (
                          <img src={getImageUrl(selectedMovie.poster_path, "w200")} className="w-10 h-14 rounded object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{selectedMovie.title || selectedMovie.name}</p>
                          <Badge variant="outline" className="text-[10px]">{selectedMovie.media_type}</Badge>
                        </div>
                      </div>
                    )}
                    <ScrollArea className="max-h-[250px] mt-2">
                      <div className="space-y-1">
                        {searchResults.map((result: any) => (
                          <div
                            key={`${result.media_type}-${result.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-card cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedMovie(result);
                              if (!newTitle.trim()) setNewTitle(result.title || result.name || "");
                              setMovieSearch("");
                            }}
                          >
                            {result.poster_path ? (
                              <img src={getImageUrl(result.poster_path, "w200")} className="w-10 h-14 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-14 rounded bg-muted flex items-center justify-center">
                                <Film className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{result.title || result.name}</p>
                              <span className="text-xs text-muted-foreground">{(result.release_date || result.first_air_date || "").slice(0, 4)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <Button onClick={() => createParty.mutate()} disabled={!newTitle.trim() || createParty.isPending} className="w-full">
                    {createParty.isPending ? "Creating..." : "Create Party"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-border/30 bg-card/50 mb-8">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter invite code to join..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && joinParty()} />
              <Button onClick={joinParty} disabled={!joinCode.trim()} variant="outline" size="sm">Join</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party: any) => (
              <Card
                key={party.id}
                className="border-border/30 bg-card/50 hover:border-primary/20 transition-colors cursor-pointer overflow-hidden"
                onClick={() => navigate(`/party/${party.id}`)}
              >
                {party.poster_path && (
                  <div className="h-28 relative overflow-hidden">
                    <img src={getImageUrl(party.poster_path, "w500")} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{party.title}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(party.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Code: {party.invite_code}</span>
                    <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                      <Play className="h-3 w-3" /> Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {parties.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <PartyPopper className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No active parties</p>
                <p className="text-xs mt-1">Create one or join with an invite code</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default WatchParties;
