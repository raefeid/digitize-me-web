import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireRole } from "../_shared/require-role.ts";

/**
 * Generates a full SEO landing page for a single industry using Lovable AI.
 *
 * Input:  { industry: { slug, name, headline?, description?, painPoints?, solutions? } }
 * Output: { title, slug, seo_title, seo_description, blocks }
 *
 * The returned blocks use the page builder's block schema (see
 * src/hooks/useCustomPages.tsx). FAQ blocks are emitted as JSON-LD FAQPage
 * automatically by the public renderer.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const uid = () => Math.random().toString(36).slice(2, 10);

const ALLOWED_ROLES = ["admin", "super_admin", "editor", "seo_manager"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireRole(req, ALLOWED_ROLES, corsHeaders);
  if (auth.response) return auth.response;

  try {
    const { industry } = await req.json();
    if (!industry?.name) {
      return new Response(JSON.stringify({ error: "industry.name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const context = [
      `Industry: ${industry.name}`,
      industry.headline ? `Existing headline: ${industry.headline}` : "",
      industry.description ? `Description: ${industry.description}` : "",
      industry.painPoints?.length
        ? `Common pain points:\n- ${industry.painPoints.slice(0, 6).join("\n- ")}`
        : "",
      industry.solutions?.length
        ? `Solutions we offer:\n- ${industry.solutions.slice(0, 6).join("\n- ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a senior B2B SaaS SEO copywriter for Digitize me — an AI document management product based in the UAE. " +
              "You write tailored landing-page copy for specific industries. " +
              "Voice: clear, concrete, outcome-led, no fluff, no superlatives. " +
              "Use plain English suitable for UAE business buyers. Never invent product features. " +
              "Always include 5-6 FAQs that match real buyer search intent for the industry " +
              "(implementation, security, Arabic OCR, integrations, pricing, time-to-value).",
          },
          {
            role: "user",
            content: `Create a high-conversion SEO landing page for the "${industry.name}" industry.\n\nContext:\n${context}\n\nThe page must internally link to /pricing (in the CTA block) and /contact (in a secondary button).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "build_industry_page",
              description: "Return a complete industry landing page.",
              parameters: {
                type: "object",
                properties: {
                  seo_title: {
                    type: "string",
                    description: "30-60 char meta title with the industry name.",
                  },
                  seo_description: {
                    type: "string",
                    description: "120-160 char meta description.",
                  },
                  hero_eyebrow: { type: "string", description: "Short tag, 2-4 words." },
                  hero_title: { type: "string", description: "Main H1, 6-10 words." },
                  hero_desc: { type: "string", description: "Hero supporting copy, 1-2 sentences." },
                  intro_html: {
                    type: "string",
                    description:
                      "60-120 word intro paragraph for the industry, explaining the document-management problem and outcome. Plain HTML, only <p> and <strong> allowed.",
                  },
                  value_cards: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        icon: {
                          type: "string",
                          description:
                            "Lucide icon name. Choose from: Search, Shield, Zap, FileText, Users, Clock, CheckCircle2, Lock, Database.",
                        },
                        title: { type: "string" },
                        desc: { type: "string", description: "1-2 sentences." },
                      },
                      required: ["icon", "title", "desc"],
                      additionalProperties: false,
                    },
                  },
                  faqs: {
                    type: "array",
                    minItems: 5,
                    maxItems: 6,
                    items: {
                      type: "object",
                      properties: {
                        q: { type: "string" },
                        a: { type: "string", description: "1-3 sentence answer." },
                      },
                      required: ["q", "a"],
                      additionalProperties: false,
                    },
                  },
                  cta_title: { type: "string" },
                  cta_desc: { type: "string" },
                },
                required: [
                  "seo_title",
                  "seo_description",
                  "hero_eyebrow",
                  "hero_title",
                  "hero_desc",
                  "intro_html",
                  "value_cards",
                  "faqs",
                  "cta_title",
                  "cta_desc",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_industry_page" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("No page payload returned");

    // Build page builder blocks from AI output. Block shapes match
    // PageBlock in src/hooks/useCustomPages.tsx exactly.
    const slug = `${(industry.slug || industry.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-document-management`;

    const blocks = [
      {
        id: uid(),
        type: "hero",
        eyebrow: args.hero_eyebrow,
        title: args.hero_title,
        desc: args.hero_desc,
        cta_label: "See pricing",
        cta_link: "/pricing",
      },
      { id: uid(), type: "rich_text", html: args.intro_html },
      {
        id: uid(),
        type: "cards",
        title: `Why ${industry.name} teams choose Digitize me`,
        cards: args.value_cards,
      },
      { id: uid(), type: "divider", style: "line", size: "md" },
      {
        id: uid(),
        type: "faq",
        title: `${industry.name} — frequently asked questions`,
        items: args.faqs.map((f: { q: string; a: string }) => ({ q: f.q, a: f.a })),
      },
      {
        id: uid(),
        type: "cta",
        title: args.cta_title,
        desc: args.cta_desc,
        cta_label: "Talk to sales",
        cta_link: "/contact",
      },
      {
        id: uid(),
        type: "button",
        label: "Compare plans",
        link: "/pricing",
        variant: "outline",
        size: "default",
        align: "center",
      },
    ];

    return new Response(
      JSON.stringify({
        title: `Document Management for ${industry.name}`,
        slug,
        seo_title: args.seo_title,
        seo_description: args.seo_description,
        blocks,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-industry-page error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
