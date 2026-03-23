import { getSupabase, json, requireAdmin } from './_lib.mjs';

function mapStatus(previewJob, videoJob) {
  if (videoJob?.status === 'completed' && videoJob?.output_asset_url) return 'Completed';
  if (previewJob?.status === 'completed' && previewJob?.output_asset_url) return 'Active';
  return 'Pending';
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });

  try {
    const supabase = getSupabase();
    const [{ data: leads, error: leadsError }, { data: jobs, error: jobsError }, { data: auditLogs, error: auditError }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(250),
      supabase.from('smile_jobs').select('id, lead_id, type, status, output_asset_url, updated_at, created_at').order('updated_at', { ascending: false }).limit(1000),
      supabase.from('audit_logs').select('metadata, created_at').eq('action', 'lead_created').order('created_at', { ascending: false }).limit(500),
    ]);

    if (leadsError) throw leadsError;
    if (jobsError) throw jobsError;
    if (auditError) throw auditError;

    const jobMap = new Map();
    for (const job of jobs || []) {
      if (!job?.lead_id) continue;
      if (!jobMap.has(job.lead_id)) {
        jobMap.set(job.lead_id, { previewJob: null, videoJob: null });
      }
      const entry = jobMap.get(job.lead_id);
      if (job.type === 'smile_preview' && !entry.previewJob) entry.previewJob = job;
      if (job.type === 'smile_video' && !entry.videoJob) entry.videoJob = job;
    }

    const crmContactMap = new Map();
    for (const log of auditLogs || []) {
      const leadId = log?.metadata?.leadId;
      const crmContactId = log?.metadata?.crmContactId;
      if (leadId && crmContactId && !crmContactMap.has(leadId)) {
        crmContactMap.set(leadId, crmContactId);
      }
    }

    const patients = (leads || []).map((lead) => {
      const jobEntry = jobMap.get(lead.id) || {};
      const previewJob = jobEntry.previewJob || null;
      const videoJob = jobEntry.videoJob || null;
      const status = mapStatus(previewJob, videoJob);

      return {
        id: lead.id,
        crmContactId: crmContactMap.get(lead.id) || null,
        name: lead.full_name,
        fullName: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        interestedIn: lead.interested_in || '',
        notes: lead.notes || '',
        source: lead.source || 'public_site',
        createdAt: lead.created_at,
        lastVisit: lead.created_at,
        status,
        assessmentCompleted: Boolean(previewJob?.output_asset_url),
        consultationScheduled: false,
        avatar: null,
        previewImageUrl: previewJob?.output_asset_url || null,
        previewJobId: previewJob?.id || null,
        videoUrl: videoJob?.output_asset_url || null,
        videoJobId: videoJob?.id || null,
      };
    });

    return json(200, { success: true, patients });
  } catch (error) {
    return json(500, { success: false, error: 'Failed to load patients.' });
  }
}
