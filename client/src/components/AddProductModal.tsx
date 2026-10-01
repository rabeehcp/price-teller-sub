import React, { useState, useRef } from 'react';
import { Category, Product, Shop } from '../types';
import { createProductApi, uploadProductImageApi, fetchRemoteImageApi, getAuthToken } from '../services/api';
import { compressProductImage, CompressionResult } from '../utils/imageCompressor';
import { ProductImage } from './ProductImage';
import {
  X,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Camera,
  Link,
  Image as ImageIcon,
  Zap,
  Trash2,
  Layers,
} from 'lucide-react';

interface AddProductModalProps {
  categories: Category[];
  shops: Shop[];
  onClose: () => void;
  onProductCreated: (newProduct: Product, andAddToBasket: boolean) => void;
  initialCategoryId?: string;
  token?: string;
  shopName?: string;
}

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

const CATEGORY_CONFIG: Record<
  string,
  {
    emojis: string[];
    defaultUnit: string;
    placeholder: string;
    defaultPrice: string;
    sampleBadge: string;
    photoPresets: { name: string; image: string; emoji: string }[];
  }
> = {
  vegetables: {
    emojis: ['🥬', '🥦', '🥕', '🥔', '🧅', '🍅', '🥒', '🧄', '🫑', '🌽', '🍆', '🌶️'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Country Tomato, Big Onion, Fresh Spinach...',
    defaultPrice: '45',
    sampleBadge: 'Daily Fresh',
    photoPresets: [],
  },
  fruits: {
    emojis: ['🍎', '🍌', '🥭', '🍉', '🍇', '🥑', '🥥', '🍊', '🍍', '🍓', '🍑', '🍋'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Robusta Banana, Kashmiri Apple, Alphonso Mango...',
    defaultPrice: '80',
    sampleBadge: 'Farm Fresh',
    photoPresets: [],
  },
  meats: {
    emojis: ['🍗', '🥩', '🍖', '🐔', '🥓', '🦃'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Fresh Broiler Chicken, Tender Beef Cut, Goat Mutton...',
    defaultPrice: '180',
    sampleBadge: 'Fresh Cut',
    photoPresets: [],
  },
  fish: {
    emojis: ['🐟', '🦐', '🦀', '🦑', '🐠'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Seer Fish (Neymeen), Fresh Tiger Prawns, Mathi / Sardine...',
    defaultPrice: '260',
    sampleBadge: 'Catch of Day',
    photoPresets: [],
  },
  dairy: {
    emojis: ['🥛', '🧀', '🥚', '🧈', '🍦', '🍶'],
    defaultUnit: '1 L',
    placeholder: 'e.g. Fresh Cow Milk, Malabar Curd, Country Chicken Eggs...',
    defaultPrice: '56',
    sampleBadge: 'Daily Fresh',
    photoPresets: [],
  },
  staples: {
    emojis: ['🍚', '🌾', '🫘', '🌽', '🥣', '🥜', '🌰'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Matta Rice, Whole Wheat Chakki Atta, Toor Dal...',
    defaultPrice: '62',
    sampleBadge: 'Premium Grade',
    photoPresets: [],
  },
  'oils-spices': {
    emojis: ['🫗', '🧂', '🌶️', '🌿', '🌱', '🧄', '🫚'],
    defaultUnit: '1 L',
    placeholder: 'e.g. Pure Coconut Oil, Wayanad Black Pepper, Turmeric Powder...',
    defaultPrice: '190',
    sampleBadge: '100% Pure',
    photoPresets: [],
  },
  'bakery-breakfast': {
    emojis: ['🍞', '🥐', '🥖', '🥯', '☕', '🍪', '🥞', '🧇'],
    defaultUnit: '1 pack',
    placeholder: 'e.g. Whole Wheat Bread, Butter Rusks, Kerala Tea Dust...',
    defaultPrice: '45',
    sampleBadge: 'Freshly Baked',
    photoPresets: [],
  },
  electronics: {
    emojis: ['🔌', '⚡', '🫖', '⚖️', '💡', '🔋', '📱'],
    defaultUnit: '1 unit',
    placeholder: 'e.g. 750W Mixer Grinder, Induction Cooktop, Electric Kettle...',
    defaultPrice: '1499',
    sampleBadge: '1 Yr Warranty',
    photoPresets: [],
  },
  utensils: {
    emojis: ['🍲', '🍳', '🥘', '🔪', '🥣', '🥢', '🍴', '🥄'],
    defaultUnit: '1 unit',
    placeholder: 'e.g. 3L Stainless Pressure Cooker, Granite Dosa Tawa, Chef Knife...',
    defaultPrice: '750',
    sampleBadge: 'Food Grade',
    photoPresets: [],
  },
  'rice-grains': {
    emojis: ['🌾', '🍚', '🥣', '🌽', '🍞'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Matta Rice, Basmati Rice, Wheat Flour / Atta...',
    defaultPrice: '60',
    sampleBadge: 'Premium Grain',
    photoPresets: [],
  },
  'pulses-legumes': {
    emojis: ['🫘', '🫛', '🥜', '🌰', '🥣'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Toor Dal, Green Gram, Chickpeas, Urad Dal...',
    defaultPrice: '120',
    sampleBadge: 'Protein Rich',
    photoPresets: [],
  },
  spices: {
    emojis: ['🌶️', '🌿', '🌱', '🧄', '🫚', '🪵', '🌰'],
    defaultUnit: '500 g',
    placeholder: 'e.g. Chilli Powder, Wayanad Black Pepper, Cardamom...',
    defaultPrice: '150',
    sampleBadge: '100% Pure',
    photoPresets: [],
  },
  'oils-sugar': {
    emojis: ['🥥', '🫙', '🌻', '🫗', '🧂', '🪵'],
    defaultUnit: '1 L',
    placeholder: 'e.g. Pure Coconut Oil, Sunflower Oil, Sugar, Jaggery...',
    defaultPrice: '190',
    sampleBadge: 'Pure & Cold Pressed',
    photoPresets: [],
  },
  'sauces-condiments': {
    emojis: ['🥫', '🫙', '🍶', '🥣', '🍋', '🥭', '🫓'],
    defaultUnit: '400 g',
    placeholder: 'e.g. Tomato Ketchup, Cut Mango Pickle, Papad...',
    defaultPrice: '85',
    sampleBadge: 'Naadan Taste',
    photoPresets: [],
  },
  'biscuits-snacks': {
    emojis: ['🍪', '🍞', '🥨', '🍰', '🍌', '🍩', '🥐'],
    defaultUnit: '1 pack',
    placeholder: 'e.g. Marie Biscuits, Banana Chips, Milk Bread, Rusk...',
    defaultPrice: '45',
    sampleBadge: 'Fresh Crunch',
    photoPresets: [],
  },
  beverages: {
    emojis: ['☕', '🍵', '🥛', '⚡', '🧃', '🥤', '💧'],
    defaultUnit: '500 g',
    placeholder: 'e.g. Strong Dust Tea, Wayanad Filter Coffee, Boost...',
    defaultPrice: '140',
    sampleBadge: 'Strong Aroma',
    photoPresets: [],
  },
  'cleaning-household': {
    emojis: ['🧹', '🧼', '🧴', '🧽', '🪣', '🧻', '🗑️'],
    defaultUnit: '1 L',
    placeholder: 'e.g. Dishwash Liquid, Detergent, Floor Cleaner, Broom...',
    defaultPrice: '120',
    sampleBadge: 'Germ Protection',
    photoPresets: [],
  },
  'storage-containers': {
    emojis: ['🧴', '📦', '🥫', '🍶', '🏺', '🍱', '🪣'],
    defaultUnit: '1 unit',
    placeholder: 'e.g. Steel Storage Jar, Fridge Bottle, Insulated Lunch Box...',
    defaultPrice: '250',
    sampleBadge: 'Airtight BPA Free',
    photoPresets: [],
  },
  'baby-family': {
    emojis: ['🍼', '👶', '🧻', '🥣', '🧴'],
    defaultUnit: '1 pack',
    placeholder: 'e.g. Comfort Diaper Pants, Baby Wipes, Feeding Bottle...',
    defaultPrice: '399',
    sampleBadge: 'Gentle Care',
    photoPresets: [],
  },
  'personal-care': {
    emojis: ['🧼', '🧴', '🪥', '🪒', '✨', '💆'],
    defaultUnit: '1 unit',
    placeholder: 'e.g. Anti-Dandruff Shampoo, Herbal Toothpaste, Hair Oil...',
    defaultPrice: '160',
    sampleBadge: 'Herbal Care',
    photoPresets: [],
  },
  organic: {
    emojis: ['🌿', '🌱', '🥑', '🥬', '🍎', '🥕', '🥥', '🍯'],
    defaultUnit: '1 kg',
    placeholder: 'e.g. Certified Organic Honey, Pesticide-Free Greens, Organic Ghee...',
    defaultPrice: '140',
    sampleBadge: '100% Organic',
    photoPresets: [],
  },
};

export const AddProductModal: React.FC<AddProductModalProps> = ({
  categories,
  shops,
  onClose,
  onProductCreated,
  initialCategoryId,
  token,
  shopName,
}) => {
  const effectiveToken = token || getAuthToken() || undefined;
  const effectiveShopName = shopName || (() => {
    try {
      const uStr = sessionStorage.getItem('priceteller_auth_user') || localStorage.getItem('priceteller_auth_user');
      if (uStr) {
        const u = JSON.parse(uStr);
        return u.shopName || undefined;
      }
    } catch {}
    return undefined;
  })();

  const validCategories = categories.filter((c) => c.id !== 'all');
  const startingCatId =
    initialCategoryId && initialCategoryId !== 'all'
      ? initialCategoryId
      : validCategories[0]?.id || 'vegetables';

  const [categoryId, setCategoryId] = useState(startingCatId);
  const initialConf = CATEGORY_CONFIG[startingCatId] || CATEGORY_CONFIG.vegetables;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(initialConf.emojis[0] || '🥬');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoSourceMode, setPhotoSourceMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [defaultUnit, setDefaultUnit] = useState(initialConf.defaultUnit || '1 kg');
  const [basePrice, setBasePrice] = useState(initialConf.defaultPrice || '60');
  const [isOrganic, setIsOrganic] = useState(startingCatId === 'organic');
  const [badge, setBadge] = useState(initialConf.sampleBadge || '');
  const [nutritionalNote, setNutritionalNote] = useState('');
  const [addToBasketImmediately, setAddToBasketImmediately] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When user selects a category, automatically align presets
  const handleCategorySelect = (selectedId: string) => {
    setCategoryId(selectedId);
    const conf = CATEGORY_CONFIG[selectedId] || CATEGORY_CONFIG.vegetables;
    setEmoji(conf.emojis[0]);
    setDefaultUnit(conf.defaultUnit);
    setBasePrice(conf.defaultPrice);
    setBadge(conf.sampleBadge);
    if (selectedId === 'organic') setIsOrganic(true);
  };

  const currentConf = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG.vegetables;

  // Process and compress image file
  const processImageFile = async (file: File) => {
    setIsCompressing(true);
    setErrorMsg('');
    try {
      const res = await compressProductImage(file, 256, 0.82);
      setCompressionInfo(res);
      setImageUrl(res.dataUrl);
      setPhotoSourceMode('upload');
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setErrorMsg('Failed to process image file. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle image file selection (Camera / File picker)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  // Helper to sanitize any duplicated or concatenated URL (e.g. from rapid double-paste or browser extensions)
  const cleanPastedUrl = (raw: string): string => {
    if (!raw) return '';
    let str = raw.trim();
    const doubleMatch = str.match(/(https?:\/\/[^\s]+?)(?:https?:\/\/|$)/i);
    if (doubleMatch && doubleMatch[1]) {
      str = doubleMatch[1].trim();
    }
    return str;
  };

  // Apply image URL directly from source or remote link (Pinterest, Unsplash, Google, Wikimedia, etc.)
  const applyImageUrl = (urlToApply: string) => {
    const cleaned = cleanPastedUrl(urlToApply);
    if (!cleaned) {
      setUrlStatus('idle');
      setImageUrl(null);
      setCustomUrlInput('');
      return;
    }
    setCustomUrlInput(cleaned);
    setImageUrl(cleaned);
    setUrlStatus('success');
    setErrorMsg('');
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput) {
      applyImageUrl(customUrlInput);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = cleanPastedUrl(text);
        setCustomUrlInput(cleaned);
        applyImageUrl(cleaned);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  // Global paste listener (Ctrl+V) anywhere inside the modal
  const handleModalPaste = async (e: React.ClipboardEvent) => {
    const isInput =
      (e.target as HTMLElement)?.tagName === 'INPUT' ||
      (e.target as HTMLElement)?.tagName === 'TEXTAREA';

    // 1. Check if clipboard contains an image file (e.g. copied image data / screenshot)
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            await processImageFile(file);
            return;
          }
        }
      }
    }

    // 2. If user is currently typing/pasting inside an input or textarea, let the native input handle it!
    if (isInput) {
      return;
    }

    // 3. If pasting outside of inputs and clipboard text is a URL:
    const pastedText = e.clipboardData?.getData('text');
    if (pastedText) {
      const cleaned = cleanPastedUrl(pastedText);
      if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:image/')) {
        setCustomUrlInput(cleaned);
        setPhotoSourceMode('url');
        applyImageUrl(cleaned);
      }
    }
  };

  const handleSelectPreset = (preset: { name: string; image: string; emoji: string }) => {
    setImageUrl(preset.image);
    setEmoji(preset.emoji);
    setCompressionInfo(null);
    setUrlStatus('success');
    if (!name.trim()) {
      setName(preset.name);
    }
  };

  const handleClearImage = () => {
    setImageUrl(null);
    setCustomUrlInput('');
    setUrlStatus('idle');
    setCompressionInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a product name');
      return;
    }
    const numBase = Number(basePrice);
    if (isNaN(numBase) || numBase <= 0) {
      setErrorMsg('Please enter a valid base price');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    let finalImageUrl: string | undefined = undefined;
    if (photoSourceMode === 'url' && customUrlInput.trim()) {
      finalImageUrl = cleanPastedUrl(customUrlInput.trim());
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    // If no custom image was selected, auto-match from category photo presets based on name
    if (!finalImageUrl && name.trim() && (currentConf.photoPresets || []).length > 0) {
      const match = (currentConf.photoPresets || []).find((p) =>
        name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(name.toLowerCase())
      );
      if (match && match.image && !match.image.startsWith('/products/')) {
        finalImageUrl = match.image;
      }
    }

    // If the image is a base64 Data URL (from photo upload), upload it to server
    if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
      try {
        const uploadedUrl = await uploadProductImageApi(finalImageUrl, effectiveToken);
        finalImageUrl = uploadedUrl;
      } catch (uploadErr) {
        console.warn('Backend image upload failed, falling back to embedded data URL:', uploadErr);
        // If upload endpoint has an issue, data URL fallback still renders cleanly
      }
    }

    // Generate realistic per-shop pricing around base price
    const shopPrices: Record<string, number> = {};
    const stockStatus: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};

    shops.forEach((shop, idx) => {
      const variance = idx === 2 ? -0.05 : idx === 1 ? -0.02 : idx === 3 ? 0.08 : 0;
      shopPrices[shop.name] = Math.round(numBase * (1 + variance));
      stockStatus[shop.name] = 'in_stock';
    });

    if (effectiveShopName) {
      shopPrices[effectiveShopName] = numBase;
      stockStatus[effectiveShopName] = 'in_stock';
    }

    // Generate unit multipliers
    let availableUnits = [defaultUnit];
    let unitMultiplier: Record<string, number> = { [defaultUnit]: 1 };

    if (defaultUnit === '1 kg') {
      availableUnits = ['500 g', '1 kg', '2 kg'];
      unitMultiplier = { '500 g': 0.5, '1 kg': 1, '2 kg': 2 };
    } else if (defaultUnit === '1 L') {
      availableUnits = ['500 ml', '1 L', '2 L'];
      unitMultiplier = { '500 ml': 0.5, '1 L': 1, '2 L': 2 };
    } else if (defaultUnit === '500 g') {
      availableUnits = ['250 g', '500 g', '1 kg'];
      unitMultiplier = { '250 g': 0.55, '500 g': 1, '1 kg': 1.95 };
    } else if (defaultUnit === '1 unit' || defaultUnit === '1 set' || defaultUnit === '1 pack') {
      availableUnits = [defaultUnit];
      unitMultiplier = { [defaultUnit]: 1 };
    }

    try {
      const created = await createProductApi({
        name: name.trim(),
        categoryId,
        emoji,
        image: finalImageUrl,
        defaultUnit,
        availableUnits,
        unitMultiplier,
        isOrganic,
        badge: badge.trim() || (isOrganic ? '100% Organic' : undefined),
        nutritionalNote: nutritionalNote.trim() || undefined,
        prices: shopPrices,
        stockStatus,
      }, effectiveToken);

      onProductCreated(created, addToBasketImmediately);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onPaste={handleModalPaste}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-gray-100 relative max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-dark leading-tight">
                Add New Product
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                Add custom products with zero-storage-bloat photos & live price comparison
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto my-3 pr-1 flex-1">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CATEGORY SELECTION */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 flex items-center justify-between">
              <span>Step 1: Select Product Category *</span>
              <span className="text-[11px] font-bold text-brand-600 capitalize bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {validCategories.find((c) => c.id === categoryId)?.name || categoryId}
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-2xl max-h-32 overflow-y-auto">
              {validCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategorySelect(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{c.icon}</span>
                    <span className="truncate text-[11px]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PRODUCT PHOTO OPTION (Ultra-lightweight WebP / Zero Storage Bloat) */}
          <div className="bg-[#f8faf7] border border-brand-200/80 rounded-2xl p-3 sm:p-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-dark flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  <span>Product Photo</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300/60">
                  ⚡ Storage-Saver WebP
                </span>
              </div>

              {/* Photo Mode Tabs */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoSourceMode('upload')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    photoSourceMode === 'upload'
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Upload / Camera
                </button>
                {(currentConf.photoPresets || []).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhotoSourceMode('preset')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      photoSourceMode === 'preset'
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" />
                    Presets
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPhotoSourceMode('url')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    photoSourceMode === 'url'
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Link className="w-3 h-3 inline mr-1" />
                  Web URL
                </button>
              </div>
            </div>

            {/* Mode 1: Upload / Take Photo */}
            {photoSourceMode === 'upload' && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-photo-upload"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 hover:border-brand-500 bg-white rounded-xl p-3.5 text-center cursor-pointer transition-all hover:bg-brand-50/30 group"
                >
                  {isCompressing ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                      <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-brand-700">
                        Compressing photo to ultra-light WebP...
                      </span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={imageUrl}
                          alt="Product preview"
                          className="w-12 h-12 object-contain bg-gray-50 rounded-lg border border-gray-200 p-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-black text-slate-dark flex items-center gap-1">
                            <span>Photo Ready</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          {compressionInfo ? (
                            <div className="text-[10px] text-emerald-700 font-bold">
                              Compressed: {compressionInfo.originalSizeKB} KB ➔ {compressionInfo.compressedSizeKB} KB ({compressionInfo.savingsPercentage}% space saved!)
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-500">Tap to replace photo or paste image (Ctrl+V)</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearImage();
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-dark">
                        Take photo, upload file, or paste image (Ctrl+V)
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Auto-compressed to ~10KB WebP (Zero storage limit impact)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Realistic Photo Presets */}
            {photoSourceMode === 'preset' && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Pick a realistic photo for {validCategories.find((c) => c.id === categoryId)?.name}:
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 bg-white border border-gray-200 rounded-xl">
                  {(currentConf.photoPresets || []).map((preset, idx) => {
                    const isSelected = imageUrl === preset.image;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-500/20 shadow-2xs'
                            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={preset.image}
                          alt={preset.name}
                          className="w-8 h-8 object-contain mb-1"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] font-bold text-slate-dark line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 3: Image Web URL */}
            {photoSourceMode === 'url' && (
              <div className="space-y-2.5">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cleaned = cleanPastedUrl(val);
                        setCustomUrlInput(cleaned);
                        if (cleaned.length > 8 && !cleaned.includes(' ')) {
                          applyImageUrl(cleaned);
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted) {
                          const cleaned = cleanPastedUrl(pasted);
                          if (cleaned) {
                            e.preventDefault();
                            setCustomUrlInput(cleaned);
                            applyImageUrl(cleaned);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCustomUrl();
                        }
                      }}
                      placeholder="Paste Pinterest / Web image URL (e.g. https://pin.it/...)"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-500 font-medium"
                    />
                    {customUrlInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomUrlInput('');
                          setUrlStatus('idle');
                          setImageUrl(null);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {/* Live Image URL Preview Card */}
                {customUrlInput.trim() ? (
                  <div className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-0.5 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {urlStatus === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ProductImage
                            image={imageUrl || cleanPastedUrl(customUrlInput)}
                            emoji={emoji}
                            alt="URL preview"
                            className="w-full h-full"
                            imgClassName="w-full h-full object-contain"
                            fallbackEmojiClassName="text-xl"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        {urlStatus === 'loading' && (
                          <div>
                            <span className="text-[11px] font-bold text-brand-600 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                              Connecting Image Link...
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              Resolving high-res image from link
                            </span>
                          </div>
                        )}
                        {urlStatus === 'success' && (
                          <div>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Image URL Connected
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              Loads directly from source URL
                            </span>
                          </div>
                        )}
                        {urlStatus === 'error' && (
                          <div>
                            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Could not load direct URL
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              Right-click image in Chrome, select <b>Copy Image</b>, and press <kbd className="px-1 py-0.2 bg-gray-100 border rounded text-[9px] font-mono">Ctrl+V</kbd> here.
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-gray-400 truncate block max-w-xs mt-0.5">
                          {cleanPastedUrl(customUrlInput)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="Clear URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-2.5 text-center flex items-center justify-center gap-1.5">
                    <span>💡 <b>Tip:</b> Paste any image URL from Pinterest, Chrome, or Wikipedia, or press <kbd className="px-1 py-0.2 bg-gray-100 border rounded font-mono text-[10px]">Ctrl+V</kbd> to paste directly.</span>
                  </div>
                )}
              </div>
            )}

            {/* Fallback Emoji Selection */}
            <div className="pt-2 border-t border-brand-200/60 flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-gray-600">
                <span>Fallback Icon: </span>
                <span className="text-base">{emoji}</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {currentConf.emojis.slice(0, 8).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer border ${
                      emoji === em
                        ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                        : 'bg-white border-gray-200 hover:bg-gray-100 text-slate-dark'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: PRODUCT NAMES (MALAYALAM & ENGLISH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Malayalam Name / Main Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={currentConf.placeholder}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-500 focus:bg-white rounded-xl text-xs sm:text-sm font-bold text-slate-dark outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                English Name / Reference <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={nutritionalNote}
                onChange={(e) => setNutritionalNote(e.target.value)}
                placeholder="e.g. Apple, Kashmiri Chilli, Tomato..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-brand-500 focus:bg-white rounded-xl text-xs sm:text-sm font-medium text-slate-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* STEP 4: UNIT & BENCHMARK PRICE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Default Unit</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-dark outline-none focus:border-brand-500 cursor-pointer"
              >
                {Array.from(new Set([defaultUnit, currentConf.defaultUnit, ...STANDARD_UNITS]))
                  .filter(Boolean)
                  .map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Selling / Benchmark Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-500 focus:bg-white rounded-xl text-xs font-bold text-slate-dark outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: BADGES */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Product Badge <span className="text-gray-400 font-normal">(optional highlight)</span>
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. 100% Pure, Daily Fresh, ISI Certified..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
            />
          </div>

          {/* Live Preview Strip */}
          <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 shrink-0 p-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                <ProductImage
                  image={imageUrl || undefined}
                  emoji={emoji}
                  alt={name || 'Preview'}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-contain"
                  fallbackEmojiClassName="text-xl"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-dark truncate">
                  {name || 'Product Malayalam Name'}
                </div>
                <div className="text-[10px] text-gray-500 font-semibold truncate">
                  {nutritionalNote ? <span className="text-brand-700 font-bold">{nutritionalNote} • </span> : ''}
                  {defaultUnit} · ₹{basePrice || '0'} benchmark
                </div>
              </div>
            </div>
            {badge && (
              <span className="text-[10px] font-black bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full shrink-0">
                {badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
              />
              <span>🌿 100% Certified Organic / Pesticide-Free</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>
                  Publish Product to {validCategories.find((c) => c.id === categoryId)?.name || 'Category'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
