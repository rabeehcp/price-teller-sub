import React, { useState } from 'react';
import { BasketItem } from '../types';
import { X, BookmarkPlus, CheckCircle2 } from 'lucide-react';

interface SaveBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketItem[];
  onSave: (listName: string) => Promise<void>;
}

export const SaveBasketModal: React.FC<SaveBasketModalProps> = ({
  isOpen,
  onClose,
  basket,
  onSave,
}) => {
  const [listName, setListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      setError('Please provide a name for this list');
      return;
    }
    if (!basket.length) {
      setError('Your basket is empty');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSave(listName.trim());
      setListName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl">
                💾
              </div>
              <div>
                <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">സേവ് ചെയ്യുക • Save List</div>
                <h3 className="text-base font-bold text-slate-900">ഷോപ്പിംഗ് ലിസ്റ്റ് സൂക്ഷിക്കുക</h3>
                <p className="text-xs text-gray-500">
                  {basket.length} സാധനങ്ങളുടെ ഈ ലിസ്റ്റ് പിന്നീട് ഉപയോഗിക്കാൻ സേവ് ചെയ്യാം
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ലിസ്റ്റിന്റെ പേര് (List Name) *
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="ഉദാ: മാസ സാധനങ്ങൾ, പച്ചക്കറി ലിസ്റ്റ്..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none transition-colors"
                autoFocus
                required
              />
            </div>

            {/* Quick Suggested Names */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                ഉദാഹരണങ്ങൾ (Quick Suggestions):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'മാസ പലവ്യഞ്ജനം (Monthly Ration)',
                  'ആഴ്ചപ്പച്ചക്കറി (Weekly Veggies)',
                  'സ്നാക്സ് & ബേക്കറി',
                  'പാലും മുട്ടയും',
                  'വിശേഷ ദിവസ സാധനങ്ങൾ',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setListName(sug)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-800 text-gray-700 text-[11px] font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                റദ്ദാക്കുക (Cancel)
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'സേവ് ചെയ്യുന്നു...' : 'ലിസ്റ്റ് സേവ് ചെയ്യുക'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
