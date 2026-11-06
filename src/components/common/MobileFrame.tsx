import React from 'react';
import { useApp } from '../../context/AppContext';

export const MobileFrame: React.FC<{
  children: React.ReactNode;
  onOpenFlowchartTour?: () => void;
}> = ({ children }) => {
  const { notification } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col relative antialiased selection:bg-red-500 selection:text-white">
      {/* App Content: 100% width edge-to-edge native Android experience */}
      <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-[#f8fafc] shadow-none sm:shadow-2xl sm:border-x sm:border-slate-200/60 relative">
        <main className="flex-1 flex flex-col pb-20 relative">
          {children}
        </main>

        {/* Global Native Toast Notification */}
        {notification && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-2 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-xl text-white text-xs py-3 px-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <p className="font-bold flex-1 leading-snug">{notification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
