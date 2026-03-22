import React from 'react';
import { LayoutDashboard, Users, Sparkles, Settings, TrendingUp } from 'lucide-react';
import { ViewType } from '../../App';

interface AppNavigationProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  primaryColor: string;
}

export function AppNavigation({ activeView, onNavigate, primaryColor }: AppNavigationProps) {
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as ViewType, label: 'Patients', icon: Users },
    { id: 'smile-tool' as ViewType, label: 'Smile Tool', icon: Sparkles },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-60 bg-white border-r border-slate-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mx-3 mt-6 pt-6 border-t border-slate-200">
        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-bold text-slate-900">0</p>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">Total Patients</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-bold text-slate-900">0</p>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">This Month</p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="mx-3 mt-6 p-3 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-lg border border-cyan-100">
        <p className="text-xs font-medium text-cyan-800 mb-1">Pro Features</p>
        <p className="text-xs text-cyan-600 mb-2">Unlock advanced AI tools</p>
        <button className="w-full text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 py-1.5 rounded-md transition-colors">
          Upgrade
        </button>
      </div>
    </nav>
  );
}
