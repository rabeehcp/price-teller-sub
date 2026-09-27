import React, { useState, useMemo } from 'react';
import { Category, Product, Shop, Location, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';
import { formatPerUnitLabel } from '../utils/unitFormatter';
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
  Zap,
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
  onOpenDeals?: () => void;
}

const CATEGORY_CONFIG = [
  {
    id: 'all',
    label: 'എല്ലാം',
    image: '/categories/grocery.jpg',
  },
  {
    id: 'vegetables',
    label: 'പച്ചക്കറികൾ',
    image: '/categories/vegetables.jpg',
  },
  {
    id: 'fruits',
    label: 'പഴങ്ങൾ',
    image: '/categories/fruits.jpg',
  },
  {
    id: 'rice-grains',
    label: 'ധാന്യങ്ങൾ',
    image: '/categories/grains.jpg',
  },
  {
    id: 'dairy',
    label: 'പാൽ & മുട്ട',
    image: '/categories/dairy.jpg',
  },
  {
    id: 'oils-spices',
    label: 'വെളിച്ചെണ്ണ & മസാല',
    image: '/categories/oils-spices.jpg',
  },
  {
    id: 'bakery-breakfast',
    label: 'ബേക്കറി',
    image: '/categories/bakery.jpg',
  },
  {
    id: 'beverages',
    label: 'പാനീയങ്ങൾ',
    image: '/categories/beverages.jpg',
  },
];

const TODAY_PRICES = [
  { name: 'തക്കാളി', image: '/categories/vegetables.jpg', emoji: '🍅', price: 28, unit: 'kg' },
  { name: 'സവാള', image: '/categories/vegetables.jpg', emoji: '🧅', price: 35, unit: 'kg' },
  { name: 'ഉരുളക്കിഴങ്ങ്', image: '/categories/vegetables.jpg', emoji: '🥔', price: 32, unit: 'kg' },
  { name: 'പാൽ', image: '/categories/dairy.jpg', emoji: '🥛', price: 56, unit: 'ലി' },
  { name: 'എണ്ണ', image: '/categories/oils-spices.jpg', emoji: '🥥', price: 150, unit: 'ലി' },
];

interface MobileProductCardProps {
  product: Product;
  isFav: boolean;
  qty: number;
  lowestShopName: string;
  shopInfo?: Shop;
  onToggleFavorite: (product: Product) => void;
  onSelectProductForDetail: (product: Product) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onAddToBasket: (product: Product, unit?: string) => void;
}

