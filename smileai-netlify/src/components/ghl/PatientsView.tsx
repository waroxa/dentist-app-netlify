import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PatientCard } from './shared/PatientCard';
import { AddPatientModal } from './AddPatientModal';

interface PatientsViewProps {
  clinicBranding: ClinicBranding;
  onViewContact?: (contactId: string) => void;
}

interface PatientRecord {
  id: string;
  crmContactId?: string | null;
  name: string;
  email: string;
  phone: string;
  interestedIn?: string;
  source?: string;
  createdAt: string;
  lastVisit: string;
  status: string;
  assessmentCompleted: boolean;
  consultationScheduled: boolean;
  avatar: string | null;
}

function formatSubmittedAt(value: string) {
  try {
    return `Submitted ${new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } catch {
    return 'Recently submitted';
  }
}

export function PatientsView({ clinicBranding, onViewContact }: PatientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  async function fetchPatients() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch('/api/admin/patients', { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to load patients.');
      setPatients(data.patients || []);
    } catch (error: any) {
      setLoadError(error.message || 'Failed to load patients.');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = !searchQuery ||
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery);

      const matchesStatus = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, filterStatus]);

  const hasPatients = patients.length > 0;
  const hasFilteredResults = filteredPatients.length > 0;
  const emptyTitle = hasPatients ? 'No matching patients' : 'No patients yet';
  const emptyBody = hasPatients
    ? 'Try a different search or switch tabs to see more patient records.'
    : 'New landing page submissions will appear here automatically once they are saved.';

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Patients</h2>
          <p className="text-sm text-slate-500">Manage your patient database and interactions</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={fetchPatients}
            className="h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 px-5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: clinicBranding.primaryColor }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-slate-200 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {['all', 'active', 'pending', 'completed'].map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={isActive ? { backgroundColor: clinicBranding.primaryColor } : undefined}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">We could not load patients</h3>
            <p className="mt-1 text-sm text-slate-500">{loadError}</p>
            <Button onClick={fetchPatients} className="mt-5 text-white" style={{ backgroundColor: clinicBranding.primaryColor }}>
              Try Again
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: clinicBranding.primaryColor }} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Loading patients...</h3>
            <p className="mt-1 text-sm text-slate-500">Pulling the latest submissions and generated media.</p>
          </div>
        </div>
      ) : !hasFilteredResults ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 shadow-sm">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{emptyBody}</p>
            {!hasPatients && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 h-11 px-5 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: clinicBranding.primaryColor }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Patient
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={{
                  ...patient,
                  lastVisit: formatSubmittedAt(patient.lastVisit),
                }}
                primaryColor={clinicBranding.primaryColor}
                onViewContact={onViewContact}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredPatients.length}</span> of <span className="font-semibold text-slate-700">{patients.length}</span> patients
            </p>
            <p className="text-xs text-slate-400">
              Leads sync into this list from the public form, then their preview and video URLs attach as assets are generated.
            </p>
          </div>
        </>
      )}

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={fetchPatients}
        primaryColor={clinicBranding.primaryColor}
      />
    </div>
  );
}
