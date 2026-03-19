import crypto from 'node:crypto';
import { redirect } from './_lib.mjs';

export async function handler() {
  const clientId = process.env.GHL_CLIENT_ID;
  const redirectUri = process.env.GHL_REDIRECT_URI;
  const appBaseUrl = process.env.PUBLIC_APP_URL;
  const state = crypto.randomBytes(24).toString('hex');
  const location = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(process.env.GHL_SCOPES || 'contacts.readonly contacts.write locations.readonly')}&state=${state}`;
  return redirect(location, 302);
}
