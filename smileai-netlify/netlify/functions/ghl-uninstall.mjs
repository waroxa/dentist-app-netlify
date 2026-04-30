// Receives the GHL "UNINSTALL" webhook. Marks the connection inactive
// and clears tokens. Must always return 200.
import { auditLog, errorLog, getSupabase, safeParse } from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'ok' };

  const payload = safeParse(event.body) || {};
  const locationId = payload.locationId || payload.location_id || null;
  const eventType = (payload.type || payload.event || '').toString().toUpperCase();

  try {
    if (locationId) {
      const supabase = getSupabase();
      await supabase.from('integration_connections').update({
        is_active: false,
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        updated_at: new Date().toISOString(),
      }).eq('provider', 'ghl').eq('location_id', locationId);
    }
    await auditLog('ghl_webhook_received', { eventType, locationId, payload });
  } catch (err) {
    errorLog('ghl_uninstall_failed', err, { locationId });
  }

  // Always 200 so the platform doesn't retry forever
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
}
