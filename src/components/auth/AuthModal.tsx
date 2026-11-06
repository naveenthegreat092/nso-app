import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { promptBiometricAuth } from '../../utils/biometrics';
import {
  X,
  ShieldCheck,
  Phone,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Timer,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Fingerprint,
  ScanFace
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginUser, showToast } = useApp();
  const [step, setStep] = useState<'welcome' | 'input' | 'otp' | 'roles'>('welcome');
  const [phoneInput, setPhoneInput] = useState('8310421121');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('5829');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if Firebase auth has been configured
  const isFirebaseActive = Boolean((window as any).__NSO_FIREBASE_READY);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneInput.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }

    setOtpError(null);
    setOtpDigits(['', '', '', '']);

    if (isFirebaseActive && (window as any).__NSO_SEND_FIREBASE_OTP) {
      try {
        await (window as any).__NSO_SEND_FIREBASE_OTP(`+91${cleanNumber}`);
        showToast(`📲 Real SMS OTP sent via Firebase to +91 ${cleanNumber}`);
      } catch (err: any) {
        console.warn('Firebase SMS failed, falling back to instant code:', err);
      }
    } else {
      // Generate clean 4-digit demo OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      showToast(`📲 SMS Sent: Your NSO login verification code is ${code}`);
    }

    setCountdown(30);
    setCanResend(false);
    setStep('otp');

    // Auto-focus first digit input after step transition
    setTimeout(() => {
      inputRefs[0]?.current?.focus();
    }, 150);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setOtpError(null);

    // Auto-advance
    if (char && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }

    // Auto-verify when 4th digit entered
    if (char && index === 3) {
      const fullCode = updated.join('');
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const verifyCode = async (codeToVerify?: string) => {
    const entered = codeToVerify || otpDigits.join('');
    if (entered.length < 4) {
      setOtpError('Please enter all 4 digits');
      return;
    }

    setIsVerifying(true);

    if (isFirebaseActive && (window as any).__NSO_VERIFY_FIREBASE_OTP) {
      try {
        const success = await (window as any).__NSO_VERIFY_FIREBASE_OTP(entered);
        if (success) {
          showToast('✅ Firebase SMS Phone Verified!');
          setIsVerifying(false);
          setStep('roles');
          return;
        }
      } catch (err: any) {
        setOtpError('Invalid SMS code. Please try again.');
        setIsVerifying(false);
        return;
      }
    }

    // Demo Mode Verification (passes if matches generated OTP or standard demo 1234 / 5829)
    setTimeout(() => {
      setIsVerifying(false);
      if (entered === generatedOtp || entered === '1234' || entered === '5829') {
        showToast('✅ Mobile number verified successfully!');
        setStep('roles');
      } else {
        setOtpError(`Incorrect code. Use [${generatedOtp}] for this session.`);
      }
    }, 400);
  };

  const handleResend = () => {
    if (!canResend) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    setOtpError(null);
    showToast(`📲 New SMS Code dispatched: ${code}`);
    inputRefs[0]?.current?.focus();
  };

  const handleBiometricLogin = async () => {
    showToast('🔍 Scanning Fingerprint / Face Recognition...');
    const verified = await promptBiometricAuth('NSO Customer');
    if (verified) {
      showToast('🟢 Biometrics Verified! Logging in...');
      loginUser(`+91 ${phoneInput.replace(/\D/g, '')}`, selectedRole);
    } else {
      showToast('Biometric scan cancelled. Please use OTP.');
    }
  };

  const handleCompleteAuth = () => {
    const formattedPhone = phoneInput.startsWith('+91') ? phoneInput : `+91 ${phoneInput.replace(/\D/g, '')}`;
    loginUser(formattedPhone, selectedRole);
    setStep('welcome');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              NSO
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm block leading-tight">Account Verification</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                {isFirebaseActive ? '🟢 Live Firebase SMS OTP' : '⚡ Instant SMS Gateway'}
              </span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          {step === 'welcome' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-inner">
                <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                One Account. Three Roles.
              </h2>
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                Log in with your mobile number to access the consumer marketplace, personal home services, or verified seller capabilities.
              </p>

              {/* Status Hint */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 my-5 text-left text-xs space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  <span>Secure Phone OTP Authentication:</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {isFirebaseActive
                    ? 'Firebase SMS gateway active for live device verification.'
                    : 'Instant OTP simulation ready for instant phone login.'}
                </p>
              </div>

              <button
                onClick={() => setStep('input')}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Continue with Mobile Number</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sign In or Register</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 10-digit Indian phone number to receive a secure OTP code.
                </p>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-slate-500 font-bold text-sm">
                  <span>🇮🇳</span>
                  <span>+91</span>
                  <span className="text-slate-300">|</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="8310421121"
                  required
                  className="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-md shadow-red-500/25 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pt-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">OR</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <ScanFace className="w-4 h-4 text-emerald-600" />
                <span>One-Touch Fingerprint / Face ID</span>
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enter 4-Digit Code</h3>
                <p className="text-xs text-gray-500 mt-1">
                  We sent a code to <strong className="text-slate-900 font-mono">+91 {phoneInput}</strong>
                </p>
              </div>

              {/* 4 Box OTP Input */}
              <div className="flex justify-center gap-2.5 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-14 text-center text-2xl font-mono font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-red-600 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* One-Tap Auto Fill Hint */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  Simulated OTP Code for this session:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = generatedOtp.split('');
                    setOtpDigits(digits);
                    verifyCode(generatedOtp);
                  }}
                  className="mt-1 font-mono font-black text-emerald-700 text-sm bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-sm hover:bg-emerald-100 transition-colors"
                >
                  {generatedOtp} <span className="text-[10px] font-sans font-bold">(Tap to Auto-Fill)</span>
                </button>
              </div>

              {/* Countdown / Resend */}
              <div className="text-center text-xs text-slate-500 pt-1">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="font-bold text-red-600 hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-slate-400">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Resend in {countdown}s</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => verifyCode()}
                disabled={isVerifying}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-98"
              >
                {isVerifying ? 'Verifying OTP...' : 'Verify & Continue'}
              </button>
            </div>
          )}

          {step === 'roles' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Choose Default View</h3>
                <p className="text-xs text-gray-500 mt-1">
                  You can seamlessly switch between authorized views anytime from the profile menu.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'customer' as Role,
                    title: 'Customer Experience',
                    desc: 'Shop physical products, book doorstep services, AI Assistant',
                    color: 'border-blue-200 hover:bg-blue-50/50'
                  },
                  {
                    id: 'seller' as Role,
                    title: 'Product Seller',
                    desc: 'List products, manage inventory & track customer orders',
                    color: 'border-emerald-200 hover:bg-emerald-50/50'
                  },
                  {
                    id: 'provider' as Role,
                    title: 'Service Specialist',
                    desc: 'Manage calendar, home visit bookings & completion quotes',
                    color: 'border-amber-200 hover:bg-amber-50/50'
                  },
                  {
                    id: 'admin' as Role,
                    title: 'Admin Console',
                    desc: 'Manage approvals, payments, analytics & audit trail',
                    color: 'border-purple-200 hover:bg-purple-50/50'
                  }
                ].map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedRole === r.id ? 'border-red-600 bg-red-50/60 shadow-sm' : r.color
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{r.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                    {selectedRole === r.id && (
                      <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCompleteAuth}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-98"
              >
                Enter NSO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
