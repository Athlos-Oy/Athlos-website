// Layout-regression screenshot tests.
// Every page at every viewport. If a PR changes the rendered pixels,
// this test fails — the reviewer either updates the baseline
// (intentional change) or fixes the regression.

import { test, expect } from "@playwright/test";

const PAGES = [
  { name: "home",                   path: "/" },
  { name: "about",                  path: "/about.html" },
  { name: "applications",           path: "/applications.html" },
  { name: "contact",                path: "/contact.html" },
  { name: "privacy",                path: "/privacy.html" },
  { name: "cefla",                  path: "/cefla.html" },
  { name: "products-index",         path: "/products/" },
  { name: "products-wios",          path: "/products/wios.html" },
  { name: "products-ufs",           path: "/products/ufs.html" },
  { name: "products-ufs-ip67",      path: "/products/ufs-ip67.html" },
  { name: "products-manufacturing", path: "/products/manufacturing.html" },
  { name: "products-software",      path: "/products/software.html" },
];

const VIEWPORTS = [
  { name: "mobile-360",  width: 360,  height: 800 },
  { name: "mobile-414",  width: 414,  height: 800 },
  { name: "tablet-768",  width: 768,  height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    test(`${page.name} @ ${vp.name}`, async ({ page: p, context }) => {
      // Block GTM and Google Analytics so tests don't depend on Google's
      // CDN being reachable, and don't pollute analytics with bot hits.
      await context.route(
        /(googletagmanager|google-analytics|fonts\.googleapis\.com|fonts\.gstatic\.com)/,
        (route) => route.abort()
      );

      // Suppress the cookie banner before navigation by seeding localStorage.
      await context.addInitScript(() => {
        try { localStorage.setItem("cookies-accepted", "1"); } catch (_) {}
      });

      // Stop the hero slideshow auto-rotating so the screenshot is stable.
      // Also stop the tech-section video and skip scroll-reveal animations
      // (we want every reveal element in its final state for full-page shots).
      await context.addInitScript(() => {
        const style = document.createElement("style");
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
          .reveal { opacity: 1 !important; transform: none !important; }
          .hero-slide:not(.active) { opacity: 0 !important; }
        `;
        // Inject as soon as <head> exists.
        const inject = () => (document.head || document.documentElement).appendChild(style);
        if (document.head) inject();
        else document.addEventListener("DOMContentLoaded", inject);
      });

      await p.setViewportSize({ width: vp.width, height: vp.height });
      await p.goto(page.path, { waitUntil: "domcontentloaded" });

      // Pause any <video> that might be mid-frame.
      await p.evaluate(() => {
        document.querySelectorAll("video").forEach((v) => {
          v.pause();
          try { v.currentTime = 0; } catch (_) {}
        });
      });

      // Wait for any fonts the page DID load (we blocked Google's, but
      // some might still resolve to local fallbacks).
      await p.evaluate(() => document.fonts && document.fonts.ready);

      await expect(p).toHaveScreenshot(`${page.name}-${vp.name}.png`, {
        fullPage: true,
      });
    });
  }
}
