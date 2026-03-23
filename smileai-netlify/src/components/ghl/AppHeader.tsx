import React from 'react';
import { Sparkles, Bell, HelpCircle, User, LogOut, ChevronDown } from 'lucide-react';
import { ClinicBranding } from '../../App';

interface AppHeaderProps {
  clinicBranding: ClinicBranding;
  onLogout?: () => void;
}

export function AppHeader({ clinicBranding, onLogout }: AppHeaderProps) {
  const primaryColor = clinicBranding.primaryColor || '#0891b2';
  const accentColor = clinicBranding.accentColor || '#06b6d4';

  const handleLogout = () => {
    sessionStorage.removeItem('smileai_admin_authenticated');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* App Branding */}
        <div className="flex items-center gap-3">
          {clinicBranding.logo ? (
            <img
              src={clinicBranding.logo}
              alt={clinicBranding.clinicName}
              className="w-9 h-9 rounded-lg object-contain bg-white p-1 shadow-sm border border-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${accentColor})` }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold text-slate-900 leading-tight">{clinicBranding.clinicName || 'SmileVisionPro'}</h1>
            <p className="text-xs text-slate-500 leading-tight">AI Dental Suite</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Help Center"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-white"></span>
          </button>
          
          {/* User Menu */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
            <button className="flex items-center gap-2 py-1.5 px-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${accentColor})` }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
            <button 
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
