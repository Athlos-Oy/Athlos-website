// Eleventy configuration.
//
// Input:  src/      — templating tree (single source of truth)
// Output: _site/    — gitignored; served by Vercel via vercel.json
//                     buildCommand "npx @11ty/eleventy".
//
// ─── Architecture (read this before editing) ──────────────────────────
// Every public page is a single .njk file under src/ that paginates
// over locales.active (see src/_data/locales.js). For each active
// locale, Eleventy renders the page once and writes it to:
//   /<page>.html               for the default locale (en)
//   /<locale>/<page>.html      for every other active locale
//
// Shared chrome (head meta, nav, footer, lang switcher, JSON-LD
// org block) lives in src/_includes/partials/. Each page just sets
// pageKey in its front-matter; meta and breadcrumbs are derived from
// the i18n dictionary keyed by that pageKey.
//
// i18n loader: i18n/<locale>.json is the base; i18n/parts-<locale>/
// JSON files are deep-merged on top in alpha order so per-page strings
// can be edited without merge contention on a single file. The `t`
// filter throws on missing keys — that is the alarm that prevents
// silent drift. scripts/i18n-check.mjs enforces leaf-count parity.
//
// ─── How to: add a new page ───────────────────────────────────────────
// 1. Add the page template under src/ (or src/products/).
// 2. Set pageKey in its front-matter.
// 3. Add pages.<pageKey>.* keys to i18n/parts-en/pages-<key>.json AND
//    to the matching file in every other parts-<locale>/ dir.
// 4. Add the canonical URL to src/_data/sitemap.js PAGES array; the
//    sitemap script will emit localized variants automatically.
// 5. npm run check:i18n && npm run build.
//
// ─── How to: add a new locale ─────────────────────────────────────────
// 1. Add "xx" to locales.active in src/_data/locales.js, plus a label.
// 2. Create i18n/xx.json + i18n/parts-xx/ with every key the other
//    locales have. scripts/i18n-check.mjs will list any missing keys.
// 3. Build. The sitemap, hreflang tags, language switcher, footer,
//    and nav pick the new locale up automatically. No template edits.
//
// ─── How to: update shared content centrally ──────────────────────────
//   Site constants (legal name, address, business ID, GTM ID, email):
//     src/_data/site.json — used by footer.njk, head-meta.njk, JSON-LD.
//   Organization JSON-LD (description / areaServed / contactType):
//     jsonld.organization.* in i18n/<locale>.json — single source of
//     truth for all per-product JSON-LD partials.
//   Nav, footer, head meta, JSON-LD partials:
//     src/_includes/partials/ — one file each, not duplicated per
//     locale.
//
// ─── Repo-root files ──────────────────────────────────────────────────
// The only HTML at the repo root is cefla.html (English-only gated
// partner landing page; passthrough-copied below). Every other public
// page is generated from src/. robots.txt / sitemap.xml / llms*.txt
// are generated from their respective src/*.njk templates — there is
// no hand-maintained root copy. Do not check in static HTML or text
// files at the repo root; they will be ignored by Vercel (which only
// serves _site/), and they create confusion about source of truth.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import nunjucks from "nunjucks";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Deep-merge two plain JSON objects: b's values win over a's, recursing
// into nested objects. Arrays are replaced, not merged.
function deepMerge(a, b) {
  if (b == null || typeof b !== "object" || Array.isArray(b)) return b;
  if (a == null || typeof a !== "object" || Array.isArray(a)) return { ...b };
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
  return out;
}

// Load translation dictionaries once at config time.
// - i18n/en.json is the base (shared chrome: nav, footer, productSubnav, _meta).
// - i18n/parts/<pageKey>.json each contribute keys (typically under pages.<key>)
//   and are deep-merged on top of the base. Parts let parallel-edit workflows
//   add per-page string sets without racing on a single file.
// Phase 4 adds de.json + parts-de/ alongside; subsequent Phase 4 batches add
// it/es. Phase 5 adds fr.json + parts-fr/.
function loadLocale(lang) {
  let dict = JSON.parse(readFileSync(resolve(__dirname, `i18n/${lang}.json`), "utf8"));
  const partsDir = resolve(__dirname, `i18n/parts-${lang}`);
  if (existsSync(partsDir)) {
    for (const f of readdirSync(partsDir).filter(x => x.endsWith(".json")).sort()) {
      const part = JSON.parse(readFileSync(join(partsDir, f), "utf8"));
      dict = deepMerge(dict, part);
    }
  }
  return dict;
}

