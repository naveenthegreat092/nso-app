import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Play,
  ShoppingBag,
  Store,
  Wrench,
  Bot,
  Sparkles,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export const JourneyNavigator: React.FC<{
  currentSection: string;
  onSelectSection: (section: string) => void;
  onRestartOnboarding: () => void;
}> = ({ currentSection, onSelectSection, onRestartOnboarding }) => {
  const { user } = useApp();

  const allJourneys = [
    { id: 'onboarding', label: '1. Onboarding & Splash', icon: Play, color: 'text-rose-400' },
    { id: 'customer_home', label: '4. Customer Shopping', icon: ShoppingBag, color: 'text-blue-400' },
    { id: 'services', label: '4. Book Services', icon: Wrench, color: 'text-amber-400' },
    { id: 'ai', label: '7. NSO AI Assistant', icon: Bot, color: 'text-red-400' },
    { id: 'special_request', label: '8. Special Request (Admin)', icon: Sparkles, color: 'text-yellow-400' },
    { id: 'seller', label: '5. Seller Journey', icon: Store, color: 'text-emerald-400' },
    { id: 'provider', label: '6. Provider Hub', icon: Wrench, color: 'text-orange-400' },
    { id: 'admin', label: 'Admin Center (Superadmin)', icon: ShieldAlert, color: 'text-purple-400' }
  ];

  return (
    <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl px-3.5 py-2.5 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-200">
          <Compass className="w-3.5 h-3.5 text-red-500 animate-spin-slow" />
          <span>DIRECT SCREEN JUMPER (Click to switch view):</span>
        </div>
        <button
          onClick={onRestartOnboarding}
          className="text-[10px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 underline transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset / Restart Splash
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {allJourneys.map((j) => {
          const Icon = j.icon;
          const isActive = currentSection === j.id;
          return (
            <button
              key={j.id}
              onClick={() => onSelectSection(j.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-white/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-white' : j.color}`} />
              <span>{j.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
