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
        className="pointer-events-auto bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-3 pl-4 shadow-[0_12px_32px_-4px_rgba(225,29,72,0.38)] border border-white/20 flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md relative flex-shrink-0 border border-white/20">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-100">
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-sm font-black text-white tracking-tight">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-white/90 font-medium truncate max-w-[190px]">
              {cart[0]?.product.title}
              {cart.length > 1 ? ` +${cart.length - 1} more` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white text-red-600 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md flex-shrink-0 group-hover:bg-slate-50 transition-colors">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
