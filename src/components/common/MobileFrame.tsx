import React from 'react';
import { useApp } from '../../context/AppContext';

export const MobileFrame: React.FC<{
  children: React.ReactNode;
  onOpenFlowchartTour?: () => void;
}> = ({ children }) => {
  const { notification, isAppLoading } = useApp();

  return (
    <div className="w-full min-h-screen bg-slate-900/5 sm:bg-slate-100/90 sm:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] sm:from-slate-100 sm:via-slate-200/50 sm:to-slate-300/40 flex flex-col justify-center items-center relative antialiased selection:bg-red-500 selection:text-white">
      {/* App Content: 100% width edge-to-edge on mobile, sleek studio frame on desktop */}
      <div className="w-full max-w-lg min-h-screen sm:min-h-[92vh] sm:my-4 sm:rounded-[32px] flex flex-col bg-[#f8fafc] shadow-none sm:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] sm:border sm:border-slate-300/70 relative overflow-hidden">

        {/* Global App Loading Splash — Ultra-Premium Edition */}
        {isAppLoading && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-black border-2 border-amber-400 flex items-center justify-center shadow-2xl shadow-amber-500/20 animate-bounce-in">
              <span className="gold-text-metallic font-black text-3xl tracking-tighter">NSO</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm shadow-amber-400/50"
                  style={{ animation: `pulse-subtle 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-900 font-black tracking-wide">Loading your luxury experience…</p>
          </div>
        )}

        <main className="flex-1 flex flex-col pb-20 relative">
          {children}
        </main>

        {/* Global Native Toast Notification — Obsidian & Gold */}
        {notification && (
          <div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90%] px-2 pointer-events-none animate-fade-in-up"
            style={{ maxWidth: '28rem' }}
          >
            <div className="bg-slate-950/98 backdrop-blur-xl text-white text-xs font-semibold py-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-amber-400/50 shadow-slate-950/40">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex-shrink-0 animate-pulse shadow-sm shadow-amber-400/50" />
              <p className="font-bold flex-1 leading-snug text-white tracking-normal">{notification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
