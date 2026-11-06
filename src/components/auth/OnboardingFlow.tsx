import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Phone,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { Role } from '../../types';
import { useApp } from '../../context/AppContext';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { loginUser } = useApp();
  const [step, setStep] = useState<'splash' | 'welcome' | 'signup' | 'otp' | 'roles' | 'verify'>('splash');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [name, setName] = useState('Naveen U.');
  const [otp, setOtp] = useState('1234');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');

  // Splash 2-3 sec auto-timer or click
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('welcome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = () => {
    loginUser(phone, selectedRole);
    onComplete();
  };

  return (
    <div className="min-h-[720px] flex flex-col justify-between p-6 bg-white animate-in fade-in duration-300">
      {/* 1. SPLASH SCREEN (Screen 1 in Flowchart) */}
      {step === 'splash' && (
        <div 
          onClick={() => setStep('welcome')}
          className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer select-none space-y-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-2xl shadow-red-500/40 text-white font-black text-4xl tracking-tighter animate-bounce">
            NSO
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-600 tracking-tight">
              NewShopping Orbit
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Your needs. Our orbit.</p>
          </div>
          <div className="pt-8">
            <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-mono font-bold">
              Tap anywhere or wait 2s to start...
            </span>
          </div>
        </div>
      )}

      {/* 2. WELCOME SCREEN (Screen 2 in Flowchart) */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between py-6">
          <div className="text-center pt-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
              NSO
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome to NSO
              </h2>
              <p className="text-xs text-red-600 font-bold uppercase tracking-widest mt-1">
                Shop • Book • Solve
              </p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed">
                India's all-in-one marketplace for physical products, verified home & personal services, and guided AI assistance.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('signup')}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep('signup')}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 transition-all"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      )}

      {/* 3. SIGN UP / CREATE ACCOUNT (Screen 3 in Flowchart) */}
      {step === 'signup' && (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 1 of 3</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                Create Account
              </h2>
              <p className="text-xs text-gray-500">One account connects you to all marketplace features.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Mobile or Email</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>We will send an OTP via SMS to verify your mobile number.</span>
            </div>
          </div>

          <button
            onClick={() => setStep('otp')}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Send Verification OTP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. OTP VERIFICATION (Screen 4 in Flowchart) */}
      {step === 'otp' && (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 2 of 3</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                Verify Mobile Number
              </h2>
              <p className="text-xs text-gray-500">
                Code sent to <span className="font-semibold text-gray-800">{phone}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl font-mono font-black tracking-widest py-3.5 bg-gray-50 border-2 border-red-500/40 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-slate-500 text-center font-semibold mt-2">
                Enter 4-digit OTP sent to {phone} (Default code: 1234)
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('roles')}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Verify & Choose Role</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. ROLE SELECTION (Screen 5 in Flowchart: One Account, Three Roles) */}
      {step === 'roles' && (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Step 3 of 3</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                Choose Your Role
              </h2>
              <p className="text-xs text-gray-500">
                You can switch between authorized roles anytime from the header.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'customer' as Role,
                  title: 'Customer',
                  desc: 'Shop physical products, book services, ask AI',
                  badge: 'Immediate Access'
                },
                {
                  id: 'seller' as Role,
                  title: 'Product Seller',
                  desc: 'List catalog, set delivery fees, manage orders',
                  badge: 'Admin Approval Required'
                },
                {
                  id: 'provider' as Role,
                  title: 'Service Provider',
                  desc: 'Offer verified trade services, manage slots',
                  badge: 'Category Verification Required'
                }
              ].map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedRole === r.id
                      ? 'border-red-600 bg-red-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-gray-900">{r.title}</h4>
                      <span className="text-[9px] bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.2 rounded">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{r.desc}</p>
                  </div>
                  {selectedRole === r.id && (
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => (selectedRole === 'customer' ? handleFinish() : setStep('verify'))}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{selectedRole === 'customer' ? 'Enter Marketplace' : 'Proceed to Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. IDENTITY VERIFICATION (Screen 6 in Flowchart: Required for Sellers/Providers) */}
      {step === 'verify' && (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Verification Stage</span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                Identity & Trade Proof
              </h2>
              <p className="text-xs text-gray-500">
                Admin verifies each seller and service category before live transactions occur.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">1. Government Photo ID (Aadhaar / PAN)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Uploaded ✓</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">2. Trade / GST License Certificate</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Uploaded ✓</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-medium text-slate-700">3. Address Proof & Bank Settlement Info</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Uploaded ✓</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
              <span className="font-bold block">Status: Under Admin Review</span>
              Admin approval simulation is pre-granted for demo purposes so you can inspect the dashboards.
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Submit Application & Enter App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
