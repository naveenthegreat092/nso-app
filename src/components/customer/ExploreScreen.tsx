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
  Package
} from 'lucide-react';

export const ExploreScreen: React.FC<{
  onSelectProduct: (p: Product) => void;
  onSelectService: (s: Service) => void;
  onOpenMapRadius?: () => void;
}> = ({ onSelectProduct, onSelectService, onOpenMapRadius }) => {
  const {
    products,
    services,
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

  const productCategories = ['Electronics', 'Fashion', 'Home & Living', 'Groceries'];
  const serviceCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Salon & Spa'];
  const allCategories = ['All', ...productCategories, ...serviceCategories];

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
          className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200/60 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-xs"
        />
      </div>

      {/* Type Filter Pills + Map View Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          {(['all', 'products', 'services'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 py-2 rounded-xl transition-all capitalize text-center ${
                filterType === t
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'all' ? 'All Catalog' : t}
            </button>
          ))}
        </div>

        {onOpenMapRadius && (
          <button
            onClick={onOpenMapRadius}
            className="px-3 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 transition-all flex items-center gap-1.5 font-bold text-xs active:scale-95"
            title="Open Specialist Radius Map"
          >
            <Compass className="w-4 h-4 text-red-600" />
            <span>Map</span>
          </button>
        )}
      </div>

      {/* Horizontal Category Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/60 space-y-3 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-black text-slate-800">No items found</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
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
                  className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-98 group"
                >
                  <div className="relative aspect-square bg-slate-50 p-3 flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    />

                    {p.discountPercentage > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                        {p.discountPercentage}% OFF
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xs"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.some((w) => w.id === p.id)
                            ? 'fill-rose-600 text-rose-600'
                            : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1 leading-snug">
                        {p.title}
                      </h5>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm font-black text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs rounded-xl border border-red-200 transition-all"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-red-600 text-white rounded-xl shadow-sm overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(p.id, qty - 1)}
                              className="p-1.5 hover:bg-red-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-black min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(p.id, qty + 1)}
                              className="p-1.5 hover:bg-red-700"
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
                className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {s.category}
                    </span>
                    <div className="flex items-center gap-0.5 text-xs text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{s.providerRating}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{s.title}</h4>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openProviderProfile(s.providerId);
                    }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <p className="text-xs text-slate-500 font-medium hover:text-red-600">{s.providerName}</p>
                    <span className="text-[10px] text-blue-600 font-bold hover:underline">Profile ↗</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end flex-shrink-0">
                  <span className="text-base font-black text-slate-900">₹{s.price}</span>
                  <p className="text-[10px] text-slate-400">{s.unit}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(s);
                    }}
                    className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95"
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
