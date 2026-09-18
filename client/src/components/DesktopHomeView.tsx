import React, { useState, useMemo } from 'react';
import { Product, Shop, Location, BasketItem, Category } from '../types';
import { ProductImage } from './ProductImage';
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

  // Displayed products with robust category alias matching and Kerala market priority
  const displayedProducts = useMemo(() => {
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
        'rice-grains': ['rice-grains', 'staples', 'pulses-legumes'],
        dairy: ['dairy'],
        spices: ['spices', 'oils-spices', 'oils-sugar'],
        'oils-spices': ['oils-spices', 'spices', 'oils-sugar'],
        beverages: ['beverages', 'drinks', 'biscuits-snacks'],
        'bakery-breakfast': ['bakery-breakfast', 'bakery', 'biscuits-snacks'],
        'cleaning-household': ['household', 'cleaning-household', 'storage-containers'],
        household: ['household', 'cleaning-household', 'storage-containers'],
      };
      const targetCats = aliases[selectedCategoryId] || [selectedCategoryId];
      filtered = products.filter((p) => targetCats.includes(p.categoryId));
    }

    // Natural Kerala market priority: daily fresh groceries first (tomatoes, onions, potatoes, banana, milk, etc.)
    const priorityNames = [
      'തക്കാളി', 'tomato', 'സവാള', 'onion', 'ഉരുളക്കിഴങ്ങ്', 'potato',
      'പച്ചമുളക്', 'green chilli', 'ഇഞ്ചി', 'ginger', 'വെളുത്തുള്ളി', 'garlic',
      'വാഴപ്പഴം', 'banana', 'ആപ്പിൾ', 'apple', 'ഓറഞ്ച്', 'orange', 'മുന്തിരി', 'grapes',
      'തേങ്ങ', 'coconut', 'കാരറ്റ്', 'carrot', 'പാൽ', 'milk', 'വെളിച്ചെണ്ണ', 'oil', 'അരി', 'rice'
    ];

    return [...filtered].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Ensure packaged junk snacks don't precede fresh daily groceries/vegetables
      const aIsSnack = aName.includes('sauce') || aName.includes('ketchup') || aName.includes('chips') || aName.includes('tangles') || aName.includes('mad angles');
      const bIsSnack = bName.includes('sauce') || bName.includes('ketchup') || bName.includes('chips') || bName.includes('tangles') || bName.includes('mad angles');
      if (aIsSnack && !bIsSnack) return 1;
      if (!aIsSnack && bIsSnack) return -1;

      const aIndex = priorityNames.findIndex((n) => aName.includes(n));
      const bIndex = priorityNames.findIndex((n) => bName.includes(n));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return aName.localeCompare(bName);
    });
  }, [products, searchQuery, selectedCategoryId]);

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
    <div className="space-y-6 font-sans">
      
      {/* 1. HERO BANNER WITH PLATFORM PURPOSE & PRICE COMPARISON VISUAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#063B2A] via-[#0B5C40] to-[#E3F2EB] shadow-md border border-[#0B8F68]/20 flex flex-col min-[1380px]:flex-row items-stretch min-[1380px]:items-center justify-between gap-5 p-5 sm:p-6 min-[1380px]:p-7 text-white min-h-0">
        
        {/* Background Overlay Effects */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#10A978]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#DDF5EA]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Content */}
        <div className="relative z-10 w-full min-[1380px]:max-w-[58%] space-y-3">
          
          <h1 className="text-xl sm:text-2xl min-[1380px]:text-3xl font-black text-white leading-snug font-malayalam tracking-tight m-0 drop-shadow-xs">
            നാട്ടിലെ കടകളിൽ നിന്ന് <span className="text-[#7FFFC4]">നിങ്ങളുടെ ആവശ്യങ്ങൾ മികച്ച വിലയിൽ</span>
          </h1>

          <p className="text-xs lg:text-sm text-[#DDF5EA] font-medium leading-relaxed font-malayalam m-0">
            അടുത്തുള്ള കടകളിലെ വിലകൾ താരതമ്യം ചെയ്ത് നിങ്ങൾക്ക് അനുയോജ്യമായ വില കണ്ടെത്തൂ.
          </p>

          {/* 4 Value Pillars */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 pt-1 font-malayalam flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15">
              <Store className="w-3.5 h-3.5 text-[#34D399]" /> പ്രാദേശിക കടകൾ
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15">
              <TrendingDown className="w-3.5 h-3.5 text-[#34D399]" /> വില താരതമ്യം
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15">
              <Tag className="w-3.5 h-3.5 text-[#34D399]" /> മികച്ച ലാഭം
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-[#34D399]" /> സമീപത്തുള്ള ഷോപ്പിംഗ്
            </span>
          </div>

        </div>

        {/* Right Multi-Category Price Comparison Visual Card */}
        <div className="relative z-10 w-full min-[1380px]:w-[350px] min-[1380px]:max-w-[370px] shrink-0 space-y-2">
          
          {/* Top Pill */}
          <div className="flex items-center justify-between bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl text-[11px] font-bold text-white font-malayalam shadow-md">
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#34D399]" /> സമീപത്തെ കടകളുടെ തത്സമയ നിരക്ക്
            </span>
            <span className="bg-[#34D399] text-[#063B2A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              ലഭ്യം
            </span>
          </div>

          {/* Comparison Cards Stack */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white text-slate-800 space-y-2 font-malayalam">
            {/* Comparison Item 1: Grocery / Oil */}
            <div className="flex items-center justify-between p-2 bg-[#F5F8F6] rounded-xl border border-[#E3ECE7]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-0.5 border border-[#E3ECE7] shrink-0">
                  <img src="/categories/oils-spices.jpg" alt="Oil" className="w-full h-full object-contain rounded" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">വെളിച്ചെണ്ണ 1L</div>
                  <div className="text-[10px] text-slate-500 truncate">Al-Iqwan • 1.2 km</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-[#0B8F68] font-sans">₹145</div>
                <div className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-sans">₹10 ലാഭം</div>
              </div>
            </div>

            {/* Comparison Item 2: Staples / Rice */}
            <div className="flex items-center justify-between p-2 bg-[#F5F8F6] rounded-xl border border-[#E3ECE7]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-0.5 border border-[#E3ECE7] shrink-0">
                  <img src="/categories/grains.jpg" alt="Rice" className="w-full h-full object-contain rounded" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">മട്ട അരി 5kg</div>
                  <div className="text-[10px] text-slate-500 truncate">Malabar Store • 0.8 km</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-[#0B8F68] font-sans">₹225</div>
                <div className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-sans">₹15 ലാഭം</div>
              </div>
            </div>

            {/* Category Ribbon */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[9px] sm:text-[10px] font-bold text-slate-600 overflow-hidden">
              <span className="flex items-center gap-1 min-w-0">
                <img src="/categories/grocery.jpg" alt="" className="w-3.5 h-3.5 object-contain rounded shrink-0" />
                <span className="truncate">ഗ്രോസറി</span>
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <img src="/categories/dairy.jpg" alt="" className="w-3.5 h-3.5 object-contain rounded shrink-0" />
                <span className="truncate">പാൽ</span>
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <img src="/categories/grains.jpg" alt="" className="w-3.5 h-3.5 object-contain rounded shrink-0" />
                <span className="truncate">ധാന്യം</span>
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <img src="/categories/vegetables.jpg" alt="" className="w-3.5 h-3.5 object-contain rounded shrink-0" />
                <span className="truncate">പച്ചക്കറി</span>
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <img src="/categories/oils-spices.jpg" alt="" className="w-3.5 h-3.5 object-contain rounded shrink-0" />
                <span className="truncate">മസാല</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. CATEGORIES SECTION (Matching Image 1) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
            വിഭാഗങ്ങൾ
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer transition-colors"
          >
            <span>എല്ലാം കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Category Cards Grid (9 items starting with "എല്ലാം") */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-9 gap-2 sm:gap-2.5 xl:gap-3 font-malayalam">
          {desktopCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-center group border ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-2 ring-[#0B8F68]/20 scale-[1.02]'
                    : 'bg-white border-[#E3ECE7] hover:bg-[#F5F8F6] hover:border-[#C3EEDC] shadow-2xs'
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
                  className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-[#063B2A]' : 'text-[#17221D]'
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
            className={`grid gap-3 sm:gap-3.5 ${
              isRightSidebarOpen
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
              displayedProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                const priceValues = Object.values(product.prices || {}).filter(p => typeof p === 'number' && p > 0);
                const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 0;
                const basketItem = basket.find((b) => b.productId === product.id);
                const qty = basketItem ? basketItem.quantity : 0;

              const cheapestShopEntry = Object.entries(product.prices || {}).sort((a, b) => a[1] - b[1])[0];
              const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : 'കുടുംബശ്രീ സ്റ്റാൾ';
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
                      <h3 className="text-xs font-extrabold text-[#17221D] font-malayalam truncate m-0">
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
                        {price > 0 ? `₹${price}` : 'ലഭ്യമല്ല'}
                      </span>
                      {price > 0 && (
                        <span className="text-[10px] text-slate-500 font-sans">
                          /{product.defaultUnit || 'kg'}
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
            })
          )}
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
