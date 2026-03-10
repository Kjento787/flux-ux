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
    const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DISCORD_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const { user_id, title, content_type, release_date, poster_path } = await req.json();
    if (!user_id || !title) throw new Error("Missing user_id or title");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's discord_user_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("discord_user_id, display_name")
      .eq("id", user_id)
      .single();

    if (!profile?.discord_user_id) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_discord_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create DM channel
    const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: profile.discord_user_id }),
    });

    if (!dmChannelRes.ok) {
      const err = await dmChannelRes.text();
      throw new Error(`Failed to create DM channel: ${err}`);
    }

    const dmChannel = await dmChannelRes.json();

    const isTV = content_type === "tv";
    const emoji = isTV ? "📺" : "🎬";
    const releaseStr = release_date
      ? new Date(release_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "TBA";

    const posterUrl = poster_path
      ? `https://image.tmdb.org/t/p/w500${poster_path}`
      : null;

    const embed = {
      title: `${emoji} Tracking: ${title}`,
      description: [
        `Hey **${profile.display_name || "there"}**! You're now tracking **${title}**.`,
        "",
        `We'll send you a DM the moment it drops${release_date ? ` (expected **${releaseStr}**)` : ""}.`,
        "",
        "Sit tight — we've got you covered! 🍿",
      ].join("\n"),
      color: isTV ? 0x7c3aed : 0xd4a44a,
      thumbnail: posterUrl ? { url: posterUrl } : undefined,
      fields: [
        { name: "Type", value: isTV ? "TV Series" : "Movie", inline: true },
        { name: "Release", value: releaseStr, inline: true },
      ],
      footer: {
        text: "FLUX-UX · Notify Me",
        icon_url: "https://flux-ux.lovable.app/favicon.ico",
      },
      timestamp: new Date().toISOString(),
    };

    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!msgRes.ok) {
      const err = await msgRes.text();
      throw new Error(`Failed to send DM: ${err}`);
    }

    await msgRes.text();

    return new Response(
      JSON.stringify({ success: true }),
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
