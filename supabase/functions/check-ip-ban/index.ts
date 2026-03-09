import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown'

    console.log('Checking IP ban status for:', clientIP)

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check ip_bans table first
    const { data: ipBan, error: ipBanError } = await supabase
      .from('ip_bans')
      .select('*')
      .eq('ip_address', clientIP)
      .maybeSingle()

    if (ipBanError) {
      console.error('Error checking ip_bans:', ipBanError)
    }

    if (ipBan) {
      // Check if ban is still active
      const isExpired = ipBan.expires_at && new Date(ipBan.expires_at) < new Date()
      const isActive = !isExpired || ipBan.is_permanent

      if (isActive) {
        console.log('IP is banned via ip_bans table')
        return new Response(
          JSON.stringify({
            isBanned: true,
            reason: ipBan.reason,
            expiresAt: ipBan.expires_at,
            isPermanent: ipBan.is_permanent,
            clientIP,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Also check user_bans for this IP
    const { data: userBans, error: userBansError } = await supabase
      .from('user_bans')
      .select('*')
      .eq('ip_address', clientIP)
      .order('banned_at', { ascending: false })
      .limit(1)

    if (userBansError) {
      console.error('Error checking user_bans:', userBansError)
    }

    if (userBans && userBans.length > 0) {
      const ban = userBans[0]
      const isExpired = ban.expires_at && new Date(ban.expires_at) < new Date()
      const isActive = !isExpired || ban.is_permanent

      if (isActive) {
        console.log('IP is banned via user_bans table')
        return new Response(
          JSON.stringify({
            isBanned: true,
            reason: ban.reason,
            expiresAt: ban.expires_at,
            isPermanent: ban.is_permanent,
            clientIP,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('IP is not banned')
    return new Response(
      JSON.stringify({
        isBanned: false,
        clientIP,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in check-ip-ban:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', isBanned: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
