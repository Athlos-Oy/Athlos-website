// Eleventy configuration — Phase 1 refactor.
//
// Input directory: src/  (new templating tree)
// Output directory: _site/  (gitignored, NOT served by production Vercel
//   deploys yet — the existing repo-root *.html files continue to serve.)
//
// Passthrough copy mirrors the existing repo layout so that relative paths
// in templates (e.g. href="css/style.css") resolve identically in the build
// output. Nothing is moved; assets are copied from the project root.

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("downloads");

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
