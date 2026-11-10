import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MapPin,
  Navigation,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Compass,
  AlertCircle,
  Clock,
  CheckCircle,
  WifiOff,
  ExternalLink,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

// ── Types ─────────────────────────────────────────────────────────────────────
type TrackingStatus =
  | 'loading'
  | 'awaiting_payment'
  | 'tracking_not_started'
  | 'provider_sharing'
  | 'provider_offline'
  | 'provider_location'
  | 'gps_denied'
  | 'error';

interface LocationData {
  status: TrackingStatus;
  serviceMode?: string;
  isLiveTrackingActive?: boolean;
  providerLat?: number;
  providerLng?: number;
  providerHeading?: number;
  providerSpeed?: number;
  customerLat?: number;
  customerLng?: number;
  customerAddress?: string;
  distanceKm?: number | null;
  etaMinutes?: number | null;
  providerName?: string;
  serviceTitle?: string;
  bookingStatus?: string;
  providerAddress?: string;
  directionsUrl?: string;
  advanceAmount?: number;
  message?: string;
  error?: string;
}

// Extend Window to include Leaflet (loaded as npm package via import or CDN fallback)
declare global {
  interface Window { L: any; }
}

// ── Haversine distance (km) — real calculation, no faking ────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

function etaMinutes(distKm: number, speedKmh = 25): number {
  if (distKm <= 0.05) return 1;
  return Math.max(1, Math.round((distKm / speedKmh) * 60));
}

