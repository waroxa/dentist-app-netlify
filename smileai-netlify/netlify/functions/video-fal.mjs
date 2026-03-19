import { processVideoCreate } from './video-create.mjs';

export async function handler(event) {
  return processVideoCreate(event, 'fal');
}
