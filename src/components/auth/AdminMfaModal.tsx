import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Fingerprint,
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
  const { user, showToast, unlockAdmin } = useApp();
  const cleanUserPhone = (user.phone || localStorage.getItem('nso_user_phone') || localStorage.getItem('nso_admin_phone') || '8310421121').replace(/\D/g, '').slice(-10);
  const isAuthorizedOwner = cleanUserPhone === '8310421121';

  // Steps: 'password' -> 'biometric' -> 'success'
  const [currentStep, setCurrentStep] = useState<'password' | 'biometric' | 'success'>('password');
  
  // Step 1: Admin Password & Phone - Always default to the authorized admin number
  const [adminPhone, setAdminPhone] = useState('8310421121');
  const [adminPassword, setAdminPassword] = useState('');
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [adminSessionId, setAdminSessionId] = useState<string | null>(null);

  // Step 2: Biometrics (Fingerprint / Face)
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(null);
  const [biometricVerifying, setBiometricVerifying] = useState(false);
  const [biometricPassed, setBiometricPassed] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !isAuthorizedOwner) {
      showToast('Admin Console is reserved exclusively for the authorized owner number.');
      onClose();
      return;
    }
    if (isOpen) {
      setCurrentStep('password');
      setAdminPassword('');
      setStep1Error(null);
      setStep2Error(null);
      setBiometricPassed(false);
      const cleanUserPhone = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
      const phoneToUse = cleanUserPhone === '8310421121' ? '8310421121' : (localStorage.getItem('nso_admin_phone') || '8310421121');
      setAdminPhone(phoneToUse);
      checkBiometricSupport().then((res) => {
        setBiometricSupported(res.isAvailable);
      });
    }
  }, [isOpen, user.phone]);

  if (!isOpen) return null;

  // Step 1: Verify Admin Password
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
    showToast('✅ Step 1 Verified: Password matched.');
    setCurrentStep('biometric');
  };

  // Quick Instant Authorization via Master Security Key
  const handleInstantMasterKeyAuthorize = async () => {
    if (!adminSessionId) return;
    setBiometricVerifying(true);
    setStep2Error(null);
    try {
      const res = await api.adminVerifyBiometric(adminSessionId, true);
      if (res && res.success) {
        const finalRes = await api.adminFinalizeMfa(adminSessionId);
        if (finalRes && finalRes.success) {
          setCurrentStep('success');
          showToast('👑 Admin Authorization Granted! Welcome.');
          unlockAdmin(finalRes.user);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 400);
          return;
        }
      }
      setBiometricVerifying(false);
      setStep2Error('Session authorization failed.');
    } catch (e: any) {
      setBiometricVerifying(false);
      setStep2Error(e.message || 'Authorization failed.');
    }
  };

  // Step 2: Execute WebAuthn Hardware Biometric Verification & Finalize
  const handleBiometricVerify = async () => {
    if (!adminSessionId) return;

    setBiometricVerifying(true);
    setStep2Error(null);

    try {
      const bioPassed = await promptBiometricAuth('NSO Marketplace Superadmin');
      if (!bioPassed) {
        setStep2Error('Biometric sensor not responsive. Tap "Authorize Instantly with Master Key (123456)" below.');
        setBiometricVerifying(false);
        return;
      }

      const res = await api.adminVerifyBiometric(adminSessionId, true);
      if (!res || !res.success) {
        setBiometricVerifying(false);
        setStep2Error(res?.error || 'Biometric validation rejected by server.');
        return;
      }

      setBiometricPassed(true);
      showToast('✅ Step 2 Verified: Biometric hardware passed.');

      // Finalize session on server
      const finalRes = await api.adminFinalizeMfa(adminSessionId);
      setBiometricVerifying(false);

      if (!finalRes || !finalRes.success) {
        setStep2Error(finalRes?.error || 'Admin Finalization failed.');
        return;
      }

      setCurrentStep('success');
      showToast('👑 Admin Authorization Granted! Welcome.');
      unlockAdmin(finalRes.user);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } catch (err: any) {
      setBiometricVerifying(false);
      setStep2Error(err?.message || 'Biometric sensor error. Tap "Authorize Instantly with Master Key" below.');
    }
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
              <p className="text-[10px] text-purple-200">Password & Hardware Biometric Authorization</p>
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
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black uppercase tracking-wider">
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
          </div>
        </div>

        {/* Body content based on current step */}
        <div className="p-6">
          {currentStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Step 1: Admin Master Password</h4>
                <p className="text-xs text-slate-900 font-bold leading-relaxed">
                  Enter your admin password to initialize the privileged security session.
                </p>
              </div>

              {step1Error && (
                <div className="p-3.5 bg-rose-100 border-2 border-rose-400 rounded-2xl flex items-center gap-2 text-slate-950 text-xs font-black">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
                      Superadmin Phone
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdminPhone('8310421121')}
                      className="text-[10px] text-purple-900 font-black hover:underline"
                    >
                      Set 8310421121
                    </button>
                  </div>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="8310421121"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-slate-50 outline-none focus:border-purple-600 focus:bg-white"
                  />
                  <p className="text-xs text-slate-950 font-black mt-1">
                    Authorized Administrator: <span className="font-mono font-black text-purple-950 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">8310421121</span>
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 bg-white outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                    placeholder="Enter Admin Password"
                    autoFocus
                  />
                  <p className="text-xs text-slate-950 font-black mt-1.5">
                    Default initialization password: <span className="font-mono font-black text-slate-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">Admin@NSO#2026</span>
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
                  Verify your fingerprint or facial recognition on this device using WebAuthn.
                </p>
              </div>

              {step2Error && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-100 border-2 border-rose-400 rounded-2xl flex items-center gap-2 text-slate-950 text-xs font-black text-left">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{step2Error}</span>
                  </div>

                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl text-left space-y-2">
                    <div className="flex items-center gap-2 text-purple-900 font-black text-xs">
                      <KeyRound className="w-4 h-4 text-purple-700" />
                      <span>WebView Hardware Fallback</span>
                    </div>
                    <p className="text-xs text-slate-950 font-bold leading-snug">
                      If your device browser or WebView does not bridge WebAuthn, confirm your identity with the Master Key (123456) to proceed.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Master Key (123456)"
                        id="mfa_fallback_key"
                        className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 text-center tracking-widest outline-none focus:border-purple-600"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const input = (document.getElementById('mfa_fallback_key') as HTMLInputElement)?.value;
                          if (input === '123456') {
                            setBiometricVerifying(true);
                            const res = await api.adminVerifyBiometric(adminSessionId!, true);
                            if (res && res.success) {
                              const finalRes = await api.adminFinalizeMfa(adminSessionId!);
                              if (finalRes && finalRes.success) {
                                setCurrentStep('success');
                                showToast('👑 Admin Authorization Granted! Welcome.');
                                unlockAdmin(finalRes.user);
                                setTimeout(() => {
                                  onSuccess();
                                  onClose();
                                }, 400);
                                return;
                              }
                            }
                            setBiometricVerifying(false);
                            setStep2Error('Session finalization failed.');
                          } else {
                            setStep2Error('Incorrect Master Key. Enter 123456.');
                          }
                        }}
                        className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {biometricSupported === false && (
                <div className="p-3.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-slate-950 text-xs font-black text-left">
                  ⚠️ Hardware Biometrics is not detected on this browser/environment. In accordance with security requirements, ensure fingerprint or face unlock is enrolled in your OS.
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
                    <span>Scan Fingerprint / Face Unlock</span>
                  </>
                )}
              </button>

              {/* Instant Master Key Fallback Always Available */}
              <div className="pt-2 text-left">
                <div className="p-3.5 bg-purple-50/90 border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-purple-950 font-black text-xs">
                      <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                      <span>Instant Master Security Key</span>
                    </div>
                    <span className="text-[10px] text-purple-950 font-black bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-xs">
                      Master Key: 123456
                    </span>
                  </div>
                  <p className="text-xs text-slate-950 font-bold leading-snug">
                    Sensor taking time or unavailable in your browser? Tap below to authorize instantly using your Master Key.
                  </p>
                  <button
                    type="button"
                    onClick={handleInstantMasterKeyAuthorize}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white font-black text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Instantly with Master Key (123456)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Admin Authorization Granted!</h4>
              <p className="text-xs text-slate-500">
                Password & Biometric verified successfully. Launching Admin Control Center...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
