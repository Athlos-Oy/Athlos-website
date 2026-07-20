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
   (Deployments → ⋯ → Redeploy). Existing sessions stay valid until their
   cookie expires; to force everyone to log in again, also change
   `TRAINING_SESSION_SECRET` to a new random value.

## Video library

All video metadata lives in **one file**:
[`src/_data/trainingVideos.js`](../src/_data/trainingVideos.js).
Each entry has a number, slug, title, description, category
(`anterior` / `posterior` / `bitewing` / `special`), duration and flags.
The page, filters, player and download links all render from it.

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
