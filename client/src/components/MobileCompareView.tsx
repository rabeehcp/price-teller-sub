import React, { useState } from 'react';
import {
  BasketItem,
  FullComparisonResponse,
  ShopComparisonResult,
  Location,
} from '../types';
import {
  Scale,
  ArrowLeft,
  Share2,
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CalendarCheck,
  Compass,
  ShoppingBag,
  TrendingDown,
  Store,
  ChevronRight,
} from 'lucide-react';

interface MobileCompareViewProps {
  basketItems: BasketItem[];
  comparison?: FullComparisonResponse | null;
  currentLocation?: Location | null;
  onBack?: () => void;
  onGoToSearch?: () => void;
  onOpenShopDetails?: (shopName: string) => void;
  onOpenChat?: (shopName?: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
  onOpenWhatsAppExport?: () => void;
}

export const MobileCompareView: React.FC<MobileCompareViewProps> = ({
  basketItems,
  comparison,
  currentLocation,
  onBack,
  onGoToSearch,
  onOpenShopDetails,
  onOpenChat,
  onPreBookBasket,
  onOpenWhatsAppExport,
}) => {
  const [comparisonSubTab, setComparisonSubTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'value' | 'price' | 'distance'>('value');

  const hasItems = basketItems.length > 0;
  const shops = comparison?.shops || [];
  const bestShop = shops.length > 0 ? shops[0] : null;
  const splitOpt = comparison?.splitOptimization;

  // Sorted shops based on active sort chip
  const sortedShops = [...shops].sort((a, b) => {
    if (sortBy === 'price') return a.total - b.total;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    // Default 'value': availability first, then price, then distance
    if (a.isAllAvailable !== b.isAllAvailable) return a.isAllAvailable ? -1 : 1;
    if (a.total !== b.total) return a.total - b.total;
    return a.distanceKm - b.distanceKm;
  });

  return (
    <div className="md:hidden space-y-3.5 font-sans pb-32 animate-in fade-in duration-150">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#F0F4F2] sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1 -ml-1 text-[#17221D] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#17221D]" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-[#17221D] font-malayalam m-0 leading-tight">
                വില താരതമ്യം
              </h1>
              <span className="text-[10px] text-[#66756E] font-medium block">
                📍 {currentLocation?.name || 'തിരൂർ'} മാർക്കറ്റ്
              </span>
            </div>
          </div>
        </div>

        {hasItems && onOpenWhatsAppExport && (
          <button
            type="button"
            onClick={onOpenWhatsAppExport}
            className="flex items-center gap-1 text-[11px] font-bold text-[#063B2A] bg-[#E8F5EE] hover:bg-[#D5EADB] border border-[#C3EEDC] px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95 font-malayalam"
            title="വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യുക"
          >
            <Share2 className="w-3 h-3 text-[#0B8F68]" />
            <span>ഷെയർ</span>
          </button>
        )}
      </div>

      <div className="px-3.5 space-y-3">
        {/* EMPTY STATE */}
        {!hasItems ? (
          <div className="p-6 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3.5 shadow-2xs mt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto shadow-inner">
              <Scale className="w-8 h-8 text-[#0B8F68]" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#17221D] font-malayalam m-0">
                താരതമ്യം ചെയ്യാൻ സാധനങ്ങൾ ചേർക്കൂ
              </h3>
              <p className="text-xs text-[#66756E] font-malayalam max-w-xs mx-auto leading-relaxed">
                സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർത്താൽ നിങ്ങളുടെ പ്രദേശത്തെ കടകളിലെ കൃത്യമായ വില വ്യത്യാസവും ലാഭവും ഇവിടെ കാണാം.
              </p>
            </div>

            {onGoToSearch && (
              <button
                type="button"
                onClick={onGoToSearch}
                className="w-full py-3 px-4 bg-[#063B2A] hover:bg-[#0B8F68] active:scale-98 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>സാധനങ്ങൾ തിരഞ്ഞെടുക്കുക</span>
              </button>
            )}

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-left font-malayalam">
              <div className="p-2.5 bg-[#F5F8F6] rounded-xl border border-[#E3ECE7]">
                <div className="text-xs font-black text-[#0B8F68] mb-0.5">⚡ ഒറ്റ കട വില</div>
                <div className="text-[10px] text-slate-600">ഏറ്റവും കുറഞ്ഞ നിരക്കുള്ള കട തൽക്ഷണം അറിയാം</div>
              </div>
              <div className="p-2.5 bg-[#F5F8F6] rounded-xl border border-[#E3ECE7]">
                <div className="text-xs font-black text-amber-600 mb-0.5">✨ സ്പ്ലിറ്റ് ലാഭം</div>
                <div className="text-[10px] text-slate-600">കടകൾ തിരിച്ച് വാങ്ങി പരമാവധി ലാഭിക്കാം</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Top Savings Summary Card */}
            {comparison && (
              <div className="bg-gradient-to-br from-[#063B2A] via-[#0B4D38] to-[#04281C] text-white rounded-2xl p-3.5 shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold font-malayalam">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>ഏറ്റവും മികച്ച നിരക്ക്</span>
                  </div>
                  {comparison.maxSavings > 0 && (
                    <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-black px-2 py-0.5 rounded-full font-malayalam">
                      ₹{comparison.maxSavings} വരെ ലാഭം
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <span className="text-xs text-emerald-200/80 block font-malayalam">ശുപാർശ ചെയ്യുന്ന കട:</span>
                    <span className="text-base font-black text-white truncate max-w-[200px] block">
                      {comparison.bestShopName || bestShop?.shopName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-300 font-sans">
                      ₹{comparison.bestTotal}
                    </span>
                    {comparison.averageMarketTotal > comparison.bestTotal && (
                      <span className="text-[10px] text-slate-300 block line-through font-sans">
                        ശരാശരി: ₹{comparison.averageMarketTotal}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Sub-Tabs: Single Store vs Split Optimizer */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#F5F8F6] p-1 rounded-xl text-xs font-bold border border-[#E3ECE7]">
              <button
                type="button"
                onClick={() => setComparisonSubTab('single')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-malayalam ${
                  comparisonSubTab === 'single'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
                <span>ഒറ്റ കട (Single Store)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setComparisonSubTab('split')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all relative cursor-pointer font-malayalam ${
                  comparisonSubTab === 'split'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>സ്പ്ലിറ്റ് ഒപ്റ്റിമൈസർ</span>
                {splitOpt?.isWorthSplitting && (
                  <span className="w-2 h-2 rounded-full bg-[#10A978] absolute top-1.5 right-1.5" />
                )}
              </button>
            </div>

            {/* 4. Sort Filter Chips (Single Store Tab) */}
            {comparisonSubTab === 'single' && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 overflow-x-auto pb-0.5 no-scrollbar font-malayalam">
                <span className="flex items-center gap-1 shrink-0 text-slate-400">
                  <Compass className="w-3 h-3" /> ക്രമീകരിക്കുക:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy('value')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    sortBy === 'value'
                      ? 'bg-[#063B2A] text-white'
                      : 'bg-white border border-[#E3ECE7] text-slate-700'
                  }`}
                >
                  ⚡ സ്മാർട്ട് വാല്യു
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('price')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    sortBy === 'price'
                      ? 'bg-[#063B2A] text-white'
                      : 'bg-white border border-[#E3ECE7] text-slate-700'
                  }`}
                >
                  ₹ വിലക്കുറവ്
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    sortBy === 'distance'
                      ? 'bg-[#063B2A] text-white'
                      : 'bg-white border border-[#E3ECE7] text-slate-700'
                  }`}
                >
                  📍 സമീപം
                </button>
              </div>
            )}

            {/* 5. SINGLE STORE CONTENT */}
            {comparisonSubTab === 'single' && (
              <div className="space-y-3">
                {sortedShops.length === 0 ? (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-malayalam">
                    ഈ പ്രദേശത്തെ കടകളുടെ വില വിവരങ്ങൾ തയ്യാറാകുന്നു...
                  </div>
                ) : (
                  sortedShops.map((shop: ShopComparisonResult) => {
                    const isBest = shop.shopName === bestShop?.shopName;
                    return (
                      <div
                        key={shop.shopId || shop.shopName}
                        className={`rounded-2xl p-3.5 transition-all bg-white ${
                          isBest
                            ? 'border-2 border-[#0B8F68] bg-[#F4FAF6] shadow-sm'
                            : 'border border-[#E3ECE7] hover:border-gray-300 shadow-2xs'
                        }`}
                      >
                        {/* Store Header & Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Store className="w-4 h-4 text-[#0B8F68] shrink-0" />
                            <b className="text-sm font-black text-slate-900 truncate">
                              {shop.shopName}
                            </b>
                          </div>
                          {isBest && (
                            <span className="text-[9px] font-black bg-[#0B8F68] text-white px-2 py-0.5 rounded-full uppercase shadow-2xs shrink-0 font-malayalam">
                              ഏറ്റവും കുറഞ്ഞ വില
                            </span>
                          )}
                        </div>

                        {/* Total Price & Distance */}
                        <div className="flex items-baseline justify-between my-1.5">
                          <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                            ₹{shop.total}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3 text-[#0B8F68]" />
                            <span>{shop.distanceKm} km</span>
                          </div>
                        </div>

                        {/* Availability Status */}
                        <div className="flex items-center gap-2 text-xs mb-2">
                          {shop.isAllAvailable ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] font-malayalam">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>എല്ലാ ഇനങ്ങളും ലഭ്യമാണ് ({basketItems.length}/{basketItems.length})</span>
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px] font-malayalam">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>{shop.outOfStockCount} ഇനം സ്റ്റോക്കില്ല</span>
                            </span>
                          )}
                        </div>

                        {/* Missing Products Details */}
                        {!shop.isAllAvailable && shop.missingProducts && shop.missingProducts.length > 0 && (
                          <div className="mb-2.5 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-950 font-malayalam">
                            <span className="font-bold block mb-1">ലഭ്യമല്ലാത്തവ:</span>
                            <div className="flex flex-wrap gap-1">
                              {shop.missingProducts.map((p) => (
                                <span
                                  key={p.productId}
                                  className="inline-block bg-white border border-rose-200 px-1.5 py-0.5 rounded-md font-bold text-rose-700"
                                >
                                  {p.productName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Difference vs Best */}
                        <div className="text-xs font-bold mb-2.5 font-malayalam">
                          {isBest ? (
                            <span className="text-[#0B8F68] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>ബാസ്ക്കറ്റിലെ ഏറ്റവും മികച്ച നിരക്ക്</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {bestShop?.shopName}-നേക്കാൾ ₹{shop.differenceVsBest} കൂടുതൽ
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: കട കാണുക, ചാറ്റ്, പ്രീ-ബുക്ക് */}
                        <div className="grid grid-cols-3 gap-1.5 font-malayalam pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                            className="py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                          >
                            <span>കട കാണുക</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                            className="py-2 px-1 bg-[#E8F5EE] hover:bg-[#D5EADB] text-[#063B2A] border border-[#C3EEDC] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                          >
                            <MessageCircle className="w-3 h-3 text-[#0B8F68]" />
                            <span>ചാറ്റ്</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                            className={`py-2 px-1 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                              isBest
                                ? 'bg-[#0B8F68] hover:bg-[#063B2A] text-white shadow-2xs'
                                : 'bg-[#063B2A] hover:bg-[#0B8F68] text-white'
                            }`}
                          >
                            <CalendarCheck className="w-3 h-3" />
                            <span>പ്രീ-ബുക്ക്</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 6. SPLIT OPTIMIZER CONTENT */}
            {comparisonSubTab === 'split' && (
              <div className="space-y-3">
                {splitOpt?.isWorthSplitting ? (
                  <div className="space-y-3 font-malayalam">
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-2xl space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#063B2A]">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>സ്പ്ലിറ്റ് ചെയ്താൽ ₹{splitOpt.additionalSavings} അധികം ലാഭം!</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {splitOpt.tipMessage || 'രണ്ട് കടകളിൽ നിന്ന് ഏറ്റവും വിലകുറഞ്ഞവ വേർതിരിച്ച് വാങ്ങി കൂടുതൽ ലാഭിക്കാം.'}
                      </p>
                    </div>

                    {/* Stores in Split */}
                    {splitOpt.stores?.map((st, idx) => (
                      <div key={idx} className="bg-white border border-[#E3ECE7] rounded-2xl p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">കട {idx + 1}</span>
                            <h4 className="text-xs font-black text-slate-900 m-0">{st.shopName}</h4>
                          </div>
                          <span className="text-sm font-black text-[#0B8F68] font-sans">
                            ₹{st.subtotal}
                          </span>
                        </div>

                        {/* Items to buy */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500">ഇവിടെ വാങ്ങേണ്ടവ ({st.items?.length || 0} എണ്ണം):</span>
                          <div className="space-y-1">
                            {st.items?.map((it, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded-lg">
                                <span className="truncate">{it.productName} ({it.quantity} {it.unit})</span>
                                <span className="font-bold font-sans">₹{it.lineTotal}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onPreBookBasket && onPreBookBasket(st.shopName)}
                          className="w-full py-2 bg-[#063B2A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{st.shopName}-ൽ നിന്ന് പ്രീ-ബുക്ക് ചെയ്യുക</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-[#E3ECE7] rounded-2xl text-center space-y-2 font-malayalam">
                    <div className="text-2xl">✨</div>
                    <h4 className="text-xs font-black text-slate-900 m-0">
                      സ്പ്ലിറ്റ് ചെയ്യേണ്ട ആവശ്യമില്ല
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      നിങ്ങൾ തിരഞ്ഞെടുത്ത സാധനങ്ങൾക്ക് ഏറ്റവും കുറഞ്ഞ നിരക്ക് ഒറ്റ കടയിൽ ({bestShop?.shopName || 'Best Store'}) ലഭ്യമാണ്.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
