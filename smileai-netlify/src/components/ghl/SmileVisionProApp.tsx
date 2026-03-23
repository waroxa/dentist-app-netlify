import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, Sparkles, Settings } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { AppNavigation } from './AppNavigation';
import { DashboardView } from './DashboardView';
import { PatientsView } from './PatientsView';
import { SmileToolView } from './SmileToolView';
import { SettingsView } from './SettingsView';
import { ContactProfile } from './ContactProfile';
import { ViewType, ClinicBranding } from '../../App';

interface SmileVisionProAppProps {
  clinicBranding: ClinicBranding;
  onBrandingChange: (branding: ClinicBranding) => void;
  onLogout?: () => void;
}

export function SmileVisionProApp({ clinicBranding, onBrandingChange, onLogout }: SmileVisionProAppProps) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  const handleBackFromContact = () => {
    setSelectedContactId(null);
  };

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  // Contact profile view
  if (selectedContactId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader clinicBranding={clinicBranding} onLogout={onLogout} />
        <ContactProfile 
          contactId={selectedContactId}
          onBack={handleBackFromContact}
          primaryColor={clinicBranding.primaryColor}
        />
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView clinicBranding={clinicBranding} />;
      case 'patients':
        return <PatientsView clinicBranding={clinicBranding} onViewContact={handleViewContact} />;
      case 'smile-tool':
        return <SmileToolView clinicBranding={clinicBranding} />;
      case 'settings':
        return (
          <SettingsView
            clinicBranding={clinicBranding}
            onBrandingChange={onBrandingChange}
          />
        );
      default:
        return <DashboardView clinicBranding={clinicBranding} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader clinicBranding={clinicBranding} onLogout={onLogout} />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] bg-cyan-600 hover:bg-cyan-700 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppNavigation
            activeView={activeView}
            onNavigate={handleNavigate}
            primaryColor={clinicBranding.primaryColor}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-3">
                <div className="space-y-1">
                  {[
                    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'patients' as ViewType, label: 'Patients', icon: Users },
                    { id: 'smile-tool' as ViewType, label: 'Smile Tool', icon: Sparkles },
                    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                          isActive
                            ? 'bg-cyan-50 text-cyan-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : ''}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
