// Playwright configuration for layout-regression screenshot tests.
//
// Tests visit every page at 4 viewport widths and snapshot the full page.
// The baselines committed under tests/screenshots.spec.js-snapshots/ are the
// reference; any future PR that changes pixels fails the build.
//
// Baselines are platform-specific. They are generated on Linux (this
// container + GitHub Actions ubuntu-latest runner) and only valid on Linux.
// Running the tests on macOS/Windows will fail due to font-rendering diffs;
// that's intentional — the CI baseline is the source of truth.
//
// Run locally (Linux only):  npm run test:visual
// Update baselines:           npm run test:visual:update
// View HTML report:           npx playwright show-report

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  // Screenshots live alongside the spec.
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  // Eleventy builds + http-server serves _site/ on port 8080.
  webServer: {
    command: "npx @11ty/eleventy && npx http-server _site -p 8080 -s -c-1",
    port: 8080,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:8080",
    // Deterministic timezone/locale so any locale-dependent rendering
    // (Last-updated dates etc.) is stable across runs.
    locale: "en-GB",
    timezoneId: "Europe/Helsinki",
  },
  // Allow a tiny pixel-level wobble (font hinting between minor Chromium
  // releases) but flag any structural change.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Don't run tests in parallel inside one file — each test mutates the
  // viewport. Use one worker for stable screenshots.
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  forbidOnly: !!process.env.CI,
});
