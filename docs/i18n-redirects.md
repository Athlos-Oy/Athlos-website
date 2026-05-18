# Locale short-URL redirects for vercel.json

Pattern for short URLs in non-English locales. Mirror the existing
English short URLs (`/ufs`, `/contact`, `/cefla` etc. in
`vercel.json`) but prefixed with the locale.

**Not added yet.** Add when each locale's content actually exists.
Adding them earlier would 404 users — the destinations don't render
until the locale is in `locales.active` in `src/_data/locales.js`.

## When DE goes live (Phase 4)

Add these entries to the `redirects` array in `vercel.json`,
alongside the existing English ones:

```json
{ "source": "/de/ufs",                               "destination": "/de/products/ufs.html",        "statusCode": 301 },
{ "source": "/de/ufs/",                              "destination": "/de/products/ufs.html",        "statusCode": 301 },
{ "source": "/de/industrial-ip67-tdi",               "destination": "/de/products/ufs-ip67.html",   "statusCode": 301 },
{ "source": "/de/industrial-ip67-tdi/",              "destination": "/de/products/ufs-ip67.html",   "statusCode": 301 },
{ "source": "/de/wireless-intraoral-sensor",         "destination": "/de/products/wios.html",       "statusCode": 301 },
{ "source": "/de/wireless-intraoral-sensor/",        "destination": "/de/products/wios.html",       "statusCode": 301 },
{ "source": "/de/applications-and-market-segments",  "destination": "/de/applications.html",        "statusCode": 301 },
{ "source": "/de/applications-and-market-segments/", "destination": "/de/applications.html",        "statusCode": 301 },
{ "source": "/de/athlos",                            "destination": "/de/about.html",               "statusCode": 301 },
{ "source": "/de/athlos/",                           "destination": "/de/about.html",               "statusCode": 301 },
{ "source": "/de/contact",                           "destination": "/de/contact.html",             "statusCode": 301 },
{ "source": "/de/contact/",                          "destination": "/de/contact.html",             "statusCode": 301 },
{ "source": "/de/privacy-policy",                    "destination": "/de/privacy.html",             "statusCode": 301 },
{ "source": "/de/privacy-policy/",                   "destination": "/de/privacy.html",             "statusCode": 301 }
```

For FR / IT / ES, copy the same block, substitute the locale code,
and translate the slugs if the German "athlos" / "kontakt" /
"datenschutz" etc. equivalents are more natural in that language.

## What we are NOT doing

- **No auto-language redirect** based on `Accept-Language` header.
  Users land on the URL they clicked. Auto-redirecting users to
  their browser language harms SEO (Google sees inconsistent
  responses for the same URL) and breaks the "every URL is its own
  canonical" principle. The language switcher is the explicit
  opt-in.

- **No `cefla.html` localised version.** Cefla is English-only by
  design — it's a gated customer download page, not for translation
  (`src/_data/locales.js` and `eleventy.config.js` both note this).

## Cefla redirect — keep as-is

`/cefla` and `/cefla/` continue to point at `/cefla.html` for all
locales. Cefla has no localised version.

## Source of truth

`src/_data/locales.js` declares which locales are `active`. Update
that file first, then add the corresponding `vercel.json` redirects
in the same PR.
