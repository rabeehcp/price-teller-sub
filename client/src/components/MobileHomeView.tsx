import React, { useState, useMemo } from 'react';
import { Category, Product, Shop, Location, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import {
  Search,
  X,
  MapPin,
  Sparkles,
  Star,
  Plus,
  Minus,
  Check,
  Heart,
  ChevronRight,
  Store,
  Flame,
  Filter,
} from 'lucide-react';
import { getShopCoordinates, calculateRoadDistanceKm } from '../services/locationService';

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
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'nearby' | 'lowest' | 'organic' | 'under100'>('all');

  // Filtered Products
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q));

      // 2. Category filter
      const matchesCat =
        selectedCategoryId === 'all' ||
        p.categoryId === selectedCategoryId ||
        (selectedCategoryId === 'fruits' && (p.categoryId === 'fruits' || p.categoryId === 'vegetables'));

      // 3. Quick Filter mode
      let matchesMode = true;
      if (filterMode === 'organic') {
        matchesMode = !!p.isOrganic;
      } else if (filterMode === 'under100') {
        const minPrice = Math.min(...Object.values(p.prices || {}));
        matchesMode = minPrice > 0 && minPrice <= 100;
      }

      return matchesSearch && matchesCat && matchesMode;
    }).sort((a, b) => {
      if (filterMode === 'lowest') {
        const minA = Math.min(...Object.values(a.prices || { 0: 9999 }));
        const minB = Math.min(...Object.values(b.prices || { 0: 9999 }));
        return minA - minB;
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategoryId, filterMode]);

  return (
    <div className="md:hidden space-y-4 font-sans pb-20 animate-in fade-in duration-150">
      
      {/* 1. KERALA HERO BANNER MATCHING SCREEN 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063B2A] via-[#084D37] to-[#063B2A] text-white p-5 shadow-lg border border-[#0B8F68]/30">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#10A978]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#DDF5EA]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          
          {/* Headline matching Screen 1 */}
          <h1 className="font-malayalam font-black text-xl sm:text-2xl text-white leading-snug tracking-tight">
            നിങ്ങളുടെ അടുത്തുള്ള കടകളിൽ സാധനങ്ങളുടെ വില താരതമ്യം ചെയ്യൂ
          </h1>

          <p className="font-malayalam text-xs text-[#DDF5EA]/90 font-medium leading-relaxed">
            ഒരേ സാധനം പല കടകളിൽ എത്രയാണ് വില എന്ന് എളുപ്പത്തിൽ കണ്ടെത്താം.
          </p>

          {/* Integrated Search Input matching Screen 1 & 2 */}
          <div className="relative pt-1">
            <div className="relative flex items-center bg-white rounded-2xl shadow-md overflow-hidden p-1 border border-white/20">
              <Search className="w-4 h-4 ml-3 text-[#66756E] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="എന്താണ് തിരയുന്നത്?"
                className="w-full px-2.5 py-2 text-xs font-bold text-[#17221D] placeholder-[#66756E] outline-none font-malayalam"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1.5 text-[#66756E] hover:text-[#17221D] rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-[#10A978] hover:bg-[#0B8F68] text-white flex items-center justify-center shrink-0 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. CIRCULAR CATEGORY CHIPS MATCHING SCREEN 1 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-[#17221D] font-malayalam">വിഭാഗങ്ങൾ (Categories)</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-malayalam">
          {[
            { id: 'fruits', label: 'പഴങ്ങൾ', icon: '🍌' },
            { id: 'vegetables', label: 'പച്ചക്കറികൾ', icon: '🥦' },
            { id: 'dairy', label: 'പാൽ & പാൽ ഉൽപ്പന്നങ്ങൾ', icon: '🥛' },
            { id: 'rice-grains', label: 'അരി & ധാന്യങ്ങൾ', icon: '🌾' },
            { id: 'biscuits-snacks', label: 'മറ്റ് സാധനങ്ങൾ', icon: '🥫' },
            { id: 'all', label: 'കൂടുതൽ', icon: '⋯' },
          ].map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-[#DDF5EA] border-2 border-[#0B8F68] shadow-xs'
                    : 'bg-white border border-[#E3ECE7] shadow-2xs hover:bg-[#F5F8F6]'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border shadow-2xs ${
                  isSelected ? 'bg-white border-[#0B8F68]/30' : 'bg-[#F5F8F6] border-[#E3ECE7]'
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-bold leading-tight line-clamp-2 ${isSelected ? 'text-[#063B2A] font-black' : 'text-[#66756E]'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER CHIPS & LOCATION BAR MATCHING SCREEN 2 */}
      <div className="space-y-2 pt-1">
        
        {/* Filter Chips Ribbon matching Screen 2 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-malayalam">
          {[
            { id: 'all', label: 'എല്ലാം' },
            { id: 'nearby', label: 'സമീപം' },
            { id: 'lowest', label: 'കുറഞ്ഞ വില' },
            { id: 'organic', label: '🌿 ഓർഗാനിക്' },
            { id: 'under100', label: '₹100-ൽ താഴെ' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterMode === f.id
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'bg-white text-[#66756E] border border-[#E3ECE7] hover:bg-[#F5F8F6]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Location Indicator Bar matching Screen 2 */}
        <div
          onClick={onOpenLocationModal}
          className="flex items-center justify-between px-3.5 py-2 bg-white rounded-2xl border border-[#E3ECE7] shadow-2xs cursor-pointer font-malayalam"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#17221D] min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="truncate">നിങ്ങളുടെ സ്ഥാനം ({currentLocation?.name || 'തിരൂർ'})</span>
          </div>
          <span className="text-[11px] font-bold text-[#063B2A] bg-[#DDF5EA] px-2 py-0.5 rounded-full shrink-0">
            📍 1.2 km ചുറ്റളവിൽ
          </span>
        </div>

      </div>

      {/* 4. COMPACT PRODUCT COMPARISON CARDS LIST MATCHING SCREEN 2 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-[#17221D] font-malayalam">
            ഉൽപ്പന്നങ്ങൾ ({displayedProducts.length})
          </span>
          <span className="text-[11px] text-[#66756E] font-semibold font-malayalam">
            വില വിവരങ്ങൾ കാണാൻ ടാപ്പ് ചെയ്യുക
          </span>
        </div>

        <div className="space-y-2">
          {displayedProducts.map((product) => {
            const basketItem = basket.find((b) => b.productId === product.id);
            const isFav = favorites.includes(product.id);
            const priceValues = Object.values(product.prices || {});
            const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
            const cheapestShopEntry = Object.entries(product.prices || {}).sort((a, b) => a[1] - b[1])[0];
            const lowestShopName = cheapestShopEntry ? cheapestShopEntry[0] : 'FreshMart';
            const shopInfo = shops.find((s) => s.name.toLowerCase() === lowestShopName.toLowerCase());

            return (
              <div
                key={product.id}
                onClick={() => onSelectProductForDetail(product)}
                className="p-3 bg-white rounded-2xl border border-[#E3ECE7] shadow-2xs hover:border-[#0B8F68] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                {/* Left: Thumbnail & Info matching Screen 2 */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-[#F5F8F6] border border-[#E3ECE7] flex items-center justify-center p-1 shrink-0">
                    <ProductImage
                      productId={product.id}
                      image={product.image}
                      emoji={product.emoji}
                      alt={product.name}
                      className="w-full h-full"
                      imgClassName="max-h-full max-w-full object-contain"
                      fallbackEmojiClassName="text-2xl"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <b className="text-xs font-black text-[#17221D] truncate font-malayalam">
                        {product.name}
                      </b>
                      {product.isOrganic && (
                        <span className="text-[9px] text-[#063B2A] bg-[#DDF5EA] px-1.5 py-0.2 rounded font-bold font-malayalam shrink-0">
                          🌿
                        </span>
                      )}
                    </div>

                    {/* Lowest Shop & Rating badge matching Screen 2 */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#66756E] mt-0.5 font-medium">
                      <span className="font-bold text-[#17221D] truncate font-malayalam max-w-[90px]">
                        {lowestShopName}
                      </span>
                      <span className="text-[9px] bg-[#DDF5EA] text-[#063B2A] font-bold px-1.5 py-0.2 rounded font-malayalam shrink-0">
                        കുറഞ്ഞ വില
                      </span>
                    </div>

                    {(() => {
                      const shopCoords = shopInfo ? getShopCoordinates(shopInfo, currentLocation ? [currentLocation] : []) : null;
                      const roadDist = shopCoords && currentLocation
                        ? calculateRoadDistanceKm(currentLocation.lat, currentLocation.lng, shopCoords.lat, shopCoords.lng)
                        : (shopInfo?.distanceKm || 1.2);

                      return (
                        <div className="flex items-center gap-2 text-[10px] text-[#66756E] mt-0.5">
                          <span className="flex items-center gap-0.5 text-[#F4B740] font-bold">
                            <Star className="w-3 h-3 fill-[#F4B740] text-[#F4B740]" /> {shopInfo?.rating || '4.6'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#66756E]">📍 {roadDist} km</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right: Price & Quick Action matching Screen 2 */}
                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  
                  {/* Price */}
                  <div>
                    <div className="text-sm font-black text-[#17221D] font-sans">
                      ₹ {minPrice}
                      <span className="text-[10px] text-[#66756E] font-normal">/{product.defaultUnit}</span>
                    </div>
                    <div className="text-[10px] text-[#66756E]/60 line-through -mt-0.5">
                      ₹{Math.round(minPrice * 1.14)}
                    </div>
                  </div>

                  {/* Quantity Stepper or Add button */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  >
                    {basketItem && basketItem.quantity > 0 ? (
                      <div className="flex items-center bg-[#DDF5EA] border border-[#0B8F68]/30 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(product.id, -1)}
                          className="w-6 h-6 bg-white text-[#063B2A] rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-[#063B2A] font-sans">
                          {basketItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(product.id, 1)}
                          className="w-6 h-6 bg-[#0B8F68] text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToBasket(product, product.defaultUnit)}
                        className="py-1 px-2.5 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-95 text-white rounded-xl text-[11px] font-black shadow-2xs flex items-center gap-1 font-malayalam"
                      >
                        <Plus className="w-3 h-3" />
                        <span>ചേർക്കുക</span>
                      </button>
                    )}
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
