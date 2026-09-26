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
      className={`bg-white border rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative ${
        isOutOfStock ? 'border-red-200 opacity-90' : 'border-[#E3ECE7] hover:border-[#0B8F68]/40'
      }`}
    >
      {/* Top: Distance / Shop Pill & Wishlist Button */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-bold text-[#063B2A] bg-[#E8F5EE] border border-[#C3EEDC] px-2 py-0.5 rounded-full truncate max-w-[130px] font-malayalam">
          {shopInfo?.name || lowestShopName}
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
          alt={getMalayalamName(product.name)}
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
          <h3 className="text-xs font-extrabold text-[#17221D] font-malayalam truncate m-0">
            {getMalayalamName(product.name)}
          </h3>
          {isOutOfStock && (
            <span className="shrink-0 text-[8px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-mono">
              OUT
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-[#17221D] font-sans">
            {price > 0 ? `₹${price}` : 'ലഭ്യമല്ല'}
          </span>
          {price > 0 && (
            <span className="text-[10px] text-slate-500 font-sans whitespace-nowrap">
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
        <div className="flex items-center gap-1 text-[10px] text-[#8F9F97] font-malayalam pt-0.5 truncate">
          <span className="font-bold text-[#4D6158] truncate">
            {lowestShopName}
          </span>
          <span>•</span>
          <span>1.2 km</span>
        </div>
      </div>

      {/* Bottom: Add to Basket / Stepper or Out of Stock State */}
      <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
        {isOutOfStock || price <= 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-1.5 px-3 bg-slate-100 border border-slate-200 text-slate-400 text-[11px] font-black rounded-xl select-none flex items-center justify-center gap-1 font-malayalam cursor-not-allowed"
          >
            <span>{isOutOfStock ? '🚫 സ്റ്റോക്കില്ല' : '🚫 ലഭ്യമല്ല'}</span>
          </button>
        ) : qty > 0 ? (
          <div className="flex items-center justify-between bg-[#063B2A] text-white rounded-xl p-1 shadow-xs">
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
            className="w-full py-1.5 px-3 bg-[#063B2A] hover:bg-[#0B8F68] active:scale-95 text-white text-[11px] font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 font-malayalam cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>കാർട്ടിൽ ചേർക്കുക</span>
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

  // 9 Categories starting with "എല്ലാം" (All) with realistic high-resolution images
  const desktopCategories = [
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
      label: 'ബേക്കറി & സ്നാക്കുകൾ',
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

      {/* 1. HERO BANNER: KERALA MARKETPLACE WITH RESPONSIVE BACKGROUND ARTWORK */}
      <div className="relative overflow-hidden rounded-3xl bg-[#EEDBBE] shadow-xs border border-[#DFCEB7] p-4 sm:p-4.5 md:p-5 lg:p-6 xl:p-7 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[260px] text-[#2A241C] flex flex-col justify-center">

        {/* Responsive Multi-Breakpoint Background Artwork */}
        <picture className="absolute inset-0 w-full h-full pointer-events-none">
          <source media="(min-width: 1536px)" srcSet="/hero-warm-market-blend.jpg" />
          <source media="(min-width: 1024px)" srcSet="/hero-warm-market-blend.jpg" />
          <source media="(min-width: 640px)" srcSet="/hero-warm-market-blend.jpg" />
          <img
            src="/hero-warm-market-blend.jpg"
            alt="Kerala Village Market Background"
            className="w-full h-full object-cover object-[78%_center] sm:object-[70%_center] md:object-[60%_center] lg:object-center xl:object-center filter contrast-[1.03] brightness-[0.98] transition-all duration-300"
            loading="eager"
            decoding="async"
          />
        </picture>

        {/* Seamless Vignette & Lighting Blend for Maximum Visual Appeal & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A180E]/25 via-transparent to-[#2A180E]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

        {/* Side-by-Side Adaptive Grid / Centered on Tablet & Smaller Screens */}
        <div className={`relative z-10 w-full grid grid-cols-1 ${
          isRightSidebarOpen
            ? 'xl:grid-cols-[1.15fr_310px] 2xl:grid-cols-[1.25fr_340px]'
            : 'lg:grid-cols-[1.15fr_310px] xl:grid-cols-[1.2fr_330px] 2xl:grid-cols-[1.3fr_350px]'
        } items-center justify-center gap-5`}>

          {/* Left Content Column: Solid Clean Warm Card */}
          <div className="bg-[#DED8CF] rounded-3xl p-5 sm:p-6 shadow-sm border border-[#CEBEAC] space-y-3.5 min-w-0 max-w-xl lg:max-w-none mx-auto lg:mx-0 transition-all">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D0C5B4]/60 border border-[#BEB09C] rounded-full text-xs font-bold text-[#7C3A20] shadow-2xs font-malayalam">
              <Sparkles className="w-3.5 h-3.5 text-[#BC681D] shrink-0" />
              <span>പ്രാദേശിക കടകളിലെ തത്സമയ വിലനിലവാരം</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-[28px] xl:text-[30px] font-black text-[#5C2B14] leading-tight font-padmanabha tracking-tight m-0">
              ഗ്രാമത്തിലെ കടകളിൽ നിന്നും{' '}
              <span className="text-[#8C4318]">
                മികച്ച വില കണ്ടെത്തൂ.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#4A3F33] font-medium leading-relaxed font-malayalam m-0 max-w-xl">
              നിങ്ങളുടെ അടുത്തുള്ള മികച്ച സ്റ്റോറുകളിലെ വിലകൾ തത്സമയം താരതമ്യം ചെയ്ത് ഏറ്റവും കുറഞ്ഞ നിരക്കിൽ സാധനങ്ങൾ കണ്ടെത്തൂ.
            </p>

            {/* CTA & 4 Value Pillars */}
            <div className="flex items-center gap-2 pt-1 font-malayalam flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#BC681D] hover:bg-[#A85814] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span>വിലകൾ കാണാം 🛡️</span>
              </button>

              <span className="flex items-center gap-1.5 bg-[#D2C5B3]/70 hover:bg-[#D9CEBD] border border-[#BFAFA0] px-3 py-1.5 rounded-full shadow-2xs text-xs font-bold text-[#4A3F33] transition-all cursor-default shrink-0">
                <Store className="w-3.5 h-3.5 text-[#BC681D]" /> പ്രാദേശിക കടകൾ
              </span>
              <span className="flex items-center gap-1.5 bg-[#D2C5B3]/70 hover:bg-[#D9CEBD] border border-[#BFAFA0] px-3 py-1.5 rounded-full shadow-2xs text-xs font-bold text-[#4A3F33] transition-all cursor-default shrink-0">
                <TrendingDown className="w-3.5 h-3.5 text-[#BC681D]" /> വില താരതമ്യം
              </span>
              <span className="flex items-center gap-1.5 bg-[#D2C5B3]/70 hover:bg-[#D9CEBD] border border-[#BFAFA0] px-3 py-1.5 rounded-full shadow-2xs text-xs font-bold text-[#4A3F33] transition-all cursor-default shrink-0">
                <Tag className="w-3.5 h-3.5 text-[#BC681D]" /> മികച്ച ലാഭം
              </span>
            </div>
          </div>

          {/* Right Live Price Comparison Widget - Exact Solid Floating Cards Design */}
          <div className={`${isRightSidebarOpen ? 'hidden xl:flex' : 'hidden lg:flex'} flex-col justify-center space-y-3 w-full font-sans`}>
            {/* Card 1: Coconut Oil */}
            <div className="flex items-center justify-between p-3.5 sm:p-4.5 bg-[#DED8CF] rounded-[26px] border border-[#CEBEAC] shadow-sm transition-all hover:bg-[#E3DDCF] hover:shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-transparent border border-[#C6BBAA] flex items-center justify-center p-1.5 shrink-0">
                  <img src="/categories/oils-spices.jpg" alt="വെളിച്ചെണ്ണ" className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-black text-[#19271B] font-padmanabha tracking-tight truncate">
                    വെളിച്ചെണ്ണ 1L
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#6E6356] font-medium font-sans mt-0.5 truncate">
                    Al-Iqwan • 1.2 km
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0 pl-2">
                <div className="text-base sm:text-lg font-black text-[#0B3D27] font-sans tracking-tight">
                  ₹145
                </div>
                <div className="text-[11px] font-bold text-[#553C22] bg-[#C6B7A4]/80 border border-[#B3A08A] px-2.5 py-0.5 rounded-full font-malayalam whitespace-nowrap shadow-2xs">
                  ₹10 ലാഭം
                </div>
              </div>
            </div>

            {/* Card 2: Matta Rice */}
            <div className="flex items-center justify-between p-3.5 sm:p-4.5 bg-[#DED8CF] rounded-[26px] border border-[#CEBEAC] shadow-sm transition-all hover:bg-[#E3DDCF] hover:shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-transparent border border-[#C6BBAA] flex items-center justify-center p-1.5 shrink-0">
                  <img src="/categories/grains.jpg" alt="മട്ട അരി" className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-black text-[#19271B] font-padmanabha tracking-tight truncate">
                    മട്ട അരി 5kg
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#6E6356] font-medium font-sans mt-0.5 truncate">
                    Malabar Store • 0.8 km
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0 pl-2">
                <div className="text-base sm:text-lg font-black text-[#0B3D27] font-sans tracking-tight">
                  ₹225
                </div>
                <div className="text-[11px] font-bold text-[#553C22] bg-[#C6B7A4]/80 border border-[#B3A08A] px-2.5 py-0.5 rounded-full font-malayalam whitespace-nowrap shadow-2xs">
                  ₹15 ലാഭം
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. CATEGORIES SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-[#2A241C] font-malayalam m-0">
            വിഭാഗങ്ങൾ
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-[#BC681D] hover:text-[#7C3A20] flex items-center gap-0.5 font-malayalam cursor-pointer transition-colors"
          >
            <span>എല്ലാം കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Category Cards Grid (9 items starting with "എല്ലാം") */}
        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 ${isRightSidebarOpen ? 'xl:grid-cols-5 2xl:grid-cols-9' : 'xl:grid-cols-9'
          } gap-2 sm:gap-2.5 xl:gap-3 font-malayalam`}>
          {desktopCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-center group border ${isSelected
                    ? 'bg-[#DFCFB6] border-[#BC681D] shadow-sm ring-2 ring-[#BC681D]/20 scale-[1.02]'
                    : 'bg-white border-[#E0D7CB] hover:bg-[#FAF7F2] hover:border-[#BC681D]/40 shadow-2xs'
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 overflow-hidden transition-transform group-hover:scale-110 p-1 ${cat.bgColor} shadow-2xs`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain rounded-lg drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight line-clamp-1 ${isSelected ? 'text-[#7C3A20] font-black' : 'text-[#3B342B]'
                    }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCTS SECTION (Displaying "എല്ലാ ഉൽപ്പന്നങ്ങളും" or the selected category) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
              {searchQuery
                ? `തിരയൽ ഫലങ്ങൾ ("${searchQuery}")`
                : selectedCategoryId === 'all'
                  ? 'എല്ലാ ഉൽപ്പന്നങ്ങളും'
                  : (desktopCategories.find((c) => c.id === selectedCategoryId)?.label || 'ഉൽപ്പന്നങ്ങൾ')}
            </h2>
            <span className="bg-[#E8F5EE] text-[#0B8F68] border border-[#C3EEDC] text-[10px] font-bold px-2.5 py-0.5 rounded-full font-sans">
              {displayedProducts.length} ഇനങ്ങൾ
            </span>
          </div>

          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer transition-colors"
            >
              <span>എല്ലാം കാണുക</span>
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
          <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
            പ്രത്യേക ഓഫറുകൾ
          </h2>
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
