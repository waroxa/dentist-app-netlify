import React from 'react';
import { Mail, Phone, Calendar, Eye, MessageSquare, MoreVertical, User, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../../ui/button';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: string;
  assessmentCompleted: boolean;
  consultationScheduled: boolean;
  avatar: string | null;
}

interface PatientCardProps {
  patient: Patient;
  primaryColor: string;
  onViewContact?: (contactId: string) => void;
}

export function PatientCard({ patient, primaryColor, onViewContact }: PatientCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{patient.name}</h4>
            <p className="text-xs text-slate-500">{patient.lastVisit}</p>
          </div>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{patient.phone}</span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
            patient.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700'
              : patient.status === 'Pending'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-cyan-50 text-cyan-700'
          }`}
        >
          {patient.status}
        </span>
        {patient.assessmentCompleted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700">
            <CheckCircle2 className="w-3 h-3" />
            Assessment
          </span>
        )}
        {patient.consultationScheduled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-700">
            <Clock className="w-3 h-3" />
            Consult
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <Button 
          size="sm" 
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8"
          onClick={() => onViewContact?.(patient.id)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-slate-200 text-slate-600 text-xs h-8">
          <MessageSquare className="w-3.5 h-3.5 mr-1" />
          Message
        </Button>
      </div>
    </div>
  );
}
