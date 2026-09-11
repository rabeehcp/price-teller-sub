import React, { useState, useRef } from 'react';
import { Category, Product } from '../types';
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
} from 'lucide-react';

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onProductUpdated: (updated: Product) => void;
}

const COMMON_EMOJIS = [
  '🍎', '🍌', '🍊', '🥭', '🍇', '🍉', '🍍', '🍓', '🥑', '🥥', '🥝', '🍒', '🍑', '🫐',
  '🥬', '🥦', '🥕', '🥔', '🧅', '🍅', '🥒', '🧄', '🫑', '🌽', '🍆', '🌶️',
  '🍗', '🥩', '🍖', '🐔', '🐟', '🦐', '🦀', '🥛', '🧀', '🥚', '🧈', '🍚', '🌾', '🫘',
  '🍞', '☕', '🍪', '🫗', '🌿', '🍯', '📦',
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

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const validCategories = categories.filter((c) => c.id !== 'all');

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
      };

      const updated = await updateProductApi(product.id, updates);
      setSuccessMsg('Master Product updated successfully!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-brand-500/20 text-brand-400 rounded-xl text-xl">
              ✏️
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white m-0">
                Edit Master Product
              </h2>
              <p className="text-xs text-gray-400 font-medium m-0">
                Update Malayalam name, English reference, image URL & catalog metadata
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
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
          <div className="p-4 bg-gradient-to-r from-gray-50 to-brand-50/40 border border-gray-200 rounded-2xl flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center p-1.5 shadow-xs">
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Live Preview
              </span>
              <h4 className="font-extrabold text-slate-800 text-base truncate m-0">
                {name || 'Product Malayalam Name'}
              </h4>
              <p className="text-xs text-gray-500 font-medium truncate m-0">
                {nutritionalNote ? `${nutritionalNote} • ` : ''}Category: <span className="capitalize font-bold text-gray-700">{categoryId}</span> • Unit: {defaultUnit}
              </p>
            </div>
          </div>

          {/* Names Row */}
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
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500 focus:bg-white transition-all"
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
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Direct Image URL & Upload Section */}
          <div className="space-y-2 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-extrabold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                Product Image (Direct Web URL or Photo Upload)
              </span>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear Image
                </button>
              )}
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    let str = e.target.value.trim();
                    const doubleMatch = str.match(/(https?:\/\/[^\s]+?)(?:https?:\/\/|$)/i);
                    if (doubleMatch && doubleMatch[1]) {
                      str = doubleMatch[1].trim();
                    }
                    setImageUrl(str);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted) {
                      let str = pasted.trim();
                      const doubleMatch = str.match(/(https?:\/\/[^\s]+?)(?:https?:\/\/|$)/i);
                      if (doubleMatch && doubleMatch[1]) {
                        str = doubleMatch[1].trim();
                        e.preventDefault();
                        setImageUrl(str);
                      }
                    }
                  }}
                  placeholder="https://pin.it/... or https://commons.wikimedia.org/..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-brand-500"
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
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 m-0">
              💡 Tip: Pinterest, Wikipedia, Wikimedia, and Unsplash URLs are automatically proxied and cached for fast, high-res loading.
            </p>
          </div>

          {/* Category, Emoji & Default Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none capitalize"
              >
                {validCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Unit</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
              >
                {Array.from(new Set([defaultUnit, product.defaultUnit, ...STANDARD_UNITS]))
                  .filter(Boolean)
                  .map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Farm Fresh, Seasonal"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
              />
            </div>
          </div>

          {/* Emoji Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Emoji Fallback: <span className="text-base ml-1">{emoji}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-2xl max-h-24 overflow-y-auto">
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    emoji === em ? 'bg-brand-500 text-white shadow-xs' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Organic & Seasonal Checkboxes */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-500"
              />
              <span>🌿 Organic Produce</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeasonal}
                onChange={(e) => setIsSeasonal(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded-sm focus:ring-brand-500"
              />
              <span>☀️ Seasonal Item</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
