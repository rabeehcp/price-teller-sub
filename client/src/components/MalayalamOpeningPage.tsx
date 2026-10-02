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
  Download,
  TrendingUp,
  ShoppingBag,
  Zap,
  Truck,
  CheckCircle2,
  ShieldCheck,
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
          // fallback
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
      {/* 1. DESKTOP VIEW (>= lg) - Unified, High-Energy Visual Stage              */}
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
              <nav className="flex items-center gap-2 text-[13px] font-semibold text-[#2D4036]">
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
                  onClick={() => {
                    if (onOpenShopCatalogue) onOpenShopCatalogue();
                    else onEnterAsConsumer();
                  }}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {/* Subtle divider */}
                <div className="h-4 w-[1px] bg-[#0D4A36]/15 mx-1" />

                {/* Direct Merchant Portal Glow Button */}
                <button
                  type="button"
                  onClick={onOpenMerchantPortal}
                  className="group relative overflow-hidden px-4 py-1.5 rounded-full text-xs xl:text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 bg-gradient-to-r from-[#0D4A36] via-[#125841] to-[#0A3B2B] text-white shadow-sm hover:shadow-md hover:scale-102 active:scale-98 border border-emerald-700/40 font-['Baloo_Chettan_2',sans-serif]"
                >
                  <Store className="w-3.5 h-3.5 text-amber-300" />
                  <span className="tracking-wide">വ്യാപാരികൾക്കായി (Merchant Hub)</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full font-sans">
                    0% Fee
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </button>

                {/* Partner Portal Link */}
                {onOpenPartnerPortal && (
                  <button
                    type="button"
                    onClick={onOpenPartnerPortal}
                    className="px-3 py-1.5 rounded-full text-[13px] font-bold text-[#3B5448] hover:text-[#0D4A36] hover:bg-[#EAF5EF] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span className="text-xs font-bold leading-tight">Partner</span>
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
                    <span className="truncate max-w-[110px]">
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
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenConsumerLogin || onEnterAsConsumer}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-[#0D4A36] bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] transition-all cursor-pointer active:scale-95"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={onOpenMerchantPortal}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#0D4A36] hover:bg-[#083325] transition-all cursor-pointer active:scale-95 shadow-xs flex items-center gap-1"
                  >
                    <Store className="w-3 h-3 text-amber-300" />
                    <span>വ്യാപാരി രജിസ്റ്റർ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Main Stage: Unified High-Energy Composition */}
        <main className="flex-1 min-h-0 w-full max-w-[1720px] mx-auto p-3.5 lg:p-4 flex flex-col overflow-hidden">
          <div className="w-full h-full min-h-0 bg-gradient-to-br from-[#EEF7F2] via-[#E6F3EC] to-[#DFEEE5] rounded-[36px] p-6 xl:p-8 border border-[#CEE6DA] shadow-[0_6px_28px_rgba(13,74,54,0.04)] relative overflow-hidden flex flex-col justify-between">
            
            {/* Ambient soft glow elements */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Sub-Bar: Quick Highlights & Brochure Download */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-[#D2E7DC]/60 relative z-20 shrink-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BCD9CA] text-[#0D4A36] text-xs font-bold font-['Baloo_Chettan_2',sans-serif] shadow-2xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>കേരളത്തിലെ തത്സമയ പലചരക്ക് വിപണി (Kerala Live Market)</span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-[#0D4A36] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>50+ അംഗീകൃത സൂപ്പർമാർക്കറ്റുകൾ</span>
                </span>
              </div>

              {/* Direct PDF Download Links */}
              <div className="flex items-center gap-2">
                <a
                  href="/PeediaCart_Merchant_Brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-[#BCD9CA] text-[#0D4A36] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 font-['Baloo_Chettan_2',sans-serif]"
                  title="വ്യാപാരി ബ്രോഷർ ഡൗൺലോഡ് ചെയ്യുക"
                >
                  <Store className="w-3 h-3 text-emerald-700" />
                  <span>വ്യാപാരി ബ്രോഷർ (PDF)</span>
                </a>

                <a
                  href="/PeediaCart_Consumer_Brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-[#BCD9CA] text-[#0D4A36] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 font-['Baloo_Chettan_2',sans-serif]"
                  title="ഷോപ്പർ ബ്രോഷർ ഡൗൺലോഡ് ചെയ്യുക"
                >
                  <Download className="w-3 h-3 text-[#0D4A36]" />
                  <span>ഷോപ്പർ ബ്രോഷർ (PDF)</span>
                </a>
              </div>
            </div>

            {/* Main Stage Grid (Left: Dynamic Hero & Dual Action Gateway / Right: Studio Visual & Live Cards) */}
            <div className="grid grid-cols-12 gap-6 xl:gap-10 items-center flex-1 min-h-0 relative z-10 my-auto">
              
              {/* Left Column (Span 6) */}
              <div className="col-span-6 flex flex-col justify-center space-y-3.5 xl:space-y-4.5 min-h-0 pr-1">
                
                {/* Two-Tone Malayalam Headline */}
                <h1 className="text-3xl lg:text-[38px] xl:text-[45px] 2xl:text-[50px] font-black text-[#14231A] leading-[1.12] tracking-tight font-['Anek_Malayalam','Baloo_Chettan_2',sans-serif] m-0">
                  ആവശ്യമായതെല്ലാം,<br />
                  <span className="text-[#EA580C]">മികച്ച വിലയിൽ</span><br />
                  കണ്ടെത്തൂ.
                </h1>

                {/* Subtitle */}
                <p className="text-xs lg:text-sm xl:text-base text-[#345143] font-medium leading-relaxed max-w-xl m-0 font-['Anek_Malayalam','Noto_Sans_Malayalam',sans-serif]">
                  നിങ്ങളുടെ സമീപത്തെ വിവിധ കടകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത്, ഉൽപ്പന്നങ്ങൾ കുറഞ്ഞ നിരക്കിൽ വാങ്ങാം.
                </p>

                {/* Search Bar */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-full p-1.5 pl-5 lg:pl-6 border border-[#B8D7C6] shadow-[0_6px_24px_rgba(13,74,54,0.08)] flex items-center justify-between gap-3 max-w-xl transition-all focus-within:border-[#0D4A36] focus-within:ring-3 focus-within:ring-[#0D4A36]/15"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search groceries (e.g. തക്കാളി, സവാള, വെളിച്ചെണ്ണ)..."
                    className="w-full bg-transparent text-xs lg:text-sm xl:text-base text-[#17221D] placeholder-[#85A193] outline-none font-['Anek_Malayalam','Inter',sans-serif]"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#0D4A36] hover:bg-[#073626] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
                    title="Search"
                  >
                    <Search className="w-4 h-4 lg:w-5 lg:h-5 text-white stroke-[2.5]" />
                  </button>
                </form>

                {/* Live Staples Ticker Bar */}
                <div className="flex items-center gap-2.5 flex-wrap font-['Anek_Malayalam','Inter',sans-serif] text-xs xl:text-sm pt-0.5">
                  <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ലൈവ് നിരക്ക്:
                  </span>
                  {[
                    { emoji: '🍅', name: 'Tomatoes', price: '₹28.00', query: 'തക്കാളി' },
                    { emoji: '🧅', name: 'Onions', price: '₹35.00', query: 'സവാള' },
                    { emoji: '🥔', name: 'Potatoes', price: '₹32.00', query: 'ഉരുളക്കിഴങ്ങ്' },
                    { emoji: '🥥', name: 'Coconut Oil', price: '₹150.00', query: 'വെളിച്ചെണ്ണ' },
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setSearchInput(item.query);
                        if (onSearch) onSearch(item.query);
                        else onEnterAsConsumer();
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-emerald-50 border border-[#CCE3D6] text-[#2C3E35] font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span className="font-extrabold text-[#0D4A36]">{item.price}</span>
                    </button>
                  ))}
                </div>

                {/* THE 100% VERY NICE DUAL GATEWAY CARDS (Shoppers + Merchants Side-by-Side) */}
                <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
                  
                  {/* Gateway 1: For Shoppers (Smart Compare) */}
                  <div
                    onClick={onEnterAsConsumer}
                    className="p-3.5 rounded-2xl bg-white/90 hover:bg-white border border-[#CCE3D6] hover:border-[#0D4A36]/40 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                          🛒
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Shoppers
                        </span>
                      </div>
                      <div className="text-xs xl:text-[13px] font-bold text-[#14231A] font-['Baloo_Chettan_2',sans-serif] pt-1">
                        ഉപഭോക്താക്കൾക്കായി
                      </div>
                      <div className="text-[11px] text-[#556F62] leading-snug">
                        വിലകൾ താരതമ്യം ചെയ്ത് ₹1,200 വരെ ലാഭിക്കൂ
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#0D4A36] group-hover:translate-x-1 transition-transform pt-2">
                      <span>ഷോപ്പിംഗ് തുടങ്ങൂ</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Gateway 2: For Merchants & Supermarkets (Merchant Hub) */}
                  <div
                    onClick={onOpenMerchantPortal}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0D4A36] to-[#083526] text-white border border-emerald-700/50 shadow-sm hover:shadow-lg hover:border-amber-400/60 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                          🏪
                        </div>
                        <span className="text-[10px] bg-amber-400/25 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                          0% Commission
                        </span>
                      </div>
                      <div className="text-xs xl:text-[13px] font-bold text-white font-['Baloo_Chettan_2',sans-serif] pt-1">
                        വ്യാപാരികൾക്കായി (Merchant Hub)
                      </div>
                      <div className="text-[11px] text-emerald-100/80 leading-snug">
                        കട ലിസ്റ്റ് ചെയ്യൂ • ലൈവ് റേറ്റ്, POS & ഡെലിവറി
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-300 group-hover:translate-x-1 transition-transform pt-2 relative z-10">
                      <span>വ്യാപാരി പോർട്ടൽ തുറക്കുക</span>
                      <ArrowRight className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Span 6): Visual Composition with Live Float Cards */}
              <div className="col-span-6 flex items-center justify-center relative h-full min-h-0">
                <div className="relative w-full h-full max-h-full flex items-center justify-center">
                  
                  {/* Hero Image in Ultra-Crisp Rounded Frame */}
                  <div className="w-full max-w-[460px] xl:max-w-[510px] rounded-3xl overflow-hidden shadow-[0_16px_44px_rgba(0,0,0,0.12)] border-2 border-white/95 relative group">
                    <img
                      src="/hero-groceries-fresh.jpg"
                      alt="Fresh Groceries & Best Local Prices"
                      className="w-full h-auto max-h-[310px] xl:max-h-[360px] object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    
                    {/* Bottom Image Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold font-['Baloo_Chettan_2',sans-serif]">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span>തോട്ടങ്ങളിൽ നിന്നും നേരിട്ട് • 100% ശുദ്ധം</span>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/85 backdrop-blur-md border border-white/20">
                        <Truck className="w-3 h-3" />
                        <span>ഹോം ഡെലിവറി ലഭ്യമാണ്</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Live Price List Card (Right Side) */}
                  <div className="absolute -right-3 xl:-right-6 top-1/2 -translate-y-1/2 w-[255px] xl:w-[275px] bg-white/95 backdrop-blur-md rounded-3xl p-3.5 shadow-[0_20px_48px_rgba(0,0,0,0.14)] border border-white font-['Outfit','Inter',sans-serif] space-y-2 z-20">
                    <div className="flex items-center justify-between border-b border-[#EEF3F0] pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-xs xl:text-sm font-bold text-[#14231A] m-0">
                          Live Market Rates
                        </h3>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 font-malayalam">
                        തത്സമയം
                      </span>
                    </div>

                    {/* Popular Items Mini-List */}
                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F6FAF8] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🍅
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Tomatoes (തക്കാളി)
                          </div>
                          <div className="text-[9px] text-[#66756E]">1 kg • Fresh</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹28.00
                      </div>
                    </div>

                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F6FAF8] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🧅
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Onions (സവാള)
                          </div>
                          <div className="text-[9px] text-[#66756E]">1 kg • Fresh</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹35.00
                      </div>
                    </div>

                    <div
                      onClick={onEnterAsConsumer}
                      className="flex items-center justify-between p-1.5 hover:bg-[#F3F8F5] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F6FAF8] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#E3ECE7]">
                          🥥
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#17221D] truncate group-hover:text-[#0D4A36]">
                            Coconut Oil (വെളിച്ചെണ്ണ)
                          </div>
                          <div className="text-[9px] text-[#66756E]">1 L • Pure Kera</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#0D4A36] shrink-0 font-sans">
                        ₹150.00
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onEnterAsConsumer}
                      className="w-full py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center font-malayalam shadow-2xs active:scale-98 mt-1"
                    >
                      എല്ലാ നിരക്കുകളും കാണുക →
                    </button>
                  </div>

                  {/* Partner Supermarket Badge (Bottom Left Floating) */}
                  <div
                    onClick={() => {
                      if (onOpenShopCatalogue) onOpenShopCatalogue('Kalyan Hypermarket');
                      else onEnterAsConsumer();
                    }}
                    className="absolute -left-3 xl:-left-6 -bottom-2 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-white flex items-center gap-3 cursor-pointer group hover:scale-102 transition-transform z-20"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      🏪
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-[#14231A] flex items-center gap-1.5">
                        <span>കല്യാൺ ഹൈപ്പർമാർക്കറ്റ്</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">4.9 ★</span>
                      </div>
                      <div className="text-[10px] text-[#526B5F]">
                        150+ ഉൽപ്പന്നങ്ങൾ ലൈവ് • ഡെലിവറി ലഭ്യമാണ് ⚡
                      </div>
                    </div>
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
              <button
                type="button"
                onClick={onOpenMerchantPortal}
                className="hover:underline cursor-pointer text-emerald-800 font-bold text-xs flex items-center gap-1"
              >
                <Store className="w-3 h-3 text-emerald-700" />
                <span>വ്യാപാരികൾക്കായി (Merchant Hub)</span>
              </button>
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
      {/* 2. MOBILE & TABLET VIEW (< lg) - High-Vibe, Non-Boring Complete Page    */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col h-full w-full overflow-hidden bg-[#EFF4F1]">
        
        {/* Header Bar */}
        <header className="w-full bg-white border-b border-[#E3ECE7] px-3.5 sm:px-6 py-2.5 shrink-0 z-30 shadow-2xs">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-3">
            {/* PeediyaCart Logo */}
            <div className="shrink-0 active:scale-98 transition-transform cursor-pointer">
              <EnteBazaarLogo size="sm" withTagline={false} onClick={onEnterAsConsumer} />
            </div>

            {/* Right Action Cluster: Location Pill + Login Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Location Pill */}
              <button
                type="button"
                onClick={() => setIsMobileLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#EAF5EF] hover:bg-[#DDF1E6] text-[#0D4A36] px-2.5 py-1.5 rounded-full text-xs font-bold border border-[#CCE3D6] shadow-2xs active:scale-95 transition-all cursor-pointer font-['Baloo_Chettan_2',sans-serif]"
              >
                <MapPin className="w-3 h-3 text-[#0D4A36] shrink-0" />
                <span className="truncate max-w-[85px] sm:max-w-[120px]">{locationName}</span>
                <ChevronDown className="w-3 h-3 text-[#0D4A36] shrink-0" />
              </button>

              {/* Login / Profile Pill Button */}
              {authUser ? (
                <button
                  type="button"
                  onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                  className="px-3 py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs font-['Baloo_Chettan_2',sans-serif] active:scale-95 shrink-0"
                >
                  {authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : (authUser.name?.slice(0, 6) || 'അക്കൗണ്ട്')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="px-3.5 py-1.5 bg-[#0D4A36] hover:bg-[#073626] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs active:scale-95 font-['Plus_Jakarta_Sans',sans-serif] shrink-0"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Scrollable Stage (Rich, Seamless Feed without Jarring Toggles) */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 sm:p-5 flex flex-col items-center">
          <div className="w-full max-w-lg sm:max-w-xl space-y-3 pb-4">
            
            {/* 1. Fresh Produce Hero Card */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-[#CCE3D6] bg-white">
              
              {/* Studio Fresh Groceries Photo */}
              <div className="relative w-full h-[175px] xs:h-[195px] sm:h-[240px] overflow-hidden bg-slate-100">
                <img
                  src="/hero-groceries-fresh.jpg"
                  alt="Fresh Produce Basket"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold font-['Baloo_Chettan_2',sans-serif] border border-white/20 flex items-center gap-1 shadow-sm">
                  <Leaf className="w-3 h-3 text-emerald-300" />
                  <span>തോട്ടങ്ങളിൽ നിന്നും നേരിട്ട്</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-700/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold font-['Baloo_Chettan_2',sans-serif] border border-white/20 shadow-sm">
                  <span>100% ശുദ്ധം</span>
                </div>
              </div>

              {/* Overlapping Content Container */}
              <div className="p-4 sm:p-5 -mt-4 relative z-10 bg-white rounded-t-3xl space-y-3 border-t border-white">
                
                {/* Mint Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EAF5EF] border border-[#CCE3D6] text-[#0D4A36] text-[11px] font-bold font-['Baloo_Chettan_2',sans-serif]">
                  <Tag className="w-3 h-3 text-[#0D4A36]" />
                  <span>ഏറ്റവും കുറഞ്ഞ വിപണി നിരക്കുകൾ</span>
                </div>

                {/* Headline */}
                <h1 className="text-[23px] sm:text-[28px] font-black text-[#14231A] leading-[1.18] tracking-tight font-['Anek_Malayalam','Baloo_Chettan_2',sans-serif] m-0">
                  ആവശ്യമായതെല്ലാം,<br />
                  <span className="text-[#EA580C]">മികച്ച വിലയിൽ</span> കണ്ടെത്തൂ.
                </h1>

                {/* Subtitle */}
                <p className="text-xs text-[#526B5F] font-medium leading-relaxed font-['Anek_Malayalam',sans-serif] m-0">
                  നിങ്ങളുടെ സമീപത്തെ സൂപ്പർമാർക്കറ്റുകളിലെ വിലകൾ ഒരിടത്ത് താരതമ്യം ചെയ്ത് കുറഞ്ഞ നിരക്കിൽ വാങ്ങാം.
                </p>

                {/* Pill Search Bar */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="w-full bg-[#EAF3EE] rounded-full p-1 pl-4 border border-[#CCE3D6] flex items-center justify-between gap-2 transition-all focus-within:border-[#0D4A36] focus-within:bg-white shadow-inner"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search groceries (തക്കാളി, സവാള...)"
                    className="w-full bg-transparent text-xs sm:text-sm text-[#17221D] placeholder-[#7F998C] outline-none font-['Anek_Malayalam','Inter',sans-serif] py-0.5"
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0D4A36] hover:bg-[#073626] text-white flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-xs transition-transform"
                    title="Search"
                  >
                    <Search className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  </button>
                </form>

                {/* Live Staples Ticker Chips */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#556F62] uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ഇന്നത്തെ വിപണി നിരക്ക് (TODAY'S RATES)
                    </span>
                    <span className="text-emerald-700 font-bold">1-ക്ലിക്ക് സെർച്ച്</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('തക്കാളി');
                        if (onSearch) onSearch('തക്കാളി');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-[11px] font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <span>🍅</span>
                        <span className="truncate">Tomatoes</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹28</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('സവാള');
                        if (onSearch) onSearch('സവാള');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-[11px] font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <span>🧅</span>
                        <span className="truncate">Onions</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹35</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('ഉരുളക്കിഴങ്ങ്');
                        if (onSearch) onSearch('ഉരുളക്കിഴങ്ങ്');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-[11px] font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <span>🥔</span>
                        <span className="truncate">Potatoes</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹32</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('വെളിച്ചെണ്ണ');
                        if (onSearch) onSearch('വെളിച്ചെണ്ണ');
                        else onEnterAsConsumer();
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF5EF] hover:bg-[#DDF1E6] border border-[#CCE3D6] text-[11px] font-bold text-[#14231A] transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <span>🥥</span>
                        <span className="truncate">Kera Oil</span>
                      </span>
                      <span className="font-mono font-black text-[#0D4A36] shrink-0 ml-1">₹150</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Three Interactive Quick-Action Feature Tiles */}
            <div className="grid grid-cols-3 gap-2 font-['Baloo_Chettan_2',sans-serif]">
              
              {/* Tile 1: Smart Price Compare */}
              <button
                type="button"
                onClick={onEnterAsConsumer}
                className="p-2.5 rounded-2xl bg-white border border-[#CCE3D6] text-left transition-all active:scale-95 shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  ⚖️
                </div>
                <div className="pt-2">
                  <div className="text-xs font-bold text-[#14231A]">വില താരതമ്യം</div>
                  <div className="text-[10px] text-gray-500">കടകൾ താരതമ്യം ചെയ്യൂ</div>
                </div>
              </button>

              {/* Tile 2: Shop Catalogues */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopCatalogue) onOpenShopCatalogue();
                  else onEnterAsConsumer();
                }}
                className="p-2.5 rounded-2xl bg-white border border-[#CCE3D6] text-left transition-all active:scale-95 shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
                  🏪
                </div>
                <div className="pt-2">
                  <div className="text-xs font-bold text-[#14231A]">കടകൾ കാണൂ</div>
                  <div className="text-[10px] text-gray-500">സമീപത്തെ കടകൾ</div>
                </div>
              </button>

              {/* Tile 3: Express Home Delivery */}
              <button
                type="button"
                onClick={onEnterAsConsumer}
                className="p-2.5 rounded-2xl bg-white border border-[#CCE3D6] text-left transition-all active:scale-95 shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                  🛵
                </div>
                <div className="pt-2">
                  <div className="text-xs font-bold text-[#14231A]">ഹോം ഡെലിവറി</div>
                  <div className="text-[10px] text-gray-500">വീട്ടുപടിക്കൽ എത്തും</div>
                </div>
              </button>
            </div>

            {/* 3. VIBRANT MERCHANT SUPERMARKET SPOTLIGHT CARD */}
            <div className="rounded-3xl p-4 bg-gradient-to-br from-[#0D4A36] via-[#0B402F] to-[#06291E] text-white border border-emerald-700/60 shadow-sm relative overflow-hidden space-y-3 font-['Baloo_Chettan_2',sans-serif]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold border border-amber-300/30">
                  <Store className="w-3 h-3 text-amber-300" />
                  <span>കടയുടമകൾക്കായി (FOR SHOP OWNERS)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  0% കമ്മീഷൻ
                </span>
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="text-base font-extrabold text-white leading-tight m-0">
                  നിങ്ങളുടെ കട പീഡിയകാർട്ടിൽ ചേർക്കൂ!
                </h3>
                <p className="text-xs text-emerald-100/80 leading-relaxed m-0 font-['Anek_Malayalam',sans-serif]">
                  ദിവസേനയുള്ള വിലകൾ നൽകി കൂടുതൽ കസ്റ്റമേഴ്സിനെ നേടാം. സ്മാർട്ട് POS, ലൈവ് ഇൻവെന്ററി & ഹോം ഡെലിവറി ലഭ്യമാണ്.
                </p>
              </div>

              {/* Action Buttons for Merchant */}
              <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
                <button
                  type="button"
                  onClick={onOpenMerchantPortal}
                  className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5 text-slate-900" />
                  <span>വ്യാപാരി പോർട്ടൽ →</span>
                </button>

                <a
                  href="/PeediaCart_Merchant_Brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-white/20 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ബ്രോഷർ PDF</span>
                </a>
              </div>
            </div>

            {/* 4. Trust Strip */}
            <div className="py-2 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#CCE3D6] shadow-2xs text-xs font-bold text-[#14231A]">
                <span>PeediyaCart</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#3D564A] font-['Anek_Malayalam',sans-serif]">“നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത്”</span>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Tab Navigation Bar */}
        <nav className="w-full bg-white border-t border-[#CCE3D6] px-4 sm:px-6 py-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] font-['Baloo_Chettan_2',sans-serif]">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-2 items-center">
            
            {/* 1. Home Tab (Active) */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl bg-[#C7EFE0] text-[#0A4532] font-black text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Home className="w-4 h-4 text-[#0A4532]" />
              <span className="text-[11px] mt-0.5 leading-none">ഹോം</span>
            </button>

            {/* 2. Compare Tab */}
            <button
              type="button"
              onClick={onEnterAsConsumer}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="text-[11px] mt-0.5 leading-none">താരതമ്യം</span>
            </button>

            {/* 3. Shops Tab */}
            <button
              type="button"
              onClick={() => {
                if (onOpenShopCatalogue) onOpenShopCatalogue();
                else onEnterAsConsumer();
              }}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span className="text-[11px] mt-0.5 leading-none">കടകൾ</span>
            </button>

            {/* 4. Merchant / Account Tab */}
            <button
              type="button"
              onClick={onOpenMerchantPortal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-[#4A6457] hover:text-[#0D4A36] font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-700" />
              <span className="text-[11px] mt-0.5 leading-none truncate max-w-[60px] font-extrabold text-emerald-800">
                വ്യാപാരി
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
