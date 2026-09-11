import React, { useState } from 'react';
import { FullComparisonResponse, Shop } from '../types';
import { X, Swords, Award, MapPin, Star, Truck } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface StoreDuelModalProps {
  shops: Shop[];
  comparison: FullComparisonResponse | null;
  onClose: () => void;
}

export const StoreDuelModal: React.FC<StoreDuelModalProps> = ({
  shops,
  comparison,
  onClose,
}) => {
  const availableShops = comparison?.shops || [];

  const [shopAName, setShopAName] = useState<string>(
    availableShops[0]?.shopName || shops[0]?.name || 'Green Mart'
  );
  const [shopBName, setShopBName] = useState<string>(
    availableShops[1]?.shopName || shops[1]?.name || shops[0]?.name || 'Market Hub'
  );

  if (!comparison || comparison.itemCount === 0 || availableShops.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center relative">
          <button
            onClick={onClose}
            className="p-2 absolute right-4 top-4 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-dark mb-1">
            Store Duel Needs 2+ Local Stores
          </h3>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            There is currently only <b>{availableShops.length > 0 ? availableShops[0].shopName : '1 store'}</b> carrying active prices for these basket items in your active region. Store Duel comparison automatically unlocks when at least 2 stores carry your items!
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    );
  }

  const shopA = comparison.shops.find((s) => s.shopName === shopAName) || comparison.shops[0];
  const shopB =
    comparison.shops.find((s) => s.shopName === shopBName && s.shopName !== shopA.shopName) ||
    comparison.shops.find((s) => s.shopName !== shopA.shopName) ||
    comparison.shops[1] ||
    comparison.shops[0];

  const priceDiff = Math.abs(shopA.total - shopB.total);
  const cheaperShop = shopA.total <= shopB.total ? shopA : shopB;
  const isTie = shopA.total === shopB.total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">നേർക്കുനേർ താരതമ്യം • Store Duel</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                രണ്ട് കടകൾ തമ്മിലുള്ള താരതമ്യം
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                നിങ്ങളുടെ ബാസ്കറ്റിലെ സാധനങ്ങളുടെ ആകെ വിലയും വ്യത്യാസവും കാണുക
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

        {/* Store Selectors */}
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              ആദ്യത്തെ കട (Store 1)
            </label>
            <select
              value={shopAName}
              onChange={(e) => setShopAName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-brand-600 transition-colors"
            >
              {shops.map((s) => (
                <option key={s.id || s.name} value={s.name} disabled={s.name === shopBName}>
                  🏪 {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              രണ്ടാമത്തെ കട (Store 2)
            </label>
            <select
              value={shopBName}
              onChange={(e) => setShopBName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-brand-600 transition-colors"
            >
              {shops.map((s) => (
                <option key={s.id || s.name} value={s.name} disabled={s.name === shopAName}>
                  🏪 {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duel Result Banner */}
        <div
          className={`rounded-2xl p-4 text-center mb-4 border ${
            isTie
              ? 'bg-gray-50 border-gray-200 text-slate-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {isTie ? (
            <div className="text-sm font-black">രണ്ട് കടകളിലും ഒരേ ആകെ തുകയാണ്! (Exact Same Total)</div>
          ) : (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block mb-0.5">
                🏆 ഏറ്റവും ലാഭകരമായ കട (Best Price)
              </span>
              <div className="text-xl font-black text-emerald-900">
                {cheaperShop.shopName} - ₹{priceDiff} ലാഭിക്കാം
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                ആകെ തുക: {cheaperShop.shopName} കടയിൽ ₹{cheaperShop.total}, മറ്റേ കടയിൽ ₹
                {cheaperShop === shopA ? shopB.total : shopA.total}
              </p>
            </div>
          )}
        </div>

        {/* Side-by-Side Breakdown */}
        <div className="overflow-auto flex-1 my-2">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Store A Card */}
            <div className="border border-gray-200 rounded-2xl p-3.5 bg-white">
              <div className="flex items-center justify-between mb-2">
                <b className="font-extrabold text-sm text-slate-dark">{shopA.shopName}</b>
                {shopA.total <= shopB.total && (
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5" /> Cheaper
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-slate-dark mb-2">₹{shopA.total}</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{shopA.distanceKm} km away</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{shopA.rating} rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Delivery: ₹{shopA.deliveryFee} (Free over ₹500)</span>
                </div>
              </div>
            </div>

            {/* Store B Card */}
            <div className="border border-gray-200 rounded-2xl p-3.5 bg-white">
              <div className="flex items-center justify-between mb-2">
                <b className="font-extrabold text-sm text-slate-dark">{shopB.shopName}</b>
                {shopB.total <= shopA.total && (
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5" /> Cheaper
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-slate-dark mb-2">₹{shopB.total}</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{shopB.distanceKm} km away</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{shopB.rating} rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Delivery: ₹{shopB.deliveryFee} (Free over ₹500)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Comparison List */}
          <div className="space-y-1 border-t border-gray-100 pt-3 text-xs">
            <div className="font-bold text-slate-dark mb-2">Item-by-Item Price Match</div>
            {comparison.itemizedMatrix.map((item) => {
              const infoA = item.pricesByShop[shopAName];
              const infoB = item.pricesByShop[shopBName];
              const isOutA = infoA?.stockStatus === 'out_of_stock';
              const isOutB = infoB?.stockStatus === 'out_of_stock';
              const priceA = infoA?.lineTotal ?? 0;
              const priceB = infoB?.lineTotal ?? 0;

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ProductImage
                      productId={item.productId}
                      emoji={item.emoji}
                      alt={item.productName}
                      className="w-5 h-5 shrink-0"
                      imgClassName="w-5 h-5 object-contain"
                      fallbackEmojiClassName="text-sm"
                    />
                    <span className="font-bold text-slate-dark">{item.productName}</span>
                    <span className="text-[10px] text-gray-400">
                      ({item.quantity} × {item.unit})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-black">
                    {isOutA ? (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                        🔴 Out
                      </span>
                    ) : (
                      <span className={!isOutB && priceA <= priceB ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}>
                        ₹{priceA} {!isOutB && priceA < priceB && '✓'}
                      </span>
                    )}

                    <span className="text-gray-300">vs</span>

                    {isOutB ? (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                        🔴 Out
                      </span>
                    ) : (
                      <span className={!isOutA && priceB <= priceA ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}>
                        ₹{priceB} {!isOutA && priceB < priceA && '✓'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close Duel
          </button>
        </div>
      </div>
    </div>
  );
};
