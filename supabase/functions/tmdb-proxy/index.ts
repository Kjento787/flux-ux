import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const BASE_URL = "https://api.themoviedb.org/3";

const ALLOWED_PREFIXES = ['/movie/', '/tv/', '/search/', '/discover/', '/trending/', '/genre/', '/person/', '/configuration', '/find/', '/keyword/', '/network/', '/company/'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller to prevent open-proxy abuse
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { endpoint, params } = await req.json();

    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint is required');
    }

    if (!ALLOWED_PREFIXES.some((p) => endpoint.startsWith(p))) {
      return new Response(JSON.stringify({ error: 'Forbidden endpoint' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      ...params,
    });

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    console.log('Fetching TMDB:', endpoint);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API error:', response.status, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in tmdb-proxy function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
