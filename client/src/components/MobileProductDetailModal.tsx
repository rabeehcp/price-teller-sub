import React, { useState } from 'react';
import { Product, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import { ArrowLeft, ShoppingBag, Star, Plus, Minus, Check, Leaf, ShieldCheck, Sprout, X, MessageCircle, Heart } from 'lucide-react';

interface MobileProductDetailModalProps {
  product: Product | null;
  basket: BasketItem[];
  isFavorite?: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
  onOpenChat?: () => void;
  onAdd: (product: Product, unit: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onToggleFavorite?: (product: Product) => void;
}

function getProductMultiplier(product: Product, unit: string): number {
  if (product.unitMultiplier && product.unitMultiplier[unit] !== undefined) {
    return product.unitMultiplier[unit];
  }
  if (unit === product.defaultUnit) return 1;

  const parseAmt = (u: string) => {
    const m = (u || '').toLowerCase().match(/([\d.]+)\s*(kg|g|ml|l|pc|pcs|bunch|pack|box)/i);
    if (!m) return null;
    const val = parseFloat(m[1]);
    const type = m[2].toLowerCase();
    if (type === 'kg') return { type: 'weight', val: val * 1000 };
    if (type === 'g') return { type: 'weight', val };
    if (type === 'l') return { type: 'volume', val: val * 1000 };
    if (type === 'ml') return { type: 'volume', val };
    if (type === 'pc' || type === 'pcs') return { type: 'count', val };
    if (type === 'bunch') return { type: 'bunch', val };
    if (type === 'pack') return { type: 'pack', val };
    return null;
  };

  const target = parseAmt(unit);
  const base = parseAmt(product.defaultUnit || '1 kg');
  if (target && base && target.type === base.type && base.val > 0) {
    return target.val / base.val;
  }
  return 1;
}

function getProductAvailableUnits(product: Product): string[] {
  if (product.availableUnits && product.availableUnits.length > 0) {
    return product.availableUnits;
  }
  const def = (product.defaultUnit || '').toLowerCase().trim();
  if (def.includes('bunch')) return ['1 bunch', '2 bunches', '3 bunches'];
  if (def.includes('kg') || def === '1 kg' || def === 'kg') return ['500 g', '1 kg', '2 kg'];
  if (def === '500 g') return ['250 g', '500 g', '1 kg'];
  if (def === '100 g') return ['100 g', '250 g', '500 g'];
  if (def.includes('pc')) return ['1 pc', '2 pcs', '3 pcs'];
  if (def.includes('pack')) return ['1 pack', '2 packs'];
  if (def.includes('l') || def.includes('litre')) return ['500 ml', '1 L'];
  return [product.defaultUnit || '1 kg'];
}

export const MobileProductDetailModal: React.FC<MobileProductDetailModalProps> = ({
  product,
  basket,
  isFavorite = false,
  onClose,
  onOpenCart,
  onOpenChat,
  onAdd,
  onQuantityChange,
  onToggleFavorite,
}) => {
  if (!product) return null;

  const availableUnits = getProductAvailableUnits(product);
  const [selectedUnit, setSelectedUnit] = useState<string>(product.defaultUnit || availableUnits[0] || '1 kg');
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const basketItem = basket.find((b) => b.productId === product.id || (b as any).product?.id === product.id);
  const currentBasketQty = basketItem ? basketItem.quantity : 0;
  const basketTotalCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const priceValues = Object.values(product.prices || {});
  const basePrice = priceValues.length > 0 ? Math.min(...priceValues) : 30;
  const multiplier = getProductMultiplier(product, selectedUnit);
  const unitPrice = Math.round(basePrice * multiplier);
  const totalPrice = unitPrice * qty;

  const isOutOfStock = Boolean(
    product.stockStatus &&
    Object.values(product.stockStatus).length > 0 &&
    Object.values(product.stockStatus).every((s) => s === 'out_of_stock')
  );

  const rating = 4.5;
  const reviewCount = 120;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAdd(product, selectedUnit);
    if (qty > 1) {
      onQuantityChange(product.id, qty - 1);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      {/* Backdrop overlay (click to close) */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Centered Modal Card Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
      >
        {/* 1. TOP HERO IMAGE WITH FLOATING CONTROLS */}
        <div className="relative w-full h-52 bg-white border-b border-slate-100 flex items-center justify-center p-4 shrink-0 overflow-hidden">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 left-3.5 z-20 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#17221D] shadow-sm hover:bg-white hover:text-emerald-700 border border-[#E3ECE7] transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5 text-[#17221D]" />
          </button>

          {/* Floating Top-Right Controls: Heart & Cart */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(product)}
                className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#2D3E35] shadow-sm hover:bg-white border border-[#E3ECE7] transition-all cursor-pointer active:scale-95"
                title={isFavorite ? 'പ്രിയപ്പെട്ടവയിൽ നിന്ന് മാറ്റുക' : 'പ്രിയപ്പെട്ടവയിൽ ചേർക്കുക'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#2D3E35] hover:text-[#E11D48]'
                  }`}
                />
              </button>
            )}

            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#2D3E35] shadow-sm hover:bg-white border border-[#E3ECE7] transition-all cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#2D3E35]" />
                {basketTotalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E11D48] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {basketTotalCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Main Product Hero Image */}
          <div className="w-36 h-36 flex items-center justify-center p-2 relative bg-white">
            <ProductImage
              productId={product.id}
              image={product.image}
              emoji={product.emoji}
              alt={product.name}
              className="w-full h-full"
              imgClassName="max-h-full max-w-full object-contain mix-blend-multiply"
              fallbackEmojiClassName="text-6xl"
              isOutOfStock={isOutOfStock}
              stampSize="md"
            />
          </div>
        </div>

        {/* 2. PRODUCT DETAILS BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {/* Title & Badge */}
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-black text-[#17221D] font-malayalam tracking-tight m-0 leading-snug">
              {product.name}
            </h1>
            <span className="shrink-0 inline-flex items-center gap-1 bg-[#E8F5EE] text-[#0B8F68] text-[11px] font-bold px-2.5 py-0.5 rounded-full font-malayalam border border-[#C3EEDC]">
              🌱 നാടൻ
            </span>
          </div>

          {/* Dynamic Price & Rating */}
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#17221D] font-sans">
                ₹ {totalPrice}
              </span>
              <span className="text-xs text-[#66756E] font-medium font-sans">
                {qty > 1 ? `(₹${unitPrice} × ${qty})` : `/ ${selectedUnit}`}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-[11px] text-[#8A9992] font-sans">
              <Star className="w-3.5 h-3.5 fill-[#F4B740] text-[#F4B740]" />
              <span className="font-bold text-[#17221D]">{rating}</span>
              <span>({reviewCount})</span>
            </div>
          </div>

          {/* Unit / Weight Selector (Available market quantities) */}
          {availableUnits.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-[#8A9992] uppercase tracking-wider font-sans block">
                അളവ് തിരഞ്ഞെടുക്കുക (Weight / Pack)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableUnits.map((u) => {
                  const isSelected = selectedUnit === u;
                  const mult = getProductMultiplier(product, u);
                  const uPrice = Math.round(basePrice * mult);
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setSelectedUnit(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#063B2A] text-white border-[#063B2A] shadow-xs'
                          : 'bg-[#F8FAF7] text-[#17221D] border-[#E3ECE7] hover:border-[#0B8F68]'
                      }`}
                    >
                      <span>{u}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-[#34D399]' : 'text-[#8A9992]'}`}>
                        ₹{uPrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description Section ("വിവരണം") */}
          <div className="space-y-1 pt-1.5 border-t border-[#F0F4F2]">
            <h3 className="text-[11px] font-black text-[#17221D] font-malayalam uppercase tracking-wider">
              വിവരണം
            </h3>
            <p className="text-xs text-[#66756E] font-malayalam leading-relaxed m-0">
              {product.nutritionalNote || `നാടൻ ${product.name}. രുചിയും പുതുമയും നിറഞ്ഞത്. നിങ്ങളുടെ വീട്ടിലേക്ക് നേരിട്ട്.`}
            </p>
          </div>

          {/* Quantity Stepper Selector */}
          <div className="pt-1">
            <div className="flex items-center justify-between bg-[#F5F8F6] border border-[#E3ECE7] rounded-2xl py-2 px-4 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-[#E3ECE7] text-[#17221D] flex items-center justify-center font-bold text-sm shadow-2xs active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-black text-[#17221D] font-sans">
                {qty} × {selectedUnit}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-[#E3ECE7] text-[#17221D] flex items-center justify-center font-bold text-sm shadow-2xs active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary CTA Button with Real-time dynamic total price */}
          <div className="pt-1 space-y-2">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 bg-red-50 border-2 border-dashed border-red-300 text-red-700 text-sm font-black rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed font-malayalam select-none shadow-2xs"
              >
                <span>🚫 നിലവിൽ സ്റ്റോക്കില്ല (Out of Stock)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-4 bg-[#063B2A] hover:bg-[#0B8F68] active:scale-98 text-white text-sm font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#34D399]" />
                    <span>കാർട്ടിൽ ചേർത്തു!</span>
                  </>
                ) : (
                  <span>കാർട്ടിൽ ചേർക്കുക • ₹{totalPrice}</span>
                )}
              </button>
            )}

            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat();
                }}
                className="w-full py-2.5 px-4 bg-[#F5F8F6] hover:bg-[#E8F5EE] border border-[#E3ECE7] text-[#063B2A] text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer font-malayalam active:scale-98"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#0B8F68]" />
                <span>ഈ ഉൽപ്പന്നത്തെക്കുറിച്ച് കടയോട് ചോദിക്കുക (Chat)</span>
              </button>
            )}
          </div>

          {/* 3 Value Features Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0F4F2] text-center">
            <div className="p-2.5 bg-[#F5F8F6] rounded-2xl flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#17221D] font-sans">
                100% fresh
              </span>
            </div>

            <div className="p-2.5 bg-[#F5F8F6] rounded-2xl flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#17221D] font-sans">
                Local farm
              </span>
            </div>

            <div className="p-2.5 bg-[#F5F8F6] rounded-2xl flex flex-col items-center justify-center space-y-1">
              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-[#17221D] font-sans">
                No chemicals
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
