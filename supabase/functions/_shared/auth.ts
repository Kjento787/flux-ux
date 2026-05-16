import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function requireCronSecret(req: Request): Response | null {
  const CRON_SECRET = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("Authorization");
  const xCron = req.headers.get("x-cron-secret");
  if (!CRON_SECRET) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), { status: 500 });
  }
  if (auth === `Bearer ${CRON_SECRET}` || xCron === CRON_SECRET) return null;
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}

export async function requireUser(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  return { userId: data.claims.sub as string };
}

export async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const result = await requireUser(req);
  if (result instanceof Response) return result;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: result.userId,
    _role: "admin",
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return result;
}
