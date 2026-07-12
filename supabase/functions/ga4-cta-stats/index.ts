/**
 * GA4 CTA Stats — returns top `cta_click` events from Google Analytics 4 over
 * the last N days, grouped by event label + destination.
 *
 * Auth: caller must be a logged-in admin (verified via JWT + has_role).
 * Upstream auth: Google service account JSON (GA4_SERVICE_ACCOUNT_JSON) is
 * exchanged for a short-lived OAuth2 access token using the JWT bearer flow.
 *
 * Required secrets:
 *   - GA4_SERVICE_ACCOUNT_JSON  (full JSON key, viewer access on GA4 property)
 *   - GA4_PROPERTY_ID           (numeric, e.g. "123456789")
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

/** Build & sign a Google OAuth2 JWT, exchange it for an access token. */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64url = (b: ArrayBuffer | Uint8Array) => {
    const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
    let s = "";
    for (const x of bytes) s += String.fromCharCode(x);
    return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
  const enc = (o: unknown) =>
    b64url(new TextEncoder().encode(JSON.stringify(o)));

  const unsigned = `${enc(header)}.${enc(claim)}`;

  // Import the PEM private key for RS256 signing
  const pem = sa.private_key.replace(/\\n/g, "\n");
  const pkcs8 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed [${res.status}]: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ---- Authn / Authz: must be admin ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Load secrets ----
    const propertyId = Deno.env.get("GA4_PROPERTY_ID");
    const saJson = Deno.env.get("GA4_SERVICE_ACCOUNT_JSON");
    if (!propertyId || !saJson) {
      return new Response(
        JSON.stringify({
          error: "GA4 not configured",
          detail:
            "Missing GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON. Add them in Cloud secrets and grant the service account Viewer access on the GA4 property.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let sa: ServiceAccount;
    try {
      sa = JSON.parse(saJson) as ServiceAccount;
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid service account JSON",
          detail: "GA4_SERVICE_ACCOUNT_JSON must be the full JSON key file from Google Cloud.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = await getAccessToken(sa);

    // ---- Query GA4 Data API ----
    const reportRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [
            { name: "eventName" },
            { name: "customEvent:event_label" },
            { name: "customEvent:destination" },
            { name: "customEvent:source" },
          ],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              stringFilter: { value: "cta_click" },
            },
          },
          orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
          limit: 10,
        }),
      },
    );

    if (!reportRes.ok) {
      const detail = await reportRes.text();
      return new Response(
        JSON.stringify({
          error: "GA4 query failed",
          status: reportRes.status,
          detail,
          hint:
            reportRes.status === 403
              ? "Grant the service account Viewer access on the GA4 property (Admin → Property Access Management)."
              : undefined,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const report = (await reportRes.json()) as {
      rows?: Array<{
        dimensionValues: Array<{ value: string }>;
        metricValues: Array<{ value: string }>;
      }>;
    };

    const rows = (report.rows ?? []).map((r) => ({
      label: r.dimensionValues[1]?.value || "(not set)",
      destination: r.dimensionValues[2]?.value || "(not set)",
      source: r.dimensionValues[3]?.value || "(not set)",
      clicks: parseInt(r.metricValues[0]?.value ?? "0", 10),
    }));

    return new Response(
      JSON.stringify({ rows, range: "last_30_days", property: propertyId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("ga4-cta-stats error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
