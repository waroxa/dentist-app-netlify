import crypto from 'node:crypto';
import { adminSetCookie, auditLog, getAdminCredential, json, safeParse, signAdminSession, verifyPassword } from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = safeParse(event.body);
    if (!body?.password) return json(400, { error: 'Password is required.' });

    const credential = await getAdminCredential();
    const configuredPasswordHash = credential?.password_hash;
    const configuredPassword = process.env.SMILEVISION_ADMIN_PASSWORD;

    if (!configuredPasswordHash && !configuredPassword) {
      return json(409, { error: 'Staff access has not been activated yet. Use the secure setup flow to create the first password.' });
    }

    let ok = false;
    if (configuredPasswordHash) {
      ok = verifyPassword(body.password, configuredPasswordHash);
    } else if (configuredPassword) {
      const provided = crypto.createHash('sha256').update(String(body.password)).digest();
      const expected = crypto.createHash('sha256').update(String(configuredPassword)).digest();
      ok = crypto.timingSafeEqual(provided, expected);
    }

    if (!ok) {
      await auditLog('admin_login_failed', { ip: event.headers['x-forwarded-for'] || 'unknown' });
      return json(401, { error: 'Invalid password.' });
    }

    const token = signAdminSession({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 8 });
    await auditLog('admin_login_success');
    return json(200, { ok: true }, { 'Set-Cookie': adminSetCookie(token) });
  } catch (error) {
    console.error('admin_login_failed_unexpected', error);
    return json(503, { error: 'Staff access is temporarily unavailable. Please check the workspace configuration and try again.' });
  }
}
