// Vercel serverless function — logs out of the DC-Air® Training Center
// by expiring the session cookie, then redirects to the login screen.

const COOKIE_NAME = 'dcair_session';

export default async function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
  );
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.statusCode = 302;
  res.setHeader('Location', '/dc-air-training');
  res.end();
}
