import React, { useState } from 'react';
import { ProviderDetail } from '../../types';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  PhoneCall,
  Clock,
  Briefcase,
  Award,
  ChevronRight,
  Eye,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProviderProfileModal: React.FC<{
  provider: ProviderDetail;
  onClose: () => void;
  onBookService: () => void;
  onOpenChat: (providerName: string) => void;
}> = ({ provider, onClose, onBookService, onOpenChat }) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');
  const [selectedPortfolioImg, setSelectedPortfolioImg] = useState<string | null>(null);

  const handleMaskedCall = () => {
    showToast(`Connecting via NSO Masked Calling Relay (${provider.phoneMasked})`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="relative">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-white tracking-tight truncate">
                  {provider.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                {provider.tradeTitle}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-md">
                  ★ {provider.rating}
                </span>
                <span className="text-[10px] text-slate-300">
                  {provider.reviewsCount} reviews
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded font-bold">
                  Admin Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200/80 p-3 text-center text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Experience</span>
            <span className="font-black text-slate-900">{provider.experienceYears}+ Yrs</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Jobs Done</span>
            <span className="font-black text-slate-900">{provider.jobsCompleted}</span>
          </div>
          <div className="border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">On-Time</span>
            <span className="font-black text-emerald-600">{provider.onTimeRate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Police Clr.</span>
            <span className="font-black text-blue-600">Passed ✓</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 mx-4 mt-3 rounded-2xl text-xs font-black">
          {(['overview', 'portfolio', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 rounded-xl capitalize transition-all ${
                activeTab === t ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t === 'overview' ? 'Profile & Badges' : t === 'portfolio' ? `Work Photos (${provider.portfolio.length})` : `Reviews (${provider.reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content Scroll Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              {/* Bio */}
              <div className="space-y-1">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Professional Bio</span>
                <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-150">
                  {provider.bio}
                </p>
              </div>

              {/* Verified Trust Badges */}
              <div className="space-y-1.5">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Credentials</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {provider.verificationBadges.map((badge) => (
                    <div
                      key={badge}
                      className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-emerald-950 font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Certifications */}
              <div className="space-y-1.5">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Trade Diplomas & Government Licenses</span>
                </span>
                <ul className="space-y-1.5">
                  {provider.certifications.map((cert) => (
                    <li
                      key={cert}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <FileCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Privacy Protection Callout (Section 7 brief: Masked Calling & Chat) */}
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3 text-blue-950 space-y-1">
                <span className="font-black text-[11px] flex items-center gap-1 text-blue-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Privacy Protection Standard
                </span>
                <p className="text-[10px] text-blue-800 leading-snug">
                  Personal telephone numbers and exact addresses remain securely masked. All communication and revised extra-work quotes happen strictly inside the NSO platform.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Previous Job Gallery (Verified on NSO)
              </span>
              <div className="grid grid-cols-1 gap-3">
                {provider.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm space-y-2 group"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-slate-950/80 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        {item.tag}
                      </span>
                    </div>
                    <div className="p-3 pt-1">
                      <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Inspected & Signed off by NSO Customer
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3.5">
              {/* Category Breakdown */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Rating Breakdown</span>
                <div className="space-y-1.5 text-slate-700 font-bold text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Workmanship & Quality</span>
                    <span className="text-amber-700 font-black">★ {provider.ratingsBreakdown.quality} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Punctuality & Speed</span>
                    <span className="text-amber-700 font-black">★ {provider.ratingsBreakdown.punctuality} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '98%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Behavior & Cleanliness</span>
                    <span className="text-amber-700 font-black">★ {provider.ratingsBreakdown.behavior} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>

              {/* Customer Review Cards */}
              <div className="space-y-2.5">
                {provider.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{rev.customerName}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-black text-[11px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">{rev.comment}</p>

                    <div className="flex gap-1.5 pt-1">
                      {rev.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-150 bg-white grid grid-cols-3 gap-2 shadow-lg">
          <button
            onClick={() => onOpenChat(provider.name)}
            className="py-3 px-2 rounded-2xl border-2 border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span>Chat</span>
          </button>

          <button
            onClick={handleMaskedCall}
            className="py-3 px-2 rounded-2xl border-2 border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Call (Masked)</span>
          </button>

          <button
            onClick={onBookService}
            className="py-3 px-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <span>Book Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
