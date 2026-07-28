import { describe, it, expect } from "vitest";
import {
  buildJsonLdGraph,
  buildBreadcrumbs,
  defaultServiceForPage,
} from "@/lib/jsonLd";

const BASE = "https://www.digitizeme.ae";

describe("buildBreadcrumbs", () => {
  it("emits English labels and English URLs in en context", () => {
    const bc = buildBreadcrumbs(BASE, "/industries/law-firms", "en") as {
      itemListElement: Array<{ name: string; item: string; position: number }>;
    };
    expect(bc.itemListElement).toHaveLength(3);
    expect(bc.itemListElement[0]).toMatchObject({ name: "Home", item: `${BASE}/` });
    expect(bc.itemListElement[1]).toMatchObject({ name: "Industries", item: `${BASE}/industries` });
    expect(bc.itemListElement[2].name).toBe("Law Firms");
    expect(bc.itemListElement[2].item).toBe(`${BASE}/industries/law-firms`);
  });

  it("emits Arabic labels and /ar URLs in ar context", () => {
    const bc = buildBreadcrumbs(BASE, "/ar/industries/law-firms", "ar") as {
      itemListElement: Array<{ name: string; item: string }>;
    };
    expect(bc.itemListElement[0]).toMatchObject({ name: "الرئيسية", item: `${BASE}/ar` });
    expect(bc.itemListElement[1]).toMatchObject({ name: "القطاعات", item: `${BASE}/ar/industries` });
    expect(bc.itemListElement[2].item).toBe(`${BASE}/ar/industries/law-firms`);
  });

  it("returns null for the home page", () => {
    expect(buildBreadcrumbs(BASE, "/", "en")).toBeNull();
    expect(buildBreadcrumbs(BASE, "/ar", "ar")).toBeNull();
  });
});

describe("defaultServiceForPage", () => {
  it.each(["home", "product", "industries", "features"])(
    "returns a Service schema for %s",
    (key) => {
      expect(defaultServiceForPage(key, "en")).not.toBeNull();
      expect(defaultServiceForPage(key, "ar")).not.toBeNull();
    },
  );

  it.each(["pricing", "blog", "privacy", "terms", "contact"])(
    "returns null for %s",
    (key) => {
      expect(defaultServiceForPage(key, "en")).toBeNull();
    },
  );

  it("uses Arabic copy in Arabic context", () => {
    const ar = defaultServiceForPage("home", "ar")!;
    expect(ar.name).toMatch(/Digitize me/);
    expect(ar.description).toMatch(/[\u0600-\u06FF]/);
  });
});

describe("buildJsonLdGraph", () => {
  const args = {
    baseUrl: BASE,
    path: "/product",
    title: "Product",
    description: "AI document management",
  };

  it("always includes Organization, WebSite, and WebPage", () => {
    const graph = buildJsonLdGraph(args)["@graph"] as Array<{ "@type": string }>;
    const types = graph.map((g) => g["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("WebPage");
  });

  it("includes BreadcrumbList for sub-pages", () => {
    const graph = buildJsonLdGraph(args)["@graph"] as Array<{ "@type": string }>;
    expect(graph.map((g) => g["@type"])).toContain("BreadcrumbList");
  });

  it("includes a Service when provided", () => {
    const service = defaultServiceForPage("product", "en")!;
    const graph = buildJsonLdGraph({ ...args, service })["@graph"] as Array<{ "@type": string }>;
    expect(graph.map((g) => g["@type"])).toContain("Service");
  });

  it("includes a Product when provided (e.g. /pricing)", () => {
    const graph = buildJsonLdGraph({
      ...args,
      path: "/pricing",
      product: {
        name: "Digitize me",
        description: "Plans",
        offers: [{ name: "SMEs", price: "299", priceCurrency: "AED" }],
      },
    })["@graph"] as Array<{ "@type": string; offers?: unknown[] }>;
    const product = graph.find((g) => g["@type"] === "Product");
    expect(product).toBeDefined();
    expect(product!.offers).toHaveLength(1);
  });

  it("uses the localized Organization name in Arabic context", () => {
    const graph = buildJsonLdGraph({ ...args, path: "/ar/product", lang: "ar" })["@graph"] as Array<{
      "@type": string;
      name?: string;
    }>;
    const org = graph.find((g) => g["@type"] === "Organization")!;
    expect(org.name).toMatch(/[\u0600-\u06FF]/);
  });
});
