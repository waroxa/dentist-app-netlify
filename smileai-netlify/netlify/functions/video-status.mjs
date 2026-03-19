import { getSupabase, json } from './_lib.mjs';
export async function handler(event) {
  const id = event.queryStringParameters?.jobId;
  if (!id) return json(400, { error: 'jobId is required.' });
  const supabase = getSupabase();
  const { data, error } = await supabase.from('smile_jobs').select('*').eq('id', id).maybeSingle();
  if (error) return json(500, { error: 'Unable to load job.' });
  if (!data) return json(404, { error: 'Job not found.' });
  return json(200, { jobId: data.id, status: data.status, assetUrl: data.output_asset_url || null, error: data.error_message || null });
}
