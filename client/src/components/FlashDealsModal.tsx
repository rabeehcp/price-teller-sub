import React, { useState, useEffect } from 'react';
import { FlashDeal } from '../types';
import { Zap, Clock, Plus, Check, X, Store, Tag, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface FlashDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: FlashDeal[];
  onAddDealToBasket: (productId: string) => void;
  onOpenMerchantPortal?: () => void;
  isMerchant?: boolean;
}

export const FlashDealsModal: React.FC<FlashDealsModalProps> = ({
  isOpen,
  onClose,
  deals,
  onAddDealToBasket,
  onOpenMerchantPortal,
  isMerchant = false,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 48,
    seconds: 15,
  });

  // Live countdown timer ticker
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

  if (!isOpen) return null;

  const handleAdd = (dealId: string, productId: string) => {
    onAddDealToBasket(productId);
    setAddedIds((prev) => ({ ...prev, [dealId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [dealId]: false }));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden flex flex-col max-h-[92dvh]">

        {/* Dynamic Glowing Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-rose-600 to-[#063B2A] text-white p-5 sm:p-6 overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-0 w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/25 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                <span>തത്സമയ ഫ്ലാഷ് ഓഫറുകൾ • Hyperlocal Flash Deals</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-malayalam tracking-tight text-white m-0">
                ഇന്നത്തെ ഫ്ലാഷ് ഡീലുകൾ
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-malayalam leading-relaxed max-w-xl m-0">
                നിങ്ങളുടെ പ്രദേശത്തെ സ്റ്റോറുകൾ നേരിട്ട് നൽകുന്ന പരിമിതകാല വിലക്കിഴിവുകൾ. സ്റ്റോക്ക് തീരുന്നതിന് മുൻപ് വാങ്ങൂ!
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Countdown Clock Banner */}
          <div className="relative z-10 mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>ഡീലുകൾ അവസാനിക്കാൻ ബാക്കി:</span>
              <div className="inline-flex items-center gap-1 font-mono font-black text-sm bg-black/30 px-2.5 py-1 rounded-lg border border-white/20 text-white">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span className="text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            {isMerchant && onOpenMerchantPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMerchantPortal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-full shadow-xs transition-all cursor-pointer font-malayalam"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>നിങ്ങളുടെ കടയിൽ ഡീൽ ആരംഭിക്കൂ</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {deals.map((deal) => {
              const isAdded = addedIds[deal.id];
              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full font-sans uppercase">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      -{deal.discountPercentage}% OFF
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-malayalam border border-amber-200/60">
                      {deal.tag || 'ലിമിറ്റഡ് ഡീൽ'}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                      <ProductImage
                        productId={deal.productId}
                        emoji={deal.emoji}
                        alt={deal.productName}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-contain"
                        fallbackEmojiClassName="text-3xl"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-malayalam tracking-tight truncate leading-snug">
                        {deal.productName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5 flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{deal.shopName}</span>
                        {deal.unit && <span className="text-slate-400">• {deal.unit}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-[#063B2A] font-sans">
                          ₹{deal.dealPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-sans">
                          ₹{deal.originalPrice}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-700 font-malayalam">
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

          {deals.length === 0 && (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-malayalam">
                പുതിയ ഫ്ലാഷ് ഡീലുകൾ ഉടൻ വരുന്നു!
              </h3>
              <p className="text-xs text-slate-500 font-malayalam mt-1 max-w-sm mx-auto">
                നിങ്ങളുടെ പ്രദേശത്തെ സ്റ്റോറുകൾ ലൈവ് ഡീലുകൾ പങ്കുവെക്കുമ്പോൾ ഇവിടെ കാണാം.
              </p>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-malayalam">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>തത്സമയ പ്രാദേശിക വിലനിലവാരം PeediyaCart ഉറപ്പുനൽകുന്നു</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            അടയ്ക്കുക (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
