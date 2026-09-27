import React, { useState } from 'react';
import { BasketItem, Shop, Location, FullComparisonResponse, ShopComparisonResult } from '../types';
import { formatCartItemQuantity } from '../utils/unitFormatter';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Zap,
  Share2,
  Compass,
  Award,
  AlertCircle,
  MessageCircle,
  CalendarCheck,
  Swords,
  Layers,
  ArrowRight,
  Phone,
  X,
} from 'lucide-react';

interface DesktopRightSidebarProps {
  basket: BasketItem[];
  shops: Shop[];
  currentLocation: Location | null;
  comparison?: FullComparisonResponse | null;
  isLoadingComparison?: boolean;
  onQuantityChange: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
  onOpenCart: () => void;
  onOpenShops: () => void;
  onOpenDeals: () => void;
  onOpenShopDetails?: (shopName: string) => void;
  onOpenWhatsAppExport?: () => void;
  onOpenItemizedMatrix?: () => void;
  onOpenStoreDuel?: () => void;
  onOpenChat?: (shopName: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
  onClose?: () => void;
}

export const DesktopRightSidebar: React.FC<DesktopRightSidebarProps> = ({
  basket,
  shops,
  currentLocation,
  comparison,
  isLoadingComparison = false,
  onQuantityChange,
  onRemoveItem,
  onClearBasket,
  onOpenCart,
  onOpenShops,
  onOpenDeals,
  onOpenShopDetails,
  onOpenWhatsAppExport,
  onOpenItemizedMatrix,
  onOpenStoreDuel,
  onOpenChat,
  onPreBookBasket,
  onClose,
}) => {
  const [activeRightTab, setActiveRightTab] = useState<'cart' | 'compare'>('compare');
  const [comparisonSubTab, setComparisonSubTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'value' | 'price' | 'distance'>('value');

  const totalBasketCount = basket.reduce((acc, it) => acc + it.quantity, 0);

  const subtotal = Math.round(basket.reduce((sum, item) => {
    const prod = item.product;
    const priceValues = Object.values(prod.prices || {});
    const basePrice = priceValues.length > 0 ? Math.min(...priceValues) : 30;
    const unit = item.selectedUnit || prod.defaultUnit || 'kg';
    const mult = prod.unitMultiplier?.[unit] ?? 1;
    return sum + Math.round(basePrice * mult) * item.quantity;
  }, 0));

  const hasItems = basket.length > 0;
  const bestShop = comparison?.shops[0];
  const splitOpt = comparison?.splitOptimization;

  // Sorted shops for comparison
  let sortedShops = comparison?.shops ? [...comparison.shops] : [];
  if (sortBy === 'distance') {
    sortedShops.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'price') {
    sortedShops.sort((a, b) => a.total - b.total);
  } else {
    sortedShops.sort((a, b) => a.total + a.distanceKm * 6 - (b.total + b.distanceKm * 6));
  }

  const formatDistanceMalayalam = (km: number) => {
    if (!km || km <= 0) return 'സമീപം';
    if (km > 100) return `${Math.round(km)} km ദൂരം`;
    return `${km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'} ദൂരം`;
  };

  return (
    <aside className="w-[360px] xl:w-[395px] 2xl:w-[430px] shrink-0 space-y-3.5 xl:space-y-4 font-sans select-none sticky top-16 xl:top-20 max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pb-8 animate-in fade-in slide-in-from-right-2 duration-150">
      {/* 0. TOP TAB SWITCHER (കാർട്ട് vs കടകളുടെ താരതമ്യം) & CLOSE BUTTON */}
      <div className="bg-white border border-[#E3ECE7] rounded-2xl px-3 py-1 flex items-center justify-between font-malayalam shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveRightTab('cart')}
            className={`py-2.5 px-2.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 rounded-xl ${
              activeRightTab === 'cart'
                ? 'text-[#0D6344] bg-[#E8F5EE] font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>കാർട്ട് ഇനങ്ങൾ</span>
            {totalBasketCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#0D6344] text-white">
                {totalBasketCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveRightTab('compare')}
            className={`py-2.5 px-2.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 rounded-xl ${
              activeRightTab === 'compare'
                ? 'text-[#0D6344] bg-[#E8F5EE] font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>കടകളുടെ താരതമ്യം</span>
            {hasItems && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="പാനൽ അടയ്ക്കുക"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* VIEW 1: MY CART VIEW */}
      {activeRightTab === 'cart' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Cart Widget */}
          <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F5EE] text-[#0D6344] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#17221D] font-malayalam m-0">
                  നിങ്ങളുടെ ബാസ്ക്കറ്റ് ({totalBasketCount})
                </h3>
              </div>

              {basket.length > 0 && (
                <button
                  type="button"
                  onClick={onClearBasket}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer font-malayalam flex items-center gap-1"
                  title="എല്ലാം ഒഴിവാക്കുക"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>എല്ലാം ഒഴിവാക്കുക</span>
                </button>
              )}
            </div>

            {/* Cart Item Rows */}
            {basket.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[#F5F8F6] text-[#8A9992] flex items-center justify-center mx-auto text-2xl">
                  🛒
                </div>
                <p className="text-sm font-bold text-slate-700 font-malayalam">
                  നിങ്ങളുടെ ബാസ്ക്കറ്റ് ശൂന്യമാണ്
                </p>
                <p className="text-xs text-slate-500 font-malayalam">
                  വില താരതമ്യം ചെയ്യാനും ഓർഡർ ചെയ്യാനും ഉൽപ്പന്നങ്ങൾ ചേർക്കൂ!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[46vh] min-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-200">
                {basket.map((item) => {
                  const prod = item.product;
                  const priceValues = Object.values(prod.prices || {});
                  const basePrice = priceValues.length > 0 ? Math.min(...priceValues) : 30;
                  const unit = item.selectedUnit || prod.defaultUnit || 'kg';
                  const mult = prod.unitMultiplier?.[unit] ?? 1;
                  const unitPrice = Math.round(basePrice * mult);
                  const itemTotal = unitPrice * item.quantity;
                  const mlName = getMalayalamName(prod.name);

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FBFA] border border-[#E8EFEA] hover:border-[#C3EEDC] transition-all group gap-2.5"
                    >
                      {/* Image */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#E3ECE7] p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                        <ProductImage
                          productId={prod.id}
                          image={prod.image}
                          emoji={prod.emoji}
                          alt={prod.name}
                          className="w-full h-full"
                          imgClassName="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Title & Price */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#17221D] font-malayalam truncate m-0 text-xs sm:text-[13px] leading-snug" title={prod.name}>
                          {mlName !== prod.name ? `${mlName} (${prod.name})` : prod.name}
                        </h4>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs sm:text-sm font-black text-[#0D6344] font-sans">
                            ₹{itemTotal}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            ({formatCartItemQuantity(item.quantity, unit)})
                          </span>
                        </div>
                      </div>

                      {/* Stepper & Remove */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center bg-white border border-[#E3ECE7] rounded-xl p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(prod.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-[#F0F5F2] rounded-lg cursor-pointer transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-black font-sans">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuantityChange(prod.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-[#F0F5F2] rounded-lg cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(prod.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="ഇനം നീക്കം ചെയ്യുക"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subtotal, Estimated Tax & Checkout Button */}
            {hasItems && (
              <div className="pt-3 border-t border-gray-100 space-y-3 font-malayalam">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>സാധനങ്ങളുടെ തുക</span>
                    <span className="font-bold text-slate-800 font-sans text-sm">₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>ഡെലിവറി / മറ്റ് നിരക്കുകൾ</span>
                    <span className="font-bold text-emerald-700 text-xs">സൗജന്യം</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>ആകെ നൽകേണ്ടത്</span>
                    <span className="text-[#0D6344] font-black text-lg font-sans">₹{subtotal}</span>
                  </div>
                </div>

                {/* Direct Compare Trigger Banner */}
                <button
                  type="button"
                  onClick={() => setActiveRightTab('compare')}
                  className="w-full py-2.5 px-3 bg-[#E8F5EE] hover:bg-[#D5EADB] text-[#0D6344] border border-[#C3EEDC] rounded-2xl text-xs font-black transition-all flex items-center justify-between cursor-pointer font-malayalam shadow-2xs"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0D6344]" />
                    <span>ഏത് കടയിലാണ് ലാഭം? താരതമ്യം കാണുക</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D6344]" />
                </button>

                <button
                  type="button"
                  onClick={onOpenCart}
                  className="w-full py-3 px-4 bg-[#0D6344] hover:bg-[#094E35] active:scale-98 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
                >
                  <span>ഓർഡർ പൂർത്തിയാക്കുക</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Nearby Shops Mini-Banner */}
          <div
            onClick={onOpenShops}
            className="bg-gradient-to-br from-[#F5F8F6] to-[#E8F5EE] border border-[#D5EADB] rounded-3xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#063B2A] font-malayalam">
                  <Store className="w-4 h-4 text-[#0B8F68]" />
                  <span>നിങ്ങളുടെ അടുത്തുള്ള കടകൾ</span>
                </div>
                <p className="text-[11px] text-[#66756E] font-medium font-malayalam leading-tight">
                  നിങ്ങളുടെ പ്രദേശത്തെ വിശ്വസനീയമായ കടകൾ
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white border border-[#C3EEDC] flex items-center justify-center text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                🏪
              </div>
            </div>

            <div className="pt-1 flex items-center text-[11px] font-black text-[#0B8F68] font-malayalam gap-1">
              <span>എല്ലാം കാണുക</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Super Deals Alert Card */}
          <div className="bg-gradient-to-br from-[#063B2A] to-[#04281C] text-white rounded-3xl p-4 shadow-sm space-y-3 relative overflow-hidden border border-emerald-800">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#10A978]/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#10A978]/20 border border-[#10A978]/40 flex items-center justify-center text-[#34D399]">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white font-malayalam leading-tight m-0">
                സൂപ്പർ ഡീലുകൾ നിങ്ങളുടെ കയ്യിൽ
              </h4>
            </div>

            <p className="text-[11px] text-[#DDF5EA]/90 font-medium font-malayalam leading-relaxed m-0">
              പ്രത്യേക ഓഫറുകൾക്കും പുതിയ അപ്ഡേറ്റുകൾക്കും ഇപ്പോൾ തന്നെ ചേരുക.
            </p>

            <button
              type="button"
              onClick={onOpenDeals}
              className="w-full py-2 px-3 bg-white text-[#063B2A] hover:bg-[#DDF5EA] active:scale-95 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 font-malayalam cursor-pointer"
            >
              <span>അലേർട്ട് നേടുക</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-[#66756E] pt-1">
            <div className="p-2.5 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">സുരക്ഷിതം</span>
            </div>
            <div className="p-2.5 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">വിശ്വാസം</span>
            </div>
            <div className="p-2.5 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">പ്രാദേശികം</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL PRICE COMPARISON ENGINE (Spacious, Clean & 100% Malayalam) */}
      {activeRightTab === 'compare' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-150 font-malayalam">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F5EE] border border-[#C3EEDC] rounded-full text-[11px] font-bold text-[#0D6344]">
              <Sparkles className="w-3 h-3 text-[#0D6344]" />
              <span>വില താരതമ്യ എൻജിൻ</span>
            </div>
            {hasItems && onOpenWhatsAppExport && (
              <button
                type="button"
                onClick={onOpenWhatsAppExport}
                className="flex items-center gap-1.5 text-xs font-bold text-[#063B2A] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl transition-colors cursor-pointer active:scale-95"
                title="വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യുക"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ഷെയർ</span>
              </button>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight m-0">
              ഏത് കടയിലാണ് ഏറ്റവും ലാഭം?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              തിരഞ്ഞെടുത്ത ഇനങ്ങളുടെ തത്സമയ കട നിരക്കുകൾ താരതമ്യം ചെയ്യുന്നു
            </p>
          </div>

          {/* Sub-Tabs: Single Store vs Split Optimizer */}
          {hasItems && sortedShops.length > 0 && (
            <div className="space-y-3 pt-1">
              {/* Segmented Mode Control */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#F2F6F4] p-1.5 rounded-2xl text-xs font-bold border border-[#E0ECE5]">
                <button
                  type="button"
                  onClick={() => setComparisonSubTab('single')}
                  className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    comparisonSubTab === 'single'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#0B8F68] shrink-0" />
                  <span>ഒറ്റക്കട താരതമ്യം</span>
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonSubTab('split')}
                  className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all relative cursor-pointer ${
                    comparisonSubTab === 'split'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>സ്പ്ലിറ്റ് ഒപ്റ്റിമൈസർ</span>
                  {splitOpt?.isWorthSplitting && (
                    <span className="w-2 h-2 rounded-full bg-[#10A978] absolute top-1.5 right-1.5" />
                  )}
                </button>
              </div>

              {/* Sort By Filter Chips */}
              {comparisonSubTab === 'single' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 overflow-x-auto pb-1 no-scrollbar">
                  <span className="flex items-center gap-1 shrink-0 text-slate-400 font-bold text-[11px]">
                    <Compass className="w-3.5 h-3.5" /> തരംതിരിക്കുക:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortBy('value')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
                      sortBy === 'value'
                        ? 'bg-[#063B2A] text-white border-[#063B2A] shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚡ സ്മാർട്ട് വാല്യൂ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('price')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
                      sortBy === 'price'
                        ? 'bg-[#063B2A] text-white border-[#063B2A] shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ₹ കുറഞ്ഞ നിരക്ക്
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('distance')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
                      sortBy === 'distance'
                        ? 'bg-[#063B2A] text-white border-[#063B2A] shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    📍 സമീപമുള്ളവ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comparison Cards Content */}
          {!hasItems ? (
            <div className="text-center text-slate-400 py-10 px-4 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 space-y-2">
              <div className="text-3xl">⚖️</div>
              <b className="block text-sm text-slate-800">
                താരതമ്യം ചെയ്യാൻ സാധനങ്ങൾ ചേർക്കൂ
              </b>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                ഉൽപ്പന്നങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർത്താൽ നിങ്ങളുടെ പ്രദേശത്തെ ഏറ്റവും കുറഞ്ഞ നിരക്കുള്ള കട കണ്ടെത്താം.
              </p>
            </div>
          ) : isLoadingComparison ? (
            <div className="py-6 space-y-3">
              <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
              <div className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
            </div>
          ) : sortedShops.length === 0 ? (
            <div className="text-center text-slate-500 py-8 px-4 border border-dashed border-gray-200 rounded-3xl bg-[#F5F8F6] space-y-2">
              <div className="text-3xl mb-1">🏪</div>
              <b className="block text-sm text-slate-800">
                {currentLocation ? `${currentLocation.name}-ൽ` : 'ഈ പ്രദേശത്ത്'} കടകൾ ലഭ്യമല്ല
              </b>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                വില താരതമ്യം ചെയ്യാൻ നിലവിൽ കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടുള്ള പ്രദേശം തിരഞ്ഞെടുക്കൂ.
              </p>
            </div>
          ) : comparisonSubTab === 'single' ? (
            /* Single Store Cards (Spacious, Clean & Professional) */
            <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
              {sortedShops.map((shop: ShopComparisonResult) => {
                const isBest = shop.shopName === bestShop?.shopName;
                return (
                  <div
                    key={shop.shopId || shop.shopName}
                    className={`rounded-2xl sm:rounded-3xl p-4 transition-all ${
                      isBest
                        ? 'border-2 border-[#0B8F68] bg-[#F4FAF6] shadow-xs'
                        : 'border border-[#E3ECE7] bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Store Header & Best Deal Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#E3ECE7] flex items-center justify-center shrink-0 shadow-2xs">
                          <Store className="w-4 h-4 text-[#0D6344]" />
                        </div>
                        <b className="text-sm sm:text-base font-black text-slate-900 truncate">
                          {shop.shopName}
                        </b>
                      </div>

                      {isBest && (
                        <span className="text-[10px] font-black tracking-wide bg-[#0B8F68] text-white px-2.5 py-1 rounded-full uppercase shadow-2xs shrink-0">
                          ഏറ്റവും മികച്ച വില
                        </span>
                      )}
                    </div>

                    {/* Total Price Display */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
                        ₹{shop.total}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ആകെ തുക
                      </span>
                    </div>

                    {/* Distance & Stock Meta Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
                        <span>{formatDistanceMalayalam(shop.distanceKm)}</span>
                      </span>

                      {shop.isAllAvailable ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>എല്ലാം ലഭ്യമാണ്</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{shop.outOfStockCount} ഇനങ്ങൾ ലഭ്യമല്ല</span>
                        </span>
                      )}
                    </div>

                    {/* Missing Products Alert Box */}
                    {!shop.isAllAvailable && shop.missingProducts && shop.missingProducts.length > 0 && (
                      <div className="mb-3 p-2.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-950">
                        <span className="font-bold block mb-1">ഇവിടെ ലഭ്യമല്ലാത്തവ:</span>
                        <div className="flex flex-wrap gap-1">
                          {shop.missingProducts.map((p) => (
                            <span
                              key={p.productId}
                              className="inline-flex items-center gap-1 bg-white border border-rose-200 px-2 py-0.5 rounded-md font-bold text-rose-700 text-[11px]"
                            >
                              <span>{getMalayalamName(p.productName)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Savings or Price Difference */}
                    <div className="text-xs font-bold mb-3">
                      {isBest ? (
                        <span className="text-[#0B8F68] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>ബാസ്ക്കറ്റിലെ ഏറ്റവും കുറഞ്ഞ നിരക്ക്</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {bestShop?.shopName}-നേക്കാൾ <span className="text-rose-600 font-bold font-sans">₹{shop.differenceVsBest}</span> കൂടുതൽ
                        </span>
                      )}
                    </div>

                    {/* PRIMARY ACTION BUTTON (Spacious & Clean) */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
                          isBest
                            ? 'bg-[#0B8F68] hover:bg-[#063B2A] text-white'
                            : 'bg-[#063B2A] hover:bg-[#0B8F68] text-white'
                        }`}
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>ഈ കടയിൽ നിന്നും ബുക്കിംഗ് ചെയ്യുക</span>
                      </button>

                      {/* Secondary Actions: കട വിവരങ്ങൾ, വിളിക്കുക, ചാറ്റ് */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                          className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Store className="w-3.5 h-3.5 text-slate-500" />
                          <span>വിവരങ്ങൾ</span>
                        </button>

                        {shop.phone ? (
                          <a
                            href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                            className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-[#064E3B] border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title={`${shop.shopName} ഫോൺ വിളിക്കുക (${shop.phone})`}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#0B8F68]" />
                            <span>വിളിക്കുക</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="py-1.5 px-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 opacity-60 cursor-not-allowed"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>വിളിക്കുക</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                          className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-[#063B2A] border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title={`${shop.shopName} കടയുമായി ചാറ്റ് ചെയ്യുക`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#0B8F68]" />
                          <span>ചാറ്റ്</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Split Optimization View */
            <div className="space-y-3">
              {splitOpt && splitOpt.isWorthSplitting ? (
                <div className="bg-gradient-to-br from-[#E8F8F0] to-[#D5EADB] border border-[#A7DFBE] rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#063B2A] bg-white/80 px-2.5 py-0.5 rounded-full">
                      സ്പ്ലിറ്റ് വഴി കൂടുതൽ ലാഭം
                    </span>
                    <span className="text-base font-black text-emerald-800 font-sans">
                      ₹{splitOpt.additionalSavings} ലാഭം
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black text-[#063B2A] font-sans">
                    ₹{splitOpt.combinedTotal}
                  </div>

                  <div className="space-y-2 pt-1">
                    {splitOpt.stores.map((plan, i) => (
                      <div key={i} className="p-3 bg-white rounded-2xl border border-[#C3EEDC] text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#0D6344]" />
                            <span>{plan.shopName}</span>
                          </span>
                          <span className="font-sans font-black text-emerald-700">₹{plan.subtotal}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {plan.items.map((it) => getMalayalamName(it.productName)).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPreBookBasket && onPreBookBasket()}
                    className="w-full py-3 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs sm:text-sm font-black rounded-2xl shadow-xs transition-colors cursor-pointer"
                  >
                    രണ്ട് കടകളിൽ നിന്നും പ്രീ-ബുക്ക് ചെയ്യുക →
                  </button>
                </div>
              ) : (
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-3xl text-center text-xs text-slate-500 space-y-1.5">
                  <p className="font-bold text-slate-700 text-sm">ഒറ്റ കടയിൽ വാങ്ങുന്നതാണ് കൂടുതൽ ലാഭകരം</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    കടകൾക്കിടയിലെ യാത്രാച്ചെലവും സമയവും കണക്കാക്കുമ്പോൾ ഒറ്റക്കട തിരഞ്ഞെടുക്കലാണ് ഉചിതം.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Advanced Compare Shortcuts */}
          {hasItems && sortedShops.length > 0 && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              {onOpenStoreDuel && (
                <button
                  type="button"
                  onClick={onOpenStoreDuel}
                  className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Swords className="w-3.5 h-3.5 text-indigo-600" />
                  <span>സ്റ്റോർ ഡ്യുവൽ</span>
                </button>
              )}
              {onOpenItemizedMatrix && (
                <button
                  type="button"
                  onClick={onOpenItemizedMatrix}
                  className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>വില മാട്രിക്സ്</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
