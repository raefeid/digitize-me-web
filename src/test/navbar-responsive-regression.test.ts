import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const navbarSource = fs.readFileSync(path.resolve(__dirname, "../components/layout/Navbar.tsx"), "utf8");

describe("navbar responsive regression guard", () => {
  it("keeps full desktop nav controls gated to xl and below uses compact menu", () => {
    expect(navbarSource).toContain('hidden xl:flex flex-1 min-w-0 justify-center');
    expect(navbarSource).toContain('hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0');
    expect(navbarSource).toContain('xl:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl shrink-0');
    expect(navbarSource).toContain('xl:hidden mt-3 backdrop-blur-xl');
  });

  it("keeps CTA and language controls in the compact flow until xl for English and Arabic", () => {
    expect(navbarSource).toContain('{ code: "en", label: "English", flag: "🇬🇧" }');
    expect(navbarSource).toContain('{ code: "ar", label: "عربي", flag: "🇦🇪" }');
    expect(navbarSource).toContain('hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0');
    expect(navbarSource).toContain('xl:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl shrink-0');
    expect(navbarSource).toContain('launchExternal("https://fotofind.digitizeme.ae/")');
    expect(navbarSource).not.toContain('ctaKey="nav_demo"');
  });

  it("keeps nav items and utility controls non-wrapping in desktop mode", () => {
    const nowrapMatches = navbarSource.match(/whitespace-nowrap/g) ?? [];

    expect(navbarSource).toContain('text-[0.95rem] 2xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap');
    expect(navbarSource).toContain('text-muted-foreground border border-border/40 bg-card');
    expect(nowrapMatches.length).toBeGreaterThanOrEqual(4);
  });
});