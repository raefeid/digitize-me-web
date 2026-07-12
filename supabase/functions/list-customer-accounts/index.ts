// Lists customer accounts (users who signed up via the public Sign Up form).
// Restricted to admins / super-admin via JWT verification + role lookup.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPER_ADMIN_EMAIL = "marketing@infasme.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const callerId = userData.user.id;
    const callerEmail = (userData.user.email ?? "").toLowerCase();

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Allow super admin or anyone with admin role
    let allowed = callerEmail === SUPER_ADMIN_EMAIL;
    if (!allowed) {
      const { data: roleRows } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId);
      allowed = !!roleRows?.some((r) => r.role === "admin");
    }
    if (!allowed) {
      return json({ error: "Forbidden" }, 403);
    }

    // Get all user_ids tagged as customer
    const { data: customerRoles, error: rolesErr } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "customer");
    if (rolesErr) throw rolesErr;
    const customerIds = new Set((customerRoles ?? []).map((r) => r.user_id));

    if (customerIds.size === 0) {
      return json({ accounts: [] });
    }

    // Fetch profile info
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, created_at, updated_at")
      .in("id", Array.from(customerIds));
    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p]),
    );

    // Pull auth users (paginated). Match by id.
    const accounts: Array<{
      id: string;
      email: string | null;
      full_name: string | null;
      created_at: string;
      last_sign_in_at: string | null;
      email_confirmed_at: string | null;
    }> = [];
    let page = 1;
    const perPage = 200;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) {
        if (!customerIds.has(u.id)) continue;
        const p = profileMap.get(u.id);
        accounts.push({
          id: u.id,
          email: u.email ?? null,
          full_name:
            (p?.full_name as string | null) ??
            ((u.user_metadata as Record<string, unknown> | null)?.full_name as
              | string
              | null) ??
            null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
        });
      }
      if (data.users.length < perPage) break;
      page += 1;
      if (page > 50) break; // safety cap (10k users)
    }

    accounts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return json({ accounts });
  } catch (err) {
    console.error("[list-customer-accounts]", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
