import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEBHOOK_URL = Deno.env.get("DISCORD_CHANGELOG_WEBHOOK_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { version, changes, type } = await req.json();

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      throw new Error("At least one change entry is required");
    }

    const typeEmoji: Record<string, string> = {
      publish: "🚀",
      fix: "🔧",
      feature: "✨",
      update: "🔄",
    };

    const typeLabel: Record<string, string> = {
      publish: "New Publish",
      fix: "Bug Fix",
      feature: "New Feature",
      update: "Update",
    };

    const emoji = typeEmoji[type] || "📋";
    const label = typeLabel[type] || "Changelog";

    // Build changelog lines
    const changeLines = changes.map((c: string) => `> • ${c}`).join("\n");

    const embed = {
      title: `${emoji} ${label}${version ? ` — v${version}` : ""}`,
      description: changeLines,
      color: type === "fix" ? 0xf59e0b : type === "feature" ? 0x22c55e : type === "publish" ? 0x3b82f6 : 0xd4a44a,
      footer: {
        text: "FLUX-UX Changelog",
        icon_url: "https://flux-ux.lovable.app/favicon.ico",
      },
      timestamp: new Date().toISOString(),
    };

    const payload = {
      username: "Bloxwave Updates",
      avatar_url: "https://bloxwave.lovable.app/favicon.ico",
      content: `# ${emoji} What's New on Bloxwave`,
      embeds: [embed],
    };

    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      throw new Error(`Discord API error: ${discordRes.status} - ${errText}`);
    }

    const result = await discordRes.json().catch(() => ({}));

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
