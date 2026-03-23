import React from 'react';
import { LayoutDashboard, Users, Sparkles, Settings } from 'lucide-react';
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
                  ? 'shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              style={isActive ? { backgroundColor: `${primaryColor}14`, color: primaryColor } : undefined}
            >
              <Icon className="w-5 h-5" style={isActive ? { color: primaryColor } : undefined} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
