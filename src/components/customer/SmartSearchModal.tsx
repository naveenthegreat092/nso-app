import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Service } from '../../types';
import {
  X,
  Search,
  Mic,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Package,
  Wrench,
  Star,
  Plus,
  Minus,
  ShieldCheck
} from 'lucide-react';

export const SmartSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onSelectService: (s: Service) => void;
}> = ({ isOpen, onClose, onSelectProduct, onSelectService }) => {
  const { products, services, cart, addToCart, updateCartQuantity, openProviderProfile, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'services'>('all');
  const [isListening, setIsListening] = useState(false);

  const recentSearches = [
    'ANC Earbuds',
    'AC Deep Cleaning',
    'Cold Pressed Oil',
    'Plumber & Leakage',
    'Home Sanitization'
  ];

  const trendingTags = [
    '⚡ 10-Min Essentials',
    '🔧 Urgent Electrician',
    '🎧 Wireless Audio',
    '🧹 Deep Housekeeping'
  ];

  const handleVoiceSearch = () => {
    setIsListening(true);
    showToast('🎤 Listening... (Speak now)');
    setTimeout(() => {
      setIsListening(false);
      setQuery('Earbuds');
      showToast('Detected: "Earbuds"');
    }, 1500);
  };

  // Filter products and services based on query
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, query]);

  const filteredServices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.providerName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [services, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col h-[92vh] max-h-[850px] overflow-hidden">
        {/* Search Header Bar */}
        <div className="p-3.5 border-b border-slate-150 bg-white space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-2xl border border-slate-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, brands, or verified services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1 rounded-full transition-colors ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-red-600'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Filter Pills */}
          {query.trim() && (
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                  filterType === 'all'
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                All ({filteredProducts.length + filteredServices.length})
              </button>
              <button
                onClick={() => setFilterType('products')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                  filterType === 'products'
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                Products ({filteredProducts.length})
              </button>
              <button
                onClick={() => setFilterType('services')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                  filterType === 'services'
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                Services ({filteredServices.length})
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            /* Recent Searches & Trending */
            <div className="space-y-5">
              {/* Recent Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>{s}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>Trending on NSO</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t.replace(/^[^\w\s]+/, '').trim())}
                      className="px-3 py-1.5 bg-red-50/70 border border-red-200/60 hover:bg-red-100 text-red-900 rounded-xl text-xs font-bold transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Filter Results */
            <div className="space-y-5">
              {filteredProducts.length === 0 && filteredServices.length === 0 && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Search className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No matches for "{query}"</p>
                  <p className="text-xs text-slate-500">Try searching for "Earbuds", "AC", "Oil", or "Clean"</p>
                </div>
              )}

              {/* Products Section */}
              {(filterType === 'all' || filterType === 'products') && filteredProducts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>Physical Products ({filteredProducts.length})</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {filteredProducts.map((product) => {
                      const inCart = cart.find((item) => item.product.id === product.id);
                      return (
                        <div
                          key={product.id}
                          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                        >
                          <div
                            onClick={() => {
                              onClose();
                              onSelectProduct(product);
                            }}
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 rounded-xl object-cover bg-white flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-900 truncate">
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-black text-slate-900">
                                  ₹{product.price}
                                </span>
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  {product.discountPercentage}% OFF
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Blinkit Add / Stepper */}
                          <div className="flex-shrink-0">
                            {inCart ? (
                              <div className="flex items-center bg-red-600 text-white rounded-xl shadow-md overflow-hidden text-xs font-black">
                                <button
                                  onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                                  className="p-1 hover:bg-red-700"
                                >
                                  <Minus className="w-3 h-3 stroke-[3]" />
                                </button>
                                <span className="px-2">{inCart.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                                  className="p-1 hover:bg-red-700"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product, 1)}
                                className="px-3 py-1.5 bg-white border border-red-600 text-red-600 hover:bg-red-50 text-xs font-black rounded-xl shadow-sm transition-all"
                              >
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {(filterType === 'all' || filterType === 'services') && filteredServices.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verified Specialists ({filteredServices.length})</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded tracking-wider">
                              {service.category}
                            </span>
                            <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                              {service.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                              <span className="font-semibold text-slate-800">{service.providerName}</span>
                              <div className="flex items-center gap-0.5 text-amber-600 font-extrabold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{service.providerRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-red-600 block">
                              ₹{service.price}
                            </span>
                            <span className="text-[10px] text-slate-400">/{service.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={() => {
                              onClose();
                              openProviderProfile(service.providerId);
                            }}
                            className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onSelectService(service);
                            }}
                            className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
