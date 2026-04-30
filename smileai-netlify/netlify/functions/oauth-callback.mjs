// netlify/functions/oauth-callback.mjs
import {
  auditLog, encryptSecret, errorLog, getSupabase, json, redirect, safeParse,
} from './_lib.mjs';
import { consumeOAuthState } from './_oauth-state.mjs';

async function exchangeCode(code) {
  const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      redirect_uri: process.env.GHL_REDIRECT_URI,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth exchange failed (${res.status}): ${text}`);
  try { return JSON.parse(text); } catch { throw new Error('OAuth exchange returned non-JSON'); }
}

export async function handler(event) {
  const isGet = event.httpMethod === 'GET';
  const body = !isGet ? safeParse(event.body) : null;
  const query = event.queryStringParameters || {};
  const code = body?.code || query.code;
  const state = body?.state || query.state;
  const oauthError = query.error || body?.error;

  const failRedirect = (reason) =>
    redirect(`${process.env.PUBLIC_APP_URL}/admin/integrations?error=${encodeURIComponent(reason)}`);

  if (oauthError) return isGet ? failRedirect(oauthError) : json(400, { error: oauthError });
  if (!code) return isGet ? failRedirect('missing_code') : json(400, { error: 'missing_code' });
  if (!state) return isGet ? failRedirect('missing_state') : json(400, { error: 'missing_state' });

  // Validate state - single-use, time-bound, server-stored
  const stored = await consumeOAuthState(state);
  if (!stored) {
    await auditLog('oauth_state_invalid', { state });
    return isGet ? failRedirect('invalid_state') : json(400, { error: 'invalid_state' });
  }

  try {
    const tokens = await exchangeCode(code);
    const locationId = tokens.locationId || tokens.location_id;
    if (!locationId) throw new Error('Token response missing locationId');

    const supabase = getSupabase();
    const { error } = await supabase.from('integration_connections').upsert({
      provider: 'ghl',
      location_id: locationId,
      access_token_encrypted: encryptSecret(tokens.access_token),
      refresh_token_encrypted: encryptSecret(tokens.refresh_token),
      scope: tokens.scope || '',
      expires_at: new Date(Date.now() + (tokens.expires_in || 86400) * 1000).toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'provider,location_id' });
    if (error) throw error;

    await auditLog('oauth_connected', { provider: 'ghl', locationId });

    const dest = `${process.env.PUBLIC_APP_URL}/admin/integrations?success=true&locationId=${encodeURIComponent(locationId)}`;
    return isGet ? redirect(dest) : json(200, { success: true, locationId });
  } catch (err) {
    errorLog('oauth_callback_failed', err);
    return isGet ? failRedirect('oauth_failed') : json(500, { error: 'oauth_failed' });
  }
}
