import React, { useState, useRef, useEffect } from 'react';
import {
  BasketItem,
  FullComparisonResponse,
  ShopComparisonResult,
  Location,
} from '../types';
import {
  ShoppingCart,
  User,
  Users,
  Bell,
  ChevronDown,
  Check,
  MapPin,
  Sparkles,
  CalendarCheck,
  Scale,
  ShoppingBag,
} from 'lucide-react';
import { ProductImage } from './ProductImage';

export interface DesktopCompareViewProps {
  basketItems: BasketItem[];
  comparison?: FullComparisonResponse | null;
  currentLocation?: Location | null;
  onOpenLocationModal?: () => void;
  onBack?: () => void;
  onGoToCart?: () => void;
  onGoToSearch?: () => void;
  onOpenShopDetails?: (shopName: string) => void;
  onOpenChat?: (shopName?: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
  onOpenWhatsAppExport?: () => void;
  onOpenProfile?: () => void;
  onOpenOrders?: () => void;
  onOpenDeals?: () => void;
}

export const DesktopCompareView: React.FC<DesktopCompareViewProps> = ({
  basketItems,
  comparison,
  currentLocation,
  onOpenLocationModal,
  onBack,
  onGoToCart,
  onGoToSearch,
  onOpenShopDetails,
  onOpenChat,
  onPreBookBasket,
  onOpenWhatsAppExport,
  onOpenProfile,
  onOpenOrders,
  onOpenDeals,
}) => {
  const [comparisonSubTab, setComparisonSubTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'distance' | 'value'>('price_asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const hasItems = basketItems.length > 0;
  const shops = comparison?.shops || [];
  const bestShop = shops.length > 0 ? shops[0] : null;
  const splitOpt = comparison?.splitOptimization;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort shops based on selected criteria
  const sortedShops = [...shops].sort((a, b) => {
    if (sortBy === 'price_asc') return a.total - b.total;
    if (sortBy === 'price_desc') return b.total - a.total;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (a.isAllAvailable !== b.isAllAvailable) return a.isAllAvailable ? -1 : 1;
    if (a.total !== b.total) return a.total - b.total;
    return a.distanceKm - b.distanceKm;
  });

  const sortOptions = [
    { value: 'price_asc', label: 'Price (Low-High)' },
    { value: 'price_desc', label: 'Price (High-Low)' },
    { value: 'distance', label: 'Distance (Nearest)' },
    { value: 'value', label: 'Smart Value' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Price (Low-High)';

  return (
    <div className="w-full min-h-screen bg-[#F4F6F5] font-sans text-slate-800 antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP DARK GREEN HEADER (Matches price_comparison_desktop mockup)        */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#173C2C] text-white px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-sm">
        {/* Left: PeediyaCart Logo */}
        <div
          onClick={onBack}
          className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity select-none"
        >
          <ShoppingCart className="w-5 h-5 text-white stroke-[2.4]" />
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            PeediyaCart
          </span>
        </div>

        {/* Center: Breadcrumbs (Home > Basket > Price Comparison) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-normal text-emerald-100/70">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-white/40 text-[11px]">&gt;</span>
          <button
            type="button"
            onClick={onGoToCart || onBack}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Basket
          </button>
          <span className="text-white/40 text-[11px]">&gt;</span>
          <span className="text-white font-semibold">Price Comparison</span>
        </nav>

        {/* Right: User Avatar, Community, Notifications */}
        <div className="flex items-center gap-2.5 text-white/90">
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Profile"
          >
            <User className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={onOpenOrders}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Orders & History"
          >
            <Users className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={onOpenDeals}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors relative cursor-pointer"
            title="Notifications & Deals"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-[#173C2C]" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT BODY (2 COLUMNS: SUMMARY + STORE CARDS)                  */}
      {/* ========================================================================= */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 space-y-5">
        
        {/* Sub-bar: Left Tabs | Right Location */}
        <div className="flex items-center justify-between border-b border-slate-200/90 pb-3">
          {/* Left Tabs: Single Store Comparison | Split Cart Optimizer */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setComparisonSubTab('single')}
              className={`text-sm pb-3 -mb-3 transition-colors cursor-pointer font-sans relative ${
                comparisonSubTab === 'single'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Single Store Comparison
              {comparisonSubTab === 'single' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#173C2C]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setComparisonSubTab('split')}
              className={`text-sm pb-3 -mb-3 transition-colors cursor-pointer font-sans relative ${
                comparisonSubTab === 'split'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Split Cart Optimizer
              {comparisonSubTab === 'split' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#173C2C]" />
              )}
            </button>
          </div>

          {/* Right Location Pill (Matches mockup) */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs"
            title="Change Market Hub"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentLocation?.name || 'Areekode'} Market</span>
            <div className="w-4 h-4 rounded bg-rose-50 border border-rose-200/60 flex items-center justify-center text-[10px]">
              📍
            </div>
          </button>
        </div>

        {/* Controls Row: Sort By Dropdown (Right-aligned under tabs) */}
        {hasItems && shops.length > 0 && comparisonSubTab === 'single' && (
          <div className="flex justify-end items-center gap-2.5 pt-1">
            <span className="text-xs text-slate-500 font-medium">Sort by</span>
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs flex items-center justify-between min-w-[150px] gap-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#173C2C]"
              >
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom Popover Dropdown (Matches mockup) */}
              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value as any);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        sortBy === opt.value
                          ? 'bg-[#EAF7EE] text-[#173C2C] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#173C2C] stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* EMPTY BASKET OR NO COMPARISON STATES                                  */}
        {/* ===================================================================== */}
        {!hasItems ? (
          <div className="p-12 bg-white border border-slate-200/80 rounded-2xl text-center space-y-4 shadow-2xs max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#173C2C] flex items-center justify-center mx-auto border border-[#C3EEDC]">
              <Scale className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Your Basket is Empty
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Add grocery items to your basket to compare real-time prices across all verified local supermarkets in your area.
              </p>
            </div>
            {onGoToSearch && (
              <button
                type="button"
                onClick={onGoToSearch}
                className="py-2.5 px-6 bg-[#173C2C] hover:bg-[#0c2b1f] text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
              </button>
            )}
          </div>
        ) : (!comparison || shops.length === 0) ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-2xs border border-slate-200/80 space-y-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200/60">
              🏪
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                No stores registered in {currentLocation?.name || 'this location'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
          /* =================================================================== */
          /* 3. TWO-COLUMN COMPARISON LAYOUT (Matching Desktop Mockup)          */
          /* =================================================================== */
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* --------------------------------------------------------------- */}
            {/* LEFT COLUMN: Best Deal Summary Sidebar (col-span-3, sticky)     */}
            {/* --------------------------------------------------------------- */}
            <div className="col-span-12 lg:col-span-3 sticky top-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Best Deal Summary
                </h3>

                {/* Recommend the store mint green box */}
                <div className="bg-[#EAF7EE] rounded-xl p-3.5 space-y-0.5">
                  <span className="text-[11px] text-slate-600 font-medium block">
                    Recommend the store
                  </span>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {comparison.bestShopName || bestShop?.shopName || 'Recommended Store'}
                  </div>
                </div>

                {/* Total price & Total savings stats row */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 py-2 border-b border-slate-100">
                  <div className="pr-3">
                    <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Total price</span>
                    <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                      ₹{Math.round(comparison.bestTotal)}
                    </span>
                  </div>
                  <div className="pl-3">
                    <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Total savings</span>
                    <span className="text-2xl font-black text-[#16A34A] font-sans tracking-tight">
                      ₹{Math.round(comparison.maxSavings || 0)}
                    </span>
                  </div>
                </div>

                {/* Basket Items List */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900">
                    Basket Items
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {basketItems.map((item) => {
                      const p = item.product;
                      const itemBreakdown = bestShop?.items?.find((i) => i.productId === item.productId);
                      const name = p?.name || itemBreakdown?.productName || 'Item';
                      const img = p?.image || itemBreakdown?.image;
                      const emoji = p?.emoji || itemBreakdown?.emoji || '📦';
                      const unitPrice = itemBreakdown ? itemBreakdown.unitPrice : 0;
                      const linePrice = itemBreakdown ? itemBreakdown.lineTotal : 0;

                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between gap-2.5 text-xs py-1"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
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
                              <span className="font-semibold text-slate-900 block truncate text-xs" title={name}>
                                {name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-sans block">
                                ₹{Math.round(unitPrice)}
                              </span>
                            </div>
                          </div>

                          <span className="font-bold text-slate-900 font-sans text-xs shrink-0">
                            ₹{Math.round(linePrice)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Store Comparison Cards Grid (col-span-9)          */}
            {/* --------------------------------------------------------------- */}
            <div className="col-span-12 lg:col-span-9">
              {comparisonSubTab === 'single' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedShops.map((shop: ShopComparisonResult) => {
                    return (
                      <div
                        key={shop.shopId || shop.shopName}
                        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          {/* Top: Dual Badges (Verified & Verified) */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 bg-[#EAF7EE] text-[#16A34A] text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#EAF7EE] text-[#16A34A] text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                            </span>
                          </div>

                          {/* Store Name & Distance / Stock */}
                          <div>
                            <h4 className="text-base font-bold text-slate-900 truncate" title={shop.shopName}>
                              {shop.shopName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{shop.distanceKm} km</span>
                              <span className="text-slate-300">•</span>
                              <span className={shop.isAllAvailable ? 'text-[#16A34A] font-semibold' : 'text-rose-600 font-semibold'}>
                                {shop.isAllAvailable ? 'In Stock' : `${shop.outOfStockCount} missing`}
                              </span>
                            </div>
                          </div>

                          {/* Big Gray Price Banner Box */}
                          <div className="bg-[#F3F4F6] rounded-xl px-4 py-3 my-2">
                            <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                              ₹{Math.round(shop.total)}
                            </span>
                          </div>

                          {/* Itemized List of Basket Products */}
                          <div className="space-y-2 pt-1">
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
                                  <span className="text-slate-700 font-normal truncate pr-2" title={name}>
                                    {name}
                                  </span>
                                  <span className={`font-bold font-sans text-xs shrink-0 ${isMissing ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {isMissing ? 'Out of stock' : `₹${Math.round(itemBreakdown.lineTotal)}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Action Buttons: View Store (Solid Green), Call, Chat, Pre-Book (Outlines) */}
                        <div className="grid grid-cols-4 gap-1.5 pt-4 mt-auto border-t border-slate-100">
                          {/* 1. View Store */}
                          <button
                            type="button"
                            onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                            className="bg-[#173C2C] hover:bg-[#0E281D] text-white text-xs font-semibold py-2 px-1 rounded-lg text-center cursor-pointer shadow-2xs transition-all active:scale-95 truncate"
                          >
                            View Store
                          </button>

                          {/* 2. Call */}
                          {shop.phone ? (
                            <a
                              href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate block"
                            >
                              Call
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                            >
                              Call
                            </button>
                          )}

                          {/* 3. Chat */}
                          <button
                            type="button"
                            onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
                          >
                            Chat
                          </button>

                          {/* 4. Pre-Book */}
                          <button
                            type="button"
                            onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-2 px-1 rounded-lg text-center cursor-pointer transition-all active:scale-95 truncate"
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
                <div className="space-y-5">
                  {splitOpt?.isWorthSplitting ? (
                    <div className="space-y-5">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {splitOpt.stores?.map((st, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
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

                              <div className="space-y-2">
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
                              className="w-full py-2.5 bg-[#173C2C] hover:bg-[#0E281D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 shadow-xs transition-all cursor-pointer"
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
