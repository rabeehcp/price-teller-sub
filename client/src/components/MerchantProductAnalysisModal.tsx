import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { ProductImage } from './ProductImage';
import {
  X,
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Store,
  Tag,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MerchantProductAnalysisModalProps {
  product: Product;
  selectedShopName: string;
  shops: Shop[];
  currentPrice: number;
  originalPrice: number;
  currentStock: 'in_stock' | 'low_stock' | 'out_of_stock';
  onPriceChange: (newPrice: number) => void;
  onStockChange: (newStock: 'in_stock' | 'low_stock' | 'out_of_stock') => void;
  onDelist: () => void;
  onClose: () => void;
  onSave?: () => void;
  isDirty?: boolean;
}

export const MerchantProductAnalysisModal: React.FC<MerchantProductAnalysisModalProps> = ({
  product,
  selectedShopName,
  shops,
  currentPrice,
  originalPrice,
  currentStock,
  onPriceChange,
  onStockChange,
  onDelist,
  onClose,
  onSave,
  isDirty = false,
}) => {
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);

  // Competitor Analysis & Benchmarking
  const competitorEntries = Object.entries(product.prices || {})
    .filter(([shopName, price]) => {
      return (
        shopName.trim().toLowerCase() !== selectedShopName.trim().toLowerCase() &&
        typeof price === 'number' &&
        price > 0
      );
    })
    .map(([shopName, price]) => {
      const shopObj = shops.find((s) => s.name.toLowerCase() === shopName.toLowerCase());
      return {
        shopName,
        price,
        shopType: shopObj?.shopType || 'local_mart',
        address: shopObj?.address,
      };
    })
    .sort((a, b) => a.price - b.price);

  const competitorPrices = competitorEntries.map((c) => c.price);
  const avgMarketPrice =
    competitorPrices.length > 0
      ? Math.round((competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length) * 10) / 10
      : currentPrice > 0
      ? currentPrice
      : 50;

  const minMarketPrice = competitorPrices.length > 0 ? Math.min(...competitorPrices) : currentPrice;
  const maxMarketPrice = competitorPrices.length > 0 ? Math.max(...competitorPrices) : currentPrice;
  const priceDiff = currentPrice - avgMarketPrice;
  const originalDelta = currentPrice - originalPrice;

  // Quick price adjustment helpers
  const handleFlatAdjust = (delta: number) => {
    const next = Math.max(1, Math.round((currentPrice + delta) * 10) / 10);
    onPriceChange(next);
  };

  const handlePercentAdjust = (percent: number) => {
    const factor = 1 + percent / 100;
    const next = Math.max(1, Math.round(currentPrice * factor * 10) / 10);
    onPriceChange(next);
  };

  const handleMatchMarketAvg = () => {
    onPriceChange(Math.round(avgMarketPrice));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div
        className="relative z-10 bg-white w-full md:max-w-xl max-h-[90vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-malayalam animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Pill */}
        <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* 1. Header: Product Info & Close */}
        <div className="p-4 sm:p-5 border-b border-[#E3ECE7] flex items-center justify-between gap-3 bg-[#F8FAF9] shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-13 h-13 rounded-2xl bg-white border border-[#E3ECE7] p-1 flex items-center justify-center shadow-xs shrink-0">
              <ProductImage
                productId={product.id}
                image={product.image}
                emoji={product.emoji}
                alt={product.name}
                className="w-full h-full"
                imgClassName="w-full h-full object-contain"
                fallbackEmojiClassName="text-2xl"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
                  {product.name}
                </h3>
                {isDirty && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md animate-pulse">
                    ✏️ മാറ്റം വരുത്തി
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium flex-wrap">
                <span className="px-2 py-0.5 bg-slate-200/80 text-slate-800 rounded-md font-mono font-bold text-[11px]">
                  {product.defaultUnit}
                </span>
                <span className="capitalize text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  {product.categoryId}
                </span>
                {product.nutritionalNote && (
                  <span className="text-[11px] text-gray-400 font-sans truncate max-w-[160px]">
                    {product.nutritionalNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-slate-800 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer shrink-0"
            title="അടയ്ക്കുക"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-xs">
          {/* SECTION A: Market Price Benchmark & Strategy Insight */}
          <div className="bg-[#EDFAF3]/60 border border-[#C3EEDC] rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#0B8F68]" />
                <span>വിപണി വില വിശകലനം (Market Analysis)</span>
              </span>
              <span className="text-[10px] font-bold text-[#0B8F68] bg-white px-2 py-0.5 rounded-md border border-[#C3EEDC]">
                ലൈവ് താരതമ്യം
              </span>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-[#E3ECE7] text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">നിങ്ങളുടെ വില</span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-sans block">
                  ₹{currentPrice}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">/{product.defaultUnit}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">വിപണി ശരാശരി</span>
                <span className="text-base sm:text-lg font-black text-emerald-800 font-sans block">
                  ₹{avgMarketPrice}
                </span>
                <span className="text-[9px] text-emerald-600 font-mono">({competitorEntries.length} കടകൾ)</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E3ECE7] text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">കുറഞ്ഞ നിരക്ക്</span>
                <span className="text-base sm:text-lg font-black text-slate-700 font-sans block">
                  ₹{minMarketPrice}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">മാക്സ്: ₹{maxMarketPrice}</span>
              </div>
            </div>

            {/* Smart Pricing Advice Banner */}
            {priceDiff < 0 ? (
              <div className="bg-emerald-100/70 border border-emerald-300 text-emerald-950 p-2.5 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed">
                <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <b className="font-black">മികച്ച വില!</b> നിങ്ങളുടെ വില വിപണി ശരാശരിയേക്കാൾ{' '}
                  <span className="font-black font-sans">₹{Math.abs(priceDiff).toFixed(1)}</span> കുറവാണ്. ഇത്
                  കൂടുതൽ ഉപഭോക്താക്കളെ നിങ്ങളുടെ കടയിലേക്ക് ആകർഷിക്കും!
                </div>
              </div>
            ) : priceDiff > 0 ? (
              <div className="bg-amber-100/70 border border-amber-300 text-amber-950 p-2.5 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed">
                <TrendingUp className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <b className="font-black">ശ്രദ്ധിക്കുക:</b> നിങ്ങളുടെ വില വിപണി ശരാശരിയേക്കാൾ{' '}
                  <span className="font-black font-sans">₹{priceDiff.toFixed(1)}</span> കൂടുതലാണ്.
                  വിൽപ്പന വർദ്ധിപ്പിക്കാൻ നിരക്ക് ക്രമീകരിക്കാം.
                </div>
                <button
                  type="button"
                  onClick={handleMatchMarketAvg}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black shrink-0 cursor-pointer shadow-2xs"
                >
                  ശരാശരിയാക്കുക
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl flex items-center gap-2 text-[11px]">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>നിങ്ങളുടെ വില കൃത്യമായി വിപണി ശരാശരി നിരക്കിലാണ് (₹{avgMarketPrice}).</span>
              </div>
            )}

            {/* 1-Click Match Market Average Button */}
            {competitorEntries.length > 0 && Math.abs(priceDiff) > 0 && (
              <button
                type="button"
                onClick={handleMatchMarketAvg}
                className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-[#0B8F68] border border-[#C3EEDC] rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#10A978]" />
                <span>വിപണി ശരാശരിയിലേക്ക് മാറ്റുക (₹{Math.round(avgMarketPrice)})</span>
              </button>
            )}

            {/* Competitor Price Breakdown Accordion */}
            {competitorEntries.length > 0 ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllCompetitors((prev) => !prev)}
                  className="flex items-center justify-between w-full text-[11px] font-black text-slate-700 hover:text-slate-900 cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-gray-500" />
                    <span>മറ്റ് കടകളിലെ നിരക്കുകൾ ({competitorEntries.length})</span>
                  </span>
                  {showAllCompetitors ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showAllCompetitors && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in">
                    {competitorEntries.map((comp) => (
                      <div
                        key={comp.shopName}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200 text-[11px]"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-black text-slate-900 block truncate">{comp.shopName}</span>
                          {comp.address && (
                            <span className="text-[9px] text-gray-400 block truncate">{comp.address}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black font-sans text-xs text-slate-800">₹{comp.price}</span>
                          {comp.price === minMarketPrice && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-black text-[9px]">
                              കുറഞ്ഞത്
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-500 italic">
                മറ്റ് കടകൾ ഈ ഉൽപ്പന്നം നിലവിൽ ലിസ്റ്റ് ചെയ്തിട്ടില്ല. നിങ്ങളുടെ വില മാത്രമാണ് വിപണിയിലുള്ളത്!
              </p>
            )}
          </div>

          {/* SECTION B: 1-Touch Stock Status Controls */}
          <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs">സ്റ്റോക്ക് നില (Stock Status)</span>
              <span className="text-[11px] font-bold text-slate-600">
                {currentStock === 'in_stock'
                  ? '🟢 ഇൻ സ്റ്റോക്ക്'
                  : currentStock === 'low_stock'
                  ? '🟡 കുറഞ്ഞ സ്റ്റോക്ക്'
                  : '🔴 തീർന്നുപോയി'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onStockChange('in_stock')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStock === 'in_stock'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentStock === 'in_stock' ? 'bg-white' : 'bg-emerald-500'
                  }`}
                />
                <span>സ്റ്റോക്ക്</span>
              </button>

              <button
                type="button"
                onClick={() => onStockChange('low_stock')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStock === 'low_stock'
                    ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentStock === 'low_stock' ? 'bg-white' : 'bg-amber-500'
                  }`}
                />
                <span>കുറവ്</span>
              </button>

              <button
                type="button"
                onClick={() => onStockChange('out_of_stock')}
                className={`py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentStock === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentStock === 'out_of_stock' ? 'bg-white' : 'bg-rose-500'
                  }`}
                />
                <span>തീർന്നു</span>
              </button>
            </div>
          </div>

          {/* SECTION C: Easy Price Management & Safe Steppers */}
          <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs">വില ക്രമീകരിക്കുക (Price Edit)</span>
              {originalDelta !== 0 && (
                <span
                  className={`text-[11px] font-black font-sans px-2 py-0.5 rounded-md ${
                    originalDelta > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {originalDelta > 0 ? `+₹${originalDelta.toFixed(1)}` : `-₹${Math.abs(originalDelta).toFixed(1)}`}
                </span>
              )}
            </div>

            {/* Price Input Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white border-2 border-[#0B8F68] focus-within:ring-3 focus-within:ring-[#DDF5EA] rounded-2xl overflow-hidden shadow-xs flex-1">
                <span className="px-3.5 py-2.5 text-base font-black text-[#063B2A] bg-[#EDFAF3] border-r border-[#C3EEDC]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={currentPrice}
                  onChange={(e) => onPriceChange(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 text-lg font-black text-slate-900 outline-none font-sans"
                />
                <span className="px-3 text-xs font-bold text-gray-500 font-mono">
                  /{product.defaultUnit}
                </span>
              </div>

              {originalDelta !== 0 && (
                <button
                  type="button"
                  onClick={() => onPriceChange(originalPrice)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  title="യഥാർത്ഥ വിലയിലേക്ക് മാറ്റുക"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Stepper Touch Buttons */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-1.5">വേഗത്തിലുള്ള മാറ്റങ്ങൾ:</span>
              <div className="grid grid-cols-6 gap-1.5 font-sans">
                <button
                  type="button"
                  onClick={() => handleFlatAdjust(-10)}
                  className="py-2 bg-gray-100 hover:bg-emerald-50 active:scale-95 text-slate-800 rounded-xl text-xs font-black shadow-2xs border border-gray-200 cursor-pointer"
                >
                  -₹10
                </button>
                <button
                  type="button"
                  onClick={() => handleFlatAdjust(-5)}
                  className="py-2 bg-gray-100 hover:bg-emerald-50 active:scale-95 text-slate-800 rounded-xl text-xs font-black shadow-2xs border border-gray-200 cursor-pointer"
                >
                  -₹5
                </button>
                <button
                  type="button"
                  onClick={() => handleFlatAdjust(5)}
                  className="py-2 bg-gray-100 hover:bg-emerald-50 active:scale-95 text-slate-800 rounded-xl text-xs font-black shadow-2xs border border-gray-200 cursor-pointer"
                >
                  +₹5
                </button>
                <button
                  type="button"
                  onClick={() => handleFlatAdjust(10)}
                  className="py-2 bg-gray-100 hover:bg-emerald-50 active:scale-95 text-slate-800 rounded-xl text-xs font-black shadow-2xs border border-gray-200 cursor-pointer"
                >
                  +₹10
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentAdjust(-5)}
                  className="py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 rounded-xl text-xs font-black shadow-2xs border border-emerald-200 cursor-pointer"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => handlePercentAdjust(5)}
                  className="py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 rounded-xl text-xs font-black shadow-2xs border border-emerald-200 cursor-pointer"
                >
                  +5%
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer: Delist & Done/Save */}
        <div className="p-4 border-t border-[#E3ECE7] bg-[#F8FAF9] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelist();
            }}
            className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ഒഴിവാക്കുക (Delist)</span>
          </button>

          <div className="flex items-center gap-2">
            {isDirty && onSave && (
              <button
                type="button"
                onClick={() => {
                  onSave();
                  onClose();
                }}
                className="px-4 py-2.5 bg-[#0B8F68] hover:bg-[#063B2A] text-white rounded-2xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>സേവ് ചെയ്യുക</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                isDirty && onSave
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-[#063B2A] hover:bg-[#084D37] text-white shadow-xs'
              }`}
            >
              പൂർത്തിയായി (Done)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
