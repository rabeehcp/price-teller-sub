import React from 'react';
import { BasketItem, FullComparisonResponse, ShopComparisonResult } from '../types';
import { ProductImage } from './ProductImage';
import {
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarCheck,
  MessageCircle,
  Share2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface MobileBasketViewProps {
  basketItems: BasketItem[];
  comparison: FullComparisonResponse | null;
  onQuantityChange: (productId: string, delta: number) => void;
  onUnitChange: (productId: string, unit: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
  onOpenShopDetails: (shopName: string) => void;
  onOpenChat?: (shopName?: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
  onOpenWhatsAppExport?: () => void;
  onGoToShopCatalog?: () => void;
}

export const MobileBasketView: React.FC<MobileBasketViewProps> = ({
  basketItems,
  comparison,
  onQuantityChange,
  onUnitChange,
  onRemoveItem,
  onClearBasket,
  onOpenShopDetails,
  onOpenChat,
  onPreBookBasket,
  onOpenWhatsAppExport,
  onGoToShopCatalog,
}) => {
  const totalItemsCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  const bestShop = comparison?.shops?.[0];

  return (
    <div className="space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP HEADER MATCHING SCREEN 5 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-slate-950 font-malayalam tracking-tight m-0">
            എന്റെ ബാസ്കറ്റ്
          </h1>
          <span className="text-xs text-slate-500 font-semibold font-malayalam">
            {totalItemsCount} ഇനങ്ങൾ ചേർത്തു
          </span>
        </div>

        {basketItems.length > 0 && (
          <div className="flex items-center gap-1">
            {onOpenWhatsAppExport && (
              <button
                type="button"
                onClick={onOpenWhatsAppExport}
                className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                title="വാട്സ്ആപ്പിൽ ഷെയർ ചെയ്യുക"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClearBasket}
              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              title="ബാസ്ക്കറ്റ് ക്ലിയർ ചെയ്യുക"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. BASKET ITEMS LIST MATCHING SCREEN 5 */}
      {basketItems.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
            🛒
          </div>
          <h3 className="text-base font-black text-slate-900 font-malayalam">
            നിങ്ങളുടെ ബാസ്കറ്റ് ശൂന്യമാണ്
          </h3>
          <p className="text-xs text-slate-500 font-malayalam max-w-xs mx-auto">
            ഉൽപ്പന്നങ്ങളുടെ ലിസ്റ്റിൽ നിന്ന് സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർക്കൂ. സമീപത്തെ കടകളിലെ വില തത്സമയം താരതമ്യം ചെയ്യാം.
          </p>
          {onGoToShopCatalog && (
            <button
              type="button"
              onClick={onGoToShopCatalog}
              className="mt-2 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer font-malayalam shadow-xs"
            >
              ഷോപ്പിംഗ് ആരംഭിക്കാം
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
          <div className="divide-y divide-slate-100">
            {basketItems.map((item) => {
              const unitMultiplier = item.product.unitMultiplier[item.selectedUnit] ?? 1;
              const minBasePrice = Math.min(...Object.values(item.product.prices || { 0: 0 }));
              const itemTotal = Math.round(minBasePrice * unitMultiplier * item.quantity);

              return (
                <div
                  key={item.productId}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  {/* Thumbnail & Product info matching Screen 5 */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-[#f8faf6] border border-[#e8ece3] flex items-center justify-center p-1 shrink-0">
                      <ProductImage
                        productId={item.product.id}
                        image={item.product.image}
                        emoji={item.product.emoji}
                        alt={item.product.name}
                        className="w-full h-full"
                        imgClassName="max-h-full max-w-full object-contain"
                        fallbackEmojiClassName="text-2xl"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <b className="text-xs font-black text-slate-950 block truncate font-malayalam">
                        {item.product.name}
                      </b>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.product.availableUnits.length > 1 ? (
                          <select
                            value={item.selectedUnit}
                            onChange={(e) => onUnitChange(item.productId, e.target.value)}
                            className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-md px-1 py-0.5 text-slate-700 outline-none cursor-pointer"
                          >
                            {item.product.availableUnits.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {item.selectedUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Quantity Stepper matching Screen 5 */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-950 font-sans">
                        ₹ {itemTotal}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.productId, -1)}
                        className="w-6 h-6 bg-white hover:bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-slate-950 font-sans">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.productId, 1)}
                        className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TOTAL PRICE COMPARISON SECTION MATCHING SCREEN 5 */}
      {basketItems.length > 0 && comparison && (
        <div className="space-y-3 pt-2">
          
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 font-malayalam tracking-tight m-0">
              മൊത്തം വില താരതമ്യം (Total Price Comparison)
            </h2>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold font-malayalam">
              {comparison.shops?.length || 0} കടകൾ
            </span>
          </div>

          <div className="space-y-2.5">
            {comparison.shops?.map((shop: ShopComparisonResult) => {
              const isBest = shop.shopName === bestShop?.shopName;

              return (
                <div
                  key={shop.shopId || shop.shopName}
                  className={`p-4 rounded-3xl border transition-all ${
                    isBest
                      ? 'border-2 border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Shop Info Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                        {shop.shopName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <b className="text-xs font-black text-slate-950 truncate font-malayalam">
                            {shop.shopName}
                          </b>
                          {isBest && (
                            <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase font-malayalam">
                              ഏറ്റവും ലാഭം
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-medium">
                          <span>📍 {shop.distanceKm} km ദൂരം</span>
                          <span>•</span>
                          {shop.isAllAvailable ? (
                            <span className="text-emerald-700 font-bold font-malayalam">
                              എല്ലാം ലഭ്യമാണ്
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold font-malayalam">
                              {shop.outOfStockCount} എണ്ണം ലഭ്യമല്ല
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Basket Price matching Screen 5 */}
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-950 font-sans tracking-tight">
                        ₹ {shop.total}
                      </div>
                      {isBest ? (
                        <span className="text-[10px] font-bold text-emerald-700 block font-malayalam">
                          ഏറ്റവും കുറഞ്ഞ നിരക്ക്
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-malayalam">
                          +₹{shop.differenceVsBest} കൂടുതൽ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions matching Screen 5 CTA */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 font-malayalam">
                    <button
                      type="button"
                      onClick={() => onOpenShopDetails(shop.shopName)}
                      className="py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      വിശദാംശങ്ങൾ
                    </button>

                    {onOpenChat && (
                      <button
                        type="button"
                        onClick={() => onOpenChat(shop.shopName)}
                        className="py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>ചാറ്റ്</span>
                      </button>
                    )}

                    {onPreBookBasket && (
                      <button
                        type="button"
                        onClick={() => onPreBookBasket(shop.shopName)}
                        className={`py-2 px-4 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isBest
                            ? 'bg-[#064e3b] hover:bg-[#043d2e] text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>ഈ കടയിൽ നിന്ന് വാങ്ങുക</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
