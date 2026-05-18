// Environment data made available to templates.
//
// VERCEL_ENV is set automatically by Vercel: "production", "preview",
// or "development". Local builds (npm run build / dev) have it
// unset — we treat that as "production-like" so local output matches
// what production deploys would emit.
//
// Used by src/robots.njk to add `Disallow: /` on preview deploys as
// a belt-and-braces guard on top of Vercel's automatic x-robots-tag
// noindex header.

export default {
  vercelEnv: process.env.VERCEL_ENV || "production",
  isProduction: (process.env.VERCEL_ENV || "production") === "production",
};
