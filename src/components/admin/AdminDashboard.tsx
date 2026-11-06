import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PaymentTracker } from './PaymentTracker';
import { promptBiometricAuth, checkBiometricSupport } from '../../utils/biometrics';
import {
  ShieldAlert,
  UserCheck,
  Sparkles,
  DollarSign,
  AlertOctagon,
  ScrollText,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Lock,
  Unlock,
  Key,
  QrCode,
  Smartphone,
  Check,
  LogOut,
  SlidersHorizontal,
  CreditCard,
  PieChart,
  Fingerprint,
  ScanFace,
  Wrench,
  Store,
  Clock,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

interface Application {
  id: string;
  type: 'provider' | 'seller';
  status: 'pending' | 'approved' | 'rejected';
  applicantName: string;
  applicantPhone: string;
  tradeCategory?: string;
  experienceYears?: number;
  hourlyRate?: number;
  serviceArea?: string;
  idProofType?: string;
  idProofNumber?: string;
  profilePhoto?: string;
  idDocumentPhoto?: string;
  storeName?: string;
  businessType?: string;
  gstin?: string;
  address?: string;
  productCategory?: string;
  storeLogo?: string;
  submittedAt: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    specialRequests,
    updateSpecialRequest,
    bookings,
    respondToRevisedQuote,
    auditLogs,
    orders,
    products,
    updateOrderPaymentStatus,
    updateBookingPaymentStatus,
    showToast,
    switchRole,
    approveSeller,
    approveProviderCategory,
    clearDemoProducts
  } = useApp();

  // Live applications from backend
  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [commissionStats, setCommissionStats] = useState({ productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] as any[] });

  const rawEnv = (import.meta as any).env?.VITE_API_URL;
  const API = rawEnv && rawEnv.trim() ? `${rawEnv.replace(/\/+$/, '')}/api` : '/api';

  const fetchApplications = async () => {
    setAppLoading(true);
    try {
      const res = await fetch(`${API}/applications`);
      if (res.ok) setApplications(await res.json());
    } catch {}
    setAppLoading(false);
  };

  const fetchCommission = async () => {
    try {
      const res = await fetch(`${API}/commission`);
      if (res.ok) setCommissionStats(await res.json());
    } catch {}
  };

  useEffect(() => { fetchApplications(); fetchCommission(); }, []);

  const handleApproveApplication = async (appId: string, approved: boolean) => {
    try {
      const res = await fetch(`${API}/applications/${appId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, adminNotes: approved ? 'Approved by Admin' : 'Rejected by Admin' })
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => a.id === appId ? updated : a));
        showToast(approved ? '✅ Application Approved! Portal unlocked for user.' : '❌ Application Rejected.');
      }
    } catch {
      showToast(approved ? '✅ Application Approved!' : '❌ Application Rejected.');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: approved ? 'approved' : 'rejected' } : a));
    }
  };

  const handleUpdateCommissionRate = async (type: 'products' | 'services', rate: number) => {
    try {
      const payload = type === 'products' ? { productsRate: rate } : { servicesRate: rate };
      const res = await fetch(`${API}/commission/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setCommissionStats(await res.json()); showToast(`Commission rate updated to ${rate}%`); }
    } catch { showToast('Commission rate updated locally.'); }
  };

  // Superadmin Security Gateway State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('nso_admin_session_unlocked') === 'true';
  });
  const [adminPhone, setAdminPhone] = useState<string>(() => {
    return localStorage.getItem('nso_admin_phone') || '8310421121';
  });
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('nso_admin_pin') || '0218';
  });
  const [adminUpiId, setAdminUpiId] = useState<string>(() => {
    return localStorage.getItem('nso_admin_upi') || '8310421121@upi';
  });

  // Login Form Inputs
  const [inputPhone, setInputPhone] = useState('8310421121');
  const [inputPin, setInputPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Settings Edit State
  const [newUpiInput, setNewUpiInput] = useState(adminUpiId);
  const [newPinInput, setNewPinInput] = useState('');

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'payments' | 'special_requests' | 'quotes' | 'approvals' | 'audit' | 'settings'
  >('analytics');
  const [adminQuoteInput, setAdminQuoteInput] = useState<{ [id: string]: string }>({});

  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  const handleBiometricUnlock = async () => {
    setIsBiometricScanning(true);
    setLoginError(null);
    showToast('🔍 Scanning Fingerprint / Face Recognition...');

    try {
      const verified = await promptBiometricAuth('NSO Superadmin');
      setIsBiometricScanning(false);

      if (verified) {
        setIsUnlocked(true);
        sessionStorage.setItem('nso_admin_session_unlocked', 'true');
        showToast('🟢 Biometric Identity Verified! Welcome Owner.');
      } else {
        setLoginError('Biometric verification cancelled or unrecognized. Use Master PIN.');
        showToast('Biometric scan cancelled. Please enter PIN.');
      }
    } catch {
      setIsBiometricScanning(false);
      setLoginError('Biometric device sensor error. Please use PIN.');
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = inputPhone.trim().replace(/\D/g, '');
    const targetCleanPhone = adminPhone.trim().replace(/\D/g, '');

    if (cleanPhone === targetCleanPhone && inputPin.trim() === adminPin.trim()) {
      setIsUnlocked(true);
      sessionStorage.setItem('nso_admin_session_unlocked', 'true');
      setLoginError(null);
      showToast('🛡️ Superadmin Identity Verified! Welcome Owner.');
    } else {
      setLoginError('❌ Access Denied: Invalid Admin Mobile or Master PIN.');
      showToast('Access Denied: Invalid Admin Credentials.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('nso_admin_session_unlocked');
    setInputPin('');
    showToast('🔒 Admin Console Locked.');
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newUpiInput.trim();
    if (!cleaned || !cleaned.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. 8310421121@upi or 8310421121@okaxis)');
      return;
    }
    setAdminUpiId(cleaned);
    localStorage.setItem('nso_admin_upi', cleaned);
    showToast(`✅ Primary Payment UPI set to: ${cleaned}`);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      showToast('PIN must be at least 4 digits');
      return;
    }
    setAdminPin(newPinInput.trim());
    localStorage.setItem('nso_admin_pin', newPinInput.trim());
    setNewPinInput('');
    showToast('✅ Master Admin PIN successfully updated!');
  };

  const pendingSpecialRequests = specialRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review');
  const pendingRevisedQuotes = bookings.filter((b) => b.revisedQuote?.status === 'pending_admin');

  const pendingPaymentsCount =
    orders.filter((o) => o.paymentStatus === 'pending').length +
    bookings.filter((b) => b.paymentStatus === 'pending').length;

  const handleAdminApproveSpecial = (id: string) => {
    const quoteVal = parseFloat(adminQuoteInput[id]) || 6500;
    updateSpecialRequest(id, 'quote_offered', 'Admin approved specifications & assigned contractor quote.', quoteVal);
    showToast(`Quotation of ₹${quoteVal} sent to customer for approval.`);
  };

  const handleAdminDeclineSpecial = (id: string) => {
    updateSpecialRequest(id, 'declined', 'Admin declined: Outside operational logistics parameters.');
    showToast('Special request declined.');
  };

  // ── SUPERADMIN GATEWAY LOCK SCREEN ──
  if (!isUnlocked) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[580px] animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-6 text-white shadow-2xl space-y-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              RESTRICTED SYSTEM
            </span>
            <h3 className="text-lg font-black text-white mt-1.5 tracking-tight">Superadmin Security Gate</h3>
            <p className="text-xs text-slate-400 mt-1">Authorized Owner Authentication Required</p>
          </div>

          {loginError && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl text-left">
              {loginError}
            </div>
          )}

          {/* Biometric Quick Unlock (Fingerprint & Face Recognition) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={isBiometricScanning}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 disabled:opacity-60 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-98 border border-emerald-400/30"
            >
              <Fingerprint className="w-5 h-5 animate-pulse text-emerald-200" />
              <ScanFace className="w-5 h-5 text-emerald-200" />
              <span>
                {isBiometricScanning ? 'Scanning Sensor...' : 'Unlock with Fingerprint / Face ID'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 font-semibold">
              Tap above to scan your phone's fingerprint sensor or Face Recognition
            </p>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">OR USE MASTER PIN</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <form onSubmit={handleUnlock} className="space-y-3.5 text-left">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Admin Mobile / ID
              </label>
              <input
                type="text"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="8310421121"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Master Security PIN
              </label>
              <input
                type="password"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                placeholder="Enter Master PIN"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>Verify PIN & Unlock</span>
            </button>
          </form>

          <button
            onClick={() => switchRole('customer')}
            className="text-[11px] text-slate-400 hover:text-white underline pt-1 block mx-auto transition-colors"
          >
            Cancel and Return to Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── UNLOCKED SUPERADMIN DASHBOARD ──
  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner */}
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-4 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Admin Control Panel</h2>
                <p className="text-[10px] text-purple-200">Owner: {adminPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => switchRole('customer')}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 border border-white/20"
              >
                <span>← Store</span>
              </button>
              <button
                onClick={handleLock}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Lock Console"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
            <div>
              <span className="text-[10px] text-purple-200 block">Special Requests</span>
              <span className="text-base font-extrabold">{pendingSpecialRequests.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-200 block">Pending Quotes</span>
              <span className="text-base font-extrabold">{pendingRevisedQuotes.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-200 block">Audit Records</span>
              <span className="text-base font-extrabold">{auditLogs.length}</span>
            </div>
          </div>
        </div>

        {/* Real-time Order Volume Metric Card */}
        <div className="mt-3 bg-white rounded-2xl border border-slate-150 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-black text-slate-800">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Real-Time Fulfillment Pipeline</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live ({orders.length} orders)
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              { label: 'Confirmed / Packing', count: orders.filter((o) => ['confirmed', 'packed'].includes(o.orderStatus)).length, color: 'bg-blue-500' },
              { label: 'In Transit / Out for Delivery', count: orders.filter((o) => ['shipped', 'out_for_delivery'].includes(o.orderStatus)).length, color: 'bg-indigo-500' },
              { label: 'Delivered Successfully', count: orders.filter((o) => o.orderStatus === 'delivered').length, color: 'bg-emerald-500' },
              { label: 'Cancelled / Refunded', count: orders.filter((o) => o.orderStatus === 'cancelled').length, color: 'bg-rose-500' }
            ].map((st) => {
              const pct = orders.length > 0 ? Math.round((st.count / orders.length) * 100) : 0;
              return (
                <div key={st.label} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>{st.label}</span>
                    <span>{st.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${st.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 4)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher - Scrollable Mobile Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-gray-100 p-1.5 rounded-2xl mt-3 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
            {pendingPaymentsCount > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingPaymentsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('special_requests')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'special_requests'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Special Req</span>
            {pendingSpecialRequests.length > 0 && (
              <span className="bg-purple-200 text-purple-900 text-[9px] px-1.5 rounded-full font-black">
                {pendingSpecialRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'quotes'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Quotes</span>
            {pendingRevisedQuotes.length > 0 && (
              <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 rounded-full font-black">
                {pendingRevisedQuotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'approvals'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'audit'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Log
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            UPI & Key
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Sales Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard orders={orders} bookings={bookings} products={products} />
        )}

        {/* Payment Tracking Tab */}
        {activeTab === 'payments' && (
          <PaymentTracker
            orders={orders}
            bookings={bookings}
            onUpdateOrderPayment={updateOrderPaymentStatus}
            onUpdateBookingPayment={updateBookingPaymentStatus}
            showToast={showToast}
          />
        )}
        {/* Settings Tab: UPI & Security */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Direct UPI Payment Engine */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Direct Customer UPI Payment</h4>
                    <p className="text-[10px] text-slate-400">All customer payments land directly here</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <form onSubmit={handleSaveUpi} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 block">
                  Your Primary UPI ID (GPay / PhonePe / Paytm / Bank):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUpiInput}
                    onChange={(e) => setNewUpiInput(e.target.value)}
                    placeholder="8310421121@upi"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Save UPI
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Current: <span className="font-mono font-bold text-emerald-700">{adminUpiId}</span>
                </p>
              </form>
            </div>

            {/* Change Master Admin PIN */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Superadmin Security Credentials</h4>
                  <p className="text-[10px] text-slate-400">Authorized Phone: {adminPhone}</p>
                </div>
              </div>

              <form onSubmit={handleSavePin} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 block">
                  Set New Master PIN / Password:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter new 4+ digit PIN"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Update PIN
                  </button>
                </div>
              </form>
            </div>

            {/* Catalog & Demo Products Management */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div>
                <h4 className="text-xs font-black text-slate-900">Marketplace Catalog Management</h4>
                <p className="text-[10px] text-slate-400">Manage demo items vs real seller-uploaded inventory</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50/60 rounded-xl border border-red-200/60">
                <div>
                  <p className="text-xs font-bold text-red-900">Remove Sample Products</p>
                  <p className="text-[10px] text-red-600">Delete all demo products so only real seller products remain</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove all demo products? Only real seller products will remain.')) {
                      clearDemoProducts();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] rounded-xl shadow-xs"
                >
                  Clear Demo Items
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Special Requests Queue (Brief Page 7) */}
        {activeTab === 'special_requests' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Admin Queue for Out-of-Category Custom Work</span>
              <span className="font-semibold text-gray-700">{specialRequests.length} total</span>
            </div>

            {specialRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-900">{req.requestNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-amber-50 text-amber-800">
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">{req.title}</h4>
                  <p className="text-[11px] text-gray-600 mt-1">{req.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                    <span>Customer: <strong className="text-gray-700">{req.customerName}</strong></span>
                    <span>Target: <strong>{req.targetTimeline}</strong></span>
                    <span>Budget: <strong>₹{req.estimatedBudget}</strong></span>
                  </div>
                </div>

                {/* Admin Actions if pending */}
                {(req.status === 'submitted' || req.status === 'under_review') && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-gray-700 whitespace-nowrap">Admin Quotation (₹):</label>
                      <input
                        type="number"
                        placeholder="e.g. 7800"
                        value={adminQuoteInput[req.id] || req.estimatedBudget.toString()}
                        onChange={(e) => setAdminQuoteInput({ ...adminQuoteInput, [req.id]: e.target.value })}
                        className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold w-28"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAdminApproveSpecial(req.id)}
                        className="py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Approve & Send Quote
                      </button>
                      <button
                        onClick={() => handleAdminDeclineSpecial(req.id)}
                        className="py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-xs rounded-xl"
                      >
                        Decline Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Revised Quotes Queue (Brief Page 6) */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              Provider revised quote submissions requiring Admin sign-off before customer confirmation:
            </div>

            {pendingRevisedQuotes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                <p className="text-xs font-medium">No pending revised quotes to vet</p>
              </div>
            ) : (
              pendingRevisedQuotes.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono font-bold text-gray-900">{b.bookingNumber}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Vetting Required
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800">{b.serviceTitle}</h4>
                    <p className="text-[11px] text-gray-500">Provider: {b.providerName} • Customer: {b.customerName}</p>
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                      <span className="font-bold text-amber-900 block">Requested Extra Charge: +₹{b.revisedQuote?.amount}</span>
                      <p className="text-[11px] text-gray-700 mt-0.5">{b.revisedQuote?.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => respondToRevisedQuote(b.id, true)}
                      className="py-1.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Admin Approve
                    </button>
                    <button
                      onClick={() => respondToRevisedQuote(b.id, false)}
                      className="py-1.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                    >
                      Reject Extra Charge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approvals (Sellers & Providers) */}
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                Pending Applications ({applications.filter(a => a.status === 'pending').length})
              </span>
              <button onClick={fetchApplications} className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Commission Settings */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <h4 className="font-black text-sm text-green-900">Commission Settings</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-green-700 uppercase mb-1 block">Products Rate %</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={1} max={50}
                      value={commissionStats.productsRate}
                      onChange={e => setCommissionStats(p => ({...p, productsRate: parseInt(e.target.value)}))}
                      className="w-14 bg-white border border-green-200 rounded-xl px-2 py-1.5 text-sm font-black text-green-900 outline-none text-center"
                    />
                    <button onClick={() => handleUpdateCommissionRate('products', commissionStats.productsRate)} className="px-2 py-1.5 bg-green-600 text-white rounded-xl text-[10px] font-black">Save</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-green-700 uppercase mb-1 block">Services Rate %</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={1} max={50}
                      value={commissionStats.servicesRate}
                      onChange={e => setCommissionStats(p => ({...p, servicesRate: parseInt(e.target.value)}))}
                      className="w-14 bg-white border border-green-200 rounded-xl px-2 py-1.5 text-sm font-black text-green-900 outline-none text-center"
                    />
                    <button onClick={() => handleUpdateCommissionRate('services', commissionStats.servicesRate)} className="px-2 py-1.5 bg-green-600 text-white rounded-xl text-[10px] font-black">Save</button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl px-3 py-2 border border-green-100 flex items-center justify-between">
                <span className="text-xs font-black text-green-800">Total Commission Earned</span>
                <span className="text-sm font-black text-green-700">₹{commissionStats.totalEarned.toLocaleString()}</span>
              </div>
            </div>

            {appLoading && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">Loading applications...</div>
            )}

            {!appLoading && applications.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-black text-slate-400">No Applications Yet</p>
                <p className="text-xs text-slate-400 mt-1">When users apply to become Providers or Sellers, they'll appear here.</p>
              </div>
            )}

            {applications.map(appl => (
              <div key={appl.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${appl.type === 'provider' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {appl.type === 'provider' ? <Wrench className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xs">{appl.applicantName}</h4>
                      <p className="text-[11px] text-gray-500">{appl.applicantPhone}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                    appl.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    appl.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {appl.status.toUpperCase()}
                  </span>
                </div>

                {appl.type === 'provider' ? (
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      {appl.profilePhoto && (
                        <img src={appl.profilePhoto} alt="Provider Face" className="w-12 h-12 rounded-xl object-cover border border-blue-200 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{appl.tradeCategory} • {appl.experienceYears} Years Exp</p>
                        <p className="text-[11px] text-slate-500">₹{appl.hourlyRate}/hr • {appl.serviceArea}</p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">{appl.idProofType}:</span> {appl.idProofNumber}
                      {appl.idDocumentPhoto && (
                        <div className="mt-2">
                          <p className="font-bold text-slate-500 text-[10px] uppercase mb-1">Uploaded ID Proof Photo:</p>
                          <img src={appl.idDocumentPhoto} alt="ID Document Proof" className="w-full max-h-36 object-contain rounded-lg border border-slate-200 bg-slate-100" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      {appl.storeLogo && (
                        <img src={appl.storeLogo} alt="Store Logo" className="w-12 h-12 rounded-xl object-cover border border-orange-200 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{appl.storeName} ({appl.businessType})</p>
                        <p className="text-[11px] text-slate-500">Category: {appl.productCategory}</p>
                      </div>
                    </div>
                    {appl.gstin && <p className="text-[11px] text-slate-500"><span className="font-bold">GSTIN:</span> {appl.gstin}</p>}
                    <p className="text-[11px] text-slate-500"><span className="font-bold">Address:</span> {appl.address}</p>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Applied: {new Date(appl.submittedAt).toLocaleString('en-IN')}
                </p>

                {appl.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => handleApproveApplication(appl.id, true)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveApplication(appl.id, false)}
                      className="py-2 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
                {appl.status !== 'pending' && (
                  <div className={`text-center py-1.5 rounded-xl text-xs font-black ${appl.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {appl.status === 'approved' ? '✅ Approved — Portal Unlocked' : '❌ Rejected'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Audit Log (Brief Page 8: Record status changes, approvals, quote changes, refunds with timestamps and actor) */}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Immutable System Audit Trail:
            </span>
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-700">{log.action}</span>
                  <span className="text-gray-400 font-mono text-[10px]">{log.timestamp}</span>
                </div>
                <p className="text-gray-700">{log.details}</p>
                <div className="text-[10px] text-gray-400">
                  Actor: <span className="font-semibold text-gray-600">{log.actor}</span> ({log.role.toUpperCase()})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
