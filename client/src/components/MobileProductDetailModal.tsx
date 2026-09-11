import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { ProductImage } from './ProductImage';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ShieldCheck,
  Store,
  MapPin,
  Flame,
} from 'lucide-react';
import { getShopCoordinates, calculateRoadDistanceKm } from '../services/locationService';

interface MobileProductDetailModalProps {
  product: Product | null;
  shops: Shop[];
  quantityInBasket: number;
  currentUnit: string;
  isFavorite?: boolean;
  onClose: () => void;
  onAdd: (product: Product, unit: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onToggleFavorite?: (product: Product) => void;
  onOpenShopCatalogue?: (shopName: string) => void;
}

export const MobileProductDetailModal: React.FC<MobileProductDetailModalProps> = ({
  product,
  shops,
  quantityInBasket,
  currentUnit,
  isFavorite = false,
  onClose,
  onAdd,
  onQuantityChange,
  onToggleFavorite,
  onOpenShopCatalogue,
}) => {
  if (!product) return null;

  const [selectedUnit, setSelectedUnit] = useState<string>(currentUnit || product.defaultUnit);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const priceValues = Object.values(product.prices || {});
  const minBasePrice = priceValues.length ? Math.min(...priceValues) : 0;
  const multiplier = product.unitMultiplier[selectedUnit] ?? 1;
  const effectiveMinPrice = Math.round(minBasePrice * multiplier);

  // Sorted stores by price for this product
  const storePriceEntries = Object.entries(product.prices || {})
    .map(([shopName, basePrice]) => {
      const shopInfo = shops.find((s) => s.name.toLowerCase() === shopName.toLowerCase());
      const effectivePrice = Math.round(basePrice * multiplier);
      const isLowest = basePrice === minBasePrice;
      const stockStatus = product.stockStatus?.[shopName] || 'in_stock';
      
      // Calculate realistic discount or baseline strike price
      const strikePrice = isLowest ? Math.round(effectivePrice * 1.15) : undefined;
      const discountPercent = strikePrice ? Math.round(((strikePrice - effectivePrice) / strikePrice) * 100) : undefined;

      return {
        shopName,
        shopInfo,
        effectivePrice,
        isLowest,
        stockStatus,
        strikePrice,
        discountPercent,
        rating: shopInfo?.rating || (4.2 + (Math.abs(shopName.length % 7) / 10)).toFixed(1),
        reviewsCount: 80 + (shopName.length * 12),
        distanceKm: (() => {
          if (shopInfo?.lat && shopInfo?.lng) {
            return calculateRoadDistanceKm(10.9155, 75.9238, shopInfo.lat, shopInfo.lng);
          }
          return shopInfo?.distanceKm || 1.2;
        })(),
      };
    })
    .sort((a, b) => a.effectivePrice - b.effectivePrice);

  const handleAdd = () => {
    onAdd(product, selectedUnit);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300 font-sans overflow-hidden">
      
      {/* Top Header matching Screen 3 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-malayalam">
          ഉൽപ്പന്ന വിവരങ്ങൾ
        </span>

        <button
          onClick={() => onToggleFavorite && onToggleFavorite(product)}
          className={`p-2 -mr-2 rounded-full transition-colors cursor-pointer ${
            isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">
        
        {/* Big Product Image matching Screen 3 */}
        <div className="w-full h-56 rounded-3xl bg-[#f8faf6] border border-[#e8ece3] flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
          <ProductImage
            productId={product.id}
            image={product.image}
            emoji={product.emoji}
            alt={product.name}
            className="w-full h-full"
            imgClassName="max-h-full max-w-full object-contain drop-shadow-md"
            fallbackEmojiClassName="text-6xl select-none"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Title & Unit Dropdown matching Screen 3 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-malayalam tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-semibold">{selectedUnit}</span>
              {product.isOrganic && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-malayalam">
                  🌿 100% ഓർഗാനിക്
                </span>
              )}
            </div>
          </div>

          {/* Unit Dropdown */}
          {product.availableUnits.length > 1 && (
            <div className="relative shrink-0">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="appearance-none bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold text-xs rounded-xl pl-3 pr-7 py-2 outline-none cursor-pointer shadow-2xs"
              >
                {product.availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Section: Multi-store Price Comparison matching Screen 3 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 font-malayalam tracking-tight">
              വില താരതമ്യം (Price Comparison)
            </h3>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold font-malayalam">
              {storePriceEntries.length} കടകളിൽ ലഭ്യമാണ്
            </span>
          </div>

          {/* Store Price Cards List matching Screen 3 */}
          <div className="space-y-2">
            {storePriceEntries.map((entry) => (
              <div
                key={entry.shopName}
                onClick={() => onOpenShopCatalogue && onOpenShopCatalogue(entry.shopName)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  entry.isLowest
                    ? 'border-2 border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Store Icon & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs"
                    style={{ backgroundColor: entry.shopInfo?.color || '#047857' }}
                  >
                    {entry.shopName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <b className="text-xs font-bold text-slate-900 truncate font-malayalam">
                        {entry.shopName}
                      </b>
                      {entry.isLowest && (
                        <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded font-malayalam">
                          കുറഞ്ഞ വില
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                      <span className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {entry.rating} ({entry.reviewsCount})
                      </span>
                      <span>•</span>
                      <span>{entry.distanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Store Price details matching Screen 3 */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-base font-black text-slate-950 font-sans">
                      ₹ {entry.effectivePrice}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">/{selectedUnit}</span>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {entry.strikePrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{entry.strikePrice}
                      </span>
                    )}
                    {entry.discountPercent && entry.discountPercent > 0 && (
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-sans">
                        {entry.discountPercent}% off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action Bar matching Screen 3 */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {quantityInBasket > 0 ? (
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-2xl p-1 shadow-2xs flex-1">
              <button
                type="button"
                onClick={() => onQuantityChange(product.id, -1)}
                className="w-10 h-10 bg-white hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center px-2 flex-1 min-w-0 font-malayalam">
                <span className="text-xs font-black text-emerald-950 block leading-tight truncate">
                  {quantityInBasket} × {selectedUnit}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 block leading-tight">
                  ആകെ = ₹{effectiveMinPrice * quantityInBasket}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onQuantityChange(product.id, 1)}
                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="py-3 px-4 bg-[#064e3b] text-white rounded-2xl text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer font-malayalam"
            >
              പൂർത്തിയായി
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full max-w-md mx-auto py-3.5 px-4 bg-[#064e3b] hover:bg-[#043d2e] active:scale-98 text-white text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
          >
            {isJustAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>ബാസ്ക്കറ്റിൽ ചേർത്തു!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>കാർട്ടിൽ ചേർക്കുക (₹{effectiveMinPrice} / {selectedUnit})</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
