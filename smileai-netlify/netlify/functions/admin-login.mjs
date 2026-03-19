import crypto from 'node:crypto';
import { adminSetCookie, auditLog, json, safeParse, signAdminSession } from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.password) return json(400, { error: 'Password is required.' });
  const configured = process.env.SMILEVISION_ADMIN_PASSWORD;
  if (!configured) return json(500, { error: 'Admin password is not configured.' });
  const provided = crypto.createHash('sha256').update(String(body.password)).digest();
  const expected = crypto.createHash('sha256').update(String(configured)).digest();
  const ok = crypto.timingSafeEqual(provided, expected);
  if (!ok) {
    await auditLog('admin_login_failed', { ip: event.headers['x-forwarded-for'] || 'unknown' });
    return json(401, { error: 'Invalid password.' });
  }
  const token = signAdminSession({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 8 });
  await auditLog('admin_login_success');
  return json(200, { ok: true }, { 'Set-Cookie': adminSetCookie(token) });
}
