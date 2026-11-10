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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-t border-slate-200/80 max-w-lg mx-auto safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-0.5 px-4 rounded-2xl transition-all duration-200 active:scale-90 relative group"
              aria-label={item.label}
            >
              {/* Active background pill */}
              {isActive && (
                <span className="absolute inset-x-0.5 top-0.5 h-8 rounded-xl bg-red-50 -z-10" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-red-600 stroke-[2.5] scale-110'
                      : 'text-slate-400 stroke-[1.8] group-hover:text-slate-600'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm px-0.5">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-bold transition-colors ${
                  isActive ? 'text-red-600' : 'text-slate-400'
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
