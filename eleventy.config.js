// Eleventy configuration — Phase 1 refactor.
//
// Input directory: src/  (new templating tree)
// Output directory: _site/  (gitignored locally; on this feature branch,
//   served by Vercel preview deploys via vercel.json buildCommand. The
//   production branch (main) has its own vercel.json that does NOT build
//   Eleventy — production continues to serve the repo-root *.html files
//   until the rebuild is deliberately promoted.)
//
// Passthrough copy mirrors the existing repo layout so that relative paths
// in templates (e.g. href="css/style.css") resolve identically in the build
// output. Pages that have NOT yet been ported to src/ are copied as-is
// from the repo root, so the preview build serves a complete working site.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import nunjucks from "nunjucks";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load translation dictionaries once at config time. The data cascade
// populates `page.lang` per page; the `t` filter uses that to pick the
// right dictionary. Phase 1 is English-only; Phase 4 adds de.json etc.
const I18N = {
  en: JSON.parse(readFileSync(resolve(__dirname, "i18n/en.json"), "utf8")),
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


  // Root-level non-HTML assets served as-is.
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("llms-full.txt");

  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");
  eleventyConfig.addWatchTarget("i18n/");

  // i18n filter. Usage: {{ "nav.home" | t }}
  // - Looks up dotted-path keys in I18N[page.lang || "en"].
  // - Throws if the key is missing — this is the alarm that prevents
  //   silent drift between locales (Step 24).
  // - Returns the raw string; templates wrap with | safe when the value
  //   contains HTML (entities like &reg;, or <br>). We DON'T return
  //   SafeString automatically because some values are user-visible
  //   plain text that SHOULD be escaped on output.
  eleventyConfig.addFilter("t", function (key, locale) {
    const lang = locale || (this.ctx && this.ctx.page && this.ctx.page.lang) || (this.page && this.page.lang) || "en";
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
