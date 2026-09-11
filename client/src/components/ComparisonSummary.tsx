import React, { useState } from 'react';
import { FullComparisonResponse, ShopComparisonResult } from '../types';
import { Share2, MapPin, Layers, Award, Sparkles, AlertCircle, CheckCircle2, Swords, Compass, MessageCircle, CalendarCheck } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ComparisonSummaryProps {
  comparison: FullComparisonResponse | null;
  isLoading: boolean;
  onOpenShopDetails: (shopName: string) => void;
  onOpenWhatsAppExport: () => void;
  onOpenItemizedMatrix: () => void;
  onOpenStoreDuel: () => void;
  onOpenChat?: (shopName: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  comparison,
  isLoading,
  onOpenShopDetails,
  onOpenWhatsAppExport,
  onOpenItemizedMatrix,
  onOpenStoreDuel,
  onOpenChat,
  onPreBookBasket,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'value' | 'price' | 'distance' | 'delivery'>('value');

  const hasItems = comparison && comparison.itemCount > 0;
  const bestShop = comparison?.shops[0];
  const splitOpt = comparison?.splitOptimization;

  // Apply sorting preference (smart value balances lowest price with distance cost)
  let sortedShops = comparison?.shops ? [...comparison.shops] : [];
  if (sortBy === 'distance') {
    sortedShops.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'delivery') {
    sortedShops.sort((a, b) => a.deliveryFee - b.deliveryFee);
  } else if (sortBy === 'price') {
    sortedShops.sort((a, b) => a.total - b.total);
  } else {
    // 'value': Smart score factoring cart total, travel distance, and delivery fee
    sortedShops.sort((a, b) => (a.total + a.distanceKm * 6 + a.deliveryFee) - (b.total + b.distanceKm * 6 + b.deliveryFee));
  }

  return (
    <aside className="bg-white border border-surface-border rounded-2xl p-4 sm:p-5 sticky top-20 shadow-xs transition-all font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <span className="font-extrabold tracking-widest text-brand-700 uppercase text-[10px] sm:text-[11px] font-malayalam">
          വില താരതമ്യ എൻജിൻ
        </span>
        {hasItems && (
          <button
            onClick={onOpenWhatsAppExport}
            className="flex items-center gap-1 text-[11px] font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95 font-malayalam"
            title="വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യുക"
          >
            <Share2 className="w-3 h-3" />
            <span>ഷെയർ</span>
          </button>
        )}
      </div>

      <h2 className="text-lg sm:text-xl font-black text-slate-dark mb-3 leading-tight font-malayalam">
        ഏത് കടയിലാണ് ഏറ്റവും ലാഭം?
      </h2>

      {/* Tabs: Single Store vs Split Optimizer */}
      {hasItems && (
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-1 bg-surface-subtle p-1 rounded-xl text-xs font-bold border border-surface-border">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-malayalam ${
                activeTab === 'single'
                  ? 'bg-white text-slate-dark shadow-2xs font-extrabold'
                  : 'text-slate-muted hover:text-slate-dark'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>ഒറ്റ കട (Single Store)</span>
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all relative cursor-pointer font-malayalam ${
                activeTab === 'split'
                  ? 'bg-white text-slate-dark shadow-2xs font-extrabold'
                  : 'text-slate-muted hover:text-slate-dark'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>സ്പ്ലിറ്റ് ഒപ്റ്റിമൈസർ</span>
              {splitOpt?.isWorthSplitting && (
                <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-1.5 right-1.5" />
              )}
            </button>
          </div>

          {/* Sort By Filter Pills */}
          {activeTab === 'single' && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-muted overflow-x-auto pb-0.5 no-scrollbar font-malayalam">
              <span className="flex items-center gap-0.5 shrink-0">
                <Compass className="w-3 h-3 text-slate-muted" /> തരംതിരിക്കുക:
              </span>
              <button
                onClick={() => setSortBy('value')}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  sortBy === 'value'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-subtle hover:bg-gray-200 text-slate-dark'
                }`}
              >
                ⚡ സ്മാർട്ട് വാല്യൂ
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  sortBy === 'price'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-subtle hover:bg-gray-200 text-slate-dark'
                }`}
              >
                വിലക്കുറവ്
              </button>
              <button
                onClick={() => setSortBy('distance')}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  sortBy === 'distance'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-subtle hover:bg-gray-200 text-slate-dark'
                }`}
              >
                സമീപം
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Body */}
      {!hasItems ? (
        <div className="text-center text-slate-muted py-8 px-4 border border-dashed border-surface-border rounded-xl my-2 bg-surface-subtle/50 font-sans">
          <div className="text-3xl mb-2 opacity-70">⚖️</div>
          <b className="block text-sm text-slate-dark mb-1 font-malayalam">താരതമ്യം ചെയ്യാൻ സാധനങ്ങൾ ചേർക്കൂ</b>
          <p className="text-xs text-slate-muted font-malayalam">
            ലിസ്റ്റിൽ നിന്ന് സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർത്താൽ ഏറ്റവും കുറഞ്ഞ നിരക്കുള്ള കട കണ്ടെത്താം.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-6 space-y-3">
          <div className="h-24 bg-surface-subtle animate-pulse rounded-xl" />
          <div className="h-20 bg-surface-subtle animate-pulse rounded-xl" />
        </div>
      ) : activeTab === 'single' ? (
        /* Single Store Comparison View */
        <div className="space-y-2.5 my-2" id="shops">
          {sortedShops.map((shop: ShopComparisonResult) => {
            const isBest = shop.shopName === bestShop?.shopName;
            return (
              <div
                key={shop.shopId || shop.shopName}
                className={`border rounded-2xl p-3.5 transition-all ${
                  isBest
                    ? 'border-2 border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-surface-border bg-white hover:border-gray-300'
                }`}
              >
                {/* Store Name & Best Badge */}
                <div className="flex items-center justify-between gap-2">
                  <b className="text-sm font-extrabold text-slate-dark truncate font-malayalam">
                    {shop.shopName}
                  </b>
                  {isBest && (
                    <span className="text-[9px] font-black tracking-wide bg-brand-600 text-white px-2 py-0.5 rounded-full uppercase shadow-2xs shrink-0 font-malayalam">
                      ഏറ്റവും മികച്ച വില
                    </span>
                  )}
                </div>

                {/* Total Price */}
                <div className="text-2xl font-black text-slate-dark my-1 tracking-tight">
                  ₹{shop.total}
                </div>

                {/* Distance & Stock Meta */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-muted font-medium mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-dark bg-surface-subtle border border-surface-border px-2 py-0.5 rounded-lg text-[10px]">
                    <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                    <span>{shop.distanceKm} km ദൂരം</span>
                  </span>
                  <span>·</span>
                  {shop.isAllAvailable ? (
                    <span className="text-brand-700 font-semibold flex items-center gap-1 text-[11px] font-malayalam">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>എല്ലാം ലഭ്യമാണ്</span>
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold flex items-center gap-1 text-[11px] font-malayalam">
                      <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{shop.outOfStockCount} എണ്ണം സ്റ്റോക്കില്ല</span>
                    </span>
                  )}
                </div>

                {/* Missing Products Alert */}
                {!shop.isAllAvailable && shop.missingProducts && shop.missingProducts.length > 0 && (
                  <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-900 font-malayalam">
                    <span className="font-bold block mb-1">ഇവിടെ ലഭ്യമല്ലാത്തവ:</span>
                    <div className="flex flex-wrap gap-1">
                      {shop.missingProducts.map((p) => (
                        <span
                          key={p.productId}
                          className="inline-flex items-center gap-1 bg-white border border-rose-200 px-1.5 py-0.5 rounded-md font-semibold text-rose-800"
                        >
                          <span>{p.productName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings or Price Difference */}
                <div className="text-xs font-bold mb-2.5 font-malayalam">
                  {isBest ? (
                    <span className="text-brand-700 flex items-center gap-1">
                      ✨ ബാസ്ക്കറ്റിലെ ഏറ്റവും കുറഞ്ഞ ആകെ തുക
                    </span>
                  ) : (
                    <span className="text-slate-muted">
                      {bestShop?.shopName}-നേക്കാൾ ₹{shop.differenceVsBest} കൂടുതൽ
                    </span>
                  )}
                </div>

                {/* Action Buttons: Store, Chat & Pre-book */}
                <div className="grid grid-cols-3 gap-1.5 font-malayalam">
                  <button
                    onClick={() => onOpenShopDetails(shop.shopName)}
                    className="py-1.5 px-1 rounded-xl font-bold text-[11px] bg-surface-subtle hover:bg-gray-200 text-slate-dark flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    <span>കട കാണുക</span>
                  </button>

                  <button
                    onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                    className="py-1.5 px-1 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                    title={`${shop.shopName} കടയുമായി ചാറ്റ് ചെയ്യുക`}
                  >
                    <MessageCircle className="w-3 h-3 text-brand-600" />
                    <span>ചാറ്റ്</span>
                  </button>

                  <button
                    onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                    className={`py-1.5 px-1 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isBest
                        ? 'bg-brand-600 hover:bg-brand-700 text-white'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                    title="പ്രീ-ബുക്ക് ചെയ്യുക"
                  >
                    <CalendarCheck className="w-3 h-3" />
                    <span>പ്രീ-ബുക്ക്</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Multi-Store Split Optimizer View */
        <div className="my-2 space-y-3 font-malayalam">
          {splitOpt?.isWorthSplitting ? (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-brand-800 mb-1">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>കൂടുതൽ ലാഭം കണ്ടെത്തൂ!</span>
              </div>
              <div className="text-2xl font-black text-brand-950 my-1 font-sans">
                ₹{splitOpt.combinedTotal}
                <span className="text-xs font-normal text-brand-700 ml-2 font-malayalam">
                  (₹{splitOpt.additionalSavings} അധിക ലാഭം)
                </span>
              </div>
              <p className="text-xs text-brand-800 leading-relaxed mb-3">
                {splitOpt.tipMessage}
              </p>

              {/* Stores Breakdown */}
              <div className="space-y-2">
                {splitOpt.stores.map((s, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3 border border-brand-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-dark mb-1">
                      <span>📍 {s.shopName}</span>
                      <span className="text-brand-700 font-extrabold font-sans">₹{s.subtotal}</span>
                    </div>
                    <ul className="text-slate-muted text-[11px] space-y-1">
                      {s.items.map((it, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-1.5">
                          <span>• {it.productName} ({it.quantity} × {it.unit})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-subtle border border-surface-border rounded-2xl p-3.5 text-xs text-slate-body">
              <b className="block text-xs font-bold text-slate-dark mb-1">
                ഒറ്റ കടയിൽ നിന്ന് വാങ്ങുന്നതാണ് ഇപ്പോൾ ഏറ്റവും ഉചിതം!
              </b>
              <p className="leading-relaxed text-[11px]">
                {bestShop?.shopName} കടയിലാണ് ഏറ്റവും കുറഞ്ഞ നിരക്ക്.
              </p>
            </div>
          )}

          {/* Analysis Tools: Price Matrix & Store Duel */}
          <div className="pt-2 border-t border-surface-border space-y-2">
            <div className="text-[10px] font-bold text-slate-muted uppercase tracking-wider">
              വിശകലന ടൂളുകൾ (Tools)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenItemizedMatrix}
                className="py-2 px-2 bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span className="truncate">Price Matrix</span>
              </button>

              <button
                onClick={onOpenStoreDuel}
                className="py-2 px-2 bg-surface-subtle hover:bg-gray-200 text-slate-dark border border-surface-border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Swords className="w-3.5 h-3.5 text-slate-muted shrink-0" />
                <span className="truncate">Store Duel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Tip */}
      <div className="mt-3 bg-surface-subtle p-3 rounded-xl text-[11px] text-slate-body leading-relaxed border border-surface-border font-malayalam">
        💡 <b>സൂചന:</b> നിങ്ങളുടെ ബാസ്ക്കറ്റിലെ എല്ലാ സാധനങ്ങളുടെയും ആകെ തുകയും ദൂരവും കണക്കാക്കിയാണ് ഏറ്റവും ലാഭകരമായ കട നിർദ്ദേശിക്കുന്നത്.
      </div>
    </aside>
  );
};
