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

    "/de/":                              { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/":                     { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/wios.html":            { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/ufs.html":             { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/ufs-ip67.html":        { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/manufacturing.html":   { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/products/software.html":        { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/applications.html":             { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/about.html":                    { priority: "0.6", changefreq: "monthly", lastmod: "2026-04-15" },
    "/de/contact.html":                  { priority: "0.6", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/de/privacy.html":                  { priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },

    "/it/":                              { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/":                     { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/wios.html":            { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/ufs.html":             { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/ufs-ip67.html":        { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/manufacturing.html":   { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/products/software.html":        { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/applications.html":             { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/about.html":                    { priority: "0.6", changefreq: "monthly", lastmod: "2026-04-15" },
    "/it/contact.html":                  { priority: "0.6", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/it/privacy.html":                  { priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },

    "/es/":                              { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/":                     { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/wios.html":            { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/ufs.html":             { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/ufs-ip67.html":        { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/manufacturing.html":   { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/products/software.html":        { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/applications.html":             { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/about.html":                    { priority: "0.6", changefreq: "monthly", lastmod: "2026-04-15" },
    "/es/contact.html":                  { priority: "0.6", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/es/privacy.html":                  { priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },

    "/fr/":                              { priority: "0.9", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/":                     { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/wios.html":            { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/ufs.html":             { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/ufs-ip67.html":        { priority: "0.8", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/manufacturing.html":   { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/products/software.html":        { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/applications.html":             { priority: "0.7", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/about.html":                    { priority: "0.6", changefreq: "monthly", lastmod: "2026-04-15" },
    "/fr/contact.html":                  { priority: "0.6", changefreq: "yearly",  lastmod: "2026-04-15" },
    "/fr/privacy.html":                  { priority: "0.3", changefreq: "yearly",  lastmod: "2026-04-15" },

    "/llms.txt":                         { priority: "0.5", changefreq: "monthly", lastmod: "2026-04-17" },
    "/llms-full.txt":                    { priority: "0.5", changefreq: "monthly", lastmod: "2026-04-17" },
  },

  // Display order in the sitemap. EN block first (preserved verbatim
  // from the original hand-maintained file), then DE/IT/ES/FR locale
  // blocks mirroring the EN order, then the llms.txt entries last.
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

    "/de/",
    "/de/products/",
    "/de/products/wios.html",
    "/de/products/ufs.html",
    "/de/products/ufs-ip67.html",
    "/de/products/manufacturing.html",
    "/de/products/software.html",
    "/de/applications.html",
    "/de/about.html",
    "/de/contact.html",
    "/de/privacy.html",

    "/it/",
    "/it/products/",
    "/it/products/wios.html",
    "/it/products/ufs.html",
    "/it/products/ufs-ip67.html",
    "/it/products/manufacturing.html",
    "/it/products/software.html",
    "/it/applications.html",
    "/it/about.html",
    "/it/contact.html",
    "/it/privacy.html",

    "/es/",
    "/es/products/",
    "/es/products/wios.html",
    "/es/products/ufs.html",
    "/es/products/ufs-ip67.html",
    "/es/products/manufacturing.html",
    "/es/products/software.html",
    "/es/applications.html",
    "/es/about.html",
    "/es/contact.html",
    "/es/privacy.html",

    "/fr/",
    "/fr/products/",
    "/fr/products/wios.html",
    "/fr/products/ufs.html",
    "/fr/products/ufs-ip67.html",
    "/fr/products/manufacturing.html",
    "/fr/products/software.html",
    "/fr/applications.html",
    "/fr/about.html",
    "/fr/contact.html",
    "/fr/privacy.html",

    "/llms.txt",
    "/llms-full.txt",
  ],
};
