import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProviderDetail, Service } from '../../types';
import {
  X,
  MapPin,
  Navigation,
  Star,
  ShieldCheck,
  Clock,
  PhoneCall,
  MessageSquare,
  ChevronRight,
  Zap,
  Compass
} from 'lucide-react';

export const ProviderMapDiscoveryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (s: Service) => void;
}> = ({ isOpen, onClose, onSelectService }) => {
  const { providers, services, openProviderProfile, openChat, showToast } = useApp();

  const mapLocations = [
    { providerId: 'prov_1', name: 'Kiran Electricals', x: '52%', y: '42%', area: 'Indiranagar 100ft Rd', dist: '1.2 km', eta: '14 mins', category: 'Electrical' },
    { providerId: 'prov_2', name: 'UrbanCare Pros', x: '35%', y: '58%', area: 'Koramangala 4th Block', dist: '2.4 km', eta: '22 mins', category: 'Cleaning' },
    { providerId: 'prov_3', name: 'QuickFix Plumbing', x: '68%', y: '32%', area: 'Old Airport Road', dist: '3.1 km', eta: '28 mins', category: 'Plumbing' },
    { providerId: 'prov_4', name: 'Elite Salon At Home', x: '45%', y: '72%', area: 'HSR Layout Sector 1', dist: '4.5 km', eta: '35 mins', category: 'Personal Care' }
  ];

  const [selectedLoc, setSelectedLoc] = useState(mapLocations[0]);

  if (!isOpen) return null;

  const currentProvider = providers.find((p) => p.id === selectedLoc.providerId) || providers[0];
  const matchingService = services.find((s) => s.providerId === selectedLoc.providerId) || services[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 h-[92vh] max-h-[850px] flex flex-col">
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-150 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Live Specialist Radius</h3>
              <p className="text-[10px] text-slate-500 font-medium">Verified specialists near your delivery address</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Simulated Map */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden select-none">
          {/* Map Grid Roads Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Road Lines */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="3">
            <line x1="0%" y1="40%" x2="100%" y2="40%" />
            <line x1="0%" y1="65%" x2="100%" y2="65%" />
            <line x1="50%" y1="0%" x2="50%" y2="100%" />
            <line x1="30%" y1="0%" x2="70%" y2="100%" />
          </svg>

          {/* Radar Ring Animation */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-red-500/20 animate-ping duration-1000" />
            <div className="w-96 h-96 rounded-full border border-red-500/10" />
          </div>

          {/* User Location Center Pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-500/30 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-[9px] font-black text-white bg-slate-900/90 px-2 py-0.5 rounded-full mt-1 border border-white/20 whitespace-nowrap shadow-md">
              You (Indiranagar)
            </span>
          </div>

          {/* Specialist Map Pins */}
          {mapLocations.map((loc) => {
            const isSelected = selectedLoc.providerId === loc.providerId;
            return (
              <div
                key={loc.providerId}
                onClick={() => setSelectedLoc(loc)}
                style={{ left: loc.x, top: loc.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
              >
                <div
                  className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-2xl transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white scale-110 ring-4 ring-amber-400/40 shadow-amber-500/50'
                      : 'bg-white text-slate-900 hover:scale-105'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                  <div className="leading-tight">
                    <p className="text-[10px] font-black truncate max-w-[90px]">{loc.name}</p>
                    <p className={`text-[8px] font-bold ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {loc.dist} • {loc.eta}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Provider Card */}
        <div className="p-4 bg-white border-t border-slate-150 space-y-3 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  {selectedLoc.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
                </span>
              </div>
              <h4 className="font-black text-sm text-slate-900">{selectedLoc.name}</h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Navigation className="w-3 h-3 text-red-600" />
                <span>{selectedLoc.area} ({selectedLoc.dist} away)</span>
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-0.5 text-amber-600 font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentProvider.rating}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {currentProvider.jobsCompleted} completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                openProviderProfile(currentProvider.id);
              }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Full Profile & Reviews
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectService(matchingService);
              }}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Book Slot (₹{matchingService.price})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
