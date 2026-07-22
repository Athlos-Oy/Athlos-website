# DC-Air® Training Center — maintenance guide

Private, password-protected page at **https://athlos.fi/dc-air-training** for
DC-Air customers, clinics and distribution partners. Not linked anywhere
public, not in the sitemap, `noindex` everywhere.

## How the protection works

1. **`middleware.js`** (repo root) runs at Vercel's edge *before* any static
   file is served. It matches `/dc-air-training` and everything under it.
   Without a valid session cookie the protected HTML is never sent — the
   visitor gets the login screen instead (the URL does not change).
2. **`api/training-login.js`** checks the entered password against
   `TRAINING_PASSWORD_HASH` (a SHA-256 hash — the plaintext password exists
   nowhere in code, git, or Vercel) and sets a signed session cookie
   (`HttpOnly; Secure; SameSite=Lax`, valid 365 days).
3. **`api/training-logout.js`** clears the cookie.
4. The videos/ZIPs/PDFs live in external object storage (see below), not in
   git. Their URLs are injected at build time from environment variables and
   only appear inside the protected page.

## Required Vercel environment variables

Set under Vercel → Project → Settings → Environment Variables, for
**Production and Preview**:

| Variable | What it is |
|---|---|
| `TRAINING_PASSWORD_HASH` | SHA-256 hex of the shared password |
| `TRAINING_SESSION_SECRET` | Long random string that signs session cookies |
| `TRAINING_MEDIA_BASE` | Base URL of the media store, **no trailing slash** |
| `TRAINING_MEDIA_QUERY` | Optional query string appended to media URLs (e.g. an Azure SAS token, including the leading `?`). Leave unset for Vercel Blob. |

## How to change the shared password

1. Generate the hash of the new password locally (PowerShell):

   ```powershell
   $p = Read-Host "New password"
   $sha = [System.Security.Cryptography.SHA256]::Create()
   -join ($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($p)) | ForEach-Object { $_.ToString("x2") })
   ```

2. Put the output into `TRAINING_PASSWORD_HASH` in Vercel and redeploy
   (Deployments → ⋯ → Redeploy).

Changing the password **logs every device out immediately** — the session
cookie carries a password-version claim (`pwv`, first 8 chars of the
hash) that the middleware checks on every request. If the password ever
leaks, rotating it is a complete fix; no other action needed.

## Emergency: "every download/video suddenly broken"

Almost always the Azure SAS token (its signature or expiry). Fix:

1. Azure Portal → storage account `athlosshare` → container
   `dcair-training` → **Shared access tokens** → generate a new
   **Read-only** token (prefer binding it to a **stored access policy**
   so it can later be revoked/extended server-side without a redeploy).
2. Vercel → Settings → Environment Variables → update
   `TRAINING_MEDIA_QUERY` to `?` + the new token.
3. Deployments → ⋯ → Redeploy.

The build itself guards against this class of failure:
`scripts/check-training-media.mjs` (run by the Vercel `buildCommand`)
HEADs every media URL in the manifest and **fails the build** if any is
unreachable — so a broken token/blob is caught at deploy time, never
discovered by a customer. It skips silently when `TRAINING_MEDIA_BASE`
is unset (pre-launch state).

> **Who else can operate this?** Anyone with access to the Vercel
> project + this file. If Evangelos is unavailable, this document plus
> Vercel access is sufficient for every routine and emergency task.

## Video library

All video metadata lives in **one file**:
[`src/_data/trainingVideos.js`](../src/_data/trainingVideos.js).
Each entry has a number, slug, title, description, category
(`anterior` / `posterior` / `bitewing` / `special`), duration and flags.
The page, filters, player, download links, video counts and total
duration all render from it.

A video with `status: "pending-replacement"` is **excluded from the
page and should be excluded from the ZIPs** (video 11 "Occlusal Holder"
is currently in this state — its supplied source file duplicated video
10's footage; awaiting the correct export from FTG. To publish it:
delete the `status` line, upload both MP4s, rebuild + re-upload the
ZIPs, update ZIP sizes here).

Document revisions (IFU revision, guide version) also live in this file
(`DOCUMENTS`) and render on the cards — bump them there when a new
revision ships, and replace the blob under a **new filename** so stale
cached copies can't masquerade as current.

File naming convention (media store):

```
video/captioned/DC-Air_Training_NN_Slug_EN-Captions.mp4
video/no-captions/DC-Air_Training_NN_Slug_No-Captions.mp4
zip/DC-Air_Clinical_Training_EN-Captions_<version>.zip
zip/DC-Air_Clinical_Training_No-Captions_<version>.zip
docs/DC-Air_User_QA_Troubleshooting_Guide_<version>.pdf
docs/DC-Air_Instructions_for_Use_<rev>.pdf
```

