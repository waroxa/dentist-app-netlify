// netlify/functions/oauth-start.mjs
import { redirect, errorLog } from './_lib.mjs';
import { createOAuthState } from './_oauth-state.mjs';

export async function handler(event) {
  try {
    const clientId = process.env.GHL_CLIENT_ID;
    const redirectUri = process.env.GHL_REDIRECT_URI;
    const scopes = process.env.GHL_SCOPES || 'contacts.readonly contacts.write locations.readonly';

    if (!clientId || !redirectUri) {
      errorLog('oauth_start_misconfigured', new Error('Missing GHL_CLIENT_ID or GHL_REDIRECT_URI'));
      return { statusCode: 500, body: 'Server misconfiguration' };
    }

    const state = await createOAuthState({
      ip: event.headers?.['x-forwarded-for'] || null,
      ua: event.headers?.['user-agent'] || null,
    });

    const url =
      `https://marketplace.gohighlevel.com/oauth/chooselocation` +
      `?response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(state)}`;

    return redirect(url, 302);
  } catch (err) {
    errorLog('oauth_start_failed', err);
    return { statusCode: 500, body: 'OAuth start failed' };
  }
}
