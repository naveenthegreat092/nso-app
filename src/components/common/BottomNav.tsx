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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-2xl border-t-2 border-slate-200 max-w-lg mx-auto safe-bottom shadow-[0_-6px_30px_rgba(15,23,42,0.1)]">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 relative group cursor-pointer"
              aria-label={item.label}
            >
              {/* Active high-contrast badge background */}
              {isActive && (
                <span className="absolute inset-x-1.5 top-0 bottom-0.5 rounded-2xl bg-red-100/90 border-2 border-red-300 -z-10 shadow-xs" />
              )}
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? 'text-red-600 stroke-[2.8] scale-110 drop-shadow-xs'
                      : 'text-slate-600 stroke-[2.2] group-hover:text-slate-900'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-3 bg-red-600 text-white font-black text-xs min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white shadow-md px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-xs mt-1 tracking-tight transition-colors ${
                  isActive ? 'text-red-700 font-black text-xs scale-105' : 'text-slate-700 font-extrabold group-hover:text-slate-900'
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
