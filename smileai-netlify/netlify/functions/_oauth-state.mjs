import crypto from 'node:crypto';
import { getSupabase } from './_lib.mjs';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function createOAuthState(metadata = {}) {
  const supabase = getSupabase();
  const state = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + STATE_TTL_MS).toISOString();
  const { error } = await supabase.from('oauth_states').insert({
    state,
    metadata,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return state;
}

export async function consumeOAuthState(state) {
  if (!state) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('oauth_states')
    .select('state, metadata, expires_at')
    .eq('state', state)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // Single-use: delete immediately
  await supabase.from('oauth_states').delete().eq('state', state);
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  return data;
}
