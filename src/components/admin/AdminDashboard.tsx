import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
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
  RefreshCw,
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Send,
  Calendar,
  CheckSquare,
  Tag
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
  resumeText?: string;
  previousWork?: string;
  issuedProviderId?: string;
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
    clearDemoProducts,
    registeredUsers,
    approveUserRegistration,
    approveProviderWithId,
    approveProduct,
    user,
    services,
    serviceCategories,
    addServiceCategory,
    updateServiceCategory,
    approveServiceListing,
    approveProviderRate,
    adminReviewQuotation,
    adminReviewProblem,
    providerCancellationReviews,
    adminReviewProviderCancellation
  } = useApp();

  // Live applications from backend only (no fake demo applications)
  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [commissionStats, setCommissionStats] = useState({ productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] as any[] });
  const [merchantUpi, setMerchantUpi] = useState('8310421121@ybl');
  const [upiSaving, setUpiSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'payments' | 'special_requests' | 'quotes' | 'approvals' | 'services_rates' | 'disputes' | 'cancellations' | 'audit' | 'settings'
  >('analytics');

  // New admin interaction states
  const [quoteFeedbackInputs, setQuoteFeedbackInputs] = useState<{ [bookingId: string]: string }>({});
  const [problemAdminNotes, setProblemAdminNotes] = useState<{ [bookingId: string]: string }>({});
  const [siteVisitDates, setSiteVisitDates] = useState<{ [bookingId: string]: string }>({});
  const [cancellationReviewNotes, setCancellationReviewNotes] = useState<{ [reviewId: string]: string }>({});

  // Category addition modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛠️');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubServices, setNewCatSubServices] = useState('');

  const rawEnv = (import.meta as any).env?.VITE_API_URL;
  const API = rawEnv && rawEnv.trim() ? `${rawEnv.replace(/\/+$/, '')}/api` : '/api';

  const fetchApplications = async () => {
    setAppLoading(true);
    try {
      const data = await api.getApplications();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch {}
    setAppLoading(false);
  };

  const fetchCommission = async () => {
    try {
      const res = await fetch(`${API}/commission`);
      if (res.ok) setCommissionStats(await res.json());
    } catch {}
  };

  const fetchMerchantUpi = async () => {
    try {
      const res = await api.getPublicSettings();
      if (res?.merchantUpiId) setMerchantUpi(res.merchantUpiId);
    } catch {}
  };

  const handleSaveMerchantUpi = async () => {
    setUpiSaving(true);
    const ok = await api.updateMerchantUpi(merchantUpi);
    setUpiSaving(false);
    if (ok) {
      showToast('✅ PhonePe Merchant UPI ID updated! All customer phones now use this UPI ID.');
    } else {
      showToast('❌ Failed to update Merchant UPI ID.');
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCommission();
    fetchMerchantUpi();
    if (activeTab === 'approvals') {
      const timer = setInterval(fetchApplications, 6000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const handleApproveApplication = async (appId: string, approved: boolean) => {
    const targetAppl = applications.find(a => a.id === appId);
    if (targetAppl?.type === 'provider') {
      approveProviderWithId(appId, approved, targetAppl);
    }
    try {
      const success = await api.approveApplication(appId, approved, {
        adminNotes: approved ? 'Approved by Admin' : 'Rejected by Admin'
      });
      if (success) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: approved ? 'approved' : 'rejected' } : a));
        showToast(approved ? `✅ Approved! Provider ID Issued.` : '❌ Application Rejected.');
        fetchApplications();
        return;
      }
    } catch {
      showToast(approved ? '✅ Approved locally!' : '❌ Rejected.');
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

  const [adminQuoteInput, setAdminQuoteInput] = useState<{ [id: string]: string }>({});

  const pendingSpecialRequests = specialRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review');
  const pendingRevisedQuotes = bookings.filter((b) => b.revisedQuote?.status === 'pending_admin');
  const pendingJobQuotes = bookings.filter((b) => b.quotation?.status === 'pending_admin');
  const pendingRateApprovals = services.filter(
    (s) => s.rateApprovalStatus === 'pending_admin' || s.approvalStatus === 'pending_approval'
  );
  const pendingDisputes = bookings.filter(
    (b) => b.reportedProblem && b.reportedProblem.adminReviewStatus !== 'resolved'
  );
  const pendingCancellationReviews = providerCancellationReviews.filter(
    (r) => r.status === 'pending_admin_review'
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const subs = newCatSubServices
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await addServiceCategory({
      name: newCatName.trim(),
      icon: newCatIcon || '🛠️',
      description: newCatDesc.trim() || 'Verified doorstep service category',
      subServices: subs.length > 0 ? subs : ['General service'],
      isActive: true,
      displayOrder: serviceCategories.length + 1
    });
    setNewCatName('');
    setNewCatDesc('');
    setNewCatSubServices('');
    setShowAddCategoryModal(false);
  };

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

  // Restricted Access Screen for non-admins
  if (user.activeRole !== 'admin' || !user.adminVerified) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900">Owner Access Required</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">
            The Admin Console is reserved exclusively for the marketplace owner, verified securely on the backend server.
          </p>
        </div>
        <button
          onClick={() => switchRole('customer')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
        >
          Return to Customer Mode
        </button>
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
                <p className="text-[10px] text-purple-200">Owner: {user.phone}</p>
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
                onClick={() => switchRole('customer')}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Exit Admin Panel"
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
            <span>Job Quotes</span>
            {(pendingJobQuotes.length + pendingRevisedQuotes.length) > 0 && (
              <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 rounded-full font-black">
                {pendingJobQuotes.length + pendingRevisedQuotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('services_rates')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'services_rates'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories & Rates</span>
            {pendingRateApprovals.length > 0 && (
              <span className="bg-indigo-200 text-indigo-900 text-[9px] px-1.5 rounded-full font-black animate-pulse">
                {pendingRateApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'disputes'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disputes & Issues</span>
            {pendingDisputes.length > 0 && (
              <span className="bg-rose-200 text-rose-900 text-[9px] px-1.5 rounded-full font-black animate-pulse">
                {pendingDisputes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cancellations')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'cancellations'
                ? 'bg-purple-900 text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Cancellations</span>
            {pendingCancellationReviews.length > 0 && (
              <span className="bg-red-200 text-red-900 text-[9px] px-1.5 rounded-full font-black">
                {pendingCancellationReviews.length}
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
        {/* Settings Tab: Server & Security */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Backend Server Configuration */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Backend Server &amp; Database</h4>
                    <p className="text-[10px] text-slate-400">Production API &amp; SQLite WAL Persistence</p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                  ONLINE
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <p><span className="font-bold text-slate-800">API Endpoint:</span> <span className="font-mono text-purple-700">{API}</span></p>
                <p><span className="font-bold text-slate-800">Owner Mobile:</span> <span className="font-mono text-slate-700">{user.phone}</span></p>
                <p><span className="font-bold text-slate-800">Database Engine:</span> <span className="text-emerald-700 font-bold">SQLite ACID WAL</span> (server/data/nso_marketplace.db)</p>
                <p><span className="font-bold text-slate-800">Session Security:</span> HMAC-SHA256 Signed Cookies with Multi-Device Invalidation</p>
              </div>
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

        {/* Job Quotes Queue */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Formal Job Quotations & Revised Quotes requiring Admin sign-off</span>
              <span className="font-bold text-gray-700">
                {pendingJobQuotes.length + pendingRevisedQuotes.length} pending
              </span>
            </div>

            {/* Pending Formal Job Quotations */}
            {pendingJobQuotes.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-gray-900">{b.bookingNumber}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-900 font-black px-2 py-0.5 rounded-full">
                    Job Quotation Vetting
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{b.serviceTitle}</h4>
                  <p className="text-[11px] text-gray-500">Provider: <strong>{b.providerName}</strong> • Customer: <strong>{b.customerName}</strong></p>
                </div>

                {b.quotation && (
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 space-y-2">
                    <p className="text-[11px] text-purple-950 font-bold"><span className="text-gray-500 font-normal">Scope:</span> {b.quotation.proposedWork}</p>
                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-purple-200/60 text-center font-mono">
                      <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                        <span className="text-[9px] text-gray-500 block">Labor</span>
                        <span className="font-bold text-slate-800">₹{b.quotation.laborCost}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                        <span className="text-[9px] text-gray-500 block">Parts</span>
                        <span className="font-bold text-slate-800">₹{b.quotation.partsCost}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                        <span className="text-[9px] text-gray-500 block">Fees</span>
                        <span className="font-bold text-slate-800">₹{b.quotation.additionalFees}</span>
                      </div>
                      <div className="bg-purple-900 text-white p-1.5 rounded-lg">
                        <span className="text-[9px] text-purple-200 block">Total</span>
                        <span className="font-extrabold">₹{b.quotation.totalAmount}</span>
                      </div>
                    </div>
                    {b.quotation.assumptions && (
                      <p className="text-[10px] text-purple-900 italic">Assumptions: {b.quotation.assumptions}</p>
                    )}
                    <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                      <span>Est. Duration: <strong>{b.quotation.estimatedDuration || '1-2 Days'}</strong></span>
                      <span>Valid Until: <strong>{b.quotation.expiryDate}</strong></span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Admin vetting notes (optional, e.g. Labor rate adjusted for local norm)..."
                    value={quoteFeedbackInputs[b.id] || ''}
                    onChange={(e) => setQuoteFeedbackInputs({ ...quoteFeedbackInputs, [b.id]: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => adminReviewQuotation(b.id, 'approve', quoteFeedbackInputs[b.id] || 'Approved by Admin')}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Send to Customer
                    </button>
                    <button
                      onClick={() => adminReviewQuotation(b.id, 'return', quoteFeedbackInputs[b.id] || 'Please revise quote')}
                      className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Return for Revision
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Legacy Revised Quotes */}
            {pendingRevisedQuotes.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-mono font-bold text-gray-900">{b.bookingNumber}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Extra Work Vetting
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
            ))}

            {pendingJobQuotes.length === 0 && pendingRevisedQuotes.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-gray-700">All Quotations Up to Date</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No pending provider job quotes awaiting admin review.</p>
              </div>
            )}
          </div>
        )}

        {/* Categories & Service Rates Queue */}
        {activeTab === 'services_rates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-gray-900">Service Categories &amp; Rate Governance</h4>
                <p className="text-[11px] text-gray-500">Govern categories, sub-services, and approve provider hourly/fixed rates</p>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {/* Provider Rate & Listing Approvals Queue */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider block">
                Pending Provider Rate &amp; Listing Submissions ({pendingRateApprovals.length})
              </span>

              {pendingRateApprovals.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                  <p className="font-bold text-emerald-950">All Provider Rates &amp; Listings Approved</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">No new service rate changes pending admin authorization.</p>
                </div>
              ) : (
                pendingRateApprovals.map((svc) => (
                  <div key={svc.id} className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{svc.title}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full capitalize">
                        {svc.pricingType || 'fixed'} • Pending Admin
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Category</span>
                        <span className="font-bold text-slate-800">{svc.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Proposed Price</span>
                        <span className="font-extrabold text-emerald-700">₹{svc.price} {svc.unit ? `/${svc.unit}` : ''}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Hourly Rate</span>
                        <span className="font-bold text-indigo-700">{svc.hourlyRate ? `₹${svc.hourlyRate}/hr` : 'N/A'}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600">{svc.description}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          approveServiceListing(svc.id, true);
                          approveProviderRate(svc.id, true);
                        }}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Rate &amp; Listing
                      </button>
                      <button
                        onClick={() => approveProviderRate(svc.id, false, 'Rate rejected by Admin')}
                        className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Rate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Existing Service Categories Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider block">
                Active Marketplace Categories ({serviceCategories.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {serviceCategories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <h5 className="font-bold text-xs text-gray-900">{cat.name}</h5>
                          <span className="text-[10px] text-gray-400">Order: {cat.displayOrder || 1}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => updateServiceCategory(cat.id, { isActive: !cat.isActive })}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    {cat.description && (
                      <p className="text-[10px] text-gray-500 leading-snug">{cat.description}</p>
                    )}
                    {cat.subServices && cat.subServices.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cat.subServices.slice(0, 5).map((sub) => (
                          <span key={sub} className="text-[9px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded-md">
                            {sub}
                          </span>
                        ))}
                        {cat.subServices.length > 5 && (
                          <span className="text-[9px] text-gray-400 px-1 py-0.5">
                            +{cat.subServices.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Disputes & Reported Problems */}
        {activeTab === 'disputes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Customer disputes, poor quality complaints &amp; site visit dispatch</span>
              <span className="font-bold text-gray-700">{pendingDisputes.length} active</span>
            </div>

            {pendingDisputes.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                <p className="font-black text-emerald-950">Zero Active Disputes</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">No customer reported problems or disputed jobs require mediation.</p>
              </div>
            ) : (
              pendingDisputes.map((b) => {
                const prob = b.reportedProblem!;
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${
                        prob.adminReviewStatus === 'site_visit_scheduled'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}>
                        {prob.adminReviewStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900">{b.serviceTitle}</h4>
                      <p className="text-[11px] text-gray-500">Customer: <strong>{b.customerName}</strong> ({b.customerPhone || 'N/A'}) • Provider: <strong>{b.providerName}</strong></p>
                      <div className="mt-2 p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">
                          Reported Issue: {prob.problemType.replace('_', ' ')}
                        </span>
                        <p className="text-gray-800 text-[11px]">{prob.description}</p>
                      </div>
                      {prob.siteVisitScheduledAt && (
                        <p className="text-[11px] text-indigo-700 font-bold mt-2">
                          📅 Site visit inspection scheduled: {new Date(prob.siteVisitScheduledAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Schedule Site Inspection Visit</label>
                          <input
                            type="datetime-local"
                            value={siteVisitDates[b.id] || ''}
                            onChange={(e) => setSiteVisitDates({ ...siteVisitDates, [b.id]: e.target.value })}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Admin Resolution Notes</label>
                          <input
                            type="text"
                            placeholder="Resolution notes or remediation details..."
                            value={problemAdminNotes[b.id] || ''}
                            onChange={(e) => setProblemAdminNotes({ ...problemAdminNotes, [b.id]: e.target.value })}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            const dateVal = siteVisitDates[b.id] || new Date().toISOString();
                            adminReviewProblem(b.id, {
                              siteVisitRequired: true,
                              siteVisitScheduledAt: dateVal,
                              adminNotes: 'Inspector dispatched for physical quality assessment.'
                            });
                          }}
                          className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Dispatch Site Visit
                        </button>
                        <button
                          onClick={() => {
                            adminReviewProblem(b.id, {
                              resolved: true,
                              resolutionNotes: problemAdminNotes[b.id] || 'Mediated and resolved with customer satisfaction.'
                            });
                          }}
                          className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolve &amp; Close Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Provider Cancellation Audits */}
        {activeTab === 'cancellations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Automated monitoring for providers with high cancellation rates or late dropouts</span>
              <span className="font-bold text-gray-700">{providerCancellationReviews.length} records</span>
            </div>

            {providerCancellationReviews.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                <p className="font-black text-emerald-950">Reliability Index Normal</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">All service specialists meet platform cancellation rate thresholds (&lt;10%).</p>
              </div>
            ) : (
              providerCancellationReviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900">{rev.providerName}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">Provider ID: {rev.providerId}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${
                      rev.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rev.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] text-center">
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Total Jobs</span>
                      <span className="font-bold text-slate-800">{rev.totalBookings}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Cancelled</span>
                      <span className="font-bold text-rose-600">{rev.cancelledBookings}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Cancel Rate</span>
                      <span className="font-black text-rose-700">{rev.cancellationRate}%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-700"><span className="font-bold">Trigger Reason:</span> {rev.reason}</p>

                  {rev.adminNotes && (
                    <p className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-lg font-medium">
                      Admin Audit Note: {rev.adminNotes}
                    </p>
                  )}

                  {rev.status === 'pending_admin_review' && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <input
                        type="text"
                        placeholder="Audit notes or corrective counseling warning..."
                        value={cancellationReviewNotes[rev.id] || ''}
                        onChange={(e) => setCancellationReviewNotes({ ...cancellationReviewNotes, [rev.id]: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        onClick={() => adminReviewProviderCancellation(rev.id, cancellationReviewNotes[rev.id] || 'Audited by Admin. Provider notified.', 'reviewed')}
                        className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Audited &amp; Acknowledge
                      </button>
                    </div>
                  )}
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

            {/* PhonePe & UPI Payment Gateway Settings */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                  <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                    PhonePe & UPI Payment Gateway
                  </span>
                </div>
                <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                  Live Over Internet
                </span>
              </div>
              <p className="text-[11px] text-purple-800">
                Enter your PhonePe Business / Personal UPI ID. Every customer phone will immediately scan your QR code and pay directly to this account with 0% platform fee.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={merchantUpi}
                  onChange={(e) => setMerchantUpi(e.target.value)}
                  placeholder="e.g. 8310421121@ybl or yourname@paytm"
                  className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-black text-purple-950 outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={upiSaving}
                  onClick={handleSaveMerchantUpi}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black shadow-sm disabled:opacity-50 active:scale-95 transition-all"
                >
                  {upiSaving ? 'Saving…' : 'Save UPI'}
                </button>
              </div>
            </div>

            {/* Customer Registrations Approval Section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-red-600" />
                  Customer Profile & Address Approvals ({registeredUsers.filter(u => u.approvalStatus === 'pending').length} Pending)
                </span>
              </div>

              {registeredUsers.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center font-medium">No customer registrations yet.</p>
              ) : (
                <div className="space-y-2">
                  {registeredUsers.map(u => (
                    <div key={u.id || u.phone} className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-slate-900 text-xs">{u.name}</h5>
                          <p className="text-[11px] text-slate-500 font-semibold">{u.phone}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          u.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          u.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {u.approvalStatus ? u.approvalStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg space-y-0.5">
                        <p><span className="font-bold">House / Flat:</span> {u.houseNumber || 'N/A'}</p>
                        <p><span className="font-bold">Street:</span> {u.streetNumber || 'N/A'}</p>
                        <p><span className="font-bold">Landmark:</span> {u.landmark || 'N/A'}</p>
                        <p><span className="font-bold">Location:</span> {u.city || 'Bengaluru'} - {u.pincode || '560001'}</p>
                      </div>
                      {u.approvalStatus !== 'approved' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => approveUserRegistration(u.id, true)}
                            className="py-1.5 bg-green-600 text-white rounded-xl font-black text-[11px] shadow-xs flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve Customer
                          </button>
                          <button
                            onClick={() => approveUserRegistration(u.id, false)}
                            className="py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Product Listing Approvals */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Product Listing Approvals ({products.filter(p => p.approvalStatus === 'pending_approval').length} Pending)
                </span>
              </div>

              {products.filter(p => p.approvalStatus === 'pending_approval').length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center font-medium">No pending product listings to review.</p>
              ) : (
                <div className="space-y-2">
                  {products.filter(p => p.approvalStatus === 'pending_approval').map(p => (
                    <div key={p.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-start gap-3">
                        <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-slate-900 text-xs truncate">{p.title}</h5>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            Seller: <span className="text-slate-800">{p.sellerName || 'Verified Store'}</span> • Category: {p.category}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="font-black text-emerald-700">₹{p.price}</span>
                            <span className="text-slate-400 line-through text-[11px]">₹{p.originalPrice}</span>
                            <span className="text-[10px] text-slate-500">Stock: {p.stock}</span>
                            <span className="text-[10px] text-slate-500">• Est. Delivery: ₹{p.regionalDeliveryFee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => approveProduct(p.id, true)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish to Store</span>
                        </button>
                        <button
                          onClick={() => approveProduct(p.id, false, 'Rejected by marketplace administrator')}
                          className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold active:scale-95 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 pb-1">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                Provider & Seller Applications ({applications.length})
              </span>
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

                    {appl.resumeText && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <p className="font-bold text-slate-700 text-[11px] mb-0.5">📄 Resume & Background:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{appl.resumeText}</p>
                      </div>
                    )}

                    {appl.previousWork && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <p className="font-bold text-slate-700 text-[11px] mb-0.5">🛠️ Previous Work & Projects Done:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{appl.previousWork}</p>
                      </div>
                    )}

                    {appl.issuedProviderId && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-green-800 font-black text-[11px]">
                        Official Provider ID: {appl.issuedProviderId}
                      </div>
                    )}
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
        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛠️</span>
                  <h4 className="font-extrabold text-sm text-gray-900">Add Service Category</h4>
                </div>
                <button onClick={() => setShowAddCategoryModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Appliance Care"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="font-bold text-gray-700 block mb-1">Icon Emoji</label>
                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-bold text-gray-700 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Repairs & maintenance"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sub-Services (comma separated)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Refrigerator, Washing Machine, Microwave, Chimney"
                    value={newCatSubServices}
                    onChange={(e) => setNewCatSubServices(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md active:scale-95"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
