import crypto from 'node:crypto';
import {
  adminSetupSetCookie,
  auditLog,
  getAdminCredential,
  getAdminSetupSecret,
  json,
  safeParse,
  signAdminSession,
} from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const existing = await getAdminCredential();
    if (existing?.password_hash) return json(409, { error: 'Staff access has already been configured. Please use the password sign-in form.' });

    const body = safeParse(event.body);
    if (!body?.activationSecret) return json(400, { error: 'Activation code is required.' });

    const expected = Buffer.from(getAdminSetupSecret(), 'utf8');
    const provided = Buffer.from(String(body.activationSecret), 'utf8');
    const validLength = expected.length === provided.length;
    const isAuthorized = validLength && crypto.timingSafeEqual(provided, expected);

    if (!isAuthorized) {
      await auditLog('admin_activation_authorize_failed', { ip: event.headers['x-forwarded-for'] || 'unknown' });
      return json(401, { error: 'The activation code is invalid.' });
    }

    const token = signAdminSession({ purpose: 'admin_setup', exp: Date.now() + 1000 * 60 * 15 });
    await auditLog('admin_activation_authorized');
    return json(200, { ok: true }, { 'Set-Cookie': adminSetupSetCookie(token) });
  } catch (error) {
    console.error('admin_activate_authorize_failed', error);
    return json(503, { error: 'Staff access setup is temporarily unavailable. Please check the workspace configuration and try again.' });
  }
}
