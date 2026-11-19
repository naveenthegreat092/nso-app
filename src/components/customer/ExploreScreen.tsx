import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Service } from '../../types';
import {
  Search,
  Star,
  ShoppingBag,
  Wrench,
  Plus,
  Minus,
  Compass,
  Heart,
  Package,
  Layers,
  Headphones,
  Shirt,
  ShoppingBasket,
  Home,
  Sparkles,
  Scissors,
  Car,
  BookOpen,
  UtensilsCrossed,
  Briefcase,
  Stethoscope,
  ShieldCheck,
  Plane,
  MapPin,
  X
} from 'lucide-react';

export const ExploreScreen: React.FC<{
  onSelectProduct: (p: Product) => void;
  onSelectService: (s: Service) => void;
  onOpenMapRadius?: () => void;
}> = ({ onSelectProduct, onSelectService, onOpenMapRadius }) => {
  const {
    products,
    services,
    serviceCategories: appServiceCategories,
    addToCart,
    updateCartQuantity,
    cart,
    openProviderProfile,
    wishlist,
    toggleWishlist
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'products' | 'services'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const productCategories = ['Groceries', 'Electronics', 'Fashion', 'Home & Living'];
  const dynamicServiceCatNames = appServiceCategories?.map((c) => c.name) || ['Home repairs', 'Home care', 'Moving and delivery'];
  const allCategories = ['All', ...productCategories, ...dynamicServiceCatNames];

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower === 'all') return Layers;
    if (lower.includes('grocer')) return ShoppingBasket;
    if (lower.includes('electr')) return Headphones;
    if (lower.includes('fashion') || lower.includes('cloth')) return Shirt;
    if (lower.includes('repair') || lower.includes('plumb') || lower.includes('construct') || lower.includes('design')) return Wrench;
    if (lower.includes('clean') || lower.includes('care') || lower.includes('housekeep')) return Sparkles;
    if (lower.includes('kitchen') || lower.includes('home') || lower.includes('living')) return Home;
    if (lower.includes('salon') || lower.includes('spa') || lower.includes('wellness') || lower.includes('beauty')) return Scissors;
    if (lower.includes('mov') || lower.includes('deliver') || lower.includes('transport') || lower.includes('courier')) return Package;
    if (lower.includes('vehicle') || lower.includes('car') || lower.includes('cab')) return Car;
    if (lower.includes('educat') || lower.includes('tutor') || lower.includes('class')) return BookOpen;
    if (lower.includes('food') || lower.includes('cook') || lower.includes('chef') || lower.includes('meal')) return UtensilsCrossed;
    if (lower.includes('profess') || lower.includes('legal') || lower.includes('tax') || lower.includes('help')) return Briefcase;
    if (lower.includes('health') || lower.includes('medic') || lower.includes('doctor')) return Stethoscope;
    if (lower.includes('secur') || lower.includes('guard')) return ShieldCheck;
    if (lower.includes('travel') || lower.includes('hotel') || lower.includes('flight')) return Plane;
    if (lower.includes('local') || lower.includes('other')) return MapPin;
    return Wrench;
  };

  const getProductCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const filteredProducts = products.filter((p) => {
    const isApproved = p.approvalStatus === 'approved';
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return isApproved && matchesSearch && matchesCat && (filterType === 'all' || filterType === 'products');
  });

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat && (filterType === 'all' || filterType === 'services');
  });

  const totalResults =
    (filterType !== 'services' ? filteredProducts.length : 0) +
    (filterType !== 'products' ? filteredServices.length : 0);

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 animate-fade-in-up">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, brands, or doorstep services..."
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/80 shadow-2xs transition-all text-slate-900 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type Filter Pills + Map View Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex bg-slate-100/90 p-1 rounded-2xl text-xs font-extrabold border border-slate-200/60 shadow-2xs">
          {(['all', 'products', 'services'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 py-2 rounded-xl transition-all capitalize text-center cursor-pointer ${
                filterType === t
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 font-bold'
              }`}
            >
              {t === 'all' ? 'All Catalog' : t}
            </button>
          ))}
        </div>

        {onOpenMapRadius && (
          <button
            onClick={onOpenMapRadius}
            className="px-3.5 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/70 transition-all flex items-center gap-1.5 font-extrabold text-xs active:scale-95 shadow-2xs cursor-pointer"
            title="Open Specialist Radius Map"
          >
            <Compass className="w-4 h-4 text-red-600" />
            <span>Map</span>
          </button>
        )}
      </div>

      {/* Horizontal Category Strip with Vector Icons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {allCategories.map((cat) => {
          const Icon = getCategoryIcon(cat);
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/70 shadow-card space-y-3 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
            <Package className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">No items found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {(filterType === 'all' || filterType === 'products') && filteredProducts.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Products ({filteredProducts.length})
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {filteredProducts.map((p) => {
              const qty = getProductCartQuantity(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-white rounded-3xl border border-slate-200/75 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col cursor-pointer active:scale-98 group"
                >
                  <div className="relative aspect-square bg-slate-50/90 p-3.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />

                    {p.discountPercentage > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                        {p.discountPercentage}% OFF
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-2xs border border-slate-200/60 cursor-pointer"
                      aria-label="Wishlist toggle"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.some((w) => w.id === p.id)
                            ? 'fill-rose-600 text-rose-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1 leading-snug">
                        {p.title}
                      </h5>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="text-sm font-black text-slate-900 tracking-tight">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200/90 transition-all cursor-pointer"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-red-600 text-white rounded-xl shadow-2xs overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(p.id, qty - 1)}
                              className="p-1.5 hover:bg-red-700 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-black min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(p.id, qty + 1)}
                              className="p-1.5 hover:bg-red-700 cursor-pointer"
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
        </div>
      )}

      {/* Services List */}
      {(filterType === 'all' || filterType === 'services') && filteredServices.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Services ({filteredServices.length})
            </h4>
          </div>

          <div className="space-y-3">
            {filteredServices.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectService(s)}
                className="bg-white rounded-3xl border border-slate-200/75 p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
              >
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200/70">
                      {s.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{s.providerRating}</span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{s.title}</h4>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openProviderProfile(s.providerId);
                    }}
                    className="flex items-center gap-2 pt-0.5 flex-wrap cursor-pointer"
                  >
                    <p className="text-xs text-slate-700 font-bold hover:text-red-600">{s.providerName}</p>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-extrabold px-1.5 py-0.5 rounded">
                      ID: {s.issuedProviderId || s.providerId}
                    </span>
                    <span className="text-xs text-blue-600 font-extrabold hover:underline">Profile ↗</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end flex-shrink-0">
                  {s.pricingType === 'hourly' ? (
                    <>
                      <span className="text-base font-black text-slate-900">₹{s.hourlyRate || s.price}</span>
                      <p className="text-[11px] text-indigo-700 font-extrabold">/ hour</p>
                    </>
                  ) : s.pricingType === 'quotation_required' ? (
                    <span className="text-[11px] font-extrabold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg">
                      Free Quote
                    </span>
                  ) : (
                    <>
                      <span className="text-base font-black text-slate-900">₹{s.price}</span>
                      <p className="text-[11px] text-slate-500 font-medium">{s.unit}</p>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(s);
                    }}
                    className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
