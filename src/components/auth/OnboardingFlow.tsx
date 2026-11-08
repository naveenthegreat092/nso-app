import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Store,
  Wrench,
  ShoppingBag,
  ShieldAlert,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const {
    registerCustomerProfile,
    applyForSeller,
    applyForProvider,
    switchRole,
    loginUser,
    user,
    showToast
  } = useApp();

  // Steps: 'splash' -> 'login_phone' -> 'otp' -> 'select_role' -> 'seller_form' -> 'provider_form' -> 'submitted_wait'
  const [step, setStep] = useState<
    'splash' | 'login_phone' | 'otp' | 'select_role' | 'customer_form' | 'seller_form' | 'provider_form' | 'submitted_wait'
  >('splash');

  // Phone & OTP
  const [phone, setPhone] = useState('8310421121');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile fields
  const [custName, setCustName] = useState('');
  const [custArea, setCustArea] = useState('Indiranagar');
  const [custAddress, setCustAddress] = useState('Flat 402, 100ft Road, Bengaluru - 560038');

  // Seller fields
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Retail Store');
  const [gstin, setGstin] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Provider fields
  const [tradeCategory, setTradeCategory] = useState('Electrical');
  const [hourlyRate, setHourlyRate] = useState(350);
  const [experienceYears, setExperienceYears] = useState(5);
  const [idProofNumber, setIdProofNumber] = useState('');

  // Auto-progress from splash after 1.2s
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('login_phone');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // If already logged in as admin, complete immediately
  useEffect(() => {
    if (user.isLoggedIn && (user.activeRole === 'admin' || user.adminVerified)) {
      onComplete();
    }
  }, [user, onComplete]);

  // Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    const res = await api.sendOtp(`+91${clean}`);
    setIsSubmitting(false);

    if (res && res.debugOtp) {
      showToast(`Verification Code: ${res.debugOtp}`);
      setOtp(res.debugOtp);
    } else {
      showToast(`Verification code sent to +91 ${clean}`);
      setOtp('123456'); // Fallback dev OTP
    }

    setOtpError(null);
    setStep('otp');
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const clean = phone.replace(/\D/g, '');
    const isOwner = clean.endsWith('8310421121');

    const verifyRes = await api.verifyOtp(`+91${clean}`, cleanOtp);
    setIsSubmitting(false);

    if (!verifyRes || !verifyRes.success) {
      setOtpError('Invalid code. Please enter 123456 or the code shown in the message.');
      return;
    }

    if (isOwner) {
      // 👑 OWNER LOGIN: Immediately elevate to Admin and enter Admin Console!
      await loginUser();
      switchRole('admin');
      showToast('👑 Welcome Owner! Entering Admin Console...');
      onComplete();
      return;
    }

    // Regular User: proceed to role selection
    await loginUser();
    showToast('Phone verified! Choose how you want to join NSO.');
    setStep('select_role');
  };

  // Handle Customer Quick Start
  const handleFinishCustomer = () => {
    registerCustomerProfile({
      name: custName.trim() || `Customer ${phone.slice(-4)}`,
      phone: `+91 ${phone.replace(/\D/g, '')}`,
      houseNumber: custAddress.split(',')[0] || '101',
      streetNumber: custArea || 'Indiranagar',
      landmark: custArea || 'Near Metro',
      city: 'Bengaluru',
      pincode: '560001'
    });
    showToast('Welcome to NSO Marketplace!');
    onComplete();
  };

  // Handle Seller Submit
  const handleFinishSeller = () => {
    if (!storeName.trim()) {
      showToast('Please enter your Store / Business Name');
      return;
    }
    applyForSeller({
      storeName: storeName.trim(),
      businessType,
      gstin: gstin.trim() || undefined,
      address: storeAddress.trim() || 'Bengaluru Central Market'
    });
    setStep('submitted_wait');
  };

  // Handle Provider Submit
  const handleFinishProvider = () => {
    applyForProvider({
      tradeCategory,
      experienceYears: Number(experienceYears) || 3,
      hourlyRate: Number(hourlyRate) || 350,
      idProofType: 'Aadhaar Card',
      idProofNumber: idProofNumber.trim() || '5421-XXXX-9810'
    });
    setStep('submitted_wait');
  };

  return (
    <div className="min-h-[720px] flex flex-col justify-between p-6 bg-white animate-in fade-in duration-300">
      {/* ── 1. SPLASH ────────────────────────────────────────────────────────── */}
      {step === 'splash' && (
        <div
          onClick={() => setStep('login_phone')}
          className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer select-none space-y-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-2xl shadow-red-500/40 text-white font-black text-4xl tracking-tighter animate-pulse">
            NSO
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-600 tracking-tight">NewShopping Orbit</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Your needs. Our orbit.</p>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Bengaluru Marketplace Pilot</p>
          </div>
          <div className="pt-8">
            <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-mono font-bold">
              Tap to enter...
            </span>
          </div>
        </div>
      )}

      {/* ── 2. PHONE SIGN IN ────────────────────────────────────────────────── */}
      {step === 'login_phone' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                NSO
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In / Register</h2>
              <p className="text-xs text-slate-500">
                Enter your mobile number to get started with NSO.
              </p>
            </div>

            {/* Quick Demo Pre-set Pill */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Marketplace Roles &amp; Numbers:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPhone('8310421121')}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-bold text-[11px] text-red-700 shadow-xs hover:bg-amber-100"
                >
                  👑 Owner (8310421121)
                </button>
                <button
                  type="button"
                  onClick={() => setPhone('9876543210')}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-bold text-[11px] text-slate-700 shadow-xs hover:bg-amber-100"
                >
                  👤 User/Applicant (9876543210)
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="8310421121"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{isSubmitting ? 'Sending Code...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. OTP VERIFICATION ────────────────────────────────────────────── */}
      {step === 'otp' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 2 of 2</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Enter 6-Digit Code</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sent to <span className="font-bold text-slate-800">+91 {phone}</span>
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono font-black tracking-widest py-3.5 bg-slate-50 border-2 border-red-500/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-center text-slate-400">
                Tip: Enter the code shown in toast or <span className="font-bold text-slate-600">123456</span>
              </p>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep('login_phone')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold text-center py-2"
          >
            Change Phone Number
          </button>
        </div>
      )}

      {/* ── 4. CHOOSE YOUR ROLE / FLOWCHART ─────────────────────────────────── */}
      {step === 'select_role' && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Select Account Path</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              How will you use NSO?
            </h2>
            <p className="text-xs text-slate-500">
              Choose your role. You can always apply for additional roles later.
            </p>
          </div>

          <div className="space-y-3">
            {/* 1. Customer */}
            <div
              onClick={() => setStep('customer_form')}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-red-500 bg-white shadow-xs cursor-pointer active:scale-98 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm text-slate-900">1. Customer (Shopping &amp; Bookings)</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Browse products, order doorstep delivery, and book trusted home services.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
            </div>

            {/* 2. Seller */}
            <div
              onClick={() => setStep('seller_form')}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-red-500 bg-white shadow-xs cursor-pointer active:scale-98 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm text-slate-900">2. Become a Product Seller</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Register your store, list physical items, and fulfill orders across Bengaluru.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
            </div>

            {/* 3. Provider */}
            <div
              onClick={() => setStep('provider_form')}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-red-500 bg-white shadow-xs cursor-pointer active:scale-98 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm text-slate-900">3. Join as Service Provider</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Offer Electrician, Plumbing, Cleaning, or AC services with real-time slot bookings.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Sellers &amp; Service Providers are reviewed by the Owner before listings go live.
          </p>
        </div>
      )}

      {/* ── 5. CUSTOMER FORM ─────────────────────────────────────────────────── */}
      {step === 'customer_form' && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Customer Setup</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Set Up Your Profile
              </h2>
              <p className="text-xs text-slate-500">
                Enter your details to start shopping right away.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Area / Locality in Bengaluru</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar / Koramangala / Whitefield"
                  value={custArea}
                  onChange={(e) => setCustArea(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Flat 402, 100ft Road, Bengaluru - 560038"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleFinishCustomer}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Enter NSO Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 6. SELLER APPLICATION FORM ───────────────────────────────────────── */}
      {step === 'seller_form' && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Seller Portal</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Register Your Store
              </h2>
              <p className="text-xs text-slate-500">
                Application will be sent to the Owner Admin Console for verification.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Store / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru Electronics Hub"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Retail Store">Retail Store</option>
                  <option value="Direct Brand / Manufacturer">Direct Brand / Manufacturer</option>
                  <option value="Authorized Distributor">Authorized Distributor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">GSTIN / Business Registration (Optional)</label>
                <input
                  type="text"
                  placeholder="29AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Store / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="Shop 12, Commercial Street, Bengaluru"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleFinishSeller}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Submit Seller Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep('select_role')}
              className="w-full text-xs text-slate-400 font-bold py-1.5"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      )}

      {/* ── 7. PROVIDER APPLICATION FORM ────────────────────────────────────── */}
      {step === 'provider_form' && (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Service Provider Hub</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Join as Service Specialist
              </h2>
              <p className="text-xs text-slate-500">
                Application will be sent to the Owner Admin Console for review.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Trade Category</label>
                <select
                  value={tradeCategory}
                  onChange={(e) => setTradeCategory(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Electrical">Electrical (Diagnostics &amp; Wiring)</option>
                  <option value="Plumbing">Plumbing (Taps, Drain &amp; Pumps)</option>
                  <option value="Cleaning">Deep Cleaning &amp; Sanitization</option>
                  <option value="Appliance Care">AC &amp; Home Appliance Care</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Inspection Rate (₹)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Government ID / Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-9810"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleFinishProvider}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Submit Provider Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep('select_role')}
              className="w-full text-xs text-slate-400 font-bold py-1.5"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      )}

      {/* ── 8. APPLICATION SUBMITTED AWAITING REVIEW ────────────────────────── */}
      {step === 'submitted_wait' && (
        <div className="flex-1 flex flex-col justify-between py-6 text-center">
          <div className="space-y-4 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-md border border-amber-200">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Application Submitted
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-3">
                Sent to Owner Admin Console
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Your application has been received. The marketplace owner (Phone 8310421121) can now view and approve your profile from their Admin Console.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                showToast('Entering as Customer while application is reviewed...');
                onComplete();
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Marketplace in the Meantime</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
