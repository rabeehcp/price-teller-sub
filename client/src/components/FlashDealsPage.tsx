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
    <div className="w-full max-w-md mx-auto space-y-3.5 animate-in fade-in duration-200 font-sans pb-28 px-3.5 sm:px-4 text-slate-800">
      
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
          className="w-full pl-9.5 pr-8 py-2 bg-white border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-all font-sans shadow-2xs"
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

      {/* 5. 2-COLUMN FLASH DEAL PRODUCT CARDS GRID (Exact match) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pt-1">
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
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                {/* Orange 30% OFF Ribbon Badge on Top-Left */}
                <div className="absolute top-0 left-0 bg-[#FF6B00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-br-lg tracking-wide shadow-2xs z-10 font-sans">
                  {discountPct}% OFF
                </div>

                {/* Centered Image */}
                <div className="w-full aspect-square flex items-center justify-center p-2 mb-2 bg-slate-50/40 rounded-xl overflow-hidden pt-4">
                  <ProductImage
                    productId={deal.productId}
                    image={resolvedImage}
                    emoji={safeEmoji}
                    alt={deal.productName}
                    className="w-full h-full flex items-center justify-center"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-200"
                    fallbackEmojiClassName="text-4xl"
                  />
                </div>

                {/* Product Name & Pack Size */}
                <div className="space-y-0.5">
                  <h3
                    className="text-xs sm:text-[13px] font-bold text-slate-900 truncate m-0 font-sans"
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
                  className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium pt-2 truncate cursor-pointer hover:text-slate-800 transition-colors"
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
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-900'
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
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/90 font-sans shadow-2xs my-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 text-xl shadow-xs border border-amber-200/60">
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
            className="mt-3 px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full transition-all cursor-pointer font-sans shadow-xs"
          >
            Show All Deals
          </button>
        </div>
      )}

    </div>
  );
};
