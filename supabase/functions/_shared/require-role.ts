import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Verifies the caller's JWT and that they hold at least one of `roles`.
 * Returns `{ userId }` on success or `{ response }` with the error to return.
 */
export async function requireRole(
  req: Request,
  roles: string[],
  corsHeaders: Record<string, string>,
): Promise<{ userId: string; response?: never } | { userId?: never; response: Response }> {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { response: json({ error: "Unauthorized" }, 401) };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return { response: json({ error: "Unauthorized" }, 401) };
  }
  const userId = claimsData.claims.sub as string;

  const { data: allowed, error: roleErr } = await supabase.rpc("has_any_role", {
    _user_id: userId,
    _roles: roles,
  });
  if (roleErr || !allowed) {
    return { response: json({ error: "Forbidden" }, 403) };
  }

  return { userId };
}
