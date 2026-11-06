import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  MapPin,
  ChevronDown,
  Search,
  Mic,
  Heart
} from 'lucide-react';

export const BrandHeader: React.FC<{
  onOpenCart: () => void;
  onOpenSpecialRequest: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}> = ({ onOpenCart, onOpenSearch }) => {
  const {
    cart,
    setActiveTab,
    selectedAddress,
    openAddressModal,
    wishlist,
    openWishlist
  } = useApp();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

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
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/25 text-white font-black text-sm tracking-tight">
              NSO
            </div>
          </div>

          {/* Delivery Location Selector */}
          <div
            onClick={openAddressModal}
            className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60 transition-colors min-w-0"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0 flex items-center gap-1">
              <span className="font-bold text-xs text-slate-800 truncate max-w-[140px]">
                {selectedAddress.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Right: Wishlist & Cart */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
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

      {/* Spacious Animated Search Bar */}
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
    </header>
  );
};
