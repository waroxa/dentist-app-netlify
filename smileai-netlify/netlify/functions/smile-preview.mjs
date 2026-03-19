import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { auditLog, errorLog, getEnv, json, log, parseDataUrl, retry, upsertJob, validateImageUpload, safeParse } from './_lib.mjs';

const PROMPTS = {
  subtle: 'Transform only the teeth into a beautiful, natural smile. Remove any braces, retainers, or dental hardware. Fix crooked teeth to be perfectly straight and evenly aligned. Rebuild any missing or damaged teeth. Whiten teeth to a clean, natural shade with subtle highlights. Fix any gaps, chips, or discoloration. Maintain realistic texture and natural gum line. Do NOT change skin, hair, eyes, face shape, background or lighting. Focus exclusively on creating amazingly beautiful, straight, white teeth.',
  natural: 'Transform only the teeth into a gorgeous, natural smile. Remove any braces, retainers, or dental hardware. Straighten all crooked teeth into perfect alignment with even spacing. Rebuild any missing or damaged teeth completely. Whiten teeth to a bright, natural pearly white with proper highlights and depth. Fix all gaps, chips, stains, or discoloration. Create a beautiful, symmetrical smile with realistic texture and healthy-looking gums. Do NOT change skin, hair, eyes, face shape, background or lighting. Focus exclusively on creating stunningly beautiful, perfectly straight, naturally white teeth.',
  bright: 'Transform only the teeth into an absolutely flawless, professional Hollywood smile - like the final result after complete dental treatment by an expert cosmetic dentist. COMPLETELY remove all braces, retainers, wires, brackets, and any dental hardware - leave zero trace of orthodontics. Straighten EVERY tooth into PERFECT, FLAWLESS alignment with ideal spacing and absolute symmetry - ensure there is not even the slightest hint of crookedness. Each tooth must be perfectly positioned, perfectly straight, and perfectly even. Rebuild any missing or damaged teeth to absolute perfection with no imperfections whatsoever. Whiten teeth to a bright, luminous professional white with realistic depth, natural highlights, and subtle translucency - like celebrity teeth that are professionally whitened but still look achievable and real. Create perfectly even tooth sizes and shapes with beautiful natural texture, subtle shine, and healthy pink gums. The smile must look like a completed professional dental transformation - perfectly straight, perfectly aligned, perfectly white - yet still realistic and not fake or overly artificial. Zero crookedness allowed. Do NOT change skin, hair, eyes, face shape, background or lighting. Focus exclusively on creating a PERFECTLY STRAIGHT, PERFECTLY ALIGNED, professionally whitened Hollywood smile with zero imperfections.',
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.imageDataUrl) return json(400, { error: 'Image upload is required.' });

  const jobId = body.jobId || crypto.randomUUID();
  const intensity = body.intensity && PROMPTS[body.intensity] ? body.intensity : 'natural';

  try {
    getEnv('GEMINI_API_KEY');
    const parsed = parseDataUrl(body.imageDataUrl);
    validateImageUpload(parsed);

    await upsertJob({
      id: jobId,
      type: 'smile_preview',
      status: 'processing',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageDataUrl,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await retry(() => ai.models.generateContent({
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
      contents: [
        { text: PROMPTS[intensity] },
        { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
      ],
    }), 1);

    const candidateParts = result?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) || [];
    const imgPart = candidateParts.find((part) => part?.inlineData?.data);
    if (!imgPart?.inlineData?.data) {
      throw new Error('Gemini returned no image output for this request.');
    }

    const previewUrl = `data:${imgPart.inlineData.mimeType || parsed.mimeType};base64,${imgPart.inlineData.data}`;

    await upsertJob({
      id: jobId,
      type: 'smile_preview',
      status: 'completed',
      lead_id: body.leadId || null,
      input_image_data_url: body.imageDataUrl,
      output_image_data_url: previewUrl,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await auditLog('smile_preview_completed', { jobId, leadId: body.leadId || null, intensity });
    log('smile_preview_completed', { jobId, intensity });
    return json(200, { success: true, jobId, previewImageUrl: previewUrl, intensity });
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch {}

    const statusCode = /Only JPG|Only PNG|Only WEBP|valid image file|10MB|Invalid image/i.test(message) ? 400 : /Missing GEMINI_API_KEY/i.test(message) ? 500 : 502;
    return json(statusCode, {
      error: message,
      jobId,
      intensity,
      provider: 'gemini',
    });
  }
}
