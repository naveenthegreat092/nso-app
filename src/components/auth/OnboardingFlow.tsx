import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Clock,
  RefreshCw,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { registerCustomerProfile, checkMyApprovalStatus, openAuthModal, user, showToast } = useApp();
  const [step, setStep] = useState<'splash' | 'welcome' | 'signup' | 'otp' | 'awaiting_approval'>('splash');

  // Registration Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560001');

  // Verification & Checking
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Auto-progress from splash
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('welcome');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Check if current user is already registered & pending
  useEffect(() => {
    if (user.isLoggedIn) {
      if (user.approvalStatus === 'approved' || user.activeRole === 'admin') {
        onComplete();
      } else if (user.approvalStatus === 'pending') {
        setStep('awaiting_approval');
      }
    }
  }, [user, onComplete]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!name.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!houseNumber.trim() || !streetNumber.trim() || !landmark.trim()) {
      showToast('Please enter house number, street number & landmark');
      return;
    }

    setIsSubmitting(true);
    const res = await api.sendOtp(`+91${clean}`);
    setIsSubmitting(false);

    if (!res || !res.success) {
      showToast('Failed to send verification code. Please check your number.');
      return;
    }

    showToast(`Verification code sent to +91 ${clean}`);
    setOtp('');
    setOtpError(null);
    setStep('otp');
  };

  const handleVerifyOtpAndRegister = async () => {
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    const verifyRes = await api.verifyOtp(`+91${cleanPhone}`, cleanOtp);

    if (!verifyRes || !verifyRes.success) {
      setIsSubmitting(false);
      setOtpError('Invalid or expired code. Please try again.');
      return;
    }

    registerCustomerProfile({
      name: name.trim(),
      phone: `+91 ${cleanPhone}`,
      houseNumber: houseNumber.trim(),
      streetNumber: streetNumber.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim()
    });

    setIsSubmitting(false);
    setStep('awaiting_approval');
  };

  const handleCheckApproval = async () => {
    setIsChecking(true);
    const approved = await checkMyApprovalStatus();
    setIsChecking(false);
    if (approved) {
      showToast('Account verified! Welcome to NSO.');
      onComplete();
    } else {
      showToast('Application still pending owner review. We will notify you once approved.');
    }
  };

  return (
    <div className="min-h-[720px] flex flex-col justify-between p-6 bg-white animate-in fade-in duration-300">
      {/* 1. SPLASH SCREEN */}
      {step === 'splash' && (
        <div
          onClick={() => setStep('welcome')}
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
              Tap anywhere to begin...
            </span>
          </div>
        </div>
      )}

      {/* 2. WELCOME SCREEN */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          <div className="text-center pt-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
              NSO
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to NSO</h2>
              <p className="text-xs text-red-600 font-bold uppercase tracking-widest mt-1">Bengaluru • Products • Services</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
                Connect with verified local sellers and service specialists across Bengaluru. Every account and listing is reviewed by the marketplace owner before activation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('signup')}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Set Up Customer Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal()}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-gray-500" />
              <span>Already registered? Sign In with OTP</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PROFILE & ADDRESS REGISTRATION */}
      {step === 'signup' && (
        <form onSubmit={handleSendOtp} className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 1 of 2</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">Your Profile &amp; Address</h2>
              <p className="text-xs text-gray-500">Accurate delivery address required for orders and doorstep services.</p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700">Mobile Phone Number *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Bengaluru Delivery &amp; Service Address</span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">House / Flat No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 302, Block A"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Street / Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="5th Main, Koramangala"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="mt-2.5">
                  <label className="text-[11px] font-bold text-gray-700">Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="Near Sony Signal / Water Tank"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>We will send a 6-digit OTP to your phone to verify this account.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* 4. OTP VERIFICATION */}
      {step === 'otp' && (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 2 of 2</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">Verify Mobile Number</h2>
              <p className="text-xs text-gray-500">
                Enter the 6-digit code sent to <span className="font-semibold text-gray-800">+91 {phone}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono font-black tracking-widest py-3.5 bg-gray-50 border-2 border-red-500/40 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center mt-3 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleVerifyOtpAndRegister}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{isSubmitting ? 'Verifying & Registering...' : 'Verify & Submit Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. AWAITING OWNER APPROVAL SCREEN */}
      {step === 'awaiting_approval' && (
        <div className="flex-1 flex flex-col justify-between py-4 text-center">
          <div className="space-y-4 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-md border border-amber-200">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Pending Owner Review
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-3">
                Profile Under Review
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Thank you for signing up. The NSO marketplace owner verifies new accounts before enabling ordering and booking in Bengaluru.
              </p>
            </div>

            {/* Submitted Profile Card */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase">Registered Details</span>
                <span className="text-[11px] font-bold text-slate-800">{user.name || name}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p><span className="font-bold text-slate-700">Phone:</span> {user.phone || phone}</p>
                <p><span className="font-bold text-slate-700">Address:</span> {user.address || `${houseNumber}, ${streetNumber}, ${landmark}, ${city} - ${pincode}`}</p>
                <p><span className="font-bold text-slate-700">Status:</span> <span className="text-amber-600 font-bold uppercase">{user.approvalStatus || 'pending'}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleCheckApproval}
              disabled={isChecking}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
