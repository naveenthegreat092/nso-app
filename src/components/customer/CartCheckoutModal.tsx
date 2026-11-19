import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
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
  ShoppingBag,
  Crosshair,
  ExternalLink,
  Loader2,
  Banknote,
  Edit3
} from 'lucide-react';

export const CartCheckoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, createOrder, user, showToast } = useApp();
  const [deliveryAddress, setDeliveryAddress] = useState(
    user.address || ''
  );
  const [addressError, setAddressError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [deliveryInstruction, setDeliveryInstruction] = useState('Ring doorbell');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState<any>(null);
  const [serverMerchantUpi, setServerMerchantUpi] = useState<string>('8310421121@axl');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [addressInput, setAddressInput] = useState(user.address || '');

  const detectCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('GPS Geolocation is not supported by your device browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const street = addr.road || addr.residential || '';
            const suburb = addr.suburb || addr.neighbourhood || addr.subdivision || 'Bengaluru';
            const city = addr.city || addr.town || 'Bengaluru';
            const postcode = addr.postcode || '560001';
            const formatted = `${street ? `${street}, ` : ''}${suburb}, ${city} - ${postcode}`;
            setDeliveryAddress(formatted);
            setAddressInput(formatted);
            showToast(`📍 Location detected: ${suburb}`);
          } else {
            const fallback = `Near Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Bengaluru`;
            setDeliveryAddress(fallback);
            setAddressInput(fallback);
            showToast('📍 GPS coordinates captured');
          }
        } catch {
          const fallback = `Near Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Bengaluru`;
          setDeliveryAddress(fallback);
          setAddressInput(fallback);
          showToast('📍 GPS coordinates captured');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        showToast(`GPS: ${err.message || 'Unable to retrieve location'}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    api.getPublicSettings().then((settings) => {
      if (settings?.merchantUpiId) {
        setServerMerchantUpi(settings.merchantUpiId);
      }
    });
  }, []);

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
    if (!deliveryAddress.trim()) {
      setAddressError('Please enter your delivery address before placing the order.');
      setIsEditingAddress(true);
      showToast('⚠️ Please enter your delivery address first.');
      return;
    }
    setAddressError('');
    setIsProcessing(true);
    try {
      const order = await createOrder(
        deliveryAddress,
        paymentMethod === 'upi' ? 'Direct UPI' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
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

            {/* Delivery Address Pill with 1-Tap GPS & Google Maps */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Delivery Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 px-2 py-0.5 rounded-lg font-bold border border-red-200/60 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                    ) : (
                      <Crosshair className="w-3 h-3 text-red-600" />
                    )}
                    <span>{isDetectingLocation ? 'Locating...' : 'Use Live GPS'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressInput(deliveryAddress);
                      setIsEditingAddress(!isEditingAddress);
                    }}
                    className="text-[10px] text-slate-600 font-extrabold hover:text-red-600"
                  >
                    {isEditingAddress ? 'Done' : 'Edit'}
                  </button>
                </div>
              </div>

              {isEditingAddress ? (
                <div className="space-y-1.5 pt-1">
                  <textarea
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter Flat/Door No, Apartment, Street, Landmark, Pincode"
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[11px] text-slate-800 outline-none focus:border-red-400 font-medium"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryAddress(addressInput);
                        setIsEditingAddress(false);
                        showToast('Address updated for this order');
                      }}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {deliveryAddress ? (
                    <>
                      <p className="text-slate-700 text-[11px] pl-5 leading-snug font-medium">{deliveryAddress}</p>
                      <div className="pl-5 pt-0.5">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] text-blue-600 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Open in Google Maps</span>
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] pl-5 text-amber-700 font-bold">
                      ⚠️ No address entered — tap "Edit" or "Use Live GPS" to add your delivery address.
                    </p>
                  )}
                  {addressError && (
                    <p className="text-[11px] pl-5 text-red-600 font-bold mt-0.5">{addressError}</p>
                  )}
                </div>
              )}
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
                      <div className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow-md overflow-hidden text-xs font-black border border-emerald-400/40">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-emerald-800 active:scale-90"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-emerald-800 active:scale-90"
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
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Select Payment Method</span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'upi', label: 'Direct Instant UPI', desc: 'PhonePe, GPay, Paytm', icon: QrCode, color: 'text-emerald-600', activeBg: 'border-emerald-600 bg-emerald-50 text-emerald-900' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay cash at doorstep', icon: Banknote, color: 'text-amber-600', activeBg: 'border-amber-600 bg-amber-50 text-amber-900' },
                  { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Master, RuPay', icon: CreditCard, color: 'text-blue-600', activeBg: 'border-blue-600 bg-blue-50 text-blue-900' },
                  { id: 'netbanking', label: 'Net Banking', desc: 'All Indian banks', icon: Building, color: 'text-purple-600', activeBg: 'border-purple-600 bg-purple-50 text-purple-900' }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                        isSelected
                          ? `${m.activeBg} font-black shadow-md ring-2 ring-emerald-200`
                          : 'border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                        <Icon className={`w-6 h-6 stroke-[2.4] ${m.color}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black block leading-tight">{m.label}</span>
                        <span className="text-[10px] text-slate-500 font-bold block truncate mt-0.5">{m.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cash on Delivery Notice */}
              {paymentMethod === 'cod' && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1 animate-in fade-in duration-150">
                  <span className="font-extrabold block">💵 Cash on Delivery Selected</span>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Pay ₹{fullTotal.toLocaleString('en-IN')} in cash or via delivery agent UPI QR code when your order arrives at your doorstep.
                  </p>
                </div>
              )}

              {/* Direct UPI Intent & QR Box (Zero Razorpay required) */}
              {paymentMethod === 'upi' && (() => {
                const adminUpi = serverMerchantUpi || localStorage.getItem('nso_merchant_upi') || '8310421121@axl';
                const amtStr = Number(fullTotal).toFixed(2);
                const note = encodeURIComponent('NSO Order Payment');
                const upiIntent = `upi://pay?pa=${adminUpi}&pn=Naveen%20U&am=${amtStr}&cu=INR&tn=${note}`;
                const phonepeIntent = `phonepe://pay?pa=${adminUpi}&pn=Naveen%20U&am=${amtStr}&cu=INR&tn=${note}`;
                const gpayIntent = `tez://upi/pay?pa=${adminUpi}&pn=Naveen%20U&am=${amtStr}&cu=INR&tn=${note}`;
                const paytmIntent = `paytmmp://pay?pa=${adminUpi}&pn=Naveen%20U&am=${amtStr}&cu=INR&tn=${note}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntent)}`;

                const launchIntent = (intentUrl: string) => {
                  try {
                    window.location.href = intentUrl;
                  } catch {
                    window.open(intentUrl, '_system');
                  }
                };

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
                        Scan with PhonePe, GPay, or Paytm (Payee: <strong>Naveen U</strong>)
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
                          className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-sans font-bold hover:bg-slate-300 ml-1 cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Primary Launch Button */}
                    <button
                      type="button"
                      onClick={() => launchIntent(upiIntent)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Open Any UPI App</span>
                    </button>

                    {/* App-specific shortcuts */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => launchIntent(phonepeIntent)}
                        className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-[11px] rounded-lg transition-all"
                      >
                        PhonePe
                      </button>
                      <button
                        type="button"
                        onClick={() => launchIntent(gpayIntent)}
                        className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] rounded-lg transition-all"
                      >
                        Google Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => launchIntent(paytmIntent)}
                        className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-[11px] rounded-lg transition-all"
                      >
                        Paytm
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 bg-amber-50/80 border border-amber-200/60 rounded-lg p-1.5 leading-snug text-left">
                      <strong>Note:</strong> UPI security rules prohibit sending money to your own phone number/bank. When testing, make sure your UPI app is registered with a different phone or account than <span className="font-mono text-slate-800 font-semibold">{adminUpi}</span>.
                    </p>
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
                <span className="text-amber-600 font-black text-lg">₹{fullTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer Approval CTA — Ultra-Premium Edition */}
            <div className="pt-1">
              <button
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-amber-500 disabled:bg-slate-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-transform active:scale-98 flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing Payment Confirmation...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 stroke-[2.8]" />
                    <span>Authorize &amp; Pay ₹{fullTotal.toLocaleString('en-IN')}</span>
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
