import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from '../common/InvoiceModal';
import {
  Package,
  Wrench,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  MapPin,
  Star,
  Navigation,
  MessageSquare,
  FileText,
  Ban,
  ShoppingBag,
  AlertTriangle,
  Timer,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    bookings,
    respondToRevisedQuote,
    showToast,
    openTracking,
    openReviewModal,
    openChat,
    openProviderProfile,
    cancelOrder,
    cancelBooking,
    setActiveTab,
    user,
    customerDecideQuotation,
    customerDecideExtraTime,
    confirmServiceCompletion,
    reportServiceProblem,
    confirmOrderReceipt
  } = useApp();
  const [subTab, setSubTab] = useState<'products' | 'services'>('products');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmCancelType, setConfirmCancelType] = useState<'order' | 'booking'>('order');

  // Quotation & Problem reporting states
  const [quoteDecisionFeedback, setQuoteDecisionFeedback] = useState<{ [bookingId: string]: string }>({});
  const [showProblemModalForBookingId, setShowProblemModalForBookingId] = useState<string | null>(null);
  const [problemType, setProblemType] = useState<'poor_quality' | 'incomplete_work' | 'damage' | 'other'>('poor_quality');
  const [problemDescription, setProblemDescription] = useState('');

  const handleCancelOrder = (id: string) => {
    setConfirmCancelType('order');
    setConfirmCancelId(id);
  };

  const handleCancelBooking = (id: string) => {
    setConfirmCancelType('booking');
    setConfirmCancelId(id);
  };

  const handleConfirmCancel = () => {
    if (!confirmCancelId) return;
    if (confirmCancelType === 'order') {
      cancelOrder(confirmCancelId, 'Cancelled by customer');
    } else {
      cancelBooking(confirmCancelId, 'Cancelled by customer');
    }
    setConfirmCancelId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Confirmed</span>;
      case 'packed':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Packed</span>;
      case 'shipped':
        return <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">Shipped</span>;
      case 'out_for_delivery':
        return <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">Out for Delivery</span>;
      case 'delivered':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'delivered_pending_payment':
        return <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">Delivered (Pending Release)</span>;
      case 'completed':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Completed & Cleared</span>;
      case 'cancelled':
        return <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">Cancelled (Refunded)</span>;
      default:
        return <span className="text-[10px] bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Inline Cancel Confirmation Dialog */}
      {confirmCancelId && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setConfirmCancelId(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
              <Ban className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">Cancel {confirmCancelType === 'order' ? 'Order' : 'Booking'}?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                A full refund will be instantly issued to your original payment source.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Keep It
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all active:scale-98"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="px-4 pt-3">
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Orders & Bookings</h2>
        <p className="text-xs text-gray-500">Track fulfillment status and review service progress</p>

        {/* Sub Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mt-3">
          <button
            onClick={() => setSubTab('products')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'products' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setSubTab('services')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'services' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Service Bookings ({bookings.length})</span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Physical Product Orders */}
        {subTab === 'products' && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-gray-150 shadow-sm space-y-3">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7 text-red-600 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">No Orders Yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Experience lightning-fast 10-25 min delivery on groceries, electronics & local products.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div
                      onClick={() => toggleExpand(order.id)}
                      className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {order.orderNumber}
                        </span>
                        {getOrderStatusBadge(order.orderStatus)}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        {order.items[0]?.image && (
                          <img
                            src={order.items[0].image}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl bg-gray-50"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {order.items[0]?.title}
                            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Total: <span className="font-extrabold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span> • {order.createdAt}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expanded Pipeline Stages */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/80 border-t border-gray-100 text-xs space-y-3">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 block">Delivery Pipeline:</span>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 px-1">
                            {['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'].map((step, idx) => {
                              const steps = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
                              const currentIdx = steps.indexOf(order.orderStatus);
                              const isCompleted = currentIdx >= idx;
                              return (
                                <div key={step} className="flex flex-col items-center">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                      isCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    {idx + 1}
                                  </div>
                                  <span className="capitalize mt-1 scale-90">{step.replace('_', ' ')}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                          <p><span className="font-bold text-slate-800">Ship to:</span> {order.deliveryAddress}</p>
                          <p><span className="font-bold text-slate-800">Payment:</span> {order.paymentMethod} ({order.paymentStatus})</p>
                        </div>

                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                          <button
                            onClick={() => showToast(`Support ticket raised for order ${order.orderNumber}`)}
                            className="text-[11px] font-semibold text-gray-600 hover:text-red-600 flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            Need Help / Return
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setSelectedInvoice({
                                  orderNumber: order.orderNumber,
                                  date: order.createdAt,
                                  customerName: order.customerName,
                                  address: order.deliveryAddress,
                                  items: order.items.map((i) => ({ title: i.title, price: i.price, quantity: i.quantity })),
                                  total: order.total,
                                  deliveryFee: order.sellerDeliveryCharge,
                                  platformFee: order.platformFee,
                                  discount: order.couponDiscount
                                })
                              }
                              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg"
                              title="Download Tax Invoice"
                            >
                              <FileText className="w-3 h-3 text-slate-600" />
                              <span>Invoice</span>
                            </button>
                            {/* Cancel Order Action if order is still confirmed or packed */}
                            {['confirmed', 'packed'].includes(order.orderStatus) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order.id);
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                                title="Cancel order with full refund"
                              >
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>Cancel Order</span>
                              </button>
                            )}
                            {order.orderStatus === 'cancelled' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                Refund Initiated (100%)
                              </span>
                            )}
                            {['out_for_delivery', 'shipped', 'confirmed', 'packed'].includes(order.orderStatus) && (
                              <button
                                onClick={() => openTracking(order.orderNumber, 'Delivery Partner', 'delivery')}
                                className="flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-lg shadow-sm"
                              >
                                <Navigation className="w-3 h-3" />
                                Track
                              </button>
                            )}
                            {order.orderStatus === 'delivered' && !order.customerConfirmed && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmOrderReceipt(order.id);
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm Received</span>
                              </button>
                            )}
                            {(order.orderStatus === 'delivered_pending_payment' || (order.customerConfirmed && !order.adminPaymentCleared)) && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-600" />
                                Confirmed • Pending Admin Release
                              </span>
                            )}
                            {(order.orderStatus === 'completed' || order.adminPaymentCleared) && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Completed & Cleared
                              </span>
                            )}
                            {order.orderStatus === 'delivered' && !order.rating && (
                              <button
                                onClick={() => openReviewModal(order.items[0]?.title || order.orderNumber, 'product', order.id)}
                                className="flex items-center gap-1 text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg shadow-sm"
                              >
                                <Star className="w-3 h-3" />
                                Rate Now
                              </button>
                            )}
                            {order.orderStatus === 'delivered' && order.rating && (
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Rated {order.rating}★
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Service Bookings */}
        {subTab === 'services' && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-gray-150 shadow-sm space-y-3">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Wrench className="w-7 h-7 text-red-600 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">No Service Bookings Yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Book certified electricians, plumbers, AC repair, and beauty experts delivered to your doorstep.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Explore Services</span>
                </button>
              </div>
            ) : (
              bookings.map((booking) => {
                const hasPendingCustomerQuote = booking.revisedQuote?.status === 'admin_approved';

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {booking.bookingNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        booking.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'completed_pending_review'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : booking.status === 'quotation_customer_review'
                          ? 'bg-purple-100 text-purple-900 font-black animate-pulse'
                          : booking.status === 'problem_reported'
                          ? 'bg-rose-100 text-rose-900'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : booking.status === 'in_progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{booking.serviceTitle}</h4>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Provider: <span className="font-semibold text-gray-800">{booking.providerName}</span>
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>{booking.date} • {booking.timeSlot}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Mode: <span className="font-semibold text-gray-800 capitalize">{booking.serviceMode.replace('_', ' ')}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                      <span className="text-gray-500">Agreed Price:</span>
                      <span className="font-black text-gray-900">₹{booking.totalPrice}</span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Invoice Button */}
                      <button
                        onClick={() =>
                          setSelectedInvoice({
                            orderNumber: booking.bookingNumber,
                            date: booking.date,
                            customerName: booking.customerName,
                            address: booking.customerAddress,
                            items: [{ title: booking.serviceTitle, price: booking.totalPrice, quantity: 1 }],
                            total: booking.totalPrice,
                            deliveryFee: 0,
                            platformFee: 0
                          })
                        }
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg"
                      >
                        <FileText className="w-3 h-3 text-slate-600" />
                        Invoice
                      </button>
                      {/* View Provider Profile */}
                      <button
                        onClick={() => openProviderProfile(booking.providerId)}
                        className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
                      >
                        <Star className="w-3 h-3 text-amber-500" />
                        Provider Profile
                      </button>
                      {/* Chat with Provider */}
                      <button
                        onClick={() => openChat(booking.providerName)}
                        className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
                      >
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        Message
                      </button>
                      {/* Cancel Booking Action if booking is confirmed */}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => {
                              handleCancelBooking(booking.id);
                            }}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                          title="Cancel booking"
                        >
                          <Ban className="w-3 h-3 text-rose-600" />
                          Cancel
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          100% Refunded
                        </span>
                      )}
                      {/* Track technician if active */}
                      {['confirmed', 'in_progress', 'travelling'].includes(booking.status) && (
                        <button
                          onClick={() => openTracking(booking.serviceTitle, booking.providerName, 'technician', booking.id, booking)}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                        >
                          <Navigation className="w-3 h-3" />
                          Track Specialist
                        </button>
                      )}

                      {/* Confirm Completion & Release */}
                      {booking.status === 'completed_pending_review' && (
                        <button
                          onClick={() => confirmServiceCompletion(booking.id)}
                          className="flex items-center gap-1 text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirm &amp; Release Payment
                        </button>
                      )}

                      {/* Report Problem / Dispute */}
                      {['in_progress', 'completed_pending_review', 'completed'].includes(booking.status) && !booking.reportedProblem && (
                        <button
                          onClick={() => setShowProblemModalForBookingId(booking.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Report Problem
                        </button>
                      )}

                      {/* Rate if completed and not yet rated */}
                      {booking.status === 'completed' && !booking.rating && (
                        <button
                          onClick={() => openReviewModal(booking.serviceTitle, 'service', booking.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg shadow-sm"
                        >
                          <Star className="w-3 h-3" />
                          Rate Service
                        </button>
                      )}
                      {booking.status === 'completed' && booking.rating && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 ml-auto">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Rated {booking.rating}★
                        </span>
                      )}
                    </div>

                    {/* FORMAL JOB QUOTATION CARD */}
                    {booking.quotation && (
                      <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/70 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            Official Job Quotation
                          </span>
                          <span className="text-[10px] bg-purple-200 text-purple-900 font-black px-2 py-0.5 rounded-full capitalize">
                            {booking.quotation.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-700"><span className="font-bold">Scope:</span> {booking.quotation.proposedWork}</p>

                        <div className="grid grid-cols-4 gap-2 text-center font-mono">
                          <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                            <span className="text-[9px] text-gray-400 block">Labor</span>
                            <span className="font-bold text-slate-800">₹{booking.quotation.laborCost}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                            <span className="text-[9px] text-gray-400 block">Parts</span>
                            <span className="font-bold text-slate-800">₹{booking.quotation.partsCost}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-lg border border-purple-100">
                            <span className="text-[9px] text-gray-400 block">Fees</span>
                            <span className="font-bold text-slate-800">₹{booking.quotation.additionalFees}</span>
                          </div>
                          <div className="bg-purple-900 text-white p-1.5 rounded-lg">
                            <span className="text-[9px] text-purple-200 block">Total</span>
                            <span className="font-black">₹{booking.quotation.totalAmount}</span>
                          </div>
                        </div>

                        {booking.quotation.assumptions && (
                          <p className="text-[10px] text-purple-900 italic">Notes: {booking.quotation.assumptions}</p>
                        )}
                        <p className="text-[10px] text-gray-500">Quotation Valid Until: <strong>{booking.quotation.expiryDate}</strong></p>

                        {/* Customer Decision Actions */}
                        {(booking.status === 'quotation_customer_review' || booking.quotation.status === 'admin_approved') && (
                          <div className="pt-2 border-t border-purple-200/80 space-y-2">
                            <input
                              type="text"
                              placeholder="Feedback / notes (optional for changes or decline)..."
                              value={quoteDecisionFeedback[booking.id] || ''}
                              onChange={(e) => setQuoteDecisionFeedback({ ...quoteDecisionFeedback, [booking.id]: e.target.value })}
                              className="w-full p-2 bg-white border border-purple-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                            />
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => customerDecideQuotation(booking.id, 'accept')}
                                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept &amp; Start
                              </button>
                              <button
                                onClick={() => customerDecideQuotation(booking.id, 'request_changes', quoteDecisionFeedback[booking.id])}
                                className="py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl active:scale-95"
                              >
                                Request Edit
                              </button>
                              <button
                                onClick={() => customerDecideQuotation(booking.id, 'decline', quoteDecisionFeedback[booking.id])}
                                className="py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] rounded-xl active:scale-95"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* HOURLY DETAILS & EXTRA TIME TRACKER */}
                    {booking.hourlyDetails && (
                      <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                            <Timer className="w-4 h-4 text-indigo-600" />
                            Hourly Service Billing
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            booking.hourlyDetails.timerRunning ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {booking.hourlyDetails.timerRunning ? 'Timer Active' : 'Timer Paused'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl text-[11px] text-center border border-indigo-100">
                          <div>
                            <span className="text-[9px] text-gray-400 block uppercase font-bold">Time Used</span>
                            <span className="font-black text-slate-800">{booking.hourlyDetails.timeUsedHours || 0} hrs</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 block uppercase font-bold">Approved Limit</span>
                            <span className="font-bold text-slate-700">{booking.hourlyDetails.approvedTimeLimitHours || 2} hrs</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 block uppercase font-bold">Calculated Fee</span>
                            <span className="font-extrabold text-indigo-700">₹{booking.hourlyDetails.calculatedAmount || booking.totalPrice}</span>
                          </div>
                        </div>

                        {/* Extra Time Request Banner */}
                        {booking.hourlyDetails.extraTimeRequest?.status === 'pending_customer' && (
                          <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-300 space-y-2">
                            <p className="text-[11px] font-bold text-amber-950">
                              ⚠️ Provider requested +{booking.hourlyDetails.extraTimeRequest.requestedHours} hrs (₹{booking.hourlyDetails.extraTimeRequest.extraAmount}). Reason: {booking.hourlyDetails.extraTimeRequest.reason}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => customerDecideExtraTime(booking.id, true)}
                                className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm active:scale-95"
                              >
                                Approve Extra Time
                              </button>
                              <button
                                onClick={() => customerDecideExtraTime(booking.id, false)}
                                className="py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg active:scale-95"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* REPORTED PROBLEM BANNER */}
                    {booking.reportedProblem && (
                      <div className="p-3 rounded-2xl border border-rose-200 bg-rose-50 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Dispute Filed: {booking.reportedProblem.problemType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full capitalize">
                            {booking.reportedProblem.adminReviewStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-700">{booking.reportedProblem.description}</p>
                        {booking.reportedProblem.siteVisitScheduledAt && (
                          <p className="text-[10px] font-bold text-indigo-700 pt-1">
                            📅 Site inspection visit scheduled: {new Date(booking.reportedProblem.siteVisitScheduledAt).toLocaleString('en-IN')}
                          </p>
                        )}
                        {booking.reportedProblem.resolutionNotes && (
                          <p className="text-[10px] font-bold text-emerald-700 pt-1">
                            Resolution: {booking.reportedProblem.resolutionNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* REVISED QUOTE GUARDRAIL SECTION (Page 6 Brief) */}
                    {booking.revisedQuote && (
                      <div className={`p-3 rounded-xl border text-xs ${
                        booking.revisedQuote.status === 'customer_approved'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : booking.revisedQuote.status === 'rejected'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                          <span>Provider Revised Quote Request (+₹{booking.revisedQuote.amount})</span>
                        </div>
                        <p className="text-[11px] mb-2">{booking.revisedQuote.reason}</p>

                        {/* Customer Decision Required if Admin Approved */}
                        {hasPendingCustomerQuote && (
                          <div className="space-y-2 pt-2 border-t border-amber-200">
                            <p className="text-[10px] font-bold text-amber-900">
                              Admin has vetted this change. Customer approval is required before extra work starts.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => respondToRevisedQuote(booking.id, true, true)}
                                className="py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm"
                              >
                                Approve Extra ₹{booking.revisedQuote.amount}
                              </button>
                              <button
                                onClick={() => respondToRevisedQuote(booking.id, true, false)}
                                className="py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}

                        {booking.revisedQuote.status === 'pending_admin' && (
                          <span className="text-[10px] text-amber-700 font-semibold italic">
                            Status: Awaiting Admin Review before presented to customer.
                          </span>
                        )}
                        {booking.revisedQuote.status === 'customer_approved' && (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved by customer. Work may proceed.
                          </span>
                        )}
                        {booking.revisedQuote.status === 'rejected' && (
                          <span className="text-[10px] text-red-600 font-semibold">
                            Revised quote declined. No extra charges apply.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Problem / Dispute Reporting Modal */}
      {showProblemModalForBookingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Service Issue</span>
              </div>
              <button
                onClick={() => {
                  setShowProblemModalForBookingId(null);
                  setProblemDescription('');
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-600">
              NSO Protection ensures quality. We will mediate, inspect on-site, or issue a full refund if standards are not met.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Issue Category</label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="poor_quality">Poor Quality Work</option>
                  <option value="incomplete_work">Work Left Incomplete</option>
                  <option value="damage">Property Damage</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what went wrong so Admin can schedule an inspection or resolve..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProblemModalForBookingId(null);
                    setProblemDescription('');
                  }}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!problemDescription.trim()) {
                      showToast('Please provide a description of the issue');
                      return;
                    }
                    await reportServiceProblem(showProblemModalForBookingId, problemType, problemDescription.trim());
                    setShowProblemModalForBookingId(null);
                    setProblemDescription('');
                  }}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md active:scale-95"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          orderData={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
