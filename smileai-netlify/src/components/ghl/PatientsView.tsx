import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { ClinicBranding } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PatientCard } from './shared/PatientCard';
import { AddPatientModal } from './AddPatientModal';

interface PatientsViewProps {
  clinicBranding: ClinicBranding;
  onViewContact?: (contactId: string) => void;
}

export function PatientsView({ clinicBranding, onViewContact }: PatientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch patients from the CRM on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const ghlApiKey = localStorage.getItem('ghl_api_key');
      const ghlLocationId = localStorage.getItem('ghl_location_id');

      if (!ghlApiKey || !ghlLocationId) {
        console.log('CRM credentials not configured');
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/?locationId=${ghlLocationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ghlApiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter contacts that have SmileVisionPro tag or were created via the app
        const smileVisionContacts = data.contacts?.filter((contact: any) => 
          contact.tags?.includes('SmileVisionPro') || 
          contact.source?.includes('SmileVisionPro')
        ) || [];
        setPatients(smileVisionContacts);
      } else {
        console.error('Failed to fetch contacts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientAdded = () => {
    // Refresh patient list
    fetchPatients();
  };

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.includes(searchQuery);
    
    // For now, show all in 'all' filter. You can add custom fields for status filtering
    const matchesStatus = filterStatus === 'all';
    
    return matchesSearch && matchesStatus;
  });

  const primaryTone = `${clinicBranding.primaryColor}14`;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Patients</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your patient database and interactions</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm w-full sm:w-auto text-sm h-10"
          style={{ backgroundColor: clinicBranding.primaryColor, color: '#ffffff' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-sm border-slate-200"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-sm h-10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-sm h-10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mt-4 pt-4 border-t border-slate-100">
          {['all', 'active', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'text-white'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
              style={filterStatus === status ? { backgroundColor: clinicBranding.primaryColor } : undefined}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: clinicBranding.primaryColor }} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Loading patients...</h3>
            <p className="text-xs text-slate-500">
              Please wait while we fetch your patient data
            </p>
          </div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No patients yet</h3>
            <p className="text-xs text-slate-500 mb-5">
              Patient submissions from your landing page will appear here
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="shadow-sm text-sm"
              style={{ backgroundColor: clinicBranding.primaryColor, color: '#ffffff' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Patient
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                primaryColor={clinicBranding.primaryColor}
                onViewContact={onViewContact}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{filteredPatients.length}</span> of <span className="font-medium text-slate-700">{patients.length}</span> patients
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-200 text-slate-600 text-sm h-9" disabled>
                Previous
              </Button>
              <Button 
                variant="outline" 
                className="text-sm h-9"
                style={{ borderColor: primaryTone, color: clinicBranding.primaryColor }}
                disabled
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
        primaryColor={clinicBranding.primaryColor}
      />
    </div>
  );
}
