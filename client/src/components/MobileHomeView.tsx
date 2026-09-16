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
  // Categories matching Desktop view exactly
  const homeCategories = [
    {
      id: 'vegetables',
      label: 'പച്ചക്കറികൾ',
      emoji: '🥬',
      image: '/products/tomato.webp',
      fallbackEmoji: '🥬',
    },
    {
      id: 'fruits',
      label: 'പഴങ്ങൾ',
      emoji: '🍌',
      image: '/products/banana.webp',
      fallbackEmoji: '🍌',
    },
    {
      id: 'rice-grains',
      label: 'ധാന്യങ്ങൾ',
      emoji: '🌾',
      image: '/products/rice.webp',
      fallbackEmoji: '🌾',
    },
    {
      id: 'dairy',
      label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
      emoji: '🥛',
      image: '/products/milk.webp',
      fallbackEmoji: '🥛',
    },
    {
      id: 'spices',
      label: 'മസാലകൾ',
      emoji: '🌶️',
      image: '/products/turmeric-powder.webp',
      fallbackEmoji: '🌶️',
    },
    {
      id: 'grocery',
      label: 'കറി സാധനങ്ങൾ',
      emoji: '🥫',
      image: '/products/coconut-oil.webp',
      fallbackEmoji: '🥫',
    },
    {
      id: 'all',
      label: 'കൂടുതൽ',
      emoji: '⋯',
      fallbackEmoji: '⋯',
      isMore: true,
    },
  ];

  // Pick top popular products (or filtered by search if typed)
  const popularProducts = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q))
      );
    }

    // Default popular products: Tomato, Banana, Onion, Carrot, Brinjal, Beans, etc.
    const priorityNames = ['tomato', 'banana', 'onion', 'carrot', 'brinjal', 'beans', 'cabbage', 'chilli'];
    const sorted = [...products].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIndex = priorityNames.findIndex((n) => aName.includes(n));
      const bIndex = priorityNames.findIndex((n) => bName.includes(n));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });

    return sorted.slice(0, 12);
  }, [products, searchQuery]);

  return (
    <div className="md:hidden space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP SEARCH INPUT BAR (Matching Screen 1) */}
      <div className="pt-1">
        <div className="relative flex items-center bg-[#F5F8F6] border border-[#E3ECE7] rounded-full p-1 pl-3.5 shadow-2xs">
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
              className="w-8 h-8 rounded-full bg-[#063B2A] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. GREEN HERO BANNER CARD (Matching Screen 1) */}
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#063B2A] via-[#084D37] to-[#0B8F68] text-white p-5 shadow-sm min-h-[145px] flex items-center justify-between">
          
          {/* Subtle Glows */}
          <div className="absolute top-0 right-1/3 w-36 h-36 bg-[#10A978]/15 rounded-full blur-xl pointer-events-none" />

          {/* Left Text & CTA */}
          <div className="relative z-10 max-w-[62%] space-y-1.5">
            <h2 className="text-base sm:text-lg font-black text-white leading-tight font-malayalam m-0">
              നാടൻ കർഷകരിൽ നിന്ന് നേരിട്ട്!
            </h2>
            <p className="text-[11px] text-[#DDF5EA] font-medium leading-tight font-malayalam m-0">
              പച്ചക്കറികളും ഫ്രെഷായ ഉൽപ്പന്നങ്ങൾ
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectCategory('vegetables')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-[#063B2A] text-[11px] font-black rounded-full shadow-xs active:scale-95 transition-all font-malayalam cursor-pointer"
              >
                <span>കാണുക</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Basket Graphic */}
          <div className="relative z-10 w-28 h-28 shrink-0 flex items-center justify-center drop-shadow-md">
            <img
              src="https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg"
              alt="Fresh harvest"
              onError={(e) => {
                // Fallback icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-contain drop-shadow-lg"
            />
            {/* Fallback emoji */}
            <span className="text-5xl select-none" style={{ display: 'none' }}>🧺</span>
          </div>

        </div>

        {/* Dots Pagination Indicator (Matching Screen 1) */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="w-4 h-1.5 bg-[#0B8F68] rounded-full transition-all" />
          <span className="w-1.5 h-1.5 bg-[#D5DFD9] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#D5DFD9] rounded-full" />
        </div>
      </div>

      {/* 3. CATEGORIES SECTION (Matching Desktop Categories) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">
            വിഭാഗങ്ങൾ
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
          >
            <span>എല്ലാം കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7 Category Rounded Cards Grid (Matching Desktop 7 Categories) */}
        <div className="grid grid-cols-4 gap-2 font-malayalam">
          {homeCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all cursor-pointer text-center group ${
                  isSelected
                    ? 'bg-[#E8F5EE] border-2 border-[#0B8F68] shadow-xs'
                    : 'bg-[#F5F8F6] border border-[#E3ECE7] hover:bg-[#E8F5EE] hover:border-[#C3EEDC]'
                }`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-1 overflow-hidden transition-transform group-hover:scale-105">
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
                    <span className="text-xl text-[#063B2A] font-bold">{cat.fallbackEmoji}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#17221D] leading-tight line-clamp-2">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. POPULAR PRODUCTS SECTION (Matching Screen 1) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#17221D] font-malayalam m-0">
            ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ
          </h2>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              if (onViewAllProducts) onViewAllProducts();
            }}
            className="text-xs font-bold text-[#0B8F68] hover:text-[#063B2A] flex items-center gap-0.5 font-malayalam cursor-pointer"
          >
            <span>എല്ലാം കാണുക</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Products Grid matching Screen 1 Card Design */}
        <div className="grid grid-cols-3 gap-2.5">
          {popularProducts.map((product) => {
            const isFav = favorites.includes(product.id);
            const priceValues = Object.values(product.prices || {});
            const price = priceValues.length > 0 ? Math.min(...priceValues) : 30;
            const basketItem = basket.find((b) => b.productId === product.id);
            const qty = basketItem ? basketItem.quantity : 0;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProductForDetail(product)}
                className="bg-white border border-[#E3ECE7] rounded-2xl p-2.5 shadow-2xs hover:border-[#0B8F68] hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer relative group"
              >
                {/* Top: Favorite Heart Icon */}
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
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#8A9992]'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Image (Using existing ImageKit images via ProductImage) */}
                <div className="w-full h-16 flex items-center justify-center p-1 my-1">
                  <ProductImage
                    productId={product.id}
                    image={product.image}
                    emoji={product.emoji}
                    alt={product.name}
                    className="w-full h-full"
                    imgClassName="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                    fallbackEmojiClassName="text-2xl"
                  />
                </div>

                {/* Bottom Info: Name, Price, and Plus Button */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-[#17221D] font-malayalam truncate m-0">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#17221D] font-sans">
                      ₹ {price} <span className="text-[10px] text-[#8A9992] font-normal">/{product.defaultUnit || 'kg'}</span>
                    </span>

                    <div onClick={(e) => e.stopPropagation()}>
                      {qty > 0 ? (
                        <div className="flex items-center bg-[#063B2A] text-white rounded-full px-1 py-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(product.id, -1)}
                            className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded-full"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-1 text-[10px] font-black font-sans">{qty}</span>
                          <button
                            type="button"
                            onClick={() => onQuantityChange(product.id, 1)}
                            className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded-full"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToBasket(product, product.defaultUnit)}
                          className="w-6 h-6 rounded-full bg-[#063B2A] hover:bg-[#0B8F68] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
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
      </div>

    </div>
  );
};
