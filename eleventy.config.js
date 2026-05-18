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

export default async function (eleventyConfig) {
  // Static asset folders — copied 1:1.
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("downloads");

  // Un-ported pages — copied as-is until they move into src/.
  // Once a page is ported to src/<name>.njk, remove its line from here.
  eleventyConfig.addPassthroughCopy("about.html");
  eleventyConfig.addPassthroughCopy("applications.html");
  eleventyConfig.addPassthroughCopy("cefla.html");
  eleventyConfig.addPassthroughCopy("contact.html");
  eleventyConfig.addPassthroughCopy("privacy.html");
  eleventyConfig.addPassthroughCopy("products");

  // Root-level non-HTML assets served as-is.
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("llms-full.txt");

  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");

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
