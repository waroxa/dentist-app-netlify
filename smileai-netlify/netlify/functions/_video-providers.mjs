import crypto from 'node:crypto';
import {
  errorLog,
  getEnv,
  getImageBucket,
  getSupabase,
  getVideoBucket,
  json,
  log,
  parseDataUrl,
  retry,
  safeParse,
  uploadBase64Asset,
  upsertJob,
} from './_lib.mjs';

const DEFAULT_VIDEO_PROMPT = 'Professional dental testimonial style: The person smoothly and naturally showcases their beautiful white teeth with confidence. Starts with a gentle, warm smile that gradually widens to reveal the perfect teeth. Natural facial expressions flow smoothly - subtle head movements, soft eye expressions, and genuine joy. Like someone proudly showing their smile transformation in a high-end dental commercial. Movements are slow, graceful, and professional. Natural breathing, soft blinking, gentle smile variations. No sudden jerks or awkward expressions - everything flows beautifully and naturally. The person looks comfortable, confident, and genuinely happy with their smile.';
const VIDEO_JOB_TIMEOUT_MS = 15 * 60 * 1000;

export function getDefaultVideoPrompt() {
  return DEFAULT_VIDEO_PROMPT;
}

export function resolveVideoProvider(requestedProvider) {
  const provider = String(requestedProvider || process.env.VIDEO_PROVIDER_DEFAULT || 'fal').trim().toLowerCase();
  if (!['fal', 'veo'].includes(provider)) throw new Error(`Unsupported video provider: ${provider}`);
  return provider;
}

export function resolveVideoModel(provider) {
  if (provider === 'veo') return getEnv('VEO_MODEL');
  return process.env.FAL_VIDEO_MODEL || 'fal-ai/kling-video/v2.6/pro/image-to-video';
}

function buildProviderError(provider, message, details = {}, statusCode = 500) {
  return { statusCode, success: false, provider, error: message, ...details };
}

export function validateVideoProviderConfig(provider) {
  if (provider === 'fal') {
    if (!process.env.FAL_API_KEY) {
      return buildProviderError('fal', 'FAL is not configured yet. Missing FAL backend configuration.', {
        missingEnv: ['FAL_API_KEY'],
        logHint: 'Add the missing FAL environment variables in Netlify to enable FAL video generation.',
      });
    }
    return null;
  }

  const missing = [];
  for (const name of ['GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_CLOUD_LOCATION', 'VEO_MODEL', 'GOOGLE_APPLICATION_CREDENTIALS_JSON']) {
    if (!process.env[name]) missing.push(name);
  }
  if (missing.length) {
    return buildProviderError('veo', 'Veo is not configured yet. Missing Google Cloud backend configuration.', {
      missingEnv: missing,
      logHint: 'Confirm the Netlify Veo environment variables are set and that Vertex AI is enabled in the target Google Cloud project.',
    });
  }

  try {
    parseGoogleCredentials();
  } catch (error) {
    return buildProviderError('veo', 'Veo is not configured yet. Missing Google Cloud backend configuration.', {
      missingEnv: ['GOOGLE_APPLICATION_CREDENTIALS_JSON'],
      details: error.message,
      logHint: 'Verify GOOGLE_APPLICATION_CREDENTIALS_JSON is valid service account JSON with Vertex AI access.',
    });
  }

  return null;
}

export function providerEnabled(provider) {
  if (provider === 'veo') return String(process.env.VEO_ENABLED || 'true').toLowerCase() !== 'false';
  return String(process.env.FAL_ENABLED || 'true').toLowerCase() !== 'false';
}

async function ensurePublicImageUrl(imageUrl, leadId, jobId) {
  if (!String(imageUrl).startsWith('data:')) return imageUrl;
  const upload = await uploadBase64Asset({
    bucket: getImageBucket(),
    folder: `video-inputs/${leadId || 'anonymous'}`,
    fileName: jobId || crypto.randomUUID(),
    dataUrl: imageUrl,
  });
  return upload.publicUrl;
}

