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
import { requestBrowserGps, reverseGeocode, findNearestLocation } from '../services/locationService';
import { EnteBazaarLogo } from './EnteBazaarLogo';

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
  onCustomerCoordsChanged?: (coords: { lat: number; lng: number; name?: string } | null) => void;
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
  onCustomerCoordsChanged,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isMobileLocationModalOpen, setIsMobileLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{ text: string; isWarning?: boolean } | null>(null);

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsFeedback(null);
    requestBrowserGps(
      async (coords) => {
        const lat = coords.lat;
        const lng = coords.lng;

        if (coords.accuracy && coords.accuracy > 10000) {
          setIsDetectingGps(false);
          const accuracyKm = Math.round((coords.accuracy / 1000) * 10) / 10;
          setGpsFeedback({
            text: `GPS സിഗ്നൽ കൃത്യത കുറവാണ് (${accuracyKm} km). ദയവായി പട്ടികയിൽ നിന്ന് സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.`,
            isWarning: true,
          });
          return;
        }

        let placeName = 'Live GPS Location';
        try {
          const rev = await reverseGeocode(lat, lng);
          if (rev) placeName = rev;
        } catch {}

        const newCoords = { lat, lng, name: placeName };
        onCustomerCoordsChanged?.(newCoords);

        const result = findNearestLocation(lat, lng, locations);
        if (result) {
          onSelectLocation(result.nearestLocation);
          if (result.isWithinHubArea) {
            setGpsFeedback({
              text: `${placeName} (${result.nearestLocation.name} Hub, ${result.distanceKm} km)`,
              isWarning: false,
            });
            setTimeout(() => {
              setIsMobileLocationModalOpen(false);
              setGpsFeedback(null);
            }, 1200);
          } else {
            setGpsFeedback({
              text: `നിങ്ങളുടെ സ്ഥലം (${placeName}) മലപ്പുറം ഹബ്ബിന് പുറത്താണ്. സമീപത്തെ ഹബ്ബ്: ${result.nearestLocation.name} (${result.distanceKm} km)`,
              isWarning: true,
            });
          }
        } else {
          setIsMobileLocationModalOpen(false);
        }
        setIsDetectingGps(false);
      },
      (errorMsg) => {
        setIsDetectingGps(false);
        setGpsFeedback({
          text: errorMsg,
          isWarning: true,
        });
      }
    );
  };

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
      image: '/categories/vegetables.jpg',
    },
    {
      id: 'onion',
      name: 'സവാള',
      unit: '1 kg',
      price: 35,
      priceUnit: 'kg',
      emoji: '🧅',
      image: '/categories/vegetables.jpg',
    },
    {
      id: 'potato',
      name: 'ഉരുളക്കിഴങ്ങ്',
      unit: '1 kg',
      price: 32,
      priceUnit: 'kg',
      emoji: '🥔',
      image: '/categories/vegetables.jpg',
    },
    {
      id: 'milk',
      name: 'പാൽ (1 ലി)',
      unit: 'Milma',
      price: 56,
      priceUnit: 'ലി',
      emoji: '🥛',
      image: '/categories/dairy.jpg',
    },
    {
      id: 'oil',
      name: 'എണ്ണ (1 ലി)',
      unit: 'Kera',
      price: 150,
      priceUnit: 'ലി',
      emoji: '🥥',
      image: '/categories/oils-spices.jpg',
    },
  ];

  // 8 Categories matching reference exactly with realistic high-resolution images
  const categories = [
    {
      id: 'vegetables',
      label: 'പച്ചക്കറികൾ',
      image: '/categories/vegetables.jpg',
      emoji: '🥬',
      bgColor: 'bg-[#E8F6ED]',
    },
    {
      id: 'fruits',
      label: 'പഴങ്ങൾ',
      image: '/categories/fruits.jpg',
      emoji: '🍎',
      bgColor: 'bg-[#FEF1E6]',
    },
    {
      id: 'rice-grains',
      label: 'അരി & ധാന്യങ്ങൾ',
      image: '/categories/grains.jpg',
      emoji: '🌾',
      bgColor: 'bg-[#F9EFE3]',
    },
    {
      id: 'dairy',
      label: 'പാൽ & പാലുൽപ്പന്നങ്ങൾ',
      image: '/categories/dairy.jpg',
      emoji: '🥛',
      bgColor: 'bg-[#EBF4FC]',
    },
    {
      id: 'oils-spices',
      label: 'എണ്ണ & മസാലകൾ',
      image: '/categories/oils-spices.jpg',
      emoji: '🫗',
      bgColor: 'bg-[#FFF9E6]',
    },
    {
      id: 'beverages',
      label: 'പാനീയങ്ങൾ',
      image: '/categories/beverages.jpg',
      emoji: '🧃',
      bgColor: 'bg-[#E9F6F8]',
    },
    {
      id: 'bakery-breakfast',
      label: 'ബേക്കറി & സ്നാക്കുകൾ',
      image: '/categories/bakery.jpg',
      emoji: '🍪',
      bgColor: 'bg-[#FDF2E7]',
    },
    {
      id: 'cleaning-household',
      label: 'വീട്ടുപകരണങ്ങൾ',
      image: '/categories/cleaning.jpg',
      emoji: '🧹',
      bgColor: 'bg-[#F2EFFB]',
    },
  ];

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] overflow-x-hidden overflow-y-auto md:h-auto md:max-h-none md:min-h-screen bg-[#EFF4F1] text-[#17221D] flex flex-col font-sans selection:bg-[#0D4A36] selection:text-white">

      {/* 1. TOP HEADER */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E3ECE7] shrink-0 px-3 sm:px-6 lg:px-10 xl:px-12 py-1.5 md:py-3 z-40">
        <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3 md:gap-6">

          {/* Official EnteBazaar Logo */}
          <EnteBazaarLogo
            size="md"
            withTagline={true}
            onClick={onEnterAsConsumer}
          />

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Merchant Portal entrance button */}
            <button
              type="button"
              onClick={onOpenMerchantPortal}
              className="flex items-center gap-1.5 text-xs lg:text-sm font-bold text-[#4D6158] hover:text-[#0D4A36] hover:bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 lg:py-2 rounded-full border border-[#D5E5DC]/60 hover:border-[#D5E5DC] transition-all cursor-pointer font-malayalam shrink-0"
              title="വ്യാപാരികൾക്കായി (Merchant Portal)"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B8579]" />
              <span className="hidden xs:inline sm:inline">വ്യാപാരികൾക്കായി</span>
            </button>

            {/* Weighing scale / compare icon */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-[#E5EFE9] text-[#0D4A36] hover:bg-[#D4EEDE] items-center justify-center transition-all cursor-pointer active:scale-95"
              title="വില താരതമ്യം (Compare Prices)"
              aria-label="Compare"
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-[#0D4A36]" />
            </button>

            {/* Notification bell */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full hover:bg-black/5 items-center justify-center text-[#4D6158] transition-colors cursor-pointer relative"
              title="അറിയിപ്പുകൾ"
            >
              <Bell className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 border border-white" />
            </button>

            {/* Header Location Selector Indicator (Desktop & Mobile) */}
            <button
              type="button"
              onClick={() => setIsMobileLocationModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#E5EFE9] hover:bg-[#D4EEDE] text-[#0D4A36] px-2.5 sm:px-3.5 py-1 sm:py-1.5 lg:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold font-malayalam transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
              title="സ്ഥലം മാറ്റുക (Change Location)"
            >
              <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#0D4A36] shrink-0" />
              <span className="truncate max-w-[70px] sm:max-w-[120px] lg:max-w-[160px]">{locationName}</span>
              <ChevronDown className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#0D4A36] shrink-0" />
            </button>

            {/* Login / Sign Up Pill Button */}
            {authUser ? (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-2 lg:py-2.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-[11px] sm:text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs font-malayalam shrink-0"
                  title={authUser.role === 'merchant' ? 'വ്യാപാരി ഡാഷ്‌ബോർഡ് തുറക്കുക' : 'കടകൾ കാണുക'}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0">
                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">
                    {authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : 'കടകൾ'}
                  </span>
                  <ArrowRight className="w-3 h-3 ml-0.5 shrink-0" />
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="ലോഗ് ഔട്ട് (Log Out)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenConsumerLogin || onEnterAsConsumer}
                className="px-3 sm:px-5 py-1 sm:py-1.5 lg:py-2 bg-[#0D4A36] hover:bg-[#073626] text-white text-[11px] sm:text-xs lg:text-sm font-bold rounded-full transition-all cursor-pointer shadow-xs font-sans tracking-tight active:scale-95 shrink-0"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Compact on mobile, expansive 100% fit on desktop) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-2.5 sm:px-6 lg:px-10 xl:px-12 pt-2 pb-2 sm:py-2.5 md:py-5 lg:py-6 flex flex-col justify-between gap-2.5 sm:gap-3 md:gap-5 lg:gap-6 min-h-0">

        {/* HERO SECTION (Mint green card matching reference) */}
        <div className="bg-gradient-to-br from-[#DCEFE5] via-[#D0EDD9] to-[#C7E5D1] rounded-2xl md:rounded-[36px] p-3 sm:p-5 lg:p-7 xl:p-8 border border-[#BDDDC8] shadow-2xs relative overflow-hidden flex flex-col justify-between">

          {/* Subtle background decorative foliage */}
          <div className="absolute top-2 right-1/4 text-emerald-800/10 text-5xl pointer-events-none select-none hidden md:block">
            🌿
          </div>
          <div className="absolute -bottom-6 left-1/4 text-emerald-800/10 text-7xl pointer-events-none select-none hidden md:block">
            🍃
          </div>

          {/* DESKTOP LAYOUT (>= md) */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-8 xl:gap-10 items-center min-h-0">

            {/* Left Column: Heading, Subtitle, Embedded Search Box & Popular Quick Tags */}
            <div className="md:col-span-7 lg:col-span-5 xl:col-span-5 space-y-3 lg:space-y-4 xl:space-y-5">
              <h1 className="text-2xl lg:text-[36px] xl:text-[44px] font-black text-[#0B3D2D] leading-[1.18] font-malayalam tracking-tight m-0">
                ആവശ്യമായതെല്ലാം,<br />
                <span className="text-[#063B2A]">മികച്ച വിലയിൽ കണ്ടെത്തൂ.</span>
              </h1>

              <p className="text-xs lg:text-sm xl:text-base text-[#405C4F] font-medium font-malayalam leading-relaxed max-w-lg m-0">
                നിങ്ങളുടെ സമീപത്തെ വിവിധ കടകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത്, ആവശ്യമായ ഉൽപ്പന്നങ്ങൾ മികച്ച വിലയിൽ കണ്ടെത്തൂ.
              </p>

              {/* Embedded Search Input Pill */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-full p-1.5 lg:p-2 pl-4 lg:pl-5 border border-[#BBD8C8] shadow-2xs flex items-center justify-between gap-2 max-w-lg xl:max-w-xl transition-all focus-within:border-[#0D4A36] focus-within:ring-2 focus-within:ring-[#0D4A36]/20"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5 text-[#6B8579] shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ഉൽപ്പന്നത്തിന്റെ പേര് തിരയൂ..."
                  className="w-full bg-transparent text-xs lg:text-sm xl:text-base text-[#17221D] placeholder-[#7F998D] outline-none font-malayalam"
                />
                <button
                  type="submit"
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#0D4A36] hover:bg-[#063B2A] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95"
                >
                  <Search className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap font-malayalam pt-0.5">
                <span className="text-[10px] lg:text-xs font-bold text-[#0D4A36]/70">ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ:</span>
                {[
                  { name: 'തക്കാളി', price: '₹28' },
                  { name: 'സവാള', price: '₹35' },
                  { name: 'പാൽ', price: '₹56' },
                  { name: 'വെളിച്ചെണ്ണ', price: '₹150' },
                  { name: 'അരി', price: '₹42' },
                ].map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => {
                      setSearchInput(tag.name);
                      if (onSearch) onSearch(tag.name);
                      else onEnterAsConsumer();
                    }}
                    className="bg-white/85 hover:bg-white text-[#0D4A36] px-2.5 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold border border-white/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span>{tag.name}</span>
                    <span className="font-sans font-black text-emerald-800 text-[9px] lg:text-[10px]">{tag.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Center Column: Seamless 3D Market Stall & Essentials Hero Illustration */}
            <div className="md:col-span-5 lg:col-span-4 xl:col-span-4 flex items-center justify-center relative">
              <div className="relative group w-full flex items-center justify-center">
                <img
                  src="/hero-market.jpg"
                  alt="More Choices. Better Prices."
                  className="w-full max-h-[220px] md:max-h-[260px] lg:max-h-[320px] xl:max-h-[360px] object-contain drop-shadow-md select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Floating "ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ" (Popular Products) Card */}
            <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 justify-end">
              <div className="w-full max-w-[270px] lg:max-w-[310px] xl:max-w-[340px] bg-white/95 backdrop-blur-md rounded-2xl lg:rounded-3xl p-3 lg:p-4 xl:p-4.5 shadow-lg border border-white/80 font-malayalam space-y-1.5 lg:space-y-2">

                {/* Card Header with Location Dropdown */}
                <div className="flex items-center justify-between border-b border-[#F0F4F2] pb-1.5 relative">
                  <div>
                    <h3 className="text-xs lg:text-sm font-black text-[#17221D] m-0">
                      ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ
                    </h3>
                    <span className="text-[9px] lg:text-[10px] text-emerald-700 font-semibold">തത്സമയ നിരക്കുകൾ</span>
                  </div>

                  {/* Location Selector Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMobileLocationModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#0D4A36] hover:text-[#063B2A] bg-[#E8F5EE] hover:bg-[#D4EEDE] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
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

                        {/* Quick Town Chips */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar my-1 pb-1 font-malayalam">
                          {['areekode', 'malappuram', 'manjeri', 'tirur', 'kottakkal', 'nilambur', 'kondotty', 'kizhisseri'].map((townId) => {
                            const loc = (locations || []).find((l) => l && l.id === townId);
                            if (!loc) return null;
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
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0D4A36] text-white'
                                    : 'bg-[#E8F5EE] text-[#0D4A36] hover:bg-[#D4EEDE]'
                                }`}
                              >
                                {loc.name}
                              </button>
                            );
                          })}
                        </div>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                          {(locations || [])
                            .filter((loc) => {
                              if (!loc) return false;
                              if (!locationSearchQuery.trim()) return true;
                              const q = locationSearchQuery.toLowerCase().trim();
                              return (
                                (loc.name && loc.name.toLowerCase().includes(q)) ||
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
                                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${isSelected
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

          {/* MOBILE LAYOUT (< md): Ultra-optimized layout with full-width lengthened search bar */}
          <div className="md:hidden flex-1 h-full flex flex-col justify-between gap-3.5 sm:gap-4 min-h-0 py-1">
            {/* Top row: Left Headline & Subtitle + Right 3D Illustration */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B3D2D] leading-[1.2] font-malayalam tracking-tight m-0">
                  ആവശ്യമായതെല്ലാം,<br />
                  <span className="text-[#063B2A]">മികച്ച വിലയിൽ കണ്ടെത്തൂ.</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#405C4F] font-semibold font-malayalam leading-snug mt-1.5 m-0">
                  നിങ്ങളുടെ സമീപത്തെ വിവിധ കടകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത്, ആവശ്യമായ ഉൽപ്പന്നങ്ങൾ മികച്ച വിലയിൽ കണ്ടെത്തൂ.
                </p>
              </div>

              {/* Seamless 3D Grocery Hero Illustration on Right */}
              <div className="w-[115px] sm:w-[140px] shrink-0 flex items-center justify-center">
                <img
                  src="/hero-market.jpg"
                  alt="More Choices. Better Prices."
                  className="w-full h-auto max-h-[95px] sm:max-h-[115px] object-contain drop-shadow-md pointer-events-none"
                />
              </div>
            </div>

            {/* Full-Width Lengthened Search Bar for Mobile */}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full bg-white rounded-full p-1.5 pl-4 border border-[#BBD8C8] shadow-xs flex items-center justify-between gap-2.5 transition-all focus-within:border-[#0D4A36] focus-within:ring-2 focus-within:ring-[#0D4A36]/20 my-0.5"
            >
              <Search className="w-4 h-4 text-[#6B8579] shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ഉൽപ്പന്നത്തിന്റെ പേര് തിരയൂ..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#17221D] placeholder-[#7F998D] outline-none font-malayalam py-1"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-full bg-[#0D4A36] hover:bg-[#063B2A] text-white flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs transition-transform"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-bold font-malayalam">തിരയൂ</span>
              </button>
            </form>

            {/* Mobile Live Price Ticker Strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 font-malayalam">
              <span className="text-xs font-black text-[#0D4A36] bg-white/95 px-3 py-1.5 rounded-lg shrink-0 border border-[#BBD8C8] shadow-2xs">
                ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ:
              </span>
              {todayPrices.map((item) => (
                <div
                  key={item.id}
                  onClick={onEnterAsConsumer}
                  className="bg-white/95 text-[#0D4A36] text-xs font-bold px-2.5 py-1 rounded-full border border-[#BBD8C8] shadow-2xs shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-4 h-4 object-contain rounded-md shrink-0" />
                  ) : (
                    <span>{item.emoji}</span>
                  )}
                  <span>{item.name}</span>
                  <span className="font-sans font-black text-emerald-800">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. CATEGORIES SECTION ("കാറ്റഗറികൾ") */}
        <section className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm sm:text-base lg:text-lg font-black text-[#17221D] font-malayalam m-0">
              കാറ്റഗറികൾ
            </h2>
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#0D4A36] hover:underline font-malayalam cursor-pointer"
            >
              എല്ലാം കാണുക →
            </button>
          </div>

          {/* Categories: 4-col grid on mobile (2 rows of 4), 8-col on desktop */}
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 font-malayalam">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-white hover:bg-[#F9FCFA] border border-[#E3ECE7] hover:border-[#0D4A36]/30 rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-4.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-full"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-1.5 lg:mb-2 transition-transform group-hover:scale-110 shadow-2xs overflow-hidden p-1 sm:p-1.5`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-contain rounded-xl drop-shadow-2xs"
                    loading="lazy"
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold text-[#17221D] leading-tight group-hover:text-[#0D4A36] line-clamp-2 w-full text-center">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. VALUE PROPOSITION / TRUST CARDS (Bottom 4 Cards) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 font-malayalam">

          {/* Card 1: വില താരതമ്യം ചെയ്യാം */}
          <div className="bg-[#E8F3ED] hover:bg-[#DDECE4] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-4.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 transition-all hover:shadow-2xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-lg md:rounded-xl lg:rounded-2xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-black text-[#17221D] truncate">വില താരതമ്യം ചെയ്യാം</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] lg:text-xs text-[#556960] font-medium truncate">വിവിധ കടകളിലെ വിലകൾ എളുപ്പത്തിൽ താരതമ്യം ചെയ്യൂ</div>
            </div>
          </div>

          {/* Card 2: പ്രാദേശിക കടകൾ */}
          <div className="bg-[#E8F3ED] hover:bg-[#DDECE4] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-4.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 transition-all hover:shadow-2xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-lg md:rounded-xl lg:rounded-2xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-black text-[#17221D] truncate">പ്രാദേശിക കടകൾ</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] lg:text-xs text-[#556960] font-medium truncate">നിങ്ങളുടെ സമീപത്തെ കടകളിൽ നിന്ന് കണ്ടെത്തൂ</div>
            </div>
          </div>

          {/* Card 3: എളുപ്പത്തിൽ വാങ്ങാം */}
          <div className="bg-[#E8F3ED] hover:bg-[#DDECE4] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-4.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 transition-all hover:shadow-2xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-lg md:rounded-xl lg:rounded-2xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-black text-[#17221D] truncate">എളുപ്പത്തിൽ വാങ്ങാം</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] lg:text-xs text-[#556960] font-medium truncate">ഇഷ്ടപ്പെട്ട കടയിൽ നിന്ന് നേരിട്ട് വാങ്ങൂ</div>
            </div>
          </div>

          {/* Card 4: പൂർണ്ണമായും സൗജന്യം */}
          <div className="bg-[#E8F3ED] hover:bg-[#DDECE4] border border-[#D5E5DC] rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-4.5 flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 transition-all hover:shadow-2xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-lg md:rounded-xl lg:rounded-2xl bg-white text-[#0D4A36] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#0D4A36]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-black text-[#17221D] truncate">പൂർണ്ണമായും സൗജന്യം</div>
              <div className="text-[8px] sm:text-[9px] md:text-[11px] lg:text-xs text-[#556960] font-medium truncate">ഉപഭോക്താക്കൾക്കായി അധിക ചാർജുകളില്ല</div>
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
      <footer className="w-full bg-white border-t border-[#E3ECE7] py-2 md:py-3.5 px-3 md:px-6 lg:px-10 xl:px-12 text-center text-[9px] md:text-xs lg:text-sm text-[#66756E] font-malayalam shrink-0 overflow-hidden">
        <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#17221D] font-sans">PeediyaCart Kerala</span>
            <span>·</span>
            <span className="truncate">“നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത്”</span>
          </div>
          <div className="text-[8px] md:text-[11px] lg:text-xs shrink-0 text-[#0D4A36] font-bold">
            📍 Kerala
          </div>
        </div>
      </footer>

      {/* 6. MOBILE LOCATION SELECTION MODAL */}
      <MobileLocationModal
        isOpen={isMobileLocationModalOpen}
        onClose={() => {
          setIsMobileLocationModalOpen(false);
          setGpsFeedback(null);
        }}
        onAllowLocation={handleDetectGps}
        isDetecting={isDetectingGps}
        gpsFeedback={gpsFeedback}
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
