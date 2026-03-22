import { getAdminCredential, getAdminSetupSecret, json, resolveWorkspaceKey } from './_lib.mjs';

export async function handler(event) {
  try {
    const workspaceKey = resolveWorkspaceKey(event);
    const credential = await getAdminCredential(workspaceKey);
    const legacyConfigured = workspaceKey === 'default' && Boolean(process.env.SMILEVISION_ADMIN_PASSWORD);
    const configured = Boolean(credential?.password_hash || legacyConfigured);
    const activationEnabled = configured ? false : Boolean(getAdminSetupSecret());
    return json(200, {
      workspaceKey,
      mode: configured ? 'login' : 'setup',
      configured,
      activationEnabled,
    });
  } catch (error) {
    console.error('admin_status_failed', error);
    return json(503, {
      mode: 'unavailable',
      configured: false,
      activationEnabled: false,
      error: 'Staff access is temporarily unavailable. Please check the workspace configuration and try again.',
    });
  }
}
