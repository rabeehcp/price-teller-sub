import React from 'react';
import { Shop, FullComparisonResponse } from '../types';
import { X, MapPin, Clock, Phone, Star, ShieldCheck, Navigation, MessageCircle, BookOpen } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface ShopDetailModalProps {
  shopName: string | null;
  shops: Shop[];
  comparison: FullComparisonResponse | null;
  onClose: () => void;
  onOpenChat?: (shopName: string) => void;
  onOpenShopCatalogue?: (shopName: string) => void;
}

export const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shopName,
  shops,
  comparison,
  onClose,
  onOpenChat,
  onOpenShopCatalogue,
}) => {
  if (!shopName) return null;

  const shop = shops.find((s) => s.name === shopName);
  const comparisonShop = comparison?.shops.find((s) => s.shopName === shopName);

  if (!shop) return null;

  const handleDirections = () => {
    const query = encodeURIComponent(`${shop.name}, ${shop.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Store Title & Badge */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-2xl shrink-0">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-dark leading-tight">{shop.name}</h3>
              {shop.isVerified && (
                <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{shop.rating}</span>
              <span className="text-gray-400 font-normal">({shop.reviewCount} local reviews)</span>
            </div>
          </div>
        </div>

        {/* Store Meta Details */}
        <div className="space-y-2.5 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-700 mb-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <b className="block text-slate-dark">{shop.address}</b>
              <div className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>📍 Hyperlocal Distance: <b className="text-slate-dark">{shop.distanceKm} km</b></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Open: <b>{shop.openingHours}</b></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-600 shrink-0" />
              <a href={`tel:${shop.phone ? shop.phone.replace(/[^0-9+]/g, '') : ''}`} className="text-brand-700 font-bold hover:underline">
                {shop.phone || 'No phone listed'}
              </a>
            </div>
            {shop.phone && (
              <a
                href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-malayalam"
                title={`${shop.name} ഫോൺ വിളിക്കുക`}
              >
                <Phone className="w-3 h-3 text-[#0B8F68]" />
                <span>വിളിക്കുക</span>
              </a>
            )}
          </div>
        </div>

        {/* Basket breakdown at this shop if basket is active */}
        {comparisonShop && comparisonShop.items.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-dark mb-2">
              <span>Basket Items at this Shop:</span>
              <span className="text-brand-700 font-black text-sm">
                {comparisonShop.isAllAvailable
                  ? `Total: ₹${comparisonShop.total}`
                  : `In-Stock Total: ₹${comparisonShop.availableTotal ?? comparisonShop.total}`}
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-2 bg-[#fcfdfa]">
              {comparisonShop.items.map((item, idx) => {
                const isOutOfStock = item.stockStatus === 'out_of_stock';
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-lg ${
                      isOutOfStock ? 'bg-rose-50/70 border border-rose-200/50' : ''
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 ${isOutOfStock ? 'text-rose-900 font-semibold line-through opacity-75' : 'text-gray-700'}`}>
                      <ProductImage
                        productId={item.productId}
                        emoji={item.emoji}
                        alt={item.productName}
                        className="w-4 h-4 shrink-0 relative"
                        imgClassName="w-4 h-4 object-contain"
                        fallbackEmojiClassName="text-xs"
                        isOutOfStock={isOutOfStock}
                        stampSize="xs"
                      />
                      <span>{item.productName} ({item.quantity} × {item.unit})</span>
                    </div>
                    <div className="text-right font-bold shrink-0">
                      {isOutOfStock ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded-md">
                          🔴 Out of Stock
                        </span>
                      ) : (
                        <span className="text-brand-700">₹{item.lineTotal}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 font-malayalam">
          {onOpenShopCatalogue && (
            <button
              onClick={() => {
                onClose();
                onOpenShopCatalogue(shop.name);
              }}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>കടയിലെ എല്ലാ ഉൽപ്പന്നങ്ങളും വിലകളും കാണുക</span>
            </button>
          )}

          <div className={`grid ${shop.phone ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            {shop.phone && (
              <a
                href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                className="py-2.5 px-2 bg-[#0B8F68] hover:bg-[#063B2A] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title={`${shop.name} ഫോൺ വിളിക്കുക`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>വിളിക്കുക</span>
              </a>
            )}

            <button
              onClick={handleDirections}
              className="py-2.5 px-2 bg-surface-subtle hover:bg-gray-200 text-slate-dark rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-600" />
              <span>വഴി കാണുക</span>
            </button>

            {onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(shop.name);
                }}
                className="py-2.5 px-2 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>ചാറ്റ്</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
