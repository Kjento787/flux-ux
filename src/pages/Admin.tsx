import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { ChangelogPoster } from "@/components/admin/ChangelogPoster";
import { DiscordMessenger } from "@/components/admin/DiscordMessenger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Shield, Users, Ban, MessageSquare, Star, Film, Activity,
  Search, Trash2, Eye, UserX, Clock, Globe, PartyPopper,
  AlertTriangle, Check, X, Crown, Send, Sparkles, Plus, Code,
} from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banPermanent, setBanPermanent] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [ipBanAddress, setIpBanAddress] = useState("");
  const [ipBanReason, setIpBanReason] = useState("");
  const [newChangelogType, setNewChangelogType] = useState("update");
  const [newChangelogVersion, setNewChangelogVersion] = useState("");
  const [newChangelogChanges, setNewChangelogChanges] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setCurrentUserEmail(session.user.email || "");
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) { navigate("/home"); toast.error("Access denied"); return; }
      setIsAdmin(true);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  // Users query
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users", userSearch],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      if (userSearch) query = query.ilike("display_name", `%${userSearch}%`);
      const { data } = await query;
      return data || [];
    },
    enabled: isAdmin,
  });

  // User roles
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
    enabled: isAdmin,
  });

  // User bans
  const { data: bans = [] } = useQuery({
    queryKey: ["admin-bans"],
    queryFn: async () => {
      const { data } = await supabase.from("user_bans").select("*").order("banned_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  // IP bans
  const { data: ipBans = [] } = useQuery({
    queryKey: ["admin-ip-bans"],
    queryFn: async () => {
      const { data } = await supabase.from("ip_bans").select("*").order("banned_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAdmin,
  });

  // Comments
  const { data: comments = [] } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAdmin,
  });

  // Content reports
  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("content_reports").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAdmin,
  });

  // Featured content
  const { data: featured = [] } = useQuery({
    queryKey: ["admin-featured"],
    queryFn: async () => {
      const { data } = await supabase.from("featured_content").select("*").order("priority", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  // Watch parties
  const { data: parties = [] } = useQuery({
    queryKey: ["admin-parties"],
    queryFn: async () => {
      const { data } = await supabase.from("watch_parties").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  // Activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAdmin,
  });

  // User statistics
  const { data: allStats = [] } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("user_statistics").select("*").order("total_watch_time", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: isAdmin,
  });

  // Ban user mutation
  const banUser = useMutation({
    mutationFn: async () => {
      if (!banUserId || !banReason) throw new Error("User ID and reason required");
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("user_bans").insert({
        user_id: banUserId,
        reason: banReason,
        is_permanent: banPermanent,
        banned_by: session?.user?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User banned");
      setBanDialogOpen(false);
      setBanUserId("");
      setBanReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-bans"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Remove ban
  const removeBan = useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase.from("user_bans").delete().eq("id", banId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ban removed");
      queryClient.invalidateQueries({ queryKey: ["admin-bans"] });
    },
  });

  // IP Ban mutation
  const banIP = useMutation({
    mutationFn: async () => {
      if (!ipBanAddress || !ipBanReason) throw new Error("IP and reason required");
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("ip_bans").insert({
        ip_address: ipBanAddress,
        reason: ipBanReason,
        is_permanent: true,
        banned_by: session?.user?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP banned");
      setIpBanAddress("");
      setIpBanReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-ip-bans"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Remove IP ban
  const removeIpBan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_bans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP ban removed");
      queryClient.invalidateQueries({ queryKey: ["admin-ip-bans"] });
    },
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
  });

  // Delete review
  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  // Set role
  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Remove existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
      if (role !== "none") {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: role as any,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // End watch party
  const endParty = useMutation({
    mutationFn: async (partyId: string) => {
      const { error } = await supabase.from("watch_parties").update({ is_active: false, ended_at: new Date().toISOString() }).eq("id", partyId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Party ended");
      queryClient.invalidateQueries({ queryKey: ["admin-parties"] });
    },
  });

  // Resolve report
  const resolveReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("content_reports").update({
        status,
        reviewed_by: session?.user?.id || null,
        reviewed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  // Delete featured
  const deleteFeatured = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("featured_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Featured content removed");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
  });

  // Create changelog entry
  const createChangelog = useMutation({
    mutationFn: async () => {
      const changes = newChangelogChanges.split("\n").map(c => c.trim()).filter(Boolean);
      if (changes.length === 0) throw new Error("Add at least one change");
      const { error } = await supabase.from("pending_changelogs").insert({
        type: newChangelogType,
        version: newChangelogVersion || null,
        changes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Changelog entry created!");
      setNewChangelogChanges("");
      setNewChangelogVersion("");
      queryClient.invalidateQueries({ queryKey: ["pending-changelogs"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const isDev = currentUserEmail === "kjento.mertens@gmail.com";

  const { data: userIPs = [] } = useQuery({
    queryKey: ["dev-user-ips"],
    queryFn: async () => {
      const { data: banData } = await supabase
        .from("user_bans")
        .select("user_id, ip_address, banned_at")
        .not("ip_address", "is", null)
        .order("banned_at", { ascending: false });
      const { data: profileData } = await supabase.from("profiles").select("id, display_name, email").limit(200);
      const profileMap = new Map((profileData || []).map((p: any) => [p.id, p]));
      const seen = new Set<string>();
      const results: any[] = [];
      for (const ban of (banData || [])) {
        const key = `${ban.user_id}-${ban.ip_address}`;
        if (!seen.has(key)) {
          seen.add(key);
          const profile = profileMap.get(ban.user_id);
          results.push({
            user_id: ban.user_id,
            ip_address: ban.ip_address,
            display_name: profile?.display_name || "Unknown",
            email: profile?.email || "—",
          });
        }
      }
      return results;
    },
    enabled: isAdmin && isDev,
  });

  const getUserRole = (userId: string) => {
    const role = roles.find((r: any) => r.user_id === userId);
    return role?.role || "user";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Admin Panel</h1>
              <p className="text-muted-foreground">Manage users, content, and platform settings</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Users", value: users.length, icon: Users },
              { label: "Active Bans", value: bans.length, icon: Ban },
              { label: "Reports", value: reports.filter((r: any) => r.status === "pending").length, icon: AlertTriangle },
              { label: "Active Parties", value: parties.length, icon: PartyPopper },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/30 bg-card/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30 flex-wrap h-auto p-1">
              <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" /> Users</TabsTrigger>
              <TabsTrigger value="bans" className="gap-1.5"><Ban className="h-4 w-4" /> Bans</TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Content</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5"><AlertTriangle className="h-4 w-4" /> Reports</TabsTrigger>
              <TabsTrigger value="featured" className="gap-1.5"><Star className="h-4 w-4" /> Featured</TabsTrigger>
              <TabsTrigger value="parties" className="gap-1.5"><PartyPopper className="h-4 w-4" /> Parties</TabsTrigger>
              <TabsTrigger value="discord" className="gap-1.5"><Send className="h-4 w-4" /> Discord</TabsTrigger>
              <TabsTrigger value="changelog" className="gap-1.5"><Globe className="h-4 w-4" /> Changelog</TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
              {isDev && <TabsTrigger value="dev" className="gap-1.5"><Code className="h-4 w-4" /> Dev</TabsTrigger>}
            </TabsList>

            {/* USERS TAB */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Search users by name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2"><Ban className="h-4 w-4" /> Ban User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Ban User</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>User ID</Label>
                        <Input value={banUserId} onChange={(e) => setBanUserId(e.target.value)} placeholder="Enter user ID" className="mt-1" />
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for ban" className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={banPermanent} onCheckedChange={setBanPermanent} />
                        <Label>Permanent ban</Label>
                      </div>
                      <Button onClick={() => banUser.mutate()} disabled={banUser.isPending} className="w-full">
                        {banUser.isPending ? "Banning..." : "Ban User"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-xl border border-border/30 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {(user.display_name || "U")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{user.display_name || "Anonymous"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={getUserRole(user.id)}
                            onValueChange={(role) => setRole.mutate({ userId: user.id, role })}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8"
                            onClick={() => {
                              setBanUserId(user.id);
                              setBanDialogOpen(true);
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* BANS TAB */}
            <TabsContent value="bans" className="space-y-6">
              {/* User Bans */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">User Bans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bans.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No active bans</p>
                  ) : bans.map((ban: any) => (
                    <div key={ban.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/20">
                      <div>
                        <p className="font-medium text-sm">{ban.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">{ban.reason}</p>
                        <div className="flex gap-2 mt-1">
                          {ban.is_permanent && <Badge variant="destructive" className="text-[10px]">Permanent</Badge>}
                          <span className="text-[10px] text-muted-foreground">{new Date(ban.banned_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeBan.mutate(ban.id)} className="text-emerald-400">
                        <Check className="h-4 w-4" /> Unban
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* IP Bans */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">IP Bans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="IP Address" value={ipBanAddress} onChange={(e) => setIpBanAddress(e.target.value)} className="flex-1" />
                    <Input placeholder="Reason" value={ipBanReason} onChange={(e) => setIpBanReason(e.target.value)} className="flex-1" />
                    <Button onClick={() => banIP.mutate()} disabled={banIP.isPending}>Ban IP</Button>
                  </div>
                  {ipBans.map((ban: any) => (
                    <div key={ban.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/20">
                      <div>
                        <p className="font-mono text-sm">{ban.ip_address}</p>
                        <p className="text-xs text-muted-foreground">{ban.reason}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeIpBan.mutate(ban.id)} className="text-emerald-400">
                        Remove
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CONTENT TAB */}
            <TabsContent value="content" className="space-y-6">
              {/* Comments */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Recent Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {comments.map((c: any) => (
                    <div key={c.id} className="flex items-start justify-between p-3 rounded-xl bg-background/50 border border-border/20">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{c.comment_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c.content_type} #{c.content_id} • {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteComment.mutate(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5" /> Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="flex items-start justify-between p-3 rounded-xl bg-background/50 border border-border/20">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{r.rating}/10</Badge>
                          <span className="text-xs text-muted-foreground">{r.content_type} #{r.content_id}</span>
                        </div>
                        {r.review_text && <p className="text-sm mt-1 line-clamp-2">{r.review_text}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteReview.mutate(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports" className="space-y-2">
              {reports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No content reports</p>
                </div>
              ) : reports.map((r: any) => (
                <Card key={r.id} className="border-border/30 bg-card/50">
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.status === "pending" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                        <span className="text-xs text-muted-foreground">{r.content_type}</span>
                      </div>
                      <p className="font-medium text-sm">{r.reason}</p>
                      {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-emerald-400 h-8" onClick={() => resolveReport.mutate({ id: r.id, status: "resolved" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => resolveReport.mutate({ id: r.id, status: "dismissed" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* FEATURED TAB */}
            <TabsContent value="featured" className="space-y-2">
              {featured.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No featured content</p>
                </div>
              ) : featured.map((f: any) => (
                <Card key={f.id} className="border-border/30 bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Film className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.content_type} #{f.content_id} • Priority: {f.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.is_active ? "default" : "secondary"}>{f.is_active ? "Active" : "Inactive"}</Badge>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteFeatured.mutate(f.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* PARTIES TAB */}
            <TabsContent value="parties" className="space-y-2">
              {parties.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <PartyPopper className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No active watch parties</p>
                </div>
              ) : parties.map((p: any) => (
                <Card key={p.id} className="border-border/30 bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground">Code: {p.invite_code} • {new Date(p.created_at).toLocaleString()}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => endParty.mutate(p.id)}>
                      End Party
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* DISCORD TAB */}
            <TabsContent value="discord">
              <DiscordMessenger />
            </TabsContent>

            {/* CHANGELOG TAB */}
            <TabsContent value="changelog" className="space-y-6">
              {/* Create New Changelog */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5" /> Create Changelog Entry</CardTitle>
                  <CardDescription>Generate a new changelog entry for Discord publishing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select value={newChangelogType} onValueChange={setNewChangelogType}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publish">🚀 Publish</SelectItem>
                          <SelectItem value="feature">✨ Feature</SelectItem>
                          <SelectItem value="fix">🔧 Bug Fix</SelectItem>
                          <SelectItem value="update">🔄 Update</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Version (optional)</Label>
                      <Input value={newChangelogVersion} onChange={(e) => setNewChangelogVersion(e.target.value)} placeholder="e.g. 3.7.0" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Changes (one per line)</Label>
                    <Textarea
                      value={newChangelogChanges}
                      onChange={(e) => setNewChangelogChanges(e.target.value)}
                      placeholder={"Added new feature X\nFixed bug with Y\nImproved performance of Z"}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <Button onClick={() => createChangelog.mutate()} disabled={createChangelog.isPending} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    {createChangelog.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </CardContent>
              </Card>
              <ChangelogPoster />
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="space-y-4">
              {/* User Stats */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Top Users by Watch Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allStats.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                        <span className="text-sm font-mono">{s.user_id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{s.movies_watched || 0} movies</span>
                        <span>{s.tv_shows_watched || 0} shows</span>
                        <span>{Math.floor((s.total_watch_time || 0) / 60)}h watched</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Activity Logs */}
              <Card className="border-border/30 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Admin;
