import React, { useState, useEffect } from 'react';
import { FlashDeal, Product } from '../types';
import { ArrowLeft, Clock, Check, Store, Zap, Flame, ShoppingBag } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 18,
  });

  // Live countdown timer
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
    { id: 'all', label: 'All Deals' },
    { id: 'vegetables', label: 'Vegetables', emoji: '🍅' },
    { id: 'oils-staples', label: 'Oils & Staples', emoji: '🍾' },
    { id: 'dairy', label: 'Dairy', emoji: '🥛' },
    { id: 'snacks', label: 'Snacks', emoji: '🍕' },
  ];

  const filteredDeals = deals.filter((deal) => {
    if (selectedCategory === 'all') return true;
    const prod = products.find((p) => p.id === deal.productId);
    const cat = prod?.categoryId || '';
    if (selectedCategory === 'vegetables') return cat.includes('veg') || cat.includes('fruit');
    if (selectedCategory === 'oils-staples') return cat.includes('oil') || cat.includes('grain') || cat.includes('rice');
    if (selectedCategory === 'dairy') return cat.includes('dairy');
    if (selectedCategory === 'snacks') return cat.includes('snack') || cat.includes('bakery') || cat.includes('biscuit');
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200 font-sans pb-16">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-[#E3ECE7] rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-sans shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500" />
          <span>Back to Products</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-900 font-sans shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Hyperlocal Flash Deals</span>
        </div>
      </div>

      {/* 1. HERO BANNER: VIBRANT GRADIENT BANNER MATCHING MOCKUP */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#0D6344] p-6 sm:p-8 lg:p-9 text-white shadow-md overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 font-malayalam-heading text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight tracking-tight">
            <span>⚡</span>
            <span>ഇന്നത്തെ മിന്നൽ ഓഫറുകൾ</span>
          </div>

          <div className="text-sm sm:text-base font-bold text-white/90 font-sans">
            (Today's Flash Deals)
          </div>

          {/* Live Countdown Timer */}
          <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/95">
            <Clock className="w-4 h-4 text-amber-200" />
            <span>Ends in</span>
            <div className="font-mono bg-black/35 backdrop-blur-xs px-3 py-1 rounded-lg font-bold text-white tracking-widest text-sm shadow-xs border border-white/20">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Right Discount Callout */}
        <div className="relative z-10 text-left md:text-right shrink-0">
          <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold font-sans">
            Up to
          </div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans drop-shadow-xs">
            50% OFF
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER PILLS (Matching Mockup) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar font-sans">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] shadow-2xs scale-102 font-extrabold'
                  : 'bg-white border-[#E5EBE7] text-slate-700 hover:bg-[#F8FAF9] shadow-2xs'
              }`}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. FLASH DEAL PRODUCT CARDS GRID (Matching Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDeals.map((deal) => {
          const isAdded = addedIds[deal.id];
          const matchedProduct = products?.find(
            (p) => p.id === deal.productId || p.name.toLowerCase() === deal.productName.toLowerCase()
          );
          const resolvedImage = deal.image || matchedProduct?.image;
          const safeEmoji = (deal.emoji && deal.emoji !== '🫘') ? deal.emoji : (matchedProduct?.emoji || '🌾');
          const savings = deal.originalPrice - deal.dealPrice;

          return (
            <div
              key={deal.id}
              className="bg-white rounded-2xl p-4 border border-[#E3ECE7] hover:border-[#0D6344]/50 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
            >
              <div>
                {/* Top Badges (Discount + Urgency) */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <span className="text-[11px] font-black text-white bg-[#0D6344] px-2.5 py-0.5 rounded-md font-sans shadow-2xs">
                    {deal.discountPercentage ? `${deal.discountPercentage}% OFF` : `Save ₹${savings}`}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-sans">
                    Only 3 left!
                  </span>
                </div>

                {/* Product Thumbnail */}
                <div className="w-full h-36 flex items-center justify-center p-2 mb-3 bg-white rounded-xl">
                  <ProductImage
                    productId={deal.productId}
                    image={resolvedImage}
                    emoji={safeEmoji}
                    alt={deal.productName}
                    className="w-full h-full"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                    fallbackEmojiClassName="text-5xl"
                  />
                </div>

                {/* Title & Shop Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#17221D] font-sans truncate m-0 group-hover:text-[#0D6344] transition-colors" title={deal.productName}>
                    {getMalayalamName(deal.productName) !== deal.productName
                      ? `${getMalayalamName(deal.productName)} (${deal.productName})`
                      : deal.productName}
                  </h3>

                  <div className="text-[11px] text-slate-400 font-sans line-through">
                    Price ₹{deal.originalPrice}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-[#17221D] font-sans">
                      ₹{deal.dealPrice}
                    </span>
                    {deal.unit && (
                      <span className="text-[11px] text-slate-500 font-sans">
                        /{deal.unit}
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => onOpenShopCatalogue && onOpenShopCatalogue(deal.shopName)}
                    className="flex items-center gap-1 text-[11px] text-[#526359] font-sans pt-1 truncate cursor-pointer hover:text-[#0D6344]"
                    title={deal.shopName}
                  >
                    <Store className="w-3 h-3 text-[#0D6344] shrink-0" />
                    <span className="font-semibold truncate">{deal.shopName}</span>
                    <span>•</span>
                    <span>2.3 km</span>
                  </div>
                </div>
              </div>

              {/* Bottom Claim Deal Button */}
              <div className="pt-3 mt-3 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => handleAdd(deal.id, deal.productId)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 font-sans ${
                    isAdded
                      ? 'bg-[#064E3B] text-white'
                      : 'bg-[#0D6344] hover:bg-[#094E35] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Claimed!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Claim Deal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 font-sans">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl">
            ⚡
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No flash deals found in this category
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Check back soon as local stores in your area update their daily flash offers.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="mt-4 px-5 py-2 bg-[#0D6344] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Show All Deals
          </button>
        </div>
      )}
    </div>
  );
};
