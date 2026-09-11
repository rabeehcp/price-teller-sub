import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, Plus, CheckCircle2, ListPlus, ArrowRight, Wand2 } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface SmartListQuickAddProps {
  products: Product[];
  onAddMultipleItems: (items: { product: Product; quantity: number; unit: string }[]) => void;
}

export const SmartListQuickAdd: React.FC<SmartListQuickAddProps> = ({
  products,
  onAddMultipleItems,
}) => {
  const [listText, setListText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<
    { product: Product; quantity: number; unit: string; matchedQuery: string }[]
  >([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Smart parser for grocery text lists
  const handleParse = (text: string) => {
    setListText(text);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    // Split by commas, newlines, or bullets
    const rawLines = text
      .split(/[\n,;•]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const matches: { product: Product; quantity: number; unit: string; matchedQuery: string }[] = [];

    for (const raw of rawLines) {
      // Extract quantity (e.g. "2 kg", "500g", "3", "1.5L", "2 packets")
      const qtyMatch = raw.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.*)$/) ||
                       raw.match(/^(.*?)\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);

      let qty = 1;
      let unitHint = '';
      let query = raw.toLowerCase();

      if (qtyMatch) {
        if (!isNaN(Number(qtyMatch[1]))) {
          qty = Number(qtyMatch[1]);
          unitHint = (qtyMatch[2] || '').toLowerCase();
          query = (qtyMatch[3] || '').trim().toLowerCase();
        } else if (!isNaN(Number(qtyMatch[2]))) {
          query = (qtyMatch[1] || '').trim().toLowerCase();
          qty = Number(qtyMatch[2]);
          unitHint = (qtyMatch[3] || '').toLowerCase();
        }
      }

      // Match query against product catalog
      const matchedProd = products.find((p) => {
        const pName = p.name.toLowerCase();
        const pId = p.id.toLowerCase();
        return (
          pName.includes(query) ||
          query.includes(pName) ||
          pId.includes(query) ||
          (query.length > 2 && pName.split(' ').some((w) => query.includes(w) || w.includes(query)))
        );
      });

      if (matchedProd) {
        const priceValues = Object.values(matchedProd.prices || {});
        const stockStatuses = Object.values(matchedProd.stockStatus || {});
        const isOutOfStock =
          priceValues.length === 0 ||
          (stockStatuses.length > 0 && stockStatuses.every((s) => s === 'out_of_stock'));

        if (!isOutOfStock) {
          // Find best matching unit
          let chosenUnit = matchedProd.defaultUnit;
          if (unitHint) {
            const matchedUnit = matchedProd.availableUnits.find((u) =>
              u.toLowerCase().includes(unitHint) || unitHint.includes(u.toLowerCase())
            );
            if (matchedUnit) chosenUnit = matchedUnit;
          }

          // Avoid duplicate in same list
          const existingIdx = matches.findIndex((m) => m.product.id === matchedProd.id);
          if (existingIdx >= 0) {
            matches[existingIdx].quantity += qty;
          } else {
            matches.push({
              product: matchedProd,
              quantity: qty,
              unit: chosenUnit,
              matchedQuery: raw,
            });
          }
        }
      }
    }

    setParsedPreview(matches);
  };

  const handleApply = () => {
    if (!parsedPreview.length) return;
    onAddMultipleItems(parsedPreview);
    setIsSuccess(true);
    setTimeout(() => {
      setListText('');
      setParsedPreview([]);
      setIsSuccess(false);
    }, 1500);
  };

  const sampleLists = [
    '2 kg Tomato, 1 kg Onion, 2L Milk, 5 kg Rice, 1 kg Sugar',
    '1 dozen Eggs, 500g Butter, 1 kg Potato, 1L Sunflower Oil',
  ];

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-4 sm:p-5 shadow-xs mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DDF5EA] border border-[#C3EEDC] text-[#0B8F68] flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-dark flex items-center gap-1.5 m-0">
              <span>Quick-Add from Shopping List</span>
              <span className="text-[10px] font-bold bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Smart AI Parser
              </span>
            </h3>
            <p className="text-xs text-slate-muted font-medium mt-0.5">
              Paste or type your grocery list (e.g. <i>&quot;2kg Tomato, 1L Milk, 5kg Rice, Onion&quot;</i>)
            </p>
          </div>
        </div>

        {/* Preset Samples */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-muted font-semibold hidden md:inline">Try:</span>
          {sampleLists.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleParse(sample)}
              className="text-[11px] font-semibold text-[#0B8F68] bg-[#DDF5EA]/60 hover:bg-[#DDF5EA] border border-[#C3EEDC] px-2.5 py-1 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              📋 Sample List {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box & Action */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={2}
            value={listText}
            onChange={(e) => handleParse(e.target.value)}
            placeholder="Paste your shopping list here (separated by commas or new lines)..."
            className="w-full px-3.5 py-2.5 bg-surface-bg border border-surface-border rounded-xl text-xs text-slate-dark placeholder:text-slate-muted focus:bg-white focus:border-brand-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Parsed Preview Badges */}
        {parsedPreview.length > 0 && (
          <div className="p-3 bg-surface-subtle border border-[#C3EEDC] rounded-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#063B2A] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
                <span>Detected {parsedPreview.length} matched grocery items:</span>
              </span>
              <button
                type="button"
                onClick={handleApply}
                disabled={isSuccess}
                className="w-full sm:w-auto px-4 py-1.5 bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add All {parsedPreview.length} Items to Basket</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {parsedPreview.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#C3EEDC] text-slate-dark px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <ProductImage
                    productId={item.product.id}
                    image={item.product.image}
                    emoji={item.product.emoji}
                    alt={item.product.name}
                    className="w-4 h-4 shrink-0"
                    imgClassName="w-4 h-4 object-contain"
                    fallbackEmojiClassName="text-xs"
                  />
                  <span>{item.product.name}</span>
                  <span className="text-[#0B8F68] font-extrabold bg-[#DDF5EA] px-1.5 py-0.2 rounded">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
