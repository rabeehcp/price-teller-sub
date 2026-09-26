import React, { useState, useEffect } from 'react';
import { FlashDeal, Product } from '../types';
import { ArrowLeft, Clock, Plus, Check, Store, Zap, Flame } from 'lucide-react';
import { ProductImage } from './ProductImage';

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
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 48,
    seconds: 15,
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

  const shops = Array.from(new Set(deals.map((d) => d.shopName)));

  const filteredDeals = selectedFilter === 'all'
    ? deals
    : deals.filter((d) => d.shopName === selectedFilter);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200 font-sans pb-12">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-[#E3ECE7] rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-malayalam shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500" />
          <span>← പ്രധാന പേജിലേക്ക് മടങ്ങുക (Back to Home)</span>
        </button>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-900 font-sans shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Hyperlocal Flash Deals</span>
        </div>
      </div>

      {/* Clean, Modern Hero Banner with Countdown Timer */}
      <div className="relative bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5ECE0] border border-[#E5DACB] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(30,20,10,0.04)] overflow-hidden">
        {/* Subtle Ambient Decorative Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-rose-50 border border-rose-200/80 rounded-full text-xs font-bold text-rose-700 font-malayalam shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <Zap className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>ഇന്നത്തെ ലൈവ് ഓഫറുകൾ</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#112E22] font-malayalam tracking-tight m-0">
                ഫ്ലാഷ് ഡീലുകൾ
              </h1>
              <span className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-100/80 border border-amber-300/60 px-3 py-1 rounded-full font-sans tracking-wide uppercase shadow-2xs">
                ⚡ Flash Deals
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#4E5C53] font-medium leading-relaxed font-malayalam m-0">
              നിങ്ങളുടെ സമീപത്തെ രജിസ്റ്റർ ചെയ്ത കടകളിൽ നിന്നും നേരിട്ട് നൽകുന്ന പ്രത്യേക വിലക്കിഴിവുകൾ. തത്സമയ സ്റ്റോക്ക് പരിമിതമാണ്.
            </p>
          </div>

          {/* Clean Frosted Countdown Timer Widget */}
          <div className="bg-white/90 backdrop-blur-md border border-[#DFD3C3] rounded-2xl p-4 shrink-0 flex flex-col items-center md:items-end shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-malayalam mb-2.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>ഡീലുകൾ അവസാനിക്കാൻ ബാക്കി:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <div className="flex flex-col items-center">
                <div className="bg-[#093526] text-white text-lg sm:text-xl font-black px-3 py-1.5 rounded-xl shadow-xs min-w-[44px] text-center">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 font-sans">HOURS</span>
              </div>
              <span className="text-lg font-black text-slate-400 mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#093526] text-white text-lg sm:text-xl font-black px-3 py-1.5 rounded-xl shadow-xs min-w-[44px] text-center">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 font-sans">MINS</span>
              </div>
              <span className="text-lg font-black text-slate-400 mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-rose-700 text-white text-lg sm:text-xl font-black px-3 py-1.5 rounded-xl shadow-xs min-w-[44px] text-center animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <span className="text-[9px] font-bold text-rose-600 mt-1 font-sans">SECS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Shop Pills */}
      {shops.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 font-malayalam shrink-0">കടകൾ:</span>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#063B2A] text-white shadow-xs'
                : 'bg-white border border-[#E0D7CB] text-slate-600 hover:bg-[#FAF7F2]'
            }`}
          >
            എല്ലാ കടകളും ({deals.length})
          </button>
          {shops.map((shop) => (
            <button
              key={shop}
              type="button"
              onClick={() => setSelectedFilter(shop)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === shop
                  ? 'bg-[#063B2A] text-white shadow-xs'
                  : 'bg-white border border-[#E0D7CB] text-slate-600 hover:bg-[#FAF7F2]'
              }`}
            >
              {shop} ({deals.filter((d) => d.shopName === shop).length})
            </button>
          ))}
        </div>
      )}

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDeals.map((deal) => {
          const isAdded = addedIds[deal.id];
          const matchedProduct = products?.find(
            (p) => p.id === deal.productId || p.name.toLowerCase() === deal.productName.toLowerCase()
          );
          const resolvedImage = deal.image || matchedProduct?.image;
          const safeEmoji = (deal.emoji && deal.emoji !== '🫘') ? deal.emoji : (matchedProduct?.emoji || '🌾');

          return (
            <div
              key={deal.id}
              className="bg-white rounded-2xl p-4 border border-[#E3ECE7] hover:border-emerald-500/50 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full font-sans uppercase shadow-2xs">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  -{deal.discountPercentage}% OFF
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50/80 px-2.5 py-0.5 rounded-full font-malayalam border border-amber-200/60 shadow-2xs">
                  {deal.tag || 'ലിമിറ്റഡ് ഡീൽ'}
                </span>
              </div>

              {/* Product Visual & Name */}
              <div className="space-y-2.5 mb-3">
                <div className="w-full h-36 rounded-xl bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] border border-[#E8DEC9]/70 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <ProductImage
                    productId={deal.productId}
                    image={resolvedImage}
                    emoji={safeEmoji}
                    alt={deal.productName}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-contain mix-blend-multiply"
                    fallbackEmojiClassName="text-5xl"
                  />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#17261E] font-malayalam tracking-tight line-clamp-2 leading-snug group-hover:text-[#0B8F68] transition-colors m-0">
                    {deal.productName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onOpenShopCatalogue && onOpenShopCatalogue(deal.shopName)}
                    className="text-xs text-slate-500 font-sans mt-1 flex items-center gap-1 hover:text-emerald-700 cursor-pointer truncate"
                  >
                    <Store className="w-3.5 h-3.5 text-[#BC681D] shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{deal.shopName}</span>
                    {deal.unit && (
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold font-sans">
                        {deal.unit}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Pricing & Add to Cart Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-[#0B3D27] font-sans">
                      ₹{deal.dealPrice}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-sans">
                      ₹{deal.originalPrice}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-700 font-malayalam m-0">
                    ₹{deal.originalPrice - deal.dealPrice} ലാഭം
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(deal.id, deal.productId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#063B2A] hover:bg-[#09523B] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ചേർത്തു!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>ചേർക്കുക</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-malayalam">
            ഇപ്പോൾ പുതിയ ഫ്ലാഷ് ഡീലുകൾ ലഭ്യമല്ല
          </h3>
          <p className="text-xs text-slate-500 font-malayalam mt-1 max-w-sm mx-auto">
            നിങ്ങളുടെ പ്രദേശത്തെ സ്റ്റോറുകൾ ലൈവ് ഓഫറുകൾ നൽകുമ്പോൾ ഇവിടെ കാണാം.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#063B2A] text-white text-xs font-bold rounded-xl font-malayalam cursor-pointer"
          >
            ഹോമിലേക്ക് മടങ്ങുക
          </button>
        </div>
      )}
    </div>
  );
};
