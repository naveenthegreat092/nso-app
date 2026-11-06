import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';

export const WishlistModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}> = ({ isOpen, onClose, onSelectProduct }) => {
  const { wishlist, toggleWishlist, addToCart, showToast } = useApp();

  if (!isOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product);
    showToast(`Moved "${product.title}" to Cart!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-150 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">My Wishlist</h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Heart className="w-12 h-12 mx-auto text-slate-300 stroke-[1.2]" />
              <p className="text-sm font-bold text-slate-700">Your wishlist is empty</p>
              <p className="text-xs text-slate-500">Tap the heart icon on any product to save it here.</p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Browse Products
              </button>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
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
                    className="w-14 h-14 rounded-xl object-cover bg-white flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{product.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-black text-slate-900 text-sm">₹{product.price}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 rounded">
                        {product.discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-extrabold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
