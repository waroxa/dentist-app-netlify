import crypto from 'node:crypto';
import {
  adminSetupSetCookie,
  auditLog,
  getAdminCredential,
  getAdminSetupSecret,
  getWorkspaceInstall,
  json,
  resolveWorkspaceKey,
  safeParse,
  signAdminSession,
} from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = safeParse(event.body);
    const workspaceKey = resolveWorkspaceKey(event, body);

    const existing = await getAdminCredential(workspaceKey);
    if (existing?.password_hash) return json(409, { error: 'Staff access has already been configured. Please use the password sign-in form.' });

    const install = await getWorkspaceInstall(workspaceKey);
    let isAuthorized = Boolean(install);

    if (!isAuthorized) {
      if (!body?.activationSecret) return json(400, { error: 'Activation code is required.' });
      const provided = Buffer.from(String(body.activationSecret), 'utf8');
      const candidates = [`${workspaceKey}:${getAdminSetupSecret()}`];
      if (workspaceKey === 'default') candidates.push(getAdminSetupSecret());
      isAuthorized = candidates.some((candidate) => {
        const expected = Buffer.from(candidate, 'utf8');
        return expected.length === provided.length && crypto.timingSafeEqual(provided, expected);
      });
    }

    if (!isAuthorized) {
      await auditLog('admin_activation_authorize_failed', { ip: event.headers['x-forwarded-for'] || 'unknown', workspaceKey });
      return json(401, { error: 'The activation code is invalid.' });
    }

    const token = signAdminSession({ purpose: 'admin_setup', workspaceKey, exp: Date.now() + 1000 * 60 * 15 });
    await auditLog('admin_activation_authorized', { workspaceKey });
    return json(200, { ok: true }, { 'Set-Cookie': adminSetupSetCookie(token) });
  } catch (error) {
    console.error('admin_activate_authorize_failed', error);
    return json(503, { error: 'Staff access setup is temporarily unavailable. Please check the workspace configuration and try again.' });
  }
}
