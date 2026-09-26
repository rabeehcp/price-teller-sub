import React, { useState } from 'react';
import { Category, Product } from '../types';
import { ProductImage } from './ProductImage';
import { relistMerchantProductApi } from '../services/api';
import {
  X,
  Search,
  Check,
  Plus,
  Sparkles,
  ShoppingBag,
  Store,
  CheckCircle2,
  PlusCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface MasterCatalogPickerModalProps {
  masterProducts: Product[];
  shopName: string;
  categories?: { id: string; name: string; icon?: string; itemCount?: number }[] | Category[];
  onClose: () => void;
  onProductAddedToShop: (productId: string, price: number) => void;
  onOpenCreateCustom?: () => void;
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  staples: ['staples', 'rice-grains', 'pulses-legumes'],
  'oils-spices': ['oils-spices', 'oils-sugar', 'spices'],
  household: ['household', 'cleaning-household', 'storage-containers', 'baby-family', 'personal-care'],
  'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'bread-bakery', 'snacks'],
  beverages: ['beverages', 'drinks', 'tea-coffee', 'juices'],
};

export const MasterCatalogPickerModal: React.FC<MasterCatalogPickerModalProps> = ({
  masterProducts,
  shopName,
  categories,
  onClose,
  onProductAddedToShop,
  onOpenCreateCustom,
}) => {
  const [localMasterProducts, setLocalMasterProducts] = useState<Product[]>(masterProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [pricesInput, setPricesInput] = useState<Record<string, string>>({});
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const [addedSuccessIds, setAddedSuccessIds] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'not_in_store'>('not_in_store');

  // Ensure the modal has the entire 2600+ Master Catalog
  React.useEffect(() => {
    if (masterProducts && masterProducts.length >= 2000) {
      setLocalMasterProducts(masterProducts);
    } else {
      relistMerchantProductApi; // keep import valid
      import('../services/api').then(({ fetchProducts }) => {
        fetchProducts({ includeMaster: true })
          .then((fullList) => {
            if (fullList && fullList.length > 0) {
              setLocalMasterProducts(fullList);
            }
          })
          .catch(console.error);
      });
    }
  }, [masterProducts]);

  const filteredProducts = localMasterProducts.filter((p) => {
    const isCarried = p.prices && p.prices[shopName] !== undefined && p.prices[shopName] > 0;
    if (filterMode === 'not_in_store' && isCarried) return false;

    if (selectedCat !== 'all') {
      const targetCats = CATEGORY_ALIASES[selectedCat] || [selectedCat];
      const matchCat = targetCats.includes(p.categoryId) || (selectedCat === 'organic' && p.isOrganic);
      if (!matchCat) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.categoryId.toLowerCase().includes(q);
      const matchNote = p.nutritionalNote?.toLowerCase().includes(q);
      const matchBadge = p.badge?.toLowerCase().includes(q);
      return matchName || matchCat || matchNote || matchBadge;
    }

    return true;
  });

  const handlePriceChange = (productId: string, val: string) => {
    setPricesInput((prev) => ({ ...prev, [productId]: val }));
  };

  const handleAddToStore = async (prod: Product) => {
    const rawVal = pricesInput[prod.id];
    let priceNum = rawVal ? parseFloat(rawVal) : NaN;
    if (isNaN(priceNum) || priceNum <= 0) {
      // Default fallback from Master Catalog price or existing values
      const masterSuggest = prod.prices ? (prod.prices['Master Catalog'] || Object.values(prod.prices)[0]) : undefined;
      priceNum = (typeof masterSuggest === 'number' && masterSuggest > 0) ? masterSuggest : 50;
    }

    setAddingIds((prev) => ({ ...prev, [prod.id]: true }));
    try {
      await relistMerchantProductApi(shopName, prod.id, priceNum);
      onProductAddedToShop(prod.id, priceNum);
      setLocalMasterProducts((prev) =>
        prev.map((item) =>
          item.id === prod.id
            ? {
                ...item,
                prices: { ...item.prices, [shopName]: priceNum },
                stockStatus: { ...item.stockStatus, [shopName]: 'in_stock' },
              }
            : item
        )
      );
      setAddedSuccessIds((prev) => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedSuccessIds((prev) => {
          const c = { ...prev };
          delete c[prod.id];
          return c;
        });
      }, 3000);
    } catch (err) {
      console.error('Failed to add product to store', err);
      alert('Failed to add product to store. Please try again.');
    } finally {
      setAddingIds((prev) => ({ ...prev, [prod.id]: false }));
    }
  };

  const notInStoreCount = masterProducts.filter(
    (p) => !p.prices || p.prices[shopName] === undefined || p.prices[shopName] <= 0
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl text-xl">
              📦
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white m-0">
                  Master Product Catalog Picker
                </h2>
                <span className="text-[11px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  {notInStoreCount} Available to Add
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">
                Adding items to <b className="text-white">{shopName}</b>. Enter your price and click to add instantly!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateCustom && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateCustom();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Product</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Ribbon */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fruits & items by Malayalam or English name (e.g. ആപ്പിൾ, Banana)..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500 shadow-2xs"
            />
          </div>

          {/* View Filter Pill Switcher */}
          <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterMode('not_in_store')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'not_in_store'
                  ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                  : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              ✨ Available to Add ({notInStoreCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                  : 'text-gray-600 hover:text-slate-900'
              }`}
            >
              All Master Items ({masterProducts.length})
            </button>
          </div>
        </div>

        {/* Categories Quick Filter Pills */}
        <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌟 All ({masterProducts.length})
          </button>
          <button
            onClick={() => setSelectedCat('fruits')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'fruits'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🍎 Fruits ({masterProducts.filter((p) => p.categoryId === 'fruits').length})
          </button>
          <button
            onClick={() => setSelectedCat('vegetables')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'vegetables'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🥬 Vegetables ({masterProducts.filter((p) => p.categoryId === 'vegetables').length})
          </button>
          <button
            onClick={() => setSelectedCat('staples')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'staples'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🍚 Staples ({masterProducts.filter((p) => p.categoryId === 'staples').length})
          </button>
          <button
            onClick={() => setSelectedCat('dairy')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'dairy'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🥛 Dairy ({masterProducts.filter((p) => p.categoryId === 'dairy').length})
          </button>
          <button
            onClick={() => setSelectedCat('organic')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'organic'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🌿 Organic ({masterProducts.filter((p) => p.isOrganic).length})
          </button>
        </div>

        {/* Product Cards Grid / List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-extrabold text-slate-800 text-base mb-1">
                No matching Master Products found
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                {filterMode === 'not_in_store'
                  ? 'All master products matching this filter are already added to your store inventory!'
                  : 'Try searching with a different fruit name or category.'}
              </p>
              {onOpenCreateCustom && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateCustom();
                  }}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Custom Product Manually</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
                const isCarried = p.prices && p.prices[shopName] !== undefined && p.prices[shopName] > 0;
                const currentPrice = isCarried ? p.prices[shopName] : undefined;
                const defaultSuggestPrice = p.prices ? (p.prices['Master Catalog'] || Object.values(p.prices)[0]) : undefined;
                const inputPrice = pricesInput[p.id] ?? (currentPrice ? String(currentPrice) : (defaultSuggestPrice ? String(defaultSuggestPrice) : ''));
                const isAdding = !!addingIds[p.id];
                const isSuccess = !!addedSuccessIds[p.id];

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      isCarried
                        ? 'bg-white border-emerald-200/80 shadow-2xs'
                        : 'bg-white border-gray-200 hover:border-brand-400 hover:shadow-xs'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 shrink-0 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-1">
                      <ProductImage
                        productId={p.id}
                        image={p.image}
                        emoji={p.emoji || '🍎'}
                        alt={p.name}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-contain"
                        fallbackEmojiClassName="text-2xl"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <b className="font-extrabold text-slate-900 text-sm truncate block">
                          {p.name}
                        </b>
                        {p.isOrganic && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                            🌿
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 font-medium truncate m-0">
                        {p.nutritionalNote ? `${p.nutritionalNote} • ` : ''}
                        <span className="capitalize">{p.categoryId}</span> ({p.defaultUnit})
                      </p>

                      {isCarried ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                          <Check className="w-3 h-3" /> In Store: ₹{currentPrice}/{p.defaultUnit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium inline-block mt-0.5">
                          Not listed in your store yet
                        </span>
                      )}
                    </div>

                    {/* Price Input & Add Button */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-gray-500">₹</span>
                        <input
                          type="number"
                          value={inputPrice}
                          onChange={(e) => handlePriceChange(p.id, e.target.value)}
                          placeholder="Price"
                          className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-brand-500 focus:bg-white text-right"
                        />
                      </div>

                      <button
                        onClick={() => handleAddToStore(p)}
                        disabled={isAdding}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          isSuccess
                            ? 'bg-emerald-600 text-white'
                            : isCarried
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                        }`}
                      >
                        {isSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : isCarried ? (
                          <span>Update ₹</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-medium">
            💡 Simply type your selling price and click <b className="text-slate-800">+ Add</b> to list any item immediately in your store!
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenCreateCustom && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateCustom();
                }}
                className="px-4 py-2 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                <span>Product Missing? Add Custom</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
