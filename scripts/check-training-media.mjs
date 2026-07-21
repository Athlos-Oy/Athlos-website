// Build-time integrity check for DC-Air Training Center media.
//
// Reads the media manifest (src/_data/trainingVideos.js) and HEADs every
// blob URL. Any non-200 fails the build — so a renamed blob, a typo'd
// env var, or an expired SAS token is caught at deploy time instead of
// being discovered as silently dead buttons by a customer.
//
// Skips (with a warning) when TRAINING_MEDIA_BASE is unset: local dev
// and the pre-launch preview build intentionally run without media.
//
// Wired into vercel.json buildCommand ahead of the Eleventy build.

import trainingVideos from "../src/_data/trainingVideos.js";

if (!process.env.TRAINING_MEDIA_BASE) {
  console.warn(
    "[check-training-media] TRAINING_MEDIA_BASE not set — skipping media check " +
    "(media buttons will render in their 'available soon' state)."
  );
  process.exit(0);
}

const urls = new Set();
for (const v of trainingVideos.videos) {
  if (v.watchUrl) urls.add(v.watchUrl);
  if (v.downloadCaptionedUrl) urls.add(v.downloadCaptionedUrl);
  if (v.downloadNoCaptionsUrl) urls.add(v.downloadNoCaptionsUrl);
}
for (const u of [
  trainingVideos.zipCaptionedUrl,
  trainingVideos.zipNoCaptionsUrl,
  trainingVideos.guidePdfUrl,
  trainingVideos.ifuPdfUrl,
  trainingVideos.guidePdfDownloadUrl,
  trainingVideos.ifuPdfDownloadUrl,
]) {
  if (u) urls.add(u);
}

console.log(`[check-training-media] Verifying ${urls.size} media URLs…`);

const failures = [];
await Promise.all(
  [...urls].map(async (url) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.status !== 200) {
        failures.push(`${res.status}  ${url.split("?")[0]}`);
      }
    } catch (err) {
      failures.push(`ERR ${err.message}  ${url.split("?")[0]}`);
    }
  })
);

if (failures.length) {
  console.error(`[check-training-media] ${failures.length} media URL(s) FAILED:`);
  for (const f of failures) console.error("  " + f);
  console.error(
    "[check-training-media] Build aborted. Check the blob names in Azure, " +
    "TRAINING_MEDIA_BASE/TRAINING_MEDIA_QUERY env vars, and the SAS token validity."
  );
  process.exit(1);
}

console.log("[check-training-media] All media URLs OK.");
