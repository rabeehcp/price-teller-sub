import React from 'react';
import { Product, Shop } from '../types';
import { X, Award, Check, Plus, Scale, Sparkles } from 'lucide-react';

interface ProductCompareModalProps {
  products: Product[];
  shops: Shop[];
  onClose: () => void;
  onAddToBasket: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  products,
  shops,
  onClose,
  onAddToBasket,
}) => {
  if (products.length === 0) return null;

  // Calculate normalized price per unit base
  const productMetrics = products.map((p) => {
    const minPrice = Math.min(...Object.values(p.prices));
    const lowestShopName = Object.keys(p.prices).find((s) => p.prices[s] === minPrice) || 'Green Mart';
    
    // Normalized cost per approx 100g or 100ml
    let normalized = minPrice;
    if (p.defaultUnit.includes('1 kg') || p.defaultUnit.includes('1 L')) {
      normalized = minPrice / 10; // per 100g
    } else if (p.defaultUnit.includes('500 g') || p.defaultUnit.includes('500 ml')) {
      normalized = minPrice / 5;
    } else if (p.defaultUnit.includes('5 kg')) {
      normalized = minPrice / 50;
    } else if (p.defaultUnit.includes('250 g')) {
      normalized = minPrice / 2.5;
    }

    return {
      product: p,
      minPrice,
      lowestShopName,
      normalizedPricePer100: Math.round(normalized * 10) / 10,
    };
  });

  // Best Value winner based on normalized price
  const lowestNormalized = Math.min(...productMetrics.map((m) => m.normalizedPricePer100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-dark leading-tight">
                Product Side-by-Side Comparison
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                Comparing {products.length} products across local pricing, unit value & availability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Grid */}
        <div className="overflow-auto my-4 flex-1">
          <div className="min-w-[620px] space-y-4">
            
            {/* 1. Product Cards Row */}
            <div className="grid grid-cols-12 gap-3 items-stretch">
              <div className="col-span-3 flex flex-col justify-end p-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Product Overview
              </div>
              <div className="col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productMetrics.map(({ product: p, minPrice, lowestShopName, normalizedPricePer100 }) => {
                  const isBestValue = normalizedPricePer100 === lowestNormalized;
                  return (
                    <div
                      key={p.id}
                      className={`border rounded-2xl p-4 flex flex-col justify-between relative transition-all ${
                        isBestValue
                          ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-xs'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {isBestValue && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <Award className="w-2.5 h-2.5" /> Best Unit Value
                        </span>
                      )}

                      <div className="text-center pt-1">
                        <span className="text-4xl block my-1">{p.emoji}</span>
                        <b className="block text-xs sm:text-sm font-black text-slate-dark line-clamp-2">
                          {p.name}
                        </b>
                        <span className="text-[11px] text-gray-500 font-semibold block mt-0.5">
                          {p.defaultUnit}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                        <div className="text-base sm:text-lg font-black text-brand-700">
                          ₹{minPrice}
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          cheapest @ {lowestShopName}
                        </span>

                        <button
                          onClick={() => onAddToBasket(p)}
                          className="w-full mt-2 py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Value per 100g / Unit Normalization Row */}
            <div className="grid grid-cols-12 gap-3 items-center bg-[#f7f9f5] rounded-2xl p-3 text-xs">
              <div className="col-span-3 font-bold text-slate-dark flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Value per ~100g / 100ml</span>
              </div>
              <div className="col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productMetrics.map(({ product: p, normalizedPricePer100 }) => (
                  <div key={p.id} className="text-center font-extrabold text-slate-dark">
                    ₹{normalizedPricePer100}
                    <span className="text-[10px] text-gray-400 font-normal block">normalized</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Category & Dietary Row */}
            <div className="grid grid-cols-12 gap-3 items-center border-t border-gray-100 py-3 text-xs">
              <div className="col-span-3 font-bold text-slate-dark">Dietary & Highlights</div>
              <div className="col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productMetrics.map(({ product: p }) => (
                  <div key={p.id} className="text-center space-y-1">
                    {p.isOrganic ? (
                      <span className="inline-block text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        🌿 100% Organic
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Standard Farm
                      </span>
                    )}
                    {p.badge && (
                      <span className="block text-[10px] font-bold text-amber-800">
                        {p.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Local Stores Breakdown */}
            <div className="border-t border-gray-100 pt-3">
              <div className="font-bold text-xs text-slate-dark mb-2">
                Local Store Pricing Matrix
              </div>
              <div className="space-y-1.5">
                {shops.map((shop) => (
                  <div
                    key={shop.id || shop.name}
                    className="grid grid-cols-12 gap-3 items-center bg-gray-50/70 hover:bg-gray-100/70 rounded-xl p-2.5 text-xs transition-colors"
                  >
                    <div className="col-span-3 font-bold text-slate-dark flex items-center justify-between pr-2">
                      <span className="truncate">🏪 {shop.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {shop.distanceKm}km
                      </span>
                    </div>
                    <div className="col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                      {productMetrics.map(({ product: p }) => {
                        const price = p.prices[shop.name];
                        const min = Math.min(...Object.values(p.prices));
                        const isLowest = price === min;
                        return (
                          <div key={p.id} className="font-extrabold">
                            <span
                              className={`px-2 py-0.5 rounded-lg ${
                                isLowest
                                  ? 'bg-emerald-100 text-emerald-800 font-black'
                                  : 'text-slate-dark'
                              }`}
                            >
                              ₹{price ?? '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Check className="w-4 h-4 text-brand-600" />
            <span>Real-time local retail rates verified daily</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
