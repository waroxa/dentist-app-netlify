import crypto from 'node:crypto';
import { errorLog, getEnv, json, log, parseDataUrl, retry, safeParse } from './_lib.mjs';

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
    return process.env.VEO_MODEL || 'veo-3.1-generate-001';
  }
  return process.env.FAL_VIDEO_MODEL || 'fal-ai/kling-video/v2.6/pro/image-to-video';
}

export function providerEnabled(provider) {
  if (provider === 'veo') return String(process.env.VEO_ENABLED || 'true').toLowerCase() !== 'false';
  return String(process.env.FAL_ENABLED || 'true').toLowerCase() !== 'false';
}

export async function createVideoWithProvider({ provider, imageUrl, prompt }) {
  if (provider === 'veo') return createVeoVideo({ imageUrl, prompt });
  return createFalVideo({ imageUrl, prompt });
}

async function createFalVideo({ imageUrl, prompt }) {
  const apiKey = getEnv('FAL_API_KEY');
  const model = resolveVideoModel('fal');
  const endpoint = model.startsWith('http') ? model : `https://fal.run/${model}`;
  const payload = {
    image_url: imageUrl,
    prompt: prompt || DEFAULT_VIDEO_PROMPT,
    duration: '5',
    aspect_ratio: '1:1',
  };

  log('video_provider_request', { provider: 'fal', endpoint, promptLength: payload.prompt.length, imageUrlLength: imageUrl.length });

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
  const creds = JSON.parse(raw);
  if (!creds.client_email || !creds.private_key) throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is missing client_email or private_key');
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

async function createVeoVideo({ imageUrl, prompt }) {
  const projectId = getEnv('GOOGLE_CLOUD_PROJECT_ID');
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
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

  let assetUrl = null;
  if (video.bytesBase64Encoded) {
    assetUrl = `data:${video.mimeType || 'video/mp4'};base64,${video.bytesBase64Encoded}`;
  } else if (video.gcsUri) {
    assetUrl = video.gcsUri;
  }

  if (!assetUrl) {
    throw new Error('Veo returned neither inline video bytes nor a storage URI.');
  }

  return {
    provider: 'veo',
    model,
    providerJobId: body.name,
    assetUrl,
    raw: operation,
  };
}

export function providerSetupError(provider) {
  if (provider === 'veo') {
    return json(500, {
      error: 'Veo is not configured.',
      provider: 'veo',
      requiredEnv: ['GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_CLOUD_LOCATION', 'GOOGLE_APPLICATION_CREDENTIALS_JSON', 'VEO_MODEL'],
    });
  }
  return json(500, {
    error: 'FAL is not configured.',
    provider: 'fal',
    requiredEnv: ['FAL_API_KEY', 'FAL_VIDEO_MODEL'],
  });
}
