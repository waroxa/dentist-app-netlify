import crypto from 'node:crypto';
import { auditLog, errorLog, json, upsertJob, safeParse } from './_lib.mjs';
import { createVideoWithProvider, getDefaultVideoPrompt, providerEnabled, providerSetupError, resolveVideoModel, resolveVideoProvider } from './_video-providers.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.imageUrl) return json(400, { error: 'A generated preview is required before video creation.' });

  const jobId = crypto.randomUUID();
  let provider;
  try {
    provider = resolveVideoProvider(body.provider);
  } catch (error) {
    return json(400, { error: error.message });
  }

  const model = resolveVideoModel(provider);
  const prompt = body.prompt || getDefaultVideoPrompt();
  const now = new Date().toISOString();

  await upsertJob({
    id: jobId,
    type: 'smile_video',
    status: 'processing',
    lead_id: body.leadId || null,
    input_image_data_url: body.imageUrl,
    provider_job_id: null,
    output_asset_url: null,
    error_message: null,
    provider,
    provider_model: model,
    metadata: { provider, promptLength: prompt.length },
    created_at: now,
    updated_at: now,
  });

  if (!providerEnabled(provider)) {
    await upsertJob({
      id: jobId,
      type: 'smile_video',
      status: 'failed',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageUrl,
      error_message: `${provider} is disabled.`,
      provider,
      provider_model: model,
      metadata: { provider, disabled: true },
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    return providerSetupError(provider);
  }

  try {
    const result = await createVideoWithProvider({ provider, imageUrl: body.imageUrl, prompt, leadId: body.leadId || null, jobId });
    await upsertJob({
      id: jobId,
      type: 'smile_video',
      status: 'completed',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageUrl,
      output_asset_url: result.assetUrl,
      provider_job_id: result.providerJobId,
      error_message: null,
      provider: result.provider,
      provider_model: result.model,
      metadata: { provider: result.provider, model: result.model, storagePath: result.storagePath || null },
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    await auditLog('smile_video_completed', { jobId, leadId: body.leadId || null, provider: result.provider, model: result.model, assetUrl: result.assetUrl });

    return json(200, {
      success: true,
      jobId,
      status: 'completed',
      assetUrl: result.assetUrl,
      provider: result.provider,
      model: result.model,
      providerJobId: result.providerJobId,
      note: `Your smile video is ready from ${result.provider.toUpperCase()}.`,
    });
  } catch (error) {
    const message = error?.message || 'Video generation failed.';
    errorLog('smile_video_failed', error, { jobId, provider, model, leadId: body.leadId || null });
    await upsertJob({
      id: jobId,
      type: 'smile_video',
      status: 'failed',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageUrl,
      provider_job_id: null,
      output_asset_url: null,
      error_message: message,
      provider,
      provider_model: model,
      metadata: { provider, model },
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    await auditLog('smile_video_failed', { jobId, leadId: body.leadId || null, provider, model, message });
    return json(502, { error: message, provider, model, jobId });
  }
}
