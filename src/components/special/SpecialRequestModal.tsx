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
  AlertCircle
} from 'lucide-react';

export const SpecialRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { specialRequests, submitSpecialRequest, updateSpecialRequest, showToast, user } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom Fabrication / Carpentry');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('5000');
  const [timeline, setTimeline] = useState('Within 5 days');
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const req = submitSpecialRequest(
      title,
      category,
      description,
      parseFloat(budget) || 0,
      timeline
    );
    setSubmittedRequest(req);
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setSubmittedRequest(null);
    setActiveTab('history');
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
              <h3 className="font-extrabold text-sm text-gray-900">Special Request to Admin</h3>
              <p className="text-[10px] text-gray-400">Direct Admin coordination (No public gig board)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Create & History */}
        <div className="px-5 pt-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('create'); setSubmittedRequest(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'create' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              New Request
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
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
                Assigned ID: <span className="font-mono font-bold text-gray-900">{submittedRequest.requestNumber}</span>. Admin will review specifications and provide custom quotation.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
                <p><span className="font-bold text-slate-700">Title:</span> {submittedRequest.title}</p>
                <p><span className="font-bold text-slate-700">Category:</span> {submittedRequest.category}</p>
                <p><span className="font-bold text-slate-700">Target Budget:</span> ₹{submittedRequest.estimatedBudget}</p>
                <p><span className="font-bold text-slate-700">Status:</span> <span className="text-amber-600 font-bold uppercase">{submittedRequest.status}</span></p>
              </div>

              <button
                onClick={handleResetForm}
                className="w-full py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                View in History
              </button>
            </div>
          ) : activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  This goes strictly to internal Admin operators for vetted estimation. There is NO public freelancer board.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Request Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Custom bookshelf installation with wall anchor"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Domain / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Custom Fabrication / Carpentry">Custom Fabrication / Carpentry</option>
                  <option value="Structural Repairs & Masonry">Structural Repairs & Masonry</option>
                  <option value="Commercial Electronics Setup">Commercial Electronics Setup</option>
                  <option value="Event Staging & Audio Gear">Event Staging & Audio Gear</option>
                  <option value="Other Non-Standard Service">Other Non-Standard Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Scope & Exact Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe dimensions, materials needed, access limitations..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Target Timeline</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. Within 3 days"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Admin for Review</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {specialRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                  <p className="text-xs font-medium">No special requests submitted yet</p>
                </div>
              ) : (
                specialRequests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-900">{req.requestNumber}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full capitalize">
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-800">{req.title}</h4>
                    <p className="text-[11px] text-gray-600">{req.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[11px] text-gray-500">
                      <span>Budget: ₹{req.estimatedBudget}</span>
                      <span>Target: {req.targetTimeline}</span>
                    </div>

                    {req.adminQuotation && (
                      <div className="bg-white p-3 rounded-xl border border-amber-200 text-[11px] space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-950">Admin Quotation: ₹{req.adminQuotation}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                            Decision Required
                          </span>
                        </div>
                        {req.adminNotes && <p className="text-gray-600">{req.adminNotes}</p>}

                        {req.status === 'quote_offered' && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100">
                            <button
                              onClick={() => {
                                updateSpecialRequest(req.id, 'accepted', 'Customer accepted Admin quotation.');
                                showToast(`🎉 Quote approved! Special work order initialized.`);
                              }}
                              className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-sm"
                            >
                              Approve & Authorize
                            </button>
                            <button
                              onClick={() => {
                                updateSpecialRequest(req.id, 'declined', 'Customer declined quotation.');
                                showToast('Quotation declined');
                              }}
                              className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
