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
    <div className="fixed bottom-[64px] left-0 right-0 z-35 px-3 max-w-md mx-auto pointer-events-none animate-in slide-in-from-bottom-3 duration-200">
      <div
        onClick={onOpenCart}
        className="pointer-events-auto bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl p-2.5 pl-3.5 shadow-xl shadow-red-600/30 border border-white/20 flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-100">
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-sm font-black text-white">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-white/80 font-medium truncate max-w-[170px]">
              {cart[0]?.product.title}
              {cart.length > 1 ? ` +${cart.length - 1} more` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white text-red-600 font-black text-xs px-3 py-2 rounded-xl shadow-md">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
