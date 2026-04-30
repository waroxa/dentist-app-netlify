import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const envAliases = {
  GEMINI_API_KEY: ['GOOGLE_GEMINI_API_KEY'],
};

export const DEFAULT_IMAGE_BUCKET = 'make-c5a5d193-smile-images';
export const DEFAULT_VIDEO_BUCKET = 'ai Videos';

export function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...jsonHeaders, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

export function redirect(location, statusCode = 302) {
  return { statusCode, headers: { Location: location, 'Cache-Control': 'no-store' }, body: '' };
}

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getEnv(name, required = true) {
  const candidates = [name, ...(envAliases[name] || [])];
  for (const candidate of candidates) {
    const value = process.env[candidate];
    if (value) return value;
  }
  if (required) throw new Error(`Missing ${name}${envAliases[name] ? ` (accepted aliases: ${envAliases[name].join(', ')})` : ''}`);
  return undefined;
}

export function setDerivedEnv(name, value) {
  if (value && !process.env[name]) process.env[name] = value;
  return process.env[name];
}

export function safeParse(body) {
  try { return body ? JSON.parse(body) : {}; } catch { return null; }
}

export function normalizeWorkspaceKey(value) {
  const normalized = String(value || '').trim();
  return normalized || 'default';
}

export function normalizeEmail(email = '') { return String(email).trim().toLowerCase(); }
export function onlyDigits(value = '') { return String(value).replace(/\D/g, ''); }

export function validateLead(input) {
  const errors = [];
  if (!input.fullName || String(input.fullName).trim().length < 2) errors.push('Full name is required.');
  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
  const phone = onlyDigits(input.phone);
  if (phone.length < 10 || phone.length > 15) errors.push('A valid phone number is required.');
  return { errors, email, phone };
}

export function validateImageUpload({ mimeType, bytes }) {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowed.has(mimeType)) throw new Error('Only JPG, PNG, and WEBP images are supported.');
  if (!bytes || bytes.length < 1024) throw new Error('Please upload a valid image file.');
  if (bytes.length > 10 * 1024 * 1024) throw new Error('Image files must be 10MB or smaller.');
}

export function parseDataUrl(value = '') {
  const match = String(value).match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL payload.');
  return { mimeType: match[1], base64: match[2], bytes: Buffer.from(match[2], 'base64') };
}

export function getImageBucket() {
  return process.env.SUPABASE_IMAGE_BUCKET || process.env.SMILEVISION_STORAGE_BUCKET || DEFAULT_IMAGE_BUCKET;
}

export function getVideoBucket() {
  return process.env.SUPABASE_VIDEO_BUCKET || DEFAULT_VIDEO_BUCKET;
}

