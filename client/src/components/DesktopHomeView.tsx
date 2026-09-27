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

      {/* 1. HERO BANNER: EXACT MATCH TO USER'S SCREENSHOT */}
      <div className="relative overflow-hidden rounded-3xl bg-[#E4F2E9] min-h-[220px] lg:min-h-[250px] p-6 sm:p-8 lg:p-9 shadow-xs flex items-center justify-between font-sans">

        {/* Left Content Column */}
        <div className="relative z-10 space-y-2.5 max-w-md lg:max-w-lg shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1A251E] font-malayalam tracking-tight leading-[1.25] m-0">
            ആവശ്യമായതെല്ലാം,<br />
            മികച്ച വിലയിൽ കണ്ടെത്തൂ.
          </h1>

          <p className="text-xs sm:text-sm text-[#38483F] font-medium font-sans m-0">
            Find and compare local grocery prices in Kerala
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('catalog-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center px-6 py-2 rounded-full bg-[#107048] hover:bg-[#0B5C3A] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer font-malayalam"
            >
              വിലകൾ കാണാം
            </button>
          </div>
        </div>

        {/* Right Side: Fresh Groceries Basket & Floating Live Price Card */}
        <div className="relative flex items-center justify-end flex-1 h-full min-h-[200px] pointer-events-none sm:pointer-events-auto">
          {/* Fresh Groceries Basket Image */}
          <div className="relative w-72 sm:w-84 md:w-96 lg:w-[420px] h-48 sm:h-56 lg:h-60 shrink-0">
            <img
              src="/hero-groceries-fresh.jpg"
              alt="Fresh Groceries Basket"
              className="w-full h-full object-contain object-right mix-blend-multiply filter contrast-[1.03]"
              loading="eager"
            />

            {/* Floating Glassmorphic Live Price Card (Exact Match to Screenshot) */}
            <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.07)] w-[155px] sm:w-[170px] space-y-2 select-none">
              <div className="text-[11px] font-semibold text-[#1A251E] font-sans">
                Live price
              </div>

              {/* Row 1: Coconut Oil */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E3ECE7] flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                  <img src="/categories/oils-spices.jpg" alt="Coconut Oil" className="w-full h-full object-contain rounded" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[10px] text-slate-600 font-sans truncate">Coconut Oil</div>
                  <div className="text-[11px] font-bold text-slate-900 font-sans">₹190/L</div>
                </div>
              </div>

              {/* Row 2: ABC Mart */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E3ECE7] flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                  <img src="/categories/vegetables.jpg" alt="ABC Mart" className="w-full h-full object-contain rounded" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[10px] text-slate-600 font-sans truncate">ABC Mart:</div>
                  <div className="text-[11px] font-bold text-slate-900 font-sans">₹195/L</div>
                </div>
              </div>

              {/* Row 3: Rice */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E3ECE7] flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                  <img src="/categories/grains.jpg" alt="Rice" className="w-full h-full object-contain rounded" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[10px] text-slate-600 font-sans truncate">Rice</div>
                  <div className="text-[11px] font-bold text-slate-900 font-sans">₹195/L</div>
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
