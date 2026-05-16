import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireCronSecret } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const unauth = requireCronSecret(req);
  if (unauth) return new Response(unauth.body, { status: unauth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DISCORD_BOT_TOKEN || !TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all TV favorites across all users
    const { data: tvFavorites, error: favError } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("content_type", "tv");

    if (favError) throw favError;
    if (!tvFavorites || tvFavorites.length === 0) {
      console.log("No TV favorites to check.");
      return new Response(JSON.stringify({ success: true, checked: 0, notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get unique tmdb_ids to avoid duplicate TMDB calls
    const uniqueTmdbIds = [...new Set(tvFavorites.map((f) => f.tmdb_id))];
    console.log(`Checking ${uniqueTmdbIds.length} unique TV series for new seasons...`);

    // Fetch current season counts from TMDB
    const tmdbData: Record<number, { seasons: number; name: string; poster: string | null; latestSeasonName: string }> = {};

    for (const tmdbId of uniqueTmdbIds) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
        );
        if (!res.ok) {
          console.log(`TMDB fetch failed for ${tmdbId}: ${res.status}`);
          continue;
        }
        const show = await res.json();
        // Filter out "Specials" (season 0) - only count real seasons
        const realSeasons = (show.seasons || []).filter((s: any) => s.season_number > 0);
        const latestSeason = realSeasons[realSeasons.length - 1];
        tmdbData[tmdbId] = {
          seasons: realSeasons.length,
          name: show.name || show.original_name,
          poster: show.poster_path,
          latestSeasonName: latestSeason?.name || `Season ${realSeasons.length}`,
        };
      } catch (e) {
        console.error(`Error fetching TMDB data for ${tmdbId}:`, e);
      }
    }

    let notifiedCount = 0;

    // Check each favorite against TMDB data
    for (const fav of tvFavorites) {
      const tmdb = tmdbData[fav.tmdb_id];
      if (!tmdb) continue;

      const lastKnown = fav.last_known_seasons || 0;

      // If first time tracking (last_known_seasons = 0), just set the current count
      if (lastKnown === 0) {
        await supabase
          .from("user_favorites")
          .update({ last_known_seasons: tmdb.seasons })
          .eq("id", fav.id);
        console.log(`Initialized ${tmdb.name} for user ${fav.user_id} at ${tmdb.seasons} seasons.`);
        continue;
      }

      // Check if new season(s) appeared
      if (tmdb.seasons > lastKnown) {
        console.log(`New season detected for ${tmdb.name}! ${lastKnown} → ${tmdb.seasons}`);

        // Get user's discord_user_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("discord_user_id, display_name")
          .eq("id", fav.user_id)
          .single();

        if (profile?.discord_user_id) {
          // Create DM channel
          const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
            method: "POST",
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ recipient_id: profile.discord_user_id }),
          });

          if (dmChannelRes.ok) {
            const dmChannel = await dmChannelRes.json();
            const posterUrl = tmdb.poster
              ? `https://image.tmdb.org/t/p/w500${tmdb.poster}`
              : null;

            const newSeasonCount = tmdb.seasons - lastKnown;
            const seasonText = newSeasonCount === 1
              ? `**${tmdb.latestSeasonName}**`
              : `**${newSeasonCount} new seasons**`;

            const embed = {
              title: `📺 New Season Alert: ${tmdb.name}`,
              description: [
                `Hey **${profile.display_name || "there"}**! Great news! 🎉`,
                "",
                `**${tmdb.name}** just dropped ${seasonText}!`,
                "",
                `The show now has **${tmdb.seasons} seasons** total.`,
                "",
                "Head over to Flux-UX to start watching! 🍿",
              ].join("\n"),
              color: 0x7c3aed,
              thumbnail: posterUrl ? { url: posterUrl } : undefined,
              fields: [
                { name: "Show", value: tmdb.name, inline: true },
                { name: "Total Seasons", value: `${tmdb.seasons}`, inline: true },
                { name: "New", value: seasonText, inline: true },
              ],
              footer: {
                text: "FLUX-UX · New Season Alert",
                icon_url: "https://flux-ux.lovable.app/favicon.ico",
              },
              timestamp: new Date().toISOString(),
            };

            const msgRes = await fetch(
              `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ embeds: [embed] }),
              }
            );

            if (msgRes.ok) {
              notifiedCount++;
              console.log(`Notified ${profile.display_name} about ${tmdb.name} new season.`);
            } else {
              console.error(`Failed to send DM: ${await msgRes.text()}`);
            }
          }
        }

        // Update the last_known_seasons
        await supabase
          .from("user_favorites")
          .update({ last_known_seasons: tmdb.seasons })
          .eq("id", fav.id);
      }
    }

    console.log(`Done. Checked ${uniqueTmdbIds.length} shows, notified ${notifiedCount} users.`);

    return new Response(
      JSON.stringify({ success: true, checked: uniqueTmdbIds.length, notified: notifiedCount }),
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
