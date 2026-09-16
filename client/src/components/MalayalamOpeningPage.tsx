import React, { useState } from 'react';
import { Location, User } from '../types';
import { ProductImage } from './ProductImage';
import {
  Search,
  Scale,
  Bell,
  MapPin,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  Store,
  ShieldCheck,
  Sparkles,
  LogOut,
  ShoppingCart,
  X,
  Check,
} from 'lucide-react';
import { MobileLocationModal } from './MobileLocationModal';

interface MalayalamOpeningPageProps {
  locations: Location[];
  currentLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  onEnterAsConsumer: () => void;
  onOpenConsumerLogin?: () => void;
  onOpenMerchantPortal: () => void;
  onOpenShopCatalogue?: (shopName?: string) => void;
  authUser?: User | null;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const MalayalamOpeningPage: React.FC<MalayalamOpeningPageProps> = ({
  locations,
  currentLocation,
  onSelectLocation,
  onEnterAsConsumer,
  onOpenConsumerLogin,
  onOpenMerchantPortal,
  onOpenShopCatalogue,
  authUser,
  onLogout,
  onSearch,
  onSelectCategory,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isMobileLocationModalOpen, setIsMobileLocationModalOpen] = useState(false);

  const locationName = currentLocation?.name || 'കോഴിക്കോട്';

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch && searchInput.trim()) {
      onSearch(searchInput.trim());
    } else {
      onEnterAsConsumer();
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      onEnterAsConsumer();
    }
  };

  // 5 everyday live prices matching reference
  const todayPrices = [
    {
      id: 'tomato',
      name: 'തക്കാളി',
      unit: '1 kg',
      price: 28,
      priceUnit: 'kg',
      emoji: '🍅',
      image: 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3137805.jpg',
    },
    {
      id: 'onion',
      name: 'സവാള',
      unit: '1 kg',
      price: 35,
      priceUnit: 'kg',
      emoji: '🧅',
    },
    {
      id: 'potato',
      name: 'ഉരുളക്കിഴങ്ങ്',
      unit: '1 kg',
      price: 32,
      priceUnit: 'kg',
      emoji: '🥔',
    },
    {
      id: 'milk',
      name: 'പാൽ (1 ലി)',
      unit: 'Milma',
      price: 56,
      priceUnit: 'ലി',
      emoji: '🥛',
    },
    {
      id: 'oil',
      name: 'എണ്ണ (1 ലി)',
      unit: 'Kera',
      price: 150,
      priceUnit: 'ലി',
      emoji: '🫗',
    },
  ];

  // 8 Categories matching reference exactly
  const categories = [
    {
      id: 'vegetables',
      label: 'പച്ചക്കറികൾ',
      emoji: '🥬',
      bgColor: 'bg-[#E8F6ED]',
    },
    {
      id: 'fruits',
      label: 'പഴങ്ങൾ',
      emoji: '🍎',
      bgColor: 'bg-[#FEF1E6]',
    },
    {
      id: 'rice-grains',
      label: 'അരി & ധാന്യങ്ങൾ',
      emoji: '🌾',
      bgColor: 'bg-[#F9EFE3]',
    },
    {
      id: 'dairy',
      label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
      emoji: '🥛',
      bgColor: 'bg-[#EBF4FC]',
    },
    {
      id: 'oils-spices',
      label: 'എണ്ണ & മസാലകൾ',
      emoji: '🫗',
      bgColor: 'bg-[#FFF9E6]',
    },
    {
      id: 'beverages',
      label: 'പാനീയങ്ങൾ',
      emoji: '🧃',
      bgColor: 'bg-[#E9F6F8]',
    },
    {
      id: 'bakery-breakfast',
      label: 'ബേക്കറി & സ്നാക്സ്',
      emoji: '🍪',
      bgColor: 'bg-[#FDF2E7]',
    },
    {
      id: 'cleaning-household',
      label: 'വീട്ടുപകരണങ്ങൾ',
      emoji: '🧹',
      bgColor: 'bg-[#F2EFFB]',
    },
  ];

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] overflow-x-hidden overflow-y-auto md:h-auto md:max-h-none md:min-h-screen bg-[#EFF4F1] text-[#17221D] flex flex-col font-sans selection:bg-[#0D4A36] selection:text-white">
      
      {/* 1. TOP HEADER */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E3ECE7] shrink-0 px-3 sm:px-8 py-1.5 md:py-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo */}
          <div
            onClick={onEnterAsConsumer}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#0D4A36] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm sm:text-lg font-black tracking-tight text-[#17221D] flex items-center gap-1 font-sans leading-tight">
                Price<span className="text-[#10A978]">Teller</span>
              </div>
              <div className="text-[8px] sm:text-[10px] text-[#66756E] font-medium tracking-tight leading-none">
                Local Shop. Better Price.
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center bg-[#E5EFE9] hover:bg-[#DDEAE2] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0D4A36]/30 border border-[#D5E5DC] rounded-full px-4 py-2 transition-all"
          >
            <Search className="w-4 h-4 text-[#6B8579] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ഉദ്ദേശിക്കുന്ന സാധനങ്ങൾ ടൈപ്പ് ചെയ്യുക..."
              className="w-full bg-transparent text-xs text-[#17221D] placeholder-[#7F998D] outline-none font-malayalam"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Merchant Portal entrance button */}
            <button
              type="button"
              onClick={onOpenMerchantPortal}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#4D6158] hover:text-[#0D4A36] hover:bg-white px-2.5 py-1.5 rounded-full border border-transparent hover:border-[#D5E5DC] transition-all cursor-pointer font-malayalam"
              title="വ്യാപാരികൾക്കായി"
            >
              <Store className="w-3.5 h-3.5 text-[#6B8579]" />
              <span>വ്യാപാരികൾക്കായി</span>
            </button>

            {/* Weighing scale / compare icon */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#E5EFE9] text-[#0D4A36] hover:bg-[#D4EEDE] items-center justify-center transition-all cursor-pointer active:scale-95"
              title="വില താരതമ്യം (Compare Prices)"
              aria-label="Compare"
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D4A36]" />
            </button>

            {/* Notification bell */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-black/5 items-center justify-center text-[#4D6158] transition-colors cursor-pointer relative"
              title="അറിയിപ്പുകൾ"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 border border-white" />
            </button>

            {/* Mobile Location Selector Indicator */}
            <button
              type="button"
              onClick={() => setIsMobileLocationModalOpen(true)}
              className="md:hidden flex items-center gap-1 bg-[#E5EFE9] text-[#0D4A36] px-2 py-1 rounded-full text-[10px] font-bold font-malayalam active:scale-95 shrink-0"
            >
              <MapPin className="w-3 h-3 text-[#0D4A36] shrink-0" />
              <span className="truncate max-w-[50px]">{locationName}</span>
              <ChevronDown className="w-2.5 h-2.5 shrink-0" />
            </button>

            {/* Login / Sign Up Pill Button */}
            {authUser ? (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onEnterAsConsumer}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 bg-[#0D4A36] hover:bg-[#073626] text-white text-[11px] sm:text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs font-malayalam shrink-0"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0">
                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <span>കടകൾ</span>
                  <ArrowRight className="w-3 h-3 ml-0.5 shrink-0" />
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="ലോഗ് ഔട്ട്"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenConsumerLogin || onEnterAsConsumer}
                className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs font-sans tracking-tight active:scale-95 shrink-0"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Compact cohesive spacing on mobile, full height on desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 md:py-6 flex flex-col justify-start md:justify-between gap-2 sm:gap-2.5 md:gap-6 min-h-0">

        {/* HERO SECTION (Mint green card exactly matching reference) */}
        <div className="bg-gradient-to-br from-[#DCEFE5] via-[#D0EDD9] to-[#C7E5D1] rounded-2xl md:rounded-[36px] p-3 sm:p-5 lg:p-8 border border-[#BDDDC8] shadow-2xs relative overflow-hidden flex-1 md:flex-none flex flex-col justify-between min-h-[165px]">
          
          {/* Subtle background decorative foliage */}
          <div className="absolute top-2 right-1/4 text-emerald-800/10 text-5xl pointer-events-none select-none hidden md:block">
            🌿
          </div>
          <div className="absolute -bottom-6 left-1/4 text-emerald-800/10 text-7xl pointer-events-none select-none hidden md:block">
            🍃
          </div>

          {/* DESKTOP LAYOUT (>= md) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-8 items-center min-h-0">
            
            {/* Left Column: Heading, Subtitle & Embedded Search Box */}
            <div className="md:col-span-6 lg:col-span-5 space-y-3 lg:space-y-4">
              <h1 className="text-2xl lg:text-[40px] font-black text-[#0B3D2D] leading-[1.2] font-malayalam tracking-tight m-0">
                ഓരോ ആവശ്യത്തിനും<br />
                <span className="text-[#063B2A]">ഏറ്റവും നല്ല വില</span>
              </h1>

              <p className="text-xs lg:text-sm text-[#405C4F] font-medium font-malayalam leading-relaxed max-w-md m-0">
                നിങ്ങളുടെ പ്രദേശത്തെ എല്ലാ കടകളുടെയും ഏറ്റവും മികച്ച വിലകൾ കണ്ടെത്തൂ. ചെറിയ ചിലവിൽ കൂടുതൽ നേടൂ.
              </p>

              {/* Embedded Search Input Pill */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-full p-1.5 pl-4 border border-[#BBD8C8] shadow-2xs flex items-center justify-between gap-2 max-w-md transition-all focus-within:border-[#0D4A36] focus-within:ring-2 focus-within:ring-[#0D4A36]/20"
              >
                <Search className="w-4 h-4 text-[#6B8579] shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ഉദ്ദേശിക്കുന്ന സാധനങ്ങൾ ടൈപ്പ് ചെയ്യുക..."
                  className="w-full bg-transparent text-xs lg:text-sm text-[#17221D] placeholder-[#7F998D] outline-none font-malayalam"
                />
                <button
                  type="submit"
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#0D4A36] hover:bg-[#063B2A] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Center Column: Seamless 3D Market Stall & Essentials Hero Illustration */}
            <div className="md:col-span-6 lg:col-span-4 flex items-center justify-center relative">
              <div className="relative group w-full flex items-center justify-center">
                <img
                  src="/hero-market.jpg"
                  alt="Fresh Choices Better Prices - Daily Groceries & Essentials"
                  className="w-full max-h-[220px] lg:max-h-[260px] object-contain drop-shadow-sm select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Floating "ഇന്നത്തെ വിലകൾ" (Today's Prices) Card */}
            <div className="hidden lg:flex lg:col-span-3 justify-end">
              <div className="w-full max-w-[270px] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/80 font-malayalam space-y-1.5">
                
                {/* Card Header with Location Dropdown */}
                <div className="flex items-center justify-between border-b border-[#F0F4F2] pb-1 relative">
                  <h3 className="text-xs font-black text-[#17221D] m-0">
                    ഇന്നത്തെ വിലകൾ
                  </h3>

                  {/* Location Selector Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#0D4A36] hover:text-[#063B2A] bg-[#E8F5EE] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#0D4A36]" />
                      <span>{locationName}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isLocationDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#E3ECE7] rounded-xl shadow-xl z-50 p-2 font-sans animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-malayalam">
                            സ്ഥലം തിരഞ്ഞെടുക്കുക:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsLocationDropdownOpen(false);
                              setLocationSearchQuery('');
                            }}
                            className="text-gray-400 hover:text-gray-600 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative my-1.5">
                          <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            placeholder="തിരയുക / Search town..."
                            className="w-full bg-[#F5F8F6] border border-[#E3ECE7] rounded-lg pl-6 pr-6 py-1 text-xs text-[#17221D] placeholder-gray-400 outline-none focus:border-[#0D4A36] font-malayalam"
                            autoFocus
                          />
                          {locationSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setLocationSearchQuery('')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                          {locations
                            .filter((loc) => {
                              if (!locationSearchQuery.trim()) return true;
                              const q = locationSearchQuery.toLowerCase().trim();
                              return (
                                loc.name.toLowerCase().includes(q) ||
                                (loc.subArea && loc.subArea.toLowerCase().includes(q))
                              );
                            })
                            .map((loc) => {
                              const isSelected = loc.id === currentLocation?.id;
                              return (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => {
                                    onSelectLocation(loc);
                                    setIsLocationDropdownOpen(false);
                                    setLocationSearchQuery('');
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-[#E8F5EE] text-[#0D4A36]'
                                      : 'text-[#17221D] hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="min-w-0 pr-1">
                                    <div className="truncate">{loc.name}</div>
                                    {loc.subArea && (
                                      <div className="text-[9px] text-gray-500 truncate font-normal">
                                        {loc.subArea}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-[#0D4A36] shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* List of 5 Everyday Items */}
                <div className="space-y-0.5">
                  {todayPrices.map((item) => (
                    <div
                      key={item.id}
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1 hover:bg-[#F5F8F6] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-[#F5F8F6] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#E3ECE7]">
                          {item.image ? (
                            <ProductImage
                              image={item.image}
                              emoji={item.emoji}
                              alt={item.name}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain"
                            />
                          ) : (
                            <span>{item.emoji}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[#17221D] truncate group-hover:text-[#0D4A36] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[9px] text-[#66756E]">
                            {item.unit}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-black text-[#0D4A36] font-sans shrink-0 ml-1">
                        ₹{item.price} <span className="text-[8px] font-normal text-gray-500">/{item.priceUnit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card CTA */}
                <button
                  type="button"
                  onClick={onEnterAsConsumer}
                  className="w-full py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer text-center font-malayalam mt-0.5 shadow-2xs"
                >
                  എല്ലാ നിരക്കുകളും കാണുക →
                </button>
              </div>
            </div>

          </div>

          {/* MOBILE LAYOUT (< md): Ultra-optimized zero-scroll split layout */}
          <div className="md:hidden flex-1 h-full flex flex-col justify-between gap-2 min-h-0">
            {/* Top row: Left Headline & Search + Right 3D Illustration */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#0B3D2D] leading-[1.2] font-malayalam tracking-tight m-0">
                  ഓരോ ആവശ്യത്തിനും<br />
                  <span className="text-[#063B2A]">ഏറ്റവും നല്ല വില</span>
                </h1>
                
                {/* Compact Search Bar for Mobile */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-full p-1 pl-3 border border-[#BBD8C8] shadow-2xs flex items-center justify-between gap-1.5 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-[#6B8579] shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="സാധനങ്ങൾ തിരയുക..."
                    className="w-full bg-transparent text-xs text-[#17221D] placeholder-[#7F998D] outline-none font-malayalam"
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 rounded-full bg-[#0D4A36] text-white flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                </form>
              </div>

              {/* Seamless 3D Grocery Hero Illustration on Right */}
              <div className="w-[115px] sm:w-[135px] shrink-0 flex items-center justify-center">
                <img
                  src="/hero-market.jpg"
                  alt="Fresh Choices Better Prices"
                  className="w-full h-auto max-h-[105px] object-contain drop-shadow-xs pointer-events-none"
                />
              </div>
            </div>

            {/* Mobile Live Price Ticker Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 font-malayalam">
              <span className="text-[9px] font-black text-[#0D4A36] bg-white/90 px-2 py-0.5 rounded-md shrink-0 border border-[#BBD8C8]">
                ഇന്നത്തെ വില:
              </span>
              {todayPrices.map((item) => (
                <div
                  key={item.id}
                  onClick={onEnterAsConsumer}
                  className="bg-white/95 text-[#0D4A36] text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-white shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                  <span className="font-sans font-black text-emerald-800">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. CATEGORIES SECTION ("കാറ്റഗറികൾ") */}
        <section className="space-y-1 sm:space-y-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm md:text-base font-black text-[#17221D] font-malayalam m-0">
              കാറ്റഗറികൾ
            </h2>
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="text-[10px] sm:text-xs font-bold text-[#0D4A36] hover:underline font-malayalam cursor-pointer"
            >
              എല്ലാം കാണുക →
            </button>
          </div>

          {/* Categories Strip: Smooth horizontal swipe on mobile, 8-col grid on desktop */}
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto no-scrollbar font-malayalam py-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="w-[72px] sm:w-[78px] md:w-auto shrink-0 bg-white hover:bg-[#F9FCFA] border border-[#E3ECE7] hover:border-[#BBD8C8] rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs hover:shadow-xs active:scale-95"
              >
                {/* Circular Icon Container */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${cat.bgColor} flex items-center justify-center text-base sm:text-lg md:text-xl mb-1 transition-transform group-hover:scale-110 shadow-2xs`}
                >
                  <span>{cat.emoji}</span>
                </div>

                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-[#17221D] leading-tight group-hover:text-[#0D4A36] truncate w-full text-center px-0.5">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. VALUE PROPOSITION / TRUST CARDS (Bottom 4 Cards) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 font-malayalam shrink-0">
          
          {/* Card 1: വില താരതമ്യം */}
          <div className="bg-[#E8F3ED] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 transition-all hover:bg-[#DDECE4]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs font-black text-[#17221D] truncate">വില താരതമ്യം</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] text-[#556960] font-medium truncate">മികച്ച നിരക്കുകൾ</div>
            </div>
          </div>

          {/* Card 2: പ്രാദേശിക കടകൾ */}
          <div className="bg-[#E8F3ED] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 transition-all hover:bg-[#DDECE4]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs font-black text-[#17221D] truncate">പ്രാദേശിക കടകൾ</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] text-[#556960] font-medium truncate">സൂപ്പർമാർക്കറ്റുകൾ</div>
            </div>
          </div>

          {/* Card 3: നേരിട്ട് മുൻകൂട്ടി ബുക്കിംഗ് */}
          <div className="bg-[#E8F3ED] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 transition-all hover:bg-[#DDECE4]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs font-black text-[#17221D] truncate">നേരിട്ട് ബുക്കിംഗ്</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] text-[#556960] font-medium truncate">സ്റ്റോക്ക് ലഭ്യത</div>
            </div>
          </div>

          {/* Card 4: 100% സൗജന്യ സേവനം */}
          <div className="bg-[#E8F3ED] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 transition-all hover:bg-[#DDECE4]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs font-black text-[#17221D] truncate">100% സൗജന്യം</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] text-[#556960] font-medium truncate">ഉപഭോക്താക്കൾക്കായി</div>
            </div>
          </div>

        </section>

        {/* 5. MOBILE QUICK-ACTION / EXPLORE STORES CTA (Fills space nicely & looks premium) */}
        <div className="md:hidden bg-gradient-to-r from-[#0D4A36] via-[#125841] to-[#0D4A36] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-white shadow-xs flex items-center justify-between gap-2.5 font-malayalam shrink-0">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-sm">🛍️</span>
              <span>കടകൾ കാണാൻ തുടങ്ങാം</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-emerald-200 font-medium m-0 truncate">
              നിങ്ങളുടെ പ്രദേശത്തെ ഏറ്റവും കുറഞ്ഞ നിരക്കുകൾ
            </p>
          </div>
          <button
            type="button"
            onClick={onEnterAsConsumer}
            className="px-3 py-1.5 bg-white text-[#0D4A36] hover:bg-emerald-50 text-[11px] font-black rounded-lg shrink-0 flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer font-malayalam"
          >
            <span>തുടങ്ങാം</span>
            <ArrowRight className="w-3 h-3 text-[#0D4A36]" />
          </button>
        </div>

      </main>

      {/* 6. FOOTER */}
      <footer className="w-full bg-white border-t border-[#E3ECE7] py-1.5 md:py-3 px-3 md:px-4 text-center text-[9px] md:text-xs text-[#66756E] font-malayalam shrink-0 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#17221D] font-sans">PriceTeller Kerala</span>
            <span>·</span>
            <span className="truncate">“നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത്”</span>
          </div>
          <div className="text-[8px] md:text-[11px] shrink-0 text-[#0D4A36] font-bold">
            📍 Kerala
          </div>
        </div>
      </footer>

      {/* 6. MOBILE LOCATION SELECTION MODAL */}
      <MobileLocationModal
        isOpen={isMobileLocationModalOpen}
        onClose={() => setIsMobileLocationModalOpen(false)}
        onAllowLocation={() => {
          setIsMobileLocationModalOpen(false);
          onEnterAsConsumer();
        }}
        locations={locations}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          onSelectLocation(loc);
          setIsMobileLocationModalOpen(false);
        }}
      />

    </div>
  );
};
