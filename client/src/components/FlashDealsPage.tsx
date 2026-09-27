import React, { useState, useEffect, useMemo } from 'react';
import { FlashDeal, Product } from '../types';
import {
  ArrowLeft,
  Clock,
  Check,
  Store,
  Zap,
  Flame,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Info
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
  const [sortBy, setSortBy] = useState<'discount' | 'price-low' | 'urgency'>('discount');
  const [under50Only, setUnder50Only] = useState<boolean>(false);

  // Live countdown timer (simulating daily midnight or scheduled deal expiry)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 18,
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
    { id: 'all', label: 'All Deals', mlLabel: 'എല്ലാം', emoji: '🔥' },
    { id: 'vegetables', label: 'Vegetables & Fruits', mlLabel: 'പച്ചക്കറികൾ', emoji: '🍅' },
    { id: 'oils-staples', label: 'Oils & Staples', mlLabel: 'എണ്ണ & പലചരക്ക്', emoji: '🍾' },
    { id: 'dairy', label: 'Dairy', mlLabel: 'പാൽ ഉൽപ്പന്നങ്ങൾ', emoji: '🥛' },
    { id: 'snacks', label: 'Snacks & Bakery', mlLabel: 'പലഹാരങ്ങൾ', emoji: '🍪' },
  ];

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const prod = products.find((p) => p.id === deal.productId);
          const cat = prod?.categoryId || '';
          if (selectedCategory === 'vegetables' && !cat.includes('veg') && !cat.includes('fruit')) return false;
          if (selectedCategory === 'oils-staples' && !cat.includes('oil') && !cat.includes('grain') && !cat.includes('rice')) return false;
          if (selectedCategory === 'dairy' && !cat.includes('dairy')) return false;
          if (selectedCategory === 'snacks' && !cat.includes('snack') && !cat.includes('bakery') && !cat.includes('biscuit')) return false;
        }

        // Under 50 filter
        if (under50Only && deal.dealPrice > 50) {
          return false;
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
      })
      .sort((a, b) => {
        if (sortBy === 'discount') {
          return (b.discountPercentage || 0) - (a.discountPercentage || 0);
        }
        if (sortBy === 'price-low') {
          return a.dealPrice - b.dealPrice;
        }
        if (sortBy === 'urgency') {
          return (a.expiresInMinutes || 120) - (b.expiresInMinutes || 120);
        }
        return 0;
      });
  }, [deals, products, selectedCategory, searchQuery, sortBy, under50Only]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200 font-sans pb-20 px-2.5 sm:px-4">
      {/* 1. TOP HEADER & BREADCRUMB NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-slate-50 border border-[#E3ECE7] rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-malayalam shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500" />
          <span>തിരികെ (Back)</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Live Deals Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] sm:text-xs font-bold text-amber-900 font-sans shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span className="font-malayalam">{deals.length} മിന്നൽ ഓഫറുകൾ</span>
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER: STUNNING VIBRANT GRADIENT WITH LIVE COUNTDOWN */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#063B2A] via-[#0D6344] to-[#B45309] p-4.5 sm:p-7 lg:p-8 text-white shadow-md overflow-hidden">
        {/* Ambient Decorative Lighting */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[10px] sm:text-xs font-bold text-amber-200">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>പരിമിത സ്റ്റോക്ക് • ഇന്നത്തെ മാത്രം നിരക്കുകൾ</span>
            </div>

            {/* Title */}
            <div className="space-y-0.5">
              <h1 className="flex items-center gap-2 font-malayalam-heading text-xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight tracking-tight m-0">
                <span className="text-amber-400">⚡</span>
                <span>ഇന്നത്തെ മിന്നൽ ഓഫറുകൾ</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-white/80 font-sans m-0">
                Today's Local Flash Deals & Markdown Drops
              </p>
            </div>

            {/* Live Flip Countdown Timer */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-white/95">
              <div className="flex items-center gap-1.5 text-amber-200 font-semibold font-malayalam">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>അവസാനിക്കാൻ ഇനി:</span>
              </div>
              
              <div className="flex items-center gap-1 font-mono">
                <div className="bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg font-bold text-white text-xs sm:text-sm shadow-xs border border-white/20 flex flex-col items-center">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans text-white/60 font-normal">മണി</span>
                </div>
                <span className="font-bold text-amber-300">:</span>
                <div className="bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg font-bold text-white text-xs sm:text-sm shadow-xs border border-white/20 flex flex-col items-center">
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans text-white/60 font-normal">മിനിറ്റ്</span>
                </div>
                <span className="font-bold text-amber-300">:</span>
                <div className="bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg font-bold text-amber-300 text-xs sm:text-sm shadow-xs border border-white/20 flex flex-col items-center">
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] font-sans text-white/60 font-normal">സെക്കൻഡ്</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Discount Callout Badge */}
          <div className="relative z-10 flex items-center justify-between md:justify-end md:flex-col md:text-right gap-3 pt-1 md:pt-0 border-t md:border-t-0 border-white/15">
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-200 font-bold font-sans">
                Up to
              </div>
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans drop-shadow-md leading-none">
                50% OFF
              </div>
            </div>
            <div className="bg-amber-400 text-slate-900 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full shadow-xs font-malayalam whitespace-nowrap">
              🔥 വൻ ലാഭം നേടൂ!
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & QUICK FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ഓഫറുകൾ തിരയുക (Search deals, shops)..."
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-[#E3ECE7] rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0D6344] focus:ring-2 focus:ring-[#0D6344]/15 transition-all font-malayalam shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {/* Under ₹50 Quick Filter */}
          <button
            type="button"
            onClick={() => setUnder50Only((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1 font-malayalam shadow-2xs ${
              under50Only
                ? 'bg-[#0D6344] text-white border-[#0D6344]'
                : 'bg-white text-slate-700 border-[#E3ECE7] hover:bg-slate-50'
            }`}
          >
            <span>₹50-ൽ താഴെ</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#E3ECE7] rounded-xl p-0.5 shadow-2xs text-xs font-bold font-malayalam">
            <button
              type="button"
              onClick={() => setSortBy('discount')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === 'discount' ? 'bg-[#EAF7EE] text-[#0D6344]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              കൂടുതൽ കിഴിവ്
            </button>
            <button
              type="button"
              onClick={() => setSortBy('price-low')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === 'price-low' ? 'bg-[#EAF7EE] text-[#0D6344]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              കുറഞ്ഞ വില
            </button>
          </div>
        </div>
      </div>

      {/* 4. CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar font-malayalam">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[#0D6344] text-white border-[#0D6344] shadow-xs scale-102 font-extrabold'
                  : 'bg-white border-[#E5EBE7] text-slate-700 hover:bg-[#F8FAF9] shadow-2xs'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.mlLabel}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {cat.id === 'all'
                  ? deals.length
                  : deals.filter((d) => {
                      const prod = products.find((p) => p.id === d.productId);
                      const c = prod?.categoryId || '';
                      if (cat.id === 'vegetables') return c.includes('veg') || c.includes('fruit');
                      if (cat.id === 'oils-staples') return c.includes('oil') || c.includes('grain') || c.includes('rice');
                      if (cat.id === 'dairy') return c.includes('dairy');
                      if (cat.id === 'snacks') return c.includes('snack') || c.includes('bakery');
                      return true;
                    }).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. FLASH DEAL PRODUCT CARDS GRID */}
      {/* Mobile: 2 columns grid for quick scanning; Tablet: 2-3 cols; Desktop: 4 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {filteredDeals.map((deal) => {
          const isAdded = addedIds[deal.id];
          const matchedProduct = products?.find(
            (p) => p.id === deal.productId || p.name.toLowerCase() === deal.productName.toLowerCase()
          );
          const resolvedImage = deal.image || matchedProduct?.image;
          const safeEmoji = (deal.emoji && deal.emoji !== '🫘') ? deal.emoji : (matchedProduct?.emoji || '🌾');
          const savings = deal.originalPrice - deal.dealPrice;
          const discountPct = deal.discountPercentage || Math.round((savings / deal.originalPrice) * 100);
          const mlTitle = getMalayalamName(deal.productName);

          // Simulated remaining stock bar for urgency
          const claimedPercent = Math.min(92, Math.max(55, ((deal.productName.length * 7) % 40) + 55));

          return (
            <div
              key={deal.id}
              className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-[#E3ECE7] hover:border-[#0D6344]/50 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Top Floating Badges (Discount + Urgency) */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] sm:text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-600 px-2 py-0.5 rounded-lg font-sans shadow-2xs flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{discountPct}% OFF</span>
                  </span>

                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full font-malayalam whitespace-nowrap">
                    ⚡ പരിമിതം
                  </span>
                </div>

                {/* Product Image Thumbnail */}
                <div className="w-full h-28 sm:h-36 flex items-center justify-center p-2 mb-2 bg-[#F6FAF8] rounded-xl border border-slate-100 overflow-hidden relative group-hover:bg-[#EAF7EE]/60 transition-colors">
                  <ProductImage
                    productId={deal.productId}
                    image={resolvedImage}
                    emoji={safeEmoji}
                    alt={deal.productName}
                    className="w-full h-full flex items-center justify-center"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-108 duration-300"
                    fallbackEmojiClassName="text-4xl sm:text-5xl"
                  />
                </div>

                {/* Product Names & Info */}
                <div className="space-y-1">
                  <h3
                    className="text-xs sm:text-[13px] font-bold text-slate-900 font-malayalam leading-snug line-clamp-1 group-hover:text-[#0D6344] transition-colors m-0 break-words"
                    title={mlTitle || deal.productName}
                  >
                    {mlTitle}
                  </h3>

                  <p
                    className="text-[10px] sm:text-[11px] text-slate-500 font-sans line-clamp-1 m-0 font-medium"
                    title={deal.productName}
                  >
                    {deal.productName} {deal.unit ? `(${deal.unit})` : ''}
                  </p>

                  {/* Stock Claimed Progress Bar */}
                  <div className="pt-0.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-bold font-malayalam text-slate-400">
                      <span>വിറ്റുപോയത്: {claimedPercent}%</span>
                      <span className="text-amber-600 font-sans">Only few left</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${claimedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="pt-1.5 flex items-baseline flex-wrap gap-1.5">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-sans leading-none">
                      ₹{deal.dealPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans line-through">
                      ₹{deal.originalPrice}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#0D6344] bg-[#E8F5EE] px-1 py-0.2 rounded font-malayalam">
                      ₹{savings} ലാഭം
                    </span>
                  </div>

                  {/* Store Name & Distance Pill */}
                  <div
                    onClick={() => onOpenShopCatalogue && onOpenShopCatalogue(deal.shopName)}
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-600 font-sans pt-1 truncate cursor-pointer hover:text-[#0D6344] transition-colors group/shop"
                    title={`കട: ${deal.shopName}`}
                  >
                    <Store className="w-3 h-3 text-[#0D6344] shrink-0" />
                    <span className="font-semibold truncate group-hover/shop:underline">{deal.shopName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[9.5px] text-slate-400 shrink-0">2.3 km</span>
                  </div>
                </div>
              </div>

              {/* Bottom Claim Deal Button */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleAdd(deal.id, deal.productId)}
                  className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 font-malayalam ${
                    isAdded
                      ? 'bg-[#064E3B] text-white shadow-emerald-200'
                      : 'bg-[#0D6344] hover:bg-[#094E35] text-white hover:shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>ചേർത്തു! (Claimed)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ഓഫർ നേടൂ (Claim)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. EMPTY STATE IF NO DEALS FOUND */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-[#E3ECE7] font-sans shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs border border-amber-200/60">
            ⚡
          </div>
          <h3 className="text-base font-bold text-slate-800 font-malayalam m-0">
            ഈ വിഭാഗത്തിൽ ഇപ്പോൾ മിന്നൽ ഓഫറുകൾ ലഭ്യമല്ല
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-malayalam">
            തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾ മാറ്റി നോക്കൂ അല്ലെങ്കിൽ മറ്റെല്ലാ ഓഫറുകളും പരിശോധിക്കൂ.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setUnder50Only(false);
            }}
            className="mt-4 px-5 py-2 bg-[#0D6344] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-malayalam shadow-xs"
          >
            എല്ലാ ഓഫറുകളും കാണുക
          </button>
        </div>
      )}

      {/* 7. TRUST & GUARANTEE FOOTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs font-malayalam">
          <div className="p-2 bg-[#EAF7EE] text-[#0D6344] rounded-xl shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 m-0">തത്സമയ പരിശോധന</h4>
            <p className="text-[11px] text-slate-500 m-0 leading-tight">
              പ്രാദേശിക കടകൾ നേരിട്ട് നൽകുന്ന വിശ്വസനീയമായ ഓഫറുകൾ.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs font-malayalam">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 m-0">സമീപത്തെ കടകൾ</h4>
            <p className="text-[11px] text-slate-500 m-0 leading-tight">
              നിങ്ങളുടെ ലൊക്കേഷനിലുള്ള പരിശോധിച്ചുറപ്പിച്ച സ്റ്റോറുകൾ മാത്രം.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs font-malayalam">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 m-0">ഏറ്റവും കുറഞ്ഞ നിരക്ക്</h4>
            <p className="text-[11px] text-slate-500 m-0 leading-tight">
              സാധാരണ മാർക്കറ്റ് വിലയേക്കാൾ 50% വരെ അധിക ലാഭം.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