async function falJson(url, { method = 'GET', apiKey, body } = {}) {
  const response = await retry(() => fetch(url, {
    method,
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  }), 1);

  const text = await response.text();
  const data = safeParse(text);
  if (!response.ok) {
    const errorMessage = data?.detail || data?.error || data?.message || text || `FAL request failed with ${response.status}`;
    throw new Error(`FAL error ${response.status}: ${errorMessage}`);
  }
  return data || {};
}

function getFalBaseUrl(model) {
  return model.startsWith('http') ? model.replace(/\/$/, '') : `https://queue.fal.run/${model}`;
}

function extractFalAssetUrl(payload) {
  return payload?.video?.url || payload?.video_url || payload?.assetUrl || payload?.url || payload?.response?.video?.url || null;
}

async function startFalVideoJob({ imageUrl, prompt, leadId, jobId }) {
  const apiKey = getEnv('FAL_API_KEY');
  const model = resolveVideoModel('fal');
  const publicImageUrl = await ensurePublicImageUrl(imageUrl, leadId, jobId);
  const payload = {
    image_url: publicImageUrl,
    prompt: prompt || DEFAULT_VIDEO_PROMPT,
    duration: '5',
    aspect_ratio: '1:1',
  };
  const baseUrl = getFalBaseUrl(model);

  log('video_provider_request', { provider: 'fal', endpoint: baseUrl, promptLength: payload.prompt.length, publicImageUrl, mode: 'submit' });
  const body = await falJson(baseUrl, { method: 'POST', apiKey, body: payload });
  const requestId = body?.request_id || body?.requestId || body?.id;
  const statusUrl = body?.status_url || body?.statusUrl || (requestId ? `${baseUrl}/requests/${requestId}/status` : null);
  const responseUrl = body?.response_url || body?.responseUrl || (requestId ? `${baseUrl}/requests/${requestId}` : null);

  if (!requestId || !statusUrl) {
    errorLog('fal_missing_queue_metadata', new Error('FAL returned no request tracking metadata'), { body, jobId });
    throw new Error('FAL returned no request tracking metadata.');
  }

  return {
    provider: 'fal',
    model,
    providerJobId: requestId,
    metadata: {
      provider: 'fal',
      model,
      promptLength: payload.prompt.length,
      statusUrl,
      responseUrl,
      publicImageUrl,
      submittedAt: new Date().toISOString(),
    },
    note: 'FAL video generation started. This can take several minutes.',
  };
}

function parseGoogleCredentials() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON');
  }
  const missingFields = ['client_email', 'private_key', 'token_uri'].filter((field) => !creds[field]);
  if (missingFields.length) throw new Error(`GOOGLE_APPLICATION_CREDENTIALS_JSON is missing ${missingFields.join(', ')}`);
  if (creds.type && creds.type !== 'service_account') throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON must be a service account credential');
  return creds;
}

function createSignedJwt({ clientEmail, privateKey, scope, tokenUri }) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: clientEmail, scope, aud: tokenUri, exp: now + 3600, iat: now })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey, 'base64url');
  return `${unsigned}.${signature}`;
}

async function getGoogleAccessToken() {
  log('veo_auth_initializing', { provider: 'veo' });
  const creds = parseGoogleCredentials();
  const tokenUri = creds.token_uri || 'https://oauth2.googleapis.com/token';
  const assertion = createSignedJwt({
    clientEmail: creds.client_email,
    privateKey: creds.private_key,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    tokenUri,
  });
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const tokenBody = safeParse(await response.text());
  if (!response.ok || !tokenBody?.access_token) throw new Error(`Google OAuth token request failed: ${tokenBody?.error_description || tokenBody?.error || response.status}`);
  log('veo_auth_ready', { provider: 'veo' });
  return tokenBody.access_token;
}

