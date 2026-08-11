// Edge function: notify-lead
//
// Fired server-side by the AFTER INSERT trigger on public.leads (via pg_net),
// so a notification goes out for every captured lead regardless of what the
// browser does after submitting. Never trusts caller-supplied lead content: it
// takes only a leadId, re-reads the row with the service role, and builds the
// message from the database.
//
// Auth: this function runs with verify_jwt = false (the DB call carries no user
// JWT). It is instead protected by a shared secret in the `x-notify-secret`
// header, matched against the NOTIFY_LEAD_SECRET env var.
//
// Delivery is best-effort and driven entirely by env vars — configure either or
// both; if neither is set the function no-ops so it can be deployed safely:
//   - LEAD_WEBHOOK_URL : incoming webhook (Slack / Teams / Discord / Zapier /
//                        Make). Receives { text, lead }.
//   - RESEND_API_KEY + LEAD_NOTIFY_TO + LEAD_NOTIFY_FROM : email via Resend
//                        (comma-separated recipients allowed in LEAD_NOTIFY_TO).
//
// Required secrets: NOTIFY_LEAD_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

interface LeadRow {
  id: string;
  full_name: string | null;
  work_email: string | null;
  phone: string | null;
  company: string | null;
  company_size: string | null;
  industry: string | null;
  use_case: string | null;
  message: string | null;
  cta_source: string | null;
  page_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string | null;
}

const field = (label: string, value: string | null | undefined) =>
  value ? `${label}: ${value}` : null;

const buildText = (lead: LeadRow): string => {
  const lines = [
    "🟢 New lead — Digitize me",
    field("Name", lead.full_name),
    field("Email", lead.work_email),
    field("Phone", lead.phone),
    field("Company", lead.company),
    field("Company size", lead.company_size),
    field("Industry", lead.industry),
    field("Use case", lead.use_case),
    field("Message", lead.message),
    field("Source", lead.cta_source),
    field("Page", lead.page_path),
    field(
      "UTM",
      [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || null,
    ),
  ].filter(Boolean);
  return lines.join("\n");
};

const buildHtml = (lead: LeadRow): string => {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(
          value,
        )}</strong></td></tr>`
      : "";
  return `<div style="font-family:system-ui,sans-serif">
    <h2 style="margin:0 0 12px">🟢 New lead — Digitize me</h2>
    <table style="border-collapse:collapse">
      ${row("Name", lead.full_name)}
      ${row("Email", lead.work_email)}
      ${row("Phone", lead.phone)}
      ${row("Company", lead.company)}
      ${row("Company size", lead.company_size)}
      ${row("Industry", lead.industry)}
      ${row("Use case", lead.use_case)}
      ${row("Message", lead.message)}
      ${row("Source", lead.cta_source)}
      ${row("Page", lead.page_path)}
      ${row("UTM source", lead.utm_source)}
      ${row("UTM medium", lead.utm_medium)}
      ${row("UTM campaign", lead.utm_campaign)}
    </table>
  </div>`;
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const expectedSecret = Deno.env.get("NOTIFY_LEAD_SECRET");
  if (!expectedSecret || req.headers.get("x-notify-secret") !== expectedSecret) {
    return json(401, { error: "Unauthorized" });
  }

  let leadId: string | undefined;
  try {
    leadId = (await req.json())?.leadId;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }
  if (!leadId) return json(400, { error: "Missing leadId" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data: lead, error } = await admin
    .from("leads")
    .select(
      "id, full_name, work_email, phone, company, company_size, industry, use_case, message, cta_source, page_path, utm_source, utm_medium, utm_campaign, created_at",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error) return json(500, { error: `Lookup failed: ${error.message}` });
  if (!lead) return json(200, { skipped: "lead not found" });

  const row = lead as LeadRow;
  const delivered: string[] = [];
  const failed: string[] = [];

  // 1) Generic webhook (Slack/Teams/Discord/Zapier/Make compatible)
  const webhookUrl = Deno.env.get("LEAD_WEBHOOK_URL");
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: buildText(row), lead: row }),
      });
      res.ok ? delivered.push("webhook") : failed.push(`webhook:${res.status}`);
    } catch (e) {
      failed.push(`webhook:${e instanceof Error ? e.message : "error"}`);
    }
  }

  // 2) Email via Resend
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyTo = Deno.env.get("LEAD_NOTIFY_TO");
  const notifyFrom = Deno.env.get("LEAD_NOTIFY_FROM");
  if (resendKey && notifyTo && notifyFrom) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: notifyFrom,
          to: notifyTo.split(",").map((s) => s.trim()).filter(Boolean),
          reply_to: row.work_email ?? undefined,
          subject: `New lead: ${row.full_name ?? row.work_email ?? "unknown"}`,
          html: buildHtml(row),
          text: buildText(row),
        }),
      });
      res.ok ? delivered.push("email") : failed.push(`email:${res.status}`);
    } catch (e) {
      failed.push(`email:${e instanceof Error ? e.message : "error"}`);
    }
  }

  if (delivered.length === 0 && failed.length === 0) {
    console.log("notify-lead: no delivery channel configured; skipping");
  }
  if (failed.length) console.error("notify-lead delivery failures:", failed);

  return json(200, { ok: true, delivered, failed });
});
