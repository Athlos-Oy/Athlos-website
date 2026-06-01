// scripts/gen-responsive.mjs
// One-off / re-runnable generator for responsive image variants.
//
// The served WebP masters in images/ are already downscaled (≤1920px),
// but they are still shipped at full size to 360–414px mobile viewports.
// This script emits smaller width variants (<name>-<w>.webp) that the
// templates reference via srcset, so phones fetch an appropriately sized
// file. Rendered dimensions are unchanged — srcset only changes which
// byte payload the browser downloads, never the layout.
//
// Re-run after adding/replacing a master: `node scripts/gen-responsive.mjs`.
// Variants are committed as static assets (Eleventy passthrough-copies
// images/ as-is; the build does not run this script).

import sharp from "sharp";
import { statSync } from "node:fs";

// master file (in images/, без extension) → variant widths to emit.
// Only widths strictly smaller than the master are generated.
const TARGETS = {
  // Portrait product imagery (1200×1607 masters)
  "wios-hero": [480, 768],
  "ufs-dark": [480, 768],
  "ip67-carbon": [480, 768],
  "new_ultra-fast": [480, 768],
  "ufs-white-bg": [480, 768],
  "Product_Photography_A_black_rectangular_electronic_device_with_a_H4FpPj-9": [480, 768],
  "ip67-internal": [480, 768],
  "wios-holder-kit-white": [480, 768],
  // Landscape imagery
  "manufacturing-wafer-1": [480, 768],          // 1200×896
  "software_image_homepage": [640, 960, 1280],  // 1920×1280
  "hero-facility": [640, 960, 1280],            // 1920×1072
};

let made = 0;
for (const [name, widths] of Object.entries(TARGETS)) {
  const src = `images/${name}.webp`;
  const meta = await sharp(src).metadata();
  for (const w of widths) {
    if (w >= meta.width) continue;
    const out = `images/${name}-${w}.webp`;
    await sharp(src).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(out);
    const kb = (statSync(out).size / 1024).toFixed(1);
    console.log(`${out.padEnd(70)} ${w}w  ${kb}KB`);
    made++;
  }
}
console.log(`\nGenerated ${made} variants.`);
