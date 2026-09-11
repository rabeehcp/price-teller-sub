import React from 'react';
import { Product } from '../types';
import { Scale, X, ArrowRight } from 'lucide-react';

interface CompareFloatingBarProps {
  selectedProducts: Product[];
  onOpenCompareModal: () => void;
  onClearCompare: () => void;
  onRemoveProduct: (productId: string) => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  selectedProducts,
  onOpenCompareModal,
  onClearCompare,
  onRemoveProduct,
}) => {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/10 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
      {/* Left items summary */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Scale className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-black flex items-center gap-2">
            <span>Compare Products</span>
            <span className="text-[10px] bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full font-bold border border-brand-400/30">
              {selectedProducts.length}/4 selected
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 overflow-x-auto">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-2 py-0.5 text-xs transition-colors shrink-0"
              >
                <span>{p.emoji}</span>
                <span className="font-medium text-[11px] truncate max-w-[80px] hidden sm:inline">
                  {p.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProduct(p.id);
                  }}
                  className="text-gray-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClearCompare}
          className="text-xs font-semibold text-gray-400 hover:text-white px-2 py-1 transition-colors"
        >
          Clear
        </button>

        <button
          onClick={onOpenCompareModal}
          disabled={selectedProducts.length < 2}
          className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            selectedProducts.length >= 2
              ? 'bg-brand-600 hover:bg-brand-500 text-white active:scale-95'
              : 'bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
