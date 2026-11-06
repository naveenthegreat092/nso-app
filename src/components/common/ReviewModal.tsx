import React, { useState } from 'react';
import { X, Star, Camera, CheckCircle2, ThumbsUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReviewModal: React.FC<{
  isOpen: boolean;
  itemTitle: string;
  targetType: 'product' | 'service';
  onClose: () => void;
  onSubmitReview: (rating: number, comment: string, tags: string[]) => void;
}> = ({ isOpen, itemTitle, targetType, onClose, onSubmitReview }) => {
  const { showToast } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Professional']);
  const [hasPhoto, setHasPhoto] = useState(false);

  if (!isOpen) return null;

  const availableTags = targetType === 'service'
    ? ['Punctual', 'Professional', 'Clean Work', 'Polite', 'Accurate Diagnostics', 'Great Value']
    : ['Original Product', 'Great Packaging', 'Fast Shipping', 'High Quality', 'Value for Money'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(rating, comment, selectedTags);
    showToast('Thank you! Your verified review and rating have been published.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-black text-sm text-slate-900">Rate & Review Experience</h4>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Reviewing:</span>
            <h3 className="font-black text-sm text-slate-900 truncate mt-0.5">{itemTitle}</h3>
          </div>

          {/* Star Rating Picker */}
          <div className="text-center py-2 space-y-1.5 bg-slate-50 rounded-2xl border border-slate-200/80 p-3">
            <span className="text-xs font-black text-slate-800 block">Tap to Rate</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-amber-800">
              {rating === 5 ? 'Excellent & Flawless! 🌟' : rating === 4 ? 'Very Good! 👍' : 'Good 👌'}
            </span>
          </div>

          {/* Tag Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-800">What went well?</span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text */}
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-800">Write your feedback</span>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other NSO customers about the quality, timeliness, and experience..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Photo upload simulation */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setHasPhoto(!hasPhoto);
                showToast(hasPhoto ? 'Photo removed' : 'Attached repair/product photo from camera');
              }}
              className={`w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                hasPhoto ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>{hasPhoto ? '1 Work Photo Attached ✓ (Tap to remove)' : 'Add Photo of Completed Work / Product'}</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-red-500/25 active:scale-98 transition-transform"
          >
            Submit Verified Review
          </button>
        </form>
      </div>
    </div>
  );
};
