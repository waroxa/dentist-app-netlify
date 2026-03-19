import crypto from 'node:crypto';
import { errorLog, getEnv, getImageBucket, getVideoBucket, json, log, parseDataUrl, retry, safeParse, uploadBase64Asset } from './_lib.mjs';

const DEFAULT_VIDEO_PROMPT = 'Professional dental testimonial style: The person smoothly and naturally showcases their beautiful white teeth with confidence. Starts with a gentle, warm smile that gradually widens to reveal the perfect teeth. Natural facial expressions flow smoothly - subtle head movements, soft eye expressions, and genuine joy. Like someone proudly showing their smile transformation in a high-end dental commercial. Movements are slow, graceful, and professional. Natural breathing, soft blinking, gentle smile variations. No sudden jerks or awkward expressions - everything flows beautifully and naturally. The person looks comfortable, confident, and genuinely happy with their smile.';

export function getDefaultVideoPrompt() {
  return DEFAULT_VIDEO_PROMPT;
}

export function resolveVideoProvider(requestedProvider) {
  const provider = String(requestedProvider || process.env.VIDEO_PROVIDER_DEFAULT || 'fal').trim().toLowerCase();
  if (!['fal', 'veo'].includes(provider)) {
    throw new Error(`Unsupported video provider: ${provider}`);
  }
  return provider;
}

export function resolveVideoModel(provider) {
  if (provider === 'veo') {
    return getEnv('VEO_MODEL');
  }
  return process.env.FAL_VIDEO_MODEL || 'fal-ai/kling-video/v2.6/pro/image-to-video';
}

function buildProviderError(provider, message, details = {}, statusCode = 500) {
  return {
    statusCode,
    provider,
    error: message,
    ...details,
  };
}

export function validateVideoProviderConfig(provider) {
  if (provider === 'fal') {
    const missing = [];
    if (!process.env.FAL_API_KEY) missing.push('FAL_API_KEY');
    if (missing.length) {
      return buildProviderError('fal', 'FAL is not configured yet. Missing FAL backend configuration.', {
        missingEnv: missing,
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

export async function createVideoWithProvider({ provider, imageUrl, prompt, leadId, jobId }) {
  if (provider === 'veo') return createVeoVideo({ imageUrl, prompt, leadId, jobId });
  return createFalVideo({ imageUrl, prompt, leadId, jobId });
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

async function createFalVideo({ imageUrl, prompt, leadId, jobId }) {
  const apiKey = getEnv('FAL_API_KEY');
  const model = resolveVideoModel('fal');
  const endpoint = model.startsWith('http') ? model : `https://fal.run/${model}`;
  const publicImageUrl = await ensurePublicImageUrl(imageUrl, leadId, jobId);
  const payload = {
    image_url: publicImageUrl,
    prompt: prompt || DEFAULT_VIDEO_PROMPT,
    duration: '5',
    aspect_ratio: '1:1',
  };

  log('video_provider_request', { provider: 'fal', endpoint, promptLength: payload.prompt.length, publicImageUrl });

  const response = await retry(() => fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }), 1);

  const responseText = await response.text();
  let body = null;
  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorMessage = body?.error || body?.message || responseText || `FAL request failed with ${response.status}`;
    throw new Error(`FAL error ${response.status}: ${errorMessage}`);
  }

  const assetUrl = body?.video?.url || body?.video_url || body?.assetUrl || body?.url;
  if (!assetUrl) {
    errorLog('fal_missing_video_url', new Error('No video URL in FAL response'), { body });
    throw new Error('FAL returned no video URL.');
  }

  return {
    provider: 'fal',
    model,
    providerJobId: body?.requestId || body?.jobId || null,
    assetUrl,
    raw: body,
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
  if (missingFields.length) {
    throw new Error(`GOOGLE_APPLICATION_CREDENTIALS_JSON is missing ${missingFields.join(', ')}`);
  }

  if (creds.type && creds.type !== 'service_account') {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON must be a service account credential');
  }

  return creds;
}

function createSignedJwt({ clientEmail, privateKey, scope, tokenUri }) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope,
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  })).toString('base64url');
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
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const tokenBody = safeParse(await response.text());
  if (!response.ok || !tokenBody?.access_token) {
    throw new Error(`Google OAuth token request failed: ${tokenBody?.error_description || tokenBody?.error || response.status}`);
  }

  log('veo_auth_ready', { provider: 'veo' });
  return tokenBody.access_token;
}

async function pollVeoOperation({ operationName, model, accessToken, projectId, location }) {
  const pollUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:fetchPredictOperation`;
  const startedAt = Date.now();
  let lastBody = null;

  while (Date.now() - startedAt < 5 * 60 * 1000) {
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
    lastBody = body;

    if (!response.ok) {
      throw new Error(`Veo polling failed: ${body?.error?.message || text || response.status}`);
    }

    if (body?.done) return body;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Veo video generation timed out. Last response: ${JSON.stringify(lastBody || {})}`);
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

  if (video.gcsUri) {
    return { assetUrl: video.gcsUri, storagePath: null };
  }

  throw new Error('Veo returned neither inline video bytes nor a storage URI.');
}

async function createVeoVideo({ imageUrl, prompt, leadId, jobId }) {
  const projectId = getEnv('GOOGLE_CLOUD_PROJECT_ID');
  const location = getEnv('GOOGLE_CLOUD_LOCATION');
  const model = resolveVideoModel('veo');
  const accessToken = await getGoogleAccessToken();
  const parsed = parseDataUrl(imageUrl);
  if (!['image/jpeg', 'image/png'].includes(parsed.mimeType)) {
    throw new Error('Veo currently supports JPEG or PNG preview images.');
  }

  const requestPayload = {
    instances: [
      {
        prompt: prompt || DEFAULT_VIDEO_PROMPT,
        image: {
          bytesBase64Encoded: parsed.base64,
          mimeType: parsed.mimeType,
        },
      },
    ],
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
  log('video_provider_request', { provider: 'veo', endpoint, model, promptLength: requestPayload.instances[0].prompt.length, imageBytes: parsed.bytes.length });

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
  if (!response.ok || !body?.name) {
    throw new Error(`Veo request failed: ${body?.error?.message || body?.message || text || response.status}`);
  }

  const operation = await pollVeoOperation({ operationName: body.name, model, accessToken, projectId, location });
  const video = operation?.response?.videos?.[0];
  if (!video) {
    throw new Error(`Veo returned no videos. Response: ${JSON.stringify(operation?.response || {})}`);
  }

  const normalized = await normalizeVeoAsset(video, leadId, jobId);

  return {
    provider: 'veo',
    model,
    providerJobId: body.name,
    assetUrl: normalized.assetUrl,
    storagePath: normalized.storagePath,
    raw: operation,
  };
}

export function providerSetupError(provider, override = null) {
  const failure = override || validateVideoProviderConfig(provider) || buildProviderError(
    provider,
    provider === 'veo'
      ? 'Veo is not configured yet. Missing Google Cloud backend configuration.'
      : 'FAL is not configured yet. Missing FAL backend configuration.',
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
