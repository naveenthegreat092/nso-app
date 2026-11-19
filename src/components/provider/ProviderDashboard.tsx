import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Plus,
  KeyRound,
  Image,
  UploadCloud,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Navigation,
  Radio,
  WifiOff,
  ExternalLink,
  Timer,
  Play,
  Pause,
  Layers,
  FileText,
  Tag,
  Trash2,
  Star,
  Key
} from 'lucide-react';
import { api } from '../../api/client';
import { Booking } from '../../types';

export const ProviderDashboard: React.FC = () => {
  const {
    bookings,
    updateBookingStatus,
    submitRevisedQuote,
    providers,
    addProviderPortfolioImage,
    deleteProviderPortfolioImage,
    user,
    showToast,
    submitJobQuotation,
    requestHourlyExtraTime,
    updateHourlyTimeUsed,
    markServiceComplete,
    cancelBooking,
    services,
    serviceCategories,
    addNewService,
    updateProviderRate,
    switchRole
  } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'schedule' | 'portfolio' | 'categories' | 'rates'>('jobs');

  // Revised quote modal state
  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('250');
  const [quoteReason, setQuoteReason] = useState('Additional internal pipeline copper pipe soldering required.');

  // Formal Job Quotation modal state
  const [selectedBookingForJobQuote, setSelectedBookingForJobQuote] = useState<string | null>(null);
  const [quoteProposedWork, setQuoteProposedWork] = useState('');
  const [quoteLaborCost, setQuoteLaborCost] = useState(800);
  const [quotePartsCost, setQuotePartsCost] = useState(400);
  const [quoteAdditionalFees, setQuoteAdditionalFees] = useState(100);
  const [quoteAssumptions, setQuoteAssumptions] = useState('Includes standard replacement parts and 30-day workmanship warranty.');
  const [quoteEstimatedDuration, setQuoteEstimatedDuration] = useState('3-4 Hours');
  const [quoteExpiryDate, setQuoteExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().substring(0, 10);
  });

  // Extra time request modal state
  const [selectedBookingForExtraTime, setSelectedBookingForExtraTime] = useState<string | null>(null);
  const [extraHours, setExtraHours] = useState(1);
  const [extraReason, setExtraReason] = useState('Complex wiring and concealed conduit pipe troubleshooting required.');

  // Structured Cancellation state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<string | null>(null);
  const [cancelStage, setCancelStage] = useState<'before_assignment' | 'after_assignment' | 'travelling' | 'work_started'>('after_assignment');
  const [cancelWorkCharge, setCancelWorkCharge] = useState(0);
  const [cancelMaterialCharge, setCancelMaterialCharge] = useState(0);
  const [cancelReason, setCancelReason] = useState('');

  // Rate update modal state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [ratePrice, setRatePrice] = useState(499);
  const [rateHourly, setRateHourly] = useState(350);
  const [ratePricingType, setRatePricingType] = useState<'fixed' | 'hourly' | 'metered' | 'quotation_required'>('fixed');
  const [rateUnit, setRateUnit] = useState('service');

  // Work media upload state (Requirement 5)
  const [workMediaServiceId, setWorkMediaServiceId] = useState<string | null>(null);
  const [workPhotoUrls, setWorkPhotoUrls] = useState('');
  const [workVideoUrls, setWorkVideoUrls] = useState('');
  const [uploadingWorkMedia, setUploadingWorkMedia] = useState(false);

  // Portfolio photo upload state
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoTag, setPhotoTag] = useState('Installation');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');

  // Provider Identity & Persisted Metrics
  const myProviderId =
    user.providerApplication?.issuedProviderId ||
    user.accountId ||
    providers.find((p) => (p as any).userId === user.id)?.id ||
    'NSO-PROV-8310';

  const currentProviderDetail =
    providers.find(
      (p) =>
        (p as any).userId === user.id ||
        p.id === myProviderId ||
        p.id === user.id ||
        (p as any).issuedProviderId === myProviderId
    ) || null;

  const currentProviderName =
    user.name ||
    currentProviderDetail?.applicantName ||
    currentProviderDetail?.name?.replace(/\s*\([^)]*\)/, '') ||
    'Service Specialist';

  const currentProviderTrade =
    user.providerApplication?.tradeCategory ||
    currentProviderDetail?.tradeCategory ||
    'Home Services';

  const providerBookings = bookings.filter(
    (b) =>
      b.providerUserId === user.id ||
      (b as any).provider_user_id === user.id ||
      b.providerId === myProviderId ||
      b.providerId === user.id
  );

  const completedBookings = providerBookings.filter(
    (b) => b.status === 'completed' || b.status === 'completed_pending_review'
  );
  const reviewedBookings = completedBookings.filter((b) => b.rating && b.rating > 0);
  const calculatedRating =
    currentProviderDetail?.rating && currentProviderDetail.rating > 0
      ? currentProviderDetail.rating
      : reviewedBookings.length > 0
      ? (
          reviewedBookings.reduce((sum, b) => sum + (b.rating || 5), 0) /
          reviewedBookings.length
        ).toFixed(1)
      : 'New';

  const completedJobsCount =
    currentProviderDetail?.jobsCompleted !== undefined
      ? currentProviderDetail.jobsCompleted
      : completedBookings.length;

  const portfolioItems = currentProviderDetail?.portfolio || [];

  // Persisted Schedule & Availability state
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [workingDays, setWorkingDays] = useState<string[]>([
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ]);
  const [scheduleSlots, setScheduleSlots] = useState<string[]>([
    '09:00 AM - 11:00 AM',
    '11:30 AM - 01:30 PM',
    '02:30 PM - 04:30 PM',
    '05:00 PM - 07:00 PM'
  ]);
  const [offDutySlots, setOffDutySlots] = useState<string[]>([]);
  const [scheduleArea, setScheduleArea] = useState(
    currentProviderDetail?.serviceArea || 'Indiranagar & East Bengaluru'
  );
  const [supportedModes, setSupportedModes] = useState<string[]>(['home_visit', 'provider_location']);
  const [hubAddress, setHubAddress] = useState('NSO Hub #14, 100ft Road, Indiranagar, Bengaluru');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.getProviderSchedule();
        if (res && res.success && res.schedule) {
          const s = res.schedule;
          if (s.workingDays) setWorkingDays(s.workingDays);
          if (s.availableSlots) setScheduleSlots(s.availableSlots);
          if (s.offDutySlots) setOffDutySlots(s.offDutySlots);
          if (s.serviceArea) setScheduleArea(s.serviceArea);
          if (s.supportedModes) setSupportedModes(s.supportedModes);
          if (s.hubAddress) setHubAddress(s.hubAddress);
        }
      } catch (e) {
        console.error('Error fetching provider schedule:', e);
      }
    };
    fetchSchedule();
  }, []);

  const handleSaveSchedule = async () => {
    setScheduleLoading(true);
    try {
      const res = await api.updateProviderSchedule({
        workingDays,
        availableSlots: scheduleSlots,
        offDutySlots,
        serviceArea: scheduleArea,
        supportedModes,
        hubAddress
      });
      if (res && res.success) {
        showToast('Schedule & availability saved successfully!');
      } else {
        showToast('Saved schedule changes.');
      }
    } catch {
      showToast('Could not save schedule. Please try again.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlotDuty = (slot: string) => {
    setOffDutySlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Completion OTP Modal state
  const [completionModalBooking, setCompletionModalBooking] = useState<Booking | null>(null);
  const [completionOtpInput, setCompletionOtpInput] = useState('');
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completingJob, setCompletingJob] = useState(false);

  const handleConfirmCompletion = async () => {
    if (!completionModalBooking) return;
    if (!completionOtpInput || completionOtpInput.trim().length !== 4) {
      setCompletionError('Please enter the 4-digit code provided by the customer.');
      return;
    }
    setCompletingJob(true);
    setCompletionError(null);
    try {
      if (sharingBookingId === completionModalBooking.id) {
        await stopSharing(completionModalBooking.id);
      }
      await markServiceComplete(completionModalBooking.id, 'Work completed successfully on-site.', completionOtpInput.trim());
      showToast('🎉 Service completed! Verified with customer OTP.');
      setCompletionModalBooking(null);
      setCompletionOtpInput('');
    } catch (e: any) {
      setCompletionError(e.message || 'OTP verification failed. Check code with customer.');
    } finally {
      setCompletingJob(false);
    }
  };

  // New Service Listing Creation state
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState(currentProviderTrade);
  const [newServicePrice, setNewServicePrice] = useState(399);
  const [newServicePricingType, setNewServicePricingType] = useState<'fixed' | 'hourly' | 'metered' | 'quotation_required'>('fixed');
  const [newServiceUnit, setNewServiceUnit] = useState('visit & inspection');
  const [newServiceDuration, setNewServiceDuration] = useState(1);
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceModes, setNewServiceModes] = useState<('home_visit' | 'provider_location')[]>(['home_visit']);
  const [newServiceCancellationPolicy, setNewServiceCancellationPolicy] = useState('Free cancellation before dispatch.');
  const [creatingService, setCreatingService] = useState(false);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim() || !newServiceDescription.trim()) {
      showToast('Please enter title and description.');
      return;
    }
    setCreatingService(true);
    try {
      await addNewService({
        title: newServiceTitle.trim(),
        category: newServiceCategory || currentProviderTrade,
        price: Number(newServicePrice) || 299,
        unit: newServiceUnit,
        pricingType: newServicePricingType,
        estimatedDurationHours: newServiceDuration,
        description: newServiceDescription.trim(),
        modes: newServiceModes,
        cancellationPolicy: newServiceCancellationPolicy,
        availableSlots: scheduleSlots
      });
      setShowAddServiceModal(false);
      setNewServiceTitle('');
      setNewServiceDescription('');
      showToast('New service listing submitted! Pending Admin Review.');
    } catch {
      showToast('Failed to create service listing.');
    } finally {
      setCreatingService(false);
    }
  };

  // ── Live GPS sharing state (per booking) ──────────────────────────────────
  const [sharingBookingId, setSharingBookingId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lng: number; heading?: number; speed?: number } | null>(null);

  // Stop GPS sharing cleanly
  const stopSharing = useCallback(async (bookingId: string, markOnServer = true) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (streamIntervalRef.current !== null) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    lastCoordsRef.current = null;
    setSharingBookingId(null);
    setGpsError(null);
    if (markOnServer) {
      await api.toggleLocationSharing(bookingId, false);
    }
  }, []);

  // Start GPS sharing
  const startSharing = useCallback(async (bookingId: string) => {
    if (!('geolocation' in navigator)) {
      setGpsError('GPS not available on this device.');
      return;
    }
    setGpsError(null);

    // Tell server we are starting
    const res = await api.toggleLocationSharing(bookingId, true);
    if (!res.success) {
      setGpsError(res.error || 'Could not activate tracking on server.');
      return;
    }
    setSharingBookingId(bookingId);

    // Watch position and cache latest coords
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastCoordsRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ?? undefined,
        };
      },
      (err) => {
        console.warn('GPS error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('GPS permission denied. Please allow location access and try again.');
          stopSharing(bookingId);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 4000 }
    );

    // Stream coords to server every 6 seconds
    streamIntervalRef.current = setInterval(async () => {
      if (lastCoordsRef.current) {
        await api.sendProviderLocation(bookingId, lastCoordsRef.current);
      }
    }, 6000);
  }, [stopSharing]);

  // Auto-stop when booking is completed or cancelled
  useEffect(() => {
    if (!sharingBookingId) return;
    const booking = bookings.find((b) => b.id === sharingBookingId);
    if (booking && (booking.status === 'completed' || booking.status === 'cancelled')) {
      stopSharing(sharingBookingId, false); // server already stopped on status change
    }
  }, [bookings, sharingBookingId, stopSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (streamIntervalRef.current !== null) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const handleOpenQuoteModal = (bookingId: string) => {
    setSelectedBookingForQuote(bookingId);
  };

  const handleSendRevisedQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForQuote) return;
    submitRevisedQuote(selectedBookingForQuote, parseFloat(quoteAmount), quoteReason);
    setSelectedBookingForQuote(null);
  };

  const handleStartJob = (bookingId: string) => {
    updateBookingStatus(bookingId, 'in_progress');
    showToast('✅ Job started: Status marked In-Progress.');
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;
    await addProviderPortfolioImage(myProviderId, {
      id: `port_${Date.now()}`,
      title: photoTitle,
      image: photoUrl,
      tag: photoTag
    });
    setShowAddPhotoModal(false);
    setPhotoTitle('');
  };

  const handleUploadWorkMedia = async (serviceId: string) => {
    const photos = workPhotoUrls.split('\n').map((s) => s.trim()).filter(Boolean);
    const videos = workVideoUrls.split('\n').map((s) => s.trim()).filter(Boolean);
    if (photos.length === 0) {
      showToast('⚠️ Please provide at least one work photo URL before saving.');
      return;
    }
    setUploadingWorkMedia(true);
    try {
      const result = await api.uploadServiceWorkMedia(serviceId, photos, videos);
      if (result?.success) {
        showToast('✅ Work photos & videos uploaded! Your listing is now eligible for public display.');
        setWorkMediaServiceId(null);
        setWorkPhotoUrls('');
        setWorkVideoUrls('');
      } else {
        showToast(result?.error || 'Failed to upload work media.');
      }
    } catch {
      showToast('Failed to upload work media. Please try again.');
    } finally {
      setUploadingWorkMedia(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner */}
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-4 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Service Provider Hub</h2>
                <p className="text-[10px] text-amber-100">{currentProviderName} • ID: <span className="font-mono font-bold">{myProviderId}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchRole('customer')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Store</span>
              </button>
              <span className="text-[10px] bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded-full font-bold">
                {user.providerApplication?.status === 'approved' ? 'APPROVED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
            <div>
              <span className="text-[10px] text-amber-100 block">Assigned Jobs</span>
              <span className="text-base font-extrabold">{providerBookings.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-100 block">Rating</span>
              <span className="text-base font-extrabold">{calculatedRating} {calculatedRating !== 'New' ? '★' : ''}</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-100 block">Completed</span>
              <span className="text-base font-extrabold">{completedJobsCount}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mt-3 text-[11px] font-bold overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            Jobs ({providerBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            Schedule Slots
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'portfolio' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            Portfolio ({portfolioItems.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-white text-amber-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'rates' ? 'bg-white text-amber-800 shadow-sm font-black' : 'text-gray-500'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>My Rates</span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Active Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {providerBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Wrench className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                <p className="text-xs font-bold">No assigned bookings yet</p>
              </div>
            ) : (
              providerBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">{b.bookingNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      b.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'in_progress'
                        ? 'bg-indigo-100 text-indigo-800'
                        : b.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{b.serviceTitle}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Customer: <span className="font-semibold text-gray-800">{b.customerName}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Slot: <span className="font-bold text-red-600">{b.date} ({b.timeSlot})</span>
                    </p>
                    {/* Show customer address for home_visit */}
                    {b.serviceMode === 'home_visit' ? (
                      <div className="mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] text-emerald-800 font-bold">Customer Location:</p>
                          <p className="text-[11px] text-gray-700">{b.customerAddress}</p>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.customerAddress)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Navigate in Google Maps
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500">
                        Mode: Customer visits your hub
                      </p>
                    )}
                  </div>

                  {/* Incoming / Assessing Action Buttons */}
                  {['confirmed', 'assessing', 'quotation_pending'].includes(b.status) && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                          Specialist Action Required:
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 capitalize bg-amber-100 px-2 py-0.5 rounded-full">
                          {b.pricingType || 'fixed'}
                        </span>
                      </div>

                      {/* Display Customer Job Description if provided */}
                      {b.jobDescription && (
                        <div className="p-2 bg-white rounded-lg border border-amber-200 text-[11px] text-gray-700">
                          <span className="font-bold text-gray-900 block">Customer Issue Description:</span>
                          <p>{b.jobDescription}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleStartJob(b.id)}
                            className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept &amp; Start Job</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBookingForJobQuote(b.id);
                            setQuoteProposedWork(b.jobDescription || `Standard ${b.serviceTitle} diagnostic & repair.`);
                          }}
                          className="py-1.5 bg-purple-900 hover:bg-purple-800 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Submit Formal Quote</span>
                        </button>
                        <button
                          onClick={() => setSelectedBookingForCancel(b.id)}
                          className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 col-span-2 active:scale-95"
                        >
                          Decline / Cancel Booking
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORMAL QUOTATION PREVIEW & STATUS */}
                  {b.quotation && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-950 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-purple-700" />
                          Submitted Job Quotation
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-black px-2 py-0.5 rounded-full capitalize">
                          {b.quotation.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700"><span className="font-bold">Scope:</span> {b.quotation.proposedWork}</p>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                        <div className="bg-white p-1 rounded-lg border border-purple-100">
                          <span className="text-[8px] text-gray-400 block">Labor</span>
                          <span className="font-bold text-slate-800">₹{b.quotation.laborCost}</span>
                        </div>
                        <div className="bg-white p-1 rounded-lg border border-purple-100">
                          <span className="text-[8px] text-gray-400 block">Parts</span>
                          <span className="font-bold text-slate-800">₹{b.quotation.partsCost}</span>
                        </div>
                        <div className="bg-white p-1 rounded-lg border border-purple-100">
                          <span className="text-[8px] text-gray-400 block">Fees</span>
                          <span className="font-bold text-slate-800">₹{b.quotation.additionalFees}</span>
                        </div>
                        <div className="bg-purple-900 text-white p-1 rounded-lg">
                          <span className="text-[8px] text-purple-200 block">Total</span>
                          <span className="font-black">₹{b.quotation.totalAmount}</span>
                        </div>
                      </div>
                      {b.quotation.adminFeedback && (
                        <p className="text-[10px] text-purple-900 bg-white p-1.5 rounded-lg border border-purple-100">
                          <span className="font-bold">Admin Feedback:</span> {b.quotation.adminFeedback}
                        </p>
                      )}
                      {b.quotation.customerFeedback && (
                        <p className="text-[10px] text-indigo-900 bg-white p-1.5 rounded-lg border border-indigo-100">
                          <span className="font-bold">Customer Feedback:</span> {b.quotation.customerFeedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* HOURLY TIMER BOX (if pricing is hourly or hourlyDetails exists) */}
                  {(b.pricingType === 'hourly' || b.hourlyDetails) && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-950 flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-indigo-600" />
                          Hourly Time Tracker
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.hourlyDetails?.timerRunning ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {b.hourlyDetails?.timerRunning ? 'Timer Running' : 'Timer Paused'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg text-center font-mono">
                        <div>
                          <span className="text-[8px] text-gray-400 block uppercase">Time Logged</span>
                          <span className="font-black text-slate-800">{b.hourlyDetails?.timeUsedHours || 0} hrs</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-400 block uppercase">Approved Cap</span>
                          <span className="font-bold text-slate-700">{b.hourlyDetails?.approvedTimeLimitHours || 2} hrs</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-400 block uppercase">Calculated</span>
                          <span className="font-extrabold text-indigo-700">₹{b.hourlyDetails?.calculatedAmount || b.totalPrice}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            const isRunning = Boolean(b.hourlyDetails?.timerRunning);
                            const currentUsed = b.hourlyDetails?.timeUsedHours || 0;
                            updateHourlyTimeUsed(b.id, isRunning ? currentUsed + 0.5 : currentUsed, !isRunning);
                            showToast(isRunning ? 'Timer paused. Logged +0.5 hr.' : 'Timer started.');
                          }}
                          className={`py-1.5 font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 active:scale-95 ${
                            b.hourlyDetails?.timerRunning
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {b.hourlyDetails?.timerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5" /> Pause Timer (+0.5h)
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Start / Resume Timer
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedBookingForExtraTime(b.id)}
                          className="py-1.5 bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50 font-bold text-[11px] rounded-lg active:scale-95"
                        >
                          + Request Extra Time
                        </button>
                      </div>
                    </div>
                  )}

                  {/* In Progress Actions */}
                  {b.status === 'in_progress' && (
                    <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                          <span>Active Job On-Site</span>
                        </div>
                      </div>

                      {/* GPS Sharing Controls — for home_visit */}
                      {b.serviceMode === 'home_visit' && (
                        <div className="bg-white rounded-lg border border-indigo-200 p-2.5 space-y-2">
                          <p className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Live GPS Sharing</p>
                          {gpsError && sharingBookingId === b.id && (
                            <p className="text-[10px] text-rose-600 font-bold">{gpsError}</p>
                          )}
                          {sharingBookingId === b.id ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                                <Radio className="w-3.5 h-3.5 animate-pulse" />
                                <span>Sharing live location with customer…</span>
                              </div>
                              <button
                                onClick={() => stopSharing(b.id)}
                                className="w-full py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black text-[11px] rounded-lg flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <WifiOff className="w-3.5 h-3.5" /> Stop Sharing Location
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startSharing(b.id)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Navigation className="w-3.5 h-3.5" /> Start Sharing Live Location
                            </button>
                          )}
                          <p className="text-[9px] text-gray-400">Your GPS is shared only with this customer and stops automatically when job is completed.</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setSelectedBookingForCancel(b.id)}
                          className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-[11px] rounded-lg active:scale-95"
                        >
                          Cancel Booking
                        </button>
                        <button
                          onClick={() => {
                            setCompletionModalBooking(b);
                            setCompletionOtpInput('');
                            setCompletionError(null);
                          }}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Finish &amp; Verify OTP</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Revised quote request flow trigger */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-[11px] text-gray-500">
                      Agreed Fee: <span className="font-black text-gray-900">₹{b.totalPrice}</span>
                    </div>
                    {b.status !== 'completed' && b.status !== 'cancelled' && !b.revisedQuote && (
                      <button
                        onClick={() => handleOpenQuoteModal(b.id)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold rounded-lg text-[11px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Submit Revised Quote</span>
                      </button>
                    )}
                  </div>

                  {/* Revised Quote Status Badge */}
                  {b.revisedQuote && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                      <div className="flex justify-between font-bold">
                        <span>Extra Work Request: +₹{b.revisedQuote.amount}</span>
                        <span className="capitalize text-[10px] bg-amber-200 px-1.5 py-0.2 rounded">
                          {b.revisedQuote.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-gray-600">{b.revisedQuote.reason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Schedule Slots & Availability */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-gray-900">Working Days &amp; Slot Availability</h4>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Auto Conflict Prevention ON
              </span>
            </div>

            {/* Working Days Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-700 block">Weekly Working Days:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const isWorkDay = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isWorkDay
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bookable Time Slots */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 block">Bookable Time Slots:</span>
                <span className="text-[10px] text-gray-400">Tap to toggle Off-Duty</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {scheduleSlots.map((slot) => {
                  const isOffDuty = offDutySlots.includes(slot);
                  return (
                    <div
                      key={slot}
                      onClick={() => toggleSlotDuty(slot)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        !isOffDuty
                          ? 'bg-amber-50/50 border-amber-200 text-amber-950 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${!isOffDuty ? 'text-amber-600' : 'text-gray-400'}`} />
                        <span>{slot}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          !isOffDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {!isOffDuty ? 'Accepting Bookings' : 'Off-Duty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Modes & Hub Details */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-700 block">Supported Service Modes:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSupportedModes((prev) =>
                      prev.includes('home_visit') ? prev.filter((m) => m !== 'home_visit') : [...prev, 'home_visit']
                    );
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    supportedModes.includes('home_visit')
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${supportedModes.includes('home_visit') ? 'text-amber-600' : 'opacity-0'}`} />
                  <span>Doorstep Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSupportedModes((prev) =>
                      prev.includes('provider_location') ? prev.filter((m) => m !== 'provider_location') : [...prev, 'provider_location']
                    );
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    supportedModes.includes('provider_location')
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${supportedModes.includes('provider_location') ? 'text-amber-600' : 'opacity-0'}`} />
                  <span>Provider Hub</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Service Operating Area:</label>
                <input
                  type="text"
                  value={scheduleArea}
                  onChange={(e) => setScheduleArea(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="e.g. Indiranagar, Koramangala & East Bengaluru"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Public Workshop / Hub Address:</label>
                <input
                  type="text"
                  value={hubAddress}
                  onChange={(e) => setHubAddress(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  placeholder="e.g. NSO Hub #14, 100ft Road, Indiranagar, Bengaluru"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              disabled={scheduleLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{scheduleLoading ? 'Saving Schedule…' : 'Save Schedule & Availability'}</span>
            </button>

            {/* Today's Reserved Bookings on Calendar */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-gray-700 block">Accepted Bookings On Calendar:</span>
              {providerBookings.filter((b) => b.status !== 'cancelled').length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">No bookings scheduled on the calendar yet.</p>
              ) : (
                providerBookings
                  .filter((b) => b.status !== 'cancelled')
                  .slice(0, 5)
                  .map((b) => (
                    <div key={b.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{b.serviceTitle}</span>
                        <p className="text-[10px] text-slate-500">{b.customerName} • {b.date} ({b.timeSlot})</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-100 text-emerald-800">
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Portfolio Photos Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">Verified Work Showcase</h4>
                <p className="text-[10px] text-gray-500">Customers see these photos when deciding to book you</p>
              </div>
              <button
                onClick={() => setShowAddPhotoModal(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {portfolioItems.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                  No work portfolio photos uploaded yet. Tap "Add Photo" above.
                </div>
              ) : (
                portfolioItems.map((item: any) => (
                  <div key={item.id} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group relative">
                    <img src={item.image} alt={item.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    <button
                      type="button"
                      onClick={() => deleteProviderPortfolioImage(myProviderId, item.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-xs"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="p-2">
                      <span className="text-[9px] font-black text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded uppercase">
                        {item.tag}
                      </span>
                      <p className="text-xs font-bold text-gray-900 mt-1 truncate">{item.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Category Approvals */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs">
            <h4 className="font-bold text-gray-900">Admin Verified Service Categories</h4>
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-emerald-950">Plumbing & Pipeworks</h5>
                  <p className="text-[10px] text-emerald-700">Verified by Admin via Trade License & ID</p>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800">HVAC & AC Service</h5>
                  <p className="text-[10px] text-slate-500">Document verification in progress</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  PENDING REVIEW
                </span>
              </div>
            </div>
          </div>
        )}

        {/* My Rates & Services */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">My Service Rates &amp; Listings</h4>
                <p className="text-[11px] text-gray-500">Create, manage, and price your approved service offerings</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Listing</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {services.filter(
                (s) =>
                  s.providerId === user.id ||
                  s.providerId === myProviderId ||
                  s.providerName === currentProviderName ||
                  (currentProviderTrade && s.category.toLowerCase().includes(currentProviderTrade.toLowerCase()))
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-2">
                  <Wrench className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">No Service Listings Yet</p>
                  <p className="text-[11px] text-gray-500">Tap "Add Listing" above to publish your first trade service offering.</p>
                </div>
              ) : (
                services.filter(
                  (s) =>
                    s.providerId === user.id ||
                    s.providerId === myProviderId ||
                    s.providerName === currentProviderName ||
                    (currentProviderTrade && s.category.toLowerCase().includes(currentProviderTrade.toLowerCase()))
                ).map((svc) => (
                <div key={svc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-slate-900">{svc.title}</h5>
                      <p className="text-[10px] text-slate-500">{svc.category} • {svc.subServiceName || 'General'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      svc.rateApprovalStatus === 'pending_admin'
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {svc.rateApprovalStatus === 'pending_admin' ? 'Rate Pending Admin' : 'Active Rate'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg text-center text-[11px]">
                    <div>
                      <span className="text-[8px] text-gray-400 block uppercase font-bold">Pricing Model</span>
                      <span className="font-bold text-slate-800 capitalize">{svc.pricingType || 'fixed'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block uppercase font-bold">Base Price</span>
                      <span className="font-extrabold text-emerald-700">₹{svc.price}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block uppercase font-bold">Hourly Rate</span>
                      <span className="font-bold text-indigo-700">{svc.hourlyRate ? `₹${svc.hourlyRate}/hr` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Work Media Status & Public Listing Eligibility */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-600">Public Front-Page Status:</span>
                    {svc.workPhotos && svc.workPhotos.length > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {svc.workPhotos.length} Work Photos Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Work Photos Required
                      </span>
                    )}
                  </div>

                  {/* Work Media Upload Inline Form */}
                  {workMediaServiceId === svc.id ? (
                    <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-800">Upload Work Showcase Media</span>
                        <button
                          type="button"
                          onClick={() => setWorkMediaServiceId(null)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Required by marketplace security: Customers must see your actual previous work photos and videos before your service appears on the front page.
                      </p>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                          Upload Photos from Device / Camera:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setWorkPhotoUrls(prev => prev ? `${prev}\n${reader.result}` : reader.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer mb-1.5"
                        />
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                          Work Photo URLs (or uploaded files above):
                        </label>
                        <textarea
                          rows={2}
                          value={workPhotoUrls}
                          onChange={(e) => setWorkPhotoUrls(e.target.value)}
                          placeholder="https://example.com/work-photo1.jpg&#10;https://example.com/work-photo2.jpg"
                          className="w-full text-[11px] font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                          Work Video URLs (Optional, One URL per line):
                        </label>
                        <textarea
                          rows={2}
                          value={workVideoUrls}
                          onChange={(e) => setWorkVideoUrls(e.target.value)}
                          placeholder="https://example.com/work-video1.mp4"
                          className="w-full text-[11px] font-mono p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setWorkMediaServiceId(null)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={uploadingWorkMedia}
                          onClick={() => handleUploadWorkMedia(svc.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg shadow-xs"
                        >
                          {uploadingWorkMedia ? 'Saving...' : 'Save Media'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setWorkMediaServiceId(svc.id);
                          setWorkPhotoUrls((svc.workPhotos || []).join('\n'));
                          setWorkVideoUrls((svc.workVideos || []).join('\n'));
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg shadow-xs active:scale-95 flex items-center gap-1"
                      >
                        <Image className="w-3 h-3 text-slate-600" />
                        <span>Upload Work Media</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingServiceId(svc.id);
                          setRatePrice(svc.price);
                          setRateHourly(svc.hourlyRate || svc.price);
                          setRatePricingType(svc.pricingType || 'fixed');
                          setRateUnit(svc.unit || 'service');
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-xs active:scale-95"
                      >
                        Update Rate &amp; Model
                      </button>
                    </div>
                  )}
                </div>
              )))}
            </div>
          </div>
        )}
      </div>



      {/* Add Work Photo Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900">Add Work Photo to Portfolio</h4>
              <button onClick={() => setShowAddPhotoModal(false)} className="p-1 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Work Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Pipe Soldering & Valve Fit"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Service Category Tag</label>
                <select
                  value={photoTag}
                  onChange={(e) => setPhotoTag(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Installation">Installation</option>
                  <option value="Repair">Repair</option>
                  <option value="Deep Service">Deep Service</option>
                  <option value="Overhaul">Overhaul</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Upload Work Photo (Device / Camera)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setPhotoUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer mb-2"
                />
                <label className="text-xs font-bold text-gray-700 block mb-1">Photo Preview</label>
                <img src={photoUrl} alt="preview" className="w-full h-28 object-cover rounded-xl border border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Job Quotation Modal */}
      {selectedBookingForJobQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sm text-purple-950">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Submit Formal Quotation</span>
              </div>
              <button onClick={() => setSelectedBookingForJobQuote(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              NSO Transparency Policy: Quotation will be reviewed by Admin, then sent to Customer for approval before work starts.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const total = Number(quoteLaborCost || 0) + Number(quotePartsCost || 0) + Number(quoteAdditionalFees || 0);
                await submitJobQuotation(selectedBookingForJobQuote, {
                  proposedWork: quoteProposedWork.trim() || 'Comprehensive service diagnostic and repair.',
                  laborCost: Number(quoteLaborCost || 0),
                  partsCost: Number(quotePartsCost || 0),
                  additionalFees: Number(quoteAdditionalFees || 0),
                  totalAmount: total,
                  assumptions: quoteAssumptions.trim(),
                  estimatedDuration: quoteEstimatedDuration,
                  expiryDate: quoteExpiryDate
                });
                setSelectedBookingForJobQuote(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Proposed Work / Scope</label>
                <textarea
                  rows={2}
                  required
                  value={quoteProposedWork}
                  onChange={(e) => setQuoteProposedWork(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Labor (₹)</label>
                  <input
                    type="number"
                    required
                    value={quoteLaborCost}
                    onChange={(e) => setQuoteLaborCost(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Parts (₹)</label>
                  <input
                    type="number"
                    value={quotePartsCost}
                    onChange={(e) => setQuotePartsCost(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Fees (₹)</label>
                  <input
                    type="number"
                    value={quoteAdditionalFees}
                    onChange={(e) => setQuoteAdditionalFees(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-black text-slate-800"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-purple-900 text-white rounded-xl flex items-center justify-between font-mono">
                <span className="text-xs uppercase text-purple-200 font-sans font-bold">Total Quotation:</span>
                <span className="text-lg font-black">
                  ₹{Number(quoteLaborCost || 0) + Number(quotePartsCost || 0) + Number(quoteAdditionalFees || 0)}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Assumptions / Scope Exclusions</label>
                <input
                  type="text"
                  value={quoteAssumptions}
                  onChange={(e) => setQuoteAssumptions(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Estimated Duration</label>
                  <input
                    type="text"
                    value={quoteEstimatedDuration}
                    onChange={(e) => setQuoteEstimatedDuration(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Valid Until</label>
                  <input
                    type="date"
                    value={quoteExpiryDate}
                    onChange={(e) => setQuoteExpiryDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForJobQuote(null)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md active:scale-95"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Time Request Modal */}
      {selectedBookingForExtraTime && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sm text-indigo-950">
                <Timer className="w-4 h-4 text-indigo-600" />
                <span>Request Extra Work Time</span>
              </div>
              <button onClick={() => setSelectedBookingForExtraTime(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Hourly work caps prevent surprises. The customer must approve additional time extension.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await requestHourlyExtraTime(selectedBookingForExtraTime, extraHours, extraReason);
                setSelectedBookingForExtraTime(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Additional Hours Needed</label>
                <select
                  value={extraHours}
                  onChange={(e) => setExtraHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-black text-indigo-700"
                >
                  {[1, 2, 3, 4].map((h) => (
                    <option key={h} value={h}>+{h} Hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason for Extension</label>
                <textarea
                  rows={2}
                  required
                  value={extraReason}
                  onChange={(e) => setExtraReason(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForExtraTime(null)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md active:scale-95"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structured Cancellation Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sm text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Cancel / Decline Booking</span>
              </div>
              <button onClick={() => setSelectedBookingForCancel(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Provide cancellation stage and any work/material costs incurred to protect both parties under NSO policy.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await cancelBooking(selectedBookingForCancel, cancelReason || 'Cancelled by provider', {
                  stage: cancelStage,
                  workCompletedCharge: cancelWorkCharge,
                  materialsUsedCharge: cancelMaterialCharge,
                  breakdown: `Work: ₹${cancelWorkCharge}, Materials: ₹${cancelMaterialCharge}`,
                  cancelledBy: 'provider'
                });
                setSelectedBookingForCancel(null);
                setCancelReason('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Cancellation Stage</label>
                <select
                  value={cancelStage}
                  onChange={(e) => setCancelStage(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="before_assignment">Before Technician Assignment</option>
                  <option value="after_assignment">Assigned / Pre-departure</option>
                  <option value="travelling">Technician En Route</option>
                  <option value="work_started">Work Already Started</option>
                </select>
              </div>

              {cancelStage === 'work_started' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-0.5">Work Done Charge (₹)</label>
                    <input
                      type="number"
                      value={cancelWorkCharge}
                      onChange={(e) => setCancelWorkCharge(Number(e.target.value))}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-0.5">Materials Used (₹)</label>
                    <input
                      type="number"
                      value={cancelMaterialCharge}
                      onChange={(e) => setCancelMaterialCharge(Number(e.target.value))}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason for Cancellation</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Unforeseen structural defect, safety issue, customer requested postponement..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md active:scale-95"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate & Pricing Model Update Modal */}
      {editingServiceId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sm text-amber-950">
                <Tag className="w-4 h-4 text-amber-700" />
                <span>Update Service Rate</span>
              </div>
              <button onClick={() => setEditingServiceId(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Proposed rate changes are reviewed by Admin within 24 hours to ensure fair marketplace pricing.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateProviderRate(editingServiceId, {
                  price: ratePrice,
                  hourlyRate: rateHourly,
                  pricingType: ratePricingType,
                  unit: rateUnit
                });
                setEditingServiceId(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Pricing Model</label>
                <select
                  value={ratePricingType}
                  onChange={(e) => setRatePricingType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="quotation_required">Formal Quotation Required</option>
                  <option value="metered">Metered / Per Unit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={ratePrice}
                    onChange={(e) => setRatePrice(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={rateHourly}
                    onChange={(e) => setRateHourly(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Billing Unit</label>
                <input
                  type="text"
                  value={rateUnit}
                  onChange={(e) => setRateUnit(e.target.value)}
                  placeholder="e.g. visit, job, hour, sq ft"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingServiceId(null)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md active:scale-95"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revised Quote Input Modal */}
      {selectedBookingForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="font-bold text-sm text-gray-900">Submit Revised Quote</h4>
            <p className="text-xs text-gray-500">
              Per NSO Rules: Any additional charge must be reviewed by Admin, and the Customer must explicitly approve before extra work starts.
            </p>

            <form onSubmit={handleSendRevisedQuote} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Additional Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Detailed Reason</label>
                <textarea
                  rows={2}
                  required
                  value={quoteReason}
                  onChange={(e) => setQuoteReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForQuote(null)}
                  className="py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Completion OTP Verification Modal */}
      {completionModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">Job Completion OTP</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Verify with 4-digit customer code</p>
                </div>
              </div>
              <button
                onClick={() => setCompletionModalBooking(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Booking:</span>
                <span className="font-mono">{completionModalBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span>{completionModalBooking.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Agreed Fee:</span>
                <span className="font-black text-slate-900">₹{completionModalBooking.totalPrice}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Enter 4-Digit Code Shown on Customer Screen:
              </label>
              <input
                type="text"
                maxLength={4}
                value={completionOtpInput}
                onChange={(e) => {
                  setCompletionOtpInput(e.target.value.replace(/\D/g, ''));
                  setCompletionError(null);
                }}
                placeholder="4-digit OTP"
                className="w-full p-3 bg-gray-50 border-2 border-emerald-300 rounded-2xl text-center font-mono font-black text-xl tracking-widest text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {completionError && (
                <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {completionError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCompletionModalBooking(null)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={completingJob}
                onClick={handleConfirmCompletion}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{completingJob ? 'Verifying…' : 'Verify & Complete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Service Listing Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sm text-amber-950">
                <Tag className="w-4 h-4 text-amber-700" />
                <span>Add Service Listing</span>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              New service listings are reviewed by Admin moderation before being publicly published.
            </p>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Pipe Leak Repair & Valve Fitting"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Category</label>
                  <input
                    type="text"
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Pricing Model</label>
                  <select
                    value={newServicePricingType}
                    onChange={(e) => setNewServicePricingType(e.target.value as any)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="quotation_required">Quotation Required</option>
                    <option value="metered">Metered Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Unit</label>
                  <input
                    type="text"
                    value={newServiceUnit}
                    onChange={(e) => setNewServiceUnit(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-0.5">Hours</label>
                  <input
                    type="number"
                    min={1}
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the inclusions, tools provided, and procedure..."
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Cancellation Policy</label>
                <input
                  type="text"
                  value={newServiceCancellationPolicy}
                  onChange={(e) => setNewServiceCancellationPolicy(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingService}
                  className="py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  {creatingService ? 'Submitting…' : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
