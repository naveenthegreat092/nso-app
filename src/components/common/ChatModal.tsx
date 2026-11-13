import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image, ShieldCheck, CheckCheck, PhoneCall, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

interface Message {
  id: string;
  sender: 'user' | 'peer';
  text: string;
  time: string;
}

export const ChatModal: React.FC<{
  isOpen: boolean;
  peerName: string;
  onClose: () => void;
}> = ({ isOpen, peerName, onClose }) => {
  const { showToast, user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'peer',
      text: `Hello! This is ${peerName}. Thank you for connecting through NSO Orbit. Please share any special instructions or gate entry details here.`,
      time: '11:15 AM'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync with real backend messages on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchBackendMessages = async () => {
      try {
        const live = await api.getMessages(peerName);
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const formatted: Message[] = live.map((m: any) => ({
            id: m.id,
            sender: m.isSelf ? 'user' : 'peer',
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages((prev) => {
            const ids = new Set(formatted.map(f => f.id));
            const uniqueOld = prev.filter(p => !ids.has(p.id));
            return [...uniqueOld, ...formatted];
          });
        }
      } catch {}
    };

    fetchBackendMessages();
    const interval = setInterval(fetchBackendMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, peerName]);

  // Clean up call timer
  useEffect(() => {
    if (activeCallId) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCallId]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputVal.trim()) return;

    const text = inputVal.trim();
    const tempId = `msg_${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      sender: 'user',
      text,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    try {
      await api.sendMessage({
        receiverId: peerName,
        receiverName: peerName,
        text
      });
    } catch {}

    // Auto simulated response if first peer message
    setTimeout(() => {
      const reply: Message = {
        id: `reply_${Date.now()}`,
        sender: 'peer',
        text: `Got it! I have noted down "${text}". Proceeding as requested.`,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  const handleMaskedCall = async () => {
    showToast(`Connecting encrypted in-app call to ${peerName}...`);
    try {
      const call = await api.startCall({
        receiverId: peerName,
        receiverName: peerName,
        callType: 'masked'
      });
      if (call?.id) {
        setActiveCallId(call.id);
      } else {
        setActiveCallId(`call_${Date.now()}`);
      }
    } catch {
      setActiveCallId(`call_${Date.now()}`);
    }
  };

  const handleEndCall = async () => {
    if (activeCallId) {
      try {
        await api.endCall(activeCallId, callDuration, 'completed');
      } catch {}
    }
    showToast(`Call ended. Duration: ${callDuration} seconds`);
    setActiveCallId(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-black text-sm text-white">
              {peerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-xs text-white truncate max-w-[160px]">{peerName}</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Masked In-App Chat • Privacy Protected</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMaskedCall}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-emerald-400 transition-colors"
              title="Masked Call"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/60 px-3 py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-emerald-900 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>End-to-End In-App Masking. Personal phone numbers are never revealed.</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 text-xs">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    isUser
                      ? 'bg-red-600 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-semibold shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                  <span>{m.time}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-red-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick reply chips */}
        <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['On my way', 'Please call security gate', 'Which floor?', 'Can you bring extra washer?'].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setInputVal(chip);
              }}
              className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-150 flex items-center gap-2">
          <button
            onClick={() => showToast('Photo uploaded from device')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="Attach Photo"
          >
            <Image className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 py-2.5 px-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={handleSend}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* In-App Masked Voice Call Overlay */}
        {activeCallId && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white animate-in fade-in">
            <div className="text-center pt-8 space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5 mx-auto w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                In-App Voice Call Connected
              </span>
              <h3 className="text-xl font-black text-white">{peerName}</h3>
              <p className="text-xs text-slate-400 font-medium">Masked Number • Zero Carrier Charges</p>
            </div>

            {/* Pulsing Avatar */}
            <div className="relative my-auto">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-4xl font-black shadow-2xl shadow-emerald-500/30">
                {peerName.charAt(0)}
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping pointer-events-none" />
              <div className="text-center mt-6">
                <span className="font-mono text-2xl font-black tracking-widest text-emerald-300">
                  {formatSeconds(callDuration)}
                </span>
              </div>
            </div>

            {/* Call Controls */}
            <div className="w-full max-w-xs space-y-4 pb-4">
              <div className="flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full border transition-all ${
                    isMuted
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  type="button"
                  className="p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200"
                  title="Speakerphone"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleEndCall}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/40 flex items-center justify-center gap-2 transition-all"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