async function normalizeVeoAsset(video, leadId, jobId) {
  if (video.bytesBase64Encoded) {
    const dataUrl = `data:${video.mimeType || 'video/mp4'};base64,${video.bytesBase64Encoded}`;
    const upload = await uploadBase64Asset({
      bucket: getVideoBucket(),
      folder: `video-results/${leadId || 'anonymous'}`,
      fileName: `${jobId || crypto.randomUUID()}-veo`,
      dataUrl,
      contentType: video.mimeType || 'video/mp4',
      cacheControl: '31536000',
    });
    return { assetUrl: upload.publicUrl, storagePath: upload.path };
  }
  if (video.gcsUri) return { assetUrl: video.gcsUri, storagePath: null };
  throw new Error('Veo returned neither inline video bytes nor a storage URI.');
}

async function startVeoVideoJob({ imageUrl, prompt, leadId, jobId }) {
  const projectId = getEnv('GOOGLE_CLOUD_PROJECT_ID');
  const location = getEnv('GOOGLE_CLOUD_LOCATION');
  const model = resolveVideoModel('veo');
  const accessToken = await getGoogleAccessToken();
  const parsed = parseDataUrl(imageUrl);
  if (!['image/jpeg', 'image/png'].includes(parsed.mimeType)) throw new Error('Veo currently supports JPEG or PNG preview images.');

  const requestPayload = {
    instances: [{
      prompt: prompt || DEFAULT_VIDEO_PROMPT,
      image: { bytesBase64Encoded: parsed.base64, mimeType: parsed.mimeType },
    }],
    parameters: {
      aspectRatio: '16:9',
      personGeneration: 'allow_adult',
      sampleCount: 1,
      durationSeconds: 8,
      generateAudio: true,
      resolution: '720p',
      resizeMode: 'pad',
    },
  };

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predictLongRunning`;
  log('video_provider_request', { provider: 'veo', endpoint, model, promptLength: requestPayload.instances[0].prompt.length, imageBytes: parsed.bytes.length, mode: 'submit' });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(requestPayload),
  });

  const text = await response.text();
  const body = safeParse(text);
  if (!response.ok || !body?.name) throw new Error(`Veo request failed: ${body?.error?.message || body?.message || text || response.status}`);

  return {
    provider: 'veo',
    model,
    providerJobId: body.name,
    metadata: {
      provider: 'veo',
      model,
      operationName: body.name,
      projectId,
      location,
      submittedAt: new Date().toISOString(),
      promptLength: requestPayload.instances[0].prompt.length,
    },
    note: 'AI video generation started. This can take several minutes.',
  };
}

export async function startVideoJob({ provider, imageUrl, prompt, leadId, jobId }) {
  if (provider === 'veo') return startVeoVideoJob({ imageUrl, prompt, leadId, jobId });
  return startFalVideoJob({ imageUrl, prompt, leadId, jobId });
}

function buildPendingJobResponse(job, extra = {}) {
  return {
    success: true,
    jobId: job.id,
    status: 'processing',
    assetUrl: null,
    provider: job.provider,
    model: job.model,
    providerJobId: job.provider_job_id || null,
    note: extra.note || `${String(job.provider || '').toUpperCase()} video is still processing.`,
    ...extra,
  };
}

function isTimedOut(job) {
  const started = Date.parse(job.updated_at || job.created_at || 0);
  return Number.isFinite(started) && Date.now() - started > VIDEO_JOB_TIMEOUT_MS;
}

async function failJob(job, message, metadata = {}) {
  const updated = await upsertJob({
    ...job,
    status: 'failed',
    error_message: message,
    metadata: { ...(job.metadata || {}), ...metadata },
    updated_at: new Date().toISOString(),
  });
  return json(200, {
    success: true,
    jobId: updated.id,
    status: 'failed',
    assetUrl: null,
    error: message,
    provider: updated.provider || null,
    model: updated.model || null,
    providerJobId: updated.provider_job_id || null,
  });
}

async function completeJob(job, { assetUrl, providerJobId, metadata = {}, note }) {
  const updated = await upsertJob({
    ...job,
    status: 'completed',
    output_asset_url: assetUrl,
    provider_job_id: providerJobId || job.provider_job_id || null,
    error_message: null,
    metadata: { ...(job.metadata || {}), ...metadata },
    updated_at: new Date().toISOString(),
  });

  return json(200, {
    success: true,
    jobId: updated.id,
    status: 'completed',
    assetUrl: updated.output_asset_url,
    error: null,
    provider: updated.provider || null,
    model: updated.model || null,
    providerJobId: updated.provider_job_id || null,
    note: note || `Your smile video is ready from ${String(updated.provider || '').toUpperCase()}.`,
  });
}

async function pollFalJob(job) {
  const apiKey = getEnv('FAL_API_KEY');
  const metadata = job.metadata || {};
  const model = job.model || resolveVideoModel('fal');
  const statusUrl = metadata.statusUrl || `${getFalBaseUrl(model)}/requests/${job.provider_job_id}/status`;
  const responseUrl = metadata.responseUrl || `${getFalBaseUrl(model)}/requests/${job.provider_job_id}`;

  const statusBody = await falJson(statusUrl, { apiKey });
  const status = String(statusBody?.status || statusBody?.state || '').toUpperCase();
  const logs = statusBody?.logs || [];
  const queueNote = logs.length ? String(logs[logs.length - 1]?.message || logs[logs.length - 1]).slice(0, 160) : null;

  if (['IN_PROGRESS', 'IN_QUEUE', 'QUEUED', 'PENDING', 'RUNNING'].includes(status) || !status) {
    await upsertJob({ ...job, metadata: { ...metadata, statusUrl, responseUrl, queueStatus: status || 'IN_PROGRESS', queueNote }, updated_at: new Date().toISOString() });
    return json(200, buildPendingJobResponse(job, { queueStatus: status || 'IN_PROGRESS', queueNote, note: queueNote || 'FAL is still rendering your video.' }));
  }

  if (['COMPLETED', 'SUCCEEDED', 'DONE'].includes(status)) {
    const resultBody = extractFalAssetUrl(statusBody) ? statusBody : await falJson(responseUrl, { apiKey });
    const assetUrl = extractFalAssetUrl(resultBody);
    if (!assetUrl) throw new Error('FAL completed without returning a video URL.');
    return completeJob(job, {
      assetUrl,
      providerJobId: job.provider_job_id,
      metadata: { ...metadata, statusUrl, responseUrl, queueStatus: status, completedAt: new Date().toISOString() },
      note: 'Your FAL smile video is ready.',
    });
  }

  if (['FAILED', 'ERROR', 'CANCELLED'].includes(status)) {
    const message = statusBody?.error || statusBody?.message || queueNote || 'FAL video generation failed.';
    return failJob(job, message, { ...metadata, statusUrl, responseUrl, queueStatus: status });
  }

  await upsertJob({ ...job, metadata: { ...metadata, statusUrl, responseUrl, queueStatus: status || 'UNKNOWN', queueNote }, updated_at: new Date().toISOString() });
  return json(200, buildPendingJobResponse(job, { queueStatus: status || 'UNKNOWN', queueNote, note: queueNote || 'FAL is still processing your video.' }));
}

async function pollVeoJob(job) {
  const metadata = job.metadata || {};
  const operationName = metadata.operationName || job.provider_job_id;
  if (!operationName) throw new Error('Missing Veo operation name.');

  const projectId = metadata.projectId || getEnv('GOOGLE_CLOUD_PROJECT_ID');
  const location = metadata.location || getEnv('GOOGLE_CLOUD_LOCATION');
  const model = job.model || resolveVideoModel('veo');
  const accessToken = await getGoogleAccessToken();
  const pollUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:fetchPredictOperation`;
  const response = await fetch(pollUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ operationName }),
  });
  const text = await response.text();
  const body = safeParse(text);
  if (!response.ok) throw new Error(`Veo polling failed: ${body?.error?.message || text || response.status}`);

  if (!body?.done) {
    const queueNote = body?.metadata?.state || body?.metadata?.progressMessage || 'AI Video is still generating your video.';
    await upsertJob({ ...job, metadata: { ...metadata, operationName, projectId, location, queueStatus: 'PROCESSING', queueNote }, updated_at: new Date().toISOString() });
    return json(200, buildPendingJobResponse(job, { queueStatus: 'PROCESSING', queueNote, note: String(queueNote) }));
  }

  if (body?.error?.message) return failJob(job, body.error.message, { ...metadata, operationName, projectId, location, queueStatus: 'FAILED' });

  const video = body?.response?.videos?.[0];
  if (!video) return failJob(job, `Veo returned no videos. Response: ${JSON.stringify(body?.response || {})}`, { ...metadata, operationName, projectId, location, queueStatus: 'FAILED' });

  const normalized = await normalizeVeoAsset(video, job.lead_id, job.id);
  return completeJob(job, {
    assetUrl: normalized.assetUrl,
    providerJobId: operationName,
    metadata: { ...metadata, operationName, projectId, location, queueStatus: 'COMPLETED', storagePath: normalized.storagePath, completedAt: new Date().toISOString() },
    note: 'Your AI smile video is ready.',
  });
}

