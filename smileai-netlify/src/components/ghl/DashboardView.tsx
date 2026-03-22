import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, Sparkles, Activity } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { MetricCard } from './shared/MetricCard';
import { DataTable } from './shared/DataTable';
import { ChartCard } from './shared/ChartCard';
import { WelcomeBanner } from './WelcomeBanner';

interface DashboardViewProps {
  clinicBranding: ClinicBranding;
}

export function DashboardView({ clinicBranding }: DashboardViewProps) {
  const [showWelcome, setShowWelcome] = useState(true);

  const recentPatients: any[] = [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Banner */}
      {showWelcome && <WelcomeBanner onClose={() => setShowWelcome(false)} />}

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
          primaryColor="#0891b2"
        />
        <MetricCard
          title="Assessments"
          value="0"
          change="+0%"
          trend="up"
          icon={Sparkles}
          primaryColor="#0891b2"
        />
        <MetricCard
          title="Consultations"
          value="0"
          change="+0%"
          trend="up"
          icon={Calendar}
          primaryColor="#0891b2"
        />
        <MetricCard
          title="Conversion"
          value="0%"
          change="+0%"
          trend="up"
          icon={TrendingUp}
          primaryColor="#0891b2"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Patient Engagement"
          subtitle="Last 30 days"
          primaryColor="#0891b2"
        />
        <ChartCard
          title="Conversion Funnel"
          subtitle="This month"
          primaryColor="#06b6d4"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-6">Latest patient interactions and assessments</p>
        </div>
        {recentPatients.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No patient activity yet</p>
            <p className="text-xs text-slate-400 mt-1">Patient interactions will appear here</p>
          </div>
        ) : (
          <DataTable
            columns={['Patient', 'Service', 'Date', 'Status']}
            rows={recentPatients.map(patient => [
              patient.name,
              patient.service,
              patient.date,
              <span
                key={patient.name}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  patient.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : patient.status === 'Pending'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-cyan-50 text-cyan-700'
                }`}
              >
                {patient.status}
              </span>
            ])}
          />
        )}
      </div>
    </div>
  );
}
