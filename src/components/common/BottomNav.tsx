import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, Sparkles, ShoppingBag, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, bookings, t } = useApp();

  const totalActiveOrders =
    orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length +
    bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length;

  const navItems = [
    { id: 'home' as const, label: t('nav.home', 'Home'), icon: Home },
    { id: 'explore' as const, label: t('nav.explore', 'Explore'), icon: Compass },
    { id: 'ask_nso' as const, label: t('nav.ask_nso', 'Ask NSO'), icon: Sparkles, isSpecial: true },
    { id: 'orders' as const, label: t('nav.orders', 'Orders'), icon: ShoppingBag, badge: totalActiveOrders },
    { id: 'account' as const, label: t('nav.account', 'Account'), icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center -mt-6 group"
                aria-label={item.label}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white shadow-red-500/40 ring-4 ring-red-100 scale-105'
                      : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-slate-900/30 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2] animate-pulse-subtle" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-extrabold tracking-tight ${
                    isActive ? 'text-red-600' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 relative"
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-red-600 stroke-[2.5]'
                      : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-red-600 font-black' : 'text-slate-500 font-semibold'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-600 mt-0.5 animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
