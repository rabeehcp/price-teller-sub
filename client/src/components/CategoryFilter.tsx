import React, { useRef, useState, useEffect } from 'react';
import { Category } from '../types';
import { Search, X, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOrganicOnly: boolean;
  onToggleOrganicOnly: () => void;
  isUnder100Only: boolean;
  onToggleUnder100Only: () => void;
  onOpenAddProductModal?: () => void;
}

const MALAYALAM_CATEGORY_NAMES: Record<string, string> = {
  all: 'എല്ലാം',
  vegetables: 'പച്ചക്കറികൾ',
  fruits: 'പഴങ്ങൾ',
  meats: 'ഇറച്ചി',
  fish: 'മത്സ്യം',
  dairy: 'പാൽ & മുട്ട',
  staples: 'ധാന്യങ്ങൾ',
  'rice-grains': 'അരി & ധാന്യങ്ങൾ',
  'pulses-legumes': 'പയറുവർഗ്ഗങ്ങൾ',
  spices: 'മസാലകൾ',
  'oils-sugar': 'എണ്ണ & പഞ്ചസാര',
  'oils-spices': 'എണ്ണ & മസാല',
  'bakery-breakfast': 'ബേക്കറി',
  'biscuits-snacks': 'സ്നാക്സ്',
  beverages: 'ചായ & കാപ്പി',
  utensils: 'പാത്രങ്ങൾ',
  'cleaning-household': 'ക്ലീനിംഗ്',
  household: 'വീട്ടുപകരണങ്ങൾ',
  electronics: 'ഇലക്ട്രോണിക്സ്',
  'baby-family': 'ബേബി കെയർ',
  'personal-care': 'പേഴ്സണൽ കെയർ',
  organic: 'ഓർഗാനിക്',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isOrganicOnly,
  onToggleOrganicOnly,
  isUnder100Only,
  onToggleUnder100Only,
  onOpenAddProductModal,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="space-y-3 mb-5 font-sans">
      {/* Search Input & Filter Toggles */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="പച്ചക്കറികൾ, പഴങ്ങൾ, പാൽ, അരി, മസാലകൾ തിരയുക..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs sm:text-sm text-slate-dark placeholder-slate-muted outline-none transition-all font-malayalam"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-slate-dark p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
          {onOpenAddProductModal && (
            <button
              onClick={onOpenAddProductModal}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer shrink-0 font-malayalam"
            >
              <span>+ ഉൽപ്പന്നം ചേർക്കുക</span>
            </button>
          )}

          <button
            onClick={onToggleOrganicOnly}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 font-malayalam ${
              isOrganicOnly
                ? 'bg-brand-700 text-white border-brand-700 shadow-2xs'
                : 'bg-white text-slate-body border-surface-border hover:bg-surface-subtle'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>🌿 ഓർഗാനിക്</span>
          </button>

          <button
            onClick={onToggleUnder100Only}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 font-malayalam ${
              isUnder100Only
                ? 'bg-brand-700 text-white border-brand-700 shadow-2xs'
                : 'bg-white text-slate-body border-surface-border hover:bg-surface-subtle'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-muted" />
            <span>₹100-ൽ താഴെ</span>
          </button>
        </div>
      </div>

      {/* Unified Category Cards Strip with Left & Right Scroll Buttons */}
      <div className="relative group">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all cursor-pointer"
            title="ഇടത്തോട്ട് സ്ക്രോൾ ചെയ്യുക"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth font-malayalam scrollbar-thin scrollbar-thumb-gray-200"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const malayalamLabel = MALAYALAM_CATEGORY_NAMES[cat.id] || cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl min-w-[76px] transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-brand-50 border-2 border-brand-600 shadow-xs ring-2 ring-brand-500/20 scale-105'
                    : 'bg-white hover:bg-gray-50/80 border border-surface-border'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border shadow-2xs ${
                    isSelected
                      ? 'bg-brand-100 border-brand-300 text-brand-900'
                      : 'bg-gray-50 border-gray-200 text-slate-800'
                  }`}
                >
                  {cat.icon || '🛍️'}
                </div>
                <span
                  className={`text-[11px] font-bold text-center leading-tight truncate max-w-[80px] ${
                    isSelected ? 'text-brand-900 font-black' : 'text-slate-700'
                  }`}
                >
                  {malayalamLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all cursor-pointer"
            title="വലത്തോട്ട് സ്ക്രോൾ ചെയ്യുക"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
