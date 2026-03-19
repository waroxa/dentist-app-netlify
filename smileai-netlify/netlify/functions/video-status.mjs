import { getSupabase, json } from './_lib.mjs';
export async function handler(event) {
  const id = event.queryStringParameters?.jobId;
  if (!id) return json(400, { success: false, error: 'jobId is required.' });
  const supabase = getSupabase();
  const { data, error } = await supabase.from('smile_jobs').select('*').eq('id', id).maybeSingle();
  if (error) return json(500, { success: false, error: 'Unable to load job.' });
  if (!data) return json(404, { success: false, error: 'Job not found.' });
  return json(200, {
    success: true,
    jobId: data.id,
    status: data.status,
    assetUrl: data.output_asset_url || null,
    error: data.error_message || null,
    provider: data.provider || null,
    model: data.model || null,
    providerJobId: data.provider_job_id || null,
  });
}
