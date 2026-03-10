import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Wrench, Sparkles, RefreshCw, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TYPE_META: Record<string, { emoji: string; label: string; icon: typeof Rocket; color: string }> = {
  publish: { emoji: "🚀", label: "Publish", icon: Rocket, color: "text-blue-400" },
  fix: { emoji: "🔧", label: "Bug Fix", icon: Wrench, color: "text-amber-400" },
  feature: { emoji: "✨", label: "Feature", icon: Sparkles, color: "text-emerald-400" },
  update: { emoji: "🔄", label: "Update", icon: RefreshCw, color: "text-primary" },
};

const Changelog = () => {
  const { data: changelogs = [], isLoading } = useQuery({
    queryKey: ["site-changelogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_changelogs")
        .select("*")
        .eq("site_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10">
              <ScrollText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Changelog</h1>
              <p className="text-muted-foreground">Latest updates and improvements to Flux-UX</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : changelogs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No changelog entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {changelogs.map((cl: any, i: number) => {
                const meta = TYPE_META[cl.type] || TYPE_META.update;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={cl.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-border/30 bg-card/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={cn("h-4 w-4", meta.color)} />
                          <span className="font-semibold text-sm">{meta.label}</span>
                          {cl.version && <Badge variant="outline" className="text-xs">v{cl.version}</Badge>}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {new Date(cl.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {(cl.changes || []).map((change: string, j: number) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Changelog;
