import { auditLog, decryptSecret, encryptSecret, errorLog, getSupabase, json, redirect, safeParse } from './_lib.mjs';

async function exchangeCode(code) {
  const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: process.env.GHL_CLIENT_ID, client_secret: process.env.GHL_CLIENT_SECRET, redirect_uri: process.env.GHL_REDIRECT_URI }),
  });
  if (!res.ok) throw new Error(`OAuth exchange failed with ${res.status}`);
  return res.json();
}

export async function handler(event) {
  const body = event.httpMethod === 'POST' ? safeParse(event.body) : null;
  const query = event.queryStringParameters || {};
  const code = body?.code || query.code;
  const state = body?.state || query.state;
  if (!code) return json(400, { error: 'Missing code.' });
  try {
    const tokens = await exchangeCode(code);
    const locationId = tokens.locationId || tokens.location_id;
    const supabase = getSupabase();
    await supabase.from('integration_connections').upsert({ provider: 'ghl', location_id: locationId, access_token_encrypted: encryptSecret(tokens.access_token), refresh_token_encrypted: encryptSecret(tokens.refresh_token), scope: tokens.scope || '', expires_at: new Date(Date.now() + (tokens.expires_in || 86400) * 1000).toISOString(), is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'provider,location_id' });
    await auditLog('oauth_connected', { provider: 'ghl', locationId, state });
    const destination = `${process.env.PUBLIC_APP_URL}/admin/integrations?success=true&locationId=${encodeURIComponent(locationId)}`;
    if (event.httpMethod === 'GET') return redirect(destination);
    return json(200, { success: true, locationId });
  } catch (error) {
    errorLog('oauth_callback_failed', error);
    if (event.httpMethod === 'GET') return redirect(`${process.env.PUBLIC_APP_URL}/admin/integrations?error=oauth_failed`);
    return json(500, { error: 'OAuth connection failed.' });
  }
}
