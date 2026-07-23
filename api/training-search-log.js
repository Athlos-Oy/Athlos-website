// Vercel serverless function — appends DC-Air® Training Center search
// queries to a monthly JSONL log in the Vercel Blob store, so Athlos can
// see what customers actually search for (and which searches find
// nothing — those are FAQ gaps to fill).
//
// Log file: logs/searches-YYYY-MM.jsonl in the blob store, one JSON
// object per line: {"t":"<ISO time>","q":"<query>","n":<result count>,
// "top":"<best faq id>"}. No IPs, no user identifiers.
//
// Requires a valid training session cookie (same check as
// middleware.js) so the public endpoint can't be spammed. Uses
// BLOB_READ_WRITE_TOKEN (injected by the connected store) to write and
// TRAINING_MEDIA_BASE to read the current month's file back.
//
// Read-modify-write is not atomic; two simultaneous searches can race
// and drop one line. Traffic is a handful of searches a day, so this is
// an accepted trade-off for having one human-readable file per month.

import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'dcair_session';

function hmacHex(secret, message) {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length || ab.length === 0) return false;
  return timingSafeEqual(ab, bb);
}

function hasValidSession(req) {
  const secret = process.env.TRAINING_SESSION_SECRET;
  const passwordHash = process.env.TRAINING_PASSWORD_HASH || '';
  if (!secret || !passwordHash) return false;
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const parts = decodeURIComponent(match[1]).split('.');
  if (parts.length !== 3) return false;
  const [exp, pwv, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  if (!safeEqual(pwv, passwordHash.slice(0, 8))) return false;
  return safeEqual(sig, hmacHex(secret, `${exp}.${pwv}`));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  if (!hasValidSession(req)) return res.status(401).json({ ok: false });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const base = process.env.TRAINING_MEDIA_BASE;
  if (!token || !base) return res.status(500).json({ ok: false });

  const q = String(req.body?.q ?? '').trim().slice(0, 120);
  const n = Number(req.body?.n);
  const top = String(req.body?.top ?? '').slice(0, 60);
  if (!q || !Number.isInteger(n) || n < 0 || n > 50) {
    return res.status(400).json({ ok: false });
  }

  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const pathname = `logs/searches-${month}.jsonl`;

  // Cache-busting query → the CDN can't serve a stale copy of the log.
  let existing = '';
  const read = await fetch(`${base}/${pathname}?cb=${Date.now()}`);
  if (read.ok) existing = await read.text();

  const line = JSON.stringify({ t: now.toISOString(), q, n, top }) + '\n';
  const put = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'x-content-type': 'text/plain; charset=utf-8',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
    },
    body: existing + line,
  });

  return res.status(put.ok ? 200 : 502).json({ ok: put.ok });
}
