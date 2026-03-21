import { json } from './_lib.mjs';
import { getVideoJobStatusResponse } from './_video-providers.mjs';

export async function handler(event) {
  if (event.httpMethod !== 'GET') return json(405, { success: false, error: 'Method not allowed' });
  const id = event.queryStringParameters?.jobId;
  if (!id) return json(400, { success: false, error: 'jobId is required.' });
  return getVideoJobStatusResponse(id);
}
