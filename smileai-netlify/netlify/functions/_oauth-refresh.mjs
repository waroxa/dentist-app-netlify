import { auditLog, decryptSecret, encryptSecret, errorLog, getSupabase } from './_lib.mjs';

const SKEW_MS = 60 * 1000; // refresh 60s before expiry

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Refresh failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export async function ensureFreshConnection(connection) {
  if (!connection?.refresh_token_encrypted) throw new Error('Connection missing refresh token');
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  if (expiresAt - Date.now() > SKEW_MS) return connection;

  try {
    const refreshToken = decryptSecret(connection.refresh_token_encrypted);
    const tokens = await refreshAccessToken(refreshToken);
    const supabase = getSupabase();
    const updated = {
      access_token_encrypted: encryptSecret(tokens.access_token),
      refresh_token_encrypted: encryptSecret(tokens.refresh_token || refreshToken),
      scope: tokens.scope || connection.scope || '',
      expires_at: new Date(Date.now() + (tokens.expires_in || 86400) * 1000).toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('integration_connections')
      .update(updated)
      .eq('provider', connection.provider)
      .eq('location_id', connection.location_id);
    if (error) throw error;
    await auditLog('oauth_refreshed', { provider: connection.provider, locationId: connection.location_id });
    return { ...connection, ...updated };
  } catch (err) {
    errorLog('oauth_refresh_failed', err, { locationId: connection?.location_id });
    throw err;
  }
}
