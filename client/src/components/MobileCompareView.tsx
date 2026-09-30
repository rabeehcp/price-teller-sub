import React, { useState } from 'react';
import {
  BasketItem,
  FullComparisonResponse,
  ShopComparisonResult,
  Location,
} from '../types';
import {
  ArrowLeft,
  Share2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CalendarCheck,
  ShoppingBag,
  Store,
  Phone,
  Sparkles,
  ChevronDown,
  Check,
  Scale,
  ShoppingCart,
  User,
  Users,
  Bell,
} from 'lucide-react';
import { ProductImage } from './ProductImage';

interface MobileCompareViewProps {
  basketItems: BasketItem[];
  comparison?: FullComparisonResponse | null;
  currentLocation?: Location | null;
  onOpenLocationModal?: () => void;
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
  onOpenLocationModal,
  onBack,
  onGoToSearch,
  onOpenShopDetails,
  onOpenChat,
  onPreBookBasket,
  onOpenWhatsAppExport,
}) => {
  const [comparisonSubTab, setComparisonSubTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'value'>('price');

  const hasItems = basketItems.length > 0;
  const shops = comparison?.shops || [];
  const bestShop = shops.length > 0 ? shops[0] : null;
  const splitOpt = comparison?.splitOptimization;

  // Sort shops based on selected criteria
  const sortedShops = [...shops].sort((a, b) => {
    if (sortBy === 'price') return a.total - b.total;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (a.isAllAvailable !== b.isAllAvailable) return a.isAllAvailable ? -1 : 1;
    if (a.total !== b.total) return a.total - b.total;
    return a.distanceKm - b.distanceKm;
  });

  return (
    <div className="w-full font-sans antialiased text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE-ONLY VIEW (< lg) - EXACT MATCH TO price_comparison_mobile MOCKUP */}
      {/* ========================================================================= */}
      <div className="block lg:hidden max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 text-slate-800 hover:text-black rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="text-center flex-1 px-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-malayalam leading-tight">
              വില താരതമ്യം
            </h1>
            <span className="text-[11px] text-slate-500 font-medium block">
              Price Comparison
            </span>
          </div>

          {hasItems && onOpenWhatsAppExport ? (
            <button
              type="button"
              onClick={onOpenWhatsAppExport}
              className="p-2 -mr-2 text-slate-800 hover:text-black rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Location Pill */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ECFDF5] border border-emerald-100 text-slate-800 text-xs font-semibold shadow-2xs hover:bg-[#DDF9EB] transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
            <span>{currentLocation?.name || 'Areekode'} Market</span>
          </button>
        </div>

        {/* EMPTY STATE */}
        {!hasItems ? (
          <div className="p-8 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-sm mt-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#063B2A] flex items-center justify-center mx-auto border border-[#C3EEDC]">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 font-malayalam">
                താരതമ്യം ചെയ്യാൻ സാധനങ്ങൾ ചേർക്കൂ
              </h3>
              <p className="text-xs text-slate-500 font-malayalam leading-relaxed">
                സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർത്താൽ നിങ്ങളുടെ പ്രദേശത്തെ കടകളിലെ കൃത്യമായ വില വ്യത്യാസവും ലാഭവും ഇവിടെ കാണാം.
              </p>
            </div>
            {onGoToSearch && (
              <button
                type="button"
                onClick={onGoToSearch}
                className="w-full py-3 px-4 bg-[#0D6344] hover:bg-[#064E3B] text-white text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>സാധനങ്ങൾ തിരഞ്ഞെടുക്കുക</span>
              </button>
            )}
          </div>
        ) : (!comparison || shops.length === 0) ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200/80 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200/60">
              🏪
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-malayalam">
                {currentLocation?.name || 'ഈ പ്രദേശത്ത്'} കടകൾ ലഭ്യമല്ല
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                വില താരതമ്യം ചെയ്യാൻ നിലവിൽ കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടുള്ള പ്രദേശം തിരഞ്ഞെടുക്കൂ.
              </p>
            </div>
            {onOpenLocationModal && (
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="w-full py-2.5 px-4 bg-[#0D6344] hover:bg-[#064E3B] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <MapPin className="w-4 h-4" />
                <span>പ്രദേശം മാറ്റുക (Change Location)</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Best Deal Store Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-800">Best Deal Store</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {comparison.bestShopName || bestShop?.shopName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Verified store</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                    ₹{Math.round(comparison.bestTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Control Pill: Single Store vs Split Optimizer */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setComparisonSubTab('single')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-all cursor-pointer ${
                  comparisonSubTab === 'single'
                    ? 'bg-[#0D6344] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Store
              </button>
              <button
                type="button"
                onClick={() => setComparisonSubTab('split')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-all cursor-pointer ${
                  comparisonSubTab === 'split'
                    ? 'bg-[#0D6344] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split Optimizer
              </button>
            </div>

            {/* Store Comparison Cards List (Mobile) */}
            {comparisonSubTab === 'single' && (
              <div className="space-y-4">
                {sortedShops.map((shop: ShopComparisonResult) => {
                  return (
                    <div
                      key={shop.shopId || shop.shopName}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                    >
                      {/* Row 1: Store Name & Distance */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">
                          {shop.shopName}
                        </h3>
                        <span className="text-sm font-semibold text-slate-500">
                          {shop.distanceKm} km
                        </span>
                      </div>

                      {/* Row 2: Stock Availability status */}
                      <div className="flex items-center gap-1.5">
                        {shop.isAllAvailable ? (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span>All {basketItems.length} items in stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-700">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{shop.outOfStockCount} items out of stock</span>
                          </div>
                        )}
                      </div>

                      {/* Row 3: Total Price */}
                      <div>
                        <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                          ₹{Math.round(shop.total)}
                        </span>
                      </div>

                      {/* Row 4: 4 Solid Green Action Buttons with English labels */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {/* 1. Store */}
                        <button
                          type="button"
                          onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                          className="bg-[#0D6344] hover:bg-[#084530] text-white p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Store className="w-5 h-5" />
                          <span className="text-xs font-semibold">Store</span>
                        </button>

                        {/* 2. Call */}
                        {shop.phone ? (
                          <a
                            href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                            className="bg-[#0D6344] hover:bg-[#084530] text-white p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Phone className="w-5 h-5" />
                            <span className="text-xs font-semibold">Call</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                            className="bg-[#0D6344] hover:bg-[#084530] text-white p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Phone className="w-5 h-5" />
                            <span className="text-xs font-semibold">Call</span>
                          </button>
                        )}

                        {/* 3. Chat */}
                        <button
                          type="button"
                          onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                          className="bg-[#0D6344] hover:bg-[#084530] text-white p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-xs font-semibold">Chat</span>
                        </button>

                        {/* 4. Pre-Book */}
                        <button
                          type="button"
                          onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                          className="bg-[#0D6344] hover:bg-[#084530] text-white p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <CalendarCheck className="w-5 h-5" />
                          <span className="text-xs font-semibold">Pre-Book</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Split Optimizer Content (Mobile) */}
            {comparisonSubTab === 'split' && (
              <div className="space-y-3 font-sans">
                {splitOpt?.isWorthSplitting ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#0D6344]">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Extra Savings: ₹{Math.round(splitOpt.additionalSavings)}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-malayalam">
                        {splitOpt.tipMessage || 'രണ്ട് കടകളിൽ നിന്ന് ഏറ്റവും വിലകുറഞ്ഞവ വേർതിരിച്ച് വാങ്ങി കൂടുതൽ ലാഭിക്കാം.'}
                      </p>
                    </div>

                    {splitOpt.stores?.map((st, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store {idx + 1}</span>
                            <h4 className="text-base font-bold text-slate-900">{st.shopName}</h4>
                          </div>
                          <span className="text-lg font-black text-[#0D6344] font-sans">
                            ₹{Math.round(st.subtotal)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {st.items?.map((it, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                              <span className="truncate pr-2 font-medium">{it.productName} ({it.quantity} {it.unit})</span>
                              <span className="font-bold text-slate-900 font-sans">₹{Math.round(it.lineTotal)}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => onPreBookBasket && onPreBookBasket(st.shopName)}
                          className="w-full py-2.5 bg-[#0D6344] hover:bg-[#084530] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 shadow-xs transition-all cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Pre-Book from {st.shopName}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center space-y-2 shadow-2xs">
                    <div className="text-3xl mb-1">✨</div>
                    <h4 className="text-sm font-bold text-slate-900">
                      No Split Needed
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      All your basket items already have the best possible combined rate at {bestShop?.shopName || 'Single Store'}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (lg:) - EXACT MATCH TO price_comparison_desktop MOCKUP     */}
      {/* ========================================================================= */}
      <div className="hidden lg:block w-full max-w-[1400px] mx-auto px-4 pb-16 pt-1 font-sans">
        
        {/* Top Dark Green Navigation Header (Exact match to Mockup top bar) */}
        <div className="w-full bg-[#173C2C] text-white px-6 py-3.5 flex items-center justify-between rounded-2xl shadow-md mb-6">
          {/* Left: PeediaCart Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700/60 flex items-center justify-center text-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-sans">
              PeediaCart
            </span>
          </div>

          {/* Center Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-100/80">
            <span
              onClick={onBack}
              className="hover:text-white cursor-pointer transition-colors"
            >
              Home
            </span>
            <span>&gt;</span>
            <span
              onClick={onBack}
              className="hover:text-white cursor-pointer transition-colors"
            >
              Basket
            </span>
            <span>&gt;</span>
            <span className="text-white font-bold">Price Comparison</span>
          </div>

          {/* Right User & Actions Icons */}
          <div className="flex items-center gap-3 text-emerald-100/90">
            <button
              type="button"
              className="p-1.5 hover:text-white hover:bg-emerald-800/50 rounded-full transition-colors cursor-pointer"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:text-white hover:bg-emerald-800/50 rounded-full transition-colors cursor-pointer"
              title="Community"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:text-white hover:bg-emerald-800/50 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Left Tabs | Right Location & Sort by */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setComparisonSubTab('single')}
              className={`text-sm font-bold pb-3 -mb-3 transition-colors cursor-pointer ${
                comparisonSubTab === 'single'
                  ? 'text-slate-900 border-b-2 border-[#173C2C]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Single Store Comparison
            </button>
            <button
              type="button"
              onClick={() => setComparisonSubTab('split')}
              className={`text-sm font-medium pb-3 -mb-3 transition-colors cursor-pointer ${
                comparisonSubTab === 'split'
                  ? 'text-slate-900 border-b-2 border-[#173C2C]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Split Cart Optimizer
            </button>
          </div>

          {/* Right Location & Sort Dropdown */}
          <div className="flex items-center gap-4">
            {/* Location Pill */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              <span>{currentLocation?.name || 'Areekode'} Market</span>
              <span className="text-xs">🗺️</span>
            </button>

            {/* Sort by Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort by</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort by comparison option"
                  className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#173C2C]"
                >
                  <option value="price">Price (Low-High)</option>
                  <option value="distance">Distance (Nearest)</option>
                  <option value="value">Smart Value</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY STATE (DESKTOP) */}
        {!hasItems ? (
          <div className="p-12 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#063B2A] flex items-center justify-center mx-auto border border-[#C3EEDC]">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Your Basket is Empty
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Add grocery items to your basket to compare real-time prices across all verified local supermarkets in your area.
              </p>
            </div>
            {onGoToSearch && (
              <button
                type="button"
                onClick={onGoToSearch}
                className="py-3 px-6 bg-[#173C2C] hover:bg-[#0c2b1f] text-white text-sm font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
              </button>
            )}
          </div>
        ) : (!comparison || shops.length === 0) ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80 space-y-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200/60">
              🏪
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                No stores registered in {currentLocation?.name || 'this location'}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Please switch to a supported market town to view price comparison and live stock.
              </p>
            </div>
            {onOpenLocationModal && (
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="py-2.5 px-6 bg-[#173C2C] hover:bg-[#0c2b1f] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <MapPin className="w-4 h-4" />
                <span>Change Location</span>
              </button>
            )}
          </div>
        ) : (
          /* 2-COLUMN MAIN LAYOUT (DESKTOP) */
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Best Deal Summary Sidebar (Sticky, col-span-3) */}
            <div className="col-span-3 sticky top-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Best Deal Summary
                </h3>

                {/* Recommend the store green box */}
                <div className="bg-[#E5F5E9] rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] text-slate-600 font-medium block">
                    Recommend the store
                  </span>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {comparison.bestShopName || bestShop?.shopName}
                  </div>
                </div>

                {/* Total price & Total savings stats row */}
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Total price</span>
                    <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                      ₹{Math.round(comparison.bestTotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Total savings</span>
                    <span className="text-2xl font-black text-[#136F48] font-sans tracking-tight">
                      ₹{Math.round(comparison.maxSavings || 0)}
                    </span>
                  </div>
                </div>

                {/* Basket Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Basket Items</span>
                    <span className="text-[11px] font-normal text-slate-400">{basketItems.length} items</span>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {basketItems.map((item) => {
                      const p = item.product;
                      const itemBreakdown = bestShop?.items?.find((i) => i.productId === item.productId);
                      const name = p?.name || itemBreakdown?.productName || 'Item';
                      const img = p?.image || itemBreakdown?.image;
                      const emoji = p?.emoji || itemBreakdown?.emoji || '📦';
                      const unitPrice = itemBreakdown ? itemBreakdown.unitPrice : 0;
                      const price = itemBreakdown ? itemBreakdown.lineTotal : 0;

                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between gap-2.5 text-xs py-1"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                              <ProductImage
                                productId={item.productId}
                                image={img}
                                emoji={emoji}
                                alt={name}
                                className="w-full h-full"
                                imgClassName="w-full h-full object-contain"
                                fallbackEmojiClassName="text-sm"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate text-xs">
                                {name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-sans block">
                                ₹{Math.round(unitPrice || price)}
                              </span>
                            </div>
                          </div>

                          <span className="font-bold text-slate-900 font-sans text-xs shrink-0">
                            ₹{Math.round(price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Store Cards 3-Column Grid (col-span-9) */}
            <div className="col-span-9">
              {comparisonSubTab === 'single' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {sortedShops.map((shop: ShopComparisonResult) => {
                    return (
                      <div
                        key={shop.shopId || shop.shopName}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                      >
                        {/* Top: Dual Verified Badges row */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                            </span>
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                            </span>
                          </div>

                          {/* Store Name & Distance / Stock */}
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                              {shop.shopName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{shop.distanceKm} km</span>
                              <span>•</span>
                              <span className={shop.isAllAvailable ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                                {shop.isAllAvailable ? 'In Stock' : `${shop.outOfStockCount} missing`}
                              </span>
                            </div>
                          </div>

                          {/* Big Gray Price Banner Box */}
                          <div className="bg-[#F1F3F5] rounded-xl p-3 my-2">
                            <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                              ₹{Math.round(shop.total)}
                            </span>
                          </div>

                          {/* Itemized List of Basket Products */}
                          <div className="space-y-1.5 pt-1">
                            {basketItems.map((item) => {
                              const p = item.product;
                              const itemBreakdown = shop.items?.find((i) => i.productId === item.productId);
                              const name = p?.name || itemBreakdown?.productName || 'Item';
                              const isMissing = !itemBreakdown || itemBreakdown.unitPrice <= 0 || itemBreakdown.stockStatus === 'out_of_stock';

                              return (
                                <div
                                  key={item.productId}
                                  className="flex items-center justify-between text-xs py-0.5"
                                >
                                  <span className="text-slate-700 font-medium truncate pr-2">
                                    {name}
                                  </span>
                                  <span className={`font-bold font-sans text-xs shrink-0 ${isMissing ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {isMissing ? 'N/A' : `₹${Math.round(itemBreakdown.lineTotal)}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Action Buttons: View Store (Solid Green), Call, Chat, Pre-Book (Outlines) */}
                        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100">
                          {/* 1. View Store */}
                          <button
                            type="button"
                            onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                            className="bg-[#173C2C] hover:bg-[#0c2b1f] text-white text-xs font-semibold py-2 px-1 rounded-lg text-center cursor-pointer shadow-2xs transition-all active:scale-95 truncate"
                          >
                            View Store
                          </button>

                          {/* 2. Call */}
                          {shop.phone ? (
                            <a
                              href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                            >
                              Call
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                            >
                              Call
                            </button>
                          )}

                          {/* 3. Chat */}
                          <button
                            type="button"
                            onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                          >
                            Chat
                          </button>

                          {/* 4. Pre-Book */}
                          <button
                            type="button"
                            onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                          >
                            Pre-Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Desktop Split Optimizer */
                <div className="space-y-4">
                  {splitOpt?.isWorthSplitting ? (
                    <div className="space-y-4">
                      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-[#173C2C] flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                            <span>Split Cart Savings: ₹{Math.round(splitOpt.additionalSavings)} Extra Savings</span>
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 max-w-lg">
                            Buying specific items from these different local stores saves you more than buying all from a single store.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {splitOpt.stores?.map((st, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store {idx + 1}</span>
                                  <h4 className="text-base font-bold text-slate-900">{st.shopName}</h4>
                                </div>
                                <span className="text-xl font-extrabold text-[#173C2C] font-sans">
                                  ₹{Math.round(st.subtotal)}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {st.items?.map((it, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                                    <span className="truncate pr-2 font-medium">{it.productName} ({it.quantity} {it.unit})</span>
                                    <span className="font-bold text-slate-900 font-sans">₹{Math.round(it.lineTotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onPreBookBasket && onPreBookBasket(st.shopName)}
                              className="w-full py-2.5 bg-[#173C2C] hover:bg-[#0c2b1f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 shadow-xs transition-all cursor-pointer"
                            >
                              <CalendarCheck className="w-4 h-4" />
                              <span>Pre-Book from {st.shopName}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 bg-white border border-slate-200/80 rounded-2xl text-center space-y-2">
                      <div className="text-3xl mb-1">✨</div>
                      <h4 className="text-base font-bold text-slate-900">
                        No Split Cart Needed
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Your basket items already have the lowest overall rate at {bestShop?.shopName || 'Single Store'}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
