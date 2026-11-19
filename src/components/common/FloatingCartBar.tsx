import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC<{
  onOpenCart: () => void;
}> = ({ onOpenCart }) => {
  const { cart, user } = useApp();

  if (user.activeRole !== 'customer' || cart.length === 0) {
    return null;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.product.price + (item.selectedVariant?.priceModifier || 0)) * item.quantity,
    0
  );

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-35 px-4 max-w-lg mx-auto pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
      <div
        onClick={onOpenCart}
        className="pointer-events-auto bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white rounded-2xl p-3 pl-4 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.45)] border-2 border-amber-400/40 flex items-center justify-between cursor-pointer hover:border-amber-400 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center backdrop-blur-md relative flex-shrink-0 border border-amber-400/40">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-sm font-black text-amber-300 tracking-tight">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-white/90 font-medium truncate max-w-[190px]">
              {cart[0]?.product.title}
              {cart.length > 1 ? ` +${cart.length - 1} more` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-amber-500/25 flex-shrink-0 hover:brightness-105 transition-all">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>
    </div>
  );
};
