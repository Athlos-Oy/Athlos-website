#!/usr/bin/env node
// Translator-task extractor.
//
// Diffs English source (i18n/en.json + i18n/parts-en/*) against a
// target locale and outputs a Markdown checklist of strings that
// still need attention. Use this when:
//   - Onboarding a new locale (target locale has only nulls)
//   - Re-sync after English source updates (some target values are stale)
//   - Reviewer audit (filter by file or scope)
//
// Run: `node scripts/i18n-tasks.mjs <locale>`
// e.g. `node scripts/i18n-tasks.mjs de > tasks-de.md`

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/i18n-tasks.mjs <locale>");
  process.exit(2);
}

function deepMerge(a, b) {
  if (b == null || typeof b !== "object" || Array.isArray(b)) return b;
  if (a == null || typeof a !== "object" || Array.isArray(a)) return { ...b };
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
  return out;
}

function loadLocale(lang) {
  let dict = JSON.parse(readFileSync(join(ROOT, `i18n/${lang}.json`), "utf8"));
  const partsDir = join(ROOT, `i18n/parts-${lang}`);
  if (existsSync(partsDir)) {
    for (const f of readdirSync(partsDir).filter(x => x.endsWith(".json")).sort()) {
      dict = deepMerge(dict, JSON.parse(readFileSync(join(partsDir, f), "utf8")));
    }
  }
  return dict;
}

function flatten(d, prefix = "") {
  if (prefix.startsWith("_meta")) return [];
  if (d === null || typeof d !== "object") return [[prefix, d]];
  if (Array.isArray(d)) {
    return d.flatMap((v, i) => flatten(v, `${prefix}[${i}]`));
  }
  return Object.entries(d).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

const en = loadLocale("en");
const tgt = loadLocale(target);
const enMap = new Map(flatten(en));
const tgtMap = new Map(flatten(tgt));

const missing = [];
const nulls = [];
const stale = []; // present in target but no longer in en

for (const [k, enValue] of enMap) {
  if (!tgtMap.has(k)) { missing.push([k, enValue]); continue; }
  if (tgtMap.get(k) === null) { nulls.push([k, enValue]); continue; }
}
for (const [k, tgtValue] of tgtMap) {
  if (!enMap.has(k)) stale.push([k, tgtValue]);
}

const today = new Date().toISOString().slice(0, 10);
const lines = [
  `# ${target} translation tasks`,
  ``,
  `Generated ${today}. Compares \`en.json + parts-en/\` against \`${target}.json + parts-${target}/\`.`,
  ``,
  `- **English source leaves:** ${enMap.size}`,
  `- **Translated:** ${tgtMap.size - nulls.length - stale.length} (${(((tgtMap.size - nulls.length - stale.length) / enMap.size) * 100).toFixed(1)}%)`,
  `- **Missing keys (need translation):** ${missing.length}`,
  `- **Null values (scaffold not filled):** ${nulls.length}`,
  `- **Stale keys (in ${target} but no longer in en):** ${stale.length}`,
  ``,
];

if (missing.length) {
  lines.push(`## Missing keys (${missing.length})`, ``);
  lines.push(`Add these keys to \`i18n/${target}.json\` or the appropriate parts-${target}/ file.`, ``);
  for (const [k, v] of missing) {
    lines.push(`- [ ] \`${k}\` — en value:`);
    lines.push(`  > ${typeof v === "string" ? v : JSON.stringify(v)}`);
  }
  lines.push(``);
}

if (nulls.length) {
  lines.push(`## Null values to translate (${nulls.length})`, ``);
  lines.push(`Replace null in the corresponding \`i18n/parts-${target}/\` file with the German translation.`, ``);
  for (const [k, v] of nulls) {
    lines.push(`- [ ] \`${k}\` — en value:`);
    lines.push(`  > ${typeof v === "string" ? v : JSON.stringify(v)}`);
  }
  lines.push(``);
}

if (stale.length) {
  lines.push(`## Stale keys to review (${stale.length})`, ``);
  lines.push(`These keys exist in ${target} but not in en. Either restore them in en or remove from ${target}.`, ``);
  for (const [k, v] of stale) {
    lines.push(`- [ ] \`${k}\` — ${target} value:`);
    lines.push(`  > ${typeof v === "string" ? v : JSON.stringify(v)}`);
  }
  lines.push(``);
}

if (!missing.length && !nulls.length && !stale.length) {
  lines.push(`## Status`, ``, `No tasks. ${target} is in sync with en.`, ``);
}

console.log(lines.join("\n"));
