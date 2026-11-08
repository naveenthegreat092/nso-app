import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
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
  CheckCircle2
} from 'lucide-react';

export const BrandHeader: React.FC<{
  onOpenCart: () => void;
  onOpenSpecialRequest: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}> = ({ onOpenCart, onOpenSearch, onOpenNotifications }) => {
  const {
    user,
    switchRole,
    cart,
    setActiveTab,
    selectedAddress,
    openAddressModal,
    wishlist,
    openWishlist,
    orders,
    bookings
  } = useApp();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showRoleModal, setShowRoleModal] = useState(false);

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
  const hasMultipleRoles = user.authorizedRoles.length > 1 || user.activeRole !== 'customer';

  return (
    <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 pt-3 pb-3 space-y-2.5">
      {/* Top Bar: Brand Logo + Location + Actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand & Location */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          >
            {/* NSO Logo Mark */}
            <div className="relative w-9 h-9 rounded-[14px] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/30 text-white font-black text-[13px] tracking-tighter border border-white/20">
              <span className="relative z-10 font-black leading-none">NSO</span>
              <div className="absolute inset-0 rounded-[14px] bg-white/10 pointer-events-none" />
            </div>
            <div className="hidden min-[360px]:block leading-none">
              <span className="font-black text-xs text-red-600 tracking-tight block">NSO</span>
              <span className="text-[7px] font-extrabold text-slate-400 tracking-widest uppercase block">Orbit</span>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <button
            onClick={openAddressModal}
            className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 active:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors min-w-0 max-w-[160px]"
            aria-label="Change delivery address"
          >
            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="font-bold text-xs text-slate-800 truncate">
              {selectedAddress.title}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </button>
        </div>

        {/* Right: Role badge + Wishlist + Notifications + Cart */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Role Switcher Badge — only shown when user has multiple roles */}
          {hasMultipleRoles && (
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-1 bg-red-50 border border-red-200/80 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold active:scale-95 transition-all"
              aria-label="Switch role"
            >
              {user.activeRole === 'admin' ? (
                <ShieldAlert className="w-3 h-3" />
              ) : user.activeRole === 'seller' ? (
                <Store className="w-3 h-3" />
              ) : user.activeRole === 'provider' ? (
                <Wrench className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
              <span>{roleName}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={openWishlist}
            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-600 text-rose-600' : 'text-slate-700'}`} />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce-in">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Animated Search Bar */}
      <button
        onClick={onOpenSearch || (() => setActiveTab('explore'))}
        className="w-full flex items-center justify-between bg-slate-100/90 hover:bg-slate-100 active:bg-slate-200 px-4 py-2.5 rounded-2xl cursor-pointer text-slate-500 border border-slate-200/50 transition-all group text-left"
        aria-label="Search products and services"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
          <span className="text-xs font-medium text-slate-500 truncate transition-all duration-500">
            {placeholders[placeholderIndex]}
          </span>
        </div>
        <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/30">
          <Search className="w-3.5 h-3.5 text-white" />
        </div>
      </button>

      {/* Role Switcher Bottom Sheet Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-black text-sm text-slate-900">Switch Role</h3>
                <p className="text-[11px] text-slate-400">Switch between your active accounts</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer */}
            <button
              onClick={() => { switchRole('customer'); setShowRoleModal(false); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-98 ${
                user.activeRole === 'customer'
                  ? 'border-red-500 bg-red-50/60'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-black text-sm text-slate-900">Customer</p>
                <p className="text-[11px] text-slate-500">Shop products & book services</p>
              </div>
              {user.activeRole === 'customer' && (
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </button>

            {/* Seller */}
            {(user.sellerStatus === 'approved' || user.activeRole === 'seller') && (
              <button
                onClick={() => { switchRole('seller'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-98 ${
                  user.activeRole === 'seller'
                    ? 'border-red-500 bg-red-50/60'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Seller</p>
                  <p className="text-[11px] text-slate-500">Manage your store & products</p>
                </div>
                {user.activeRole === 'seller' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            {/* Provider */}
            {(user.providerStatus === 'approved' || user.activeRole === 'provider') && (
              <button
                onClick={() => { switchRole('provider'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-98 ${
                  user.activeRole === 'provider'
                    ? 'border-red-500 bg-red-50/60'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Service Provider</p>
                  <p className="text-[11px] text-slate-500">Manage jobs & portfolio</p>
                </div>
                {user.activeRole === 'provider' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            {/* Admin */}
            {user.adminVerified && (
              <button
                onClick={() => { switchRole('admin'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-98 ${
                  user.activeRole === 'admin'
                    ? 'border-red-500 bg-red-50/60'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Admin / Owner</p>
                  <p className="text-[11px] text-slate-500">NSO control panel & approvals</p>
                </div>
                {user.activeRole === 'admin' && (
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
            )}

            <p className="text-center text-[10px] text-slate-400 pt-1">
              Tap a role to switch instantly
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
