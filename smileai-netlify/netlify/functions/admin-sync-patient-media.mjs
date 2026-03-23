import { auditLog, json, requireAdmin, safeParse, syncLeadAssetsToCRM } from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });

  const body = safeParse(event.body);
  if (!body?.leadId) return json(400, { success: false, error: 'leadId is required.' });

  try {
    const result = await syncLeadAssetsToCRM({
      leadId: body.leadId,
      crmContactId: body.crmContactId || null,
      previewUrl: body.previewUrl || null,
      videoUrl: body.videoUrl || null,
      status: body.status || null,
      previewJobId: body.previewJobId || null,
      videoJobId: body.videoJobId || null,
    });

    if (!result.synced) {
      return json(409, {
        success: false,
        error: 'No matching GHL contact was available for this patient yet.',
        reason: result.reason,
      });
    }

    return json(200, { success: true, crmContactId: result.crmContactId });
  } catch (error) {
    await auditLog('admin_media_sync_failed', { leadId: body.leadId, message: error.message });
    return json(500, { success: false, error: 'Failed to sync patient media.' });
  }
}
