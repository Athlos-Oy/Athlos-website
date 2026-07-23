// Vercel serverless function — records DC-Air® Training Center search
// queries in the Vercel Blob store, so Athlos can see what customers
// actually search for (and which searches find nothing — those are FAQ
// gaps to fill).
//
// POST {q, n, top}  → writes ONE blob per search:
//   logs/searches/YYYY-MM/<ISO time>-<rand>.json
//   One file per event means concurrent searches can never overwrite
//   each other (an earlier append-to-monthly-file design lost lines to
//   read-modify-write races). No IPs, no user identifiers.
//
// GET ?month=YYYY-MM → lists those blobs and returns the month's
//   searches as JSONL text, newest last. Defaults to the current month.
//   Open https://athlos.fi/api/training-search-log in a logged-in
//   browser to read it.
//
// Both verbs require a valid training session cookie (same check as
// middleware.js) so the endpoint can't be spammed or read anonymously.

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

  if (!hasValidSession(req)) return res.status(401).json({ ok: false });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ ok: false });

  if (req.method === 'POST') {
    const q = String(req.body?.q ?? '').trim().slice(0, 120);
    const n = Number(req.body?.n);
    const top = String(req.body?.top ?? '').slice(0, 60);
    if (!q || !Number.isInteger(n) || n < 0 || n > 50) {
      return res.status(400).json({ ok: false });
    }

    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const rand = Math.random().toString(36).slice(2, 8);
    const pathname = `logs/searches/${month}/${stamp}-${rand}.json`;

    const put = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'x-content-type': 'application/json',
        'x-add-random-suffix': '0',
      },
      body: JSON.stringify({ t: now.toISOString(), q, n, top }),
    });
    return res.status(put.ok ? 200 : 502).json({ ok: put.ok });
  }

  if (req.method === 'GET') {
    const month = /^\d{4}-\d{2}$/.test(String(req.query?.month))
      ? req.query.month
      : new Date().toISOString().slice(0, 7);

    // List every event blob for the month (paginated) and concatenate.
    const blobs = [];
    let cursor = '';
    do {
      const url = new URL('https://blob.vercel-storage.com/');
      url.searchParams.set('prefix', `logs/searches/${month}/`);
      url.searchParams.set('limit', '1000');
      if (cursor) url.searchParams.set('cursor', cursor);
      const list = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
      if (!list.ok) return res.status(502).send('Blob list failed.');
      const data = await list.json();
      blobs.push(...(data.blobs || []));
      cursor = data.hasMore ? data.cursor : '';
    } while (cursor);

    blobs.sort((a, b) => a.pathname.localeCompare(b.pathname)); // ISO stamp in name → chronological
    const lines = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(`${b.url}?cb=${Date.now()}`);
        return r.ok ? (await r.text()).trim() : null;
      })
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res
      .status(200)
      .send(`# DC-Air Training Center searches ${month} — ${blobs.length} entries\n` +
        lines.filter(Boolean).join('\n') + '\n');
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false });
}
