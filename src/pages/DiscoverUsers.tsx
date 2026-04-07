import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FollowButton } from "@/components/FollowButton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";

const DiscoverUsers = () => {
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["discover-users", search],
    queryFn: async () => {
      let query = supabase
        .from("public_profiles").select("*")
        .order("created_at", { ascending: false }).limit(50);
      if (search) query = query.ilike("display_name", `%${search}%`);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: currentUserId } = useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    },
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Discover Users</h1>
            <p className="text-sm text-muted-foreground mt-1">Find people to follow and connect with</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user: any) => (
                <Card key={user.id} className="border-border/30 bg-card/50 hover:border-primary/20 transition-colors">
                  <CardContent className="flex items-center gap-3 py-3 px-4">
                    <Link to={`/user/${user.id}`}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {(user.display_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/user/${user.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {user.display_name || "Anonymous"}
                      </Link>
                      {user.bio && <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>}
                    </div>
                    {currentUserId && user.id !== currentUserId && (
                      <FollowButton targetUserId={user.id} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default DiscoverUsers;
