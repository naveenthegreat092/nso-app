import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Service } from '../../types';
import { api } from '../../api/client';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Zap,
  Star,
  Key,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time?: string;
  source?: 'gemini-live' | 'smart-catalog-rag';
  comparison?: {
    type: 'product' | 'service';
    items: {
      id: string;
      title: string;
      price: number;
      rating: number;
      badge: string;
      matchReason: string;
    }[];
  };
  recommendedItem?: {
    id: string;
    title: string;
    price: number;
    type: 'product' | 'service';
    reason: string;
  };
  bundleDeal?: {
    title: string;
    totalPrice: number;
    savings: number;
    itemIds: string[];
    items: { id: string; title: string; price: number }[];
  };
}

export const AskNSOScreen: React.FC<{
  onSelectProduct: (p: Product) => void;
  onSelectService: (s: Service) => void;
}> = ({ onSelectProduct, onSelectService }) => {
  const { products, services, addToCart, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      time: '09:41 AM',
      text: 'Namaste! I am your NSO Smart Shopping & Services Assistant. Tell me what you need—from electronics & fashion to verified plumbers & electricians.'
    },
    {
      id: 'msg_demo_query',
      sender: 'user',
      time: '09:42 AM',
      text: 'Find me the best laptop for daily office work under ₹50,000.'
    },
    {
      id: 'msg_demo_reply',
      sender: 'ai',
      time: '09:42 AM',
      text: 'I analyzed our verified catalogue. Here is a side-by-side comparison of the top matches tailored to your ₹50k budget:',
      comparison: {
        type: 'product',
        items: [
          {
            id: 'prod_laptop_02',
            title: 'Lenovo IdeaPad Slim 3 15"',
            price: 46990,
            rating: 4.6,
            badge: 'Top Pick',
            matchReason: '16GB DDR5 RAM, Intel Core i5 13th Gen, 80% fast-charge in 1hr.'
          },
          {
            id: 'prod_earbuds_01',
            title: 'Orbit Pro ANC Earbuds',
            price: 2499,
            rating: 4.8,
            badge: 'Audio Pair',
            matchReason: 'Active Noise Cancellation for crystal-clear Zoom meetings.'
          }
        ]
      },
      recommendedItem: {
        id: 'prod_laptop_02',
        title: 'Lenovo IdeaPad Slim 3 15" FHD',
        price: 46990,
        type: 'product',
        reason: 'Fits directly within budget with 16GB high-speed memory for smooth multitasking and GST invoice warranty.'
      }
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nso_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');

  const quickPrompts = [
    'WFH Productivity Bundle',
    'Best laptop under 50k',
    'Emergency plumber for leak',
    'Deep home cleaning 2 BHK'
  ];

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim();
    setApiKey(trimmed);
    localStorage.setItem('nso_gemini_key', trimmed);
    setShowKeyModal(false);
    showToast(trimmed ? '✅ Gemini API Key Saved!' : 'Gemini Key cleared. Using Smart RAG Engine.');
  };

  const handleAddBundle = (deal: NonNullable<ChatMessage['bundleDeal']>) => {
    deal.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.id) || products[0];
      addToCart(prod, 1);
    });
    showToast(`🎉 Added ${deal.title} to Bag! Saved ₹${deal.savings}`);
  };

  const handleSend = async (textToSend = inputVal) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      time: 'Just now',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const aiResult = await api.askAI(textToSend, apiKey || undefined);
      if (aiResult && aiResult.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            time: 'Just now',
            source: aiResult.source,
            text: aiResult.text,
            comparison: aiResult.comparison,
            recommendedItem: aiResult.recommendedItem,
            bundleDeal: aiResult.bundleDeal
          }
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend AI fetch failed, using internal catalog matcher', err);
    }

    // Fallback if backend offline
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let aiResponse: ChatMessage;

      if (lower.includes('bundle') || lower.includes('combo') || lower.includes('wfh')) {
        const p1 = products[0];
        const p2 = products[1] || products[0];
        const total = p1.price + p2.price - 300;
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Just now',
          source: 'smart-catalog-rag',
          text: 'I curated a personalized WFH Productivity Bundle combining top authentic gear with an exclusive combo discount:',
          bundleDeal: {
            title: 'WFH Executive Audio & Gadget Bundle',
            totalPrice: total,
            savings: 300,
            itemIds: [p1.id, p2.id],
            items: [
              { id: p1.id, title: p1.title, price: p1.price },
              { id: p2.id, title: p2.title, price: p2.price }
            ]
          }
        };
      } else if (lower.includes('plumb') || lower.includes('leak') || lower.includes('service') || lower.includes('repair')) {
        const plumbService = services[0];
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Just now',
          source: 'smart-catalog-rag',
          text: 'I matched your requirement with top verified technicians in Indiranagar with high on-time ratings:',
          comparison: {
            type: 'service',
            items: [
              {
                id: plumbService.id,
                title: plumbService.title,
                price: plumbService.price,
                rating: plumbService.providerRating,
                badge: 'Verified Specialist',
                matchReason: '248 completed jobs, 4.9★ rating, background-vetted by Admin.'
              }
            ]
          },
          recommendedItem: {
            id: plumbService.id,
            title: plumbService.title,
            price: plumbService.price,
            type: 'service',
            reason: 'Certified technician available for doorstep home visit today.'
          }
        };
      } else {
        const prod = products[0];
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Just now',
          source: 'smart-catalog-rag',
          text: `Based on customer satisfaction ratings and verified seller reliability, here is my curated recommendation for "${textToSend}":`,
          comparison: {
            type: 'product',
            items: [
              {
                id: prod.id,
                title: prod.title,
                price: prod.price,
                rating: prod.rating,
                badge: 'Featured Deal',
                matchReason: '50% discount with fast 2-day regional delivery.'
              }
            ]
          },
          recommendedItem: {
            id: prod.id,
            title: prod.title,
            price: prod.price,
            type: 'product',
            reason: 'High customer satisfaction rating of 4.8★ with 7-day replacement warranty.'
          }
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 500);
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Voice simulated: Listening to speech...');
      setTimeout(() => {
        setIsRecording(false);
        handleSend('Emergency plumber for pipe leak');
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleProceedRecommendation = (item: { id: string; type: 'product' | 'service' }) => {
    if (item.type === 'product') {
      const prod = products.find((p) => p.id === item.id);
      if (prod) onSelectProduct(prod);
    } else {
      const serv = services.find((s) => s.id === item.id);
      if (serv) onSelectService(serv);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[760px] bg-slate-50/50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <span>Ask NSO Smart AI</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black ${apiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {apiKey ? 'GEMINI LIVE' : 'AI GUIDE'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Natural language comparisons & verified recommendations</p>
          </div>
        </div>

        <button
          onClick={() => {
            setTempKeyInput(apiKey);
            setShowKeyModal(true);
          }}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 active:scale-95"
          title="Configure Gemini API Key"
        >
          <Key className="w-3 h-3 text-amber-500" />
          <span>{apiKey ? 'Gemini Live' : 'AI Setup'}</span>
        </button>
      </div>

      {/* Mandatory Guardrail Banner (Page 4 & 7 Brief: "A recommendation is not an order. Make customer approval explicit.") */}
      <div className="bg-red-50 border-b border-red-200/60 px-3.5 py-1.5 flex items-center gap-2 text-[11px] text-red-900">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
        <span className="font-bold leading-tight">
          AI assists comparison only. You explicitly review and confirm any checkout or booking.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm ${
                  isUser ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-red-400" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-red-600 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none font-semibold'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Comparison Card (Section 6 Brief) */}
                {msg.comparison && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-sm text-xs">
                    <span className="font-black text-slate-900 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                      Side-by-Side Comparison
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.comparison.items.map((it) => (
                        <div key={it.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 text-xs">{it.title}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-md">
                              {it.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">{it.matchReason}</p>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200">
                            <span className="font-black text-slate-950 text-xs">
                              ₹{it.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {it.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explicit Approval Recommendation Step */}
                {msg.recommendedItem && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 font-black text-red-950">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <span>Recommended Choice</span>
                    </div>
                    <p className="text-[11px] text-red-900 leading-snug font-medium">
                      {msg.recommendedItem.reason}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black text-sm text-red-950">
                        ₹{msg.recommendedItem.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleProceedRecommendation(msg.recommendedItem!)}
                        className="py-1.5 px-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/25 flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <span>Review & Select</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {/* 1-Tap AI Bundle Deal Card */}
                {msg.bundleDeal && (
                  <div className="p-3.5 bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-amber-950">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>{msg.bundleDeal.title}</span>
                      </div>
                      <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full">
                        SAVE ₹{msg.bundleDeal.savings}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-y border-amber-200/60 py-2">
                      {msg.bundleDeal.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">• {it.title}</span>
                          <span className="font-bold text-slate-900">₹{it.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-tight">Bundle Total:</span>
                        <span className="font-black text-base text-slate-950">
                          ₹{msg.bundleDeal.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddBundle(msg.bundleDeal!)}
                        className="py-2 px-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>1-Tap Add Bundle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Prompts Strip */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[9px] uppercase font-black text-slate-400 flex-shrink-0">Suggestions:</span>
        {quickPrompts.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="text-[10px] font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-all active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={handleVoiceToggle}
          className={`p-2.5 rounded-xl transition-all ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Voice entry simulation"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask: 'compare noise cancelling earbuds'..."
          className="flex-1 py-2.5 px-3.5 bg-slate-100 border border-slate-200/90 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-red-500/25 transition-transform active:scale-95"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Gemini Live API Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Gemini Live AI Setup</h4>
                  <p className="text-[10px] text-slate-400">Google Gemini 1.5/2.0 API</p>
                </div>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste your Google Gemini API Key below to enable 100% live conversational AI. Leave blank to use the built-in Smart Catalog RAG engine.
            </p>
            <input
              type="password"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              placeholder="Paste Gemini API Key (AIzaSy...)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setTempKeyInput('');
                  setApiKey('');
                  localStorage.removeItem('nso_gemini_key');
                  setShowKeyModal(false);
                  showToast('Using built-in Smart Catalog RAG engine');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
