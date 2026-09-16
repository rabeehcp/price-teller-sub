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
      image: '/products/tomato.webp',
    },
    {
      id: 'fruits',
      label: 'പഴങ്ങൾ',
      emoji: '🍌',
      image: '/products/banana.webp',
    },
    {
      id: 'rice-grains',
      label: 'ധാന്യങ്ങൾ',
      emoji: '🌾',
      image: '/products/rice.webp',
    },
    {
      id: 'dairy',
      label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
      emoji: '🥛',
      image: '/products/milk.webp',
    },
    {
      id: 'spices',
      label: 'മസാലകൾ',
      emoji: '🌶️',
      image: '/products/turmeric-powder.webp',
    },
    {
      id: 'grocery',
      label: 'കറി സാധനങ്ങൾ',
      emoji: '🥫',
      image: '/products/coconut-oil.webp',
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

  // Special Offers data matching Image 1
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
      image: '/products/banana.webp',
      emoji: '🍌',
    },
    {
      id: 'offer-3',
      title: 'തക്കാളി പേസ്റ്റ് & സോസ്',
      discount: '10% ഓഫർ',
      discountBg: 'bg-sky-600',
      image: '/products/tomato.webp',
      emoji: '🍅',
    },
    {
      id: 'offer-4',
      title: 'ധാന്യങ്ങളും അരിയും',
      discount: 'മികച്ച വില',
      discountBg: 'bg-orange-600',
      image: '/products/rice.webp',
      emoji: '🌾',
    },
  ];

  // Cart total calculations
  const totalBasketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HERO BANNER WITH CAROUSEL (Matching Image 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#063B2A] via-[#0B5C40] to-[#E3F2EB] shadow-md border border-[#0B8F68]/20 min-h-[260px] flex items-center justify-between p-8 text-white">
        
        {/* Background Overlay Effects */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#10A978]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#DDF5EA]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Content */}
        <div className="relative z-10 max-w-[55%] space-y-3.5">
          
          <h1 className="text-2xl lg:text-3xl font-black text-white leading-snug font-malayalam tracking-tight m-0 drop-shadow-xs">
            നാടൻ കർഷകരിൽ നിന്ന് നിങ്ങളുടെ വീട്ടിലേക്ക്
          </h1>

          <p className="text-xs lg:text-sm text-[#DDF5EA] font-medium leading-relaxed font-malayalam m-0">
            നമ്മുടെ നാട്ടിലെ വിശ്വസനീയമായ കടകളിൽ നിന്ന് നേരിട്ട്.
          </p>

          {/* 3 Value Pillars */}
          <div className="flex items-center gap-4 text-xs font-semibold text-white/90 pt-1 font-sans">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
              <Tag className="w-3.5 h-3.5 text-[#34D399]" /> Best Prices
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" /> Verified Shops
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
              <Headphones className="w-3.5 h-3.5 text-[#34D399]" /> Local Support
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectCategory('vegetables')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#063B2A] hover:bg-[#084D37] text-white text-xs font-black rounded-full border border-emerald-400/40 shadow-md active:scale-95 transition-all cursor-pointer font-sans"
            >
              <span>Shop Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Produce Basket Graphic with Floating Badge */}
        <div className="relative z-10 w-[42%] max-w-[340px] flex items-center justify-end">
          
          {/* Floating Malayalam Badge ("നല്ലത് നാട്ടിൽ നിന്ന്") */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#063B2A]/90 backdrop-blur-md text-[#DDF5EA] border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold font-malayalam shadow-lg z-20 transform -rotate-6">
            ✨ നല്ലത് നാട്ടിൽ നിന്ന്
          </div>

          <div className="w-full h-56 rounded-2xl overflow-hidden flex items-center justify-center p-2 drop-shadow-2xl">
            <img
              src="https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg"
              alt="Harvest Basket"
              className="max-h-full max-w-full object-contain rounded-xl drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Carousel Arrows & Dots on Bottom Right */}
          <div className="absolute bottom-1 right-2 flex items-center gap-2 bg-[#063B2A]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
            <button
              type="button"
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <span className={`w-3 h-1 rounded-full ${currentSlide === 0 ? 'bg-[#34D399]' : 'bg-white/40'}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${currentSlide === 1 ? 'bg-[#34D399]' : 'bg-white/40'}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${currentSlide === 2 ? 'bg-[#34D399]' : 'bg-white/40'}`} />
            </div>
            <button
              type="button"
              onClick={() => setCurrentSlide((s) => Math.min(2, s + 1))}
              className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
                  {cat.image ? (
                    <ProductImage
                      image={cat.image}
                      emoji={cat.emoji}
                      alt={cat.label}
                      className="w-full h-full"
                      imgClassName="max-h-full max-w-full object-contain"
                      fallbackEmojiClassName="text-2xl"
                    />
                  ) : (
                    <span className="text-xl text-[#063B2A] font-bold">{cat.emoji}</span>
                  )}
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
            const price = priceValues.length > 0 ? Math.min(...priceValues) : 30;
            const basketItem = basket.find((b) => b.productId === product.id);
            const qty = basketItem ? basketItem.quantity : 0;

            const cheapestShopEntry = Object.entries(product.prices || {}).sort((a, b) => a[1] - b[1])[0];
            const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : 'കുടുംബശ്രീ സ്റ്റാൾ';
            const shopInfo = shops.find((s) => s.name.toLowerCase() === lowestShopName.toLowerCase());

            return (
              <div
                key={product.id}
                onClick={() => onSelectProductForDetail(product)}
                className="bg-white border border-[#E3ECE7] rounded-2xl p-3 shadow-2xs hover:border-[#0B8F68] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
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
                <div className="w-full h-24 flex items-center justify-center p-2 my-1">
                  <ProductImage
                    productId={product.id}
                    image={product.image}
                    emoji={product.emoji}
                    alt={product.name}
                    className="w-full h-full"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                    fallbackEmojiClassName="text-4xl"
                  />
                </div>

                {/* Middle Info: Name, Price, Rating */}
                <div className="space-y-1 pt-1">
                  <h3 className="text-xs font-extrabold text-[#17221D] font-malayalam truncate m-0">
                    {product.name}
                  </h3>

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
                  {qty > 0 ? (
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
