import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Fingerprint,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  ScanFace
} from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { checkBiometricSupport, promptBiometricAuth } from '../../utils/biometrics';

interface AdminMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminMfaModal: React.FC<AdminMfaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, showToast, loginUser } = useApp();

  // MFA Steps: 1: 'password' -> 2: 'biometric' -> 3: 'email_otp' -> 4: 'success'
  const [currentStep, setCurrentStep] = useState<'password' | 'biometric' | 'email_otp' | 'success'>('password');
  
  // Step 1: Admin Password & Phone
  const [adminPhone, setAdminPhone] = useState('8310421121');
  const [adminPassword, setAdminPassword] = useState('');
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [adminSessionId, setAdminSessionId] = useState<string | null>(null);
  const [emailMasked, setEmailMasked] = useState<string>('a***@nso.in');

  // Step 2: Biometrics (Fingerprint / Face)
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(null);
  const [biometricVerifying, setBiometricVerifying] = useState(false);
  const [biometricPassed, setBiometricPassed] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Step 3: Email OTP
  const [emailOtp, setEmailOtp] = useState('');
  const [step3Loading, setStep3Loading] = useState(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('password');
      setAdminPassword('');
      setStep1Error(null);
      setStep2Error(null);
      setStep3Error(null);
      setBiometricPassed(false);
      setEmailOtp('');
      checkBiometricSupport().then((res) => {
        setBiometricSupported(res.isAvailable);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Verify Admin Password & Trigger Email OTP
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setStep1Error('Please enter the Admin Master Password');
      return;
    }

    setStep1Loading(true);
    setStep1Error(null);

    const clean = adminPhone.replace(/\D/g, '').slice(-10);
    const res = await api.adminStartMfa(clean, adminPassword.trim());
    setStep1Loading(false);

    if (!res || !res.success || !res.adminSessionId) {
      setStep1Error(res?.error || 'Invalid Admin Password. Access denied.');
      return;
    }

    setAdminSessionId(res.adminSessionId);
    if (res.emailMasked) setEmailMasked(res.emailMasked);
    showToast('✅ Step 1 Verified: Password matched.');
    setCurrentStep('biometric');
  };

  // Step 2: Execute WebAuthn Hardware Biometric Verification
  const handleBiometricVerify = async () => {
    if (!adminSessionId) return;

    setBiometricVerifying(true);
    setStep2Error(null);

    try {
      const bioPassed = await promptBiometricAuth('NSO Marketplace Superadmin');
      if (!bioPassed) {
        setStep2Error('Biometric authentication failed or was cancelled by user. Hardware verification required.');
        setBiometricVerifying(false);
        return;
      }

      const res = await api.adminVerifyBiometric(adminSessionId, true);
      setBiometricVerifying(false);

      if (!res || !res.success) {
        setStep2Error(res?.error || 'Biometric validation rejected by server.');
        return;
      }

      setBiometricPassed(true);
      showToast('✅ Step 2 Verified: Biometric hardware passed.');
      setCurrentStep('email_otp');
    } catch (err: any) {
      setBiometricVerifying(false);
      setStep2Error(err?.message || 'Biometric sensor error. Please try again.');
    }
  };

  // Step 3: Verify Email OTP & Finalize Admin Session
  const handleEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = emailOtp.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setStep3Error('Please enter the 6-digit verification code');
      return;
    }

    if (!adminSessionId) return;

    setStep3Loading(true);
    setStep3Error(null);

    // Verify Email OTP
    const verifyRes = await api.adminVerifyEmailOtp(adminSessionId, cleanCode);
    if (!verifyRes || !verifyRes.success) {
      setStep3Loading(false);
      setStep3Error(verifyRes?.error || 'Invalid or expired email OTP');
      return;
    }

    // Step 4: Finalize session (Checks ALL steps)
    const finalRes = await api.adminFinalizeMfa(adminSessionId);
    setStep3Loading(false);

    if (!finalRes || !finalRes.success) {
      setStep3Error(finalRes?.error || 'MFA Finalization failed. All steps must pass.');
      return;
    }

    setCurrentStep('success');
    showToast('👑 Multi-Factor Admin Verification Complete! Welcome.');
    await loginUser();
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Admin Multi-Factor Security</h3>
              <p className="text-[10px] text-purple-200">Strict 3-Tier Zero-Trust Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Step Indicator Pills */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-150 bg-slate-50">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-wider">
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                currentStep === 'password'
                  ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                  : adminSessionId
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>1. Password</span>
            </div>
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                currentStep === 'biometric'
                  ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                  : biometricPassed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>2. Biometric</span>
            </div>
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                currentStep === 'email_otp' || currentStep === 'success'
                  ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>3. Email OTP</span>
            </div>
          </div>
        </div>

        {/* Body content based on current step */}
        <div className="p-6">
          {currentStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Step 1: Admin Master Password</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your marketplace superadmin master password to initialize the privileged security session.
                </p>
              </div>

              {step1Error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Superadmin Phone
                  </label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50 outline-none focus:border-purple-600"
                    placeholder="8310421121"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                    placeholder="Enter Admin Password"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Default initialization password: <span className="font-mono font-bold text-slate-600">Admin@NSO#2026</span>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={step1Loading}
                className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {step1Loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Password...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Biometric Check</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {currentStep === 'biometric' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm">
                <ScanFace className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Step 2: Biometric Hardware Authentication</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Verify your registered fingerprint or facial recognition on this device using WebAuthn.
                </p>
              </div>

              {step2Error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{step2Error}</span>
                </div>
              )}

              {biometricSupported === false && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold text-left">
                  ⚠️ Hardware Biometrics is not detected on this browser/environment. In accordance with zero-trust security requirements, this step cannot be silently skipped. Ensure fingerprint or face unlock is enrolled in your OS.
                </div>
              )}

              <button
                onClick={handleBiometricVerify}
                disabled={biometricVerifying}
                className="w-full py-3.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {biometricVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Sensor...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Prompt Fingerprint / Face Unlock</span>
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 'email_otp' && (
            <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
              <div className="space-y-1 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-slate-900">Step 3: Admin Email Verification</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  A 6-digit security code was dispatched to your registered admin email ({emailMasked}).
                </p>
                <p className="text-[10px] text-purple-700 font-bold bg-purple-50 p-2 rounded-xl mt-1">
                  💡 Note: If email SMTP is unconfigured, check the backend server console log for the dispatched OTP.
                </p>
              </div>

              {step3Error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{step3Error}</span>
                </div>
              )}

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono font-black text-2xl py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-600"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={step3Loading || emailOtp.length !== 6}
                className="w-full py-3.5 bg-purple-900 hover:bg-purple-950 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {step3Loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Finalizing Admin Access...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Admin Session</span>
                  </>
                )}
              </button>
            </form>
          )}

          {currentStep === 'success' && (
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Admin Authorization Granted!</h4>
              <p className="text-xs text-slate-500">
                All 3 security tiers verified successfully. Launching Admin Control Center...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
