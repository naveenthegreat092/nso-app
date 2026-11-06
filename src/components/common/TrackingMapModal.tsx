import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Navigation,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Extend Window to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export const TrackingMapModal: React.FC<{
  isOpen: boolean;
  trackingTitle: string;
  partnerName: string;
  partnerType: 'technician' | 'delivery';
  onClose: () => void;
  onOpenChat: (name: string) => void;
}> = ({ isOpen, trackingTitle, partnerName, partnerType, onClose, onOpenChat }) => {
  const { showToast } = useApp();

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const partnerMarkerRef = useRef<any>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'denied'>('acquiring');
  const [eta, setEta] = useState(12);
  const [distance, setDistance] = useState(1.8);
  const [leafletReady, setLeafletReady] = useState(false);

  // ── Load Leaflet from CDN once ──────────────────────────────────────────────
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    script.onerror = () => {
      console.warn('Leaflet CDN failed — offline mode');
      setLeafletReady(false);
    };
    document.head.appendChild(script);
  }, []);

  // ── Acquire real GPS from device ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (!('geolocation' in navigator)) {
      setGpsStatus('denied');
      setUserCoords({ lat: 12.9716, lng: 77.5946 }); // Bangalore fallback
      return;
    }

    setGpsStatus('acquiring');

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('locked');
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setUserCoords({ lat: 12.9716, lng: 77.5946 });
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOpen]);

  // ── Countdown ETA ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => parseFloat(Math.max(prev - 0.05, 0.1).toFixed(2)));
    }, 10000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // ── Build / update Leaflet map when coords + library are ready ───────────────
  useEffect(() => {
    if (!isOpen || !leafletReady || !mapDivRef.current || !userCoords) return;

    const L = window.L;
    const { lat, lng } = userCoords;

    // Partner starts ~1 km north of user
    const partnerLat = lat + 0.009;
    const partnerLng = lng + 0.004;

    if (!mapInstanceRef.current) {
      // Create the map
      const map = L.map(mapDivRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // User marker (blue pulsing)
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#2563EB;border:3px solid #fff;
          box-shadow:0 0 0 4px rgba(37,99,235,0.35);
          animation:nso-pulse 1.5s ease-in-out infinite;
        "></div>
        <style>
          @keyframes nso-pulse {
            0%,100%{box-shadow:0 0 0 4px rgba(37,99,235,0.35)}
            50%{box-shadow:0 0 0 8px rgba(37,99,235,0.1)}
          }
        </style>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      // Partner marker (green)
      const partnerIcon = L.divIcon({
        className: '',
        html: `<div style="
          background:#16a34a;width:28px;height:28px;border-radius:50%;
          border:3px solid #fff;display:flex;align-items:center;
          justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          font-size:14px;line-height:28px;text-align:center;
        ">🚗</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('📍 Your Location');

      partnerMarkerRef.current = L.marker([partnerLat, partnerLng], { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`🚗 ${partnerName}`);

      // Draw route line
      L.polyline([[lat, lng], [partnerLat, partnerLng]], {
        color: '#DC2626',
        weight: 3,
        opacity: 0.8,
        dashArray: '8 6',
      }).addTo(map);

      map.fitBounds([[lat, lng], [partnerLat, partnerLng]], { padding: [40, 40] });

      mapInstanceRef.current = map;
    } else {
      // Update user marker position
      userMarkerRef.current?.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [isOpen, leafletReady, userCoords, partnerName]);

  // ── Destroy map on close ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      partnerMarkerRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lat = userCoords?.lat || 12.9716;
  const lng = userCoords?.lng || 77.5946;

  const handleCall = () => {
    showToast(`Connecting direct call to ${partnerName}...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 h-[88vh] flex flex-col">

        {/* Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-black text-sm text-slate-900">{trackingTitle}</h4>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-0.5">
              <Compass className="w-3 h-3 text-emerald-600 animate-spin" />
              <span>
                {gpsStatus === 'locked'
                  ? `Live GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
                  : gpsStatus === 'acquiring'
                  ? 'Acquiring GPS satellite...'
                  : 'GPS Fallback (Bengaluru)'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden">
          {/* Leaflet map container */}
          <div ref={mapDivRef} className="w-full h-full" style={{ minHeight: 300 }} />

          {!leafletReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 gap-3">
              <MapPin className="w-10 h-10 text-red-500 animate-bounce" />
              <p className="text-xs font-bold text-slate-600">Loading live map…</p>
              <p className="text-[10px] text-slate-400">Make sure you are connected to the internet</p>
            </div>
          )}

          {/* ETA HUD */}
          <div className="absolute top-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between pointer-events-none z-[1000]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Navigation className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Live ETA</span>
                <span className="text-base font-black text-white">
                  {eta} Mins <span className="text-xs font-semibold text-emerald-400">({distance} km away)</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Security OTP</span>
              <span className="font-mono font-black text-amber-300 text-sm bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
                5829
              </span>
            </div>
          </div>

          {/* User position badge */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-800 pointer-events-none z-[1000]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            <span>Your Live Position</span>
          </div>
        </div>

        {/* Bottom Partner Card */}
        <div className="p-4 bg-white border-t border-slate-150 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-200">
                {partnerName.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">{partnerName}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {partnerType === 'technician' ? 'Verified Field Specialist • 4.9★' : 'NSO Express Delivery • 4.8★'}
                </p>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Police Verified & Background Checked
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Transit Unit</span>
              <span className="text-xs font-mono font-black text-slate-900">KA-05-EX-4190</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onOpenChat(partnerName)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>In-App Chat</span>
            </button>
            <button
              onClick={handleCall}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Direct Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
