import React, { useState } from 'react';
import { Order, Booking } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Filter,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Calendar,
  Check,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PaymentTrackerProps {
  orders: Order[];
  bookings: Booking[];
  onUpdateOrderPayment: (orderId: string, status: 'success' | 'pending' | 'failed' | 'refunded') => void;
  onUpdateBookingPayment: (bookingId: string, status: 'success' | 'pending' | 'failed' | 'refunded') => void;
  showToast: (msg: string) => void;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  orders,
  bookings,
  onUpdateOrderPayment,
  onUpdateBookingPayment,
  showToast
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('pending');
  const [categoryTab, setCategoryTab] = useState<'all' | 'orders' | 'bookings'>('all');

  // Summary figures
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const pendingBookings = bookings.filter((b) => b.paymentStatus === 'pending');
  const pendingTotal =
    pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0) +
    pendingBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const confirmedOrders = orders.filter((o) => o.paymentStatus === 'success');
  const confirmedBookings = bookings.filter((b) => b.paymentStatus === 'success');
  const confirmedTotal =
    confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0) +
    confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Filtered orders & bookings
  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.paymentStatus === filter;
  });

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.paymentStatus === filter;
  });

  const handleMarkOrderPaid = (order: Order) => {
    onUpdateOrderPayment(order.id, 'success');
    showToast(`✅ Payment confirmed for ${order.orderNumber} (₹${order.total})`);
  };

  const handleMarkOrderFailed = (order: Order) => {
    onUpdateOrderPayment(order.id, 'failed');
    showToast(`❌ Payment marked as Failed for ${order.orderNumber}`);
  };

  const handleMarkBookingPaid = (booking: Booking) => {
    onUpdateBookingPayment(booking.id, 'success');
    showToast(`✅ Payment confirmed for ${booking.bookingNumber} (₹${booking.totalPrice})`);
  };

  const handleMarkBookingFailed = (booking: Booking) => {
    onUpdateBookingPayment(booking.id, 'failed');
    showToast(`❌ Payment marked as Failed for ${booking.bookingNumber}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid & Verified
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Awaiting Verification
          </span>
        );
      case 'failed':
        return (
          <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Refunded
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
            {status}
          </span>
        );
    }
  };

  const totalItemsCount =
    (categoryTab !== 'bookings' ? filteredOrders.length : 0) +
    (categoryTab !== 'orders' ? filteredBookings.length : 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner Summary */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3.5 border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-amber-800">Pending Approvals</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-amber-950">₹{pendingTotal.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">
              {pendingOrders.length + pendingBookings.length} pending UPI transfers
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3.5 border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-emerald-800">Verified Paid</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-emerald-950">₹{confirmedTotal.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
              {confirmedOrders.length + confirmedBookings.length} confirmed transactions
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        {/* Status filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
          {(
            [
              { key: 'pending', label: `Pending (${pendingOrders.length + pendingBookings.length})` },
              { key: 'success', label: `Confirmed (${confirmedOrders.length + confirmedBookings.length})` },
              { key: 'failed', label: 'Failed' },
              { key: 'all', label: `All (${orders.length + bookings.length})` }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                filter === tab.key ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'All Payments' },
            { key: 'orders', label: `Orders (${filteredOrders.length})` },
            { key: 'bookings', label: `Services (${filteredBookings.length})` }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryTab(cat.key as any)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                categoryTab === cat.key
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {totalItemsCount === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-150 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="text-xs font-black text-slate-800">No Payments Matching Filter</h4>
            <p className="text-[11px] text-slate-500">
              {filter === 'pending'
                ? 'All customer UPI payments are currently verified and clear.'
                : 'No transaction records found in this category.'}
            </p>
          </div>
        ) : null}

        {/* Orders List */}
        {categoryTab !== 'bookings' &&
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-mono font-black text-slate-900 block leading-tight">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{ord.createdAt}</span>
                  </div>
                </div>
                {getStatusBadge(ord.paymentStatus)}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {ord.customerName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-slate-800 text-[11px] font-mono">
                    {ord.paymentMethod || 'UPI (Direct)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Total Order Amount:</span>
                  <span className="text-sm font-black text-slate-900">₹{ord.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Items Summary */}
              {ord.items && ord.items.length > 0 && (
                <div className="text-[11px] text-slate-500 font-medium">
                  Items: <span className="text-slate-700">{ord.items.map((it) => it.title).join(', ')}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {ord.paymentStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleMarkOrderPaid(ord)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Received</span>
                    </button>
                    <button
                      onClick={() => handleMarkOrderFailed(ord)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Mark Failed</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Status: <strong className="text-slate-700 uppercase font-mono">{ord.paymentStatus}</strong>
                    </span>
                    <button
                      onClick={() => onUpdateOrderPayment(ord.id, ord.paymentStatus === 'success' ? 'pending' : 'success')}
                      className="text-[10px] text-purple-700 font-bold underline hover:text-purple-900"
                    >
                      Toggle to {ord.paymentStatus === 'success' ? 'Pending' : 'Success'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        {/* Bookings List */}
        {categoryTab !== 'orders' &&
          filteredBookings.map((bkg) => (
            <div
              key={bkg.id}
              className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-mono font-black text-slate-900 block leading-tight">
                      {bkg.bookingNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{bkg.createdAt}</span>
                  </div>
                </div>
                {getStatusBadge(bkg.paymentStatus)}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Service:</span>
                  <span className="font-bold text-slate-800 text-[11px] line-clamp-1">{bkg.serviceTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-800 text-[11px]">{bkg.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Specialist:</span>
                  <span className="font-bold text-slate-800 text-[11px]">{bkg.providerName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Service Fee:</span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{bkg.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {bkg.paymentStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleMarkBookingPaid(bkg)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Received</span>
                    </button>
                    <button
                      onClick={() => handleMarkBookingFailed(bkg)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Mark Failed</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Status: <strong className="text-slate-700 uppercase font-mono">{bkg.paymentStatus}</strong>
                    </span>
                    <button
                      onClick={() => onUpdateBookingPayment(bkg.id, bkg.paymentStatus === 'success' ? 'pending' : 'success')}
                      className="text-[10px] text-purple-700 font-bold underline hover:text-purple-900"
                    >
                      Toggle to {bkg.paymentStatus === 'success' ? 'Pending' : 'Success'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
