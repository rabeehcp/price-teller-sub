import React, { useState, useMemo } from 'react';
import { Category, Product, Shop, Location, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';
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
  {
    id: 'all',
    label: 'എല്ലാം',
    image: '/categories/grocery.jpg',
    bgColor: 'bg-[#E8F5EE]',
  },
  {
    id: 'vegetables',
    label: 'പച്ചക്കറികൾ',
    image: '/categories/vegetables.jpg',
    bgColor: 'bg-[#E8F6ED]',
  },
  {
    id: 'fruits',
    label: 'പഴങ്ങൾ',
    image: '/categories/fruits.jpg',
    bgColor: 'bg-[#FEF1E6]',
  },
  {
    id: 'rice-grains',
    label: 'അരി & ധാന്യങ്ങൾ',
    image: '/categories/grains.jpg',
    bgColor: 'bg-[#F9EFE3]',
  },
  {
    id: 'dairy',
    label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
    image: '/categories/dairy.jpg',
    bgColor: 'bg-[#EBF4FC]',
  },
  {
    id: 'oils-spices',
    label: 'എണ്ണ & മസാലകൾ',
    image: '/categories/oils-spices.jpg',
    bgColor: 'bg-[#FFF9E6]',
  },
  {
    id: 'beverages',
    label: 'പാനീയങ്ങൾ',
    image: '/categories/beverages.jpg',
    bgColor: 'bg-[#E9F6F8]',
  },
  {
    id: 'bakery-breakfast',
    label: 'ബേക്കറി & സ്നാക്സ്',
    image: '/categories/bakery.jpg',
    bgColor: 'bg-[#FDF2E7]',
  },
  {
    id: 'cleaning-household',
    label: 'വീട്ടുപകരണങ്ങൾ',
    image: '/categories/cleaning.jpg',
    bgColor: 'bg-[#F2EFFB]',
  },
];

