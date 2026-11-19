import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { PolicyModal } from '../common/PolicyModal';
import { ApplicationModal } from '../auth/ApplicationModal';
import {
  User,
  MapPin,
  ShoppingBag,
  Wrench,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Phone,
  MessageSquare,
  Heart,
  FileText,
  Lock,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  MessageCircle,
  ExternalLink,
  Fingerprint,
  ScanFace,
  X
} from 'lucide-react';
import { promptBiometricAuth } from '../../utils/biometrics';
import { AdminMfaModal } from '../auth/AdminMfaModal';

export const AccountScreen: React.FC<{
  onOpenSpecialRequest: () => void;
}> = ({ onOpenSpecialRequest }) => {
  const {
    user,
    switchRole,
    unlockAdmin,
    logoutUser,
    setActiveTab,
    openAddressModal,
    openChat,
    openWishlist,
    orders,
    bookings,
    addresses,
    showToast
  } = useApp();

  const cleanUserPhone = (user.phone || localStorage.getItem('nso_user_phone') || '').replace(/\D/g, '').slice(-10);
  const isAuthorizedAdminPhone = cleanUserPhone === '8310421121';

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [appModalType, setAppModalType] = useState<'provider' | 'seller' | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [showAdminMfa, setShowAdminMfa] = useState(false);
  const [enrollingBio, setEnrollingBio] = useState(false);

  const handleEnrollBiometrics = async () => {
    setEnrollingBio(true);
    try {
      const bioPassed = await promptBiometricAuth(user.name || 'NSO Customer');
      if (!bioPassed) {
        showToast('Biometric enrollment cancelled or not supported on this device');
        setEnrollingBio(false);
        return;
      }
      const credId = localStorage.getItem('nso_biometric_cred_id') || `cred_${Date.now()}`;
      const res = await api.registerBiometricCredential(credId);
      setEnrollingBio(false);
      if (res && res.success) {
        showToast('✅ Biometrics linked! You can now use Fingerprint or Face Unlock.');
      } else {
        showToast(res?.error || 'Failed to link biometrics');
      }
    } catch (e: any) {
      setEnrollingBio(false);
      showToast(e?.message || 'Biometric hardware sensor error');
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    try {
      const res = await api.sendTestNotification('🔔 NSO Test', 'Push notifications are working!');
      showToast(res.success ? '✅ Test push triggered!' : '⚠️ Push not configured yet.');
    } catch {
      showToast('⚠️ Could not send test push.');
    } finally {
      setTestingPush(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setSavingPassword(true);
    const res = await api.setPassword(newPassword.trim());
    setSavingPassword(false);
    if (res.success) {
      showToast('✅ Password updated successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
    } else {
      showToast(res.error || 'Failed to update password');
    }
  };

  const getProviderStatusBadge = () => {
    if (user.providerStatus === 'approved') return <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" />Approved</span>;
    if (user.providerStatus === 'pending') return <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" />Under Review</span>;
    if (user.providerStatus === 'rejected') return <span className="text-[11px] bg-rose-50 text-rose-800 border border-rose-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" />Not Approved</span>;
    return <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded-full">Apply Now</span>;
  };

  const getSellerStatusBadge = () => {
    if (user.sellerStatus === 'approved') return <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" />Approved</span>;
    if (user.sellerStatus === 'pending') return <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" />Under Review</span>;
    return <span className="text-[11px] bg-orange-50 text-orange-800 border border-orange-200 font-extrabold px-2.5 py-0.5 rounded-full">Apply Now</span>;
  };

  const handleProviderTap = () => {
    if (user.adminVerified || user.providerStatus === 'approved') {
      switchRole('provider');
    } else {
      setAppModalType('provider');
    }
  };

  const handleSellerTap = () => {
    if (user.adminVerified || user.sellerStatus === 'approved') {
      switchRole('seller');
    } else {
      setAppModalType('seller');
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-3 animate-fade-in-up">
      {/* 1. Ultra-Premium User Profile Card with Account ID */}
      <div className="bg-gradient-to-b from-white to-amber-50/20 rounded-3xl p-5 border-2 border-amber-200/80 shadow-card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0 border-2 border-amber-300">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-base text-slate-900 truncate">{user.name}</h3>
            {user.accountId && (
              <span className="text-[10px] bg-amber-100/90 text-amber-950 font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300">
                {user.accountId}
              </span>
            )}
          </div>
          {user.username && (
            <p className="text-xs text-slate-500 font-semibold mt-0.5">@{user.username}</p>
          )}
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{user.phone || '+91 ••••• •••••'}</span>
          </p>
          <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{user.address || 'Bengaluru, Karnataka'}</span>
          </p>
        </div>
      </div>

      {/* 2. Customer Activity & Purchases */}
      <div className="space-y-2.5">
        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider px-1">
          My Shopping & Bookings
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/75 divide-y divide-slate-100 shadow-card overflow-hidden">
          <div
            onClick={() => setActiveTab('orders')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">Orders & Service Bookings</span>
                <span className="text-xs text-slate-400 font-medium truncate block">
                  {orders.length} orders • {bookings.length} service appointments
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          <div
            onClick={openWishlist}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 flex-shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">My Wishlist</span>
                <span className="text-xs text-slate-400 font-medium truncate block">Saved favorite products</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          <div
            onClick={openAddressModal}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">Saved Delivery Addresses</span>
                <span className="text-xs text-slate-400 font-medium truncate block">{addresses.length} addresses saved</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. Earn with NSO — Provider & Seller Portals */}
      <div className="space-y-2.5">
        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider px-1">
          Earn with NSO
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/75 divide-y divide-slate-100 shadow-card overflow-hidden">
          {/* Service Provider */}
          <div
            onClick={handleProviderTap}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-xs">Service Provider Portal</span>
                  {getProviderStatusBadge()}
                </div>
                <span className="text-xs text-slate-400 font-medium block truncate">
                  {user.providerStatus === 'approved' ? 'Manage bookings & schedule' :
                   user.providerStatus === 'pending' ? 'Application under Admin review' :
                   'Plumber, Electrician, Cleaner & more'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          {/* Seller */}
          <div
            onClick={handleSellerTap}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 flex-shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-xs">Seller / Store Portal</span>
                  {getSellerStatusBadge()}
                </div>
                <span className="text-xs text-slate-400 font-medium block truncate">
                  {user.sellerStatus === 'approved' ? 'Manage products & orders' :
                   user.sellerStatus === 'pending' ? 'Application under Admin review' :
                   'Sell products on NSO marketplace'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* 4. Customer Support & Policies */}
      <div className="space-y-2.5">
        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider px-1">
          Support & Trust
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/75 divide-y divide-slate-100 shadow-card overflow-hidden">
          {/* WhatsApp Direct Help */}
          <a
            href="https://api.whatsapp.com/send?text=Hello%20NSO%20Orbit%20Support%2C%20I%20need%20help%20with%20my%20order%2Fbooking."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold flex items-center gap-1.5 flex-wrap">
                  WhatsApp Support
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Fastest</span>
                </span>
                <span className="text-xs text-slate-400 font-medium block truncate">NSO Official Helpline • Quick Help</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </a>

          <div
            onClick={() => openChat('NSO Customer Support Team')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">Live Support Chat</span>
                <span className="text-xs text-slate-400 font-medium block truncate">24/7 in-app order & booking help</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          <div
            onClick={() => setShowPasswordModal(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">Account Security & Password</span>
                <span className="text-xs text-slate-400 font-medium block truncate">Set or update account password</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          {Boolean(isAuthorizedAdminPhone && (user.activeRole === 'admin' || user.isAdmin || user.adminVerified)) && (
            <div
              onClick={handleEnrollBiometrics}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-900 font-extrabold">Admin Biometrics (Fingerprint / Face)</span>
                  <span className="text-xs text-purple-700 font-bold block truncate">
                    {enrollingBio ? 'Enrolling sensor...' : 'Authorized Administrator Hardware Security'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
          )}

          <div
            onClick={() => setIsPolicyModalOpen(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-800 font-bold text-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-slate-900 font-extrabold">Policies, Terms & Refunds</span>
                <span className="text-xs text-slate-400 font-medium block truncate">Privacy, refund guarantees & compliance</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* 5. Store Owner & Superadmin Portal (Discrete, Protected Gateway - Only accessible to authorized admin phone) */}
      {Boolean(user.isLoggedIn && isAuthorizedAdminPhone) && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Store Administration
            </h4>
            <span className="text-[11px] text-purple-700 font-extrabold bg-purple-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200/60">
              <Lock className="w-3 h-3 text-purple-600" />
              <span>Password & Biometrics</span>
            </span>
          </div>

          <div
            onClick={() => {
              if (user.adminVerified) {
                switchRole('admin');
              } else {
                setShowAdminMfa(true);
              }
            }}
            className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 text-white shadow-card cursor-pointer hover:brightness-105 active:scale-98 transition-all flex items-center justify-between border border-slate-800"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-sm text-white">Owner Admin Control Panel</h5>
                <p className="text-xs text-purple-200/80 mt-0.5 truncate">
                  {user.adminVerified ? 'Sales analytics, UPI payment verification & inventory' : 'Authenticate via Password, Biometrics & Email OTP'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* 6. Sign Out & Actions */}
      <div className="pt-2 pb-2 space-y-3">
        {/* Test Push Notification */}
        <button
          onClick={handleTestPush}
          disabled={testingPush}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-extrabold text-xs active:scale-98 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
        >
          <Bell className="w-4 h-4 text-red-500" />
          <span>{testingPush ? 'Sending...' : 'Test Push Notification'}</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out?')) {
              logoutUser();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200/80 text-red-600 font-extrabold text-xs active:scale-98 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <p className="text-center text-xs text-slate-400 font-medium pt-1">
          NSO — New Shopping Orbit v1.0
        </p>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Set Account Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Set a secure password so you can log in directly using your phone or username without needing SMS OTP.
            </p>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                {savingPassword ? 'Saving...' : 'Save Password'}
              </button>
            </form>
          </div>
        </div>
      )}
      <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
      {appModalType && (
        <ApplicationModal
          type={appModalType}
          isOpen={!!appModalType}
          onClose={() => setAppModalType(null)}
        />
      )}
      {isAuthorizedAdminPhone && (
        <AdminMfaModal
          isOpen={showAdminMfa}
          onClose={() => setShowAdminMfa(false)}
          onSuccess={() => {
            setShowAdminMfa(false);
            unlockAdmin();
          }}
        />
      )}
    </div>
  );
};
