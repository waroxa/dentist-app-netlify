import React from 'react';
import { TrendingUp, Users, Calendar, Sparkles, Inbox } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { MetricCard } from './shared/MetricCard';

interface DashboardViewProps {
  clinicBranding: ClinicBranding;
}

export function DashboardView({ clinicBranding }: DashboardViewProps) {
  const recentPatients: any[] = [];
  const hasActivity = recentPatients.length > 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your practice overview at a glance</p>
        </div>
        <div className="text-xs text-slate-400">
          Last updated: Just now
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value="0"
          change="+0%"
          trend="up"
          icon={Users}
          primaryColor={clinicBranding.primaryColor}
        />
        <MetricCard
          title="Assessments"
          value="0"
          change="+0%"
          trend="up"
          icon={Sparkles}
          primaryColor={clinicBranding.primaryColor}
        />
        <MetricCard
          title="Consultations"
          value="0"
          change="+0%"
          trend="up"
          icon={Calendar}
          primaryColor={clinicBranding.primaryColor}
        />
        <MetricCard
          title="Conversion"
          value="0%"
          change="+0%"
          trend="up"
          icon={TrendingUp}
          primaryColor={clinicBranding.primaryColor}
        />
      </div>

      {!hasActivity && (
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
              Patient submissions, assessments, and conversion data will appear here once the workspace starts receiving activity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
