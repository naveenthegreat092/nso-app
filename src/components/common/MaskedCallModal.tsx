import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

interface MaskedCallModalProps {
  isOpen: boolean;
  peerName: string;
  phoneMasked?: string;
  providerId?: string;
  onClose: () => void;
}

export const MaskedCallModal: React.FC<MaskedCallModalProps> = ({
  isOpen,
  peerName,
  phoneMasked = '080-****-4211',
  providerId,
  onClose
}) => {
  const { showToast } = useApp();
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callLogId, setCallLogId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const virtualRelayNumber = '+918047483920';

  useEffect(() => {
    if (!isOpen) {
      setCallState('connecting');
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCallState('connecting');
    setCallDuration(0);

    // 1. Initialize call log on backend
    let activeId: string | null = null;
    api
      .startCall({
        receiverId: providerId || peerName,
        receiverName: peerName,
        callType: 'masked'
      })
      .then((res) => {
        if (res && res.id) {
          activeId = res.id;
          setCallLogId(res.id);
        }
      })
      .catch(() => {});

    // 2. Realistic connection progression
    const ringTimeout = setTimeout(() => {
      setCallState('ringing');
    }, 1800);

    const connectTimeout = setTimeout(() => {
      setCallState('connected');
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 4200);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeId) {
        api.endCall(activeId, callDuration, 'completed').catch(() => {});
      }
    };
  }, [isOpen, peerName, providerId]);

  if (!isOpen) return null;

  const handleEndCall = async () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    if (callLogId) {
      await api.endCall(callLogId, callDuration, 'completed').catch(() => {});
    }
    showToast(`Call ended (${formatDuration(callDuration)})`);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleOpenNativeDialer = () => {
    showToast(`Opening device phone dialer for NSO Relay...`);
    try {
      window.location.href = `tel:${virtualRelayNumber}`;
    } catch {
      window.open(`tel:${virtualRelayNumber}`, '_system');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-t-[36px] sm:rounded-[36px] p-6 text-white text-center shadow-2xl border border-slate-800 space-y-5">
        {/* Top Dismiss */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            NSO Privacy Shield Masked
          </span>
          <button
            onClick={handleEndCall}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar & Pulse Animation */}
        <div className="relative mx-auto w-24 h-24 my-2">
          {callState === 'connected' ? (
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          ) : (
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          )}
          <div className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/80 flex items-center justify-center shadow-xl overflow-hidden">
            <PhoneCall className="w-10 h-10 text-emerald-400 animate-bounce" />
          </div>
        </div>

        {/* Peer Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white tracking-tight">{peerName}</h3>
          <p className="text-xs text-slate-400 font-mono">
            Masked Number: <span className="text-emerald-400 font-bold">{phoneMasked}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Relay Server: <span className="font-mono text-slate-400">{virtualRelayNumber}</span>
          </p>
        </div>

        {/* Live Call Status */}
        <div className="py-2 px-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 inline-block mx-auto min-w-[160px]">
          {callState === 'connecting' && (
            <span className="text-xs font-bold text-amber-400 animate-pulse flex items-center justify-center gap-1.5">
              <span>Establishing Relay Bridge...</span>
            </span>
          )}
          {callState === 'ringing' && (
            <span className="text-xs font-bold text-blue-400 animate-pulse flex items-center justify-center gap-1.5">
              <span>Ringing Specialist Phone...</span>
            </span>
          )}
          {callState === 'connected' && (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-black font-mono tracking-wider">{formatDuration(callDuration)}</span>
            </div>
          )}
          {callState === 'ended' && (
            <span className="text-xs font-bold text-rose-400">Call Finished</span>
          )}
        </div>

        {/* Audio Wave Simulator */}
        {callState === 'connected' && (
          <div className="flex items-center justify-center gap-1 h-6">
            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce"></span>
            <span className="w-1 h-6 bg-emerald-300 rounded-full animate-pulse"></span>
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce"></span>
            <span className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
        )}

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Mute Button */}
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              showToast(isMuted ? 'Microphone unmuted' : 'Microphone muted');
            }}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-bold">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Speakerphone Button */}
          <button
            type="button"
            onClick={() => {
              setIsSpeaker(!isSpeaker);
              showToast(isSpeaker ? 'Speaker turned off' : 'Speaker turned on');
            }}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 border ${
              isSpeaker
                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5 text-blue-400" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-bold">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
          </button>

          {/* Native Cellular Dialer Bridge */}
          <button
            type="button"
            onClick={handleOpenNativeDialer}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 flex flex-col items-center gap-1 transition-all active:scale-95"
            title="Open Phone App"
          >
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold">Cellular</span>
          </button>
        </div>

        {/* End Call Action */}
        <div className="pt-2">
          <button
            onClick={handleEndCall}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <PhoneOff className="w-5 h-5 stroke-[2.5]" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
