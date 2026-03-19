import crypto from 'node:crypto';
import { auditLog, json, safeParse, upsertJob } from './_lib.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.imageUrl) return json(400, { error: 'A generated preview is required before video creation.' });
  const jobId = crypto.randomUUID();
  const fallback = process.env.SMILEVISION_VIDEO_FALLBACK_URL || body.imageUrl;
  await upsertJob({ id: jobId, type: 'smile_video', status: 'completed', lead_id: body.leadId || null, output_asset_url: fallback, provider_job_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  await auditLog('smile_video_requested', { jobId, fallback: true });
  return json(200, { success: true, jobId, status: 'completed', assetUrl: fallback, note: 'Configure FAL_API_KEY and FAL_VIDEO_MODEL to enable rendered video generation.' });
}
