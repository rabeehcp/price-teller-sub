import React, { useState, useEffect } from 'react';
import { FlashDeal } from '../types';
import { Zap, Clock, Plus, Check, X, Store, Tag, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90dvh]">

        {/* Clean, Premium Header */}
        <div className="relative bg-gradient-to-br from-[#063B2A] via-[#084D37] to-[#063B2A] text-white p-4 sm:p-5 shrink-0 border-b border-emerald-900/40">
          {/* Subtle Ambient Depth */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-xs rounded-full text-[11px] font-semibold border border-white/15 text-emerald-200">
                <Zap className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                <span>തത്സമയ ഫ്ലാഷ് ഓഫറുകൾ • Flash Deals</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-malayalam tracking-tight text-white m-0 leading-normal py-0.5">
                ഇന്നത്തെ ഫ്ലാഷ് ഡീലുകൾ
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-malayalam leading-relaxed max-w-lg m-0">
                നിങ്ങളുടെ പ്രദേശത്തെ സ്റ്റോറുകൾ നേരിട്ട് നൽകുന്ന പരിമിതകാല വിലക്കിഴിവുകൾ.
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Countdown Clock Banner */}
          <div className="relative z-10 mt-3 pt-2.5 flex items-center justify-between flex-wrap gap-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-malayalam">ഡീലുകൾ അവസാനിക്കാൻ:</span>
              <div className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 text-white">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span className="text-emerald-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            {isMerchant && onOpenMerchantPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMerchantPortal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-50 text-[#063B2A] font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer font-malayalam"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>നിങ്ങളുടെ കടയിൽ ഡീൽ ആരംഭിക്കൂ</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#F8FAF9]">
          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deals.map((deal) => {
              const isAdded = addedIds[deal.id];
              const savings = deal.originalPrice - deal.dealPrice;
              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E3ECE7] hover:border-[#0B8F68]/40 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#063B2A] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-lg font-sans">
                      <Zap className="w-3 h-3 fill-current text-[#0B8F68]" />
                      -{deal.discountPercentage}% OFF
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-malayalam">
                      {deal.tag || 'ലിമിറ്റഡ് ഡീൽ'}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-13 h-13 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
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
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-malayalam tracking-tight truncate leading-snug group-hover:text-[#063B2A] transition-colors">
                        {deal.productName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5 flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{deal.shopName}</span>
                        {deal.unit && <span className="text-slate-400 shrink-0">• {deal.unit}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-[#063B2A] font-sans">
                          ₹{deal.dealPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-sans">
                          ₹{deal.originalPrice}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-[#0B8F68] font-malayalam mt-0.5">
                        ₹{savings} ലാഭം
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(deal.id, deal.productId)}
                      className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#063B2A] hover:bg-[#0B8F68] text-white'
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
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0B8F68] flex items-center justify-center mx-auto mb-3">
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
        <div className="p-3 sm:p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-malayalam shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>തത്സമയ പ്രാദേശിക വിലനിലവാരം PeediyaCart ഉറപ്പുനൽകുന്നു</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            അടയ്ക്കുക (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
