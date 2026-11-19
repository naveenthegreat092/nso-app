import React from 'react';
import { useApp } from '../../context/AppContext';

export const MobileFrame: React.FC<{
  children: React.ReactNode;
  onOpenFlowchartTour?: () => void;
}> = ({ children }) => {
  const { notification, isAppLoading } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col relative antialiased selection:bg-red-500 selection:text-white">
      {/* App Content: 100% width edge-to-edge native Android/web experience */}
      <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-[#f8fafc] shadow-none sm:shadow-2xl sm:border-x sm:border-slate-200/60 relative overflow-hidden">

        {/* Global App Loading Splash */}
        {isAppLoading && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-white animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-2xl shadow-red-500/40 text-white font-black text-3xl tracking-tighter animate-bounce-in">
              NSO
            </div>
            <div className="mt-6 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-red-400"
                  style={{ animation: `pulse-subtle 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400 font-semibold tracking-wide">Loading your store…</p>
          </div>
        )}

        <main className="flex-1 flex flex-col pb-20 relative">
          {children}
        </main>

        {/* Global Native Toast Notification */}
        {notification && (
          <div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90%] px-2 pointer-events-none animate-fade-in-up"
            style={{ maxWidth: '28rem' }}
          >
            <div className="bg-white/98 backdrop-blur-xl text-slate-950 text-xs font-bold py-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-200/90 shadow-slate-900/15">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0 animate-pulse" />
              <p className="font-extrabold flex-1 leading-snug text-slate-950">{notification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
