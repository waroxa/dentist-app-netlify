import { auditLog, decryptSecret, encryptSecret, getSupabase, json, requireAdmin, safeParse } from './_lib.mjs';
export async function handler(event) {
  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });
  const body = safeParse(event.body);
  if (!body?.locationId) return json(400, { error: 'locationId is required.' });
  const supabase = getSupabase();
  const { data: row } = await supabase.from('integration_connections').select('*').eq('provider', 'ghl').eq('location_id', body.locationId).maybeSingle();
  if (!row?.refresh_token_encrypted) return json(404, { error: 'Connection not found.' });
  const refreshToken = decryptSecret(row.refresh_token_encrypted);
  const res = await fetch('https://services.leadconnectorhq.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: process.env.GHL_CLIENT_ID, client_secret: process.env.GHL_CLIENT_SECRET, redirect_uri: process.env.GHL_REDIRECT_URI }) });
  if (!res.ok) return json(502, { error: 'Token refresh failed.' });
  const tokens = await res.json();
  await supabase.from('integration_connections').update({ access_token_encrypted: encryptSecret(tokens.access_token), refresh_token_encrypted: encryptSecret(tokens.refresh_token || refreshToken), expires_at: new Date(Date.now() + (tokens.expires_in || 86400) * 1000).toISOString(), updated_at: new Date().toISOString(), is_active: true }).eq('provider', 'ghl').eq('location_id', body.locationId);
  await auditLog('oauth_refreshed', { provider: 'ghl', locationId: body.locationId });
  return json(200, { success: true });
}
