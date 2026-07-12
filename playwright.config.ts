import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 8080);
const baseURL = process.env.TEST_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Allow overriding the Chromium binary (e.g. on NixOS sandboxes where the
        // bundled Playwright headless-shell can't load system libs). Set
        // PLAYWRIGHT_CHROMIUM_EXECUTABLE to point at a working chromium binary.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
          : undefined,
      },
    },
  ],
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
