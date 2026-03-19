import { getSupabase, json, requireAdmin } from './_lib.mjs';
export async function handler(event) {
  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });
  const supabase = getSupabase();
  const { data, error } = await supabase.from('integration_connections').select('provider,location_id,scope,expires_at,is_active,updated_at').eq('provider', 'ghl').order('updated_at', { ascending: false });
  if (error) return json(500, { error: 'Failed to load connections.' });
  return json(200, { connections: data || [] });
}
