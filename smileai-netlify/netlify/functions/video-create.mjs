import crypto from 'node:crypto';
import { auditLog, errorLog, json, upsertJob, safeParse } from './_lib.mjs';
import {
  getDefaultVideoPrompt,
  providerEnabled,
  providerSetupError,
  resolveVideoModel,
  resolveVideoProvider,
  startVideoJob,
  validateVideoProviderConfig,
} from './_video-providers.mjs';

export async function processVideoCreate(event, forcedProvider = null) {
  if (event.httpMethod !== 'POST') return json(405, { success: false, error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body) return json(400, { success: false, error: 'Invalid JSON request body.' });
  if (!body.imageUrl) return json(400, { success: false, error: 'A generated preview is required before video creation.' });

  const jobId = crypto.randomUUID();
  let provider;
  try {
    provider = resolveVideoProvider(forcedProvider || body.provider);
  } catch (error) {
    return json(400, { success: false, error: error.message });
  }

  const configError = validateVideoProviderConfig(provider);
  if (configError) return providerSetupError(provider, configError);

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
    model,
    metadata: { provider, promptLength: prompt.length, startedAt: now },
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
      model,
      metadata: { provider, disabled: true },
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    return providerSetupError(provider, {
      statusCode: 503,
      provider,
      success: false,
      error: `${provider.toUpperCase()} video generation is disabled.`,
    });
  }

  try {
    const started = await startVideoJob({ provider, imageUrl: body.imageUrl, prompt, leadId: body.leadId || null, jobId });
    await upsertJob({
      id: jobId,
      type: 'smile_video',
      status: 'processing',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageUrl,
      output_asset_url: null,
      provider_job_id: started.providerJobId,
      error_message: null,
      provider: started.provider,
      model: started.model,
      metadata: started.metadata,
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    await auditLog('smile_video_started', { jobId, leadId: body.leadId || null, provider: started.provider, model: started.model, providerJobId: started.providerJobId });

    return json(202, {
      success: true,
      jobId,
      status: 'processing',
      assetUrl: null,
      provider: started.provider,
      model: started.model,
      providerJobId: started.providerJobId,
      note: started.note,
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
      model,
      metadata: { provider, model },
      created_at: now,
      updated_at: new Date().toISOString(),
    });
    await auditLog('smile_video_failed', { jobId, leadId: body.leadId || null, provider, model, message });
    return json(502, { success: false, error: message, provider, model, jobId });
  }
}

export async function handler(event) {
  return processVideoCreate(event);
}
