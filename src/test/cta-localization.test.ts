import { describe, it, expect } from "vitest";
import { localizeInternalPath } from "@/lib/localizedRoutes";

/**
 * Guards the language-aware CTA routing contract.
 *
 * Both `CtaButton` and `EditableLink` resolve their final href through
 * `localizeInternalPath(target.value, lang)`. A single CMS destination
 * (e.g. "/contact") must therefore automatically produce "/ar/contact"
 * for visitors on Arabic pages and "/contact" for visitors on English
 * pages — without per-language CMS entries.
 */
describe("CTA destination localization", () => {
  describe("English context", () => {
    it.each([
      ["/", "/"],
      ["/contact", "/contact"],
      ["/pricing", "/pricing"],
      ["/product", "/product"],
      ["/industries", "/industries"],
      ["/industries/law-firms", "/industries/law-firms"],
      ["/signin", "/signin"],
    ])("keeps %s as %s", (input, expected) => {
      expect(localizeInternalPath(input, "en")).toBe(expected);
    });

    it("strips a stale /ar prefix when switching to English", () => {
      expect(localizeInternalPath("/ar/contact", "en")).toBe("/contact");
      expect(localizeInternalPath("/ar", "en")).toBe("/");
    });
  });

  describe("Arabic context", () => {
    it.each([
      ["/", "/ar"],
      ["/contact", "/ar/contact"],
      ["/pricing", "/ar/pricing"],
      ["/product", "/ar/product"],
      ["/industries", "/ar/industries"],
      ["/industries/law-firms", "/ar/industries/law-firms"],
      ["/signin", "/ar/signin"],
    ])("rewrites %s → %s", (input, expected) => {
      expect(localizeInternalPath(input, "ar")).toBe(expected);
    });

    it("does not double-prefix an already-Arabic path", () => {
      expect(localizeInternalPath("/ar/contact", "ar")).toBe("/ar/contact");
      expect(localizeInternalPath("/ar", "ar")).toBe("/ar");
    });

    it("preserves query string and hash when localizing", () => {
      expect(localizeInternalPath("/pricing?plan=pro#cards", "ar")).toBe(
        "/ar/pricing?plan=pro#cards",
      );
    });
  });

  describe("Non-localizable destinations", () => {
    it.each(["/admin", "/blog", "/blog/some-slug", "/features/ocr"])(
      "leaves %s unchanged in Arabic context",
      (input) => {
        expect(localizeInternalPath(input, "ar")).toBe(input);
      },
    );

    it("leaves external/protocol URLs untouched", () => {
      expect(localizeInternalPath("https://example.com/x", "ar")).toBe(
        "https://example.com/x",
      );
      expect(localizeInternalPath("mailto:hi@example.com", "ar")).toBe(
        "mailto:hi@example.com",
      );
      expect(localizeInternalPath("tel:+1234567890", "ar")).toBe("tel:+1234567890");
      expect(localizeInternalPath("#section", "ar")).toBe("#section");
    });
  });
});
