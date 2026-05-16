import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireCronSecret, requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPE_META: Record<string, { emoji: string; label: string; color: number }> = {
  publish: { emoji: "🚀", label: "New Publish", color: 0x3b82f6 },
  fix: { emoji: "🔧", label: "Bug Fix", color: 0xf59e0b },
  feature: { emoji: "✨", label: "New Feature", color: 0x22c55e },
  update: { emoji: "🔄", label: "Update", color: 0xd4a44a },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow either a cron secret (scheduler) or an authenticated admin
  const cronOk = requireCronSecret(req) === null;
  if (!cronOk) {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof Response) {
      return new Response(adminCheck.body, { status: adminCheck.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  try {
    const WEBHOOK_URL = Deno.env.get("DISCORD_CHANGELOG_WEBHOOK_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing env vars");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: pending, error } = await supabase
      .from("pending_changelogs")
      .select("*")
      .eq("is_published", false)
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ success: true, published: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let published = 0;
    for (const cl of pending) {
      const meta = TYPE_META[cl.type] || TYPE_META.update;
      const changeLines = (cl.changes || []).map((c: string) => `> • ${c}`).join("\n");

      const embed = {
        title: `${meta.emoji} ${meta.label}${cl.version ? ` — v${cl.version}` : ""}`,
        description: changeLines || "_(no details)_",
        color: meta.color,
        footer: {
          text: "FLUX-UX Changelog · Auto-published",
          icon_url: "https://flux-ux.lovable.app/favicon.ico",
        },
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Flux-UX Updates",
          avatar_url: "https://flux-ux.lovable.app/favicon.ico",
          content: `# ${meta.emoji} What's New on Flux-UX`,
          embeds: [embed],
        }),
      });

      if (res.ok) {
        await supabase
          .from("pending_changelogs")
          .update({
            is_published: true,
            published_at: new Date().toISOString(),
            site_visible: true,
          })
          .eq("id", cl.id);
        published++;
      } else {
        console.error("Discord error", await res.text());
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    return new Response(JSON.stringify({ success: true, published }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
