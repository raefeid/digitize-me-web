import { test, expect, type ConsoleMessage, type Request, type Response } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { discoverPublicRoutes } from "./helpers/discover-routes";
import { isAllowlistedWarning, isIgnoredRequestUrl } from "./helpers/console-allowlist";

const routes = discoverPublicRoutes();

if (routes.length === 0) {
  throw new Error(
    "Route discovery returned 0 routes — check e2e/helpers/discover-routes.ts against src/App.tsx",
  );
}

const SCREENSHOT_DIR = path.resolve(process.cwd(), "test-results/route-screenshots");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function safeName(url: string): string {
  return url.replace(/^\//, "").replace(/[^a-z0-9_-]+/gi, "_") || "root";
}

for (const route of routes) {
  test(`[${route.locale}] ${route.pattern} renders without console errors or failed requests`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const pageErrors: string[] = [];
    const failedResponses: string[] = [];

    page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error") {
        consoleErrors.push(text);
      } else if (type === "warning") {
        if (!isAllowlistedWarning(text)) {
          consoleWarnings.push(text);
        }
      }
    });

    page.on("pageerror", (err: Error) => {
      pageErrors.push(`${err.name}: ${err.message}\n${err.stack ?? ""}`);
    });

    page.on("requestfailed", (req: Request) => {
      const url = req.url();
      if (isIgnoredRequestUrl(url)) return;
      const failure = req.failure()?.errorText ?? "unknown";
      failedResponses.push(`REQUEST FAILED ${req.method()} ${url} — ${failure}`);
    });

    page.on("response", (res: Response) => {
      const status = res.status();
      const url = res.url();
      if (status < 400) return;
      if (isIgnoredRequestUrl(url)) return;
      // Only record same-origin / app requests; tracking pixels live elsewhere.
      failedResponses.push(`HTTP ${status} ${res.request().method()} ${url}`);
    });

    const response = await page.goto(route.url, { waitUntil: "networkidle" });
    expect(response, `no response for ${route.url}`).not.toBeNull();
    expect(
      response!.status(),
      `top-level navigation to ${route.url} returned ${response!.status()}`,
    ).toBeLessThan(400);

    // Give lazy components, react-query and any post-mount effects a beat to settle.
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Sanity: <html lang> should reflect the requested locale.
    const htmlLang = await page.locator("html").getAttribute("lang");
    if (route.locale === "ar") {
      expect(htmlLang, `<html lang> on ${route.url}`).toMatch(/^ar/i);
    }

    // Always capture a screenshot for visual diffing.
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${route.locale}_${safeName(route.url)}.png`),
      fullPage: true,
    });

    const problems: string[] = [];
    if (pageErrors.length) problems.push(`PAGE ERRORS:\n${pageErrors.join("\n---\n")}`);
    if (consoleErrors.length) problems.push(`CONSOLE ERRORS:\n${consoleErrors.join("\n---\n")}`);
    if (consoleWarnings.length) problems.push(`CONSOLE WARNINGS (not allowlisted):\n${consoleWarnings.join("\n---\n")}`);
    if (failedResponses.length) problems.push(`NETWORK:\n${failedResponses.join("\n")}`);

    expect(
      problems,
      `Issues on ${route.url}:\n\n${problems.join("\n\n")}`,
    ).toEqual([]);
  });
}