const TODAY_PRICES = [
  { name: 'തക്കാളി', image: '/categories/vegetables.jpg', emoji: '🍅', price: 28, unit: 'kg' },
  { name: 'സവാള', image: '/categories/vegetables.jpg', emoji: '🧅', price: 35, unit: 'kg' },
  { name: 'ഉരുളക്കിഴങ്ങ്', image: '/categories/vegetables.jpg', emoji: '🥔', price: 32, unit: 'kg' },
  { name: 'പാൽ', image: '/categories/dairy.jpg', emoji: '🥛', price: 56, unit: 'ലി' },
  { name: 'എണ്ണ', image: '/categories/oils-spices.jpg', emoji: '🥥', price: 150, unit: 'ലി' },
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
        vegetables: ['vegetables', 'fruits-vegetables'],
        fruits: ['fruits', 'fruits-vegetables'],
        'rice-grains': ['rice-grains', 'staples', 'pulses-legumes', 'atta-flours'],
        dairy: ['dairy', 'dairy-eggs'],
        'oils-spices': ['oils-spices', 'spices', 'oils-sugar'],
        beverages: ['beverages', 'tea-coffee', 'juices'],
        'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'bread-bakery'],
        'cleaning-household': ['cleaning-household', 'household', 'detergents', 'pooja-needs'],
      };
      const targetCats = aliases[selectedCategoryId] || [selectedCategoryId];
      filtered = products.filter((p) => targetCats.includes(p.categoryId));
    }

    const priorityNames = [
      'തക്കാളി', 'സവാള', 'ഉരുളക്കിഴങ്ങ്', 'പച്ചമുളക്', 'വാഴപ്പഴം', 'നേന്ത്രപ്പഴം', 'കാരറ്റ്', 'പാൽ', 'വെളിച്ചെണ്ണ', 'അരി',
      'tomato', 'banana', 'onion', 'carrot', 'brinjal', 'beans', 'cabbage', 'chilli', 'potato', 'milk', 'rice'
    ];
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
    <div className="w-full space-y-3.5 font-sans pb-28 animate-in fade-in duration-200">

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
            className="bg-white text-[#17221D] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#E3ECE7] shadow-2xs shrink-0 flex items-center gap-1.5 whitespace-nowrap"
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-3.5 h-3.5 object-contain rounded-xs shrink-0" />
            ) : (
              <span>{item.emoji}</span>
            )}
            <span className="font-malayalam">{item.name}</span>
            <span className="font-sans font-black text-[#063B2A]">₹{item.price}</span>
          </div>
        ))}
      </div>

      {/* 4. CATEGORIES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">കാറ്റഗറികൾ</h2>
          {onViewAllCategories && (
            <button
              type="button"
              onClick={onViewAllCategories}
              className="text-[11px] font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
            >
              <span>എല്ലാം കാണുക</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Responsive categories horizontal swipe carousel */}
        <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 -mx-0.5 font-malayalam">
          {CATEGORY_CONFIG.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 w-[74px] sm:w-[82px] flex flex-col items-center justify-between p-2 rounded-2xl transition-all cursor-pointer text-center group border ${isSelected
                    ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-xs ring-1 ring-[#0B8F68]/25'
                    : 'bg-white border-[#E3ECE7] hover:border-[#0B8F68]/40 shadow-2xs'
                  }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 overflow-hidden transition-transform group-hover:scale-105 p-1 ${cat.bgColor} shadow-2xs`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain rounded-lg drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-[10px] font-bold leading-tight line-clamp-1 w-full text-center ${isSelected ? 'text-[#063B2A] font-black' : 'text-[#17221D]'
                    }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. POPULAR PRODUCTS (or search results) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            {searchQuery ? (
              <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">
                തിരയൽ ഫലം ("{searchQuery}")
              </h2>
            ) : (
              <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0 flex items-center gap-2">
                <span>
                  {selectedCategoryId === 'all'
                    ? 'എല്ലാ ഉൽപ്പന്നങ്ങളും'
                    : CATEGORY_CONFIG.find((c) => c.id === selectedCategoryId)?.label ||
                    currentCategoryObj?.name ||
                    'ഉൽപ്പന്നങ്ങൾ'}
                </span>
                <span className="text-[10px] font-bold text-[#0B8F68] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-full font-sans">
                  {popularProducts.length} ഇനങ്ങൾ
                </span>
              </h2>
            )}
          </div>
          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                if (onViewAllProducts) onViewAllProducts();
              }}
              className="text-[11px] font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
            >
              <span>എല്ലാം കാണുക</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {shops.length === 0 ? (
          /* No Shops in this Location Empty State */
          <div className="py-8 px-5 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs font-malayalam">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
              🏪
            </div>
            <h3 className="text-sm font-black text-[#17221D] m-0">
              {currentLocation ? `${currentLocation.name}-ൽ` : 'ഈ പ്രദേശത്ത്'} നിലവിൽ കടകൾ ലഭ്യമല്ല
            </h3>
            <p className="text-xs text-[#66756E] leading-relaxed m-0 max-w-sm mx-auto">
              ഈ പ്രദേശത്ത് കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടില്ല. വിലകൾ താരതമ്യം ചെയ്യാനും സാധനങ്ങൾ വാങ്ങാനും കടകൾ ലഭ്യമായ പ്രദേശം തിരഞ്ഞെടുക്കൂ.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>📍 പ്രദേശം മാറ്റുക (Change Location)</span>
              </button>
            </div>
          </div>
        ) : popularProducts.length === 0 ? (
          /* Empty state */
          <div className="py-10 flex flex-col items-center gap-3 text-center font-malayalam bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-2xs">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold text-[#17221D] m-0">ഒന്നും കണ്ടില്ല</p>
            <p className="text-xs text-[#66756E] m-0">മറ്റൊരു വാക്ക് ഉപയോഗിച്ച് തിരയൂ അല്ലെങ്കിൽ വിഭാഗം മാറ്റൂ</p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="px-4 py-2 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs"
            >
              എല്ലാം കാണുക
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {popularProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              const priceValues = Object.values(product.prices || {}).filter(p => typeof p === 'number' && p > 0);
              const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 0;
              const basketItem = basket.find((b) => b.productId === product.id);
              const qty = basketItem ? basketItem.quantity : 0;

              const cheapestShopEntry = Object.entries(product.prices || {})
                .filter(([_, p]) => typeof p === 'number' && p > 0)
                .sort((a, b) => a[1] - b[1])[0];
              const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : (shops[0]?.name || 'കട ലഭ്യമല്ല');
              const shopInfo = shops.find((s) => s.name.toLowerCase() === lowestShopName.toLowerCase());

              const isOutOfStock = Boolean(
                product.stockStatus &&
                Object.values(product.stockStatus).length > 0 &&
                Object.values(product.stockStatus).every((s) => s === 'out_of_stock')
              );

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProductForDetail(product)}
                  className={`bg-white border rounded-2xl p-2.5 sm:p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(11,143,104,0.12)] hover:border-[#0B8F68]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${isOutOfStock ? 'border-red-200 opacity-90' : 'border-[#E3ECE7]'
                    }`}
                >
                  {/* Top: Shop Pill & Favorite Wishlist Button */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9.5px] font-bold text-[#063B2A] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-full truncate max-w-[110px] font-malayalam flex items-center gap-1">
                      <span className="truncate">{shopInfo?.name || lowestShopName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(product);
                      }}
                      className="text-slate-400 hover:text-[#E11D48] p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                      title={isFav ? 'പ്രിയപ്പെട്ടവയിൽ നിന്ന് മാറ്റുക' : 'പ്രിയപ്പെട്ടവയിൽ ചേർക്കുക'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-slate-300'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Product Thumbnail */}
                  <div className="w-full h-28 sm:h-32 flex items-center justify-center py-3 my-1 relative">
                    <ProductImage
                      productId={product.id}
                      image={product.image}
                      emoji={product.emoji}
                      alt={getMalayalamName(product.name)}
                      className="w-full h-full"
                      imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                      fallbackEmojiClassName="text-3xl"
                      isOutOfStock={isOutOfStock}
                      stampSize="xs"
                    />
                  </div>

                  {/* Info: Name, Price, and Action Button */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-start justify-between gap-1 min-h-[28px]">
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#17221D] font-malayalam leading-tight line-clamp-2 m-0 group-hover:text-[#0B8F68] transition-colors">
                        {getMalayalamName(product.name)}
                      </h3>
                      {isOutOfStock && (
                        <span className="shrink-0 text-[8px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-mono">
                          തീർന്നു
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <div>
                        {price > 0 ? (
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm sm:text-base font-black text-[#17221D] font-sans tracking-tight">
                              ₹{price}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              /{product.defaultUnit || 'kg'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-malayalam">വില ലഭ്യമല്ല</span>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold font-malayalam text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                            തീർന്നു
                          </span>
                        ) : qty > 0 ? (
                          <div className="flex items-center bg-[#063B2A] text-white rounded-xl px-1.5 py-0.5 gap-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(product.id, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all"
                              aria-label="കുറയ്ക്കുക"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-1 text-[11px] font-black font-sans min-w-[14px] text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantityChange(product.id, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all"
                              aria-label="കൂട്ടുക"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : price <= 0 ? (
                          <span className="text-[9px] font-bold font-malayalam text-[#8A9992] bg-slate-100 px-2 py-0.5 rounded-lg select-none">
                            ലഭ്യമല്ല
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddToBasket(product, product.defaultUnit)}
                            className="px-2.5 py-1 bg-[#E8F5EE] hover:bg-[#0B8F68] text-[#063B2A] hover:text-white border border-[#C3EEDC] hover:border-[#0B8F68] text-[11px] font-black rounded-xl shadow-2xs transition-all active:scale-95 font-malayalam flex items-center gap-1 cursor-pointer"
                            aria-label="ചേർക്കുക"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>ചേർക്കുക</span>
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
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingDown className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">വില താരതമ്യം</div>
            <div className="text-[8px] text-[#556960]">മികച്ച നിരക്കുകൾ</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <Store className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">പ്രാദേശിക കടകൾ</div>
            <div className="text-[8px] text-[#556960]">സൂപ്പർമാർക്കറ്റ്</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">നേരിട്ട് ബുക്കിംഗ്</div>
            <div className="text-[8px] text-[#556960]">സ്റ്റോക്ക് ലഭ്യത</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
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
