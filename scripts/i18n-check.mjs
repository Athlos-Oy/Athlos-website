#!/usr/bin/env node
// i18n drift alarm (Step 24).
//
// Compares the English source (i18n/en.json + i18n/parts-en/*.json,
// deep-merged) against every other locale dictionary loaded the same way.
// Fails CI when:
//   - any locale file is invalid JSON
//   - any locale is missing a key the English source has
//   - any locale has a key English does not (typically a stale or
//     fork-and-forget bug)
//   - any locale value is null (i.e., scaffold not yet translated)
//
// Run: `npm run check:i18n`
// CI:  invoked by .github/workflows/playwright-visual.yml or a
//      dedicated workflow that fails the PR on drift.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function deepMerge(a, b) {
  if (b == null || typeof b !== "object" || Array.isArray(b)) return b;
  if (a == null || typeof a !== "object" || Array.isArray(a)) return { ...b };
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
  return out;
}

function loadLocale(lang) {
  const main = join(ROOT, `i18n/${lang}.json`);
  if (!existsSync(main)) throw new Error(`missing ${main}`);
  let dict = JSON.parse(readFileSync(main, "utf8"));
  const partsDir = join(ROOT, `i18n/parts-${lang}`);
  if (existsSync(partsDir)) {
    for (const f of readdirSync(partsDir).filter(x => x.endsWith(".json")).sort()) {
      const part = JSON.parse(readFileSync(join(partsDir, f), "utf8"));
      dict = deepMerge(dict, part);
    }
  }
  return dict;
}

// Flat list of [dotted-path, leaf-value] for every leaf in the dict,
// excluding the _meta sub-tree (which is intentionally per-locale).
function flatten(d, prefix = "") {
  if (prefix.startsWith("_meta")) return [];
  if (d === null || typeof d !== "object") return [[prefix, d]];
  if (Array.isArray(d)) {
    return d.flatMap((v, i) => flatten(v, `${prefix}[${i}]`));
  }
  return Object.entries(d).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

const args = process.argv.slice(2);
const showAllLocales = args.includes("--all");
// Always compare en against every other locale dictionary present.
const allLocales = readdirSync(join(ROOT, "i18n"))
  .filter(f => f.endsWith(".json") && f !== "en.json")
  .map(f => f.replace(".json", ""));

const en = loadLocale("en");
const enLeaves = flatten(en);
const enKeys = new Set(enLeaves.map(([k]) => k));

let failed = 0;
for (const lang of allLocales) {
  let dict;
  try { dict = loadLocale(lang); }
  catch (e) { console.error(`[${lang}] LOAD ERROR: ${e.message}`); failed++; continue; }

  const leaves = flatten(dict);
  const keys = new Set(leaves.map(([k]) => k));
  const missing = [...enKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !enKeys.has(k));
  const nulls = leaves.filter(([, v]) => v === null).map(([k]) => k);

  const status = (missing.length || extra.length || nulls.length) ? "FAIL" : "OK";
  if (status === "FAIL") failed++;

  console.log(`\n[${lang}] ${status}  ${leaves.length} leaves`);
  if (missing.length) {
    console.log(`  ${missing.length} key(s) missing in ${lang}:`);
    missing.slice(0, 10).forEach(k => console.log(`    - ${k}`));
    if (missing.length > 10) console.log(`    ... and ${missing.length - 10} more`);
  }
  if (extra.length) {
    console.log(`  ${extra.length} key(s) in ${lang} but not in en (stale or extra):`);
    extra.slice(0, 10).forEach(k => console.log(`    + ${k}`));
    if (extra.length > 10) console.log(`    ... and ${extra.length - 10} more`);
  }
  if (nulls.length) {
    console.log(`  ${nulls.length} null value(s) in ${lang} (scaffold not yet translated):`);
    nulls.slice(0, 10).forEach(k => console.log(`    ? ${k}`));
    if (nulls.length > 10) console.log(`    ... and ${nulls.length - 10} more`);
  }
}

console.log(`\nEnglish source has ${enLeaves.length} translatable leaves.`);
console.log(`Compared against ${allLocales.length} other locale(s).`);
console.log(failed ? `\n${failed} locale(s) failed drift check.` : "\nAll locales in sync.");
process.exit(failed ? 1 : 0);