// ── Component ─────────────────────────────────────────────────────────────────
export const TrackingMapModal: React.FC<{
  isOpen: boolean;
  trackingTitle: string;
  partnerName: string;
  partnerType: 'technician' | 'delivery';
  bookingId?: string;
  onClose: () => void;
  onOpenChat: (name: string) => void;
}> = ({ isOpen, trackingTitle, partnerName, partnerType, bookingId, onClose, onOpenChat }) => {
  const { showToast } = useApp();

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const providerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [leafletReady, setLeafletReady] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({ status: 'loading' });
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Load Leaflet as npm package or fallback CDN ───────────────────────────
  useEffect(() => {
    // Try the npm-bundled version first (available if `leaflet` is installed)
    const tryBundled = async () => {
      try {
        const L = (await import('leaflet')).default;
        // Also import CSS (best-effort — Vite handles .css imports at build time)
        try { await import(/* @vite-ignore */ 'leaflet/dist/leaflet.css' as string); } catch { /* ignore */ }
        window.L = L;
        setLeafletReady(true);
        return true;
      } catch {
        return false;
      }
    };

    tryBundled().then((ok) => {
      if (!ok) {
        // CDN fallback for web builds where npm leaflet isn't bundled
        if (window.L) { setLeafletReady(true); return; }
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => { setLeafletReady(true); };
        script.onerror = () => { console.warn('Leaflet CDN also failed — map will show text fallback.'); };
        document.head.appendChild(script);
      }
    });
  }, []);

  // ── Fetch real tracking state from server ─────────────────────────────────
  const fetchTracking = useCallback(async () => {
    if (!bookingId) {
      // No booking ID: show generic tracking not started state
      setLocationData({ status: 'tracking_not_started', message: 'No booking linked to this tracking session.' });
      return;
    }
    setIsRefreshing(true);
    const data = await api.getBookingLocation(bookingId);
    setIsRefreshing(false);
    if (!data) {
      setLocationData({ status: 'error', error: 'Could not reach NSO server. Check your connection.' });
      return;
    }
    setLocationData(data as LocationData);
    setLastFetched(new Date());
  }, [bookingId]);

  // ── Auto-poll every 5 s while modal is open and provider is sharing ────────
  useEffect(() => {
    if (!isOpen) return;
    fetchTracking();
    pollRef.current = setInterval(fetchTracking, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, fetchTracking]);

  // ── Build / update Leaflet map ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !leafletReady || !mapDivRef.current) return;
    if (locationData.status !== 'provider_sharing' && locationData.status !== 'provider_offline') return;

    const L = window.L;
    const { providerLat, providerLng, customerLat, customerLng } = locationData;
    if (!providerLat || !providerLng || !customerLat || !customerLng) return;

    // Fix default icon path issue in some bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

    const customerIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:18px;height:18px;border-radius:50%;
        background:#2563EB;border:3px solid #fff;
        box-shadow:0 0 0 6px rgba(37,99,235,0.25);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const isStale = locationData.status === 'provider_offline';
    const providerIcon = L.divIcon({
      className: '',
      html: `<div style="
        background:${isStale ? '#94a3b8' : '#16a34a'};width:30px;height:30px;border-radius:50%;
        border:3px solid #fff;display:flex;align-items:center;
        justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);
        font-size:16px;line-height:30px;text-align:center;
      ">${partnerType === 'delivery' ? '🛵' : '🧑‍🔧'}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapDivRef.current, {
        center: [providerLat, providerLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      customerMarkerRef.current = L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map).bindPopup('📍 Your Service Location');
      providerMarkerRef.current = L.marker([providerLat, providerLng], { icon: providerIcon })
        .addTo(map).bindPopup(`${partnerType === 'delivery' ? '🛵' : '🧑‍🔧'} ${partnerName}`);
      routeLineRef.current = L.polyline(
        [[providerLat, providerLng], [customerLat, customerLng]],
        { color: '#DC2626', weight: 3, opacity: 0.8, dashArray: '8 6' }
      ).addTo(map);
      map.fitBounds([[customerLat, customerLng], [providerLat, providerLng]], { padding: [50, 50] });
      mapInstanceRef.current = map;
    } else {
      // Update provider marker only
      providerMarkerRef.current?.setLatLng([providerLat, providerLng]);
      routeLineRef.current?.setLatLngs([[providerLat, providerLng], [customerLat, customerLng]]);
    }
  }, [isOpen, leafletReady, locationData, partnerName, partnerType]);

  // ── Destroy map on close ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      customerMarkerRef.current = null;
      providerMarkerRef.current = null;
      routeLineRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Status-specific UI helpers ────────────────────────────────────────────
  const renderStatusBanner = () => {
    switch (locationData.status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Compass className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-600">Fetching live tracking status…</p>
          </div>
        );

      case 'awaiting_payment':
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-4 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Advance Payment Required</p>
              <p className="text-xs text-slate-500 mt-1">
                Complete the advance payment to unlock live GPS tracking.
                {locationData.advanceAmount ? ` ₹${locationData.advanceAmount.toLocaleString()} required.` : ''}
              </p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md active:scale-95"
              onClick={() => showToast('Go to Orders → Pay Advance to unlock tracking.')}
            >
              How to Pay Advance
            </button>
          </div>
        );

      case 'tracking_not_started':
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Clock className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Specialist Not En Route Yet</p>
              <p className="text-xs text-slate-500 mt-1">
                {locationData.message || 'Your specialist will start sharing their live location when they begin travelling to you. Check back soon.'}
              </p>
            </div>
            <button onClick={fetchTracking} className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Status
            </button>
          </div>
        );

      case 'provider_location':
        return (
          <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">Service at Provider's Hub</p>
              <p className="text-xs text-slate-600 mt-1 font-semibold">{locationData.providerAddress}</p>
              <p className="text-xs text-slate-400 mt-0.5">Head to this location for your appointment.</p>
            </div>
            {locationData.directionsUrl && (
              <a
                href={locationData.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="font-black text-slate-900 text-sm">Connection Error</p>
            <p className="text-xs text-slate-500">{locationData.error || 'Could not load tracking data.'}</p>
            <button onClick={fetchTracking} className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        );

      default:
        return null; // Map is rendered for provider_sharing / provider_offline
    }
  };

  const isMapVisible = locationData.status === 'provider_sharing' || locationData.status === 'provider_offline';
  const isStale = locationData.status === 'provider_offline';

  // Real distance / ETA from server or computed locally
  const distKm = locationData.distanceKm != null ? locationData.distanceKm :
    (locationData.providerLat && locationData.providerLng && locationData.customerLat && locationData.customerLng
      ? haversineKm(locationData.providerLat, locationData.providerLng, locationData.customerLat, locationData.customerLng)
      : null);
  const etaMins = locationData.etaMinutes != null ? locationData.etaMinutes :
    (distKm != null ? etaMinutes(distKm, locationData.providerSpeed && locationData.providerSpeed > 2 ? locationData.providerSpeed * 3.6 : 25) : null);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 h-[88vh] flex flex-col">

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isMapVisible && !isStale ? 'bg-emerald-500 animate-pulse' : isStale ? 'bg-amber-400' : 'bg-slate-300'}`} />
              <h4 className="font-black text-sm text-slate-900">{trackingTitle}</h4>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              {isMapVisible && !isStale ? '● Live GPS Signal' :
               isStale ? '⚠ Signal Paused — Last Known Position' :
               'Service Tracking'}
              {lastFetched && (
                <span className="ml-2 text-slate-400">· Updated {lastFetched.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTracking} className={`p-1.5 rounded-full hover:bg-slate-100 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Map / Status Area ─────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-slate-50 overflow-hidden">
          {/* Leaflet map (only rendered for live tracking states) */}
          <div
            ref={mapDivRef}
            className="w-full h-full"
            style={{ display: isMapVisible ? 'block' : 'none', minHeight: 300 }}
          />

          {/* Non-map status panels */}
          {!isMapVisible && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {renderStatusBanner()}
            </div>
          )}

          {/* ETA HUD — shown only when genuinely tracking */}
          {isMapVisible && distKm != null && (
            <div className="absolute top-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between pointer-events-none z-[1000]">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${isStale ? 'bg-amber-500/20 border-amber-500/40' : 'bg-emerald-500/20 border-emerald-500/40'} border flex items-center justify-center`}>
                  {isStale ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {isStale ? 'Signal Lost' : 'Live ETA'}
                  </span>
                  <span className="text-base font-black text-white">
                    {isStale ? 'Signal paused' : `${etaMins} min`}
                    <span className="text-xs font-semibold text-emerald-400 ml-1">({distKm} km away)</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Speed</span>
                <span className="font-mono font-black text-sky-300 text-sm">
                  {locationData.providerSpeed ? `${(locationData.providerSpeed * 3.6).toFixed(0)} km/h` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Stale signal banner */}
          {isStale && (
            <div className="absolute bottom-3 left-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl flex items-center gap-2 z-[1000] shadow-lg">
              <WifiOff className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-xs font-black">Provider Signal Paused</p>
                <p className="text-[10px] opacity-80">Location update stopped &gt;90 s ago. Provider may be offline.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Partner Card ───────────────────────────────────────────── */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-200">
                {partnerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">{partnerName}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {partnerType === 'technician' ? 'NSO Verified Specialist' : 'NSO Express Delivery'}
                </p>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Background Verified
                </span>
              </div>
            </div>
            {locationData.status === 'provider_sharing' && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700">LIVE</span>
              </div>
            )}
            {locationData.bookingStatus === 'completed' && (
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-black text-blue-700">Done</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenChat(partnerName)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>In-App Chat</span>
            </button>
            <a
              href="tel:"
              onClick={(e) => { e.preventDefault(); showToast(`To call ${partnerName} directly, use the phone number on your booking confirmation.`); }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
