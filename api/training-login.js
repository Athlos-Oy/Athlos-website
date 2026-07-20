// Vercel serverless function — verifies the DC-Air® Training Center
// shared password and issues a signed session cookie.
//
// Required env vars:
//   TRAINING_PASSWORD_HASH   SHA-256 hex digest of the shared password
//   TRAINING_SESSION_SECRET  random secret used to HMAC-sign the cookie
//
// The plaintext password is never stored or logged. The cookie value is
// "<unix-expiry>.<hmac-sha256-hex>", HttpOnly + Secure + SameSite=Lax,
// valid for 365 days (users only re-enter the password on a new
// device/browser or after clearing cookies).

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'dcair_session';
const SESSION_DAYS = 365;

function sha256Hex(s) {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function hmacHex(secret, message) {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

function safeEqualHex(aHex, bHex) {
  const a = Buffer.from(aHex, 'hex');
  const b = Buffer.from(bHex, 'hex');
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const passwordHash = process.env.TRAINING_PASSWORD_HASH;
  const secret = process.env.TRAINING_SESSION_SECRET;
  if (!passwordHash || !secret) {
    return res.status(500).json({
      ok: false,
      error: 'Server is not configured. Please contact info@athlos.fi.',
    });
  }

  const provided = String(req.body?.password ?? '');

  // Small fixed delay: cheap brute-force friction without hurting real users.
  await sleep(400);

  if (!provided || !safeEqualHex(sha256Hex(provided), passwordHash)) {
    return res.status(401).json({ ok: false, error: 'Incorrect password. Please check it and try again.' });
  }

  const exp = String(Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60);
  const cookieValue = `${exp}.${hmacHex(secret, exp)}`;
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${SESSION_DAYS * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`
  );
  return res.status(200).json({ ok: true });
}
