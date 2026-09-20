import React, { useState } from 'react';
import { BasketItem, FullComparisonResponse, Product } from '../types';
import { formatPerUnitLabel, formatCartItemQuantity } from '../utils/unitFormatter';
import { ProductImage } from './ProductImage';
import { ArrowLeft, Trash2, Plus, Minus, Check, Tag, Scale, ShoppingBag, ChevronRight } from 'lucide-react';

interface MobileBasketViewProps {
  basketItems: BasketItem[];
  comparison?: FullComparisonResponse | null;
  onBack?: () => void;
  onGoToCompare?: () => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onUnitChange?: (productId: string, unit: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
  onCheckout?: () => void;
  onOpenShopDetails?: (shopName: string) => void;
  onOpenChat?: (shopName?: string) => void;
  onPreBookBasket?: (shopName?: string) => void;
  onOpenWhatsAppExport?: () => void;
  onGoToShopCatalog?: () => void;
}

export const MobileBasketView: React.FC<MobileBasketViewProps> = ({
  basketItems,
  comparison,
  onBack,
  onGoToCompare,
  onQuantityChange,
  onRemoveItem,
  onClearBasket,
  onCheckout,
}) => {
  const [orderPlaced, setOrderPlaced] = useState(false);

  const getBasePrice = (prod: Product): number => {
    const priceValues = Object.values(prod.prices || {});
    return priceValues.length > 0 ? Math.min(...priceValues) : 30;
  };

  const subtotal = basketItems.reduce((sum, item) => {
    const prod = item.product;
    const basePrice = getBasePrice(prod);
    const unit = item.selectedUnit || prod.defaultUnit || 'kg';
    const mult = prod.unitMultiplier?.[unit] ?? 1;
    return sum + (basePrice * mult * item.quantity);
  }, 0);

  const deliveryFee = basketItems.length > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  const handleOrder = () => {
    setOrderPlaced(true);
    if (onCheckout) onCheckout();
    setTimeout(() => {
      setOrderPlaced(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl mx-auto space-y-4 font-sans pb-36 animate-in fade-in duration-150">
      
      {/* 1. Header (Matching Screen 4) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#F0F4F2] sticky top-0 z-30 shadow-2xs">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-[#17221D] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[#17221D]" />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <h1 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
          എന്റെ കാർട്ട്
        </h1>

        {basketItems.length > 0 ? (
          <button
            type="button"
            onClick={onClearBasket}
            className="p-1.5 -mr-1 text-[#8A9992] hover:text-[#E11D48] hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
            title="കാർട്ട് ക്ലിയർ ചെയ്യുക"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>

      {/* Cart vs Compare Tab Switcher */}
      {onGoToCompare && (
        <div className="px-4 pt-1">
          <div className="grid grid-cols-2 gap-1 bg-[#F5F8F6] p-1 rounded-xl text-xs font-bold border border-[#E3ECE7]">
            <button
              type="button"
              className="py-2 px-2 rounded-lg bg-white text-slate-900 shadow-2xs font-black flex items-center justify-center gap-1.5 font-malayalam"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span>കാർട്ട് ({basketItems.length})</span>
            </button>
            <button
              type="button"
              onClick={onGoToCompare}
              className="py-2 px-2 rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 font-malayalam cursor-pointer active:scale-95"
            >
              <Scale className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span>വില താരതമ്യം</span>
            </button>
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Empty State */}
        {basketItems.length === 0 ? (
          <div className="p-8 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs mt-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto text-2xl">
              🛒
            </div>
            <h3 className="text-base font-black text-[#17221D] font-malayalam">
              കാർട്ട് ശൂന്യമാണ്
            </h3>
            <p className="text-xs text-[#66756E] font-malayalam max-w-xs mx-auto">
              സാധനങ്ങൾ കാർട്ടിൽ ചേർക്കൂ. സമീപത്തെ മികച്ച വിലകളിൽ ഓർഡർ ചെയ്യാം.
            </p>
          </div>
        ) : (
          <>
            {/* 2. Cart Items List (Matching Screen 4) */}
            <div className="space-y-3">
              {basketItems.map((item) => {
                const prod = item.product;
                const basePrice = getBasePrice(prod);
                const unit = item.selectedUnit || prod.defaultUnit || 'kg';
                const mult = prod.unitMultiplier?.[unit] ?? 1;
                const unitPrice = Math.round(basePrice * mult);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#F8FAF7] border border-[#E8ECE3] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <ProductImage
                        productId={prod.id}
                        image={prod.image}
                        emoji={prod.emoji}
                        alt={prod.name}
                        className="w-full h-full"
                        imgClassName="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 px-3.5 space-y-1">
                      <h3 className="text-sm font-extrabold text-[#17221D] font-malayalam truncate m-0">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#66756E] font-sans">
                        <span className="font-bold text-[#17221D]">₹{unitPrice}</span>
                        <span className="text-[10px] text-[#8A9992]">/{formatPerUnitLabel(unit)}</span>
                        <span className="text-[10px] text-[#8A9992] ml-1">({formatCartItemQuantity(item.quantity, unit)})</span>
                      </div>

                      {/* Stepper (Matching Screen 4) */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex items-center border border-[#E3ECE7] bg-[#F5F8F6] rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(prod.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[#2D3E35] hover:bg-white rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-black text-[#17221D] font-sans">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuantityChange(prod.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#2D3E35] hover:bg-white rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item Total Price */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#17221D] font-sans block">
                        ₹ {itemTotal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Coupon / Order Summary (Matching Screen 4) */}
            <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#F0F4F2]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#17221D] font-malayalam">
                  <Tag className="w-3.5 h-3.5 text-[#0B8F68]" />
                  <span>കൂപ്പൺ</span>
                </div>
                <span className="text-xs font-bold text-[#0B8F68] font-malayalam cursor-pointer hover:underline">
                  കൂപ്പൺ ചേർക്കുക
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#66756E] font-malayalam pt-1">
                <span>മൊത്തം</span>
                <span className="font-bold text-[#17221D] font-sans">₹ {subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#66756E] font-malayalam">
                <span>ഡെലിവറി ചാർജ്</span>
                <span className="font-bold text-[#17221D] font-sans">₹ {deliveryFee}</span>
              </div>

              <div className="border-t border-[#F0F4F2] pt-2.5 flex items-center justify-between">
                <span className="text-sm font-black text-[#063B2A] font-malayalam">ആകെ</span>
                <span className="text-base font-black text-[#063B2A] font-sans">₹ {total}</span>
              </div>
            </div>

            {/* Comparison Callout Card */}
            {comparison && onGoToCompare && (
              <div
                onClick={onGoToCompare}
                className="p-3 bg-gradient-to-r from-[#E8F5EE] to-[#DDF5EA] border border-[#C3EEDC] rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all font-malayalam shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0B8F68] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#063B2A] truncate">
                      ഏറ്റവും കുറഞ്ഞ കട: {comparison.bestShopName}
                    </div>
                    <div className="text-[10px] text-[#0B8F68] font-bold truncate">
                      ₹{comparison.bestTotal} ആകെ തുക {comparison.maxSavings > 0 ? `· ₹${comparison.maxSavings} ലാഭിക്കാം` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-xs font-black text-[#063B2A] shrink-0">
                  <span>താരതമ്യം</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* 4. Checkout CTA Button (Matching Screen 4) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleOrder}
                className="w-full py-4 px-4 bg-[#063B2A] hover:bg-[#0B8F68] active:scale-98 text-white text-sm font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
              >
                {orderPlaced ? (
                  <>
                    <Check className="w-5 h-5 text-[#34D399]" />
                    <span>ഓർഡർ സമർപ്പിച്ചു!</span>
                  </>
                ) : (
                  <span>ഓർഡർ ചെയ്യുക</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
