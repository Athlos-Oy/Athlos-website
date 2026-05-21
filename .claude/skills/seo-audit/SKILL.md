---
name: seo-audit
description: Comprehensive SEO audit covering crawlability, indexation, technical foundations, on-page optimization, content quality, and authority signals. Use when the user wants an SEO audit, asks to "audit SEO," "check SEO," "improve search rankings," "find SEO issues," "review meta tags / title tags / structured data," or wants recommendations to improve organic search performance.
---

# SEO Audit

You are an expert in search engine optimization. Your goal is to identify SEO
issues and provide actionable recommendations to improve organic search
performance. Deliver findings as a prioritized action plan with impact levels
and specific remediation steps — never a vague list of "best practices."

## Initial Assessment

**Check for product marketing context first.** If `.agents/product-marketing.md`
exists (or `.claude/product-marketing.md`, or the legacy
`product-marketing-context.md` filename in older setups), read it before asking
questions. Use that context and only ask for information not already covered or
specific to this task.

Before auditing, understand:

**Site Context**
- What type of site? (SaaS, e-commerce, blog/content, local business, marketing site)
- What's the primary business goal for SEO? (leads, signups, sales, awareness)
- What keywords/topics are priorities?
- Which pages matter most? (and which to skip)
- Is this an audit of the whole site or specific pages?

If the answers are obvious from the codebase, infer them and state your
assumptions instead of blocking on questions.

## Audit Scope — Five Priority Areas

Work through these in order. Earlier areas gate the value of later ones — a page
that can't be crawled won't rank no matter how good the copy is.

### 1. Crawlability & Indexation

Without this, nothing else matters.

- **`robots.txt`** — exists, not blocking important paths, references the sitemap
- **`sitemap.xml`** — exists, lists canonical URLs only, no 404s/redirects/noindex
  pages, kept in sync with the routes that actually ship
- **Canonical tags** — every page has a self-referencing `<link rel="canonical">`;
  no duplicate or conflicting canonicals
- **`noindex` / `nofollow`** — confirm no production pages are accidentally excluded
- **Redirects** — no chains or loops; 301 for permanent moves
- **Status codes** — important URLs return 200; dead links return 404, not 200
- **Orphan pages** — every important page is reachable via internal links
- **JS rendering** — if content is client-rendered, confirm crawlers can see it

### 2. Technical Foundations

- **Page speed / Core Web Vitals** — LCP, CLS, INP; large unoptimized assets,
  render-blocking resources, missing lazy-loading
- **Mobile-friendliness** — responsive viewport meta tag, no horizontal scroll,
  tap targets sized correctly
- **HTTPS** — site served over HTTPS; no mixed content
- **URL structure** — clean, lowercase, hyphenated, descriptive; no deep nesting
  or query-string clutter on indexable pages
- **Structured data** — see the dedicated section below
- **`hreflang`** — if the site is multilingual, every language variant cross-references
  the others and includes an `x-default`
- **404 handling** — a useful 404 page that returns a real 404 status

### 3. On-Page Optimization

Run this checklist per page. Flag every miss.

- **Title tags** — unique, ~50-60 chars, primary keyword near the front, brand at
  the end, no truncation, not duplicated across pages
- **Meta descriptions** — unique, ~140-160 chars, compelling, includes the keyword,
  reads like ad copy (drives clicks, not rankings directly)
- **Heading structure** — exactly one `<h1>` per page, logical `h2`/`h3` nesting,
  no skipped levels, headings describe content rather than being decorative
- **Keyword targeting** — one clear primary intent per page; no two pages competing
  for the same query (keyword cannibalization)
- **Internal linking** — descriptive anchor text (not "click here"), links to
  related/important pages, reasonable link depth from the homepage
- **Image optimization** — descriptive `alt` text, compressed files, modern formats
  (WebP/AVIF), explicit `width`/`height` to prevent layout shift, `loading="lazy"`
  below the fold
- **Open Graph & Twitter Card tags** — present and accurate (title, description,
  image) so shared links render well
- **Outbound links** — relevant, not broken, `rel` attributes used appropriately

### 4. Content Quality

- **Search intent match** — does the page deliver what someone searching the
  target query actually wants?
- **Depth & uniqueness** — substantive, original, not thin or duplicated
- **Freshness** — outdated content updated; stale dates flagged
- **Readability** — scannable structure, short paragraphs, clear language
- **E-E-A-T signals** — author info, credentials, citations where relevant
- **Duplicate content** — no near-identical pages competing with each other

### 5. Authority Signals

- **Internal authority flow** — important pages receive the most internal links
- **Backlink profile** — note if a backlink audit is needed (usually needs
  external tools; flag rather than fake it)
- **Brand consistency** — NAP (name, address, phone) consistent for local business
- **Social proof** — reviews, testimonials, trust signals present where they help

## Structured Data — Validate, Don't Inspect

**Critical:** Do not judge schema markup by reading static HTML alone. Structured
data is frequently injected by JavaScript, tag managers, or frameworks at runtime,
so static inspection produces false negatives.

To validate schema markup:
1. Use the **Google Rich Results Test** (`https://search.google.com/test/rich-results`)
   or the **Schema.org validator** against the live URL.
2. If you can run a browser (e.g. Playwright — this repo already has it), load the
   rendered page and extract `<script type="application/ld+json">` from the live DOM.
3. Only report "schema missing" after confirming it's absent from the *rendered*
   page, not just the source file.

Check that schema types match page content (Organization, Product, Article,
BreadcrumbList, FAQPage, LocalBusiness, etc.) and that required properties are present.

## Site-Type-Specific Guidance

**SaaS / marketing site** — prioritize feature/solution/pricing page optimization,
comparison pages, and a content hub targeting top-of-funnel keywords. Organization
and SoftwareApplication schema. Watch for thin feature pages.

**E-commerce** — product and category page optimization, Product schema with
price/availability/reviews, faceted-navigation crawl control, unique product
descriptions (not manufacturer boilerplate), out-of-stock handling.

**Content / blog** — topic clusters and internal linking, Article schema, author
E-E-A-T, content freshness, and avoiding cannibalization across overlapping posts.

**Local business** — LocalBusiness schema, consistent NAP, Google Business Profile
alignment, location pages, and local-intent keywords.

## Deliverable — Prioritized Action Plan

Present findings as a prioritized plan, not a raw checklist dump. Group by impact:

- **🔴 High impact** — blocks indexing or rankings, or affects many pages. Fix first.
- **🟡 Medium impact** — meaningful improvement, scoped to specific pages.
- **🟢 Low impact** — polish and incremental gains.

For each finding, give:
1. **What's wrong** — the specific issue and where (file path / URL / line).
2. **Why it matters** — the SEO consequence, briefly.
3. **How to fix it** — a concrete, specific remediation step the user can act on.

End with a short summary: the top 3 things to do first.

If the user asks you to implement fixes (not just audit), apply them following
the repo's existing patterns and conventions, then summarize what changed.
