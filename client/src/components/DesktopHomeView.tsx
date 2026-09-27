import React, { useState, useMemo } from 'react';
import { Product, Shop, Location, BasketItem, Category } from '../types';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';
import { formatPerUnitLabel } from '../utils/unitFormatter';
import {
  Search,
  Star,
  Plus,
  Minus,
  Heart,
  ChevronRight,
  ChevronLeft,
  Store,
  MapPin,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Headphones,
  Bell,
  Trash2,
  Check,
  TrendingDown,
  Zap,
} from 'lucide-react';

interface DesktopHomeViewProps {
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
  onClearBasket: () => void;
  onOpenOrders: () => void;
  onOpenDeals: () => void;
  isRightSidebarOpen?: boolean;
}

interface DesktopProductCardProps {
  product: Product;
  isFav: boolean;
  qty: number;
  shopInfo?: Shop;
  lowestShopName: string;
  onToggleFavorite: (product: Product) => void;
  onSelectProductForDetail: (product: Product) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onAddToBasket: (product: Product, unit?: string) => void;
}

const DesktopProductCard: React.FC<DesktopProductCardProps> = React.memo(({
  product,
  isFav,
  qty,
  shopInfo,
  lowestShopName,
  onToggleFavorite,
  onSelectProductForDetail,
  onQuantityChange,
  onAddToBasket,
}) => {
  const priceValues = Object.values(product.prices || {}).filter((p) => typeof p === 'number' && p > 0);
  const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 0;

  const isOutOfStock = Boolean(
    product.stockStatus &&
    Object.values(product.stockStatus).length > 0 &&
    Object.values(product.stockStatus).every((s) => s === 'out_of_stock')
  );

  return (
    <div
      onClick={() => onSelectProductForDetail(product)}
      className={`bg-white border rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative ${
        isOutOfStock ? 'border-red-200 opacity-90' : 'border-[#E5ECE8] hover:border-[#0D6344]/40'
      }`}
    >
      {/* Top: Distance / Shop Pill & Wishlist Button */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-bold text-[#0D6344] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-full truncate max-w-[130px] font-sans flex items-center gap-1">
          <span>📍</span>
          <span>0.5 km</span>
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
            className={`w-3.5 h-3.5 transition-colors ${
              isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Product Thumbnail */}
      <div className="w-full h-28 flex items-center justify-center p-2 my-1 relative">
        <ProductImage
          productId={product.id}
          image={product.image}
          emoji={product.emoji}
          alt={product.name}
          className="w-full h-full"
          imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          fallbackEmojiClassName="text-4xl"
          isOutOfStock={isOutOfStock}
          stampSize="sm"
        />
      </div>

      {/* Middle Info: Name, Price, Rating */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-bold text-[#17221D] font-sans truncate m-0">
            {product.name}
          </h3>
          {isOutOfStock && (
            <span className="shrink-0 text-[8px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-mono">
              OUT
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-[#17221D] font-sans">
            {price > 0 ? `₹${price}` : 'Not available'}
          </span>
          {price > 0 && (
            <span className="text-[10px] text-slate-400 font-sans whitespace-nowrap">
              /{formatPerUnitLabel(product.defaultUnit)}
            </span>
          )}
        </div>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-sans">
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold ml-0.5">4.5</span>
          </div>
          <span>(120)</span>
        </div>

        {/* Shop Location */}
        <div className="flex items-center gap-1 text-[10px] text-[#8F9F97] font-sans pt-0.5 truncate">
          <span className="font-medium text-[#4D6158] truncate">
            {lowestShopName}
          </span>
        </div>
      </div>

      {/* Bottom: Add to Basket / Stepper or Out of Stock State */}
      <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
        {isOutOfStock || price <= 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-2 px-3 bg-slate-100 border border-slate-200 text-slate-400 text-[11px] font-bold rounded-xl select-none flex items-center justify-center gap-1 font-sans cursor-not-allowed"
          >
            <span>{isOutOfStock ? 'Out of stock' : 'Unavailable'}</span>
          </button>
        ) : qty > 0 ? (
          <div className="flex items-center justify-between bg-[#0D6344] text-white rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={() => onQuantityChange(product.id, -1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-black font-sans">{qty}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(product.id, 1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToBasket(product, product.defaultUnit)}
            className="w-full py-2 px-3 bg-[#0D6344] hover:bg-[#094E35] active:scale-95 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 font-sans cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
});

export const DesktopHomeView: React.FC<DesktopHomeViewProps> = ({
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
  onClearBasket,
  onOpenOrders,
  onOpenDeals,
  isRightSidebarOpen = false,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 9 Categories matching the pastel palette of the mockup
  const desktopCategories = [
    {
      id: 'all',
      label: 'All Items',
      image: '/categories/grocery.jpg',
      bgColor: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    },
    {
      id: 'vegetables',
      label: 'Vegetables',
      image: '/categories/vegetables.jpg',
      bgColor: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    },
    {
      id: 'fruits',
      label: 'Fruits',
      image: '/categories/fruits.jpg',
      bgColor: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]',
    },
    {
      id: 'rice-grains',
      label: 'Grains',
      image: '/categories/grains.jpg',
      bgColor: 'bg-[#F7EBE1] text-[#78350F] border-[#EADBCC]',
    },
    {
      id: 'dairy',
      label: 'Dairy',
      image: '/categories/dairy.jpg',
      bgColor: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
    },
    {
      id: 'oils-spices',
      label: 'Oils',
      image: '/categories/oils-spices.jpg',
      bgColor: 'bg-[#FEF3C7] text-[#854D0E] border-[#FDE68A]',
    },
    {
      id: 'beverages',
      label: 'Beverages',
      image: '/categories/beverages.jpg',
      bgColor: 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]',
    },
    {
      id: 'bakery-breakfast',
      label: 'Bakery',
      image: '/categories/bakery.jpg',
      bgColor: 'bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]',
    },
    {
      id: 'cleaning-household',
      label: 'Household',
      image: '/categories/cleaning.jpg',
      bgColor: 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]',
    },
  ];

  // Pre-calculated priority rank helper for 60fps instant sorting
  const getProductRank = (name: string): number => {
    const lower = name.toLowerCase();
    const priorityNames = [
      'തക്കാളി', 'tomato', 'സവാള', 'onion', 'ഉരുളക്കിഴങ്ങ്', 'potato',
      'പച്ചമുളക്', 'green chilli', 'ഇഞ്ചി', 'ginger', 'വെളുത്തുള്ളി', 'garlic',
      'വാഴപ്പഴം', 'banana', 'ആപ്പിൾ', 'apple', 'ഓറഞ്ച്', 'orange', 'മുന്തിരി', 'grapes',
      'തേങ്ങ', 'coconut', 'കാരറ്റ്', 'carrot', 'പാൽ', 'milk', 'വെളിച്ചെണ്ണ', 'oil', 'അരി', 'rice'
    ];
    for (let i = 0; i < priorityNames.length; i++) {
      if (lower.includes(priorityNames[i])) return i;
    }
    return 999;
  };

  // Displayed products with robust category alias matching and Kerala market priority
  const displayedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        getMalayalamName(p.name).toLowerCase().includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
        (p.nutritionalNote && p.nutritionalNote.toLowerCase().includes(q))
      );
    } else if (selectedCategoryId && selectedCategoryId !== 'all') {
      const aliases: Record<string, string[]> = {
        vegetables: ['vegetables', 'fruits-vegetables'],
        fruits: ['fruits', 'fruits-vegetables'],
        'rice-grains': ['rice-grains', 'staples', 'pulses-legumes'],
        dairy: ['dairy'],
        spices: ['spices', 'oils-spices', 'oils-sugar'],
        'oils-spices': ['oils-spices', 'spices', 'oils-sugar'],
        beverages: ['beverages', 'drinks', 'tea-coffee', 'juices'],
        'bakery-breakfast': ['bakery-breakfast', 'bakery', 'biscuits-snacks', 'snacks', 'bread-bakery'],
        'cleaning-household': ['household', 'cleaning-household', 'storage-containers'],
        household: ['household', 'cleaning-household', 'storage-containers'],
      };
      const targetCats = aliases[selectedCategoryId] || [selectedCategoryId];
      filtered = products.filter((p) => targetCats.includes(p.categoryId));
    }

    return [...filtered].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Ensure packaged snacks don't precede fresh groceries
      const aIsSnack = aName.includes('sauce') || aName.includes('ketchup') || aName.includes('chips') || aName.includes('tangles') || aName.includes('mad angles');
      const bIsSnack = bName.includes('sauce') || bName.includes('ketchup') || bName.includes('chips') || bName.includes('tangles') || bName.includes('mad angles');
      if (aIsSnack && !bIsSnack) return 1;
      if (!aIsSnack && bIsSnack) return -1;

      const aRank = getProductRank(aName);
      const bRank = getProductRank(bName);
      if (aRank !== bRank) return aRank - bRank;
      return aName.localeCompare(bName);
    });
  }, [products, searchQuery, selectedCategoryId]);

  // Progressive batch rendering to keep DOM lightweight and navigation instantaneous
  const [visibleCount, setVisibleCount] = useState<number>(36);

  React.useEffect(() => {
    setVisibleCount(36);
  }, [searchQuery, selectedCategoryId]);

  const visibleProducts = useMemo(() => {
    return displayedProducts.slice(0, visibleCount);
  }, [displayedProducts, visibleCount]);

  // Fast O(1) quantity & favorite lookups
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

  // Special Offers data matching Image 1 (All powered by ImageKit CDN)
  const specialOffers = [
    {
      id: 'offer-1',
      title: 'ഫ്രഷ് പച്ചക്കറികൾ',
      discount: '15% ഓഫർ',
      discountBg: 'bg-emerald-600',
      image: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg',
      emoji: '🥦',
    },
    {
      id: 'offer-2',
      title: 'നാടൻ വാഴപ്പഴം',
      discount: '20% ഓഫർ',
      discountBg: 'bg-amber-500',
      image: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-4649827.jpg',
      emoji: '🍌',
    },
    {
      id: 'offer-3',
      title: 'തക്കാളി & പച്ചക്കറികൾ',
      discount: '10% ഓഫർ',
      discountBg: 'bg-sky-600',
      image: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3137805.jpg',
      emoji: '🍅',
    },
    {
      id: 'offer-4',
      title: 'ധാന്യങ്ങളും അരിയും',
      discount: 'മികച്ച വില',
      discountBg: 'bg-orange-600',
      image: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/158356.jpg',
      emoji: '🌾',
    },
  ];

  // Cart total calculations
  const totalBasketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4 md:space-y-4.5 lg:space-y-6 font-sans">

      {/* 1. HERO BANNER: EXACT MATCH TO THE APPROVED MOCKUP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EBF5EE] via-[#E8F3EB] to-[#DCEDE2] border border-[#CFE4D7] p-6 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(20,60,40,0.04)] min-h-[220px] lg:min-h-[260px] text-[#19271F] flex flex-col justify-center">

        {/* Clean Studio Fresh Groceries Basket on the right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[44%] max-w-[480px] pointer-events-none hidden lg:block overflow-hidden">
          <img
            src="/hero-groceries-fresh.jpg"
            alt="Fresh Groceries Basket"
            className="w-full h-full object-cover object-left opacity-90 mix-blend-multiply filter contrast-[1.02]"
            loading="eager"
          />
          {/* Soft fade-out into the background on the left */}
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#E8F3EB] to-transparent pointer-events-none" />
        </div>

        {/* Adaptive Grid */}
        <div className={`relative z-10 w-full grid grid-cols-1 ${
          isRightSidebarOpen
            ? 'xl:grid-cols-[1.12fr_295px] 2xl:grid-cols-[1.25fr_330px]'
            : 'lg:grid-cols-[1.15fr_310px] xl:grid-cols-[1.2fr_330px] 2xl:grid-cols-[1.3fr_350px]'
        } items-center justify-between gap-4 xl:gap-5`}>

          {/* Left Content Column */}
          <div className="space-y-3 min-w-0 max-w-xl lg:max-w-none">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-[#11261D] font-malayalam tracking-tight leading-[1.22] m-0">
              ആവശ്യമായതെല്ലാം,<br />
              <span className="text-[#0D6344]">മികച്ച വിലയിൽ</span> കണ്ടെത്തൂ.
            </h1>

            <p className="text-xs sm:text-sm text-[#465A50] font-medium leading-relaxed font-sans m-0 max-w-lg">
              Find and compare local grocery prices in Kerala
            </p>

            {/* Quick Live Price Ticker */}
            <div className="hidden sm:flex items-center gap-2 pt-0.5 text-xs text-[#2A4738] font-sans font-bold flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/90 border border-[#D5E6DC] px-2.5 py-1 rounded-full shadow-2xs font-malayalam">
                <span>🍅</span>
                <span>തക്കാളി</span>
                <span className="text-[#0D6344] font-sans font-extrabold">₹14</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/90 border border-[#D5E6DC] px-2.5 py-1 rounded-full shadow-2xs font-malayalam">
                <span>🧅</span>
                <span>സവാള</span>
                <span className="text-[#0D6344] font-sans font-extrabold">₹32</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/90 border border-[#D5E6DC] px-2.5 py-1 rounded-full shadow-2xs font-malayalam">
                <span>🥥</span>
                <span>വെളിച്ചെണ്ണ</span>
                <span className="text-[#0D6344] font-sans font-extrabold">₹145</span>
              </span>
            </div>

            {/* CTA & Value Buttons */}
            <div className="flex items-center gap-2.5 pt-1.5 font-malayalam flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D6344] hover:bg-[#094E35] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
              >
                <span>വിലകൾ കാണാം</span>
                <span className="text-sm font-sans">✓</span>
              </button>

              <button
                type="button"
                onClick={onOpenDeals}
                className="group flex items-center gap-1.5 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 px-3.5 py-1.5 rounded-full shadow-2xs text-xs font-black text-amber-900 transition-all cursor-pointer shrink-0 active:scale-95"
                title="ഫ്ലാഷ് ഡീലുകൾ കാണുക"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 group-hover:scale-110 transition-transform" />
                <span>ഫ്ലാഷ് ഡീലുകൾ</span>
                <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full tracking-wider animate-pulse">
                  LIVE
                </span>
              </button>
            </div>
          </div>

          {/* Right Live Price Floating Frosted Widget matching the Mockup */}
          <div className={`${isRightSidebarOpen ? 'hidden xl:flex' : 'hidden lg:flex'} flex-col justify-center space-y-2.5 w-full font-sans`}>
            {/* Live Indicator Header */}
            <div className="flex items-center justify-between px-1 text-xs font-bold text-[#11261D] font-sans">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D6344]"></span>
                </span>
                <span className="font-bold text-xs">Live price</span>
              </div>
              <span className="text-[10px] font-sans font-extrabold text-[#0D6344] bg-white/90 border border-emerald-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                REAL-TIME
              </span>
            </div>

            {/* Card 1: Coconut Oil */}
            <div
              onClick={() => {
                const el = document.getElementById('catalog-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-3 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(20,50,30,0.06)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5FAF6] border border-[#E0ECE3] flex items-center justify-center p-1 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <img src="/categories/oils-spices.jpg" alt="Coconut Oil" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291F] tracking-tight truncate">
                    <span className="font-sans group-hover:text-[#0D6344] transition-colors">Coconut Oil</span>
                    <span className="font-sans text-[10px] font-bold text-[#0D6344] bg-[#E8F5EE] border border-[#C3EEDC] px-1.5 py-0.2 rounded-md">1L</span>
                  </div>
                  <div className="text-[10px] text-[#526359] font-medium font-sans mt-0.5 truncate flex items-center gap-1">
                    <Store className="w-2.5 h-2.5 text-[#0D6344] shrink-0" />
                    <span>Al-Iqwan • 1.2 km</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5 shrink-0 pl-2">
                <div className="text-sm font-black text-[#0D6344] font-sans tracking-tight">
                  ₹190/L
                </div>
                <div className="text-[9px] font-bold text-emerald-800 bg-[#E8F5EE] px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  Lowest
                </div>
              </div>
            </div>

            {/* Card 2: ABC Mart comparison */}
            <div
              onClick={() => {
                const el = document.getElementById('catalog-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-3 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(20,50,30,0.06)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5FAF6] border border-[#E0ECE3] flex items-center justify-center p-1 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 text-[#0D6344]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291F] tracking-tight truncate">
                    <span className="font-sans group-hover:text-[#0D6344] transition-colors">ABC Mart</span>
                  </div>
                  <div className="text-[10px] text-[#526359] font-medium font-sans mt-0.5 truncate flex items-center gap-1">
                    <span>Supermarket • 0.5 km</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5 shrink-0 pl-2">
                <div className="text-sm font-black text-slate-700 font-sans tracking-tight">
                  ₹195/L
                </div>
                <div className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  Average
                </div>
              </div>
            </div>

            {/* Card 3: Rice */}
            <div
              onClick={() => {
                const el = document.getElementById('catalog-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-3 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(20,50,30,0.06)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5FAF6] border border-[#E0ECE3] flex items-center justify-center p-1 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <img src="/categories/grains.jpg" alt="Rice" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14291F] tracking-tight truncate">
                    <span className="font-sans group-hover:text-[#0D6344] transition-colors">Rice</span>
                    <span className="font-sans text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-md">5kg</span>
                  </div>
                  <div className="text-[10px] text-[#526359] font-medium font-sans mt-0.5 truncate flex items-center gap-1">
                    <Store className="w-2.5 h-2.5 text-[#0D6344] shrink-0" />
                    <span>Malabar Store • 0.8 km</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5 shrink-0 pl-2">
                <div className="text-sm font-black text-[#0D6344] font-sans tracking-tight">
                  ₹195/L
                </div>
                <div className="text-[9px] font-bold text-emerald-800 bg-[#E8F5EE] px-1.5 py-0.2 rounded-full whitespace-nowrap">
                  Best Price
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. CATEGORIES SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-[#11261D] font-sans m-0">
            Categories
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-[#0D6344] hover:text-[#094E35] flex items-center gap-1 font-sans cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Category Cards Grid (Pastel Palette from Mockup) */}
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 ${isRightSidebarOpen ? 'xl:grid-cols-5 2xl:grid-cols-9' : 'xl:grid-cols-9'
          } gap-2 sm:gap-2.5 xl:gap-3 font-sans`}>
          {desktopCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer text-center group border ${
                  isSelected
                    ? 'bg-[#DCFCE7] border-[#0D6344] shadow-sm ring-2 ring-[#0D6344]/20 scale-[1.02]'
                    : `${cat.bgColor} hover:shadow-sm hover:scale-[1.02]`
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 overflow-hidden transition-transform group-hover:scale-110 p-1"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain rounded-lg drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>
                <span
                  className="text-[11px] font-bold leading-tight line-clamp-1"
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCTS SECTION */}
      <section id="catalog-products-section" className="space-y-3 font-sans">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#11261D] font-sans m-0">
              {searchQuery
                ? `Search Results ("${searchQuery}")`
                : selectedCategoryId === 'all'
                  ? 'Featured Products'
                  : (desktopCategories.find((c) => c.id === selectedCategoryId)?.label || 'Products')}
            </h2>
            <span className="bg-[#E8F5EE] text-[#0D6344] border border-[#C3EEDC] text-[10px] font-bold px-2.5 py-0.5 rounded-full font-sans">
              {displayedProducts.length} items
            </span>
          </div>

          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-[#0D6344] hover:text-[#094E35] flex items-center gap-0.5 font-sans cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Responsive Product Cards Grid */}
        {shops.length === 0 ? (
          /* No Shops in this Location Empty State */
          <div className="py-12 px-6 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs font-malayalam">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
              🏪
            </div>
            <h3 className="text-base font-black text-[#17221D] m-0">
              {currentLocation ? `${currentLocation.name}-ൽ` : 'ഈ പ്രദേശത്ത്'} നിലവിൽ കടകൾ ലഭ്യമല്ല
            </h3>
            <p className="text-xs text-[#66756E] leading-relaxed m-0 max-w-md mx-auto">
              ഈ പ്രദേശത്ത് കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടില്ല. വിലകൾ താരതമ്യം ചെയ്യാനും സാധനങ്ങൾ വാങ്ങാനും കടകൾ ലഭ്യമായ പ്രദേശം തിരഞ്ഞെടുക്കൂ.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="px-6 py-2.5 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>📍 പ്രദേശം മാറ്റുക (Change Location)</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-3.5 ${isRightSidebarOpen
                ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6'
              }`}
          >
            {displayedProducts.length === 0 ? (
              <div className="col-span-full py-12 px-4 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs font-malayalam">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-sm font-black text-[#17221D] m-0">
                  ഉൽപ്പന്നങ്ങൾ ലഭ്യമല്ല
                </h3>
                <p className="text-xs text-[#66756E] m-0">
                  ഈ വിഭാഗത്തിൽ സാധനങ്ങൾ ലഭ്യമല്ല അല്ലെങ്കിൽ തിരയൽ ഫലം കണ്ടെത്താനായില്ല.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="py-2 px-4 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>എല്ലാ ഉൽപ്പന്നങ്ങളും കാണുക</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              visibleProducts.map((product) => {
                const isFav = favoriteSet.has(product.id);
                const qty = basketQuantityMap[product.id] || 0;
                const cheapestShopEntry = Object.entries(product.prices || {}).sort((a, b) => a[1] - b[1])[0];
                const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : 'കുടുംബശ്രീ സ്റ്റാൾ';
                const shopInfo = shopMap.get(lowestShopName.toLowerCase());

                return (
                  <DesktopProductCard
                    key={product.id}
                    product={product}
                    isFav={isFav}
                    qty={qty}
                    shopInfo={shopInfo}
                    lowestShopName={lowestShopName}
                    onToggleFavorite={onToggleFavorite}
                    onSelectProductForDetail={onSelectProductForDetail}
                    onQuantityChange={onQuantityChange}
                    onAddToBasket={onAddToBasket}
                  />
                );
              })
            )}
          </div>
        )}

        {/* Progressive Load More trigger */}
        {displayedProducts.length > visibleCount && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 36)}
              className="px-6 py-2.5 bg-white hover:bg-[#E8F5EE] border border-[#0B8F68]/30 hover:border-[#0B8F68] text-[#063B2A] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-malayalam"
            >
              <span>കൂടുതൽ ഉൽപ്പന്നങ്ങൾ കാണുക ({displayedProducts.length - visibleCount} ബാക്കി)</span>
              <ChevronRight className="w-4 h-4 text-[#0B8F68]" />
            </button>
          </div>
        )}
      </section>

      {/* 4. SPECIAL OFFERS (Matching Image 1) */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
              പ്രത്യേക ഓഫറുകൾ
            </h2>
            {/* Small subtle indication to Flash Deals Page */}
            <button
              type="button"
              onClick={onOpenDeals}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full text-[11px] font-bold text-amber-900 transition-all cursor-pointer font-malayalam"
            >
              <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>ഫ്ലാഷ് ഡീലുകൾ ലഭ്യമാണ്</span>
              <span className="text-rose-600 font-extrabold font-sans">→</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenDeals}
            className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer transition-colors"
          >
            <span>കൂടുതൽ കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Offer Promo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {specialOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => onSelectCategory('vegetables')}
              className="bg-white border border-[#E3ECE7] rounded-2xl p-3.5 shadow-2xs hover:shadow-md hover:border-[#0B8F68] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[120px] group"
            >
              {/* Discount Tag */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${offer.discountBg} font-malayalam shadow-2xs`}>
                  {offer.discount}
                </span>
              </div>

              {/* Title & Image */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-extrabold text-[#17221D] font-malayalam leading-tight m-0">
                    {offer.title}
                  </h4>
                  <span className="text-[10px] text-[#0B8F68] font-bold font-malayalam flex items-center gap-0.5 group-hover:underline">
                    <span>ഇപ്പോൾ വാങ്ങാം</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                  <ProductImage
                    image={offer.image}
                    emoji={offer.emoji}
                    alt={offer.title}
                    className="w-full h-full"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-110"
                    fallbackEmojiClassName="text-2xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
