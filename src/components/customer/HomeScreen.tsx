import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Service } from '../../types';
import {
  Sparkles,
  ShoppingBag,
  Wrench,
  ShieldCheck,
  Star,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  Percent,
  Truck,
  Heart,
  Store,
  Compass
} from 'lucide-react';

export const HomeScreen: React.FC<{
  onSelectProduct: (p: Product) => void;
  onSelectService: (s: Service) => void;
  onOpenSpecialRequest: () => void;
  onOpenMapRadius?: () => void;
}> = ({ onSelectProduct, onSelectService, onOpenSpecialRequest, onOpenMapRadius }) => {
  const {
    products,
    services,
    setActiveTab,
    addToCart,
    updateCartQuantity,
    cart,
    openProviderProfile,
    wishlist,
    toggleWishlist,
    switchRole,
    user
  } = useApp();

  const categories = [
    { name: 'Electronics', icon: '🎧', bg: 'bg-blue-50 text-blue-600' },
    { name: 'Fashion', icon: '👕', bg: 'bg-rose-50 text-rose-600' },
    { name: 'Home & Kitchen', icon: '☕', bg: 'bg-amber-50 text-amber-600' },
    { name: 'Groceries', icon: '🥑', bg: 'bg-emerald-50 text-emerald-600' },
    { name: 'Plumbing', icon: '🔧', bg: 'bg-cyan-50 text-cyan-600' },
    { name: 'Electrical', icon: '⚡', bg: 'bg-yellow-50 text-yellow-700' },
    { name: 'Deep Cleaning', icon: '✨', bg: 'bg-purple-50 text-purple-600' },
    { name: 'Salon & Spa', icon: '✂️', bg: 'bg-pink-50 text-pink-600' },
  ];

  const getProductCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const approvedProducts = products.filter((p) => p.approvalStatus === 'approved');

  return (
    <div className="space-y-5 pb-24 px-4 pt-3 animate-fade-in-up">
      {/* 1. Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white p-6 shadow-xl shadow-red-500/20">
        <div className="relative z-10 space-y-3 max-w-[82%]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-amber-200">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Fast Regional Delivery</span>
          </span>

          <h2 className="text-[22px] font-black tracking-tight leading-tight">
            Everything You Need,{' '}
            <span className="text-amber-200">Delivered to Your Door.</span>
          </h2>

          <p className="text-[11px] text-white/85 font-medium leading-relaxed">
            Authentic retail shopping & verified doorstep technicians in one unified app.
          </p>

          <div className="pt-1 flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 bg-white text-red-600 font-black text-xs rounded-2xl shadow-md hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Products</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs rounded-2xl border border-white/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Book Services</span>
            </button>
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-4 -bottom-6 text-9xl opacity-15 pointer-events-none select-none">
          🛍️
        </div>
        {/* Top-right soft glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Category Rail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[15px] text-slate-900 tracking-tight">Explore Categories</h3>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 active:scale-95 transition-all"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveTab('explore')}
              className="flex flex-col items-center gap-1.5 min-w-[68px] flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-all border border-white`}
              >
                {cat.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Marketplace Products Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-[15px] text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Marketplace Products</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified local merchants & brands</p>
          </div>
          {approvedProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-red-600 hover:underline active:scale-95 transition-all"
            >
              See All
            </button>
          )}
        </div>

        {approvedProducts.length === 0 ? (
          /* Clean Empty Store Welcome State */
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">Store is Getting Ready</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Products will appear here once sellers list their items. Check back soon!
              </p>
            </div>
            {/* Only show admin shortcut if user is admin */}
            {user.activeRole === 'admin' || user.adminVerified ? (
              <button
                onClick={() => switchRole('admin')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Add First Product in Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('explore')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Services Instead</span>
              </button>
            )}
          </div>
        ) : (
          /* 2-Column Product Grid */
          <div className="grid grid-cols-2 gap-3">
            {approvedProducts.map((product) => {
              const qty = getProductCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-[0.98] group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-50/80 p-3 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount badge */}
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        {product.discountPercentage}% OFF
                      </span>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform border border-slate-100"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          wishlist.some((p) => p.id === product.id)
                            ? 'fill-rose-600 text-rose-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                      </div>

                      <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 mt-1 leading-snug">
                        {product.title}
                      </h4>
                    </div>

                    {/* Price & Add Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black text-[11px] rounded-xl border border-red-200 transition-all active:scale-90"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-red-600 text-white rounded-xl shadow-sm overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(product.id, qty - 1)}
                              className="p-1.5 hover:bg-red-700 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-black min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(product.id, qty + 1)}
                              className="p-1.5 hover:bg-red-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Doorstep Services Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-[15px] text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Doorstep Services</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified local specialists</p>
          </div>
          {onOpenMapRadius && (
            <button
              onClick={onOpenMapRadius}
              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-red-600" />
              <span>Nearby Map</span>
            </button>
          )}
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm space-y-2">
            <Wrench className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-black text-slate-800">Services Coming Soon</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Certified plumbers, electricians, cleaners, and more will appear here once approved.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {services.slice(0, 3).map((service) => (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98]"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-100">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-0.5 text-xs text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{service.providerRating}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {service.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    By {service.providerName}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end flex-shrink-0">
                  <span className="text-base font-black text-slate-900">₹{service.price}</span>
                  <span className="text-[10px] text-slate-400 mb-2">{service.unit}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Custom Work Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/60 p-5 space-y-2.5">
        <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
          Custom Task Requests
        </span>
        <h4 className="text-sm font-black text-slate-900">
          Need custom work or a non-standard project?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Submit your specs directly for verified contractor quotations from our admin team.
        </p>
        <button
          onClick={onOpenSpecialRequest}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all active:scale-[0.98]"
        >
          Submit Custom Work Request
        </button>
      </div>

      {/* 7. Trust Row */}
      <div className="grid grid-cols-3 gap-2 py-4 bg-white rounded-2xl border border-slate-100 text-center text-xs font-bold text-slate-600 shadow-sm">
        <div className="space-y-1.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
          <span className="block text-[11px] font-semibold text-slate-600">100% Verified</span>
        </div>
        <div className="space-y-1.5 border-x border-slate-100">
          <Truck className="w-5 h-5 text-blue-500 mx-auto" />
          <span className="block text-[11px] font-semibold text-slate-600">Direct Dispatch</span>
        </div>
        <div className="space-y-1.5">
          <Percent className="w-5 h-5 text-red-500 mx-auto" />
          <span className="block text-[11px] font-semibold text-slate-600">Zero Hidden Fees</span>
        </div>
      </div>
    </div>
  );
};
