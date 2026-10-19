import React, { useState, useRef, useMemo } from 'react';
import { Category, Product, Shop } from '../types';
import { updateProductApi, uploadProductImageApi } from '../services/api';
import { ProductImage } from './ProductImage';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Trash2,
  DollarSign,
  Store,
  Check,
  Percent,
} from 'lucide-react';

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  shops?: Shop[];
  onClose: () => void;
  onProductUpdated: (updated: Product) => void;
}

const COMMON_EMOJIS = [
  '🍎', '🍌', '🍊', '🥭', '🍇', '🍉', '🍍', '🍓', '🥑', '🥥', '🥝', '🍒', '🍑', '🫐',
  '🥬', '🥦', '🥕', '🥔', '🧅', '🍅', '🥒', '🧄', '🫑', '🌽', '🍆', '🌶️',
  '🍗', '🥩', '🍖', '🐔', '🐟', '🦐', '🦀', '🥛', '🧀', '🥚', '🧈', '🍚', '🌾', '🫘',
  '🍞', '☕', '🍪', '🍫', '🥨', '🍿', '🍬', '🧁', '🍯', '🫗', '🌿', '📦',
];

const STANDARD_UNITS = [
  '1 kg',
  '500 g',
  '250 g',
  '100 g',
  '50 g',
  '2 kg',
  '5 kg',
  '10 kg',
  '1 L',
  '500 ml',
  '200 ml',
  '100 ml',
  '2 L',
  '5 L',
  '1 unit',
  '1 piece',
  '1 pack',
  '1 bunch',
  '6 pcs',
  '10 pcs',
  '12 pcs',
  '1 dozen',
  '30 pcs tray',
  '1 set',
  '1 box',
  '1 bottle',
  '1 jar',
  '1 can',
  '1 pair',
  '1 bag',
  '1 roll',
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  categories,
  shops = [],
  onClose,
  onProductUpdated,
}) => {
  const [name, setName] = useState(product.name || '');
  const [nutritionalNote, setNutritionalNote] = useState(product.nutritionalNote || '');
  const [categoryId, setCategoryId] = useState(product.categoryId || 'fruits');
  const [emoji, setEmoji] = useState(product.emoji || '🍎');
  const [imageUrl, setImageUrl] = useState<string>(product.image || '');
  const [defaultUnit, setDefaultUnit] = useState(product.defaultUnit || '1 kg');
  const [badge, setBadge] = useState(product.badge || '');
  const [isOrganic, setIsOrganic] = useState(!!product.isOrganic);
  const [isSeasonal, setIsSeasonal] = useState(!!product.isSeasonal);

  // Store Pricing & Stock States: Only display active stores from current shops list
  const allShopNames = useMemo(() => {
    if (shops && shops.length > 0) {
      return Array.from(new Set(shops.map((s) => s.name).filter(Boolean)));
    }
    return Array.from(
      new Set(
        Object.keys(product.prices || {}).filter((k) => k && k !== 'Master Catalog')
      )
    );
  }, [shops, product.prices]);

  const initialCommonPrice = (() => {
    const vals = Object.values(product.prices || {}).filter((v) => typeof v === 'number' && v > 0);
    return vals.length > 0 ? String(vals[0]) : '50';
  })();

  const [universalPrice, setUniversalPrice] = useState<string>(initialCommonPrice);

  const [storePrices, setStorePrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    const curr = product.prices || {};
    const fallback = initialCommonPrice;
    for (const s of allShopNames) {
      init[s] = curr[s] !== undefined ? String(curr[s]) : fallback;
    }
    return init;
  });

  const [storeStock, setStoreStock] = useState<Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'>>(() => {
    const init: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
    for (const s of allShopNames) {
      init[s] = product.stockStatus?.[s] || 'in_stock';
    }
    return init;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const validCategories = categories.filter((c) => c.id !== 'all');

  const handleApplyUniversalPrice = () => {
    const val = universalPrice.trim();
    if (!val) return;
    setStorePrices((prev) => {
      const next = { ...prev };
      for (const s of allShopNames) {
        next[s] = val;
      }
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const uploadedUrl = await uploadProductImageApi(base64);
          setImageUrl(uploadedUrl);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to upload photo');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing file');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name in Malayalam or English is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      // Build clean final prices map (only for active stores)
      const finalPrices: Record<string, number> = {};
      for (const s of allShopNames) {
        const pStr = storePrices[s];
        const pNum = parseFloat(pStr);
        if (!isNaN(pNum) && pNum > 0) {
          finalPrices[s] = pNum;
        }
      }
      if (Object.keys(finalPrices).length === 0) {
        const uNum = parseFloat(universalPrice) || 50;
        for (const s of allShopNames) {
          finalPrices[s] = uNum;
        }
      }

      const cleanStock: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
      for (const s of allShopNames) {
        cleanStock[s] = storeStock[s] || 'in_stock';
      }

      const updates: Partial<Product> = {
        name: name.trim(),
        nutritionalNote: nutritionalNote.trim() || undefined,
        categoryId,
        emoji,
        image: imageUrl.trim() || undefined,
        defaultUnit,
        badge: badge.trim() || undefined,
        isOrganic,
        isSeasonal,
        prices: finalPrices,
        stockStatus: cleanStock,
      };

      const updated = await updateProductApi(product.id, updates);
      setSuccessMsg('Product details and live store prices updated successfully!');
      onProductUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white sm:rounded-3xl w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-2xl flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xl">
              ✏️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
                Edit Product & Live Prices
              </h2>
              <p className="text-xs text-gray-400 font-medium m-0">
                Update store selling prices, image, title & catalog details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Product Live Preview Card */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50 to-emerald-50/40 border border-gray-200 rounded-2xl flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center p-1.5 shadow-xs">
              <ProductImage
                productId={product.id}
                image={imageUrl}
                emoji={emoji}
                alt={name || 'Preview'}
                className="w-full h-full"
                imgClassName="w-full h-full object-contain"
                fallbackEmojiClassName="text-3xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live Preview
                </span>
                {badge && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                    {badge}
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base truncate m-0">
                {name || 'Product Title'}
              </h4>
              <p className="text-xs text-gray-500 font-medium truncate m-0">
                Category: <span className="capitalize font-bold text-gray-700">{categoryId}</span> • Unit: {defaultUnit}
              </p>
            </div>
          </div>

          {/* 1. STORE PRICING SECTION */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 m-0 uppercase tracking-wider">
                    Store Selling Prices
                  </h3>
                  <p className="text-[11px] text-gray-500 m-0">
                    Set price for all stores or customize per shop
                  </p>
                </div>
              </div>

              {/* Quick Set Price for All Stores */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={universalPrice}
                    onChange={(e) => setUniversalPrice(e.target.value)}
                    placeholder="Rate"
                    className="w-20 pl-6 pr-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUniversalPrice}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Apply this price to all shops below"
                >
                  ⚡ Set All Stores
                </button>
              </div>
            </div>

            {/* Store Rows */}
            <div className="space-y-2 pt-1">
              {allShopNames.map((shopName) => {
                const currentVal = storePrices[shopName] || '';
                const currentStock = storeStock[shopName] || 'in_stock';

                return (
                  <div
                    key={shopName}
                    className="flex items-center justify-between gap-3 p-2.5 bg-white border border-emerald-100 rounded-xl shadow-2xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-xs text-slate-800 truncate">
                        {shopName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Price Input */}
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-xs font-black text-gray-400">₹</span>
                        <input
                          type="number"
                          step="any"
                          value={currentVal}
                          onChange={(e) =>
                            setStorePrices((prev) => ({ ...prev, [shopName]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-20 pl-5 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-emerald-500 focus:bg-white text-right"
                        />
                      </div>

                      {/* Stock Status Selector */}
                      <select
                        value={currentStock}
                        onChange={(e) =>
                          setStoreStock((prev) => ({
                            ...prev,
                            [shopName]: e.target.value as any,
                          }))
                        }
                        className={`text-[11px] font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer ${
                          currentStock === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : currentStock === 'low_stock'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. NAMES ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Malayalam Name / Main Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ആപ്പിൾ, വാഴപ്പഴം..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                English Name / Reference
              </label>
              <input
                type="text"
                value={nutritionalNote}
                onChange={(e) => setNutritionalNote(e.target.value)}
                placeholder="e.g. Apple, Banana, Orange..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3. IMAGE URL & UPLOAD */}
          <div className="space-y-2 bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-extrabold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                Product Image (Direct Web URL or Photo Upload)
              </span>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove Image
                </button>
              )}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ik.imagekit.io/... or paste web image link"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>

          {/* 4. CATEGORY, UNIT & BADGE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white"
              >
                {validCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '📦'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Unit</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white"
              >
                {STANDARD_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Offer Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. 15% OFF, Special Price"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 5. EMOJI FALLBACK PICKER */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Emoji Fallback: <span className="text-base ml-1">{emoji}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-2xl max-h-24 overflow-y-auto">
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    emoji === em ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 6. ORGANIC & SEASONAL */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>🌿 Organic Produce</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeasonal}
                onChange={(e) => setIsSeasonal(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>☀️ Seasonal Item</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Product & Prices'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
