import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'refund' | 'contact';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'contact'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 leading-tight">NSO Legal & Policies</h3>
              <p className="text-[10px] text-slate-500 font-semibold">New Shopping Orbit Platform Terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 bg-slate-100 p-1 m-3 rounded-xl text-[10px] font-bold text-center gap-1">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'terms' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'
            }`}
          >
            Terms
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'privacy' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'refund' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'
            }`}
          >
            Refunds
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'contact' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500'
            }`}
          >
            Contact
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 flex-1 leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-600" />
                <span>1. Terms & Conditions</span>
              </h4>
              <p>
                Welcome to <strong>NSO (New Shopping Orbit)</strong>. By using our mobile marketplace and home services app, you agree to these operational guidelines.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Key User Safeguards:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>All physical products are shipped directly by verified local and regional sellers.</li>
                  <li>Home service providers (electricians, technicians, beauty specialists) are verified through KYC before dispatch.</li>
                  <li>Customers retain 100% control over payments via Direct UPI intents with transparent pricing and zero hidden markups.</li>
                  <li>Admin oversees dispute resolution and contractor quote authorizations.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Privacy & Data Security</span>
              </h4>
              <p>
                NSO respects your privacy. We collect minimal operational data needed strictly for order delivery and service bookings:
              </p>
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-950 block">Phone & Identity:</span>
                  <span className="text-[11px] text-emerald-900">Used strictly for order status alerts, delivery coordination, and secure login OTP.</span>
                </div>
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-950 block">Location Coordinates:</span>
                  <span className="text-[11px] text-blue-900">Only accessed when searching nearby service specialists or calculating delivery radius.</span>
                </div>
                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <span className="font-bold text-purple-950 block">Payment Security:</span>
                  <span className="text-[11px] text-purple-900">NSO never stores sensitive bank account numbers or card PINs. All payments process through UPI banking apps (GPay, PhonePe, Paytm).</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>3. Cancellation & Refund Policy</span>
              </h4>
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-950 space-y-1.5">
                <p className="font-bold">Physical Orders:</p>
                <p>Cancellations are accepted before the seller has dispatched the item. Returns for defective or incorrect goods can be reported within 48 hours of delivery.</p>
                <p className="font-bold pt-1">Home Services:</p>
                <p>Bookings can be cancelled or rescheduled free of charge up to 2 hours before the scheduled technician arrival time.</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Refunds are credited directly back to the original payer's UPI account within 24–48 banking hours.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>4. Business & Support Desk</span>
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Owner</span>
                  <span className="font-black text-slate-900">NSO (New Shopping Orbit)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner Helpdesk Mobile</span>
                  <span className="font-mono font-bold text-slate-900">+91 8310421121</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Support Email</span>
                  <span className="font-mono font-bold text-slate-900">support@newshoppingorbit.com</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary UPI Gateway</span>
                  <span className="font-mono font-bold text-emerald-700">8310421121@upi</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
