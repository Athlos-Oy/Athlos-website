// Vercel Edge Middleware — gates the private DC-Air® Training Center.
//
// Matches /dc-air-training and everything beneath it (page, posters,
// protected assets). Requests without a valid signed session cookie get
// the login screen (rewrite — URL stays /dc-air-training, protected
// content is never sent). The session cookie is an HMAC-SHA256-signed
// expiry timestamp; the signing secret lives in the TRAINING_SESSION_SECRET
// env var and never reaches the client.
//
// Companion endpoints: api/training-login.js (sets the cookie after
// verifying the shared password) and api/training-logout.js (clears it).

import { next, rewrite } from '@vercel/edge';

export const config = {
  matcher: ['/dc-air-training', '/dc-air-training/:path*'],
};

const COOKIE_NAME = 'dcair_session';

async function sha256Hex(message) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string comparison.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hasValidSession(request, secret) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const value = decodeURIComponent(match[1]);
  // Cookie format: "<exp>.<pwv>.<hmac(exp.pwv)>". pwv is the first 8 hex
  // chars of TRAINING_PASSWORD_HASH at login time — so rotating the
  // password invalidates every outstanding session, not just new logins.
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [exp, pwv, sig] = parts;
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  const currentPwv = (process.env.TRAINING_PASSWORD_HASH || '').slice(0, 8);
  if (!currentPwv || !safeEqual(pwv, currentPwv)) return false;
  const expected = await hmacHex(secret, `${exp}.${pwv}`);
  return safeEqual(sig, expected);
}

export default async function middleware(request) {
  const secret = process.env.TRAINING_SESSION_SECRET;
  const url = new URL(request.url);

  // Fail closed if the project is not configured.
  if (!secret) {
    return new Response('Training Center is not configured.', {
      status: 503,
      headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
    });
  }

  if (await hasValidSession(request, secret)) {
    return next({
      headers: {
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  // QR-code sign-in: the printed chairside card links to
  // /dc-air-training?k=<shared password>. If the key matches, issue the
  // same signed session cookie as the login endpoint and redirect to the
  // clean URL — the customer never sees the login screen. Mismatches get
  // the same 400 ms delay as the login endpoint before falling through.
  const qrKey = url.searchParams.get('k');
  if (qrKey && (url.pathname === '/dc-air-training' || url.pathname === '/dc-air-training/')) {
    const passwordHash = process.env.TRAINING_PASSWORD_HASH || '';
    const keyHash = await sha256Hex(qrKey);
    if (passwordHash && safeEqual(keyHash, passwordHash)) {
      const exp = String(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);
      const pwv = passwordHash.slice(0, 8);
      const payload = `${exp}.${pwv}`;
      const cookieValue = `${payload}.${await hmacHex(secret, payload)}`;
      const clean = new URL(request.url);
      clean.searchParams.delete('k');
      return new Response(null, {
        status: 303,
        headers: {
          location: clean.pathname + clean.search,
          'set-cookie': `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${365 * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow',
        },
      });
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  // No valid session. Serve the login screen for page navigations;
  // block protected sub-assets outright.
  if (url.pathname === '/dc-air-training' || url.pathname === '/dc-air-training/') {
    return rewrite(new URL('/training-login.html', request.url), {
      headers: {
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}
