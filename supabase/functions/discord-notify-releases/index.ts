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
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TMDB_API_KEY || !DISCORD_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split("T")[0];

    // Get all un-notified favorites where release_date <= today
    const { data: releasedFavorites, error: favError } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("notified", false)
      .not("release_date", "is", null)
      .lte("release_date", today);

    if (favError) throw favError;
    if (!releasedFavorites || releasedFavorites.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: "No releases to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by user_id
    const byUser = new Map<string, typeof releasedFavorites>();
    for (const fav of releasedFavorites) {
      const list = byUser.get(fav.user_id) || [];
      list.push(fav);
      byUser.set(fav.user_id, list);
    }

    let notifiedCount = 0;

    for (const [userId, favorites] of byUser) {
      // Get user's discord_user_id from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_user_id, display_name")
        .eq("id", userId)
        .single();

      if (!profile?.discord_user_id) {
        // Mark as notified even without Discord — they don't have it set up
        const ids = favorites.map((f) => f.id);
        await supabase.from("user_favorites").update({ notified: true }).in("id", ids);
        continue;
      }

      // Create DM channel with the user
      const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: profile.discord_user_id }),
      });

      if (!dmChannelRes.ok) {
        console.error(`Failed to create DM channel for user ${userId}:`, await dmChannelRes.text());
        continue;
      }

      const dmChannel = await dmChannelRes.json();

      // Send a message for each released favorite
      for (const fav of favorites) {
        // Fetch fresh details from TMDB
        const endpoint = fav.content_type === "tv" ? `/tv/${fav.tmdb_id}` : `/movie/${fav.tmdb_id}`;
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const details = await tmdbRes.json();

        const posterUrl = (details.poster_path || fav.poster_path)
          ? `https://image.tmdb.org/t/p/w500${details.poster_path || fav.poster_path}`
          : null;
        const backdropUrl = details.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
          : null;

        const title = details.title || details.name || fav.title;
        const contentUrl = `https://bloxwave.lovable.app/#/${fav.content_type}/${fav.tmdb_id}`;
        const rating = details.vote_average ? `${details.vote_average.toFixed(1)}` : "N/A";
        const ratingBar = details.vote_average
          ? "█".repeat(Math.round(details.vote_average)) + "░".repeat(10 - Math.round(details.vote_average))
          : "░░░░░░░░░░";

        const isTV = fav.content_type === "tv";
        const emoji = isTV ? "📺" : "🎬";

        const embed = {
          title: `${emoji} ${title} is now available!`,
          description: [
            `> ${details.overview?.slice(0, 200) || "No synopsis available."}${details.overview?.length > 200 ? "…" : ""}`,
            "",
            `**[▶ Stream Now on Bloxwave](${contentUrl})**`,
          ].join("\n"),
          url: contentUrl,
          color: isTV ? 0x7c3aed : 0xd4a44a,
          thumbnail: posterUrl ? { url: posterUrl } : undefined,
          image: backdropUrl ? { url: backdropUrl } : undefined,
          fields: [
            { name: "Rating", value: `\`${ratingBar}\` **${rating}**/10`, inline: false },
            { name: "Type", value: isTV ? "TV Series" : "Movie", inline: true },
            { name: "Released", value: fav.release_date || "Now", inline: true },
          ],
          footer: {
            text: "BLOXWAVE · Release Alert",
            icon_url: "https://bloxwave.lovable.app/favicon.ico",
          },
          timestamp: new Date().toISOString(),
        };

        const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `Hey ${profile.display_name || "there"}! 🎉 **${title}** just released — go watch it now!`,
            embeds: [embed],
          }),
        });

        if (msgRes.ok) {
          await supabase.from("user_favorites").update({ notified: true }).eq("id", fav.id);
          notifiedCount++;
        } else {
          console.error(`Failed to send DM for favorite ${fav.id}:`, await msgRes.text());
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: notifiedCount }),
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