Poster thumbnails are committed in `training-assets/posters/` as
`DC-Air_Training_NN_Slug_Poster.webp` (540×960 WebP) and are served from
`/dc-air-training/assets/posters/` (protected by the middleware).

### Add a new video

1. Encode web MP4s (H.264 + AAC, faststart, portrait preserved):
   `ffmpeg -i in.mov -c:v libx264 -preset medium -crf 22 -maxrate 3500k
   -bufsize 7000k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out.mp4`
2. Upload both editions to the media store using the naming convention.
3. Create a 540×960 WebP poster and commit it to `training-assets/posters/`.
4. Add one record to `src/_data/trainingVideos.js`.
5. Rebuild the ZIPs (include the new files), upload them under a new
   version suffix, and update the ZIP filenames/sizes in the data file.
6. Commit, push, merge → Vercel deploys.

### Replace an existing video

Overwrite the blob in the media store with the same filename — no site
rebuild needed (browsers may cache the old file for a while). If the
duration changed, update it in `trainingVideos.js`.

### Update a thumbnail

Replace the WebP in `training-assets/posters/` (same filename), commit, push.

### Update the ZIPs or PDFs

Upload the new file to the store. If the filename changes (recommended for
new versions — avoids stale caches), update the filename in
`src/_data/trainingVideos.js` (`PACKAGES`) and redeploy.

## Analytics

Events pushed to the GTM dataLayer (only after cookie-consent accept, same
as the rest of the site): `training_login` (`login_result`),
`training_video_start`, `training_video_complete`, `training_filter`,
`training_download` (`download_type`), `training_guide_open`,
`training_ifu_open`, `training_support_click`, `training_logout`.
No passwords, serial numbers, or personal data are ever sent.
To forward them to GA4, add the event names to the existing
"GA4 Event — All Athlos events" trigger in GTM (if it uses an allowlist).

## Deployment checklist

- [ ] Env vars set for Production **and** Preview
- [ ] `/dc-air-training` without a session → login screen (no content leak)
- [ ] Wrong password → error; correct password → page loads
- [ ] Log out → back to login
- [ ] A video plays; downloads work; both ZIPs download
- [ ] Page absent from `/sitemap.xml`; `X-Robots-Tag: noindex` present
      (`curl -I https://athlos.fi/dc-air-training`)
- [ ] Public pages unchanged (spot-check home + a product page)

## Find an Answer (FAQ search)

The "Find an Answer" section on the page is a searchable answer bank sourced from
the Troubleshooting Guide and the IFU.

- **Content lives in** `src/_data/trainingFaq.js` — one entry per question:
  `id`, `category`, `question`, `keywords` (search synonyms/misspellings),
  `steps`, optional `note`, and `source` (`doc: guide|ifu` + `page` for the PDF
  deep link). Edit that file and redeploy to add or change answers — no other
  file needs touching.
- **Search** is client-side (js/training.js): typo-tolerant (edit distance),
  prefix matching and synonym groups, so poor English still finds the right
  answer. No server, no AI — answers always show approved text verbatim.
- **Analytics:** `training_search` (query + result count), `training_search_zero`
  (queries with no match — review these monthly and add missing answers),
  `training_faq_open` (which answers get opened), `training_faq_category`.
  The zero-result list is the roadmap for new content: every WhatsApp question
  a customer asks should become an entry in trainingFaq.js.
- When a document revision changes page numbers, update the `source.page`
  values in trainingFaq.js at the same time as the PDF upload.

## Chairside Quick Reference card

`docs/DC-Air_Chairside_Quick_Reference_2026-07.pdf` in the blob store — a
one-page printable card (top 5 problems, LED meanings, golden rules, QR code).
Regeneration: the card is produced from an HTML template with Playwright
(ask Claude to "regenerate the chairside card"); bump the version in
`DOCUMENTS.chairside` in trainingVideos.js and upload the new PDF with the
same pathname. The QR code points to
`https://athlos.fi/dc-air-training#k=<password>` — the login page prefills
the password from the fragment (never sent to the server). **If the password
is rotated, the card must be regenerated and reprinted.**

## FAQ deep links

Every answer has a stable anchor: `/dc-air-training#faq-<id>` opens that
answer directly — used by the image-gallery "fix a grainy image" links and
shareable in support emails.

## Image gallery

8 sample radiographs (courtesy FTG, from ftgimaging.com/radiographs) live in
`training-assets/radiographs/` and ship with the site. To swap samples,
replace the webp files and update the `gallery` list in dc-air-training.njk.
