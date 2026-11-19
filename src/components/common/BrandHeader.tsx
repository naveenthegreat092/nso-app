import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  RefreshCw,
  MapPin,
  ChevronDown,
  Search,
  Bell,
  Heart,
  Store,
  Wrench,
  ShieldAlert,
  User,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AdminMfaModal } from '../auth/AdminMfaModal';

export const BrandHeader: React.FC<{
  onOpenCart: () => void;
  onOpenSpecialRequest: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}> = ({ onOpenCart, onOpenSearch, onOpenNotifications }) => {
  const {
    user,
    switchRole,
    unlockAdmin,
    cart,
    setActiveTab,
    selectedAddress,
    openAddressModal,
    wishlist,
    openWishlist,
    orders,
    bookings,
    refreshAppData
  } = useApp();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAdminMfa, setShowAdminMfa] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const placeholders = [
    'Search earbuds, smartwatches, groceries...',
    'Book certified plumber or electrician...',
    'Search deep cleaning, AC service, fashion...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [placeholders.length]);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await refreshAppData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Unread notification count
  const unreadNotifications =
    orders.filter((o) => o.orderStatus === 'out_for_delivery').length +
    bookings.filter((b) => b.status === 'in_progress').length;

  const roleName =
    user.activeRole === 'admin'
      ? 'Admin'
      : user.activeRole === 'seller'
      ? 'Seller'
      : user.activeRole === 'provider'
      ? 'Provider'
      : 'Customer';

  // Only show role badge if user has non-customer roles or is on a non-customer view
  const cleanUserPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
  const isOwner = cleanUserPhone === '8310421121';
  const hasMultipleRoles = user.authorizedRoles.length > 1 || user.activeRole !== 'customer' || isOwner;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_12px_rgba(15,23,42,0.03)] px-4 pt-3 pb-3 space-y-2.5">
      {/* Top Bar: Brand Logo + Location + Actions */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Left: Brand & Location */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          >
            {/* NSO Official Logo Mark */}
            <img
              src="/nso-app-icon.svg"
              alt="NSO Orbit"
              className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 rounded-xl shadow-xs object-contain"
            />
            <div className="hidden min-[360px]:block leading-none">
              <span className="font-black text-xs text-red-600 tracking-tight block">NSO</span>
              <span className="text-[8px] font-black text-slate-800 tracking-widest uppercase block">Orbit</span>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <button
            onClick={openAddressModal}
            className="flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 active:bg-slate-300 px-3 py-1.5 rounded-full border-2 border-slate-300 transition-all min-w-0 max-w-[140px] min-[360px]:max-w-[170px] sm:max-w-[210px]"
            aria-label="Change delivery address"
          >
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
            </div>
            <span className="font-black text-xs text-slate-900 truncate">
              {selectedAddress.title || 'Add Address'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          </button>
        </div>

        {/* Right: Role badge + Wishlist + Refresh + Notifications + Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Role Switcher Badge — only shown when user has multiple roles */}
          {hasMultipleRoles && (
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300 text-red-800 px-2.5 py-1 rounded-full text-xs font-black active:scale-95 transition-all shadow-xs"
              aria-label="Switch role"
            >
              {user.activeRole === 'admin' ? (
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
              ) : user.activeRole === 'seller' ? (
                <Store className="w-4 h-4 flex-shrink-0 text-emerald-600 stroke-[2.5]" />
              ) : user.activeRole === 'provider' ? (
                <Wrench className="w-4 h-4 flex-shrink-0 text-amber-600 stroke-[2.5]" />
              ) : (
                <User className="w-4 h-4 flex-shrink-0 text-slate-700 stroke-[2.5]" />
              )}
              <span className="hidden min-[340px]:inline">{roleName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-red-600" />
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={openWishlist}
            className="p-2 text-slate-800 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95 cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-600 text-rose-600' : 'text-slate-800 stroke-[2.2]'}`} />
          </button>

          {/* Refresh App Data Button */}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 cursor-pointer"
            aria-label="Refresh App Data"
            title="Refresh App Data"
          >
            <RefreshCw className={`w-5 h-5 text-slate-800 stroke-[2.2] ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-800 stroke-[2.2]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-600 text-white font-black text-xs w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-800 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95 cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-900 stroke-[2.4]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-600 text-white font-black text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce-in px-0.5">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Animated Search Bar */}
      <button
        onClick={onOpenSearch || (() => setActiveTab('explore'))}
        className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200/90 active:bg-slate-200 px-4 py-3 rounded-2xl cursor-pointer text-slate-700 border-2 border-slate-300 transition-all group text-left shadow-xs"
        aria-label="Search products and services"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Search className="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors flex-shrink-0 stroke-[2.2]" />
          <span className="text-sm font-bold text-slate-800 group-hover:text-slate-950 truncate transition-all duration-500">
            {placeholders[placeholderIndex]}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/30 transition-colors">
          <Search className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
      </button>

      {/* Role Switcher Bottom Sheet Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-[32px] p-6 space-y-3.5 shadow-2xl animate-slide-up border-t border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Switch Account Role</h3>
                <p className="text-xs text-slate-500 font-medium">Switch between your active workspaces</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer */}
            <button
              onClick={() => { switchRole('customer'); setShowRoleModal(false); }}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer ${
                user.activeRole === 'customer'
                  ? 'border-red-500 bg-red-50/80 shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200/50">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-black text-sm text-slate-900">Customer</p>
                <p className="text-xs text-slate-500 truncate">Shop products & book doorstep services</p>
              </div>
              {user.activeRole === 'customer' && (
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </button>

            {/* Seller */}
            {(user.sellerStatus === 'approved' || user.activeRole === 'seller' || isOwner) && (
              <button
                onClick={() => { switchRole('seller'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer ${
                  user.activeRole === 'seller'
                    ? 'border-red-500 bg-red-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-200/50">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-black text-sm text-slate-900">Seller</p>
                  <p className="text-xs text-slate-500 truncate">Manage store, inventory & catalog</p>
                </div>
                {user.activeRole === 'seller' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            {/* Provider */}
            {(user.providerStatus === 'approved' || user.activeRole === 'provider' || isOwner) && (
              <button
                onClick={() => { switchRole('provider'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer ${
                  user.activeRole === 'provider'
                    ? 'border-red-500 bg-red-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200/50">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-black text-sm text-slate-900">Service Provider</p>
                  <p className="text-xs text-slate-500 truncate">Manage appointments, schedule & portfolio</p>
                </div>
                {user.activeRole === 'provider' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            {/* Admin */}
            {isOwner && (
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  if (user.adminVerified) {
                    switchRole('admin');
                  } else {
                    setShowAdminMfa(true);
                  }
                }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer ${
                  user.activeRole === 'admin'
                    ? 'border-red-500 bg-red-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200/50">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-sm text-slate-900">Admin / Owner</p>
                    {!user.adminVerified && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        MFA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">NSO control panel & system moderation</p>
                </div>
                {user.activeRole === 'admin' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
              Tap a role to switch your active workspace
            </p>
          </div>
        </div>
      )}

      {/* Admin Multi-Factor Security Modal */}
      {isOwner && (
        <AdminMfaModal
          isOpen={showAdminMfa}
          onClose={() => setShowAdminMfa(false)}
          onSuccess={() => {
            setShowAdminMfa(false);
            unlockAdmin();
          }}
        />
      )}
    </header>
  );
};
