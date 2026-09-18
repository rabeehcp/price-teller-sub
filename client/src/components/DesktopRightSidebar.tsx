import React, { useState } from 'react';
import { BasketItem, Shop, Location, FullComparisonResponse, ShopComparisonResult } from '../types';
import { ProductImage } from './ProductImage';
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
  Send,
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
  const [activeRightTab, setActiveRightTab] = useState<'cart' | 'compare'>('cart');
  const [comparisonSubTab, setComparisonSubTab] = useState<'single' | 'split'>('single');
  const [sortBy, setSortBy] = useState<'value' | 'price' | 'distance'>('value');

  const totalBasketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

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

  return (
    <aside className="w-[280px] xl:w-[310px] 2xl:w-[350px] shrink-0 space-y-3 xl:space-y-4 font-sans select-none sticky top-16 xl:top-20 max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pb-6 animate-in fade-in slide-in-from-right-2 duration-150">
      {/* 0. TOP TAB SWITCHER (Cart vs Live Price Comparison) & CLOSE BUTTON */}
      <div className="bg-white border border-[#E3ECE7] rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 font-malayalam">
        <div className="grid grid-cols-2 gap-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveRightTab('cart')}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRightTab === 'cart'
                ? 'bg-[#063B2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="truncate">കാർട്ട്</span>
            {totalBasketCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                  activeRightTab === 'cart' ? 'bg-[#10A978] text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {totalBasketCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveRightTab('compare')}
            className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRightTab === 'compare'
                ? 'bg-[#063B2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="truncate">താരതമ്യം</span>
            {hasItems && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="സൈഡ്‌ബാർ മറയ്ക്കുക (Hide panel to expand view)"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* VIEW 1: MY CART VIEW */}
      {activeRightTab === 'cart' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Cart Widget */}
          <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 shadow-2xs space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0B8F68]" />
                <h3 className="text-sm font-extrabold text-[#17221D] font-malayalam m-0">
                  തിരഞ്ഞെടുത്ത സാധനങ്ങൾ
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0B8F68] bg-[#E8F5EE] px-2 py-0.5 rounded-full font-malayalam">
                  {totalBasketCount} ഇനം
                </span>
                {basket.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearBasket}
                    className="text-[#8A9992] hover:text-[#E11D48] p-1 rounded-full transition-colors cursor-pointer"
                    title="ക്ലിയർ ചെയ്യുക"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Cart Item Rows (Scrollable for increased items) */}
            {basket.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F5F8F6] text-[#8A9992] flex items-center justify-center mx-auto text-base">
                  🛒
                </div>
                <p className="text-xs text-[#8A9992] font-malayalam">
                  കാർട്ട് ശൂന്യമാണ്. ഉൽപ്പന്നങ്ങൾ ചേർക്കൂ!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[48vh] min-h-[140px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-emerald-200">
                {basket.map((item) => {
                  const prod = item.product;
                  const priceValues = Object.values(prod.prices || {});
                  const basePrice = priceValues.length > 0 ? Math.min(...priceValues) : 30;
                  const unit = item.selectedUnit || prod.defaultUnit || 'kg';
                  const mult = prod.unitMultiplier?.[unit] ?? 1;
                  const unitPrice = Math.round(basePrice * mult);
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2 rounded-2xl bg-[#F8FAF7] border border-[#E8ECE3] text-xs"
                    >
                      {/* Image */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E3ECE7] p-1 shrink-0 flex items-center justify-center overflow-hidden">
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
                      <div className="flex-1 min-w-0 px-2.5">
                        <h4 className="font-extrabold text-[#17221D] font-malayalam truncate m-0 text-xs">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] text-[#8A9992] font-sans">
                          {item.quantity} {unit} • ₹{itemTotal}
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1 shrink-0 bg-white border border-[#E3ECE7] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(prod.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-[#17221D] hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1 text-[11px] font-black font-sans">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(prod.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#17221D] hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subtotal & Actions */}
            {hasItems && (
              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-malayalam font-bold">ആകെ തുക (ഏകദേശം)</span>
                  <span className="text-base font-black text-slate-900 font-sans">₹{subtotal}</span>
                </div>

                {/* Direct Compare Trigger Banner */}
                <button
                  type="button"
                  onClick={() => setActiveRightTab('compare')}
                  className="w-full py-2 px-3 bg-[#E8F5EE] hover:bg-[#D5EADB] text-[#063B2A] border border-[#C3EEDC] rounded-2xl text-xs font-black transition-all flex items-center justify-between cursor-pointer font-malayalam"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0B8F68]" />
                    <span>ഏത് കടയിലാണ് ലാഭം? താരതമ്യം കാണുക</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0B8F68]" />
                </button>

                <button
                  type="button"
                  onClick={onOpenCart}
                  className="w-full py-2.5 px-4 bg-[#063B2A] hover:bg-[#0B8F68] active:scale-98 text-white text-xs font-black rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
                >
                  <span>കാർട്ട് പൂർണ്ണമായി കാണുക</span>
                  <ChevronRight className="w-3.5 h-3.5" />
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
            <div className="p-2 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">സുരക്ഷിതം</span>
            </div>
            <div className="p-2 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">വിശ്വാസം</span>
            </div>
            <div className="p-2 bg-white rounded-2xl border border-[#E3ECE7] flex flex-col items-center gap-1 shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0B8F68]" />
              <span className="font-malayalam">പ്രാദേശികം</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL PRICE COMPARISON ENGINE (Matching Attached User Image) */}
      {activeRightTab === 'compare' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5 animate-in fade-in duration-150 font-sans">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold tracking-wider text-[#0B8F68] uppercase text-[10px] font-malayalam">
              വില താരതമ്യ എൻജിൻ
            </span>
            {hasItems && onOpenWhatsAppExport && (
              <button
                type="button"
                onClick={onOpenWhatsAppExport}
                className="flex items-center gap-1 text-[11px] font-bold text-[#063B2A] bg-[#E8F5EE] hover:bg-[#D5EADB] border border-[#C3EEDC] px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95 font-malayalam"
                title="വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യുക"
              >
                <Share2 className="w-3 h-3" />
                <span>ഷെയർ</span>
              </button>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight font-malayalam m-0">
            ഏത് കടയിലാണ് ഏറ്റവും ലാഭം?
          </h3>

          {/* Sub-Tabs: Single Store vs Split Optimizer */}
          {hasItems && sortedShops.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1 bg-[#F5F8F6] p-1 rounded-xl text-xs font-bold border border-[#E3ECE7]">
                <button
                  type="button"
                  onClick={() => setComparisonSubTab('single')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-malayalam ${
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
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all relative cursor-pointer font-malayalam ${
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

              {/* Sort By Chips */}
              {comparisonSubTab === 'single' && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 overflow-x-auto pb-0.5 no-scrollbar font-malayalam">
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Compass className="w-3 h-3 text-slate-400" /> തരംതിരിക്കുക:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortBy('value')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      sortBy === 'value'
                        ? 'bg-[#063B2A] text-white'
                        : 'bg-[#F5F8F6] hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ⚡ സ്മാർട്ട് വാല്യു
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('price')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      sortBy === 'price'
                        ? 'bg-[#063B2A] text-white'
                        : 'bg-[#F5F8F6] hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    വിലക്കുറവ്
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('distance')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      sortBy === 'distance'
                        ? 'bg-[#063B2A] text-white'
                        : 'bg-[#F5F8F6] hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    സമീപം
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comparison Cards Content */}
          {!hasItems ? (
            <div className="text-center text-slate-400 py-8 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="text-3xl mb-2">⚖️</div>
              <b className="block text-sm text-slate-800 mb-1 font-malayalam">
                താരതമ്യം ചെയ്യാൻ സാധനങ്ങൾ ചേർക്കൂ
              </b>
              <p className="text-xs text-slate-500 font-malayalam">
                ലിസ്റ്റിൽ നിന്ന് സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർത്താൽ ഏറ്റവും കുറഞ്ഞ നിരക്കുള്ള കട കണ്ടെത്താം.
              </p>
            </div>
          ) : isLoadingComparison ? (
            <div className="py-6 space-y-3">
              <div className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
              <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
            </div>
          ) : sortedShops.length === 0 ? (
            <div className="text-center text-slate-500 py-8 px-4 border border-dashed border-gray-200 rounded-2xl bg-[#F5F8F6] space-y-2 font-malayalam">
              <div className="text-3xl mb-1">🏪</div>
              <b className="block text-sm text-slate-800">
                {currentLocation ? `${currentLocation.name}-ൽ` : 'ഈ പ്രദേശത്ത്'} കടകൾ ലഭ്യമല്ല
              </b>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                വില താരതമ്യം ചെയ്യാൻ നിലവിൽ കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടുള്ള പ്രദേശം തിരഞ്ഞെടുക്കൂ.
              </p>
            </div>
          ) : comparisonSubTab === 'single' ? (
            /* Single Store Cards matching User Screenshot */
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {sortedShops.map((shop: ShopComparisonResult) => {
                const isBest = shop.shopName === bestShop?.shopName;
                return (
                  <div
                    key={shop.shopId || shop.shopName}
                    className={`rounded-2xl p-3.5 transition-all ${
                      isBest
                        ? 'border-2 border-[#0B8F68] bg-[#F4FAF6] shadow-2xs'
                        : 'border border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Store Name & Best Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <b className="text-sm font-black text-slate-900 truncate font-sans">
                          {shop.shopName}
                        </b>
                        {shop.phone && (
                          <a
                            href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                            className="p-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0B8F68] border border-emerald-200/80 transition-all shrink-0 active:scale-95"
                            title={`${shop.shopName} കടയിലേക്ക് വിളിക്കുക (${shop.phone})`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {isBest && (
                        <span className="text-[9px] font-black tracking-wide bg-[#0B8F68] text-white px-2 py-0.5 rounded-full uppercase shadow-2xs shrink-0 font-malayalam">
                          ഏറ്റവും മികച്ച വില
                        </span>
                      )}
                    </div>

                    {/* Total Price */}
                    <div className="text-2xl font-black text-slate-900 my-1 tracking-tight font-sans">
                      ₹{shop.total}
                    </div>

                    {/* Distance & Stock Meta */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-sans">
                        <MapPin className="w-3 h-3 text-[#0B8F68] shrink-0" />
                        <span>{shop.distanceKm} km ദൂരം</span>
                      </span>
                      <span>·</span>
                      {shop.isAllAvailable ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] font-malayalam">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>എല്ലാം ലഭ്യമാണ്</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px] font-malayalam">
                          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{shop.outOfStockCount} എണ്ണം സ്റ്റോക്കില്ല</span>
                        </span>
                      )}
                    </div>

                    {/* Missing Products Alert Box (matching User Screenshot) */}
                    {!shop.isAllAvailable && shop.missingProducts && shop.missingProducts.length > 0 && (
                      <div className="mb-2 p-2 bg-rose-50/80 border border-rose-200 rounded-xl text-[10px] text-rose-950 font-malayalam">
                        <span className="font-bold block mb-1">ഇവിടെ ലഭ്യമല്ലാത്തവ:</span>
                        <div className="flex flex-wrap gap-1">
                          {shop.missingProducts.map((p) => (
                            <span
                              key={p.productId}
                              className="inline-flex items-center gap-1 bg-white border border-rose-200 px-1.5 py-0.5 rounded-md font-bold text-rose-700"
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
                        <span className="text-[#0B8F68] flex items-center gap-1">
                          ✨ ബാസ്ക്കറ്റിലെ ഏറ്റവും കുറഞ്ഞ ആകെ തുക
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {bestShop?.shopName}-നേക്കാൾ ₹{shop.differenceVsBest} കൂടുതൽ
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: കട, വിളിക്കുക, ചാറ്റ്, പ്രീ-ബുക്ക് */}
                    <div className={`grid ${shop.phone ? 'grid-cols-4' : 'grid-cols-3'} gap-1 font-malayalam`}>
                      <button
                        type="button"
                        onClick={() => onOpenShopDetails && onOpenShopDetails(shop.shopName)}
                        className="py-1.5 px-1 rounded-xl font-bold text-[10.5px] bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      >
                        <span>കട</span>
                      </button>

                      {shop.phone && (
                        <a
                          href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                          className="py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200/80 rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95"
                          title={`${shop.shopName} ഫോൺ വിളിക്കുക (${shop.phone})`}
                        >
                          <Phone className="w-3 h-3 text-[#0B8F68]" />
                          <span>വിളിക്കുക</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenChat && onOpenChat(shop.shopName)}
                        className="py-1.5 px-1 bg-[#E8F5EE] hover:bg-[#D5EADB] text-[#063B2A] border border-[#C3EEDC] rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95"
                        title={`${shop.shopName} കടയുമായി ചാറ്റ് ചെയ്യുക`}
                      >
                        <MessageCircle className="w-3 h-3 text-[#0B8F68]" />
                        <span>ചാറ്റ്</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onPreBookBasket && onPreBookBasket(shop.shopName)}
                        className={`py-1.5 px-1 rounded-xl font-black text-[10.5px] flex items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 ${
                          isBest
                            ? 'bg-[#0B8F68] hover:bg-[#063B2A] text-white shadow-2xs'
                            : 'bg-[#063B2A] hover:bg-[#0B8F68] text-white'
                        }`}
                      >
                        <CalendarCheck className="w-3 h-3" />
                        <span>ബുക്കിംഗ്</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Split Optimization View */
            <div className="space-y-3">
              {splitOpt && splitOpt.isWorthSplitting ? (
                <div className="bg-gradient-to-br from-[#E8F8F0] to-[#D5EADB] border border-[#A7DFBE] rounded-2xl p-4 shadow-2xs space-y-3 font-malayalam">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#063B2A] bg-white/80 px-2 py-0.5 rounded-full">
                      സ്പ്ലിറ്റ് വഴി കൂടുതൽ ലാഭം
                    </span>
                    <span className="text-base font-black text-emerald-800 font-sans">
                      ₹{splitOpt.additionalSavings} ലാഭം
                    </span>
                  </div>

                  <div className="text-2xl font-black text-[#063B2A] font-sans">
                    ₹{splitOpt.combinedTotal}
                  </div>

                  <div className="space-y-2 pt-1">
                    {splitOpt.stores.map((plan, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-[#C3EEDC] text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span>🏪 {plan.shopName}</span>
                          <span className="font-sans text-emerald-700">₹{plan.subtotal}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {plan.items.map((it) => it.productName).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPreBookBasket && onPreBookBasket()}
                    className="w-full py-2 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    രണ്ട് കടകളിൽ നിന്നും പ്രീ-ബുക്ക് ചെയ്യുക →
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xs text-slate-500 font-malayalam">
                  <p className="font-bold text-slate-700 mb-1">ഒറ്റ കടയിൽ വാങ്ങുന്നതാണ് കൂടുതൽ ലാഭകരം</p>
                  <p className="text-[11px]">കടകൾക്കിടയിലെ യാത്രാച്ചെലവും സമയവും കണക്കാക്കുമ്പോൾ ഒറ്റക്കട തിരഞ്ഞെടുക്കലാണ് ഉചിതം.</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Advanced Compare Shortcuts */}
          {hasItems && sortedShops.length > 0 && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 font-malayalam">
              {onOpenStoreDuel && (
                <button
                  type="button"
                  onClick={onOpenStoreDuel}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 text-indigo-600" />
                  <span>സ്റ്റോർ ഡ്യുവൽ</span>
                </button>
              )}
              {onOpenItemizedMatrix && (
                <button
                  type="button"
                  onClick={onOpenItemizedMatrix}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
