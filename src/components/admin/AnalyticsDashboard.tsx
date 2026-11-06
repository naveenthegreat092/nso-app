import React from 'react';
import { Order, Booking, Product } from '../../types';
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  IndianRupee,
  Package,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface AnalyticsDashboardProps {
  orders: Order[];
  bookings: Booking[];
  products: Product[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  orders,
  bookings,
  products
}) => {
  // Revenue Calculations
  const paidOrders = orders.filter((o) => o.paymentStatus === 'success');
  const paidBookings = bookings.filter((b) => b.paymentStatus === 'success');

  const ordersRevenue = paidOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const bookingsRevenue = paidBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalRevenue = ordersRevenue + bookingsRevenue;

  const totalOrdersCount = orders.length;
  const totalBookingsCount = bookings.length;
  const aov = paidOrders.length > 0 ? Math.round(ordersRevenue / paidOrders.length) : 0;

  // Last 7 days revenue calculation
  const last7Days: { dateStr: string; label: string; amount: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    // sum paid orders + bookings on dateStr
    const dayOrderRev = paidOrders
      .filter((o) => o.createdAt && o.createdAt.startsWith(dateStr))
      .reduce((acc, o) => acc + o.total, 0);
    const dayBookingRev = paidBookings
      .filter((b) => b.createdAt && b.createdAt.startsWith(dateStr))
      .reduce((acc, b) => acc + b.totalPrice, 0);

    last7Days.push({
      dateStr,
      label,
      amount: dayOrderRev + dayBookingRev
    });
  }

  const maxDayAmount = Math.max(...last7Days.map((d) => d.amount), 1000);

  // Top Products calculation
  const productSalesMap: { [id: string]: { title: string; image?: string; units: number; revenue: number } } = {};
  orders.forEach((ord) => {
    ord.items?.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          title: item.title,
          image: item.image,
          units: 0,
          revenue: 0
        };
      }
      productSalesMap[item.productId].units += item.quantity || 1;
      productSalesMap[item.productId].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Order Status distribution
  const orderStatuses = [
    { key: 'confirmed', label: 'Confirmed', count: orders.filter((o) => o.orderStatus === 'confirmed').length, color: 'text-blue-600 bg-blue-50' },
    { key: 'packed', label: 'Packed', count: orders.filter((o) => o.orderStatus === 'packed').length, color: 'text-purple-600 bg-purple-50' },
    { key: 'shipped', label: 'Shipped', count: orders.filter((o) => o.orderStatus === 'shipped').length, color: 'text-indigo-600 bg-indigo-50' },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter((o) => o.orderStatus === 'out_for_delivery').length, color: 'text-amber-600 bg-amber-50' },
    { key: 'delivered', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'delivered').length, color: 'text-emerald-600 bg-emerald-50' },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'cancelled').length, color: 'text-rose-600 bg-rose-50' }
  ];

  // Payment Status distribution
  const paymentStatuses = [
    { label: 'Successful', count: orders.filter((o) => o.paymentStatus === 'success').length + bookings.filter((b) => b.paymentStatus === 'success').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending', count: orders.filter((o) => o.paymentStatus === 'pending').length + bookings.filter((b) => b.paymentStatus === 'pending').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Failed', count: orders.filter((o) => o.paymentStatus === 'failed').length + bookings.filter((b) => b.paymentStatus === 'failed').length, icon: XCircle, color: 'text-rose-600 bg-rose-50' },
    { label: 'Refunded', count: orders.filter((o) => o.paymentStatus === 'refunded').length + bookings.filter((b) => b.paymentStatus === 'refunded').length, icon: RotateCcw, color: 'text-slate-600 bg-slate-100' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Orders + Bookings</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900">{totalOrdersCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {paidOrders.length} paid ({totalOrdersCount > 0 ? Math.round((paidOrders.length / totalOrdersCount) * 100) : 0}%)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Home Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900">{totalBookingsCount}</span>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
              ₹{bookingsRevenue.toLocaleString('en-IN')} revenue
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900">₹{aov.toLocaleString('en-IN')}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Per verified order</p>
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Trends Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">7-Day Revenue Trend</h4>
              <p className="text-[10px] text-slate-400">Daily sales performance</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
            Real-Time
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {last7Days.map((day) => {
            const pct = maxDayAmount > 0 ? Math.min(100, Math.round((day.amount / maxDayAmount) * 100)) : 0;
            return (
              <div key={day.dateStr} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{day.label}</span>
                  <span className="text-slate-900 font-black">₹{day.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, day.amount > 0 ? 8 : 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Top Performing Products</h4>
              <p className="text-[10px] text-slate-400">Ranked by revenue contribution</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500">{topProducts.length} items</span>
        </div>

        {topProducts.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            <p className="text-xs font-semibold">No product orders recorded yet</p>
            <p className="text-[10px] text-slate-400">Once customers place orders, top sellers will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topProducts.map((prod, index) => (
              <div key={prod.title} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{prod.title}</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">{prod.units} units sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs text-slate-900 block">₹{prod.revenue.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-emerald-600 font-bold">Revenue</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-slate-900">Order Status Distribution</h4>
        <div className="grid grid-cols-2 gap-2">
          {orderStatuses.map((st) => (
            <div key={st.key} className={`p-2.5 rounded-xl border border-slate-100 flex items-center justify-between ${st.color}`}>
              <span className="text-[11px] font-bold">{st.label}</span>
              <span className="text-xs font-black">{st.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Health Matrix */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-slate-900">Payment Collection Health</h4>
        <div className="grid grid-cols-2 gap-2">
          {paymentStatuses.map((ps) => {
            const Icon = ps.icon;
            return (
              <div key={ps.label} className={`p-2.5 rounded-xl border border-slate-100 flex items-center justify-between ${ps.color}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">{ps.label}</span>
                </div>
                <span className="text-xs font-black">{ps.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