const I18N = {
  en: loadLocale("en"),
  de: loadLocale("de"),
  it: loadLocale("it"),
  es: loadLocale("es"),
  fr: loadLocale("fr"),
};

export default async function (eleventyConfig) {
  // Static asset folders — copied 1:1.
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("downloads");

  // cefla.html — English-only by design (gated download page; not translated).
  // Stays as a passthrough copy permanently, no .njk template.
  eleventyConfig.addPassthroughCopy("cefla.html");


  // robots.txt, sitemap.xml, llms.txt, llms-full.txt are now generated
  // by src/robots.njk, src/sitemap.njk, src/llms.njk, src/llms-full.njk
  // (Step 8). The hand-maintained root files stay in git for now until
  // we confirm the templated output matches them on production.

  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");
  eleventyConfig.addWatchTarget("i18n/");
  eleventyConfig.addWatchTarget("i18n/parts-en/");

  // Returns the URL for the same page in a different locale.
  // Input: a canonical URL or a root-relative path.
  //   "/about.html"                  | localeUrl("en") → "/about.html"
  //   "/about.html"                  | localeUrl("de") → "/de/about.html"
  //   "https://athlos.fi/about.html" | localeUrl("de") → "https://athlos.fi/de/about.html"
  // Pages already at /xx/... get their existing locale prefix swapped.
  // The default locale (en) lives at the root, no prefix.
  eleventyConfig.addFilter("localeUrl", function (input, targetLocale) {
    if (!input) return input;
    const isFull = /^https?:\/\//.test(input);
    let origin = "";
    let path = input;
    if (isFull) {
      const m = input.match(/^(https?:\/\/[^/]+)(.*)$/);
      origin = m[1];
      path = m[2] || "/";
    }
    const known = ["en", "de", "fr", "it", "es"];
    const stripRe = new RegExp(`^/(?:${known.join("|")})(/|$)`);
    const sm = path.match(stripRe);
    if (sm) path = path.slice(sm[0].length - 1) || "/";
    if (targetLocale && targetLocale !== "en") {
      path = "/" + targetLocale + (path === "/" ? "/" : path);
    }
    return origin + path;
  });

  // i18n filter. Usage: {{ "nav.home" | t }}
  // - Looks up dotted-path keys in I18N[page.lang || "en"].
  // - Throws if the key is missing — this is the alarm that prevents
  //   silent drift between locales (Step 24).
  // - Returns the raw string; templates wrap with | safe when the value
  //   contains HTML (entities like &reg;, or <br>). We DON'T return
  //   SafeString automatically because some values are user-visible
  //   plain text that SHOULD be escaped on output.
  eleventyConfig.addFilter("t", function (key, locale) {
    const lang = locale
      || (this.ctx && this.ctx.lang)
      || (this.ctx && this.ctx.page && this.ctx.page.lang)
      || (this.page && this.page.lang)
      || "en";
    const dict = I18N[lang];
    if (!dict) {
      throw new Error(`i18n: no dictionary loaded for locale "${lang}"`);
    }
    const value = key.split(".").reduce(
      (o, k) => (o != null && typeof o === "object" ? o[k] : undefined),
      dict
    );
    if (value === undefined) {
      throw new Error(`i18n: missing key "${key}" in locale "${lang}"`);
    }
    // Mark as safe — values in en.json are authored strings that may
    // contain intentional HTML (<br>, <sup>) or entities (&reg;, &middot;).
    // Translators are trusted to author markup correctly; we don't want
    // Nunjucks to escape their apostrophes, ampersands, or tags.
    return new nunjucks.runtime.SafeString(value);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
