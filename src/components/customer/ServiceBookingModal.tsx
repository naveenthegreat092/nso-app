import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import {
  X,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  Home,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  MessageSquare,
  PhoneCall
} from 'lucide-react';

export const ServiceBookingModal: React.FC<{
  service: Service;
  onClose: () => void;
}> = ({ service, onClose }) => {
  const { createBooking, bookings, user, addresses, providers, openProviderProfile, openChat, openMaskedCall, showToast } = useApp();

  // ── Dynamic date generation (always today, tomorrow, day after) ───────────
  const dynamicDates = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return [0, 1, 2].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const iso = d.toISOString().substring(0, 10);
      const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : days[d.getDay()];
      return { iso, label };
    });
  })();

  const [selectedDate, setSelectedDate] = useState(() => dynamicDates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState(service.availableSlots[0]);
  const [serviceMode, setServiceMode] = useState<'home_visit' | 'provider_location'>('home_visit');
  const [address, setAddress] = useState(
    user.address || (addresses[0]?.fullAddress) || 'Flat 402, Orbit Towers, Indiranagar, Bengaluru - 560038'
  );
  const [gpsPinned, setGpsPinned] = useState<{ lat: number; lng: number } | null>(null);
  const [pinningGps, setPinningGps] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [hourlyLimit, setHourlyLimit] = useState(service.estimatedDurationHours || 2);
  const [isConfirmed, setIsConfirmed] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchingProvider = providers.find(
    (p) =>
      p.id === service.providerId ||
      (p as any).userId === service.providerId ||
      (p as any).issuedProviderId === service.providerId
  );
  const providerHubAddress =
    service.hubAddress ||
    (matchingProvider?.serviceArea
      ? `${matchingProvider.serviceArea} (NSO Partner Hub)`
      : 'NSO Partner Service Hub, Indiranagar, Bengaluru');

  // Check if slot has a conflict for this provider
  const isSlotBooked = (slot: string) =>
    bookings.some(
      (b) =>
        (b.providerId === service.providerId ||
          (b as any).provider_user_id === service.providerId ||
          b.providerId === service.issuedProviderId) &&
        b.date === selectedDate &&
        b.timeSlot === slot &&
        b.status !== 'cancelled'
    );

  const isConflict = isSlotBooked(selectedSlot);

  const handlePinLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('GPS not supported on device. Manual address will be used.');
      return;
    }
    setPinningGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsPinned({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPinningGps(false);
        showToast(
          `📍 Location pinned! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
        );
      },
      () => {
        setPinningGps(false);
        showToast('Could not fetch GPS. Please verify typed address.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      const finalAddress = serviceMode === 'provider_location' ? providerHubAddress : address;
      const booking = await createBooking(
        service.id,
        selectedDate,
        selectedSlot,
        serviceMode,
        finalAddress,
        problemDescription.trim() || undefined,
        undefined,
        service.pricingType === 'quotation_required' ? 'site_visit' : 'repair',
        undefined,
        service.pricingType === 'hourly' ? hourlyLimit : undefined
      );
      if (booking) {
        setIsConfirmed(booking);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-900">
              {isConfirmed ? 'Service Confirmed' : 'Book Verified Service'}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
              VERIFIED SPECIALIST
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isConfirmed ? (
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Service Slot Reserved!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <span className="font-mono font-black text-slate-900">{isConfirmed.bookingNumber}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Service:</span>
                <span className="font-black text-slate-900 truncate max-w-[200px]">{isConfirmed.serviceTitle}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Technician:</span>
                <span className="font-semibold text-slate-800">{isConfirmed.providerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date & Slot:</span>
                <span className="font-black text-red-600">{isConfirmed.date} ({isConfirmed.timeSlot})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Mode:</span>
                <span className="font-semibold text-slate-900 capitalize">{isConfirmed.serviceMode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Standard Inspection Fee:</span>
                <span className="font-black text-emerald-600 text-sm">₹{isConfirmed.totalPrice}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-left text-[11px] text-blue-900 space-y-1">
              <span className="font-black block">Scheduling Protection:</span>
              <p>Overlapping bookings for this provider are automatically locked during this time slot. No extra charges can be billed without an Admin-reviewed quote approved by you.</p>
            </div>

            {/* Quick Actions with Specialist */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openProviderProfile(isConfirmed.providerId)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-[10px]">View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => openMaskedCall(isConfirmed.providerName, undefined, isConfirmed.providerId)}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">Call (Masked)</span>
              </button>

              <button
                type="button"
                onClick={() => openChat(isConfirmed.providerName)}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">Chat Now</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-transform active:scale-98"
            >
              Done & View Bookings
            </button>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Service & Provider Header (Urban Company style) */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md tracking-wider">
                  {service.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin Background Verified
                </span>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-900">{service.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 flex-wrap">
                  <span className="font-bold text-slate-900">{service.providerName}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-black px-1.5 py-0.5 rounded">
                    ID: {service.issuedProviderId || service.providerId}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5 text-amber-600 font-extrabold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{service.providerRating}</span>
                  </div>
                  <span>({service.providerJobsCompleted} jobs)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    {service.pricingType === 'hourly' ? (
                      <>
                        <span className="text-xl font-black text-red-600">₹{service.hourlyRate || service.price}</span>
                        <span className="text-xs text-slate-500 font-bold">/ hour</span>
                      </>
                    ) : service.pricingType === 'quotation_required' ? (
                      <span className="text-base font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg">
                        Inspection &amp; Quotation
                      </span>
                    ) : service.pricingType === 'metered' ? (
                      <>
                        <span className="text-xl font-black text-red-600">₹{service.meteredRate || service.price}</span>
                        <span className="text-xs text-slate-500 font-bold">/ {service.unit}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-black text-red-600">₹{service.price}</span>
                        <span className="text-xs text-slate-500">/ {service.unit}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                    {service.pricingType || 'fixed'} billing
                  </span>
                </div>

                {service.pricingType === 'hourly' && (
                  <div className="mt-2.5 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-indigo-950 font-bold">
                      <span>Initial Approved Time Limit:</span>
                      <select
                        value={hourlyLimit}
                        onChange={(e) => setHourlyLimit(parseInt(e.target.value) || 2)}
                        className="bg-white border border-indigo-300 rounded-lg px-2 py-1 font-black text-indigo-700 outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                          <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''} (Max ₹{(service.hourlyRate || service.price) * h})</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-indigo-700 leading-snug">
                      Timer runs only while specialist works. Any extension requires your separate one-tap approval.
                    </p>
                  </div>
                )}

                {service.pricingType === 'quotation_required' && (
                  <div className="mt-2.5 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-950 space-y-1">
                    <p className="font-bold">Transparent On-Site Quotation:</p>
                    <p className="text-purple-800 leading-snug">
                      Specialist will inspect the job and submit a formal line-item quote (Labor + Materials) for your approval before starting work.
                    </p>
                  </div>
                )}
              </div>
            </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => openProviderProfile(service.providerId)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
                  >
                    <Star className="w-3 h-3 text-amber-500" />
                    Provider Profile
                  </button>
                  <button
                    onClick={() => openChat(service.providerName)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
                  >
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    Message
                  </button>
                </div>
                {/* Mode selection (Home visit vs Provider location) */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-800">Select Service Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceMode('home_visit')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-extrabold transition-all ${
                    serviceMode === 'home_visit'
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm ring-2 ring-red-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Doorstep Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceMode('provider_location')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-extrabold transition-all ${
                    serviceMode === 'provider_location'
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm ring-2 ring-red-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Provider Hub</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>Select Date</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {dynamicDates.map(({ iso, label }) => (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition-all ${
                      selectedDate === iso
                        ? 'border-red-600 bg-red-600 text-white shadow-md'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>Available Time Slots</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {service.availableSlots.map((slot) => {
                  const hasSlotConflict = bookings.some(
                    (b) =>
                      b.providerId === service.providerId &&
                      b.date === selectedDate &&
                      b.timeSlot === slot &&
                      b.status !== 'cancelled'
                  );
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={hasSlotConflict}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        hasSlotConflict
                          ? 'border-red-200 bg-red-50/50 text-red-400 cursor-not-allowed line-through'
                          : selectedSlot === slot
                          ? 'border-red-600 bg-red-50 text-red-600 font-black shadow-sm ring-2 ring-red-100'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                      {hasSlotConflict && (
                        <span className="block text-[9px] text-red-500 font-semibold no-underline">
                          Slot Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conflict Warning if selected slot has clash */}
            {isConflict && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>This slot has an overlapping booking for this provider. Please select another slot.</span>
              </div>
            )}

            {/* Describe Issue / Job Details */}
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-800">Job Description / Specifics (Optional)</span>
              <textarea
                rows={2}
                placeholder="e.g. Copper pipe leak under kitchen sink, switchboard sparking, deep clean 2 BHK..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Address / Location Mode View */}
            {serviceMode === 'home_visit' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Doorstep Visit Address</span>
                  <button
                    type="button"
                    onClick={handlePinLocation}
                    disabled={pinningGps}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-full active:scale-95 transition-all"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{pinningGps ? 'Locating…' : gpsPinned ? '✓ GPS Pinned' : 'Pin My Location'}</span>
                  </button>
                </div>

                {addresses.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setAddress(addr.fullAddress)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold whitespace-nowrap transition-all ${
                          address === addr.fullAddress
                            ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {addr.label || 'Home'}: {addr.title || 'Saved'}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete house no, building, street, landmark, pincode..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                {gpsPinned && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Exact Map Coordinates Pinned: {gpsPinned.lat.toFixed(4)}, {gpsPinned.lng.toFixed(4)}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Provider Hub Location</span>
                </span>
                <p className="text-xs text-slate-700 font-semibold">{providerHubAddress}</p>
                <p className="text-[10px] text-slate-500">
                  Please visit the specialist's authorized center at the scheduled appointment time.
                </p>
              </div>
            )}

            {/* Cancellation Terms */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-extrabold text-slate-800">Cancellation Policy:</span>
              <p>{service.cancellationPolicy}</p>
              <p className="text-slate-400 italic pt-1 border-t border-slate-200">
                Rule: If provider suggests extra on-site work, a revised quote must be approved by Admin & Customer first.
              </p>
            </div>
          </div>
        )}

        {/* Footer with Explicit Approval CTA */}
        {!isConfirmed && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              disabled={isConflict || isSubmitting}
              onClick={handleBook}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/25 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isSubmitting
                  ? 'Reserving Slot…'
                  : service.pricingType === 'quotation_required'
                  ? 'Book Free Inspection & Assessment'
                  : service.pricingType === 'hourly'
                  ? `Confirm Booking (${hourlyLimit} hrs cap: ₹${(service.hourlyRate || service.price) * hourlyLimit})`
                  : `Confirm & Book Slot for ₹${service.price}`}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
              Verified specialist arrives at your designated time slot.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
