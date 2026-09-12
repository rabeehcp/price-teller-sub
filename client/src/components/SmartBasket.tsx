import React from 'react';
import { BasketItem } from '../types';
import { ShoppingCart, Trash2, Plus, Minus, BookmarkPlus, MessageCircle, CalendarCheck } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface SmartBasketProps {
  basketItems: BasketItem[];
  onQuantityChange: (productId: string, delta: number) => void;
  onUnitChange: (productId: string, unit: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
  onQuickAdd: (productId: string) => void;
  onSaveList?: () => void;
  onOpenChat?: () => void;
  onPreBookBasket?: () => void;
}

export const SmartBasket: React.FC<SmartBasketProps> = ({
  basketItems,
  onQuantityChange,
  onUnitChange,
  onRemoveItem,
  onClearBasket,
  onQuickAdd,
  onSaveList,
  onOpenChat,
  onPreBookBasket,
}) => {
  const totalItemCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="bg-white border border-surface-border rounded-2xl p-4 sm:p-5 mb-5 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center text-sm shadow-2xs">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-dark m-0 font-malayalam flex items-center gap-1.5">
              <span>എന്റെ ബാസ്ക്കറ്റ് (My Basket)</span>
            </h2>
            <div className="text-[11px] text-slate-muted font-bold font-malayalam" id="count">
              {totalItemCount} ഇനങ്ങൾ തിരഞ്ഞെടുത്തു
            </div>
          </div>
        </div>

        {basketItems.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {onPreBookBasket && (
              <button
                onClick={onPreBookBasket}
                className="text-xs font-black text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 font-malayalam"
                title="വില ലോക്ക് ചെയ്ത് പ്രീ-ബുക്ക് ചെയ്യുക"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>പ്രീ-ബുക്ക്</span>
              </button>
            )}

            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="text-xs font-bold text-slate-body hover:text-brand-800 bg-surface-subtle hover:bg-gray-200 border border-surface-border px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 font-malayalam"
                title="കടയുടമയുമായി ചാറ്റ് ചെയ്യുക"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>ചാറ്റ്</span>
              </button>
            )}

            {onSaveList && (
              <button
                onClick={onSaveList}
                className="text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer active:scale-95 font-malayalam"
                title="ഈ ലിസ്റ്റ് സ്ഥിരമായി സേവ് ചെയ്യുക"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">സേവ് ലിസ്റ്റ്</span>
              </button>
            )}

            <button
              onClick={onClearBasket}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer active:scale-95 font-malayalam"
              title="ബാസ്ക്കറ്റ് ക്ലിയർ ചെയ്യുക"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ക്ലിയർ</span>
            </button>
          </div>
        )}
      </div>

      {/* Basket Items List */}
      <div className="divide-y divide-surface-border mt-2">
        {basketItems.length > 0 ? (
          basketItems.map((item) => {
            return (
              <div
                key={item.productId}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors hover:bg-surface-subtle -mx-1 sm:-mx-2 px-1 sm:px-2 rounded-xl"
              >
                {/* Product Image & Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 p-1.5 bg-white border border-surface-border rounded-xl flex items-center justify-center overflow-hidden shadow-2xs">
                    <ProductImage
                      productId={item.product.id}
                      image={item.product.image}
                      emoji={item.product.emoji}
                      alt={item.product.name}
                      className="w-full h-full"
                      imgClassName="w-full h-full max-w-full max-h-full object-contain"
                      fallbackEmojiClassName="text-2xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-dark truncate m-0 font-malayalam">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider">
                      {item.product.categoryId}
                    </span>
                  </div>
                </div>

                {/* Unit Selection & Quantity Stepper */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-11 sm:pl-0 flex-wrap">
                  {/* Unit Picker */}
                  <div className="flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-xl px-2 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                      യൂണിറ്റ്:
                    </span>
                    {item.product.availableUnits && item.product.availableUnits.length > 1 ? (
                      <select
                        value={item.selectedUnit}
                        onChange={(e) => onUnitChange(item.productId, e.target.value)}
                        className="text-xs font-bold bg-white border border-surface-border rounded-lg px-2 py-0.5 text-slate-dark outline-none cursor-pointer"
                      >
                        {item.product.availableUnits.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-slate-dark px-1">
                        {item.selectedUnit}
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-xl p-1">
                    <button
                      onClick={() => onQuantityChange(item.productId, -1)}
                      className="p-1 rounded-lg bg-white hover:bg-red-50 text-slate-body hover:text-red-600 shadow-2xs active:scale-90 transition-all cursor-pointer"
                      title="കുറയ്ക്കുക"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="w-6 text-center font-black text-xs sm:text-sm text-slate-dark">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.productId, 1)}
                      className="p-1 rounded-lg bg-white hover:bg-brand-50 text-slate-body hover:text-brand-600 shadow-2xs active:scale-90 transition-all cursor-pointer"
                      title="കൂട്ടുക"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="p-1.5 text-slate-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="നീക്കം ചെയ്യുക"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center font-sans">
            <div className="w-12 h-12 bg-surface-subtle border border-surface-border rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-muted">
              <ShoppingCart className="w-6 h-6 text-slate-muted" />
            </div>
            <p className="text-sm font-bold text-slate-dark m-0 font-malayalam">ബാസ്ക്കറ്റ് ശൂന്യമാണ്</p>
            <p className="text-xs mt-1 text-slate-muted font-malayalam">
              താഴെയുള്ള ഉൽപ്പന്നങ്ങളിൽ നിന്ന് <b>+ ചേർക്കുക</b> ടാപ്പ് ചെയ്ത് ബാസ്ക്കറ്റ് തയ്യാറാക്കൂ.
            </p>
            
            {/* Quick Add Suggestions */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 font-malayalam">
              <span className="text-xs font-bold text-slate-muted">പ്രധാന സാധനങ്ങൾ:</span>
              <button
                onClick={() => onQuickAdd('tomato')}
                className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-surface-border hover:border-brand-400 px-2.5 py-1 rounded-full text-slate-body hover:text-brand-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>🍅 തക്കാളി</span>
              </button>
              <button
                onClick={() => onQuickAdd('onion')}
                className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-surface-border hover:border-brand-400 px-2.5 py-1 rounded-full text-slate-body hover:text-brand-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>🧅 സവാള</span>
              </button>
              <button
                onClick={() => onQuickAdd('milk')}
                className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-surface-border hover:border-brand-400 px-2.5 py-1 rounded-full text-slate-body hover:text-brand-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>🥛 പാൽ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacious Bottom Checkout & Pre-Book Summary Bar */}
      {basketItems.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F5F8F6] p-4 rounded-2xl border border-[#E3ECE7]">
          <div className="flex items-center gap-2.5 text-xs font-malayalam">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="font-extrabold text-slate-dark text-sm block">
                ആകെ: {totalItemCount} ഇനങ്ങൾ
              </span>
              <span className="text-slate-muted text-[11px]">
                {basketItems.length} വ്യത്യസ്ത ഉൽപ്പന്നങ്ങൾ തിരഞ്ഞെടുത്തിട്ടുണ്ട്
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onPreBookBasket && (
              <button
                onClick={onPreBookBasket}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 font-malayalam"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>വില ലോക്ക് ചെയ്ത് ചെക്ക്ഔട്ട് (Pre-Book)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
