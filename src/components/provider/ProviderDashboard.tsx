import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { bookings, updateBookingStatus, submitRevisedQuote, providers, addProviderPortfolioImage, user, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'jobs' | 'schedule' | 'portfolio' | 'categories'>('jobs');

  // Revised quote modal state
  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('250');
  const [quoteReason, setQuoteReason] = useState('Additional internal pipeline copper pipe soldering required.');

  // Portfolio photo upload state
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoTag, setPhotoTag] = useState('Installation');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');

  // Slots availability state
  const [slotsState, setSlotsState] = useState([
    { slot: '09:00 AM - 11:00 AM', active: true },
    { slot: '11:30 AM - 01:30 PM', active: true },
    { slot: '02:30 PM - 04:30 PM', active: true },
    { slot: '05:00 PM - 07:00 PM', active: false }
  ]);

  const providerBookings = bookings;
  const currentProviderName = user.name || 'Service Specialist';
  const currentProviderTrade = user.providerApplication?.tradeCategory || 'Home Services';
  const currentProviderDetail = providers.find((p) => p.id === user.id) || null;
  const portfolioItems = currentProviderDetail?.portfolio || [];

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

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;
    addProviderPortfolioImage(user.id, {
      id: `port_${Date.now()}`,
      title: photoTitle,
      image: photoUrl,
      tag: photoTag
    });
    setShowAddPhotoModal(false);
    setPhotoTitle('');
  };

  const toggleSlot = (index: number) => {
    setSlotsState((prev) =>
      prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s))
    );
    showToast(`Slot status updated`);
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
                <p className="text-[10px] text-amber-100">{currentProviderName} ({currentProviderTrade})</p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded-full font-bold">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
            <div>
              <span className="text-[10px] text-amber-100 block">Assigned Jobs</span>
              <span className="text-base font-extrabold">{providerBookings.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-100 block">Rating</span>
              <span className="text-base font-extrabold">5.0 ★</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-100 block">Trade Domain</span>
              <span className="text-base font-extrabold">{currentProviderTrade}</span>
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
                    <p className="text-[11px] text-gray-500">
                      Address: {b.customerAddress}
                    </p>
                  </div>

                  {/* Accept / Decline incoming customer requests */}
                  {b.status === 'confirmed' && (
                    <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 space-y-2">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                        Incoming Request Action:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStartJob(b.id)}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept &amp; Start Job</span>
                        </button>
                        <button
                          onClick={() => {
                            updateBookingStatus(b.id, 'cancelled');
                            showToast('Booking declined by provider');
                          }}
                          className="py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[11px] rounded-lg"
                        >
                          Decline
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
                        <div className="flex items-center gap-1 text-indigo-700 bg-white/90 border border-indigo-200 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shadow-xs">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          <span>42m 18s</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-indigo-700 font-medium">OTP Verified: 4829</span>
                        <button
                          onClick={() => {
                            updateBookingStatus(b.id, 'completed');
                            showToast('🎉 Job marked as Completed! Invoice generated.');
                          }}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] rounded-lg shadow-sm active:scale-95 transition-all"
                        >
                          Finish & Mark Completed
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

        {/* Schedule Slots */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-gray-900">Working Slot Hours</h4>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Auto Conflict Prevention ON
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Tap any slot to toggle between Active and Off-Duty. Active slots are bookable by customers in real-time.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {slotsState.map((s, idx) => (
                <div
                  key={s.slot}
                  onClick={() => toggleSlot(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    s.active
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3.5 h-3.5 ${s.active ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span>{s.slot}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.active ? 'Accepting Bookings' : 'Off-Duty'}
                  </span>
                </div>
              ))}
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
                  <div key={item.id} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
                    <img src={item.image} alt={item.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
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
    </div>
  );
};