export async function uploadBase64Asset({ bucket = getImageBucket(), folder = 'generated', fileName, dataUrl, contentType, cacheControl = '3600' }) {
  const supabase = getSupabase();
  const parsed = parseDataUrl(dataUrl);
  const assetType = contentType || parsed.mimeType;
  const extension = assetType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
  const assetPath = `${folder}/${fileName || crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(assetPath, parsed.bytes, {
    contentType: assetType,
    cacheControl,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(assetPath);
  return { bucket, path: assetPath, publicUrl: data.publicUrl, contentType: assetType };
}

export function adminCookieName() { return 'svpro_admin'; }
export function adminSetupCookieName() { return 'svpro_admin_setup'; }

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

export function signAdminSession(payload) {
  const secret = getEnv('SMILEVISION_ADMIN_SESSION_SECRET');
  const encoded = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminSession(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const secret = getEnv('SMILEVISION_ADMIN_SESSION_SECRET');
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

export function readCookie(event, name) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  const cookies = cookieHeader.split(';').map((v) => v.trim());
  for (const item of cookies) {
    const [k, ...rest] = item.split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

export function adminSetCookie(token, maxAge = 60 * 60 * 8) {
  return `${adminCookieName()}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function adminClearCookie() {
  return `${adminCookieName()}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
export function adminSetupSetCookie(token, maxAge = 60 * 15) {
  return `${adminSetupCookieName()}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function adminSetupClearCookie() {
  return `${adminSetupCookieName()}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function requireAdmin(event) {
  const token = readCookie(event, adminCookieName());
  const session = verifyAdminSession(token);
  if (!session) return null;
  return session;
}

export async function requireAdminSetup(event) {
  const token = readCookie(event, adminSetupCookieName());
  const session = verifyAdminSession(token);
  if (!session || session.purpose !== 'admin_setup') return null;
  return session;
}

export function resolveWorkspaceKey(event, body = {}) {
  return normalizeWorkspaceKey(
    body.workspaceKey ||
    body.locationId ||
    body.location_id ||
    event?.queryStringParameters?.workspaceKey ||
    event?.queryStringParameters?.locationId ||
    event?.queryStringParameters?.location_id,
  );
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(String(password), salt, 64);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPassword(password, passwordHash) {
  const [scheme, saltHex, hashHex] = String(passwordHash || '').split(':');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const provided = crypto.scryptSync(String(password), salt, expected.length);
  return crypto.timingSafeEqual(provided, expected);
}

export function getAdminSetupSecret() {
  return getEnv('SMILEVISION_ADMIN_SETUP_SECRET');
}

export async function getAdminCredential(workspaceKey = 'default') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('workspace_key, password_hash, activated_at, password_updated_at')
    .eq('workspace_key', normalizeWorkspaceKey(workspaceKey))
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setAdminCredential({ workspaceKey = 'default', passwordHash, metadata = {} }) {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const payload = {
    workspace_key: normalizeWorkspaceKey(workspaceKey),
    password_hash: passwordHash,
    activated_at: now,
    password_updated_at: now,
    metadata,
  };
  const { data, error } = await supabase
    .from('admin_credentials')
    .upsert(payload, { onConflict: 'workspace_key' })
    .select('workspace_key, activated_at, password_updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function getWorkspaceInstall(workspaceKey = 'default') {
  const normalizedKey = normalizeWorkspaceKey(workspaceKey);
  if (normalizedKey === 'default') return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('integration_connections')
    .select('location_id, provider, updated_at')
    .eq('provider', 'ghl')
    .eq('location_id', normalizedKey)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data ? { locationId: data.location_id, provider: data.provider, installed_at: data.updated_at } : null;
}

function getKeyBytes() {
  const raw = getEnv('TOKEN_ENCRYPTION_KEY');
  const normalized = raw.length === 44 ? Buffer.from(raw, 'base64') : Buffer.from(raw, 'hex');
  if (normalized.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
  return normalized;
}

export function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const key = getKeyBytes();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptSecret(value) {
  const payload = Buffer.from(String(value), 'base64');
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKeyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export async function auditLog(action, metadata = {}) {
  try {
    const supabase = getSupabase();
    await supabase.from('audit_logs').insert({ action, metadata, created_at: new Date().toISOString() });
  } catch (error) {
    console.warn('audit_log_failed', error.message);
  }
}

export async function upsertJob(job) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('smile_jobs').upsert(job, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

export async function getLeadRecord(leadId) {
  if (!leadId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getActiveIntegrationConnection(provider = 'ghl') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('provider', provider)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLeadCrmContactId(leadId) {
  if (!leadId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('metadata, created_at')
    .eq('action', 'lead_created')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  const match = (data || []).find((entry) => entry?.metadata?.leadId === leadId && entry?.metadata?.crmContactId);
  return match?.metadata?.crmContactId || null;
}

function buildGhlCustomFields(fieldMap) {
  return Object.entries(fieldMap)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => ({ key, field_value: String(value) }));
}

async function requestGhl(connection, path, { method = 'GET', body } = {}) {
  if (!connection?.access_token_encrypted) throw new Error('Missing active GHL access token.');
  const accessToken = decryptSecret(connection.access_token_encrypted);
  const response = await fetch(`https://services.leadconnectorhq.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = safeParse(text) || {};
  if (!response.ok) {
    throw new Error(data?.message || data?.error || text || `GHL request failed with ${response.status}`);
  }
  return data;
}

export async function syncLeadAssetsToCRM({
  leadId,
  crmContactId = null,
  previewUrl = null,
  videoUrl = null,
  status = null,
  previewJobId = null,
  videoJobId = null,
}) {
  if (!leadId) return { synced: false, reason: 'missing_lead' };

  const [lead, connection] = await Promise.all([
    getLeadRecord(leadId),
    getActiveIntegrationConnection('ghl'),
  ]);

  if (!lead) return { synced: false, reason: 'lead_not_found' };
  if (!connection?.location_id || !connection?.access_token_encrypted) {
    return { synced: false, reason: 'missing_connection' };
  }

  const resolvedContactId = crmContactId || await getLeadCrmContactId(leadId);
  if (!resolvedContactId) return { synced: false, reason: 'missing_contact' };

  const customFields = buildGhlCustomFields({
    smile_preview_url: previewUrl,
    smile_video_url: videoUrl,
    transformation_status: status,
    smile_preview_job_id: previewJobId,
    smile_video_job_id: videoJobId,
  });

  if (customFields.length) {
    await requestGhl(connection, `/contacts/${resolvedContactId}`, {
      method: 'PUT',
      body: { customFields },
    });
  }

  const noteLines = [
    `SmileVisionPro asset update for ${lead.full_name || 'patient'}.`,
    status ? `Status: ${status}` : null,
    previewUrl ? `Preview URL: ${previewUrl}` : null,
    videoUrl ? `Video URL: ${videoUrl}` : null,
  ].filter(Boolean);

  if (noteLines.length > 1) {
    try {
      await requestGhl(connection, `/contacts/${resolvedContactId}/notes`, {
        method: 'POST',
        body: { body: noteLines.join('\n') },
      });
    } catch (error) {
      await auditLog('lead_asset_note_sync_failed', { leadId, crmContactId: resolvedContactId, message: error.message });
    }
  }

  await auditLog('lead_asset_synced', {
    leadId,
    crmContactId: resolvedContactId,
    status,
    previewUrl,
    videoUrl,
    previewJobId,
    videoJobId,
  });

  return { synced: true, crmContactId: resolvedContactId };
}

export async function retry(fn, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try { return await fn(attempt); } catch (error) { lastError = error; }
  }
  throw lastError;
}

export function log(event, details = {}) {
  console.log(JSON.stringify({ level: 'info', ts: new Date().toISOString(), event, ...details }));
}

export function errorLog(event, error, details = {}) {
  console.error(JSON.stringify({ level: 'error', ts: new Date().toISOString(), event, message: error?.message || String(error), ...details }));
}
