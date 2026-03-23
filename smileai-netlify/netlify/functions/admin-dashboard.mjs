import { getSupabase, json, requireAdmin } from './_lib.mjs';

function startOfMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const admin = await requireAdmin(event);
  if (!admin) return json(401, { error: 'Unauthorized' });

  try {
    const supabase = getSupabase();
    const monthStart = startOfMonthIso();
    const [{ data: leads, error: leadsError }, { data: jobs, error: jobsError }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(250),
      supabase.from('smile_jobs').select('id, lead_id, type, status, output_asset_url, created_at, updated_at').order('updated_at', { ascending: false }).limit(1000),
    ]);

    if (leadsError) throw leadsError;
    if (jobsError) throw jobsError;

    const previewLeadIds = new Set();
    const videoLeadIds = new Set();
    const recentActivity = [];

    for (const job of jobs || []) {
      if (job.lead_id && job.type === 'smile_preview' && job.output_asset_url) {
        previewLeadIds.add(job.lead_id);
      }
      if (job.lead_id && job.type === 'smile_video' && job.output_asset_url) {
        videoLeadIds.add(job.lead_id);
      }
    }

    for (const lead of (leads || []).slice(0, 8)) {
      recentActivity.push({
        id: `${lead.id}-lead`,
        type: 'lead',
        title: lead.full_name,
        detail: lead.interested_in || 'New patient submission',
        timestamp: lead.created_at,
      });

      const leadJobs = (jobs || []).filter((job) => job.lead_id === lead.id);
      for (const job of leadJobs.slice(0, 2)) {
        recentActivity.push({
          id: job.id,
          type: job.type === 'smile_video' ? 'video' : 'preview',
          title: lead.full_name,
          detail: job.type === 'smile_video' ? 'Video generated' : 'Preview generated',
          timestamp: job.updated_at || job.created_at,
        });
      }
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalPatients = (leads || []).length;
    const assessments = previewLeadIds.size;
    const consultations = videoLeadIds.size;
    const conversion = totalPatients > 0 ? Math.round((consultations / totalPatients) * 100) : 0;
    const thisMonthCount = (leads || []).filter((lead) => lead.created_at >= monthStart).length;

    return json(200, {
      success: true,
      metrics: {
        totalPatients,
        assessments,
        consultations,
        conversion,
        thisMonthCount,
      },
      recentActivity: recentActivity.slice(0, 8),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return json(500, { success: false, error: 'Failed to load dashboard.' });
  }
}