export async function getVideoJobStatusResponse(jobId) {
  const supabase = getSupabase();
  const { data: job, error } = await supabase.from('smile_jobs').select('*').eq('id', jobId).maybeSingle();
  if (error) return json(500, { success: false, error: 'Unable to load job.' });
  if (!job) return json(404, { success: false, error: 'Job not found.' });

  if (job.type !== 'smile_video') {
    return json(200, {
      success: true,
      jobId: job.id,
      status: job.status,
      assetUrl: job.output_asset_url || null,
      error: job.error_message || null,
      provider: job.provider || null,
      model: job.model || null,
      providerJobId: job.provider_job_id || null,
    });
  }

  if (job.status === 'completed' || job.status === 'failed') {
    return json(200, {
      success: true,
      jobId: job.id,
      status: job.status,
      assetUrl: job.output_asset_url || null,
      error: job.error_message || null,
      provider: job.provider || null,
      model: job.model || null,
      providerJobId: job.provider_job_id || null,
      queueStatus: job.metadata?.queueStatus || null,
      queueNote: job.metadata?.queueNote || null,
    });
  }

  if (isTimedOut(job)) return failJob(job, `${String(job.provider || '').toUpperCase()} video generation timed out before completion.`, { queueStatus: 'TIMED_OUT' });

  try {
    if (job.provider === 'veo') return await pollVeoJob(job);
    return await pollFalJob(job);
  } catch (error) {
    errorLog('video_status_poll_failed', error, { jobId: job.id, provider: job.provider, providerJobId: job.provider_job_id });
    return failJob(job, error.message || 'Unable to retrieve video status.', { queueStatus: 'FAILED' });
  }
}

export function providerSetupError(provider, override = null) {
  const failure = override || validateVideoProviderConfig(provider) || buildProviderError(
    provider,
    provider === 'veo' ? 'Veo is not configured yet. Missing Google Cloud backend configuration.' : 'FAL is not configured yet. Missing FAL backend configuration.',
    {
      requiredEnv: provider === 'veo'
        ? ['GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_CLOUD_LOCATION', 'VEO_MODEL', 'GOOGLE_APPLICATION_CREDENTIALS_JSON']
        : ['FAL_API_KEY', 'FAL_VIDEO_MODEL'],
    },
  );

  errorLog('video_provider_not_configured', new Error(failure.error), {
    provider,
    missingEnv: failure.missingEnv || failure.requiredEnv || [],
    details: failure.details || null,
    logHint: failure.logHint || null,
  });

  return json(failure.statusCode || 500, failure);
}
