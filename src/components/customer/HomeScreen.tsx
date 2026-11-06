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
    switchRole
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
    <div className="space-y-6 pb-24 px-4 pt-2">
      {/* 1. Hero Showcase Banner - Airy, Modern, Clean */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white p-6 shadow-xl shadow-red-500/15">
        <div className="relative z-10 space-y-3 max-w-[85%]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-amber-200">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Fast Regional Delivery</span>
          </span>

          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Everything You Need, <br />
            <span className="text-amber-200">Delivered to Your Door.</span>
          </h2>

          <p className="text-xs text-white/90 font-medium leading-relaxed">
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
        <div className="absolute -right-6 -bottom-8 text-9xl opacity-20 pointer-events-none select-none">
          🛍️
        </div>
      </div>

      {/* 2. Horizontal Smooth Category Rail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base text-slate-900 tracking-tight">Explore Categories</h3>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
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
              className="flex flex-col items-center gap-1.5 min-w-[72px] flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${cat.bg} border border-slate-200/50 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-all`}
              >
                {cat.icon}
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Marketplace Products Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Marketplace Products</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Verified local merchants & brands</p>
          </div>
          {approvedProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              See All
            </button>
          )}
        </div>

        {approvedProducts.length === 0 ? (
          /* Clean Empty Store Welcome State */
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">Your Store is Clean & Ready</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                All sample data has been removed. You can now add your real products directly from the Admin Panel.
              </p>
            </div>
            <button
              onClick={() => switchRole('admin')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Add First Product in Admin</span>
            </button>
          </div>
        ) : (
          /* Spacious 2-Column Product Grid */
          <div className="grid grid-cols-2 gap-3.5">
            {approvedProducts.map((product) => {
              const qty = getProductCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-98 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-50 p-3 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount badge */}
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        {product.discountPercentage}% OFF
                      </span>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.some((p) => p.id === product.id)
                            ? 'fill-rose-600 text-rose-600'
                            : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1 leading-snug">
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
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs rounded-xl border border-red-200 transition-all active:scale-90"
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

      {/* 4. Verified Doorstep Services Showcase */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Doorstep Services</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Verified local specialists</p>
          </div>
          {onOpenMapRadius && (
            <button
              onClick={onOpenMapRadius}
              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-red-600" />
              <span>Nearby Map</span>
            </button>
          )}
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 text-center shadow-xs space-y-2">
            <Wrench className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-black text-slate-900">Services Catalog Empty</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Add plumbers, electricians, cleaners, and specialists from your Admin Panel.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.slice(0, 3).map((service) => (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
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

                  <p className="text-xs text-slate-500 font-medium">
                    By {service.providerName}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end flex-shrink-0">
                  <span className="text-base font-black text-slate-900">₹{service.price}</span>
                  <span className="text-[10px] text-slate-400">{service.unit}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service);
                    }}
                    className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Smart AI Assistant Card */}
      <div
        onClick={() => setActiveTab('ask_nso')}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 cursor-pointer shadow-lg active:scale-98 transition-all border border-slate-800 flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center font-black text-white shadow-md shadow-red-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">Ask NSO Smart AI</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Compare products or get matched with verified technicians
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-red-400" />
      </div>

      {/* 6. Special Custom Work Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 p-5 space-y-2.5">
        <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
          Custom Task Requests
        </span>
        <h4 className="text-sm font-black text-slate-900">
          Need a custom gig or non-standard work?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Submit custom project specs directly to Admin for verified contractor quotations.
        </p>
        <button
          onClick={onOpenSpecialRequest}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all active:scale-98"
        >
          Submit Custom Work Request
        </button>
      </div>

      {/* 7. Clean Trust Row */}
      <div className="grid grid-cols-3 gap-2 py-4 bg-white rounded-3xl border border-slate-200/60 text-center text-xs font-bold text-slate-600 shadow-xs">
        <div className="space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
          <span className="block text-[11px]">100% Verified</span>
        </div>
        <div className="space-y-1 border-x border-slate-150">
          <Truck className="w-5 h-5 text-blue-600 mx-auto" />
          <span className="block text-[11px]">Direct Dispatch</span>
        </div>
        <div className="space-y-1">
          <Percent className="w-5 h-5 text-red-600 mx-auto" />
          <span className="block text-[11px]">Zero Hidden Fees</span>
        </div>
      </div>
    </div>
  );
};
