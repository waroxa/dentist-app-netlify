import {
  adminSetCookie,
  auditLog,
  getAdminCredential,
  hashPassword,
  json,
  requireAdminSetup,
  resolveWorkspaceKey,
  safeParse,
  setAdminCredential,
  signAdminSession,
} from './_lib.mjs';

function validatePassword(password) {
  const value = String(password || '');
  if (value.length < 12) return 'Use at least 12 characters.';
  if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter.';
  if (!/[a-z]/.test(value)) return 'Include at least one lowercase letter.';
  if (!/[0-9]/.test(value)) return 'Include at least one number.';
  return null;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const setupSession = await requireAdminSetup(event);
    if (!setupSession) return json(401, { error: 'Your secure setup session has expired. Re-enter the activation code to continue.' });
    const body = safeParse(event.body);
    const workspaceKey = resolveWorkspaceKey(event, body);
    if (setupSession.workspaceKey !== workspaceKey) {
      return json(401, { error: 'This setup session does not match the current workspace. Restart activation to continue.' });
    }

    const existing = await getAdminCredential(workspaceKey);
    if (existing?.password_hash) {
      return json(409, { error: 'Staff access has already been configured. Please use the password sign-in form.' });
    }

    const password = String(body?.password || '');
    const confirmPassword = String(body?.confirmPassword || '');
    const validationError = validatePassword(password);

    if (validationError) return json(400, { error: validationError });
    if (password !== confirmPassword) return json(400, { error: 'Passwords do not match.' });

    await setAdminCredential({
      workspaceKey,
      passwordHash: hashPassword(password),
      metadata: { source: 'first_time_activation', workspaceKey },
    });

    const adminToken = signAdminSession({ role: 'admin', workspaceKey, exp: Date.now() + 1000 * 60 * 60 * 8 });
    await auditLog('admin_activation_completed', { workspaceKey });

    return json(
      200,
      { ok: true },
      { 'Set-Cookie': adminSetCookie(adminToken) },
    );
  } catch (error) {
    console.error('admin_activate_complete_failed', error);
    return json(503, { error: 'Staff access setup is temporarily unavailable. Please check the workspace configuration and try again.' });
  }
}
