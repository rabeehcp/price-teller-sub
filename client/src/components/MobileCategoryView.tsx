import React, { useState, useMemo } from 'react';
import { Product, Category, BasketItem } from '../types';
import { ProductImage } from './ProductImage';
import { ArrowLeft, ShoppingBag, Search, Star, Plus, Minus, X } from 'lucide-react';

interface MobileCategoryViewProps {
  category: Category;
  products: Product[];
  basket: BasketItem[];
  onBack: () => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToBasket: (product: Product, unit?: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
}

function matchesCategory(productCatId: string | undefined, selectedCatId: string): boolean {
  if (!selectedCatId || selectedCatId === 'all') return true;
  const p = (productCatId || '').toLowerCase().trim();
  const s = selectedCatId.toLowerCase().trim();

  if (p === s) return true;

  if (s === 'vegetables') {
    return p === 'vegetables' || p === 'fruits-vegetables';
  }
  if (s === 'fruits') {
    return p === 'fruits' || p === 'fruits-vegetables';
  }
  if (s === 'rice-grains') {
    return p === 'rice-grains' || p === 'staples' || p === 'pulses-legumes';
  }
  if (s === 'dairy') {
    return p === 'dairy';
  }
  if (s === 'spices') {
    return p === 'spices' || p === 'oils-spices';
  }
  if (s === 'grocery') {
    return (
      p === 'grocery' ||
      p === 'oils-sugar' ||
      p === 'sauces-condiments' ||
      p === 'staples' ||
      p === 'spices' ||
      p === 'pulses-legumes'
    );
  }
  if (s === 'biscuits-snacks') {
    return p === 'biscuits-snacks' || p === 'beverages' || p === 'bakery-breakfast' || p === 'snacks-beverages';
  }
  return p.includes(s) || s.includes(p);
}

export const MobileCategoryView: React.FC<MobileCategoryViewProps> = ({
  category,
  products,
  basket,
  onBack,
  onOpenCart,
  onSelectProduct,
  onAddToBasket,
  onQuantityChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState('all');

  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  // Logical market subcategory filter chips
  const filterChips = useMemo(() => {
    if (category.id === 'vegetables') {
      return [
        { id: 'all', label: 'എല്ലാം' },
        { id: 'essentials', label: 'നിത്യോപയോഗം' },
        { id: 'country', label: 'നാടൻ പച്ചക്കറികൾ' },
        { id: 'leafy', label: 'ഇലക്കറികൾ' },
        { id: 'tubers', label: 'കിഴങ്ങുവർഗ്ഗങ്ങൾ' },
        { id: 'beans', label: 'പയർ & മറ്റുള്ളവ' },
      ];
    }
    if (category.id === 'fruits') {
      return [
        { id: 'all', label: 'എല്ലാം' },
        { id: 'popular', label: 'ജനപ്രിയം' },
        { id: 'local', label: 'നാടൻ പഴങ്ങൾ' },
        { id: 'citrus_melon', label: 'സിട്രസ് & തണ്ണിമത്തൻ' },
        { id: 'exotic', label: 'എക്സോട്ടിക് & ബെറികൾ' },
      ];
    }
    if (category.id === 'rice-grains') {
      return [
        { id: 'all', label: 'എല്ലാം' },
        { id: 'rice', label: 'അരി' },
        { id: 'staples', label: 'ധാന്യങ്ങൾ' },
        { id: 'pulses', label: 'പരിപ്പുകൾ' },
      ];
    }
    if (category.id === 'spices') {
      return [
        { id: 'all', label: 'എല്ലാം' },
        { id: 'powders', label: 'മസാലപ്പൊടികൾ' },
        { id: 'whole', label: 'മുഴുവൻ മസാലകൾ' },
      ];
    }
    if (category.id === 'grocery') {
      return [
        { id: 'all', label: 'എല്ലാം' },
        { id: 'oils', label: 'എണ്ണ & നെയ്യ്' },
        { id: 'staples', label: 'നിത്യോപയോഗ സാധനങ്ങൾ' },
        { id: 'sauces', label: 'സോസ് & അച്ചാർ' },
      ];
    }
    return [
      { id: 'all', label: 'എല്ലാം' },
      { id: 'popular', label: 'ജനപ്രിയം' },
      { id: 'fresh', label: 'പുതിയത്' },
      { id: 'offer', label: 'ഓഫറുകൾ' },
    ];
  }, [category.id]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const pName = p.name.toLowerCase();

      // Robust category matching
      if (!matchesCategory(p.categoryId, category.id)) {
        return false;
      }

      const matchesSearch =
        !q ||
        pName.includes(q) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Sub-filter matches
      if (activeSubFilter === 'essentials') {
        return (
          pName.includes('tomato') || pName.includes('തക്കാളി') ||
          pName.includes('onion') || pName.includes('സവാള') || pName.includes('ഉള്ളി') ||
          pName.includes('potato') || pName.includes('ഉരുളക്കിഴങ്ങ്') ||
          pName.includes('chilli') || pName.includes('മുളക്') ||
          pName.includes('ginger') || pName.includes('ഇഞ്ചി') ||
          pName.includes('garlic') || pName.includes('വെളുത്തുള്ളി')
        );
      }
      if (activeSubFilter === 'country') {
        return (
          pName.includes('brinjal') || pName.includes('വഴുതന') ||
          pName.includes('ladies finger') || pName.includes('okra') || pName.includes('വെണ്ടക്ക') ||
          pName.includes('gourd') || pName.includes('പാവയ്ക്ക') || pName.includes('പടവലങ്ങ') || pName.includes('ചുരയ്ക്ക') || pName.includes('കുമ്പളങ്ങ') ||
          pName.includes('pumpkin') || pName.includes('മത്തങ്ങ') ||
          pName.includes('drumstick') || pName.includes('മുരിങ്ങക്കായ') ||
          pName.includes('cucumber') || pName.includes('വെള്ളരിക്ക')
        );
      }
      if (activeSubFilter === 'leafy') {
        return (
          pName.includes('spinach') || pName.includes('cheera') || pName.includes('ചീര') ||
          pName.includes('moringa') || pName.includes('മുരിങ്ങയില') ||
          pName.includes('coriander') || pName.includes('മല്ലിയില') ||
          pName.includes('mint') || pName.includes('പുതിന') ||
          pName.includes('curry') || pName.includes('കറിവേപ്പില') ||
          pName.includes('keerai') || pName.includes('leaf')
        );
      }
      if (activeSubFilter === 'tubers') {
        return (
          pName.includes('tapioca') || pName.includes('കപ്പ') ||
          pName.includes('yam') || pName.includes('ചേന') ||
          pName.includes('colocasia') || pName.includes('taro') || pName.includes('ചേമ്പ്') ||
          pName.includes('chinese potato') || pName.includes('കൂർക്ക') ||
          pName.includes('sweet potato') || pName.includes('മധുരക്കിഴങ്ങ്') ||
          pName.includes('carrot') || pName.includes('കാരറ്റ്') ||
          pName.includes('beet') || pName.includes('ബീറ്റ്റൂട്ട്') ||
          pName.includes('radish') || pName.includes('മുള്ളങ്കി')
        );
      }
      if (activeSubFilter === 'beans') {
        return (
          pName.includes('bean') || pName.includes('ബീൻസ്') || pName.includes('പയർ') ||
          pName.includes('pea') || pName.includes('പീസ്') ||
          pName.includes('capsicum') || pName.includes('കാപ്സിക്കം') ||
          pName.includes('cabbage') || pName.includes('കാബേജ്') ||
          pName.includes('cauliflower') || pName.includes('കോളിഫ്ലവർ') ||
          pName.includes('mushroom') || pName.includes('corn')
        );
      }
      if (activeSubFilter === 'popular') {
        return (
          pName.includes('apple') || pName.includes('ആപ്പിൾ') ||
          pName.includes('banana') || pName.includes('വാഴപ്പഴം') || pName.includes('നേന്ത്ര') ||
          pName.includes('orange') || pName.includes('ഓറഞ്ച്') ||
          pName.includes('grape') || pName.includes('മുന്തിരി') ||
          pName.includes('mango') || pName.includes('മാമ്പഴം') ||
          pName.includes('pomegranate') || pName.includes('മാതളം') || pName.includes('ഉറുമാൻ')
        );
      }
      if (activeSubFilter === 'local') {
        return (
          pName.includes('jackfruit') || pName.includes('ചക്ക') ||
          pName.includes('guava') || pName.includes('പേരയ്ക്ക') ||
          pName.includes('papaya') || pName.includes('പപ്പായ') ||
          pName.includes('pineapple') || pName.includes('കൈതച്ചക്ക') ||
          pName.includes('sapota') || pName.includes('സപ്പോട്ട') ||
          pName.includes('amla') || pName.includes('നെല്ലിക്ക') ||
          pName.includes('tamarind') || pName.includes('പുളി') ||
          pName.includes('coconut') || pName.includes('തേങ്ങ')
        );
      }
      if (activeSubFilter === 'citrus_melon') {
        return (
          pName.includes('orange') || pName.includes('ഓറഞ്ച്') ||
          pName.includes('mosambi') || pName.includes('മുസംബി') ||
          pName.includes('melon') || pName.includes('watermelon') || pName.includes('തണ്ണിമത്തൻ') || pName.includes('ഷമാം') ||
          pName.includes('grapefruit') || pName.includes('pomelo') || pName.includes('നാരങ്ങ')
        );
      }
      if (activeSubFilter === 'exotic') {
        return (
          pName.includes('berry') || pName.includes('ബെറി') ||
          pName.includes('strawberry') || pName.includes('blueberry') ||
          pName.includes('kiwi') || pName.includes('കിവി') ||
          pName.includes('dragon') || pName.includes('ഡ്രാഗൺ') ||
          pName.includes('avocado') || pName.includes('അവോക്കാഡോ') ||
          pName.includes('durian') || pName.includes('ദുരിയാൻ') ||
          pName.includes('rambutan') || pName.includes('റംബൂട്ടാൻ') ||
          pName.includes('mangosteen') || pName.includes('മാംഗോസ്റ്റീൻ') ||
          pName.includes('cherry') || pName.includes('ചെറി') ||
          pName.includes('plum') || pName.includes('പ്ലം') ||
          pName.includes('peach') || pName.includes('പീച്ച്') ||
          pName.includes('dates') || pName.includes('ഈന്തപ്പഴം')
        );
      }
      if (activeSubFilter === 'rice') {
        return pName.includes('rice') || pName.includes('അരി') || pName.includes('matta') || pName.includes('മട്ട');
      }
      if (activeSubFilter === 'staples') {
        return pName.includes('atta') || pName.includes('wheat') || pName.includes('maida') || pName.includes('rava') || pName.includes('flour') || pName.includes('പൊടി');
      }
      if (activeSubFilter === 'pulses') {
        return pName.includes('dal') || pName.includes('പരിപ്പ്') || pName.includes('gram') || pName.includes('chana') || pName.includes('കടല');
      }
      if (activeSubFilter === 'powders') {
        return pName.includes('powder') || pName.includes('പൊടി') || pName.includes('masala') || pName.includes('മസാല');
      }
      if (activeSubFilter === 'whole') {
        return pName.includes('seed') || pName.includes('ജീരകം') || pName.includes('കടുക്') || pName.includes('ഏലയ്ക്ക') || pName.includes('കുരുമുളക്') || pName.includes('pepper') || pName.includes('cardamom');
      }
      if (activeSubFilter === 'oils') {
        return pName.includes('oil') || pName.includes('എണ്ണ') || pName.includes('വെളിച്ചെണ്ണ') || pName.includes('ghee') || pName.includes('നെയ്യ്');
      }
      if (activeSubFilter === 'sauces') {
        return pName.includes('sauce') || pName.includes('സോസ്') || pName.includes('pickle') || pName.includes('അച്ചാർ') || pName.includes('ketchup') || pName.includes('paste');
      }

      return true;
    });

    // Natural Market Sorting Priority (Popular Kerala daily essentials first)
    const priorityNames = [
      'തക്കാളി', 'tomato', 'സവാള', 'onion', 'ഉരുളക്കിഴങ്ങ്', 'potato',
      'പച്ചമുളക്', 'green chilli', 'ഇഞ്ചി', 'ginger', 'വെളുത്തുള്ളി', 'garlic',
      'വാഴപ്പഴം', 'banana', 'ആപ്പിൾ', 'apple', 'ഓറഞ്ച്', 'orange', 'മുന്തിരി', 'grapes',
      'തേങ്ങ', 'coconut', 'കാരറ്റ്', 'carrot', 'വെണ്ടക്ക', 'വഴുതന', 'ചീര', 'മുരിങ്ങ'
    ];

    return list.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIdx = priorityNames.findIndex((p) => aName.includes(p));
      const bIdx = priorityNames.findIndex((p) => bName.includes(p));

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return aName.localeCompare(bName);
    });
  }, [products, category.id, searchQuery, activeSubFilter]);

  const categoryDisplayName = category.name || (category.id === 'vegetables' ? 'പച്ചക്കറികൾ' : category.id === 'fruits' ? 'പഴങ്ങൾ' : 'ഉൽപ്പന്നങ്ങൾ');

  return (
    <div className="md:hidden space-y-3 font-sans pb-28 animate-in fade-in duration-150">
      {/* 1. Header (Matching Screen 2) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#F0F4F2] sticky top-0 z-30 shadow-2xs">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-[#17221D] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#17221D]" />
        </button>

        <h1 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
          {categoryDisplayName}
        </h1>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative p-1.5 -mr-1 text-[#2D3E35] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-[#2D3E35]" />
          {basketCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#E11D48] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {basketCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 space-y-3">
        {/* 2. Search Bar (Matching Screen 2) */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ഈ വിഭാഗത്തിൽ തിരയുക..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] rounded-full text-xs font-semibold text-[#17221D] placeholder-[#8A9992] focus:outline-none focus:border-[#0B8F68] focus:bg-white font-malayalam transition-all"
          />
          <Search className="w-4 h-4 text-[#8A9992] absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-[#8A9992] hover:text-[#17221D] rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Filter Chips Ribbon (Matching Screen 2) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {filterChips.map((chip) => {
            const isActive = activeSubFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveSubFilter(chip.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-malayalam shrink-0 ${
                  isActive
                    ? 'bg-[#063B2A] text-white shadow-xs'
                    : 'bg-[#F5F8F6] text-[#66756E] hover:bg-[#E8F5EE] border border-[#E3ECE7]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* 4. Product Items Vertical List (Matching Screen 2) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E3ECE7] space-y-3 mt-2 shadow-2xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F5F8F6] flex items-center justify-center text-2xl">
              🔍
            </div>
            <h3 className="text-sm font-black text-[#17221D] font-malayalam m-0">
              ഉൽപ്പന്നങ്ങൾ ലഭ്യമല്ല
            </h3>
            <p className="text-xs text-[#8A9992] font-malayalam max-w-xs mx-auto m-0">
              തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ ഇപ്പോൾ ഉൽപ്പന്നങ്ങൾ ലഭ്യമല്ല അല്ലെങ്കിൽ തിരയൽ മാറ്റി ശ്രമിക്കുക.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveSubFilter('all');
              }}
              className="px-4 py-2 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl shadow-xs font-malayalam transition-all cursor-pointer"
            >
              എല്ലാ ഉൽപ്പന്നങ്ങളും കാണുക
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {filteredProducts.map((p) => {
              const basketItem = basket.find((b) => b.productId === p.id || (b as any).product?.id === p.id);
              const qty = basketItem ? basketItem.quantity : 0;
              const priceValues = Object.values(p.prices || {});
              const price = priceValues.length > 0 ? Math.min(...priceValues) : 30;
              const rating = 4.2 + (Math.abs(p.name.length % 7) / 10);
              const reviewCount = 80 + (p.name.length * 5);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="flex items-center justify-between p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] transition-all cursor-pointer"
                >
                  {/* Product Thumbnail on Left */}
                  <div className="w-16 h-16 rounded-xl bg-[#F8FAF7] border border-[#E8ECE3] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                    <ProductImage
                      productId={p.id}
                      image={p.image}
                      emoji={p.emoji}
                      alt={p.name}
                      className="w-full h-full"
                      imgClassName="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Middle Info */}
                  <div className="flex-1 min-w-0 px-3.5 space-y-0.5">
                    <h3 className="text-sm font-extrabold text-[#17221D] font-malayalam truncate m-0">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-[#17221D] font-sans">
                        ₹ {price}
                      </span>
                      <span className="text-[10px] text-[#8A9992] font-normal font-sans">
                        /{p.defaultUnit || 'kg'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#8A9992]">
                      <Star className="w-3 h-3 fill-[#F4B740] text-[#F4B740]" />
                      <span className="font-bold text-[#17221D] font-sans text-[10px]">
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-sans text-[#8A9992]">
                        ({reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {qty > 0 ? (
                      <div className="flex items-center bg-[#063B2A] text-white rounded-full p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(p.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black font-sans">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(p.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToBasket(p, p.defaultUnit)}
                        className="w-8 h-8 rounded-full bg-[#063B2A] hover:bg-[#0B8F68] text-white flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
