import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  MapPin,
  ChevronDown,
  Search,
  Mic,
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
}> = ({ onOpenCart, onOpenSearch }) => {
  const {
    user,
    switchRole,
    cart,
    setActiveTab,
    selectedAddress,
    openAddressModal,
    wishlist,
    openWishlist
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

  const roleName =
    user.activeRole === 'admin'
      ? 'Admin'
      : user.activeRole === 'seller'
      ? 'Seller'
      : user.activeRole === 'provider'
      ? 'Provider'
      : 'Customer';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 pt-3 pb-3 space-y-2.5">
      {/* Top Bar: Brand Logo + Location + Cart */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Location */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/30 text-white font-black text-sm tracking-tighter border border-white/30">
              <span className="relative z-10 font-black">NSO</span>
              <div className="absolute inset-0 rounded-2xl border border-white/40 rotate-12 scale-90 pointer-events-none" />
            </div>
            <div className="hidden min-[360px]:block leading-none">
              <span className="font-black text-xs text-red-600 tracking-tight block">NSO</span>
              <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase block">Orbit</span>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <div
            onClick={openAddressModal}
            className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60 transition-colors min-w-0"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0 flex items-center gap-1">
              <span className="font-bold text-xs text-slate-800 truncate max-w-[100px]">
                {selectedAddress.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Right: Role Badge + Wishlist + Cart */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Role Switcher Badge */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold active:scale-95 transition-all"
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

          {/* Wishlist */}
          <button
            onClick={openWishlist}
            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-600 text-rose-600' : 'text-slate-700'}`} />
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Animated Search Bar */}
      <div
        onClick={onOpenSearch || (() => setActiveTab('explore'))}
        className="flex items-center justify-between bg-slate-100/90 hover:bg-slate-100 px-4 py-2.5 rounded-2xl cursor-pointer text-slate-500 border border-slate-200/50 shadow-xs transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
          <span className="text-xs font-medium text-slate-500 truncate transition-all duration-300">
            {placeholders[placeholderIndex]}
          </span>
        </div>
        <Mic className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
      </div>

      {/* Role Switcher Bottom Sheet Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-sm text-slate-900">Switch Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer */}
            <button
              onClick={() => { switchRole('customer'); setShowRoleModal(false); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                user.activeRole === 'customer'
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-black text-sm text-slate-900">Customer</p>
                <p className="text-[11px] text-slate-500">Shop products &amp; book services</p>
              </div>
              {user.activeRole === 'customer' && (
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </button>

            {/* Seller */}
            {(user.sellerStatus === 'approved' || user.activeRole === 'seller') && (
              <button
                onClick={() => { switchRole('seller'); setShowRoleModal(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                  user.activeRole === 'seller'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Seller</p>
                  <p className="text-[11px] text-slate-500">Manage your store &amp; products</p>
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
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                  user.activeRole === 'provider'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Service Provider</p>
                  <p className="text-[11px] text-slate-500">Manage jobs &amp; portfolio</p>
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
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                  user.activeRole === 'admin'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-sm text-slate-900">Admin / Owner</p>
                  <p className="text-[11px] text-slate-500">NSO control panel &amp; approvals</p>
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
