import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  Wrench,
  ShieldAlert,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'service' | 'promo' | 'admin';
  isRead: boolean;
  actionText?: string;
  actionPayload?: string;
}

export const NotificationTrayModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
}> = ({ isOpen, onClose, onOpenOrders }) => {
  const { openTracking, openChat, showToast } = useApp();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Technician Assigned',
      message: 'Ramesh Kumar is en route for AC Deep Cleaning. ETA is 14 minutes.',
      time: 'Just now',
      type: 'service',
      isRead: false,
      actionText: 'Track Live'
    },
    {
      id: 'n2',
      title: 'Order Confirmed & Packed',
      message: 'Orbit Retail has packed your order #NSO-ORD-84920. Shipped soon.',
      time: '12m ago',
      type: 'order',
      isRead: false,
      actionText: 'View Order'
    },
    {
      id: 'n3',
      title: '₹150 Festive Discount Unlocked',
      message: 'Apply coupon code NSOFIRST at checkout for ₹150 off your cart.',
      time: '1h ago',
      type: 'promo',
      isRead: true
    },
    {
      id: 'n4',
      title: 'Admin Verification Notice',
      message: 'Your service specialist background check was renewed and verified.',
      time: '3h ago',
      type: 'admin',
      isRead: true
    }
  ]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast('Notifications cleared');
  };

  const handleAction = (item: NotificationItem) => {
    onClose();
    if (item.type === 'service') {
      openTracking('AC Deep Cleaning', 'Ramesh Kumar', 'technician');
    } else if (item.type === 'order') {
      onOpenOrders();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end items-start p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white sm:rounded-3xl shadow-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Notifications</h3>
              <p className="text-[10px] text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <button
              onClick={handleMarkAllRead}
              className="hover:text-red-600 transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={handleClearAll}
              className="text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-600">No notifications right now</p>
            </div>
          ) : (
            notifications.map((n) => {
              const getIcon = () => {
                switch (n.type) {
                  case 'service':
                    return <Wrench className="w-4 h-4 text-amber-600" />;
                  case 'order':
                    return <Truck className="w-4 h-4 text-blue-600" />;
                  case 'promo':
                    return <Sparkles className="w-4 h-4 text-red-600" />;
                  case 'admin':
                    return <ShieldAlert className="w-4 h-4 text-purple-600" />;
                }
              };

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    !n.isRead
                      ? 'bg-red-50/40 border-red-200/70 shadow-sm'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-white shadow-xs flex-shrink-0 mt-0.5">
                      {getIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {n.message}
                      </p>

                      {n.actionText && (
                        <button
                          onClick={() => handleAction(n)}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-red-600 hover:text-red-700 bg-red-100/70 px-2 py-1 rounded-lg"
                        >
                          <span>{n.actionText}</span>
                          <ArrowRight className="w-3 h-3 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
