import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Calendar,
  Hourglass
} from 'lucide-react';

export const SpecialRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { specialRequests, submitSpecialRequest, updateSpecialRequest, showToast, user } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom Fabrication / Carpentry');
  const [customGigType, setCustomGigType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('5000');
  const [workDays, setWorkDays] = useState('3');
  const [confirmationWaitDays, setConfirmationWaitDays] = useState('2');
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a title and description for your gig request');
      return;
    }

    const effectiveCategory = category === 'Other / Custom Gig (Not in list)' ? (customGigType.trim() || 'Custom Non-Standard Work') : category;

    setIsSubmitting(true);
    try {
      const req = await submitSpecialRequest(
        title.trim(),
        effectiveCategory,
        description.trim(),
        parseFloat(budget) || 0,
        `Within ${workDays || 1} day(s)`,
        parseInt(workDays) || 1,
        parseInt(confirmationWaitDays) || 2,
        effectiveCategory
      );
      setSubmittedRequest(req);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setCustomGigType('');
    setDescription('');
    setBudget('5000');
    setWorkDays('3');
    setConfirmationWaitDays('2');
    setSubmittedRequest(null);
    setActiveTab('history');
  };

  const handleStartAnother = (prevRequest?: any) => {
    setTitle(prevRequest ? `Re: ${prevRequest.title}` : '');
    setDescription('');
    setCustomGigType('');
    setBudget(prevRequest?.estimatedBudget?.toString() || '5000');
    setWorkDays('3');
    setConfirmationWaitDays('2');
    setSubmittedRequest(null);
    setActiveTab('create');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Custom Gig &amp; Special Requests</h3>
              <p className="text-[10px] text-gray-400">Direct Admin review • Any custom work accepted</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Create & History */}
        <div className="px-5 pt-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('create'); setSubmittedRequest(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'create' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Request a Gig
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              My Requests ({specialRequests.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {submittedRequest ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Request Sent to Admin!</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Ticket Reference: <span className="font-mono font-bold text-gray-900">{submittedRequest.requestNumber}</span>.
                Admin will review your specifications, budget and confirmation timeline.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
                <p><span className="font-bold text-slate-700">Gig Title:</span> {submittedRequest.title}</p>
                <p><span className="font-bold text-slate-700">Category:</span> {submittedRequest.category}</p>
                <p><span className="font-bold text-slate-700">Your Budget:</span> ₹{submittedRequest.estimatedBudget}</p>
                <p><span className="font-bold text-slate-700">Target Work Days:</span> {submittedRequest.workDays || 1} day(s)</p>
                <p><span className="font-bold text-slate-700">Confirmation Wait:</span> {submittedRequest.confirmationWaitDays || 2} day(s)</p>
                <p><span className="font-bold text-slate-700">Status:</span> <span className="text-amber-600 font-bold uppercase">{submittedRequest.status}</span></p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetForm}
                  className="flex-1 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  View Status in History
                </button>
                <button
                  onClick={() => handleStartAnother()}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  New Request
                </button>
              </div>
            </div>
          ) : activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Request any kind of gig — even if not listed in our standard catalogue. Admin reviews every request directly.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Gig Title / Work Required</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Custom teakwood wall unit &amp; LED backlighting"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Gig Domain / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Custom Fabrication / Carpentry">Custom Fabrication / Carpentry</option>
                  <option value="Structural Repairs & Masonry">Structural Repairs & Masonry</option>
                  <option value="Commercial Electronics Setup">Commercial Electronics Setup</option>
                  <option value="Event Staging & Audio Gear">Event Staging & Audio Gear</option>
                  <option value="Home Improvement & Renovation">Home Improvement & Renovation</option>
                  <option value="Vehicle Towing & Roadside Aid">Vehicle Towing & Roadside Aid</option>
                  <option value="Other / Custom Gig (Not in list)">Other / Custom Gig (Not in list)</option>
                </select>
              </div>

              {category === 'Other / Custom Gig (Not in list)' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-amber-800">Specify Custom Gig Type</label>
                  <input
                    type="text"
                    required
                    value={customGigType}
                    onChange={(e) => setCustomGigType(e.target.value)}
                    placeholder="e.g. Vintage motorcycle electrical restoration"
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Detailed Scope &amp; Specifications</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe dimensions, materials, tools required, site access, or special requests..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Budget & Desired Work Days & Confirmation Timeline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Your Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. 4500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Work Days Needed</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={workDays}
                    onChange={(e) => setWorkDays(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 3 days"
                  />
                  <span className="text-[9px] text-slate-400">Time to finish work</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <Hourglass className="w-3 h-3 text-blue-600" />
                    <span>Wait for Confirm</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={confirmationWaitDays}
                    onChange={(e) => setConfirmationWaitDays(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 2 days"
                  />
                  <span className="text-[9px] text-slate-400">Max wait for Admin</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-amber-500 active:scale-98 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
              >
                <Send className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>{isSubmitting ? 'Submitting to Admin...' : 'Submit to Admin for Review'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {specialRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-medium">No special requests submitted yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Request a Gig</span>
                  </button>
                </div>
              ) : (
                specialRequests.map((req) => {
                  const isRejected = req.status === 'rejected' || req.status === 'declined';
                  const isAccepted = req.status === 'accepted' || req.status === 'quote_offered';
                  const isPending = req.status === 'pending' || req.status === 'submitted' || req.status === 'under_review';

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 text-xs transition-all ${
                        isRejected
                          ? 'bg-rose-50/70 border-rose-200'
                          : isAccepted
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-amber-50/40 border-amber-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-gray-900">{req.requestNumber}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{req.title}</h4>
                        <span className="text-[10px] bg-white/80 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold inline-block mt-0.5">
                          {req.customGigType || req.category}
                        </span>
                        <p className="text-[11px] text-gray-700 mt-1 leading-snug">{req.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200/60 text-[10px] text-gray-600 font-semibold">
                        <div>Budget: <strong className="text-gray-900">₹{req.estimatedBudget}</strong></div>
                        <div>Work: <strong className="text-gray-900">{req.workDays || 1}d</strong></div>
                        <div>Wait: <strong className="text-gray-900">{req.confirmationWaitDays || 2}d</strong></div>
                      </div>

                      {/* Rejected State: Notify user and let them submit another request */}
                      {isRejected && (
                        <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                          <div className="flex items-start gap-1.5 text-rose-800 font-bold text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span>Admin Notice: Request Declined</span>
                              {req.adminNotes && (
                                <p className="text-[11px] text-rose-700 font-normal mt-0.5">{req.adminNotes}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartAnother(req)}
                            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Submit Another Request</span>
                          </button>
                        </div>
                      )}

                      {/* Accepted State */}
                      {isAccepted && (
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center text-emerald-900 font-bold">
                            <span>✅ Accepted by Admin</span>
                            {req.adminQuotation && (
                              <span className="font-black text-xs text-emerald-800">Quote: ₹{req.adminQuotation}</span>
                            )}
                          </div>
                          {req.adminNotes && <p className="text-slate-600">{req.adminNotes}</p>}
                        </div>
                      )}

                      {/* Pending State */}
                      {isPending && (
                        <div className="p-2 bg-amber-100/50 rounded-xl text-[10px] text-amber-900 font-medium flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-700 flex-shrink-0" />
                          <span>Under active Admin review. You will receive quotation or status within {req.confirmationWaitDays || 2} day(s).</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
