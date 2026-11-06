import React, { useState } from 'react';
import { X, Send, Image, ShieldCheck, CheckCheck, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  const { showToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'peer',
      text: `Hello! This is ${peerName}. Thank you for booking through NSO. Please share any special instructions or gate entry pass details here.`,
      time: '11:15 AM'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: inputVal,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate auto-reply from provider / seller
    setTimeout(() => {
      const reply: Message = {
        id: `reply_${Date.now()}`,
        sender: 'peer',
        text: `Got it! I have noted down "${newMsg.text}". I am heading over equipped with genuine spare parts.`,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  const handleMaskedCall = () => {
    showToast(`Connecting masked call to ${peerName}. Your personal number is kept private.`);
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
      </div>
    </div>
  );
};
