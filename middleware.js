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
  const dot = value.lastIndexOf('.');
  if (dot === -1) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  const expected = await hmacHex(secret, exp);
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
