import { describe, it, expect } from "vitest";
import {
  normalizeCtaDestination,
  ctaDestinationNeedsNormalization,
} from "@/lib/normalizeCtaDestination";

describe("normalizeCtaDestination", () => {
  describe("link kind", () => {
    it("strips /ar prefix from internal paths", () => {
      expect(normalizeCtaDestination("link", "/ar/contact")).toBe("/contact");
      expect(normalizeCtaDestination("link", "/ar/pricing?plan=pro")).toBe("/pricing?plan=pro");
      expect(normalizeCtaDestination("link", "/ar")).toBe("/");
    });

    it("leaves canonical paths unchanged", () => {
      expect(normalizeCtaDestination("link", "/contact")).toBe("/contact");
      expect(normalizeCtaDestination("link", "/")).toBe("/");
      expect(normalizeCtaDestination("link", "/industries/law-firms")).toBe("/industries/law-firms");
    });

    it("adds a leading slash when missing", () => {
      expect(normalizeCtaDestination("link", "contact")).toBe("/contact");
      expect(normalizeCtaDestination("link", "ar/contact")).toBe("/contact");
    });

    it("trims whitespace", () => {
      expect(normalizeCtaDestination("link", "  /ar/contact  ")).toBe("/contact");
    });

    it("preserves anchors and external URLs", () => {
      expect(normalizeCtaDestination("link", "#hero")).toBe("#hero");
      expect(normalizeCtaDestination("link", "https://example.com/x")).toBe("https://example.com/x");
    });

    it("returns empty string for blank value", () => {
      expect(normalizeCtaDestination("link", "")).toBe("");
      expect(normalizeCtaDestination("link", "   ")).toBe("");
    });
  });

  describe("non-link kinds", () => {
    it.each(["email", "phone", "whatsapp", "external"])(
      "leaves %s values untouched",
      (kind) => {
        expect(normalizeCtaDestination(kind, "/ar/contact")).toBe("/ar/contact");
        expect(normalizeCtaDestination(kind, "info@example.com")).toBe("info@example.com");
      },
    );
  });
});

describe("ctaDestinationNeedsNormalization", () => {
  it("flags /ar-prefixed link destinations", () => {
    expect(ctaDestinationNeedsNormalization("link", "/ar/contact")).toBe(true);
    expect(ctaDestinationNeedsNormalization("link", "/ar")).toBe(true);
  });

  it("does not flag canonical link destinations", () => {
    expect(ctaDestinationNeedsNormalization("link", "/contact")).toBe(false);
    expect(ctaDestinationNeedsNormalization("link", "")).toBe(false);
    expect(ctaDestinationNeedsNormalization("link", "/article-with-ar-in-slug")).toBe(false);
  });

  it("never flags non-link kinds", () => {
    expect(ctaDestinationNeedsNormalization("email", "/ar/contact")).toBe(false);
    expect(ctaDestinationNeedsNormalization("external", "/ar/contact")).toBe(false);
  });
});
