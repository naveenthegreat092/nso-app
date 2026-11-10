import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant } from '../../types';
import {
  X,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  Share2,
  Heart,
  Zap,
  MapPin,
  ChevronRight,
  Info,
  Sparkles,
  ThumbsUp
} from 'lucide-react';

export const ProductDetailModal: React.FC<{
  product: Product;
  onClose: () => void;
  onOpenCheckoutDirect: (product: Product, quantity: number, variant?: ProductVariant) => void;
}> = ({ product, onClose, onOpenCheckoutDirect }) => {
  const {
    addToCart,
    showToast,
    setActiveTab,
    wishlist,
    toggleWishlist,
    selectedAddress,
    openAddressModal
  } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const isLiked = wishlist.some((p) => p.id === product.id);

  const priceWithVariant = product.price + (selectedVariant?.priceModifier || 0);
  const originalWithVariant = product.originalPrice + (selectedVariant?.priceModifier || 0);
  const totalSavings = originalWithVariant - priceWithVariant;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant?.id);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant?.id);
    onOpenCheckoutDirect(product, quantity, selectedVariant);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Floating Control Bar */}
        <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg"
          />

          {/* Action buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md">
              {product.discountPercentage}% OFF
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleWishlist(product);
                  showToast(isLiked ? 'Removed from Wishlist' : 'Saved to Wishlist');
                }}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-700'}`} />
              </button>
              <button
                onClick={() => {
                  try {
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                    showToast('Link copied to clipboard!');
                  } catch {
                    showToast('Share link: ' + window.location.href);
                  }
                }}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90"
              >
                <Share2 className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Scroll Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title & Ratings */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h2>

            {/* Price section with savings pill */}
            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-slate-950">
                ₹{priceWithVariant.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 line-through font-semibold">
                ₹{originalWithVariant.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Save ₹{totalSavings.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Inclusive of all taxes & regional warranties</p>
          </div>

          {/* Delivery speed box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 min-w-0">
                <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="truncate">Deliver to {selectedAddress.title}</span>
              </div>
              <button
                onClick={openAddressModal}
                className="text-[10px] text-red-600 font-extrabold hover:underline flex-shrink-0 ml-2"
              >
                Change
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 pl-6">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong className="text-emerald-700">
                  {product.regionalDeliveryFee === 0 ? 'FREE Express Delivery' : `Delivery at ₹${product.regionalDeliveryFee}`}
                </strong>{' '}
                in {product.deliveryEstimateDays} business days
              </span>
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-800">Select Option:</span>
                <span className="text-slate-500 font-bold">{selectedVariant?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={!v.inStock}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariant.id === v.id
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm ring-2 ring-red-100'
                        : v.inStock
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                    }`}
                  >
                    {v.name} {v.priceModifier ? `(+₹${v.priceModifier})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-2 border-y border-slate-100">
            <span className="text-xs font-extrabold text-slate-800">Quantity</span>
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-slate-600 hover:text-red-600 active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-slate-600 hover:text-red-600 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="grid grid-cols-3 gap-2 py-2 text-center text-[10px] font-bold text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <span>100% Genuine</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <RotateCcw className="w-4 h-4 text-amber-600 mx-auto" />
              <span>7 Days Return</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <Store className="w-4 h-4 text-blue-600 mx-auto" />
              <span>Verified Seller</span>
            </div>
          </div>

          {/* Seller Attribution Card */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sold & Fulfilled by</span>
              <span className="font-extrabold text-slate-900">{product.sellerName}</span>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              GST Verified
            </span>
          </div>

          {/* Product Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900">Key Features & Highlights</h4>
            <ul className="space-y-1.5">
              {product.highlights.map((h, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Customer Reviews & Breakdown (Amazon Style) */}
          <div className="space-y-3 pt-2 border-t border-slate-150">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">Verified Customer Reviews</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-900">{product.rating} out of 5</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {product.reviewsCount} Global Ratings
              </span>
            </div>

            {/* Rating distribution bars */}
            <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-6">5 star</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[84%]" />
                </div>
                <span className="w-6 text-right">84%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6">4 star</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[12%]" />
                </div>
                <span className="w-6 text-right">12%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6">3 star</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[4%]" />
                </div>
                <span className="w-6 text-right">4%</span>
              </div>
            </div>

            {/* Top Review Excerpts */}
            <div className="space-y-2 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-slate-900">Arun V.</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-100/70 font-bold px-1.5 py-0.2 rounded">
                    Verified Purchase
                  </span>
                </div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  "Exceeded expectations! Build quality is top-notch and arrived in pristine sealed condition within 2 days."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 border-t border-slate-150 bg-white grid grid-cols-2 gap-2.5 shadow-lg">
          <button
            onClick={handleAddToCart}
            className="py-3 px-4 rounded-2xl border-2 border-red-600 text-red-600 hover:bg-red-50 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <span>Proceed to Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
