import { json, requireAdmin } from './_lib.mjs';
export async function handler(event) {
  const session = await requireAdmin(event);
  if (!session) return json(401, { authenticated: false });
  return json(200, { authenticated: true, role: session.role, exp: session.exp });
}
