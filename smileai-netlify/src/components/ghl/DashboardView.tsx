import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, Calendar, Sparkles, Inbox, Loader2, AlertCircle, Clock3, RefreshCw, FileText, Video } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { MetricCard } from './shared/MetricCard';
import { Button } from '../ui/button';

interface DashboardViewProps {
  clinicBranding: ClinicBranding;
}

interface DashboardMetrics {
  totalPatients: number;
  assessments: number;
  consultations: number;
  conversion: number;
  thisMonthCount: number;
}

interface DashboardActivity {
  id: string;
  type: 'lead' | 'preview' | 'video';
  title: string;
  detail: string;
  timestamp: string;
}

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value || 'Unknown';
  }
}

function getActivityIcon(type: DashboardActivity['type']) {
  if (type === 'preview') return Sparkles;
  if (type === 'video') return Video;
  return FileText;
}

export function DashboardView({ clinicBranding }: DashboardViewProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPatients: 0,
    assessments: 0,
    consultations: 0,
    conversion: 0,
    thisMonthCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function fetchDashboard() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to load dashboard.');
      setMetrics(data.metrics || {});
      setRecentActivity(data.recentActivity || []);
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (error: any) {
      setLoadError(error.message || 'Failed to load dashboard.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const hasActivity = recentActivity.length > 0;
  const metricValues = useMemo(() => [
    {
      title: 'Total Patients',
      value: String(metrics.totalPatients || 0),
      change: `${metrics.thisMonthCount || 0} this month`,
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Assessments',
      value: String(metrics.assessments || 0),
      change: metrics.totalPatients ? `${Math.round(((metrics.assessments || 0) / metrics.totalPatients) * 100)}% capture` : '0% capture',
      trend: 'up' as const,
      icon: Sparkles,
    },
    {
      title: 'Videos',
      value: String(metrics.consultations || 0),
      change: metrics.assessments ? `${Math.round(((metrics.consultations || 0) / metrics.assessments) * 100)}% from previews` : '0% from previews',
      trend: 'up' as const,
      icon: Calendar,
    },
    {
      title: 'Conversion',
      value: `${metrics.conversion || 0}%`,
      change: metrics.consultations ? `${metrics.consultations} completed` : 'No completed videos yet',
      trend: 'up' as const,
      icon: TrendingUp,
    },
  ], [metrics]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your practice overview at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-400">
              Last updated: {formatTimestamp(lastUpdated)}
            </div>
          )}
          <Button variant="outline" onClick={fetchDashboard} className="h-10 border-slate-200 text-slate-600 hover:bg-slate-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Dashboard unavailable</h3>
            <p className="mt-1 text-sm text-slate-500">{loadError}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricValues.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                primaryColor={clinicBranding.primaryColor}
              />
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: clinicBranding.primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Loading dashboard activity</h3>
                <p className="mt-1 text-sm text-slate-500">Pulling your latest submissions and generated media.</p>
              </div>
            </div>
          ) : !hasActivity ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mx-auto max-w-md text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${clinicBranding.primaryColor}14` }}
                >
                  <Inbox className="h-6 w-6" style={{ color: clinicBranding.primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">No dashboard activity yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Patient submissions and generated assets will appear here as soon as the workspace receives activity.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 px-5 py-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${clinicBranding.primaryColor}14` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: clinicBranding.primaryColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-400">{formatTimestamp(activity.timestamp)}</p>
                        </div>
                        <p className="text-sm text-slate-500">{activity.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
