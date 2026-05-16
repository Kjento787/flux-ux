import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authed = await requireUser(req);
    if (authed instanceof Response) {
      return new Response(authed.body, { status: authed.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id is required");
    if (user_id !== authed.userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Gather user data in parallel
    const [watchlistRes, reviewsRes, favoritesRes] = await Promise.all([
      supabase.from("watchlists").select("content_id, content_type").eq("user_id", user_id).limit(20),
      supabase.from("reviews").select("content_id, content_type, rating").eq("user_id", user_id).order("rating", { ascending: false }).limit(20),
      supabase.from("user_favorites").select("tmdb_id, content_type, title").eq("user_id", user_id).limit(20),
    ]);

    const watchlist = watchlistRes.data || [];
    const reviews = reviewsRes.data || [];
    const favorites = favoritesRes.data || [];

    // Fetch details for top items to give AI context
    const topIds = [
      ...reviews.slice(0, 5).map(r => ({ id: r.content_id, type: r.content_type })),
      ...watchlist.slice(0, 5).map(w => ({ id: w.content_id, type: w.content_type })),
    ];

    const titlePromises = topIds.map(async (item) => {
      try {
        const endpoint = item.type === "tv" ? "tv" : "movie";
        const res = await fetch(`https://api.themoviedb.org/3/${endpoint}/${item.id}?api_key=${TMDB_API_KEY}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { id: item.id, type: item.type, title: data.title || data.name, genres: (data.genres || []).map((g: any) => g.name) };
      } catch { return null; }
    });

    const titles = (await Promise.all(titlePromises)).filter(Boolean);
    const favoriteNames = favorites.map(f => f.title);

    // Build context for AI
    const userContext = [
      titles.length > 0 ? `Recently watched/rated: ${titles.map(t => `${t!.title} (${t!.genres.join(", ")})`).join("; ")}` : "",
      favoriteNames.length > 0 ? `Favorite/tracked shows: ${favoriteNames.join(", ")}` : "",
      reviews.length > 0 ? `High-rated content IDs: ${reviews.filter(r => r.rating >= 7).map(r => r.content_id).join(", ")}` : "",
    ].filter(Boolean).join("\n");

    if (!userContext) {
      return new Response(JSON.stringify({ recommendations: [], reason: "No watch history found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Lovable AI for recommendations
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a movie/TV recommendation engine. Based on the user's viewing history, suggest content they would enjoy. Return recommendations using the tool provided. Focus on variety - mix genres, include hidden gems, and provide personalized reasoning. Only suggest real movies and TV shows.`,
          },
          {
            role: "user",
            content: `Based on this user's history, recommend 12 movies and TV shows they'd love:\n\n${userContext}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_content",
              description: "Return content recommendations with categories",
              parameters: {
                type: "object",
                properties: {
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", description: "Category label like 'Because you watched X' or 'Hidden Gems for You'" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              type: { type: "string", enum: ["movie", "tv"] },
                              reason: { type: "string", description: "Brief reason why recommended" },
                            },
                            required: ["title", "type", "reason"],
                          },
                        },
                      },
                      required: ["label", "items"],
                    },
                  },
                },
                required: ["categories"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_content" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let categories: any[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        categories = parsed.categories || [];
      } catch {
        console.error("Failed to parse AI response");
      }
    }

    // Resolve titles to TMDB IDs
    const resolvedCategories = await Promise.all(
      categories.map(async (cat: any) => {
        const resolvedItems = await Promise.all(
          (cat.items || []).map(async (item: any) => {
            try {
              const searchType = item.type === "tv" ? "tv" : "movie";
              const searchRes = await fetch(
                `https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(item.title)}&page=1`
              );
              if (!searchRes.ok) return null;
              const searchData = await searchRes.json();
              const result = searchData.results?.[0];
              if (!result) return null;
              return {
                id: result.id,
                title: result.title || result.name,
                poster_path: result.poster_path,
                backdrop_path: result.backdrop_path,
                vote_average: result.vote_average,
                release_date: result.release_date || result.first_air_date,
                media_type: item.type,
                reason: item.reason,
                overview: result.overview,
              };
            } catch { return null; }
          })
        );
        return {
          label: cat.label,
          items: resolvedItems.filter(Boolean),
        };
      })
    );

    return new Response(JSON.stringify({ categories: resolvedCategories.filter(c => c.items.length > 0) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI recommendation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
