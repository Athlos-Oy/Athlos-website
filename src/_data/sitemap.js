// Sitemap configuration. src/sitemap.njk walks `order` and emits one
// <url> entry per path, looking metadata up in `pages`.
//
// Maintenance:
//   - Add a new public page → add it to PAGES below. It is emitted
//     once for the default locale (root) and once under /<locale>/
//     for every other active locale automatically.
//   - Add a new locale → add it to src/_data/locales.js. The sitemap
//     picks it up automatically; nothing to edit here.
//   - Single-locale extras (llms.txt etc.) → add to EXTRA below.
//   - Excluded pages (cefla.html, etc.) → don't list them anywhere.
//
// Priority decays by one tier (-0.1) for localized variants of a page,
// matching the hand-maintained byte-for-byte file shape from before
// the locale-aware refactor.

import locales from "./locales.js";

// One row per public page, in the order it should appear in the
// English block. priority/changefreq/lastmod apply to the EN URL;
// localized variants get priority - 0.1.
const PAGES = [
  { path: "/",                            priority: "1.0", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/",                   priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/wios.html",          priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/ufs.html",           priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/ufs-ip67.html",      priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/manufacturing.html", priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/products/software.html",      priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/applications.html",           priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/about.html",                  priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
  { path: "/contact.html",                priority: "0.7", changefreq: "yearly",  lastmod: "2026-04-15" },
  { path: "/privacy.html",                priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },
];

// Single-locale URLs that don't have localized variants.
const EXTRA = [
  { path: "/technology/direct-conversion.html", priority: "0.9", changefreq: "monthly", lastmod: "2026-07-06" },
  { path: "/technology/faq.html",               priority: "0.7", changefreq: "monthly", lastmod: "2026-07-06" },
  { path: "/llms.txt",      priority: "0.5", changefreq: "monthly", lastmod: "2026-07-03" },
  { path: "/llms-full.txt", priority: "0.5", changefreq: "monthly", lastmod: "2026-07-03" },
];

// Decay priority by one tier for localized variants ("1.0" → "0.9",
// "0.3" → "0.3" floor). Keeps one decimal place, like the original
// hand-maintained file.
function decayPriority(p) {
  const v = Math.max(0.3, parseFloat(p) - 0.1);
  return v.toFixed(1);
}

function localePath(locale, path) {
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

const pages = {};
const order = [];

// EN block first (root-level URLs, full priority).
for (const p of PAGES) {
  pages[p.path] = { priority: p.priority, changefreq: p.changefreq, lastmod: p.lastmod };
  order.push(p.path);
}

// Then one block per non-default active locale, in locales.active order.
for (const loc of locales.active) {
  if (loc === locales.default) continue;
  for (const p of PAGES) {
    const url = localePath(loc, p.path);
    pages[url] = {
      priority: decayPriority(p.priority),
      changefreq: p.changefreq,
      lastmod: p.lastmod,
    };
    order.push(url);
  }
}

// Extras (single-locale, e.g. llms.txt) last.
for (const p of EXTRA) {
  pages[p.path] = { priority: p.priority, changefreq: p.changefreq, lastmod: p.lastmod };
  order.push(p.path);
}

export default { pages, order };
