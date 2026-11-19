import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, bookings, t } = useApp();

  const totalActiveOrders =
    orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length +
    bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length;

  const navItems = [
    { id: 'home' as const, label: t('nav.home', 'Home'), icon: Home },
    { id: 'explore' as const, label: t('nav.explore', 'Explore'), icon: Compass },
    { id: 'orders' as const, label: t('nav.orders', 'Orders'), icon: ShoppingBag, badge: totalActiveOrders },
    { id: 'account' as const, label: t('nav.account', 'Account'), icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/70 max-w-lg mx-auto safe-bottom shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-around px-3 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 active:scale-95 relative group cursor-pointer"
              aria-label={item.label}
            >
              {/* Active subtle aura */}
              {isActive && (
                <span className="absolute inset-x-2 top-0.5 bottom-1 rounded-2xl bg-red-50/80 border border-red-100/60 -z-10 shadow-xs" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-red-600 stroke-[2.4] scale-105'
                      : 'text-slate-400 stroke-[1.8] group-hover:text-slate-700'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white font-extrabold text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center border-2 border-white shadow-sm px-0.5">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight transition-colors ${
                  isActive ? 'text-red-600 font-extrabold' : 'text-slate-500 font-semibold group-hover:text-slate-800'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
