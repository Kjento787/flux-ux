import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCategoryWebhooks, postToWebhooks } from "../_shared/discordCategory.ts";

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
    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TMDB_API_KEY || !DISCORD_WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch now playing movies from TMDB
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    const tmdbData = await tmdbRes.json();
    const movies = tmdbData.results || [];

    // Get already notified movie IDs
    const { data: notified } = await supabase
      .from("notified_movies")
      .select("tmdb_id");

    const notifiedIds = new Set((notified || []).map((n: any) => n.tmdb_id));

    // Filter new movies
    const newMovies = movies.filter((m: any) => !notifiedIds.has(m.id));

    let sentCount = 0;

    for (const movie of newMovies) {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
      const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null;

      const movieUrl = `https://flux-ux.lovable.app/#/movie/${movie.id}`;
      const year = movie.release_date ? movie.release_date.split("-")[0] : "TBA";
      const rating = movie.vote_average ? `${movie.vote_average.toFixed(1)}` : "N/A";
      const ratingBar = movie.vote_average
        ? "█".repeat(Math.round(movie.vote_average)) + "░".repeat(10 - Math.round(movie.vote_average))
        : "░░░░░░░░░░";

      const embed = {
        title: movie.title,
        description: [
          `> ${movie.overview?.slice(0, 180) || "No synopsis available."}${movie.overview?.length > 180 ? "…" : ""}`,
          "",
          `**[▶ Stream Now on Flux-UX](${movieUrl})**`,
        ].join("\n"),
        url: movieUrl,
        color: 0xd4a44a,
        thumbnail: posterUrl ? { url: posterUrl } : undefined,
        image: backdropUrl ? { url: backdropUrl } : undefined,
        fields: [
          {
            name: "Rating",
            value: `\`${ratingBar}\` **${rating}**/10`,
            inline: false,
          },
          { name: "Year", value: `\`${year}\``, inline: true },
          { name: "Popularity", value: `\`#${Math.round(movie.popularity)}\``, inline: true },
          { name: "Language", value: `\`${(movie.original_language || "en").toUpperCase()}\``, inline: true },
        ],
        footer: {
          text: "FLUX-UX · New Drop",
          icon_url: "https://flux-ux.lovable.app/favicon.ico",
        },
        timestamp: new Date().toISOString(),
      };

      const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Flux-UX",
          avatar_url: "https://flux-ux.lovable.app/favicon.ico",
          content: `# 🎬 New Drop\n**${movie.title}** just landed — stream it now.`,
          embeds: [embed],
        }),
      });

      if (discordRes.ok) {
        await supabase.from("notified_movies").insert({
          tmdb_id: movie.id,
          title: movie.title,
        });
        sentCount++;
      }

      // Rate limit: wait 1s between messages
      if (newMovies.indexOf(movie) < newMovies.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return new Response(
      JSON.stringify({ success: true, newMovies: sentCount }),
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
