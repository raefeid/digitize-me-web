import { describe, it, expect } from "vitest";
import { auditCtaDestination } from "@/lib/auditCtaDestinations";

const audit = (kind: string, value: string) =>
  auditCtaDestination("test", kind, value);

describe("auditCtaDestination", () => {
  describe("clean values (no finding)", () => {
    it.each([
      ["link", "/contact"],
      ["link", "/pricing?plan=pro"],
      ["link", "/industries/law-firms"],
      ["link", "/"],
      ["link", "#hero"],
      ["external", "https://example.com"],
      ["email", "info@example.com"],
      ["phone", "+97145808611"],
      ["whatsapp", "+971565226587"],
    ])("returns null for %s = %s", (kind, value) => {
      expect(audit(kind, value)).toBeNull();
    });
  });

  describe("ar_prefix (error)", () => {
    it("flags /ar/contact and suggests /contact", () => {
      const f = audit("link", "/ar/contact")!;
      expect(f.issues).toContain("ar_prefix");
      expect(f.suggested).toBe("/contact");
      expect(f.severity).toBe("error");
    });

    it("flags /ar root", () => {
      const f = audit("link", "/ar")!;
      expect(f.issues).toContain("ar_prefix");
      expect(f.suggested).toBe("/");
    });
  });

  describe("missing_leading_slash (warning)", () => {
    it("flags 'contact' and suggests /contact", () => {
      const f = audit("link", "contact")!;
      expect(f.issues).toContain("missing_leading_slash");
      expect(f.suggested).toBe("/contact");
      expect(f.severity).toBe("warning");
    });
  });

  describe("non_localizable (info)", () => {
    it.each(["/admin", "/blog", "/blog/post-slug", "/features/ocr"])(
      "flags %s",
      (path) => {
        const f = audit("link", path)!;
        expect(f.issues).toContain("non_localizable");
      },
    );
  });

  describe("wrong-kind detection", () => {
    it("flags absolute URL stored as link", () => {
      const f = audit("link", "https://calendly.com/x")!;
      expect(f.issues).toContain("external_url_as_link");
    });

    it("flags email stored as link", () => {
      const f = audit("link", "info@example.com")!;
      expect(f.issues).toContain("email_or_phone_as_link");
    });
  });

  describe("empty values", () => {
    it("flags empty link kind", () => {
      const f = audit("link", "")!;
      expect(f.issues).toEqual(["empty"]);
    });

    it("flags empty email kind", () => {
      const f = audit("email", "")!;
      expect(f.issues).toEqual(["empty"]);
    });
  });

  describe("combined issues", () => {
    it("ar_prefix + missing slash → both reported, ar_prefix wins severity", () => {
      const f = audit("link", "ar/contact")!;
      expect(f.issues).toContain("missing_leading_slash");
      expect(f.suggested).toBe("/contact");
    });
  });
});
