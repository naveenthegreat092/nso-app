import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  Phone,
  ArrowRight,
  Lock,
  Smartphone,
  Timer,
  RefreshCw,
  AlertCircle,
  KeyRound,
  User,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginUser, showToast } = useApp();

  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'welcome' | 'input' | 'otp'>('welcome');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Password Login & Registration States
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Bengaluru');
  const [regPincode, setRegPincode] = useState('560001');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('welcome');
      setPhoneInput('');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setCanResend(false);
      setCountdown(30);
      setAuthMode('otp');
      setPassword('');
      setIdentifier('');
    }
  }, [isAuthModalOpen]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
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

    setIsSending(true);
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);

    const result = await api.sendOtp(`+91${cleanNumber}`);

    setIsSending(false);

    if (!result || !result.success) {
      showToast('Failed to send OTP. Please check your number and try again.');
      return;
    }

    if (result.debugOtp) {
      showToast(`Verification code: ${result.debugOtp}`);
      setOtpDigits(result.debugOtp.split(''));
    } else {
      showToast('A verification code has been sent to your phone');
    }
    setCountdown(30);
    setCanResend(false);
    setStep('otp');

    setTimeout(() => {
      inputRefs[0]?.current?.focus();
    }, 150);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setOtpError(null);

    if (char && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }

    if (char && index === 5) {
      const fullCode = updated.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const verifyCode = async (codeToVerify?: string) => {
    const entered = codeToVerify || otpDigits.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    const cleanNumber = phoneInput.replace(/\D/g, '');
    const result = await api.verifyOtp(`+91${cleanNumber}`, entered);

    setIsVerifying(false);

    if (!result || !result.success) {
      setOtpError('Incorrect code. Please check and try again.');
      return;
    }

    showToast('✅ Mobile number verified successfully!');
    await loginUser();
    setStep('welcome');
    closeAuthModal();
  };

  const handleResend = async () => {
    if (!canResend) return;
    const cleanNumber = phoneInput.replace(/\D/g, '');
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    setOtpError(null);

    const result = await api.sendOtp(`+91${cleanNumber}`);
    if (result?.success) {
      showToast('A new verification code has been sent to your phone');
    } else {
      showToast('Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
    inputRefs[0]?.current?.focus();
  };

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter your phone/username and password');
      return;
    }

    setPasswordLoading(true);
    const res = await api.loginWithPassword({ identifier: identifier.trim(), password: password.trim() });
    setPasswordLoading(false);

    if (!res || !res.success) {
      showToast(res?.error || 'Invalid phone/username or password');
      return;
    }

    showToast('✅ Successfully logged in!');
    await loginUser();
    closeAuthModal();
  };

  // Password Registration Handler
  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regName.trim() || cleanPhone.length < 10 || !regPassword.trim()) {
      showToast('Please fill all required fields with a valid 10-digit number and password');
      return;
    }

    setPasswordLoading(true);
    const res = await api.registerCustomerWithPassword({
      name: regName.trim(),
      phone: `+91${cleanPhone.slice(-10)}`,
      password: regPassword.trim(),
      username: regUsername.trim() || undefined,
      city: regCity,
      pincode: regPincode,
      address: `${regCity}, Karnataka`
    });
    setPasswordLoading(false);

    if (!res || !res.success) {
      showToast(res?.error || 'Failed to register account');
      return;
    }

    showToast('✅ Account registered and signed in!');
    await loginUser();
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              NSO
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm block leading-tight">NSO Orbit Account</span>
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Verified & Secure Authentication
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

        {/* Auth Mode Toggle Pill */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setStep('input'); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'otp' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          {authMode === 'password' ? (
            <div>
              {!isRegisterMode ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Sign In with Password</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter your mobile number, Account ID, or username.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Phone / Account ID / Username
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. 9876543210 or NSO-CUST-1234"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md shadow-red-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
                  >
                    {passwordLoading ? 'Signing In...' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-xs font-bold text-red-600 hover:text-red-700"
                    >
                      New to NSO Orbit? Create Account with Password →
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordRegister} className="space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Create Account</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Register a password-protected account for marketplace and services.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone (10 digits) *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Username (Optional)</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. ramesh_k"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Password *</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Choose a secure password"
                      required
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md shadow-red-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
                  >
                    {passwordLoading ? 'Registering...' : 'Register & Log In'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      ← Back to Password Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              {step === 'welcome' && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-inner">
                    <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    One Account. Multiple Roles.
                  </h2>
                  <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Log in with your mobile number to access the consumer marketplace, personal home
                    services, or verified seller capabilities.
                  </p>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 my-5 text-left text-xs space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span>Instant Phone OTP Verification:</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enter your mobile number to receive a one-time verification code via SMS.
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
                      placeholder="Enter 10-digit number"
                      required
                      autoComplete="tel"
                      className="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-md shadow-red-500/25 transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      'Sending OTP...'
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    By continuing, you agree to NSO's Terms of Service &amp; Privacy Policy
                  </p>
                </form>
              )}

              {step === 'otp' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Enter 6-Digit Code</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      A verification code has been sent to{' '}
                      <strong className="text-slate-900 font-mono">+91 {phoneInput}</strong>
                    </p>
                  </div>

                  {/* 6-Box OTP Input */}
                  <div className="flex justify-center gap-2 py-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpDigits[idx]}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                        className="w-11 h-12 text-center text-xl font-mono font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-red-600 focus:outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <span className="text-[11px] text-blue-700 font-medium">
                      Didn't receive the SMS? Check your phone and wait for 30 seconds before resending.
                    </span>
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
                    {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
                  >
                    ← Change phone number
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
