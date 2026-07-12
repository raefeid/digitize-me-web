import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, slug, blocks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Flatten page content into a single text blob
    const stripHtml = (s: string) => (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const parts: string[] = [];
    if (title) parts.push(`Page title: ${title}`);
    for (const b of blocks ?? []) {
      if (b.type === "hero") {
        if (b.eyebrow) parts.push(b.eyebrow);
        if (b.title) parts.push(b.title);
        if (b.desc) parts.push(b.desc);
      } else if (b.type === "rich_text") {
        if (b.html) parts.push(stripHtml(b.html));
      } else if (b.type === "cards") {
        if (b.title) parts.push(b.title);
        for (const c of b.cards ?? []) {
          if (c.title) parts.push(c.title);
          if (c.desc) parts.push(c.desc);
        }
      } else if (b.type === "image") {
        if (b.alt) parts.push(b.alt);
        if (b.caption) parts.push(b.caption);
      } else if (b.type === "cta") {
        if (b.title) parts.push(b.title);
        if (b.desc) parts.push(b.desc);
      }
    }
    const content = parts.join("\n").slice(0, 6000);

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
              "You are an SEO expert. Given a web page's content, generate an optimized meta title (30-60 chars), meta description (70-160 chars), and a clean URL slug (lowercase, dashes, max 50 chars). Focus on user search intent and clarity. Never invent facts not present in the content.",
          },
          {
            role: "user",
            content: `Generate SEO metadata for this page:\n\n${content}\n\nCurrent slug: ${slug || "(none)"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "set_seo",
              description: "Return optimized SEO metadata for the page.",
              parameters: {
                type: "object",
                properties: {
                  seo_title: { type: "string", description: "30-60 character meta title" },
                  seo_description: { type: "string", description: "70-160 character meta description" },
                  slug: { type: "string", description: "Lowercase URL slug with dashes only" },
                },
                required: ["seo_title", "seo_description", "slug"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "set_seo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
    if (!args) throw new Error("No SEO suggestion returned");

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-page-seo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
