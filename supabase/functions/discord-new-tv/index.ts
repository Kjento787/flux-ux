import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCategoryWebhooks, postToWebhooks } from "../_shared/discordCategory.ts";
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
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TMDB_API_KEY || !DISCORD_WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Use local date components to avoid UTC shift
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    console.log(`Checking for new TV series premiering on: ${today}`);

    // Use TMDB discover endpoint to find shows that FIRST aired today
    const discoverRes = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&first_air_date.gte=${today}&first_air_date.lte=${today}&sort_by=popularity.desc&include_adult=false&include_null_first_air_dates=false`
    );

    if (!discoverRes.ok) {
      throw new Error(`TMDB API error: ${discoverRes.statusText}`);
    }

    const discoverData = await discoverRes.json();
    const shows = discoverData.results || [];

    console.log(`Found ${shows.length} TV series premiering today`);

    let sentCount = 0;

    for (const show of shows) {
      // Double-check: only process if first_air_date matches today
      if (show.first_air_date !== today) continue;

      // Check if already notified
      const { data: notified } = await supabase
        .from("notified_tv")
        .select("id")
        .eq("tmdb_id", show.id)
        .eq("season_number", 1);

      if (notified && notified.length > 0) continue;

      const posterUrl = show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : null;
      const backdropUrl = show.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
        : null;

      const showUrl = `https://flux-ux.lovable.app/#/tv/${show.id}`;
      const rating = show.vote_average ? `${show.vote_average.toFixed(1)}` : "N/A";
      const ratingBar = show.vote_average
        ? "█".repeat(Math.round(show.vote_average)) + "░".repeat(10 - Math.round(show.vote_average))
        : "░░░░░░░░░░";

      const embed = {
        title: `${show.name} — New Series`,
        description: [
          `> ${show.overview?.slice(0, 180) || "No synopsis available."}${show.overview?.length > 180 ? "…" : ""}`,
          "",
          `📅 Premieres **today** · ${today}`,
          "",
          `**[▶ Stream Now on Flux-UX](${showUrl})**`,
        ].join("\n"),
        url: showUrl,
        color: 0x7c3aed,
        thumbnail: posterUrl ? { url: posterUrl } : undefined,
        image: backdropUrl ? { url: backdropUrl } : undefined,
        fields: [
          {
            name: "Rating",
            value: `\`${ratingBar}\` **${rating}**/10`,
            inline: false,
          },
          { name: "Language", value: `\`${(show.original_language || "en").toUpperCase()}\``, inline: true },
        ],
        footer: {
          text: "FLUX-UX · New Series",
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
          content: `# 📺 New Series\n**${show.name}** just launched today — stream it now.`,
          embeds: [embed],
        }),
      });

      if (discordRes.ok) {
        await supabase.from("notified_tv").insert({
          tmdb_id: show.id,
          season_number: 1,
          title: show.name,
        });
        sentCount++;
        console.log(`Notified: ${show.name}`);

        const categories = getCategoryWebhooks({
          genreIds: show.genre_ids || [],
          originCountries: show.origin_country || [],
          originalLanguage: show.original_language,
        });
        if (categories.length > 0) {
          const categoryPayload = {
            username: "Flux-UX",
            avatar_url: "https://flux-ux.lovable.app/favicon.ico",
            content: `# ${categories.map((c) => c.emoji).join(" ")} New ${categories.map((c) => c.label).join(" / ")} Series\n**${show.name}** just launched.`,
            embeds: [{ ...embed, color: categories[0].color }],
          };
          await postToWebhooks(categories.map((c) => c.url), categoryPayload);
        }
      } else {
        const errText = await discordRes.text();
        console.error(`Discord error for ${show.name}: ${errText}`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 1500));
    }

    console.log(`Done. Sent ${sentCount} new series notifications.`);

    return new Response(
      JSON.stringify({ success: true, date: today, found: shows.length, newSeries: sentCount }),
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
