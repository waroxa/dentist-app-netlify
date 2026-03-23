import { getAdminCredential, getAdminSetupSecret, getWorkspaceInstall, json, resolveWorkspaceKey } from './_lib.mjs';

export async function handler(event) {
  try {
    const workspaceKey = resolveWorkspaceKey(event);
    const credential = await getAdminCredential(workspaceKey);
    const install = await getWorkspaceInstall(workspaceKey);
    const legacyConfigured = workspaceKey === 'default' && Boolean(process.env.SMILEVISION_ADMIN_PASSWORD);
    const configured = Boolean(credential?.password_hash || legacyConfigured);
    const isDefaultWorkspace = workspaceKey === 'default';
    const activationEnabled = configured ? false : (isDefaultWorkspace ? Boolean(getAdminSetupSecret()) : Boolean(install));
    const setupMethod = !configured && install ? 'install' : 'secret';
    const mode = configured ? 'login' : (!isDefaultWorkspace && !install ? 'unavailable' : 'setup');

    return json(200, {
      workspaceKey,
      mode,
      configured,
      activationEnabled,
      setupMethod,
      installAuthorized: Boolean(install),
      error: mode === 'unavailable'
        ? 'This location has not completed installation yet. Install the app for this location before creating a staff password.'
        : undefined,
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