const MobileProductCard: React.FC<MobileProductCardProps> = React.memo(({
  product,
  isFav,
  qty,
  lowestShopName,
  shopInfo,
  onToggleFavorite,
  onSelectProductForDetail,
  onQuantityChange,
  onAddToBasket,
}) => {
  const priceValues = Object.values(product.prices || {}).filter(p => typeof p === 'number' && p > 0);
  const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 0;
  const mlName = getMalayalamName(product.name);
  const hasDifferentMl = mlName && mlName.toLowerCase() !== product.name.toLowerCase();

  const isOutOfStock = Boolean(
    product.stockStatus &&
    Object.values(product.stockStatus).length > 0 &&
    Object.values(product.stockStatus).every((s) => s === 'out_of_stock')
  );

  return (
    <div
      onClick={() => onSelectProductForDetail(product)}
      className={`bg-white border rounded-2xl p-3 sm:p-3.5 shadow-2xs hover:shadow-md hover:border-[#0D6344]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${
        isOutOfStock ? 'border-red-200 opacity-90' : 'border-[#E3ECE7]'
      }`}
    >
      {/* Top: Shop Pill & Favorite Wishlist Button */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="text-[9.5px] font-bold text-[#0D6344] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-full truncate max-w-[120px] font-malayalam flex items-center gap-1 shadow-2xs">
          <span className="truncate">Lowest: {shopInfo?.name || lowestShopName}</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="text-slate-300 hover:text-[#E11D48] p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          title={isFav ? 'പ്രിയപ്പെട്ടവയിൽ നിന്ന് മാറ്റുക' : 'പ്രിയപ്പെട്ടവയിൽ ചേർക്കുക'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-slate-300 hover:text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Product Thumbnail in Clean Neutral Container */}
      <div className="w-full h-28 sm:h-32 flex items-center justify-center p-1.5 relative bg-[#FAFCFB] rounded-xl border border-slate-100/80 mb-1">
        <ProductImage
          productId={product.id}
          image={product.image}
          emoji={product.emoji}
          alt={mlName}
          className="w-full h-full"
          imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-200"
          fallbackEmojiClassName="text-3xl"
          isOutOfStock={isOutOfStock}
          stampSize="xs"
        />
      </div>

      {/* Info: Name, Price, and Action Button */}
      <div className="space-y-1.5 pt-1">
        <div className="min-h-[38px]">
          <h3 className="text-xs sm:text-[13px] font-black text-slate-900 font-malayalam leading-snug line-clamp-1 group-hover:text-[#0D6344] transition-colors m-0">
            {hasDifferentMl ? mlName : product.name}
          </h3>
          {hasDifferentMl ? (
            <p className="text-[10px] text-slate-400 font-sans truncate m-0 font-medium mt-0.5">
              {product.name}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-sans truncate m-0 font-medium mt-0.5 capitalize">
              {product.categoryId}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between pt-1 gap-1">
          <div className="min-w-0 flex-1">
            {price > 0 ? (
              <div className="flex items-baseline gap-0.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900 font-sans tracking-tight leading-none">
                  ₹{price}
                </span>
                <span className="text-[10px] text-slate-400 font-medium font-sans whitespace-nowrap leading-none">
                  /{formatPerUnitLabel(product.defaultUnit)}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 font-malayalam leading-none">വില ലഭ്യമല്ല</span>
            )}
          </div>

          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <span className="text-[9px] font-bold font-malayalam text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                തീർന്നു
              </span>
            ) : qty > 0 ? (
              <div className="flex items-center bg-[#0D6344] text-white rounded-xl px-1.5 py-1 gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => onQuantityChange(product.id, -1)}
                  className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
                  aria-label="കുറയ്ക്കുക"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 text-xs font-black font-sans min-w-[14px] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(product.id, 1)}
                  className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
                  aria-label="കൂട്ടുക"
                >
                  <Plus className="w-3 h-3" />
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
                className="px-3 py-1.5 bg-[#0D6344] hover:bg-[#064E3B] text-white text-[11px] font-black rounded-xl shadow-2xs transition-all active:scale-95 font-malayalam flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
});

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
  onOpenDeals,
}) => {
  const getProductRank = (name: string): number => {
    const lower = name.toLowerCase();
    const priorityNames = [
      'തക്കാളി', 'സവാള', 'ഉരുളക്കിഴങ്ങ്', 'പച്ചമുളക്', 'വാഴപ്പഴം', 'നേന്ത്രപ്പഴം', 'കാരറ്റ്', 'പാൽ', 'വെളിച്ചെണ്ണ', 'അരി',
      'tomato', 'banana', 'onion', 'carrot', 'brinjal', 'beans', 'cabbage', 'chilli', 'potato', 'milk', 'rice'
    ];
    for (let i = 0; i < priorityNames.length; i++) {
      if (lower.includes(priorityNames[i])) return i;
    }
    return 999;
  };

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

    return [...filtered].sort((a, b) => {
      const aRank = getProductRank(a.name);
      const bRank = getProductRank(b.name);
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [products, searchQuery, selectedCategoryId]);

  // Progressive batch rendering
  const [visibleCount, setVisibleCount] = useState<number>(24);

  React.useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedCategoryId]);

  const visiblePopularProducts = useMemo(() => {
    return popularProducts.slice(0, visibleCount);
  }, [popularProducts, visibleCount]);

  // O(1) Lookups
  const basketQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of basket) {
      map[item.productId] = item.quantity;
    }
    return map;
  }, [basket]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const shopMap = useMemo(() => {
    const map = new Map<string, Shop>();
    for (const s of shops) {
      map.set(s.name.toLowerCase(), s);
    }
    return map;
  }, [shops]);

  const currentCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="w-full space-y-3.5 font-sans pb-28 animate-in fade-in duration-200">

      {/* 1. SEARCH BAR */}
      <div>
        <div className="relative flex items-center bg-white border border-[#E3ECE7] focus-within:border-[#0D6344] focus-within:ring-2 focus-within:ring-[#0D6344]/15 rounded-2xl p-1.5 pl-4 shadow-2xs transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="പലചരക്ക് ഉൽപ്പന്നങ്ങൾ തിരയുക..."
            className="w-full px-2.5 py-1 text-xs font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-malayalam"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-[#0D6344] text-white flex items-center justify-center shrink-0 shadow-2xs active:scale-95 transition-transform cursor-pointer mr-0.5"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO PROMO BANNER: FRESH PRODUCE & FLASH DEALS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#DFF5E9] via-[#EAF7F0] to-[#D8F2E4] border border-[#C3EEDC] shadow-xs p-4 sm:p-5 flex items-center justify-between gap-3 text-slate-800">
        <div className="relative z-10 flex-1 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 border border-emerald-200/80 rounded-full text-[10px] font-black text-[#0D6344] shadow-2xs font-sans">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Flash Deals LIVE</span>
          </div>

          <h2 className="text-[15px] sm:text-lg font-black text-slate-900 leading-tight font-malayalam tracking-tight m-0">
            നിത്യോപയോഗ സാധനങ്ങൾ ഏറ്റവും കുറഞ്ഞ വിലയിൽ!
          </h2>

          <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-snug font-malayalam m-0 line-clamp-2 max-w-xs">
            നാട്ടിലെ മികച്ച കടകളിലെ തത്സമയ വിലകൾ താരതമ്യം ചെയ്യാം.
          </p>

          <div className="pt-1 flex items-center gap-2">
            {onOpenDeals ? (
              <button
                type="button"
                onClick={onOpenDeals}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D6344] hover:bg-[#064E3B] active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer font-malayalam"
              >
                <span>ഓഫറുകൾ കാണുക</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else if (onViewAllProducts) onViewAllProducts();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D6344] hover:bg-[#064E3B] active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer font-malayalam"
              >
                <span>വിലകൾ കാണാം</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Fresh Groceries Produce Basket Graphic */}
        <div className="relative shrink-0 w-28 sm:w-36 h-24 sm:h-28 flex items-center justify-center">
          <img
            src="/hero-groceries-fresh.jpg"
            alt="Fresh Groceries Produce Basket"
            className="w-full h-full object-contain drop-shadow-md rounded-2xl transform hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* 3. LIVE PRICE TICKER */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5">
        <span className="text-[9px] font-black text-[#0D6344] bg-[#E8F5EE] px-2 py-1 rounded-lg shrink-0 border border-emerald-200 font-malayalam">
          ഇന്ന്:
        </span>
        {TODAY_PRICES.map((item) => (
          <div
            key={item.name}
            className="bg-white text-slate-800 text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#E3ECE7] shadow-2xs shrink-0 flex items-center gap-1.5 whitespace-nowrap"
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-3.5 h-3.5 object-contain rounded-xs shrink-0" />
            ) : (
              <span>{item.emoji}</span>
            )}
            <span className="font-malayalam">{item.name}</span>
            <span className="font-sans font-black text-[#0D6344]">₹{item.price}</span>
          </div>
        ))}
      </div>

      {/* 4. CATEGORIES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-slate-900 font-malayalam m-0">കാറ്റഗറികൾ</h2>
          {onViewAllCategories && (
            <button
              type="button"
              onClick={onViewAllCategories}
              className="text-[11px] font-bold text-[#0D6344] hover:text-[#064E3B] flex items-center gap-0.5 font-malayalam cursor-pointer"
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
                className={`shrink-0 w-[76px] sm:w-[84px] flex flex-col items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-center group border relative ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-[#0D6344] shadow-xs ring-2 ring-[#0D6344]/20'
                    : 'bg-white border-[#E3ECE7] hover:border-[#0D6344]/40 shadow-2xs'
                }`}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D6344] absolute top-2 right-2" />
                )}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 overflow-hidden transition-transform group-hover:scale-105 p-1 bg-[#F5F8F6] border border-[#E3ECE7]/80 shadow-2xs"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain rounded-lg drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-[10px] font-bold leading-tight line-clamp-1 w-full text-center ${
                    isSelected ? 'text-[#0D6344] font-black' : 'text-slate-700'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {visiblePopularProducts.map((product) => {
              const isFav = favoriteSet.has(product.id);
              const qty = basketQuantityMap[product.id] || 0;
              const cheapestShopEntry = Object.entries(product.prices || {})
                .filter(([_, p]) => typeof p === 'number' && p > 0)
                .sort((a, b) => a[1] - b[1])[0];
              const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : (shops[0]?.name || 'കട ലഭ്യമല്ല');
              const shopInfo = shopMap.get(lowestShopName.toLowerCase());

              return (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  isFav={isFav}
                  qty={qty}
                  lowestShopName={lowestShopName}
                  shopInfo={shopInfo}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProductForDetail={onSelectProductForDetail}
                  onQuantityChange={onQuantityChange}
                  onAddToBasket={onAddToBasket}
                />
              );
            })}
          </div>
        )}

        {/* Progressive Load More */}
        {popularProducts.length > visibleCount && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-5 py-2 bg-white hover:bg-[#E8F5EE] border border-[#0B8F68]/30 hover:border-[#0B8F68] text-[#063B2A] font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-malayalam"
            >
              <span>കൂടുതൽ കാണുക ({popularProducts.length - visibleCount} ബാക്കി)</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#0B8F68]" />
            </button>
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
            <div className="text-[10px] font-black text-[#17221D]">വില താരതമ്യം ചെയ്യാം</div>
            <div className="text-[8px] text-[#556960]">വിവിധ കടകളിലെ വിലകൾ എളുപ്പത്തിൽ താരതമ്യം ചെയ്യൂ</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <Store className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">പ്രാദേശിക കടകൾ</div>
            <div className="text-[8px] text-[#556960]">നിങ്ങളുടെ സമീപത്തെ കടകളിൽ നിന്ന് കണ്ടെത്തൂ</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">എളുപ്പത്തിൽ വാങ്ങാം</div>
            <div className="text-[8px] text-[#556960]">ഇഷ്ടപ്പെട്ട കടയിൽ നിന്ന് നേരിട്ട് വാങ്ങൂ</div>
          </div>
        </div>
        <div className="bg-white border border-[#E3ECE7] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#063B2A]" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#17221D]">പൂർണ്ണമായും സൗജന്യം</div>
            <div className="text-[8px] text-[#556960]">ഉപഭോക്താക്കൾക്കായി അധിക ചാർജുകളില്ല</div>
          </div>
        </div>
      </div>

    </div>
  );
};
