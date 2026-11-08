import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  XCircle
} from 'lucide-react';

export const AccountScreen: React.FC<{
  onOpenSpecialRequest: () => void;
}> = ({ onOpenSpecialRequest }) => {
  const {
    user,
    switchRole,
    logoutUser,
    setActiveTab,
    openAddressModal,
    openChat,
    openWishlist,
    orders,
    bookings,
    addresses
  } = useApp();

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [appModalType, setAppModalType] = useState<'provider' | 'seller' | null>(null);

  const getProviderStatusBadge = () => {
    if (user.providerStatus === 'approved') return <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" />Approved</span>;
    if (user.providerStatus === 'pending') return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Under Review</span>;
    if (user.providerStatus === 'rejected') return <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-2.5 h-2.5" />Not Approved</span>;
    return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Apply Now</span>;
  };

  const getSellerStatusBadge = () => {
    if (user.sellerStatus === 'approved') return <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" />Approved</span>;
    if (user.sellerStatus === 'pending') return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Under Review</span>;
    return <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Apply Now</span>;
  };

  const handleProviderTap = () => {
    if (user.providerStatus === 'approved') {
      switchRole('provider');
    } else {
      setAppModalType('provider');
    }
  };

  const handleSellerTap = () => {
    if (user.sellerStatus === 'approved') {
      switchRole('seller');
    } else {
      setAppModalType('seller');
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-3 animate-in fade-in duration-200">
      {/* 1. Clean User Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-red-500/25 flex-shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base text-slate-900 truncate">{user.name}</h3>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
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
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider px-1">
          My Shopping & Bookings
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/60 divide-y divide-slate-100 shadow-xs overflow-hidden">
          <div
            onClick={() => setActiveTab('orders')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-800 font-bold text-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-900 font-black">Orders & Service Bookings</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {orders.length} orders • {bookings.length} service appointments
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={openWishlist}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-800 font-bold text-xs">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-900 font-black">My Wishlist</span>
                <span className="text-[11px] text-slate-400 font-medium">Saved favorite products</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={openAddressModal}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-800 font-bold text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-900 font-black">Saved Delivery Addresses</span>
                <span className="text-[11px] text-slate-400 font-medium">{addresses.length} addresses saved</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 3. Earn with NSO — Provider & Seller Portals */}
      <div className="space-y-2.5">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider px-1">
          Earn with NSO
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/60 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Service Provider */}
          <div
            onClick={handleProviderTap}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-slate-900 text-xs">Service Provider Portal</span>
                  {getProviderStatusBadge()}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {user.providerStatus === 'approved' ? 'Manage bookings & schedule' :
                   user.providerStatus === 'pending' ? 'Application under Admin review' :
                   'Plumber, Electrician, Cleaner & more'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Seller */}
          <div
            onClick={handleSellerTap}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-slate-900 text-xs">Seller / Store Portal</span>
                  {getSellerStatusBadge()}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {user.sellerStatus === 'approved' ? 'Manage products & orders' :
                   user.sellerStatus === 'pending' ? 'Application under Admin review' :
                   'Sell products on NSO marketplace'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4. Customer Support & Policies */}
      <div className="space-y-2.5">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider px-1">
          Support & Trust
        </h4>

        <div className="bg-white rounded-3xl border border-slate-200/60 divide-y divide-slate-100 shadow-xs overflow-hidden">
          <div
            onClick={() => openChat('NSO Customer Support Team')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-800 font-bold text-xs">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-900 font-black">Live Support Chat</span>
                <span className="text-[11px] text-slate-400 font-medium">24/7 in-app order & booking help</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => setIsPolicyModalOpen(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-800 font-bold text-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-900 font-black">Policies, Terms & Refunds</span>
                <span className="text-[11px] text-slate-400 font-medium">Privacy, refund guarantees & compliance</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 5. Store Owner & Superadmin Portal (Discrete, Protected Gateway - Only visible to verified Admin) */}
      {user.adminVerified && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
              Store Administration
            </h4>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200/50">
              <Lock className="w-2.5 h-2.5 text-purple-600" />
              <span>Owner Protected</span>
            </span>
          </div>

          <div
            onClick={() => switchRole('admin')}
            className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-4 text-white shadow-md cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-between border border-slate-800"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h5 className="font-black text-sm text-white">Owner Admin Control Panel</h5>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  Sales analytics, UPI payment verification & inventory
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      )}

      {/* 6. Sign Out */}
      <div className="pt-2 pb-2">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out?')) {
              logoutUser();
            }
          }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl bg-red-50 border border-red-200/70 text-red-600 font-black text-sm hover:bg-red-100 active:scale-98 transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <p className="text-center text-[11px] text-slate-400 font-medium mt-2">
          NSO — New Shopping Orbit v1.0
        </p>
      </div>

      {/* Modals */}
      <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
      {appModalType && (
        <ApplicationModal
          type={appModalType}
          isOpen={!!appModalType}
          onClose={() => setAppModalType(null)}
        />
      )}
    </div>
  );
};

