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
    if (!DISCORD_BOT_TOKEN) throw new Error("Missing DISCORD_BOT_TOKEN");

    const { discord_user_id, display_name } = await req.json();
    if (!discord_user_id) throw new Error("Missing discord_user_id");

    // Create DM channel
    const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: discord_user_id }),
    });

    if (!dmChannelRes.ok) {
      const err = await dmChannelRes.text();
      throw new Error(`Failed to create DM channel: ${err}`);
    }

    const dmChannel = await dmChannelRes.json();

    // Send confirmation message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "✅ Discord ID Linked Successfully",
            description: [
              `Hey **${display_name || "there"}**! Your Discord account has been linked to your Flux-UX profile.`,
              "",
              "You'll now receive DM notifications when your favorited upcoming movies and TV shows are released.",
              "",
              "Head to **Coming Soon** on Flux-UX to start tracking content!",
            ].join("\n"),
            color: 0x22c55e,
            footer: {
              text: "FLUX-UX",
              icon_url: "https://flux-ux.lovable.app/favicon.ico",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
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
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
