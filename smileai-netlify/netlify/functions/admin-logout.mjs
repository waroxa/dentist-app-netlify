import { adminClearCookie, json } from './_lib.mjs';
export async function handler() {
  return json(200, { ok: true }, { 'Set-Cookie': adminClearCookie() });
}
