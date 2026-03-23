import { getSupabase, json, requireAdmin } from './_lib.mjs';

function buildTags({ lead, previewJob, videoJob }) {
  const tags = [];
  tags.push('New Submission');
  if (lead?.interested_in) tags.push(lead.interested_in);
  if (previewJob?.output_asset_url) tags.push('Preview Ready');
  if (videoJob?.output_asset_url) tags.push('Video Ready');
  return tags;
}

function buildMedia({ lead, previewJob, videoJob }) {
  const media = [];

  if (previewJob?.input_image_data_url) {
    media.push({
      id: `${previewJob.id}-original`,
      type: 'image',
      url: previewJob.input_image_data_url,
      thumbnail: previewJob.input_image_data_url,
      filename: 'original-upload',
      size: '',
      uploadedAt: previewJob.created_at || lead?.created_at,
      description: 'Original patient upload',
    });
  }

  if (previewJob?.output_asset_url) {
    media.push({
      id: `${previewJob.id}-preview`,
      type: 'image',
      url: previewJob.output_asset_url,
      thumbnail: previewJob.output_asset_url,
      filename: 'ai-smile-preview',
      size: '',
      uploadedAt: previewJob.updated_at || previewJob.created_at || lead?.created_at,
      description: 'Generated smile preview',
    });
  }

  if (videoJob?.output_asset_url) {
    media.push({
      id: `${videoJob.id}-video`,
      type: 'video',
      url: videoJob.output_asset_url,
      thumbnail: previewJob?.output_asset_url || previewJob?.input_image_data_url || '',
      filename: 'ai-smile-video.mp4',
      size: '',
      uploadedAt: videoJob.updated_at || videoJob.created_at || lead?.created_at,
      description: 'Generated smile video',
    });
  }

  return media;
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });

  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { error: 'Patient id is required.' });

  try {
    const supabase = getSupabase();
    const [{ data: lead, error: leadError }, { data: jobs, error: jobsError }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).maybeSingle(),
      supabase.from('smile_jobs').select('*').eq('lead_id', id).order('updated_at', { ascending: false }),
    ]);

    if (leadError) throw leadError;
    if (jobsError) throw jobsError;
    if (!lead) return json(404, { error: 'Patient not found.' });

    const previewJob = (jobs || []).find((job) => job.type === 'smile_preview') || null;
    const videoJob = (jobs || []).find((job) => job.type === 'smile_video') || null;

    const patient = {
      id: lead.id,
      name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      dateAdded: lead.created_at,
      lastActivity: videoJob?.updated_at || previewJob?.updated_at || lead.created_at,
      location: 'Pending',
      source: 'Landing Page Form',
      tags: buildTags({ lead, previewJob, videoJob }),
      interestedIn: lead.interested_in || 'General consultation',
      notes: lead.notes || 'No notes added.',
      media: buildMedia({ lead, previewJob, videoJob }),
    };

    return json(200, { success: true, patient });
  } catch (error) {
    return json(500, { success: false, error: 'Failed to load patient profile.' });
  }
}
