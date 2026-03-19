import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { auditLog, errorLog, getSupabase, json, log, parseDataUrl, retry, upsertJob, validateImageUpload, safeParse } from './_lib.mjs';

const PROMPTS = {
  subtle: 'Transform only the teeth into a natural, healthy, more even smile while preserving the person, lighting, skin, gums, and background.',
  natural: 'Create a realistic cosmetic dental smile preview with straighter, brighter, healthy teeth while preserving facial identity and lighting.',
  bright: 'Create a polished premium smile makeover preview with beautifully aligned, bright natural teeth while preserving realism and identity.',
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = safeParse(event.body);
  if (!body?.imageDataUrl) return json(400, { error: 'Image upload is required.' });
  const jobId = body.jobId || crypto.randomUUID();
  try {
    const parsed = parseDataUrl(body.imageDataUrl);
    validateImageUpload(parsed);
    const prompt = PROMPTS[body.intensity] || PROMPTS.natural;
    await upsertJob({ id: jobId, type: 'smile_preview', status: 'processing', lead_id: body.leadId || null, input_image_data_url: body.imageDataUrl, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await retry(() => ai.models.generateContent({
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
      contents: [{ text: prompt }, { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } }],
    }), 1);
    const imgPart = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    if (!imgPart?.inlineData?.data) throw new Error('AI provider returned no image output.');
    const previewUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
    await upsertJob({ id: jobId, type: 'smile_preview', status: 'completed', lead_id: body.leadId || null, input_image_data_url: body.imageDataUrl, output_image_data_url: previewUrl, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    await auditLog('smile_preview_completed', { jobId, leadId: body.leadId || null });
    log('smile_preview_completed', { jobId });
    return json(200, { success: true, jobId, previewImageUrl: previewUrl });
  } catch (error) {
    errorLog('smile_preview_failed', error, { jobId });
    try {
      await upsertJob({ id: jobId, type: 'smile_preview', status: 'failed', error_message: error.message, lead_id: body.leadId || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    } catch {}
    return json(502, { error: 'We could not generate the smile preview right now. Please try again in a moment.' });
  }
}
