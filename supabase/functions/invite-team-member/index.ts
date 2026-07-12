// Edge function: invite-team-member
// Super-admin-only endpoint. Validates the caller is the hardcoded super-admin
// (marketing@infasme.com), records the invite in public.invited_team_members,
// then sends a Supabase Auth invite so the recipient gets an email and creates
// an account. The DB trigger `apply_invited_role` will assign the correct role
// when they confirm and sign in for the first time.
//
// Request body: { email: string, role: "admin" | "editor" | "seo_manager" | "blog_author" }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ROLES = ["admin", "editor", "seo_manager", "blog_author"] as const;
type Role = (typeof ALLOWED_ROLES)[number];

const SUPER_ADMIN_EMAIL = "marketing@infasme.com";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(401, { error: "Missing Authorization header" });
  }

  // Verify caller identity using their JWT
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return json(401, { error: "Invalid session" });
  }
  const callerEmail = userData.user.email?.toLowerCase();
  if (callerEmail !== SUPER_ADMIN_EMAIL) {
    return json(403, { error: "Only the super admin may invite team members" });
  }

  // Parse + validate body
  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const role = body.role as Role;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return json(400, { error: "Invalid email" });
  if (!ALLOWED_ROLES.includes(role))
    return json(400, { error: "Invalid role" });
  if (email === SUPER_ADMIN_EMAIL)
    return json(400, { error: "Super admin already has full access" });

  // Service-role client for admin operations
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Upsert invite record (so role updates also work without violating unique constraint)
  const { error: upsertErr } = await admin
    .from("invited_team_members")
    .upsert(
      {
        email,
        role,
        invited_by: userData.user.id,
        invited_at: new Date().toISOString(),
        accepted_at: null,
        accepted_user_id: null,
      },
      { onConflict: "email" },
    );
  if (upsertErr) {
    return json(500, { error: `Could not record invite: ${upsertErr.message}` });
  }

  // Check if user already exists
  const { data: existing } = await admin.auth.admin.listUsers();
  const existingUser = existing?.users?.find(
    (u) => u.email?.toLowerCase() === email,
  );

  if (existingUser) {
    // User already has an account — assign the role directly
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert(
        { user_id: existingUser.id, role },
        { onConflict: "user_id,role" },
      );
    if (roleErr) {
      return json(500, { error: `Could not assign role: ${roleErr.message}` });
    }
    // Mark invite as accepted
    await admin
      .from("invited_team_members")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_user_id: existingUser.id,
      })
      .eq("email", email);

    return json(200, {
      ok: true,
      mode: "existing_user",
      message: "Role assigned to existing account",
    });
  }

  // Send Supabase invite email — recipient creates their account from the link
  const redirectTo = req.headers.get("origin")
    ? `${req.headers.get("origin")}/admin/login`
    : undefined;
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (inviteErr) {
    return json(500, { error: `Invite email failed: ${inviteErr.message}` });
  }

  return json(200, {
    ok: true,
    mode: "invited",
    message: "Invitation sent",
  });
});
