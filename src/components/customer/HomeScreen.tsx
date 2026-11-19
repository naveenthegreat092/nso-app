import React, { useState } from 'react';
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
  Compass,
  Calendar,
  Headphones,
  Shirt,
  ShoppingBasket,
  Coffee,
  Scissors,
  Package,
  Layers,
  X
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
    providers,
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

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryPills = [
    {
      id: 'all',
      name: 'All Orbit',
      icon: Layers,
      color: 'text-red-600',
      bg: 'bg-red-50 text-red-600',
      activeStyle: 'bg-red-600 text-white shadow-md shadow-red-500/25 border-red-600 ring-2 ring-red-500/20',
      matcher: () => true
    },
    {
      id: 'groceries',
      name: 'Groceries',
      icon: ShoppingBasket,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 text-emerald-600',
      activeStyle: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border-emerald-600 ring-2 ring-emerald-500/20',
      matcher: (c: string) => /grocer/i.test(c)
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: Headphones,
      color: 'text-blue-600',
      bg: 'bg-blue-50 text-blue-600',
      activeStyle: 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border-blue-600 ring-2 ring-blue-500/20',
      matcher: (c: string) => /electr/i.test(c)
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: Shirt,
      color: 'text-rose-600',
      bg: 'bg-rose-50 text-rose-600',
      activeStyle: 'bg-rose-600 text-white shadow-md shadow-rose-500/25 border-rose-600 ring-2 ring-rose-500/20',
      matcher: (c: string) => /fashion|cloth|wear/i.test(c)
    },
    {
      id: 'repairs',
      name: 'Repairs & AC',
      icon: Wrench,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 text-cyan-600',
      activeStyle: 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25 border-cyan-600 ring-2 ring-cyan-500/20',
      matcher: (c: string) => /repair|plumb|ac|paint/i.test(c)
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50 text-purple-600',
      activeStyle: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border-purple-600 ring-2 ring-purple-500/20',
      matcher: (c: string) => /clean|care|maid/i.test(c)
    },
    {
      id: 'home',
      name: 'Kitchen',
      icon: Coffee,
      color: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-600',
      activeStyle: 'bg-amber-600 text-white shadow-md shadow-amber-500/25 border-amber-600 ring-2 ring-amber-500/20',
      matcher: (c: string) => /kitchen|home|living/i.test(c)
    },
    {
      id: 'salon',
      name: 'Salon & Spa',
      icon: Scissors,
      color: 'text-pink-600',
      bg: 'bg-pink-50 text-pink-600',
      activeStyle: 'bg-pink-600 text-white shadow-md shadow-pink-500/25 border-pink-600 ring-2 ring-pink-500/20',
      matcher: (c: string) => /salon|wellness|groom|spa/i.test(c)
    },
    {
      id: 'movers',
      name: 'Delivery',
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 text-indigo-600',
      activeStyle: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border-indigo-600 ring-2 ring-indigo-500/20',
      matcher: (c: string) => /mov|courier|deliver/i.test(c)
    }
  ];

  const getProductCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const currentMatcher = categoryPills.find((c) => c.id === selectedCategory)?.matcher || (() => true);

  const approvedProducts = products.filter((p) => p.approvalStatus === 'approved');
  const displayedProducts = approvedProducts.filter((p) => currentMatcher(p.category || p.title || ''));
  const displayedServices = services.filter((s) => currentMatcher(s.category || s.title || ''));
  const eligibleProviders = (providers || []).filter((p) => p && p.id);

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 animate-fade-in-up">
      {/* 1. Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white p-6 shadow-xl shadow-red-500/20 border border-white/10">
        <div className="relative z-10 space-y-3.5 max-w-[85%]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-amber-200 border border-white/15">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Fast Regional Delivery</span>
          </span>

          <h2 className="text-[22px] font-black tracking-tight leading-snug">
            Everything You Need,{' '}
            <span className="text-amber-200">Delivered to Your Door.</span>
          </h2>

          <p className="text-xs text-white/90 font-medium leading-relaxed">
            Authentic retail shopping & verified doorstep technicians in one unified app.
          </p>

          <div className="pt-1 flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 bg-white text-red-600 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Products</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-bold text-xs rounded-xl border border-white/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Book Services</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-4 -bottom-6 text-9xl opacity-15 pointer-events-none select-none">
          🛍️
        </div>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Category Navigation Rail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight">Categories</h3>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors active:scale-95 cursor-pointer border border-red-100"
              >
                <span>Reset</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Category Rail */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                className="flex flex-col items-center gap-1.5 min-w-[74px] flex-shrink-0 group cursor-pointer active:scale-95 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                    isSelected
                      ? cat.activeStyle
                      : `${cat.bg} border-slate-200/70 shadow-xs group-hover:scale-105 group-hover:shadow-sm`
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white stroke-[2.4]' : cat.color}`} />
                </div>
                <span
                  className={`text-[11px] text-center leading-tight transition-colors ${
                    isSelected ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Marketplace Products Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Marketplace Products</span>
              {selectedCategory !== 'all' && (
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                  {displayedProducts.length}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Verified local merchants & authentic brands</p>
          </div>
          {approvedProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-red-600 hover:text-red-700 active:scale-95 transition-all cursor-pointer"
            >
              See All
            </button>
          )}
        </div>

        {displayedProducts.length === 0 ? (
          /* Clean Empty Store Welcome State */
          <div className="bg-white rounded-3xl border border-slate-200/70 p-7 text-center shadow-card space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <Store className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">
                {selectedCategory !== 'all' ? 'No items in this category yet' : 'Store is Getting Ready'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {selectedCategory !== 'all'
                  ? 'Try selecting "All Orbit" or another category above.'
                  : 'Products will appear here once sellers list their items. Check back soon!'}
              </p>
            </div>
            {selectedCategory !== 'all' ? (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-5 py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Show All Categories
              </button>
            ) : user.activeRole === 'admin' || user.adminVerified ? (
              <button
                onClick={() => switchRole('admin')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Add First Product in Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('explore')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Services Instead</span>
              </button>
            )}
          </div>
        ) : (
          /* 2-Column Product Grid */
          <div className="grid grid-cols-2 gap-3.5">
            {displayedProducts.map((product) => {
              const qty = getProductCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-3xl border border-slate-200/75 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col cursor-pointer active:scale-[0.98] group"
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square bg-slate-50/90 p-3.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount badge */}
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                        {product.discountPercentage}% OFF
                      </span>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-transform border border-slate-200/60 cursor-pointer"
                      aria-label="Wishlist toggle"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.some((p) => p.id === product.id)
                            ? 'fill-rose-600 text-rose-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-semibold text-[11px]">({product.reviewsCount})</span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1.5 leading-snug">
                        {product.title}
                      </h4>
                    </div>

                    {/* Price & Add Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div>
                        <div className="text-sm font-black text-slate-900 tracking-tight">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-extrabold text-xs rounded-xl border border-red-200/90 transition-all active:scale-90 shadow-2xs cursor-pointer"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-red-600 text-white rounded-xl shadow-xs overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(product.id, qty - 1)}
                              className="p-1.5 hover:bg-red-700 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-black min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(product.id, qty + 1)}
                              className="p-1.5 hover:bg-red-700 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
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
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Doorstep Services</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Verified local specialists & certified technicians</p>
          </div>
          {onOpenMapRadius && (
            <button
              onClick={onOpenMapRadius}
              className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors active:scale-95 border border-red-200/70 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-red-600" />
              <span>Nearby Map</span>
            </button>
          )}
        </div>

        {displayedServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/70 p-7 text-center shadow-card space-y-2">
            <Wrench className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-900">
              {selectedCategory !== 'all' ? 'No services in this category' : 'Services Coming Soon'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {selectedCategory !== 'all'
                ? 'Try selecting another category above or check the full catalog.'
                : 'Certified plumbers, electricians, cleaners, and more will appear here once approved.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedServices.slice(0, 4).map((service) => (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className="bg-white rounded-3xl border border-slate-200/75 p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98]"
              >
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200/70">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{service.providerRating}</span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                    {service.title}
                  </h4>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <span className="text-xs text-slate-700 font-bold">By {service.providerName}</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-extrabold px-1.5 py-0.5 rounded">
                      ID: {service.issuedProviderId || service.providerId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {service.providerPhoneMasked || '+91 98XXX X3210'}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end flex-shrink-0">
                  <span className="text-base font-black text-slate-900">₹{service.price}</span>
                  <span className="text-[11px] text-slate-400 mb-2">{service.unit}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(service);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Verified Service Specialists Directory */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Service Specialists</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Approved &amp; active trade professionals</p>
          </div>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
          >
            <span>All Providers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {eligibleProviders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 text-center text-slate-400 text-xs font-medium shadow-card">
            Approved specialists will appear here after verification.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {eligibleProviders.slice(0, 4).map((prov) => {
              const targetId = prov.id?.toLowerCase();
              const targetIssued = prov.issuedProviderId?.toLowerCase();
              const targetUser = (prov as any).userId?.toLowerCase();
              const targetCategory = (prov.tradeCategory || prov.tradeTitle)?.toLowerCase();

              const matchedService = services.find((s) => {
                const pId = s.providerId?.toLowerCase();
                const pIssued = s.issuedProviderId?.toLowerCase();
                const pUser = (s as any).providerUserId?.toLowerCase();
                return (
                  (targetId && (pId === targetId || pIssued === targetId || pUser === targetId)) ||
                  (targetIssued && (pId === targetIssued || pIssued === targetIssued || pUser === targetIssued)) ||
                  (targetUser && (pId === targetUser || pIssued === targetUser || pUser === targetUser)) ||
                  (targetCategory && s.category?.toLowerCase() === targetCategory)
                );
              });

              const directService: Service = matchedService || {
                id: `svc_direct_${prov.id || 'prov'}`,
                title: `${prov.applicantName || prov.name} — Direct Service Visit`,
                category: prov.tradeCategory || prov.tradeTitle || 'Home Services',
                price: Number(prov.hourlyRate) || 299,
                unit: 'visit & inspection',
                pricingType: 'fixed',
                rateApprovalStatus: 'approved',
                hourlyRate: Number(prov.hourlyRate) || 299,
                meteredRate: 0,
                estimatedDurationHours: 1,
                requiresQuotation: false,
                approvedByAdmin: true,
                providerId: prov.id,
                providerUserId: (prov as any).userId || prov.id,
                issuedProviderId: prov.issuedProviderId || prov.id,
                providerName: prov.applicantName || prov.name,
                providerPhoneMasked: prov.phoneMasked || '+91 98XXX X3210',
                providerRating: prov.rating || 4.9,
                providerJobsCompleted: prov.jobsCompleted || 0,
                workPhotos: prov.portfolio?.map((p) => p.image) || [],
                modes: ['home_visit'],
                description: prov.bio || `Direct booking with verified specialist ${prov.applicantName || prov.name}. Doorstep visit, inspection, diagnostics & repair.`,
                cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
                availableSlots: [
                  '09:00 AM - 11:00 AM',
                  '11:30 AM - 01:30 PM',
                  '02:30 PM - 04:30 PM',
                  '05:00 PM - 07:00 PM'
                ],
                approvalStatus: 'approved'
              };

              return (
                <div
                  key={prov.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-card hover:shadow-card-hover transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prov.avatar}
                        alt={prov.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-xs text-slate-900 truncate">{prov.applicantName || prov.name}</h4>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                            ID: {prov.issuedProviderId || prov.id}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                          {prov.tradeTitle || prov.tradeCategory || 'Trade Specialist'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Available Today
                          </span>
                          <span className="text-slate-500 font-mono">{prov.phoneMasked || '+91 98XXX X3210'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl text-amber-700 font-extrabold text-xs flex-shrink-0 border border-amber-100">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{prov.rating}</span>
                    </div>
                  </div>

                  {/* Actions: View Profile & Book Directly */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openProviderProfile(prov.issuedProviderId || prov.id)}
                      className="py-2 px-2.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-extrabold text-xs transition-colors text-center cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectService(directService)}
                      className="py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Direct</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Special Custom Work Banner */}
      <div className="rounded-[28px] bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200/70 p-5 space-y-2.5 shadow-2xs">
        <span className="text-[11px] uppercase font-black tracking-wider text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block border border-amber-300/40">
          Custom Task Requests
        </span>
        <h4 className="text-sm font-extrabold text-slate-900">
          Need custom work or a non-standard project?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Submit your specs directly for verified contractor quotations from our admin team.
        </p>
        <button
          onClick={onOpenSpecialRequest}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Submit Custom Work Request
        </button>
      </div>

      {/* 7. Trust Row */}
      <div className="grid grid-cols-3 gap-2 py-4 px-2 bg-white rounded-3xl border border-slate-200/70 text-center text-xs font-bold text-slate-700 shadow-card">
        <div className="space-y-1.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
          <span className="block text-[11px] font-bold text-slate-700">100% Verified</span>
        </div>
        <div className="space-y-1.5 border-x border-slate-100">
          <Truck className="w-5 h-5 text-blue-500 mx-auto" />
          <span className="block text-[11px] font-bold text-slate-700">Direct Dispatch</span>
        </div>
        <div className="space-y-1.5">
          <Percent className="w-5 h-5 text-red-500 mx-auto" />
          <span className="block text-[11px] font-bold text-slate-700">Zero Hidden Fees</span>
        </div>
      </div>
    </div>
  );
};
