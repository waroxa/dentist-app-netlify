import { auditLog, getSupabase, json, requireAdmin, safeParse } from './_lib.mjs';
export async function handler(event) {
  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });
  const body = safeParse(event.body);
  if (!body?.locationId) return json(400, { error: 'locationId is required.' });
  const supabase = getSupabase();
  const { error } = await supabase.from('integration_connections').update({ is_active: false, access_token_encrypted: null, refresh_token_encrypted: null, updated_at: new Date().toISOString() }).eq('provider', 'ghl').eq('location_id', body.locationId);
  if (error) return json(500, { error: 'Failed to disconnect.' });
  await auditLog('oauth_disconnected', { provider: 'ghl', locationId: body.locationId });
  return json(200, { success: true });
}
