// Sitemap configuration. The src/sitemap.njk template walks
// collections.all, looks up each rendered URL here, and emits <url>
// entries in priority order.
//
// Add a new URL by adding it to `pages` below. URLs not listed are
// silently excluded (cefla.html, etc.).

export default {
  // Crawl priorities and change frequencies, indexed by output URL.
  // lastmod = last meaningful content change for the URL.
  // priority is stored as a string so the rendered XML always has one
  // decimal place ("1.0" not "1") — matches the original hand-maintained
  // sitemap byte-for-byte.
  pages: {
    "/":                                 { priority: "1.0", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/":                        { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/wios.html":               { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/ufs.html":                { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/ufs-ip67.html":           { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/manufacturing.html":      { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/products/software.html":           { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/applications.html":                { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/about.html":                       { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/contact.html":                     { priority: "0.7", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/privacy.html":                     { priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/llms.txt":                         { priority: "0.5", changefreq: "monthly", lastmod: "2026-04-17" },
    "/llms-full.txt":                    { priority: "0.5", changefreq: "monthly", lastmod: "2026-04-17" },
  },

  // Display order in the sitemap. Mirrors the original hand-maintained
  // file's ordering so the rendered output is byte-equivalent.
  order: [
    "/",
    "/products/",
    "/products/wios.html",
    "/products/ufs.html",
    "/products/ufs-ip67.html",
    "/products/manufacturing.html",
    "/products/software.html",
    "/applications.html",
    "/about.html",
    "/contact.html",
    "/privacy.html",
    "/llms.txt",
    "/llms-full.txt",
  ],
};
