import { describe, it, expect } from "vitest";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

describe("sanitizeRichHtml", () => {
  it("returns empty string for empty/nullish input", () => {
    expect(sanitizeRichHtml("")).toBe("");
    expect(sanitizeRichHtml(null)).toBe("");
    expect(sanitizeRichHtml(undefined)).toBe("");
  });

  it("strips <script> tags (stored XSS vector)", () => {
    const out = sanitizeRichHtml('<p>hi</p><script>alert(document.cookie)</script>');
    expect(out).toContain("<p>hi</p>");
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out).not.toContain("alert(");
  });

  it("strips inline event handlers", () => {
    const out = sanitizeRichHtml('<img src="x" onerror="alert(1)">');
    expect(out.toLowerCase()).not.toContain("onerror");
  });

  it("strips javascript: URLs on links", () => {
    const out = sanitizeRichHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("preserves standard rich formatting", () => {
    const html = '<h2>Title</h2><p><strong>bold</strong> and <em>italic</em></p><ul><li>a</li></ul>';
    expect(sanitizeRichHtml(html)).toBe(html);
  });

  it("hardens target=_blank links against tabnabbing", () => {
    const out = sanitizeRichHtml('<a href="https://x.com" target="_blank">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("keeps allowlisted YouTube iframes but drops arbitrary iframes", () => {
    const yt = sanitizeRichHtml('<iframe src="https://www.youtube.com/embed/abc"></iframe>');
    expect(yt.toLowerCase()).toContain("<iframe");
    const evil = sanitizeRichHtml('<iframe src="https://evil.example/x"></iframe>');
    expect(evil.toLowerCase()).not.toContain("<iframe");
  });
});
