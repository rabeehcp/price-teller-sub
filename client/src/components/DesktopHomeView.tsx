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
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 7 Categories matching Image 1
  const desktopCategories = [
    {
      id: 'vegetables',
      label: 'പച്ചക്കറികൾ',
      emoji: '🥬',
    },
    {
      id: 'fruits',
      label: 'പഴങ്ങൾ',
      emoji: '🍌',
    },
    {
      id: 'rice-grains',
      label: 'ധാന്യങ്ങൾ',
      emoji: '🌾',
    },
    {
      id: 'dairy',
      label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
      emoji: '🥛',
    },
    {
      id: 'spices',
      label: 'മസാലകൾ',
      emoji: '🌶️',
    },
    {
      id: 'grocery',
      label: 'കറി സാധനങ്ങൾ',
      emoji: '🥫',
    },
    {
      id: 'all',
      label: 'കൂടുതൽ',
      emoji: '⋯',
      isMore: true,
    },
  ];

  // Popular products matching Image 1
  const displayedProducts = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q))
      );
    }

    if (selectedCategoryId !== 'all') {
      const filtered = products.filter((p) => p.categoryId === selectedCategoryId);
      if (filtered.length > 0) return filtered;
    }

    // Default top 5 popular products in Kerala stores
    const priorityNames = ['tomato', 'banana', 'onion', 'coconut', 'milk', 'carrot', 'green chilli', 'potato'];
    const sorted = [...products].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      // Ensure packaged sauces/chips don't displace fresh vegetables
      const aIsPackaged = aName.includes('sauce') || aName.includes('ketchup') || aName.includes('chips') || aName.includes('squash');
      const bIsPackaged = bName.includes('sauce') || bName.includes('ketchup') || bName.includes('chips') || bName.includes('squash');
      if (aIsPackaged && !bIsPackaged) return 1;
      if (!aIsPackaged && bIsPackaged) return -1;

      const aIndex = priorityNames.findIndex((n) => aName.includes(n));
      const bIndex = priorityNames.findIndex((n) => bName.includes(n));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });

    return sorted.slice(0, 5);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#063B2A] via-[#0B5C40] to-[#E3F2EB] shadow-md border border-[#0B8F68]/20 min-h-[260px] flex items-center justify-between p-8 text-white">
        
        {/* Background Overlay Effects */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#10A978]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#DDF5EA]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Content */}
        <div className="relative z-10 max-w-[55%] space-y-3.5">
          
          <h1 className="text-2xl lg:text-3xl font-black text-white leading-snug font-malayalam tracking-tight m-0 drop-shadow-xs">
            നാട്ടിലെ കടകളിൽ നിന്ന്<br />
            <span className="text-[#7FFFC4]">നിങ്ങളുടെ ആവശ്യങ്ങൾ മികച്ച വിലയിൽ</span>
          </h1>

          <p className="text-xs lg:text-sm text-[#DDF5EA] font-medium leading-relaxed font-malayalam m-0">
            അടുത്തുള്ള കടകളിലെ വിലകൾ താരതമ്യം ചെയ്ത് നിങ്ങൾക്ക് അനുയോജ്യമായ വില കണ്ടെത്തൂ.
          </p>

          {/* 4 Value Pillars */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white/90 pt-1 font-malayalam flex-wrap">
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
        <div className="relative z-10 w-[42%] max-w-[360px] space-y-2">
          
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
                <span className="text-xl shrink-0 select-none">🫗</span>
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
                <span className="text-xl shrink-0 select-none">🌾</span>
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
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span>🥫 ഗ്രോസറി</span>
              <span>🥛 പാൽ</span>
              <span>🌾 ധാന്യം</span>
              <span>🥬 പച്ചക്കറി</span>
              <span>🌶️ മസാല</span>
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

        {/* 7 Category Cards Row */}
        <div className="grid grid-cols-7 gap-3 font-malayalam">
          {desktopCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer text-center group ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-2 border-[#0B8F68] shadow-xs scale-102'
                    : 'bg-white border border-[#E3ECE7] hover:bg-[#F5F8F6] hover:border-[#C3EEDC] shadow-2xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1.5 overflow-hidden transition-transform group-hover:scale-110">
                  <span className="text-xl text-[#063B2A] font-bold">{cat.emoji}</span>
                </div>
                <span className={`text-[11px] font-bold leading-tight line-clamp-1 ${isSelected ? 'text-[#063B2A]' : 'text-[#17221D]'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS (Matching Image 1) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
              ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ
            </h2>
            <span className="bg-[#E8F5EE] text-[#0B8F68] border border-[#C3EEDC] text-[10px] font-bold px-2 py-0.5 rounded-full font-malayalam">
              മുഴുവൻ കൂട്ടുകൾ
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer transition-colors"
          >
            <span>എല്ലാം കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Product Cards Grid */}
        <div className="grid grid-cols-5 gap-3.5">
          {displayedProducts.map((product) => {
            const isFav = favorites.includes(product.id);
            const priceValues = Object.values(product.prices || {});
            const price = priceValues.length > 0 ? Math.round(Math.min(...priceValues)) : 30;
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
                className={`bg-white border rounded-2xl p-3 shadow-2xs transition-all flex flex-col justify-between cursor-pointer group ${
                  isOutOfStock ? 'border-red-100 bg-red-50/15 opacity-85' : 'border-[#E3ECE7] hover:border-[#0B8F68] hover:shadow-md'
                }`}
              >
                {/* Top: Heart Favorite Button */}
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(product);
                    }}
                    className="p-1 text-[#8A9992] hover:text-[#E11D48] transition-colors rounded-full cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#8A9992]'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Thumbnail (ImageKit image via ProductImage) */}
                <div className="w-full h-24 flex items-center justify-center p-2 my-1 relative">
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
                      ₹ {price}
                    </span>
                    <span className="text-[10px] text-[#8A9992] font-normal font-sans">
                      /{product.defaultUnit || 'kg'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-[10px] text-[#8A9992] font-sans">
                    <Star className="w-3 h-3 fill-[#F4B740] text-[#F4B740]" />
                    <span className="font-bold text-[#17221D]">4.5</span>
                    <span>(120)</span>
                  </div>

                  {/* Shop & Location pill */}
                  <div className="pt-1 text-[10px] text-[#66756E] space-y-0.5 border-t border-[#F0F4F2]">
                    <div className="flex items-center gap-1 text-[#063B2A] font-bold font-malayalam truncate">
                      <Store className="w-3 h-3 text-[#0B8F68] shrink-0" />
                      <span className="truncate">{lowestShopName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#8A9992] font-sans text-[9px]">
                      <MapPin className="w-2.5 h-2.5 text-[#8A9992]" />
                      <span>Areekode • {shopInfo?.distanceKm || 1.2} km</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
                  {isOutOfStock ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-1.5 px-3 bg-red-50 border border-red-200 text-red-600 text-[11px] font-black rounded-xl select-none flex items-center justify-center gap-1 font-malayalam cursor-not-allowed"
                    >
                      <span>🚫 സ്റ്റോക്കില്ല</span>
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
          })}
        </div>
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

        {/* 4 Offer Promo Cards Grid */}
        <div className="grid grid-cols-4 gap-3.5">
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
