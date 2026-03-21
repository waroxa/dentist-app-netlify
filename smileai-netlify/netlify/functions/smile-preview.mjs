import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { auditLog, errorLog, getEnv, getImageBucket, json, log, parseDataUrl, retry, upsertJob, validateImageUpload, safeParse, setDerivedEnv, uploadBase64Asset } from './_lib.mjs';

const PROMPTS = {
  subtle: 'Transform only the teeth into a beautiful, natural smile. Remove any braces, retainers, or dental hardware. Fix crooked teeth to be perfectly straight and evenly aligned. Rebuild any missing or damaged teeth. Whiten teeth to a clean, natural shade with subtle highlights. Fix any gaps, chips, or discoloration. Maintain realistic texture and natural gum line. Do NOT change skin, hair, eyes, face shape, background or lighting. Focus exclusively on creating amazingly beautiful, straight, white teeth.',
  natural: 'Transform only the teeth into a gorgeous, natural smile. Remove any braces, retainers, or dental hardware. Straighten all crooked teeth into perfect alignment with even spacing. Rebuild any missing or damaged teeth completely. Whiten teeth to a bright, natural pearly white with proper highlights and depth. Fix all gaps, chips, stains, or discoloration. Create a beautiful, symmetrical smile with realistic texture and healthy-looking gums. Do NOT change skin, hair, eyes, face shape, background or lighting. Focus exclusively on creating stunningly beautiful, perfectly straight, naturally white teeth.',
  bright: 'Create a PERFECT HOLLYWOOD CELEBRITY SMILE transformation. This is CRITICAL - the teeth must be ABSOLUTELY FLAWLESS with ZERO GAPS, ZERO IMPERFECTIONS. Requirements: 1) REMOVE ALL GAPS between teeth - teeth must touch each other perfectly with no visible spaces. 2) Make teeth ULTRA BRIGHT WHITE like porcelain veneers - the whitest possible shade while still looking real. 3) Perfect symmetry and alignment - every tooth perfectly straight and evenly sized. 4) Fill in ALL missing teeth completely. 5) Create beautiful uniform tooth shapes like professional dental veneers. 6) Healthy pink gums. CRITICAL: Absolutely NO GAPS between any teeth - this is mandatory. The result should look like expensive Hollywood veneers - brilliant white, perfectly aligned, no spaces between teeth at all. Do NOT change anything except the teeth - keep skin, hair, eyes, face, background exactly the same.',
};

function extractImagePart(result) {
  const candidateParts = result?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) || [];
  return candidateParts.find((part) => part?.inlineData?.data) || result?.generatedImages?.[0]?.image || null;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.imageDataUrl) return json(400, { error: 'Image upload is required.' });

  const jobId = body.jobId || crypto.randomUUID();
  const intensity = body.intensity && PROMPTS[body.intensity] ? body.intensity : 'natural';
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const now = new Date().toISOString();

  try {
    const geminiApiKey = getEnv('GEMINI_API_KEY');
    setDerivedEnv('GEMINI_API_KEY', geminiApiKey);
    const parsed = parseDataUrl(body.imageDataUrl);
    validateImageUpload(parsed);

    await upsertJob({
      id: jobId,
      type: 'smile_preview',
      status: 'processing',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageDataUrl,
      error_message: null,
      provider: 'gemini',
      model,
      metadata: { intensity, mimeType: parsed.mimeType, imageBytes: parsed.bytes.length },
      created_at: now,
      updated_at: now,
    });

    log('smile_preview_request', { jobId, leadId: body.leadId || null, intensity, mimeType: parsed.mimeType, imageBytes: parsed.bytes.length, usingEnv: process.env.GEMINI_API_KEY === process.env.GOOGLE_GEMINI_API_KEY ? 'GOOGLE_GEMINI_API_KEY' : 'GEMINI_API_KEY' });

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const result = await retry(() => ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { text: PROMPTS[intensity] },
          { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
        ],
      }],
    }), 1);

    const imgPart = extractImagePart(result);
    const inlineData = imgPart?.inlineData || imgPart;
    if (!inlineData?.data) {
      errorLog('smile_preview_missing_image', new Error('Gemini returned no inline image'), { jobId, resultKeys: Object.keys(result || {}) });
      throw new Error('Gemini returned no image output for this request.');
    }

    const previewUrl = `data:${inlineData.mimeType || parsed.mimeType};base64,${inlineData.data}`;
    const uploaded = await uploadBase64Asset({
      bucket: getImageBucket(),
      folder: 'smile-previews',
      fileName: `${jobId}-${intensity}`,
      dataUrl: previewUrl,
      contentType: inlineData.mimeType || parsed.mimeType,
    });

    await upsertJob({
      id: jobId,
      type: 'smile_preview',
      status: 'completed',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageDataUrl,
      output_image_data_url: previewUrl,
      output_asset_url: uploaded.publicUrl,
      error_message: null,
      provider: 'gemini',
      model,
      metadata: { intensity, mimeType: inlineData.mimeType || parsed.mimeType, storagePath: uploaded.path },
      created_at: now,
      updated_at: new Date().toISOString(),
    });

    await auditLog('smile_preview_completed', { jobId, leadId: body.leadId || null, intensity, previewAssetUrl: uploaded.publicUrl });
    log('smile_preview_completed', { jobId, intensity, previewAssetUrl: uploaded.publicUrl });
    return json(200, { success: true, jobId, previewImageUrl: previewUrl, previewAssetUrl: uploaded.publicUrl, intensity, provider: 'gemini' });
  } catch (error) {
    const message = error?.message || 'Unknown smile preview error';
    errorLog('smile_preview_failed', error, { jobId, intensity, leadId: body.leadId || null });
    try {
      await upsertJob({
        id: jobId,
        type: 'smile_preview',
        status: 'failed',
        lead_id: body.leadId || null,
        input_image_data_url: body.imageDataUrl,
        error_message: message,
        provider: 'gemini',
        model,
        metadata: { intensity },
        created_at: now,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    const statusCode = /Only JPG|Only PNG|Only WEBP|valid image file|10MB|Invalid image/i.test(message) ? 400 : /Missing GEMINI_API_KEY/i.test(message) ? 500 : 502;
    return json(statusCode, {
      error: message,
      jobId,
      intensity,
      provider: 'gemini',
      expectedEnv: ['GEMINI_API_KEY', 'GOOGLE_GEMINI_API_KEY'],
    });
  }
}
