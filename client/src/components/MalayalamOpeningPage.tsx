import React, { useState } from 'react';
import { Location, User } from '../types';
import {
  Search,
  Scale,
  MapPin,
  ChevronDown,
  ArrowRight,
  Store,
  Sparkles,
  LogOut,
  Home,
  ArrowLeftRight,
  User as UserIcon,
  Tag,
  Leaf,
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
  onOpenPartnerPortal?: () => void;
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
  onOpenPartnerPortal,
  onOpenShopCatalogue,
  authUser,
  onLogout,
  onSearch,
  onSelectCategory,
  onCustomerCoordsChanged,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isMobileLocationModalOpen, setIsMobileLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{ text: string; isWarning?: boolean } | null>(null);

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsFeedback(null);
    requestBrowserGps(
      async ({ lat, lng }) => {
        let placeName = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        try {
          const geo = await reverseGeocode(lat, lng);
          if (geo && typeof geo === 'string') {
            placeName = geo;
          }
        } catch {
          // fallback to coordinates
        }

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

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#EFF4F1] text-[#17221D] flex flex-col font-sans selection:bg-[#0D4A36] selection:text-white">

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (>= lg) - Full-screen 100dvh Two-Column Composition      */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-col h-full w-full overflow-hidden">
        {/* Desktop Top Header */}
        <header className="w-full bg-white/95 backdrop-blur-xl border-b border-[#0D4A36]/10 shrink-0 px-6 lg:px-8 py-2.5 z-40 transition-all shadow-[0_2px_12px_-3px_rgba(13,74,54,0.06)] font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-6">

            {/* Official PeediyaCart Logo & Primary Navigation */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <div className="hover:opacity-95 transition-transform active:scale-98 cursor-pointer shrink-0">
                <EnteBazaarLogo
                  size="sm"
                  withTagline={false}
                  onClick={onEnterAsConsumer}
                />
              </div>

              {/* Desktop Navigation Links */}
              <nav className="flex items-center gap-1.5 xl:gap-2 text-[13px] font-semibold text-[#2D4036]">
                <button
                  type="button"
                  onClick={onEnterAsConsumer}
                  className="group px-3 py-1.5 rounded-full hover:text-[#0D4A36] hover:bg-[#EAF5EF] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Products</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B8579] group-hover:text-[#0D4A36] group-hover:translate-y-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={onEnterAsConsumer}
                  className="px-3 py-1.5 rounded-full hover:text-[#0D4A36] hover:bg-[#EAF5EF] transition-all cursor-pointer"
                >
                  Shops
                </button>

                <button
                  type="button"
                  onClick={onEnterAsConsumer}
                  className="px-3 py-1.5 rounded-full hover:text-[#0D4A36] hover:bg-[#EAF5EF] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Offers</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>

                {/* Subtle divider */}
                <div className="h-4 w-[1px] bg-[#0D4A36]/15 mx-1.5" />

                {/* Merchant Portal Badge Link */}
                <button
                  type="button"
                  onClick={onOpenMerchantPortal}
                  className="group px-3 py-1.5 rounded-full text-[13px] font-bold text-[#0D4A36] bg-[#EAF5EF]/80 hover:bg-[#DDF1E6] border border-[#CCE3D6] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                >
                  <Store className="w-3.5 h-3.5 text-[#0D4A36] shrink-0" />
                  <span className="font-['Baloo_Chettan_2',sans-serif] text-sm leading-tight tracking-normal">വ്യാപാരികൾക്കായി</span>
                </button>

                {/* Partner Portal Link */}
                {onOpenPartnerPortal && (
                  <button
                    type="button"
                    onClick={onOpenPartnerPortal}
                    className="px-3 py-1.5 rounded-full text-[13px] font-bold text-[#3B5448] hover:text-[#0D4A36] hover:bg-[#EAF5EF] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span className="text-xs font-bold leading-tight tracking-normal">Partner</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Weighing scale / compare icon */}
              <button
                type="button"
                onClick={onEnterAsConsumer}
                className="relative group flex w-9 h-9 rounded-full bg-white hover:bg-[#EAF5EF] text-[#0D4A36] border border-[#D5E5DC] hover:border-[#0D4A36]/30 items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs shrink-0"
                title="വില താരതമ്യം (Compare Prices)"
                aria-label="Compare"
              >
                <Scale className="w-4 h-4 text-[#0D4A36] group-hover:scale-110 transition-transform" />
              </button>

              {/* Location Selector Pill */}
              <button
                type="button"
                onClick={() => setIsMobileLocationModalOpen(true)}
                className="group flex items-center gap-1.5 bg-gradient-to-b from-white to-[#F5FAF7] hover:to-[#EAF5EF] text-[#0D4A36] px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all cursor-pointer active:scale-95 shrink-0 border border-[#D0E5DA] hover:border-[#0D4A36]/35 shadow-2xs hover:shadow-xs"
                title="Change Location"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E5F3EC] text-[#0D4A36] group-hover:bg-[#0D4A36] group-hover:text-white transition-colors shrink-0">
                  <MapPin className="w-3 h-3" />
                </span>
                <span className="text-gray-400 font-normal text-xs">Location:</span>
                <span className="truncate max-w-[130px] font-bold text-[#0D4A36]">{locationName}</span>
                <ChevronDown className="w-3 h-3 text-[#6A887A] group-hover:text-[#0D4A36] group-hover:translate-y-0.5 transition-all shrink-0" />
              </button>

              {/* Login / Sign Up Pill Button */}
              {authUser ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0D4A36] to-[#125841] hover:from-[#083325] hover:to-[#0D4A36] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm font-malayalam shrink-0 active:scale-95"
                    title={authUser.role === 'merchant' ? 'വ്യാപാരി ഡാഷ്‌ബോർഡ് തുറക്കുക' : 'കടകൾ കാണുക'}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      {authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <span className="truncate max-w-[100px]">
                      {authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : 'കടകൾ'}
                    </span>
                    <ArrowRight className="w-3 h-3 ml-0.5 shrink-0" />
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="relative group overflow-hidden px-5 py-2 bg-gradient-to-r from-[#0D4A36] via-[#11543E] to-[#0A3B2B] hover:from-[#083325] hover:to-[#0D4A36] text-white text-[13px] font-bold rounded-full transition-all cursor-pointer shadow-[0_4px_14px_rgba(13,74,54,0.22)] hover:shadow-[0_6px_20px_rgba(13,74,54,0.32)] tracking-tight active:scale-95 shrink-0 border border-emerald-800/30"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>Login / Sign Up</span>
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Main Workspace */}
        <main className="flex-1 min-h-0 w-full max-w-[1720px] mx-auto p-3.5 lg:p-4 flex flex-col overflow-hidden">
          <div className="w-full h-full min-h-0 bg-gradient-to-br from-[#EEF7F2] via-[#E6F3EC] to-[#E2EFE7] rounded-[36px] p-8 xl:p-10 border border-[#CEE6DA] shadow-[0_6px_28px_rgba(13,74,54,0.04)] relative overflow-hidden flex flex-col justify-center">
            {/* Ambient soft glow orbs */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-12 gap-8 xl:gap-12 items-center h-full min-h-0 relative z-10">
              {/* Left Column: Two-Tone Headline, Search, Ticker */}
              <div className="col-span-6 flex flex-col justify-center space-y-5 xl:space-y-6.5 min-h-0 pr-2">
                {/* Tag Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF5EF] border border-[#CCE3D6] text-[#0D4A36] text-xs font-bold w-fit shadow-2xs font-['Baloo_Chettan_2',sans-serif]">
                  <Tag className="w-3.5 h-3.5 text-[#0D4A36]" />
                  <span>ഏറ്റവും കുറഞ്ഞ നിരക്കുകൾ</span>
                </div>

                {/* Two-Tone Malayalam Headline */}
                <h1 className="text-3xl lg:text-[42px] xl:text-[52px] 2xl:text-[62px] font-black text-[#14231A] leading-[1.12] tracking-tight font-['Anek_Malayalam','Baloo_Chettan_2',sans-serif] m-0">
                  ആവശ്യമായതെല്ലാം,<br />
                  <span className="text-[#EA580C]">മികച്ച വിലയിൽ</span><br />
                  കണ്ടെത്തൂ.
                </h1>

                {/* Subtitle */}
                <p className="text-sm lg:text-base xl:text-lg text-[#3D5B4D] font-medium leading-relaxed max-w-xl m-0 font-['Anek_Malayalam','Noto_Sans_Malayalam',sans-serif]">
                  നിങ്ങളുടെ സമീപത്തെ വിവിധ കടകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത്, ആവശ്യമായ ഉൽപ്പന്നങ്ങൾ മികച്ച വിലയിൽ കണ്ടെത്തൂ.
                </p>

                {/* Pill Search Bar */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-full p-2 pl-6 lg:pl-8 border border-[#BBD8C8] shadow-[0_8px_30px_rgba(13,74,54,0.08)] flex items-center justify-between gap-3 max-w-xl transition-all focus-within:border-[#0D4A36] focus-within:shadow-[0_12px_36px_rgba(13,74,54,0.14)] focus-within:ring-4 focus-within:ring-[#0D4A36]/10"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for groceries... / ഉൽപ്പന്നങ്ങൾ തിരയൂ..."
                    className="w-full bg-transparent text-sm lg:text-base xl:text-lg text-[#17221D] placeholder-[#88A396] outline-none font-['Anek_Malayalam','Inter',sans-serif]"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#0D4A36] hover:bg-[#073626] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
                    title="Search"
                  >
                    <Search className="w-5 h-5 text-white stroke-[2.5]" />
                  </button>
                </form>

                {/* Horizontal Price Ticker */}
                <div className="flex items-center gap-3.5 flex-wrap font-['Anek_Malayalam','Inter',sans-serif] text-xs lg:text-sm xl:text-base pt-0.5">
                  {[
                    { emoji: '🍅', name: 'Tomatoes', price: '₹28.00', query: 'തക്കാളി' },
                    { emoji: '🧅', name: 'Onions', price: '₹35.00', query: 'സവാള' },
                    { emoji: '🥛', name: 'Milk', price: '₹56.00', query: 'പാൽ' },
                    { emoji: '🥥', name: 'Coconut oil', price: '₹150.00', query: 'വെളിച്ചെണ്ണ' },
                  ].map((item, idx, arr) => (
                    <React.Fragment key={item.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput(item.query);
                          if (onSearch) onSearch(item.query);
                          else onEnterAsConsumer();
                        }}
                        className="inline-flex items-center gap-1.5 hover:text-[#0D4A36] text-[#2C3E35] font-bold transition-colors cursor-pointer group py-1 active:scale-95"
                      >
                        <span className="text-base lg:text-lg">{item.emoji}</span>
                        <span>{item.name}</span>
                        <span className="font-extrabold text-[#0D4A36]">{item.price}</span>
                      </button>
                      {idx < arr.length - 1 && (
                        <span className="text-[#A5C5B5] select-none font-light">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right Column: Studio Fresh Grocery Basket with Popular Items Overlay Card */}
              <div className="col-span-6 flex items-center justify-center relative h-full min-h-0">
                <div className="relative w-full h-full max-h-full flex items-center justify-center">
                  <div className="w-full max-w-[500px] xl:max-w-[560px] rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.12)] border-2 border-white/95">
                    <img
                      src="/hero-groceries-fresh.jpg"
                      alt="Fresh Groceries & Best Local Prices"
                      className="w-full h-auto max-h-[340px] xl:max-h-[400px] 2xl:max-h-[450px] object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-103"
                    />
                  </div>

                  {/* Floating Frosted "Popular Items" Card */}
                  <div className="absolute -right-4 xl:-right-6 top-1/2 -translate-y-1/2 w-[270px] xl:w-[300px] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-[0_20px_48px_rgba(0,0,0,0.12)] border border-white font-['Outfit','Inter',sans-serif] space-y-2.5 z-20">
                    <div className="flex items-center justify-between border-b border-[#EEF3F0] pb-2">
                      <h3 className="text-sm xl:text-base font-bold text-[#14231A] m-0">
                        Popular Items
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-malayalam">
                        തത്സമയം
                      </span>
                    </div>

                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F6FAF8] flex items-center justify-center text-sm overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🍅
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Tomatoes
                          </div>
                          <div className="text-[10px] text-[#66756E] font-malayalam">
                            തക്കാളി · 1 kg
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹28.00
                      </div>
                    </div>

                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F6FAF8] flex items-center justify-center text-sm overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🧅
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Onions
                          </div>
                          <div className="text-[10px] text-[#66756E] font-malayalam">
                            സവാള · 1 kg
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹35.00
                      </div>
                    </div>

                    <div className="flex items-center gap-2 py-0.5">
                      <div className="h-[1px] flex-1 bg-[#D8E8DF]" />
                      <span className="text-[10px] font-bold text-[#4B8A6E] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live price
                      </span>
                      <div className="h-[1px] flex-1 bg-[#D8E8DF]" />
                    </div>

                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F6FAF8] flex items-center justify-center text-sm overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🥥
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Coconut oil
                          </div>
                          <div className="text-[10px] text-[#66756E] font-malayalam">
                            വെളിച്ചെണ്ണ · 1 L
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹150.00
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onEnterAsConsumer}
                      className="w-full py-2 bg-[#0D4A36] hover:bg-[#073626] text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center font-malayalam shadow-2xs hover:shadow-xs active:scale-98 mt-1"
                    >
                      എല്ലാ നിരക്കുകളും കാണുക →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Desktop Compact Footer */}
        <footer className="w-full bg-white/90 backdrop-blur-md border-t border-[#E3ECE7] py-2 px-8 text-center text-[11px] text-[#66756E] font-['Outfit','Inter',sans-serif] shrink-0">
          <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17221D]">PeediyaCart</span>
              <span>·</span>
              <span className="font-malayalam">“നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത്”</span>
            </div>
            <div className="flex items-center gap-4 shrink-0 text-[#0D4A36] font-semibold">
              {onOpenPartnerPortal && (
                <button
                  type="button"
                  onClick={onOpenPartnerPortal}
                  className="hover:underline cursor-pointer text-slate-500 hover:text-emerald-700 text-xs font-semibold"
                >
                  🤝 Partner
                </button>
              )}
              <span>📍 Kerala</span>
            </div>
          </div>
        </footer>
      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE & TABLET / IPAD VIEW (< lg) - Responsive & Screen-filling       */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col h-full w-full overflow-hidden bg-[#EFF4F1]">
        
        {/* Header Bar */}
        <header className="w-full bg-white border-b border-[#E3ECE7] px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3 shrink-0 z-30 shadow-2xs">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-3">
            {/* PeediyaCart Official Logo */}
            <div className="shrink-0 active:scale-98 transition-transform cursor-pointer">
              <EnteBazaarLogo size="sm" withTagline={false} onClick={onEnterAsConsumer} />
            </div>

            {/* Right Action Cluster: Location Pill + Login Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Location Selector Pill */}
              <button
                type="button"
                onClick={() => setIsMobileLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#EAF5EF] hover:bg-[#DDF1E6] text-[#0D4A36] px-3 py-1.5 rounded-full text-xs sm:text-[13px] font-bold border border-[#CCE3D6] shadow-2xs active:scale-95 transition-all cursor-pointer font-['Baloo_Chettan_2',sans-serif]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0D4A36] shrink-0" />
                <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[150px]">{locationName}</span>
                <ChevronDown className="w-3 h-3 text-[#0D4A36] shrink-0" />
              </button>

              {/* Login / Profile Pill Button */}
              {authUser ? (
                <button
                  type="button"
                  onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                  className="px-3.5 sm:px-4 py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-xs sm:text-[13px] font-bold rounded-full transition-all cursor-pointer shadow-xs font-['Baloo_Chettan_2',sans-serif] active:scale-95 shrink-0"
                >
                  {authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : (authUser.name?.slice(0, 6) || 'അക്കൗണ്ട്')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="px-4 sm:px-5 py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-xs sm:text-[13px] font-bold rounded-full transition-all cursor-pointer shadow-xs active:scale-95 font-['Plus_Jakarta_Sans',sans-serif] shrink-0"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Micro-Nav Strip */}
        <div className="w-full bg-[#FAFCFA] border-b border-[#E3ECE7]/80 px-3.5 sm:px-6 md:px-8 py-1.5 shrink-0 shadow-2xs">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#3E564B] font-['Baloo_Chettan_2',sans-serif]">
            <button
              type="button"
              onClick={onOpenMerchantPortal}
              className="flex items-center gap-1 hover:text-[#0D4A36] transition-colors cursor-pointer"
            >
              <Store className="w-3 h-3 text-[#0D4A36]" />
              <span>വ്യാപാരികൾക്കായി</span>
            </button>

            <span className="text-gray-300 select-none">•</span>

            {onOpenPartnerPortal && (
              <button
                type="button"
                onClick={onOpenPartnerPortal}
                className="hover:text-[#0D4A36] transition-colors cursor-pointer text-xs font-bold"
              >
                <span>Partner</span>
              </button>
            )}

            <span className="text-gray-300 select-none">•</span>

            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>തത്സമയം അപ്ഡേറ്റുകൾ</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area - Beautifully Proportioned on Mobile & iPad */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 flex flex-col items-center">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl space-y-3.5 sm:space-y-4">
            
            {/* Main Hero Card Container */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-[#CCE3D6] bg-white">
              
              {/* Top Fresh Produce Basket Hero Photo (Responsive height on iPad) */}
              <div className="relative w-full h-[180px] xs:h-[200px] sm:h-[260px] md:h-[300px] overflow-hidden bg-slate-100">
                <img
                  src="/hero-groceries-fresh.jpg"
                  alt="Fresh Produce Basket"
                  className="w-full h-full object-cover"
                />
                {/* Top Left Pill Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold font-['Baloo_Chettan_2',sans-serif] border border-white/20 flex items-center gap-1 shadow-sm">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  <span>തോട്ടങ്ങളിൽ നിന്നും നേരിട്ട്</span>
                </div>
                {/* Top Right Pill Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold font-['Baloo_Chettan_2',sans-serif] border border-white/20 shadow-sm">
                  <span>100% ശുദ്ധം</span>
                </div>
              </div>

              {/* Overlapping White Content Card */}
              <div className="p-4 sm:p-6 md:p-7 -mt-5 relative z-10 bg-white rounded-t-3xl space-y-3.5 sm:space-y-4 border-t border-white">
                {/* Mint Tag Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EF] border border-[#CCE3D6] text-[#0D4A36] text-[11px] sm:text-xs font-bold font-['Baloo_Chettan_2',sans-serif] shadow-2xs">
                  <Tag className="w-3 h-3 text-[#0D4A36]" />
                  <span>ഏറ്റവും കുറഞ്ഞ നിരക്കുകൾ</span>
                </div>

                {/* Two-Tone Malayalam Headline */}
                <h1 className="text-[25px] sm:text-[30px] md:text-[34px] font-black text-[#14231A] leading-[1.18] tracking-tight font-['Anek_Malayalam','Baloo_Chettan_2',sans-serif] m-0">
                  ആവശ്യമായതെല്ലാം,<br />
                  <span className="text-[#EA580C]">മികച്ച വിലയിൽ</span><br />
                  കണ്ടെത്തൂ.
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#526B5F] font-medium leading-relaxed font-['Anek_Malayalam','Noto_Sans_Malayalam',sans-serif] m-0">
                  നിങ്ങളുടെ സമീപത്തെ വിവിധ കടകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത്, ആവശ്യമായ ഉൽപ്പന്നങ്ങൾ മികച്ച വിലയിൽ കണ്ടെത്തൂ.
                </p>

                {/* Pill Search Bar with Dark Green Round Button */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="w-full bg-[#EAF3EE] rounded-full p-1 sm:p-1.5 pl-4 sm:pl-5 border border-[#CCE3D6] flex items-center justify-between gap-2 transition-all focus-within:border-[#0D4A36] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0D4A36]/20 shadow-inner"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for groceries... / ഉൽപ്പന്നങ്ങൾ തിരയൂ"
                    className="w-full bg-transparent text-xs sm:text-sm md:text-base text-[#17221D] placeholder-[#7F998C] outline-none font-['Anek_Malayalam','Inter',sans-serif] py-1"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#0D4A36] hover:bg-[#073626] text-white flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-xs transition-transform"
                    title="Search"
                  >
                    <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[2.5]" />
                  </button>
                </form>

                {/* Today's Staples Live Ticker Strip (4 columns on iPad/Tablet) */}
                <div className="pt-2 border-t border-gray-100/90 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#556F62] uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ഇന്നത്തെ വിപണി നിരക്ക് (TODAY'S STAPLES)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('തക്കാളി');
                        if (onSearch) onSearch('തക്കാളി');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-xs font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>🍅</span>
                        <span className="truncate">Tomatoes</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹28.00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('സവാള');
                        if (onSearch) onSearch('സവാള');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-xs font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>🧅</span>
                        <span className="truncate">Onions</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹35.00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('ഉരുളക്കിഴങ്ങ്');
                        if (onSearch) onSearch('ഉരുളക്കിഴങ്ങ്');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-xs font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>🥔</span>
                        <span className="truncate">Potatoes</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹32.00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('തേങ്ങ');
                        if (onSearch) onSearch('തേങ്ങ');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-xs font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>🥥</span>
                        <span className="truncate">Coconut</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹42.00</span>
                    </button>
                  </div>
                </div>

                {/* Tablet Quick Category Shortcuts (Fills iPad screen height gracefully) */}
                <div className="pt-2 border-t border-gray-100 hidden sm:block">
                  <div className="text-[11px] font-bold text-[#556F62] uppercase tracking-wider mb-2 font-['Baloo_Chettan_2',sans-serif]">
                    വിഭാഗങ്ങൾ തിരയൂ (Quick Categories)
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: '🥦', name: 'പച്ചക്കറി', tag: 'Vegetables' },
                      { icon: '🍎', name: 'പഴങ്ങൾ', tag: 'Fruits' },
                      { icon: '🌾', name: 'പലചരക്ക്', tag: 'Groceries' },
                      { icon: '🥛', name: 'പാൽ & ബേക്കറി', tag: 'Dairy' },
                    ].map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchInput(c.name);
                          if (onSearch) onSearch(c.name);
                          else onEnterAsConsumer();
                        }}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-[#EAF5EF] border border-gray-200/80 hover:border-[#CCE3D6] text-center transition-all cursor-pointer active:scale-95"
                      >
                        <div className="text-xl mb-0.5">{c.icon}</div>
                        <div className="text-xs font-bold text-[#14231A] font-['Baloo_Chettan_2',sans-serif] leading-tight truncate">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium truncate">{c.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Trust / Brand Strip */}
            <div className="py-2 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#CCE3D6] shadow-2xs text-xs font-bold text-[#14231A]">
                <span>PeediyaCart</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#3D564A] font-['Anek_Malayalam',sans-serif]">“നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത്”</span>
              </div>

              <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-semibold text-[#5A7467] font-['Baloo_Chettan_2',sans-serif]">
                {onOpenPartnerPortal && (
                  <button
                    type="button"
                    onClick={onOpenPartnerPortal}
                    className="hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>🤝</span>
                    <span>Partner Network</span>
                  </button>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>Kerala Local Markets</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Bottom Tab Navigation Bar */}
        <nav className="w-full bg-white border-t border-[#CCE3D6] px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] font-['Baloo_Chettan_2',sans-serif]">
          <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto grid grid-cols-4 gap-2 items-center">
            {/* 1. Home Tab (Active) */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-4 rounded-2xl bg-[#C7EFE0] text-[#0A4532] font-black text-xs sm:text-[13px] transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A4532]" />
              <span className="text-[11px] sm:text-xs mt-0.5 leading-none">ഹോം</span>
            </button>

            {/* 2. Compare Tab */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-4 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs sm:text-[13px] transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs mt-0.5 leading-none">താരതമ്യം</span>
            </button>

            {/* 3. Shops Tab */}
            <button
              type="button"
              onClick={() => {
                if (onOpenShopCatalogue) onOpenShopCatalogue();
                else onEnterAsConsumer();
              }}
              className="flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-4 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs sm:text-[13px] transition-all active:scale-95 cursor-pointer"
            >
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs mt-0.5 leading-none">കടകൾ</span>
            </button>

            {/* 4. Account Tab */}
            <button
              type="button"
              onClick={authUser ? (authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer) : (onOpenConsumerLogin || onEnterAsConsumer)}
              className="flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-4 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs sm:text-[13px] transition-all active:scale-95 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[11px] sm:text-xs mt-0.5 leading-none truncate max-w-[60px]">
                {authUser ? (authUser.name?.slice(0, 5) || 'അക്കൗണ്ട്') : 'അക്കൗണ്ട്'}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Location Selection Modal */}
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
