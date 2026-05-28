#!/usr/bin/env node
// i18n drift check.
//
// Compares the English source (i18n/en.json + i18n/parts-en/*.json,
// deep-merged) against every other locale dictionary loaded the same
// way. Fails when ANY locale differs from English in any of the ways
// below. Catches both wholesale structural drift and subtle "same leaf
// count, different shape" bugs that a count-only check would miss.
//
// Checks performed:
//   1. JSON parse — every locale file is valid JSON.
//   2. Active-locale coverage — every locale listed in
//      src/_data/locales.js .active has a matching i18n/<lang>.json.
//   3. Missing keys — English has a path the locale does not.
//   4. Extra keys — locale has a path English does not (usually a
//      stale or fork-and-forget bug).
//   5. Type mismatch — same path exists in both, but one side is an
//      object/array and the other is a leaf (a real bug that escapes
//      a path-set check because it shows up as missing+extra under
//      sibling sub-paths).
//   6. Null values — placeholder scaffolds not yet translated.
//   7. Empty strings — translated value is "" or whitespace-only.
//
// Run: `npm run check:i18n`
// Exit status 0 when all locales pass; 1 otherwise.

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

// Categorise a value: "leaf" for primitives, "object" for plain objects,
// "array" for arrays. Used by the type-mismatch check below.
function kindOf(v) {
  if (v === null || typeof v !== "object") return "leaf";
  if (Array.isArray(v)) return "array";
  return "object";
}

// Flatten to [path, value] pairs. Excludes the _meta sub-tree (which is
// intentionally per-locale: each locale carries its own _meta.lastLocalised
// and _meta.status). Array indices use [i] notation; object keys use dots.
function flatten(d, prefix = "") {
  if (prefix.startsWith("_meta")) return [];
  if (kindOf(d) === "leaf") return [[prefix, d]];
  if (kindOf(d) === "array") {
    return d.flatMap((v, i) => flatten(v, `${prefix}[${i}]`));
  }
  return Object.entries(d).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

// Walk both trees in parallel and report any path where the value KINDS
// differ (e.g. EN has an object at "foo.bar", locale has a string).
// Returns an array of { path, enKind, locKind } records.
function findTypeMismatches(en, loc, prefix = "") {
  if (prefix.startsWith("_meta")) return [];
  const ek = kindOf(en);
  const lk = kindOf(loc);
  if (ek !== lk) {
    return [{ path: prefix || "(root)", enKind: ek, locKind: lk }];
  }
  if (ek === "leaf") return [];
  if (ek === "array") {
    const out = [];
    const len = Math.max(en.length, loc.length);
    for (let i = 0; i < len; i++) {
      out.push(...findTypeMismatches(en[i], loc[i], `${prefix}[${i}]`));
    }
    return out;
  }
  // object
  const keys = new Set([...Object.keys(en), ...Object.keys(loc)]);
  const out = [];
  for (const k of keys) {
    if (k === "_meta" && !prefix) continue; // top-level _meta is locale-private
    if (!(k in en) || !(k in loc)) continue; // missing/extra reported elsewhere
    out.push(...findTypeMismatches(en[k], loc[k], prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

// Active locales are the source of truth. Reading them from the same
// module Eleventy reads ensures the check and the build agree on which
// locales are required.
const localesModule = await import(`file://${join(ROOT, "src/_data/locales.js")}`);
const activeLocales = localesModule.default.active;
const defaultLocale = localesModule.default.default;

// Discover every i18n/<lang>.json on disk and cross-reference against
// .active. A locale activated in code but with no dictionary on disk
// would break the build at template render time — surface it here.
const onDisk = readdirSync(join(ROOT, "i18n"))
  .filter(f => f.endsWith(".json"))
  .map(f => f.replace(".json", ""));

const missingFromDisk = activeLocales.filter(l => !onDisk.includes(l));
if (missingFromDisk.length) {
  console.error(`\nFATAL: locales activated in src/_data/locales.js but missing from i18n/:`);
  missingFromDisk.forEach(l => console.error(`  - ${l}.json`));
  process.exit(2);
}

const en = loadLocale(defaultLocale);
const enLeaves = flatten(en);
const enKeys = new Set(enLeaves.map(([k]) => k));

// Compare each non-default locale.
const compareLocales = activeLocales.filter(l => l !== defaultLocale);
let failed = 0;

for (const lang of compareLocales) {
  let dict;
  try { dict = loadLocale(lang); }
  catch (e) { console.error(`[${lang}] LOAD ERROR: ${e.message}`); failed++; continue; }

  const leaves = flatten(dict);
  const keys = new Set(leaves.map(([k]) => k));

  const missing = [...enKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !enKeys.has(k));
  const typeMismatches = findTypeMismatches(en, dict);
  const nulls = leaves.filter(([, v]) => v === null).map(([k]) => k);
  const empties = leaves.filter(([, v]) => typeof v === "string" && v.trim() === "").map(([k]) => k);

  const issues = missing.length + extra.length + typeMismatches.length + nulls.length + empties.length;
  const status = issues ? "FAIL" : "OK";
  if (status === "FAIL") failed++;

  console.log(`\n[${lang}] ${status}  ${leaves.length} leaves`);
  if (missing.length) {
    console.log(`  ${missing.length} missing key(s):`);
    missing.slice(0, 10).forEach(k => console.log(`    - ${k}`));
    if (missing.length > 10) console.log(`    ... and ${missing.length - 10} more`);
  }
  if (extra.length) {
    console.log(`  ${extra.length} extra key(s) (in ${lang} but not en):`);
    extra.slice(0, 10).forEach(k => console.log(`    + ${k}`));
    if (extra.length > 10) console.log(`    ... and ${extra.length - 10} more`);
  }
  if (typeMismatches.length) {
    console.log(`  ${typeMismatches.length} type mismatch(es):`);
    typeMismatches.slice(0, 10).forEach(({ path, enKind, locKind }) =>
      console.log(`    ! ${path}  (en=${enKind}, ${lang}=${locKind})`)
    );
    if (typeMismatches.length > 10) console.log(`    ... and ${typeMismatches.length - 10} more`);
  }
  if (nulls.length) {
    console.log(`  ${nulls.length} null value(s) (scaffold not yet translated):`);
    nulls.slice(0, 10).forEach(k => console.log(`    ? ${k}`));
    if (nulls.length > 10) console.log(`    ... and ${nulls.length - 10} more`);
  }
  if (empties.length) {
    console.log(`  ${empties.length} empty string(s):`);
    empties.slice(0, 10).forEach(k => console.log(`    ø ${k}`));
    if (empties.length > 10) console.log(`    ... and ${empties.length - 10} more`);
  }
}

console.log(`\nEnglish source has ${enLeaves.length} translatable leaves.`);
console.log(`Compared against ${compareLocales.length} locale(s): ${compareLocales.join(", ")}.`);
console.log(failed ? `\n${failed} locale(s) failed drift check.` : "\nAll locales in sync.");
process.exit(failed ? 1 : 0);
