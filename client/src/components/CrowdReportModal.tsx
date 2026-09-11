import React, { useState } from 'react';
import { Product, Shop } from '../types';
import { submitPriceReport } from '../services/api';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface CrowdReportModalProps {
  product: Product | null;
  shops: Shop[];
  onClose: () => void;
  onSuccess: (updatedProduct: Product) => void;
}

export const CrowdReportModal: React.FC<CrowdReportModalProps> = ({
  product,
  shops,
  onClose,
  onSuccess,
}) => {
  const [selectedShopName, setSelectedShopName] = useState<string>(shops[0]?.name || 'Green Mart');
  const [newPrice, setNewPrice] = useState<string>('');
  const [unit, setUnit] = useState<string>(product?.defaultUnit || '1 kg');
  const [reporterName, setReporterName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!product) return null;

  const currentShopPrice = product.prices[selectedShopName] || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || isNaN(Number(newPrice))) return;

    setIsSubmitting(true);
    try {
      await submitPriceReport({
        productId: product.id,
        productName: product.name,
        shopName: selectedShopName,
        reportedPrice: Number(newPrice),
        unit: unit || product.defaultUnit,
        reportedBy: reporterName.trim() || 'Verified Local Shopper',
      });

      const updated: Product = {
        ...product,
        prices: {
          ...product.prices,
          [selectedShopName]: Number(newPrice),
        },
      };

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit price report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-slate-900">വില വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു!</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              നാട്ടിലെ മറ്റ് ഉപഭോക്താക്കൾക്ക് കൃത്യമായ വില അറിയാൻ സഹായിച്ചതിന് നന്ദി. താരതമ്യത്തിൽ പുതിയ വില ഉടൻ ലഭ്യമാകും.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <div className="w-11 h-11 shrink-0 p-1 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <ProductImage
                  productId={product.id}
                  image={product.image}
                  emoji={product.emoji}
                  alt={product.name}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-contain"
                  fallbackEmojiClassName="text-2xl"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">വില തിരുത്തുക • Report Price</div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {product.name}
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  തദ്ദേശീയ ഉപഭോക്താക്കൾക്കായി വില രേഖപ്പെടുത്തൽ
                </span>
              </div>
            </div>

            <div className="bg-brand-50/80 border border-brand-200/80 rounded-2xl p-3 flex items-center gap-2 text-xs text-brand-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
              <span>{selectedShopName} കടയിലെ നിലവിലെ വില: <b>₹{currentShopPrice}</b> / {product.defaultUnit}</span>
            </div>

            {/* Shop Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                കട തിരഞ്ഞെടുക്കുക (Store / Market)
              </label>
              <select
                value={selectedShopName}
                onChange={(e) => setSelectedShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-brand-600 focus:bg-white transition-colors"
              >
                {shops.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name} ({s.address})
                  </option>
                ))}
              </select>
            </div>

            {/* New Price Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ശരിയായ പുതിയ വില (₹ per {product.defaultUnit})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={`ഉദാ: ${currentShopPrice - 5}`}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 rounded-xl text-sm font-black text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Reporter Name (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                നിങ്ങളുടെ പേര് <span className="font-normal text-gray-400">(ഓപ്ഷണൽ)</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="ഉദാ: രാഹുൽ കെ."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-brand-600 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>അപ്‌ഡേറ്റ് ചെയ്യുന്നു...</span>
              ) : (
                <>
                  <span>വില സ്ഥിരീകരിക്കുക</span>
                  <span className="text-[11px] opacity-80">(Update Price)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
