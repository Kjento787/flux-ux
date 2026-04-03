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
    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DISCORD_WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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

    const body = await req.json();
    const {
      type,
      title,
      message,
      color,
      imageUrl,
      thumbnailUrl,
      rating,
      fields,
      threadName,
      pingEveryone,
    } = body;

    // Build embed
    const embedColor = color ? parseInt(color.replace("#", ""), 16) : 0xd4a44a;

    const embedFields: Array<{ name: string; value: string; inline: boolean }> = [];

    if (rating !== undefined && rating !== null && rating !== "") {
      const ratingNum = parseFloat(rating);
      const ratingBar = "█".repeat(Math.round(ratingNum)) + "░".repeat(10 - Math.round(ratingNum));
      embedFields.push({
        name: "Rating",
        value: `\`${ratingBar}\` **${ratingNum.toFixed(1)}**/10`,
        inline: false,
      });
    }

    if (fields && Array.isArray(fields)) {
      for (const field of fields) {
        if (field.name && field.value) {
          embedFields.push({
            name: field.name,
            value: field.value,
            inline: field.inline ?? true,
          });
        }
      }
    }

    const embed: Record<string, unknown> = {
      title: title || undefined,
      description: message || undefined,
      color: embedColor,
      footer: {
        text: "FLUX-UX · Admin",
        icon_url: "https://flux-ux.lovable.app/favicon.ico",
      },
      timestamp: new Date().toISOString(),
    };

    if (imageUrl) embed.image = { url: imageUrl };
    if (thumbnailUrl) embed.thumbnail = { url: thumbnailUrl };
    if (embedFields.length > 0) embed.fields = embedFields;

    // Determine content prefix based on type
    const typeLabels: Record<string, string> = {
      announcement: "📢 Announcement",
      update: "🔄 Update",
      event: "🎉 Event",
      alert: "⚠️ Alert",
      review: "⭐ Featured Review",
      custom: "💬 Message",
    };

    const prefix = typeLabels[type] || typeLabels.custom;
    const contentText = pingEveryone
      ? `@everyone\n# ${prefix}\n${title ? `**${title}**` : ""}`
      : `# ${prefix}\n${title ? `**${title}**` : ""}`;

    const payload: Record<string, unknown> = {
      username: "Flux-UX",
      avatar_url: "https://flux-ux.lovable.app/favicon.ico",
      content: contentText.trim(),
      embeds: [embed],
    };

    // If threadName is provided, create in a thread
    let webhookUrl = DISCORD_WEBHOOK_URL;
    if (threadName) {
      // First send creates the thread
      webhookUrl += "?wait=true";
    }

    const discordRes = await fetch(webhookUrl, {
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
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
