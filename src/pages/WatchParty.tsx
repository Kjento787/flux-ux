import { useState, useEffect, useRef } from "react";
import { getEmbedUrl, EMBED_SERVERS, searchMulti, getImageUrl } from "@/lib/tmdb";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Users, Send, Play, Crown, LogOut, MessageSquare,
  Link as LinkIcon, PartyPopper, Sparkles, Search, Server, Film,
} from "lucide-react";

const REACTIONS = ["🎬", "😂", "😱", "🔥", "❤️", "👏", "😮", "💀"];

interface PartyMessage {
  id: string;
  party_id: string;
  user_id: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  is_active: boolean;
  joined_at: string;
}

const WatchParty = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inviteCode = searchParams.get("code");
  const [selectedServer, setSelectedServer] = useState("vidsrcxyz");
  const [movieSearch, setMovieSearch] = useState("");
  const [movieSearchOpen, setMovieSearchOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data: party, isLoading } = useQuery({
    queryKey: ["watch-party", id, inviteCode],
    queryFn: async () => {
      if (id) {
        const { data, error } = await supabase.from("watch_parties").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
      }
      if (inviteCode) {
        const { data, error } = await supabase.from("watch_parties").select("*").eq("invite_code", inviteCode).eq("is_active", true).single();
        if (error) throw error;
        return data;
      }
      return null;
    },
    enabled: !!(id || inviteCode),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["party-participants", party?.id],
    queryFn: async () => {
      const { data } = await supabase.from("watch_party_participants").select("*").eq("party_id", party!.id).eq("is_active", true);
      return (data || []) as Participant[];
    },
    enabled: !!party?.id,
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["party-messages", party?.id],
    queryFn: async () => {
      const { data } = await supabase.from("watch_party_messages").select("*").eq("party_id", party!.id).order("created_at", { ascending: true }).limit(200);
      return (data || []) as PartyMessage[];
    },
    enabled: !!party?.id,
    refetchInterval: 3000,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["party-movie-search", movieSearch],
    queryFn: async () => {
      const res = await searchMulti(movieSearch);
      return res.results?.filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 8) || [];
    },
    enabled: movieSearch.length > 2,
  });

  const isHost = party?.host_id === userId;

  const changeContentMutation = useMutation({
    mutationFn: async ({ contentId, contentType, title, posterPath }: { contentId: number; contentType: string; title: string; posterPath: string | null }) => {
      const { error } = await supabase.from("watch_parties").update({
        content_id: contentId,
        content_type: contentType,
        title: title,
        poster_path: posterPath,
      }).eq("id", party!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-party", id, inviteCode] });
      toast.success("Now playing updated!");
      setMovieSearchOpen(false);
      setMovieSearch("");
    },
  });

  useEffect(() => {
    const userIds = [...new Set([...(participants.map(p => p.user_id)), ...(messages.map(m => m.user_id))])];
    const missing = userIds.filter(uid => !displayNames[uid]);
    if (missing.length > 0) {
      supabase.from("public_profiles").select("id, display_name").in("id", missing).then(({ data }) => {
        if (data) {
          const names: Record<string, string> = {};
          data.forEach(p => { if (p.id) names[p.id] = p.display_name || "User"; });
          setDisplayNames(prev => ({ ...prev, ...names }));
        }
      });
    }
  }, [participants, messages]);

  useEffect(() => {
    if (!party?.id) return;
    const channel = supabase
      .channel(`party-${party.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "watch_party_messages", filter: `party_id=eq.${party.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["party-messages", party.id] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_party_participants", filter: `party_id=eq.${party.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["party-participants", party.id] })
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "watch_parties", filter: `id=eq.${party.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["watch-party", id, inviteCode] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [party?.id, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!party?.id || !userId) return;
    supabase.from("watch_party_participants")
      .upsert({ party_id: party.id, user_id: userId, is_active: true }, { onConflict: "party_id,user_id" })
      .then(() => queryClient.invalidateQueries({ queryKey: ["party-participants", party.id] }));

    return () => {
      supabase.from("watch_party_participants")
        .update({ is_active: false })
        .eq("party_id", party.id)
        .eq("user_id", userId)
        .then(() => {});
    };
  }, [party?.id, userId]);

  const leaveParty = async () => {
    if (!party?.id || !userId) return;
    await supabase.from("watch_party_participants")
      .update({ is_active: false })
      .eq("party_id", party.id)
      .eq("user_id", userId);
    toast.success("You left the party");
    navigate("/parties");
  };

  const sendMessage = async () => {
    if (!message.trim() || !party?.id || !userId) return;
    await supabase.from("watch_party_messages").insert({
      party_id: party.id, user_id: userId, message: message.trim(), message_type: "text",
    });
    setMessage("");
  };

  const sendReaction = async (emoji: string) => {
    if (!party?.id || !userId) return;
    await supabase.from("watch_party_messages").insert({
      party_id: party.id, user_id: userId, message: emoji, message_type: "reaction",
    });
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/#/party?code=${party?.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!party) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 pt-24 pb-12 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Party Not Found</h1>
              <p className="text-muted-foreground mb-6">This watch party may have ended or doesn't exist.</p>
              <Button onClick={() => navigate("/home")}>Go Home</Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <PartyPopper className="h-6 w-6 text-primary" />
                    {party.title}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isHost ? "You're the host" : "Watching together"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={copyInviteLink} className="gap-1.5 border-border/30">
                    <LinkIcon className="h-4 w-4" /> Invite
                  </Button>
                  {isHost && (
                    <Dialog open={movieSearchOpen} onOpenChange={setMovieSearchOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 border-border/30">
                          <Search className="h-4 w-4" /> Change Movie
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border/30 max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Search Movie or TV Show</DialogTitle>
                        </DialogHeader>
                        <Input
                          value={movieSearch}
                          onChange={(e) => setMovieSearch(e.target.value)}
                          placeholder="Search for a movie or TV show..."
                          className="border-border/30"
                        />
                        <ScrollArea className="max-h-[400px]">
                          <div className="space-y-2">
                            {searchResults.map((result: any) => (
                              <div
                                key={`${result.media_type}-${result.id}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-card cursor-pointer transition-colors border border-transparent hover:border-border/30"
                                onClick={() => changeContentMutation.mutate({
                                  contentId: result.id,
                                  contentType: result.media_type || "movie",
                                  title: result.title || result.name || "Unknown",
                                  posterPath: result.poster_path,
                                })}
                              >
                                {result.poster_path ? (
                                  <img src={getImageUrl(result.poster_path, "w200")} className="w-12 h-16 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-16 rounded-lg bg-surface-2 flex items-center justify-center">
                                    <Film className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{result.title || result.name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">{result.media_type}</Badge>
                                    <span className="text-xs text-muted-foreground">{(result.release_date || result.first_air_date || "").slice(0, 4)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {movieSearch.length > 2 && searchResults.length === 0 && (
                              <p className="text-center text-muted-foreground py-4 text-sm">No results found</p>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="outline" size="sm" onClick={leaveParty} className="gap-1.5 border-border/30 text-destructive">
                    <LogOut className="h-4 w-4" /> Leave
                  </Button>
                  {isHost && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Crown className="h-3 w-3 mr-1" /> Host
                    </Badge>
                  )}
                </div>
              </div>

              {/* Server Selector */}
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="w-[220px] h-8 text-xs border-border/30">
                    <SelectValue placeholder="Select server" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMBED_SERVERS.map((server) => (
                      <SelectItem key={server.id} value={server.id} className="text-xs">
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Users className="h-3 w-3" /> {participants.length} watching
                </Badge>
              </div>

              {/* Video Player */}
              {party.content_id > 0 ? (
                <div className="aspect-video rounded-lg overflow-hidden border border-border/30">
                  <iframe
                    key={`${party.content_id}-${party.content_type}-${selectedServer}`}
                    src={getEmbedUrl(party.content_id, party.content_type as "movie" | "tv", undefined, undefined, selectedServer)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-card/50 border border-border/30 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Film className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">No movie selected yet</p>
                    {isHost && (
                      <Button size="sm" variant="outline" onClick={() => setMovieSearchOpen(true)}>
                        <Search className="h-4 w-4 mr-1" /> Pick a Movie
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Participants */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/30">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {(displayNames[p.user_id] || "U")[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{displayNames[p.user_id] || "User"}</span>
                        {p.user_id === party.host_id && <Crown className="h-3 w-3 text-primary" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-border/30 bg-card/50 h-[600px] flex flex-col">
                <CardHeader className="py-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Live Chat
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "rounded-xl p-2",
                          msg.message_type === "reaction" ? "text-center text-2xl" : "bg-card border border-border/20"
                        )}
                      >
                        {msg.message_type !== "reaction" && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-semibold text-primary">
                              {displayNames[msg.user_id] || "User"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <p className={cn("text-sm", msg.message_type === "reaction" && "text-2xl")}>
                          {msg.message}
                        </p>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Reactions */}
                <div className="px-3 py-2 border-t border-border/30">
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1 hover:bg-primary/10 rounded-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Say something..."
                       className="flex-1 h-9 text-sm border-border/30"
                    />
                    <Button size="sm" onClick={sendMessage} disabled={!message.trim()} className="h-9">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default WatchParty;
