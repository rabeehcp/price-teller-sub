import React from 'react';
import { FlashDeal } from '../types';
import { Sparkles, Clock, Plus, Tag } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface FlashDealsBannerProps {
  deals: FlashDeal[];
  onAddDealToBasket: (productId: string) => void;
  onClose?: () => void;
}

export const FlashDealsBanner: React.FC<FlashDealsBannerProps> = ({
  deals,
  onAddDealToBasket,
}) => {
  if (!deals || deals.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#063B2A] to-[#084D37] text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-md relative overflow-hidden border border-emerald-900/30">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight leading-none text-white">
              Today's Local Flash Deals & Markdown Drops
            </h3>
            <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">
              Verified daily deals at participating neighbourhood stores
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-emerald-200">
          <Clock className="w-3 h-3 text-emerald-300" />
          <span>Limited daily inventory</span>
        </div>
      </div>

      {/* Deals Horizontal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white text-slate-dark rounded-xl p-3 shadow-xs border border-white/30 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 shrink-0 p-1 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <ProductImage
                  productId={deal.productId}
                  emoji={deal.emoji}
                  alt={deal.productName}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-contain"
                  fallbackEmojiClassName="text-2xl"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                    -{deal.discountPercentage}%
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold truncate">
                    @ {deal.shopName}
                  </span>
                </div>
                <b className="block text-xs font-bold truncate mt-0.5">{deal.productName}</b>
                <div className="text-xs font-black text-brand-700">
                  ₹{deal.dealPrice}{' '}
                  <span className="text-[10px] text-gray-400 font-normal line-through">
                    ₹{deal.originalPrice}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddDealToBasket(deal.productId)}
              className="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg shrink-0 transition-colors shadow-2xs active:scale-95 cursor-pointer"
              title="Add deal to basket"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
