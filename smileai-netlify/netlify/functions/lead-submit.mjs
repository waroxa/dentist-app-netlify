import crypto from 'node:crypto';
import { auditLog, getSupabase, json, log, normalizeEmail, onlyDigits, retry, safeParse, validateLead, decryptSecret } from './_lib.mjs';

async function syncLeadToCRM(connection, payload) {
  if (!connection?.access_token_encrypted || !connection?.location_id) return null;
  const accessToken = decryptSecret(connection.access_token_encrypted);
  const [firstName, ...rest] = payload.fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');
  const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Version: '2021-07-28' },
    body: JSON.stringify({
      locationId: connection.location_id,
      firstName,
      lastName,
      email: normalizeEmail(payload.email),
      phone: onlyDigits(payload.phone),
      source: 'SmileVisionPro AI',
      tags: ['smilevisionpro-ai', 'smile-preview'],
      customFields: [{ key: 'service_interest', field_value: payload.interestedIn || 'General consultation' }, { key: 'lead_notes', field_value: payload.notes || '' }],
    }),
  });
  if (!res.ok) throw new Error(`CRM sync failed with ${res.status}`);
  return res.json();
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body) return json(400, { error: 'Invalid request body.' });
  const { errors, email, phone } = validateLead(body);
  if (errors.length) return json(422, { error: 'Validation failed.', details: errors });
  try {
    const supabase = getSupabase();
    const id = crypto.randomUUID();
    const leadRecord = { id, full_name: body.fullName.trim(), email, phone, interested_in: body.interestedIn || null, notes: body.notes || null, created_at: new Date().toISOString(), source: 'public_site' };
    const { error } = await supabase.from('leads').insert(leadRecord);
    if (error) throw error;
    const { data: connection } = await supabase.from('integration_connections').select('*').eq('provider', 'ghl').eq('is_active', true).maybeSingle();
    let crmContactId = null;
    if (connection) {
      try {
        const crm = await retry(() => syncLeadToCRM(connection, body), 1);
        crmContactId = crm?.contact?.id || crm?.id || null;
      } catch (syncError) {
        await auditLog('lead_crm_sync_failed', { leadId: id, message: syncError.message });
      }
    }
    await auditLog('lead_created', { leadId: id, crmContactId });
    log('lead_submit_success', { leadId: id, crmContactId });
    return json(200, { success: true, leadId: id, crmContactId, message: 'Thanks! Your request has been received.' });
  } catch (error) {
    return json(500, { error: 'We could not save your request right now. Please try again.' });
  }
}
