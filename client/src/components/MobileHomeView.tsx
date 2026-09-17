import React, { useState, useMemo } from 'react';
import { Category, Product, Shop, Location, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import {
  Search,
  X,
  Heart,
  Plus,
  Minus,
  ChevronRight,
  TrendingDown,
  Store,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface MobileHomeViewProps {
  products: Product[];
  shops: Shop[];
  categories: Category[];
  currentLocation: Location | null;
  basket: BasketItem[];
  favorites: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  onAddToBasket: (product: Product, unit?: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onToggleFavorite: (product: Product) => void;
  onSelectProductForDetail: (product: Product) => void;
  onOpenLocationModal: () => void;
  onOpenShopCatalogue: (shopName: string) => void;
  onViewAllCategories?: () => void;
  onViewAllProducts?: () => void;
}

const CATEGORY_CONFIG = [
  { id: 'vegetables', label: 'പച്ചക്കറി', emoji: '🥬', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'fruits',     label: 'പഴങ്ങൾ',   emoji: '🍌', bg: 'bg-amber-50',   border: 'border-amber-100' },
  { id: 'rice-grains',label: 'അരി & ധാന്യം', emoji: '🌾', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { id: 'dairy',      label: 'പാൽ',       emoji: '🥛', bg: 'bg-sky-50',     border: 'border-sky-100' },
  { id: 'spices',     label: 'മസാലകൾ',   emoji: '🌶️', bg: 'bg-red-50',     border: 'border-red-100' },
  { id: 'grocery',    label: 'ഗ്രോസറി',  emoji: '🥫', bg: 'bg-orange-50',  border: 'border-orange-100' },
  { id: 'oils-spices',label: 'എണ്ണ',     emoji: '🫗', bg: 'bg-lime-50',    border: 'border-lime-100' },
  { id: 'all',        label: 'എല്ലാം',   emoji: '🛒', bg: 'bg-[#E8F5EE]', border: 'border-emerald-200' },
];

const TODAY_PRICES = [
  { name: 'തക്കാളി', emoji: '🍅', price: 28, unit: 'kg' },
  { name: 'സവാള',   emoji: '🧅', price: 35, unit: 'kg' },
  { name: 'ഉരുളക്കിഴങ്ങ്', emoji: '🥔', price: 32, unit: 'kg' },
  { name: 'പാൽ',    emoji: '🥛', price: 56, unit: 'ലി' },
  { name: 'എണ്ണ',   emoji: '🫗', price: 150, unit: 'ലി' },
];

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  products,
  shops,
  categories,
  currentLocation,
  basket,
  favorites,
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onSelectCategory,
  onAddToBasket,
  onQuantityChange,
  onToggleFavorite,
  onSelectProductForDetail,
  onOpenLocationModal,
  onOpenShopCatalogue,
  onViewAllCategories,
  onViewAllProducts,
}) => {

  // Filter products by selected category or search query
  const popularProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q))
      );
    } else if (selectedCategoryId && selectedCategoryId !== 'all') {
      const aliases: Record<string, string[]> = {
        vegetables: ['vegetables'],
        fruits: ['fruits'],
        staples: ['staples', 'rice-grains', 'pulses-legumes'],
        'oils-spices': ['oils-spices', 'oils-sugar', 'spices'],
        household: ['household', 'cleaning-household', 'storage-containers'],
        'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'beverages'],
      };
      const targetCats = aliases[selectedCategoryId] || [selectedCategoryId];
      filtered = products.filter((p) => targetCats.includes(p.categoryId));
    }

    const priorityNames = ['tomato', 'banana', 'onion', 'carrot', 'brinjal', 'beans', 'cabbage', 'chilli', 'potato', 'milk', 'rice'];
    return [...filtered].sort((a, b) => {
      const aIndex = priorityNames.findIndex((n) => a.name.toLowerCase().includes(n));
      const bIndex = priorityNames.findIndex((n) => b.name.toLowerCase().includes(n));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  }, [products, searchQuery, selectedCategoryId]);

  const currentCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="md:hidden space-y-3 font-sans pb-28 animate-in fade-in duration-200">

      {/* 1. SEARCH BAR */}
      <div>
        <div className="relative flex items-center bg-white border border-[#E3ECE7] rounded-full p-1 pl-4 shadow-sm">
          <Search className="w-4 h-4 text-[#8A9992] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="എന്താണ് തിരയുന്നത്?"
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-[#17221D] placeholder-[#8A9992] bg-transparent outline-none font-malayalam"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1.5 text-[#8A9992] hover:text-[#17221D] rounded-full cursor-pointer mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#063B2A] text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063B2A] via-[#084D37] to-[#0B8F68] text-white p-4 sm:p-5 shadow-md min-h-[155px] flex items-center justify-between">
        {/* Decorative glows */}
        <div className="absolute top-0 right-1/3 w-32 h-32 bg-[#10A978]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 left-0 w-24 h-24 bg-[#10A978]/15 rounded-full blur-xl pointer-events-none" />

        {/* Left Content */}
        <div className="relative z-10 max-w-[62%] space-y-2">
          <h2 className="text-base sm:text-lg font-black text-white leading-tight font-malayalam m-0">
            നാട്ടിലെ കടകളിൽ നിന്ന്<br />
            <span className="text-[#7FFFC4]">നിങ്ങളുടെ ആവശ്യങ്ങൾ മികച്ച വിലയിൽ</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-[#C0EDD9] font-medium leading-snug font-malayalam m-0">
            അടുത്തുള്ള കടകളിലെ വിലകൾ താരതമ്യം ചെയ്ത് നിങ്ങൾക്ക് അനുയോജ്യമായ വില കണ്ടെത്തൂ.
          </p>
        </div>

        {/* Right Glassmorphic Multi-Category Price Comparison Visual Card */}
        <div className="relative z-10 w-[130px] sm:w-[150px] shrink-0 font-malayalam">
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-2 sm:p-2.5 text-white shadow-xl space-y-1.5">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-white/20 pb-1">
              <span className="text-[9px] font-bold flex items-center gap-1">
                🏪 കടകൾ
              </span>
              <span className="text-[8px] font-black bg-[#34D399] text-[#063B2A] px-1.5 py-0.5 rounded-full uppercase">
                താരതമ്യം 📊
              </span>
            </div>

            {/* Live Product Comparisons */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] bg-black/25 px-1.5 py-1 rounded-lg">
                <span className="truncate">🫗 വെളിച്ചെണ്ണ</span>
                <span className="font-extrabold text-[#7FFFC4] shrink-0 font-sans">₹150</span>
              </div>
              <div className="flex items-center justify-between text-[9px] bg-black/25 px-1.5 py-1 rounded-lg">
                <span className="truncate">🌾 മട്ട അരി</span>
                <span className="font-extrabold text-[#7FFFC4] shrink-0 font-sans">₹44</span>
              </div>
            </div>

            {/* Savings Callout Pill */}
            <div className="bg-gradient-to-r from-[#34D399] to-[#6EE7B7] text-[#063B2A] text-[9px] font-black text-center py-0.5 rounded-lg shadow-xs">
              💰 ₹15 വരെ ലാഭം!
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-2.5 left-4 flex items-center gap-1.5">
          <span className="w-4 h-1.5 bg-white rounded-full" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* 3. LIVE PRICE TICKER */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5">
        <span className="text-[9px] font-black text-[#063B2A] bg-[#E8F5EE] px-2 py-1 rounded-lg shrink-0 border border-emerald-200 font-malayalam">
          ഇന്ന്:
        </span>
        {TODAY_PRICES.map((item) => (
          <div
            key={item.name}
            className="bg-white text-[#17221D] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#E3ECE7] shadow-sm shrink-0 flex items-center gap-1 whitespace-nowrap"
          >
            <span>{item.emoji}</span>
            <span className="font-malayalam">{item.name}</span>
            <span className="font-sans font-black text-[#063B2A]">₹{item.price}</span>
          </div>
        ))}
      </div>

      {/* 4. CATEGORIES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">കാറ്റഗറികൾ</h2>
          <button
            type="button"
            onClick={onViewAllCategories}
            className="text-[11px] font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
          >
            <span>എല്ലാം</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-4 gap-2 font-malayalam">
          {CATEGORY_CONFIG.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer text-center group border ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-1 ring-[#0B8F68]/20'
                    : `${cat.bg} ${cat.border} hover:border-[#0B8F68]/40`
                }`}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1 text-2xl transition-transform group-hover:scale-110 group-active:scale-95">
                  {cat.emoji}
                </div>
                <span className="text-[9px] font-bold text-[#17221D] leading-tight line-clamp-2 w-full text-center">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. POPULAR PRODUCTS (or search results) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            {searchQuery ? (
              <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">
                തിരയൽ ഫലം ({popularProducts.length})
              </h2>
            ) : currentCategoryObj && selectedCategoryId !== 'all' ? (
              <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0 flex items-center gap-1.5">
                <span>{currentCategoryObj.icon || (currentCategoryObj as any).emoji || '📦'}</span>
                <span>{currentCategoryObj.name || (currentCategoryObj as any).label || 'ഉൽപ്പന്നങ്ങൾ'}</span>
                <span className="text-xs text-[#0B8F68] font-sans font-extrabold">({popularProducts.length})</span>
              </h2>
            ) : (
              <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0 flex items-center gap-1.5">
                <span>📦</span>
                <span>എല്ലാ ഉൽപ്പന്നങ്ങളും</span>
                <span className="text-xs text-[#0B8F68] font-sans font-extrabold">({popularProducts.length})</span>
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              if (onViewAllProducts) onViewAllProducts();
            }}
            className="text-[11px] font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
          >
            <span>എല്ലാം</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {popularProducts.length === 0 ? (
          /* Empty state */
          <div className="py-10 flex flex-col items-center gap-3 text-center font-malayalam">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold text-[#17221D]">ഒന്നും കണ്ടില്ല</p>
            <p className="text-xs text-[#66756E]">മറ്റൊരു വാക്ക് ഉപയോഗിച്ച് തിരയൂ</p>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="px-4 py-2 bg-[#063B2A] text-white text-xs font-bold rounded-full cursor-pointer"
            >
              ക്ലിയർ ചെയ്യുക
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {popularProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              const priceValues = Object.values(product.prices || {});
              const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 0;
              const basketItem = basket.find((b) => b.productId === product.id);
              const qty = basketItem ? basketItem.quantity : 0;
              const isOutOfStock = Boolean(
                product.stockStatus &&
                Object.values(product.stockStatus).length > 0 &&
                Object.values(product.stockStatus).every((s) => s === 'out_of_stock')
              );

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProductForDetail(product)}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all cursor-pointer flex flex-col group relative ${
                    isOutOfStock ? 'border-red-100 opacity-85' : 'border-[#E3ECE7] hover:border-[#0B8F68]/50 hover:shadow-md'
                  }`}
                >
                  {/* Favorite */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
                    className="absolute top-2 right-2 z-10 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm cursor-pointer"
                  >
                    <Heart
                      className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-[#8A9992]'}`}
                    />
                  </button>

                  {/* Product Image / Emoji */}
                  <div className="w-full h-[72px] flex items-center justify-center bg-[#F5F8F6] border-b border-[#F0F4F2] relative overflow-hidden">
                    <ProductImage
                      productId={product.id}
                      image={product.image}
                      emoji={product.emoji || '📦'}
                      alt={product.name}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-contain p-1.5 transition-transform group-hover:scale-110"
                      fallbackEmojiClassName="text-3xl transition-transform group-hover:scale-110"
                      isOutOfStock={isOutOfStock}
                      stampSize="xs"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2 flex flex-col gap-1 flex-1">
                    <h3 className="text-[10px] font-black text-[#17221D] font-malayalam leading-tight line-clamp-2 m-0">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {price > 0 ? (
                          <span className="text-xs font-extrabold text-[#17221D] font-sans">
                            ₹{price}
                            <span className="text-[9px] text-[#8A9992] font-normal">
                              /{product.defaultUnit || 'kg'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#8A9992] font-malayalam">വില ഇല്ല</span>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {isOutOfStock ? (
                          <span className="text-[8px] font-black font-malayalam text-red-600 bg-red-50 border border-red-200 px-1 py-0.5 rounded select-none">
                            തീർന്നു
                          </span>
                        ) : qty > 0 ? (
                          <div className="flex items-center bg-[#063B2A] text-white rounded-full px-1 py-0.5 gap-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(product.id, -1)}
                              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-90"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-0.5 text-[10px] font-black font-sans min-w-[10px] text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => onQuantityChange(product.id, 1)}
                              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-90"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddToBasket(product, product.defaultUnit)}
                            className="w-6 h-6 rounded-full bg-[#063B2A] hover:bg-[#0B8F68] text-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. VALUE PROPOSITION CARDS */}
      <div className="grid grid-cols-2 gap-2 font-malayalam pt-1">
        <div className="bg-[#E8F5EE] border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <TrendingDown className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">വില താരതമ്യം</div>
            <div className="text-[8px] text-[#556960]">മികച്ച നിരക്കുകൾ</div>
          </div>
        </div>
        <div className="bg-[#E8F5EE] border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Store className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">പ്രാദേശിക കടകൾ</div>
            <div className="text-[8px] text-[#556960]">സൂപ്പർമാർക്കറ്റ്</div>
          </div>
        </div>
        <div className="bg-[#E8F5EE] border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">നേരിട്ട് ബുക്കിംഗ്</div>
            <div className="text-[8px] text-[#556960]">സ്റ്റോക്ക് ലഭ്യത</div>
          </div>
        </div>
        <div className="bg-[#E8F5EE] border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">100% സൗജന്യം</div>
            <div className="text-[8px] text-[#556960]">ഉപഭോക്താക്കൾ</div>
          </div>
        </div>
      </div>

    </div>
  );
};
