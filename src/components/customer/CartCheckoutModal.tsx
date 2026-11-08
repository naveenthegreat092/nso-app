import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  MapPin,
  Sparkles,
  Truck,
  Heart,
  ChevronRight,
  Info,
  Tag,
  Zap,
  ShoppingBag
} from 'lucide-react';

export const CartCheckoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, createOrder, user, showToast } = useApp();
  const [deliveryAddress, setDeliveryAddress] = useState(
    user.address || 'Flat 402, Orbit Towers, Indiranagar, Bengaluru - 560038'
  );
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [deliveryInstruction, setDeliveryInstruction] = useState('Ring doorbell');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState<any>(null);

  if (!isOpen) return null;

  const itemSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.price + (item.selectedVariant?.priceModifier || 0)) * item.quantity,
    0
  );
  const originalSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.originalPrice + (item.selectedVariant?.priceModifier || 0)) * item.quantity,
    0
  );
  const totalSavings = originalSubtotal - itemSubtotal;

  const sellerDeliveryCharge =
    cart.length > 0 ? Math.max(...cart.map((item) => item.product.regionalDeliveryFee), 0) : 0;
  const platformFee = 0;
  const fullTotal = Math.max(0, itemSubtotal + sellerDeliveryCharge + platformFee + tipAmount - couponDiscount);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    if (code === 'NSOFIRST') {
      const discount = 150;
      setCouponDiscount(discount);
      setAppliedCoupon('NSOFIRST');
      showToast('🎉 Coupon NSOFIRST applied! ₹150 OFF');
    } else if (code === 'FESTIVE50') {
      const discount = Math.round(itemSubtotal * 0.1);
      setCouponDiscount(discount);
      setAppliedCoupon('FESTIVE50');
      showToast(`🎉 Coupon FESTIVE50 applied! ₹${discount} OFF`);
    } else {
      showToast('Invalid coupon code. Try NSOFIRST or FESTIVE50');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    showToast('Coupon removed');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      const order = await createOrder(
        deliveryAddress,
        paymentMethod === 'upi' ? 'Direct UPI' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
        appliedCoupon || undefined,
        tipAmount
      );
      setCheckoutComplete(order);
    } catch {
      showToast('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setCheckoutComplete(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-900">
              {checkoutComplete ? 'Order Confirmation' : `Checkout Bag (${cart.length})`}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
              DIRECT UPI ACTIVE
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {checkoutComplete ? (
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Payment & Order Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <span className="font-mono font-black text-slate-900">{checkoutComplete.orderNumber}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Total Amount Paid:</span>
                <span className="font-black text-slate-950 text-sm">₹{checkoutComplete.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <span className="font-semibold text-slate-800">{checkoutComplete.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Address:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[190px]">{checkoutComplete.deliveryAddress}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Fulfillment Status:</span>
                <span className="font-black text-blue-600 capitalize bg-blue-50 px-2 py-0.5 rounded-md">
                  {checkoutComplete.orderStatus}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Seller has been notified to pack your order. Track real-time progress in the "Orders" tab.
            </p>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-transform active:scale-98"
            >
              Done & View Orders
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
              <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h4 className="font-black text-base text-slate-800">Your bag is empty</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Explore trending physical products and verified services to add them here.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Savings Celebration Banner */}
            {totalSavings > 0 && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-black">
                  Hurray! You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order 🎉
                </span>
              </div>
            )}

            {/* Delivery Address Pill */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Delivering to Home</span>
                </div>
                <span className="text-[10px] text-red-600 font-extrabold cursor-pointer hover:underline">
                  Edit
                </span>
              </div>
              <p className="text-slate-600 text-[11px] pl-5 leading-snug">{deliveryAddress}</p>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Items in Cart ({cart.length})
              </span>
              <div className="space-y-2">
                {cart.map((item) => {
                  const itemPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-150 shadow-sm"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-14 h-14 object-contain rounded-xl bg-slate-50 p-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.product.title}</h4>
                        {item.selectedVariant && (
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Option: {item.selectedVariant.name}
                          </span>
                        )}
                        <div className="text-xs font-black text-slate-950 mt-1">
                          ₹{itemPrice.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center bg-red-600 text-white rounded-xl shadow-md overflow-hidden text-xs font-black">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-red-700 active:scale-90"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-red-700 active:scale-90"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Instructions Chips */}
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-slate-800">Delivery Instructions</span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {['Ring doorbell', 'Leave at door', 'Avoid calling', 'Directions to reach'].map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => setDeliveryInstruction(inst)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all ${
                      deliveryInstruction === inst
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Delivery Partner */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Tip Delivery Partner</span>
                </div>
                {tipAmount > 0 && (
                  <span className="text-[10px] text-red-600 font-black cursor-pointer" onClick={() => setTipAmount(0)}>
                    Clear
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {[10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTipAmount(tipAmount === amt ? 0 : amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      tipAmount === amt
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupons & Offers */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Coupons & Offers</span>
                </div>
                {appliedCoupon && (
                  <span className="text-[10px] text-red-600 font-black cursor-pointer" onClick={handleRemoveCoupon}>
                    Remove
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800">
                  <div>
                    <span className="font-mono font-black text-xs text-emerald-900 block">{appliedCoupon} APPLIED</span>
                    <span className="text-[11px] text-emerald-700">You saved ₹{couponDiscount} with this code!</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider placeholder:font-sans uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-sm transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('NSOFIRST')}
                      className="px-2.5 py-1 rounded-lg border border-dashed border-red-300 bg-red-50/60 text-[10px] font-bold text-red-700 flex items-center gap-1 hover:bg-red-100/60 whitespace-nowrap"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-red-500" />
                      <span>NSOFIRST (-₹150)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FESTIVE50')}
                      className="px-2.5 py-1 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 text-[10px] font-bold text-amber-800 flex items-center gap-1 hover:bg-amber-100/60 whitespace-nowrap"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      <span>FESTIVE50 (10% OFF)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-slate-800">Select Payment Method</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'Direct UPI', icon: QrCode },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'NetBank', icon: Building }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-black shadow-sm ring-2 ring-emerald-100'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Direct UPI Intent & QR Box (Zero Razorpay required) */}
              {paymentMethod === 'upi' && (() => {
                const adminUpi = localStorage.getItem('nso_merchant_upi') || 'pay@nso';
                const upiIntent = `upi://pay?pa=${adminUpi}&pn=NSO%20Orbit&am=${fullTotal}&cu=INR&tn=Order%20Payment`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiIntent)}`;

                return (
                  <div className="bg-gradient-to-b from-emerald-50/80 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Direct Instant UPI Payment</span>
                      </span>
                      <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full font-mono">
                        0% FEE
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-2xl border border-emerald-200/60 inline-block shadow-sm">
                      <img
                        src={qrUrl}
                        alt="Scan UPI QR Code"
                        className="w-32 h-32 mx-auto rounded-xl object-contain"
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-700">
                        Scan with GPay, PhonePe, or Paytm
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>UPI ID: <strong className="text-slate-900">{adminUpi}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard?.writeText) {
                              navigator.clipboard.writeText(adminUpi);
                            }
                            showToast('UPI ID copied to clipboard!');
                          }}
                          className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-sans font-bold hover:bg-slate-300 ml-1"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <a
                      href={upiIntent}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Open GPay / PhonePe / Paytm</span>
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Bill Details Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200/80 text-xs">
              <span className="font-black text-slate-900 block mb-1">Bill Details</span>
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{itemSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Seller Regional Delivery Charge:</span>
                <span className="font-semibold text-slate-900">
                  {sellerDeliveryCharge === 0 ? 'FREE' : `₹${sellerDeliveryCharge}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon}):</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Partner Tip:</span>
                  <span className="font-semibold text-slate-900">₹{tipAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Platform Commission / Fees:</span>
                <span className="font-bold text-emerald-600">₹0 (Zero Buyer Fee)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-950">
                <span>Grand Total To Pay:</span>
                <span className="text-red-600 font-black text-base">₹{fullTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer Approval CTA */}
            <div className="pt-1">
              <button
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/25 transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment Confirmation...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Authorize & Pay ₹{fullTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                Direct UPI payments transfer instantly to your primary bank UPI account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
