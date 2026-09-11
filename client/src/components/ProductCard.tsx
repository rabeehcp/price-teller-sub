import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Minus, LineChart, Flag, Check, Heart, ChevronDown, Store } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  quantityInBasket: number;
  currentUnit: string;
  isFavorite?: boolean;
  onAdd: (product: Product, unit: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onViewHistory: (product: Product) => void;
  onReportPrice: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInBasket,
  currentUnit,
  isFavorite = false,
  onAdd,
  onQuantityChange,
  onViewHistory,
  onReportPrice,
  onToggleFavorite,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(currentUnit || product.defaultUnit);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const priceValues = Object.values(product.prices || {});
  const minBasePrice = priceValues.length ? Math.min(...priceValues) : 0;
  const multiplier = product.unitMultiplier[selectedUnit] ?? 1;
  const effectiveMinPrice = Math.round(minBasePrice * multiplier);

  // Stock status determination
  const stockStatuses = Object.values(product.stockStatus || {});
  const isAllOutOfStock =
    priceValues.length === 0 ||
    (stockStatuses.length > 0 && stockStatuses.every((s) => s === 'out_of_stock'));

  const handleAddClick = () => {
    if (isAllOutOfStock) return;
    onAdd(product, selectedUnit);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 900);
  };

  const inStockEntries = Object.entries(product.prices || {}).filter(
    ([shopName]) => (product.stockStatus?.[shopName] || 'in_stock') !== 'out_of_stock'
  ).sort((a, b) => a[1] - b[1]);

  const outOfStockEntries = Object.entries(product.prices || {}).filter(
    ([shopName]) => product.stockStatus?.[shopName] === 'out_of_stock'
  );

  const lowestShopEntry = inStockEntries[0] || Object.entries(product.prices || {}).sort((a, b) => a[1] - b[1])[0];
  const lowestShopName = lowestShopEntry ? lowestShopEntry[0] : '';
  const lowestShopStock = lowestShopName ? (product.stockStatus?.[lowestShopName] || 'in_stock') : 'in_stock';
  const shopsCount = Object.keys(product.prices || {}).length;

  return (
    <div className={`group bg-white border ${isAllOutOfStock ? 'border-rose-200/80 bg-rose-50/15' : 'border-surface-border hover:border-brand-500/70 hover:shadow-card-hover'} rounded-2xl p-3 sm:p-4 transition-all duration-200 flex flex-col justify-between relative overflow-hidden h-full font-sans`}>
      
      {/* Top Header: Badge & Favorite/History Actions */}
      <div className="flex items-center justify-between gap-1 w-full min-w-0 mb-2">
        {/* Left Badge: Lowest Price / Stock Pill */}
        <div className="min-w-0 flex-1 flex items-center gap-1 overflow-hidden">
          {isAllOutOfStock ? (
            <span className="truncate max-w-[120px] text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-malayalam">
              സ്റ്റോക്കില്ല
            </span>
          ) : (
            <>
              {outOfStockEntries.length > 0 ? (
                <span
                  className="truncate max-w-[120px] text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-malayalam"
                  title={`Out of stock at ${outOfStockEntries.map(([s]) => s).join(', ')}`}
                >
                  {outOfStockEntries[0][0]}-ൽ ലഭ്യമല്ല
                </span>
              ) : lowestShopStock === 'low_stock' ? (
                <span className="truncate max-w-[120px] text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse-subtle font-malayalam">
                  കുറഞ്ഞ സ്റ്റോക്ക്
                </span>
              ) : product.badge ? (
                <span className="truncate max-w-[120px] text-[9px] font-extrabold uppercase bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-malayalam">
                  {product.badge}
                </span>
              ) : product.isOrganic ? (
                <span className="truncate max-w-[120px] text-[9px] font-extrabold bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded-full font-malayalam">
                  🌿 ഓർഗാനിക്
                </span>
              ) : lowestShopName ? (
                <span
                  className="truncate max-w-[130px] text-[9px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full font-malayalam"
                  title={`Lowest in-stock price at ${lowestShopName}`}
                >
                  കുറഞ്ഞ വില @ {lowestShopName}
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Right Tools (Favorite, History, Flag) */}
        <div className="flex items-center gap-0.5 shrink-0">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className={`p-1 sm:p-1.5 rounded-lg text-xs transition-colors active:scale-90 cursor-pointer ${
                isFavorite
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-slate-muted hover:text-rose-500 hover:bg-rose-50/60'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to Favorites (❤️)'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory(product);
            }}
            className="p-1 sm:p-1.5 rounded-lg text-slate-muted hover:text-brand-700 hover:bg-brand-50 active:scale-90 transition-colors cursor-pointer"
            title="വില ചരിത്രം കാണുക (Price History)"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReportPrice(product);
            }}
            className="p-1 sm:p-1.5 rounded-lg text-slate-muted hover:text-amber-600 hover:bg-amber-50 active:scale-90 transition-colors cursor-pointer"
            title="വില റിപ്പോർട്ട് ചെയ്യുക"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Image & Info */}
      <div
        className="cursor-pointer flex-1 flex flex-col justify-center my-1"
        onClick={quantityInBasket === 0 ? handleAddClick : undefined}
      >
        <div className="h-28 sm:h-32 w-full flex items-center justify-center p-2 rounded-xl bg-surface-subtle group-hover:bg-brand-50/40 transition-colors duration-200">
          <ProductImage
            productId={product.id}
            image={product.image}
            emoji={product.emoji}
            alt={product.name}
            className="w-full h-full"
            imgClassName="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
            fallbackEmojiClassName="text-3xl sm:text-4xl select-none"
          />
        </div>

        <b className="block text-xs sm:text-sm font-black text-slate-dark leading-snug line-clamp-2 min-h-[2.2rem] text-center sm:text-left mt-2 font-malayalam">
          {product.name}
        </b>

        {/* Available in N Shops badge */}
        <div className="flex items-center gap-1 text-[10px] text-slate-muted font-medium mt-0.5 justify-center sm:justify-start font-malayalam">
          <Store className="w-3 h-3 text-slate-muted" />
          <span>{shopsCount} കടകളിൽ ലഭ്യമാണ്</span>
        </div>
      </div>

      {/* Unit Selector & Price Details */}
      <div className="mt-2 pt-2 border-t border-surface-border space-y-2">
        <div className="flex items-center justify-between gap-1.5 bg-surface-subtle border border-surface-border rounded-xl px-2 py-1.5">
          {/* Unit Dropdown */}
          <div className="min-w-0 flex items-center">
            {product.availableUnits.length > 1 ? (
              <div className="relative inline-flex items-center max-w-[85px] sm:max-w-[100px]">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="appearance-none bg-white hover:bg-surface-subtle border border-surface-border text-slate-dark font-bold text-[11px] sm:text-xs rounded-lg pl-2 pr-5 py-0.5 outline-none transition-all cursor-pointer shadow-2xs w-full truncate"
                >
                  {product.availableUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-muted absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              </div>
            ) : (
              <span className="text-slate-dark font-bold text-[11px] sm:text-xs bg-white border border-surface-border rounded-lg px-2 py-0.5 shadow-2xs">
                {product.defaultUnit}
              </span>
            )}
          </div>

          {/* Effective Price */}
          <div className="flex flex-col items-end text-right shrink-0">
            <span className="text-[8px] sm:text-[9px] text-slate-muted font-bold uppercase tracking-wider leading-none mb-0.5">വില</span>
            <span className="text-xs sm:text-sm font-black text-brand-700 leading-tight">₹{effectiveMinPrice}</span>
          </div>
        </div>

        {/* Basket Quantity Stepper / Add Button */}
        {isAllOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[36px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed select-none font-malayalam"
          >
            <span>സ്റ്റോക്കില്ല (Out of Stock)</span>
          </button>
        ) : quantityInBasket > 0 ? (
          <div className="flex items-center justify-between bg-brand-50 border border-brand-300 rounded-xl p-1 min-h-[36px] shadow-2xs">
            <button
              type="button"
              onClick={() => onQuantityChange(product.id, -1)}
              className="w-7 h-7 bg-white hover:bg-brand-100 text-brand-800 rounded-lg border border-brand-200 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90 transition-all cursor-pointer shrink-0"
              title="കുറയ്ക്കുക"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="text-center px-1 min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-black text-brand-900 block leading-tight truncate">
                {quantityInBasket} × {selectedUnit}
              </span>
              <span className="text-[10px] font-bold text-brand-700 block leading-tight">
                = ₹{effectiveMinPrice * quantityInBasket}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onQuantityChange(product.id, 1)}
              className="w-7 h-7 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90 transition-all cursor-pointer shrink-0"
              title="കൂട്ടുക"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddClick}
            className={`w-full min-h-[36px] py-1.5 px-2 sm:px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs font-malayalam ${
              isJustAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {isJustAdded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ചേർത്തു! ({selectedUnit})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ചേർക്കുക • ₹{effectiveMinPrice}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
