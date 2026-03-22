import { getAdminCredential, getAdminSetupSecret, json } from './_lib.mjs';

export async function handler() {
  try {
    const credential = await getAdminCredential();
    const configured = Boolean(credential?.password_hash || process.env.SMILEVISION_ADMIN_PASSWORD);
    const activationEnabled = configured ? false : Boolean(getAdminSetupSecret());
    return json(200, {
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
