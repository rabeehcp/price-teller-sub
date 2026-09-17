import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
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
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
  isDirty?: boolean;
  currentIndex?: number;
  totalProducts?: number;
  onNavigateProduct?: (direction: 'prev' | 'next') => void;
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
  isSaving = false,
  isDirty = false,
  currentIndex,
  totalProducts,
  onNavigateProduct,
}) => {
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Reset saved status when product changes
  useEffect(() => {
    setJustSaved(false);
  }, [product.id]);

  const handleSaveClick = async () => {
    if (!onSave || isSaving) return;
    try {
      await onSave();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (err) {
      console.error('Save failed in modal', err);
    }
  };

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
      ? Math.round(competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length)
      : currentPrice > 0
      ? currentPrice
      : 50;

  const minMarketPrice = competitorPrices.length > 0 ? Math.min(...competitorPrices) : currentPrice;
  const maxMarketPrice = competitorPrices.length > 0 ? Math.max(...competitorPrices) : currentPrice;
  const priceDiff = Math.round(currentPrice - avgMarketPrice);
  const originalDelta = Math.round(currentPrice - originalPrice);

  // Quick price adjustment helpers
  const handleFlatAdjust = (delta: number) => {
    const next = Math.max(1, Math.round(currentPrice + delta));
    onPriceChange(next);
  };

  const handlePercentAdjust = (percent: number) => {
    const factor = 1 + percent / 100;
    const next = Math.max(1, Math.round(currentPrice * factor));
    onPriceChange(next);
  };

  const handleMatchMarketAvg = () => {
    onPriceChange(Math.round(avgMarketPrice));
  };

  // Keyboard arrow shortcuts to step through products
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' && onNavigateProduct) {
        e.preventDefault();
        onNavigateProduct('prev');
      } else if (e.key === 'ArrowRight' && onNavigateProduct) {
        e.preventDefault();
        onNavigateProduct('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateProduct, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div
        className="relative z-10 bg-white w-full md:max-w-2xl max-h-[92vh] md:max-h-[88vh] rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-malayalam animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Pill */}
        <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* 1. Sleek Header Bar: Drag Pill, Title, Counter & Close */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#E3ECE7] bg-[#F8FAF9] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-black text-slate-800 font-malayalam flex items-center gap-1.5">
              <span>ഉൽപ്പന്ന വിശകലനം</span>
              <span className="text-slate-300 font-normal">|</span>
              <span className="text-slate-500 font-mono text-[11px] font-bold truncate max-w-[120px] sm:max-w-none">
                {selectedShopName}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateProduct && typeof currentIndex === 'number' && typeof totalProducts === 'number' && totalProducts > 1 && (
              <div className="flex items-center bg-white border border-[#E3ECE7] rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onNavigateProduct('prev')}
                  className="p-1 hover:bg-gray-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="മുൻപത്തെ ഉൽപ്പന്നം (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 select-none">
                  {currentIndex} / {totalProducts}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateProduct('next')}
                  className="p-1 hover:bg-gray-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="അടുത്ത ഉൽപ്പന്നം (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer shrink-0"
              title="അടയ്ക്കുക (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-xs">
          {/* HERO SHOWCASE: Big, Spacious Product Presentation */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 bg-gradient-to-b from-[#f8faf9] to-[#EDFAF3]/30 border border-[#E3ECE7] rounded-3xl p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
            {/* Big Product Image Showcase Card */}
            <div className="relative w-full sm:w-56 h-48 sm:h-56 bg-white rounded-2xl border border-[#E3ECE7] p-3 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden group">
              <ProductImage
                productId={product.id}
                image={product.image}
                emoji={product.emoji}
                alt={product.name}
                className="w-full h-full"
                imgClassName="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                fallbackEmojiClassName="text-6xl sm:text-7xl select-none"
                isOutOfStock={currentStock === 'out_of_stock'}
                stampSize="md"
              />

              {/* Floating Prev Button on Image */}
              {onNavigateProduct && typeof totalProducts === 'number' && totalProducts > 1 && (
                <button
                  type="button"
                  onClick={() => onNavigateProduct('prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-gray-200/80 flex items-center justify-center transition-all active:scale-90 cursor-pointer z-10"
                  title="മുൻപത്തെ ഉൽപ്പന്നം (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Floating Next Button on Image */}
              {onNavigateProduct && typeof totalProducts === 'number' && totalProducts > 1 && (
                <button
                  type="button"
                  onClick={() => onNavigateProduct('next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-gray-200/80 flex items-center justify-center transition-all active:scale-90 cursor-pointer z-10"
                  title="അടുത്ത ഉൽപ്പന്നം (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Floating Product Counter Pill on Mobile */}
              {typeof currentIndex === 'number' && typeof totalProducts === 'number' && totalProducts > 1 && (
                <div className="sm:hidden absolute bottom-2 z-10">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {currentIndex} / {totalProducts}
                  </span>
                </div>
              )}
            </div>

            {/* Product Meta & Title Block */}
            <div className="flex-1 min-w-0 w-full text-left space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-slate-200/80 text-slate-800 rounded-md font-mono font-bold text-xs shadow-2xs">
                  {product.defaultUnit}
                </span>
                <span className="capitalize text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold text-xs border border-emerald-200/60 shadow-2xs">
                  {product.categoryId}
                </span>
                {isDirty && (
                  <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded-md shadow-xs animate-pulse">
                    ✏️ മാറ്റം വരുത്തി
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug font-malayalam break-words">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 pt-0.5 text-xs text-slate-600 flex-wrap">
                <div className="bg-white border border-[#E3ECE7] px-2.5 py-1 rounded-xl shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-semibold mr-1">വിൽപന വില:</span>
                  <span className="font-sans font-black text-slate-900 text-sm">₹{currentPrice}</span>
                  <span className="text-[10px] text-gray-400 font-mono ml-0.5">/{product.defaultUnit}</span>
                </div>

                {product.nutritionalNote && (
                  <span className="text-[11px] text-gray-400 font-sans truncate max-w-[220px]">
                    {product.nutritionalNote}
                  </span>
                )}
              </div>
            </div>
          </div>
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
                  <span className="font-black font-sans">₹{Math.abs(priceDiff)}</span> കുറവാണ്. ഇത്
                  കൂടുതൽ ഉപഭോക്താക്കളെ നിങ്ങളുടെ കടയിലേക്ക് ആകർഷിക്കും!
                </div>
              </div>
            ) : priceDiff > 0 ? (
              <div className="bg-amber-100/70 border border-amber-300 text-amber-950 p-2.5 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed">
                <TrendingUp className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <b className="font-black">ശ്രദ്ധിക്കുക:</b> നിങ്ങളുടെ വില വിപണി ശരാശരിയേക്കാൾ{' '}
                  <span className="font-black font-sans">₹{priceDiff}</span> കൂടുതലാണ്.
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
                  {originalDelta > 0 ? `+₹${originalDelta}` : `-₹${Math.abs(originalDelta)}`}
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

        {/* 3. Footer: Delist, Prev/Next & Done/Save */}
        <div className="p-4 sm:p-5 border-t border-[#E3ECE7] bg-[#F8FAF9] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelist();
            }}
            className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ഒഴിവാക്കുക (Delist)</span>
          </button>

          {/* Stepper buttons in footer */}
          {onNavigateProduct && typeof totalProducts === 'number' && totalProducts > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => onNavigateProduct('prev')}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="മുൻപത്തെ ഉൽപ്പന്നം"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">മുൻപത്തെത്</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateProduct('next')}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="അടുത്ത ഉൽപ്പന്നം"
              >
                <span className="hidden sm:inline">അടുത്തത്</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {(isDirty || justSaved) && onSave && (
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={isSaving || (!isDirty && justSaved)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all ${
                  isSaving
                    ? 'bg-amber-600 text-white cursor-wait opacity-90'
                    : justSaved && !isDirty
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#0B8F68] hover:bg-[#063B2A] text-white cursor-pointer active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>സേവ് ചെയ്യുന്നു...</span>
                  </>
                ) : justSaved && !isDirty ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>സേവ് ചെയ്തു! ✓</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>സേവ് ചെയ്യുക</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
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
