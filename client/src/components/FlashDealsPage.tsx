import React, { useState, useEffect, useMemo } from 'react';
import { FlashDeal, Product } from '../types';
import {
  ChevronLeft,
  Clock,
  Store,
  Zap,
  Search,
} from 'lucide-react';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';

interface FlashDealsPageProps {
  deals: FlashDeal[];
  products?: Product[];
  onAddDealToBasket: (productId: string) => void;
  onBack: () => void;
  onOpenShopCatalogue?: (shopName: string) => void;
}

export const FlashDealsPage: React.FC<FlashDealsPageProps> = ({
  deals,
  products = [],
  onAddDealToBasket,
  onBack,
  onOpenShopCatalogue,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live countdown timer (simulating daily scheduled deal expiry)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = (dealId: string, productId: string) => {
    onAddDealToBasket(productId);
    setAddedIds((prev) => ({ ...prev, [dealId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [dealId]: false }));
    }, 1500);
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'home', label: 'Home & Groceries' },
    { id: 'nuts', label: 'Food Nuts' },
    { id: 'veg', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'snacks', label: 'Snacks' },
  ];

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const prod = products.find((p) => p.id === deal.productId);
          const cat = (prod?.categoryId || '').toLowerCase();
          const name = deal.productName.toLowerCase();

          if (selectedCategory === 'home' && !cat.includes('staple') && !cat.includes('grain') && !cat.includes('rice') && !cat.includes('oil')) {
            if (!name.includes('atta') && !name.includes('rice') && !name.includes('oil') && !name.includes('dal')) return false;
          }
          if (selectedCategory === 'nuts' && !cat.includes('nut') && !name.includes('peanut') && !name.includes('nut') && !name.includes('cashew') && !name.includes('parippu') && !name.includes('dal')) {
            return false;
          }
          if (selectedCategory === 'veg' && !cat.includes('veg') && !cat.includes('fruit')) return false;
          if (selectedCategory === 'dairy' && !cat.includes('dairy') && !name.includes('milk')) return false;
          if (selectedCategory === 'snacks' && !cat.includes('snack') && !cat.includes('bakery') && !name.includes('biscuit') && !name.includes('bar')) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const ml = getMalayalamName(deal.productName).toLowerCase();
          const matchName = deal.productName.toLowerCase().includes(query);
          const matchMl = ml.includes(query);
          const matchShop = deal.shopName.toLowerCase().includes(query);
          if (!matchName && !matchMl && !matchShop) return false;
        }

        return true;
      });
  }, [deals, products, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-md lg:max-w-none space-y-4 lg:space-y-6 animate-in fade-in duration-200 font-sans pb-28 lg:pb-12 px-3.5 sm:px-4 lg:px-1 text-slate-800">
      
      {/* ============================================================== */}
      {/* MOBILE-ONLY HEADER & CONTROLS (< lg)                           */}
      {/* ============================================================== */}
      <div className="lg:hidden space-y-3.5">
        {/* 1. TOP HEADER (Exact match: < Back arrow + ⚡ Flash Deals) */}
        <div className="flex items-center gap-2 pt-1 pb-0.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-800 hover:text-black rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          </button>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF7A00] fill-[#FF7A00]" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans m-0">
              Flash Deals
            </h1>
          </div>
        </div>

        {/* 2. COUNTDOWN TIMER PILL (Exact match: 🕒 02:45:15  മിനിറ്റുകൾ ബാക്കി) */}
        <div className="bg-[#FFF6EE] border border-amber-100/80 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold font-sans text-sm tracking-tight">
            <Clock className="w-4.5 h-4.5 text-slate-800 stroke-[2.2]" />
            <span>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-slate-600 font-medium font-malayalam">
            മിനിറ്റുകൾ ബാക്കി
          </span>
        </div>

        {/* 3. SEARCH BAR (Exact match: 🔍 Search products...) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all font-sans shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4. CATEGORY CHIPS ROW (Exact match: All | Home & Groceries | Food Nuts...) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 font-sans ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP-ONLY HERO BANNER & TOOLBAR (lg+)                       */}
      {/* ============================================================== */}
      <div className="hidden lg:block space-y-4">
        {/* DESKTOP HERO / HEADER BANNER */}
        <div className="bg-gradient-to-r from-[#17221D] via-[#0F1E17] to-[#1E293B] text-white rounded-3xl p-6 lg:p-7 shadow-sm border border-emerald-900/40 relative overflow-hidden">
          {/* Subtle background glow accents */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer shadow-2xs font-malayalam"
                  title="ഹോമിലേക്ക് മടങ്ങുക (Back to Home)"
                  aria-label="Back to Home"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ഹോം</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>LIVE FLASH DEALS</span>
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  {filteredDeals.length} സജീവ ഓഫറുകൾ
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white m-0 flex items-center gap-2.5">
                <Zap className="w-7 h-7 text-[#FF7A00] fill-[#FF7A00]" />
                <span>ഫ്ലാഷ് ഡീലുകൾ (Flash Deals)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium font-malayalam m-0">
                നിങ്ങളുടെ അടുത്തുള്ള കടകളിലെ ഇന്നത്തെ ഏറ്റവും ഉയർന്ന ഓഫറുകൾ — പരിമിത സ്റ്റോക്ക് തീരുന്നതുവരെ മാത്രം!
              </p>
            </div>

            {/* Countdown Timer Widget on Desktop */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center shadow-lg min-w-[220px]">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold mb-1.5 font-malayalam">
                <Clock className="w-3.5 h-3.5" />
                <span>ഡീൽ അവസാനിക്കാൻ ബാക്കി</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-black text-2xl text-white font-mono tracking-wider">
                <div className="bg-black/35 px-2.5 py-1 rounded-xl border border-white/10 shadow-inner">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-amber-400 font-sans font-bold">:</span>
                <div className="bg-black/35 px-2.5 py-1 rounded-xl border border-white/10 shadow-inner">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-amber-400 font-sans font-bold">:</span>
                <div className="bg-black/35 px-2.5 py-1 rounded-xl border border-white/10 shadow-inner">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 mt-1.5 px-2 font-medium">
                <span>മണിക്കൂർ</span>
                <span>മിനിറ്റ്</span>
                <span>സെക്കൻഡ്</span>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP CONTROLS BAR (Category Pills + Search) */}
        <div className="flex items-center justify-between gap-4 bg-white border border-[#E3ECE7] rounded-2xl p-3.5 shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer font-sans whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'bg-[#F5F8F6] text-slate-700 hover:bg-[#DDF5EA]/60 border border-[#E3ECE7] font-semibold'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Search Bar */}
          <div className="relative w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ഉൽപ്പന്നം അല്ലെങ്കിൽ കട തിരയുക..."
              className="w-full pl-10 pr-9 py-2 bg-[#F5F8F6] border border-[#E3ECE7] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0B8F68] outline-none transition-all font-malayalam"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RESPONSIVE PRODUCT CARDS GRID (2 cols on mobile, 4-6 on desktop)*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4.5 pt-1">
        {filteredDeals.map((deal) => {
          const isAdded = addedIds[deal.id];
          const matchedProduct = products?.find(
            (p) => p.id === deal.productId || p.name.toLowerCase() === deal.productName.toLowerCase()
          );
          const resolvedImage = deal.image || matchedProduct?.image;
          const safeEmoji = (deal.emoji && deal.emoji !== '🫘') ? deal.emoji : (matchedProduct?.emoji || '🌾');
          const savings = deal.originalPrice - deal.dealPrice;
          const discountPct = deal.discountPercentage || Math.round((savings / deal.originalPrice) * 100);

          return (
            <div
              key={deal.id}
              className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                {/* Orange 30% OFF Ribbon Badge on Top-Left */}
                <div className="absolute top-0 left-0 bg-[#FF6B00] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-br-lg tracking-wide shadow-2xs z-10 font-sans">
                  {discountPct}% OFF
                </div>

                {/* Centered Image */}
                <div className="w-full aspect-square flex items-center justify-center p-2 mb-2 bg-slate-50/60 rounded-xl overflow-hidden pt-4">
                  <ProductImage
                    productId={deal.productId}
                    image={resolvedImage}
                    emoji={safeEmoji}
                    alt={deal.productName}
                    className="w-full h-full flex items-center justify-center"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-200"
                    fallbackEmojiClassName="text-4xl sm:text-5xl"
                  />
                </div>

                {/* Product Name & Pack Size */}
                <div className="space-y-0.5">
                  <h3
                    className="text-xs sm:text-[13px] font-bold text-slate-900 truncate m-0 font-sans group-hover:text-[#FF6B00] transition-colors"
                    title={deal.productName}
                  >
                    {deal.productName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans m-0">
                    {deal.unit || '300g'}
                  </p>
                </div>

                {/* Price Row (Deal Price + Struck-through Original Price) */}
                <div className="flex items-baseline gap-1.5 pt-1.5">
                  <span className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                    ₹{deal.dealPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-sans line-through">
                    ₹{deal.originalPrice}
                  </span>
                </div>

                {/* Green Savings Pill: ₹15 ലാഭം */}
                <div className="pt-0.5">
                  <span className="inline-block bg-[#EAF7EE] text-[#0D6344] text-[10.5px] font-bold px-2 py-0.5 rounded-full font-malayalam">
                    ₹{savings} ലാഭം
                  </span>
                </div>

                {/* Store Name with Store Icon */}
                <div
                  onClick={() => onOpenShopCatalogue && onOpenShopCatalogue(deal.shopName)}
                  className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium pt-2 truncate cursor-pointer hover:text-[#0D6344] transition-colors"
                  title={`Shop: ${deal.shopName}`}
                >
                  <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{deal.shopName}</span>
                </div>
              </div>

              {/* Action Button: ഓഫർ നേടൂ (White outline pill button) */}
              <button
                type="button"
                onClick={() => handleAdd(deal.id, deal.productId)}
                className={`w-full py-2 px-3 mt-3 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-2xs font-malayalam ${
                  isAdded
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-900 hover:text-white border-slate-300 hover:border-slate-900 text-slate-900'
                }`}
              >
                {isAdded ? 'ചേർത്തു ✓' : 'ഓഫർ നേടൂ'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/90 font-sans shadow-2xs my-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs border border-amber-200/60">
            ⚡
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-malayalam m-0">
            ഓഫറുകൾ ലഭ്യമല്ല
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-malayalam">
            തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾ മാറ്റി നോക്കൂ.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-sans shadow-xs"
          >
            Show All Deals
          </button>
        </div>
      )}

    </div>
  );
};
