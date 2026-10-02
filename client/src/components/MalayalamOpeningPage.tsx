import React, { useState } from 'react';
import { Location, User } from '../types';
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  Store,
  LogOut,
  ShoppingBag,
  Download,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2,
  Building2,
  Layers,
  Phone,
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
  authUser,
  onLogout,
  onCustomerCoordsChanged,
}) => {
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

  const locationName = currentLocation?.name || 'അരീക്കോട്';

  return (
    <div className="min-h-screen min-h-[100dvh] overflow-y-auto bg-[#FAF9F5] text-[#192A20] flex flex-col font-sans selection:bg-[#064E3B] selection:text-white">

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (>= lg) - Clean, Scrollable Dual-Portal Gateway           */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-col min-h-screen w-full">
        
        {/* Top Header */}
        <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E8E4D8] sticky top-0 z-40 shadow-xs px-8 py-3.5">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-6">

            {/* Official PeediyaCart Logo */}
            <div className="flex items-center gap-6 shrink-0">
              <div
                onClick={onEnterAsConsumer}
                className="cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <EnteBazaarLogo size="md" />
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3 shrink-0 font-['Baloo_Chettan_2',sans-serif]">
              
              {/* Location Selector */}
              <button
                type="button"
                onClick={() => setIsMobileLocationModalOpen(true)}
                className="group flex items-center gap-2 bg-[#F3EFE6] hover:bg-[#EBE5D8] text-[#064E3B] px-4 py-1.5 rounded-full text-xs font-bold border border-[#E0D8C7] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="സ്ഥലം മാറ്റുക"
              >
                <MapPin className="w-3.5 h-3.5 text-[#064E3B]" />
                <span className="text-gray-500 font-normal">സ്ഥലം:</span>
                <span className="font-extrabold">{locationName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Brochures */}
              <a
                href="/PeediaCart_Merchant_Brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-[#D5E5DC] text-[#064E3B] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>വ്യാപാരി ബ്രോഷർ</span>
              </a>

              <a
                href="/PeediaCart_Consumer_Brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-[#D5E5DC] text-[#064E3B] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>ഷോപ്പർ ബ്രോഷർ</span>
              </a>

              {/* Partner Portal */}
              {onOpenPartnerPortal && (
                <button
                  type="button"
                  onClick={onOpenPartnerPortal}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:text-[#064E3B] hover:bg-[#F3EFE6] transition-all cursor-pointer"
                >
                  🤝 പാർട്ണർ
                </button>
              )}

              {/* Auth / Login */}
              {authUser ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#064E3B] hover:bg-[#043327] text-white text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>{authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : 'എന്റെ അക്കൗണ്ട്'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="px-5 py-1.5 rounded-full text-xs font-extrabold text-[#064E3B] bg-[#E7F3EC] hover:bg-[#D7EBDD] border border-[#BCDDC8] transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  ലോഗിൻ
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Main Gateway Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 flex flex-col justify-center items-center">
          
          {/* Header Title Area */}
          <div className="text-center space-y-2 max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF5EF] border border-[#CCE7D8] text-[#064E3B] text-xs font-extrabold font-['Baloo_Chettan_2',sans-serif]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>കേരളത്തിലെ പ്രാദേശിക വ്യാപാര ശൃംഖല</span>
            </div>
            
            <h1 className="text-3xl xl:text-4xl 2xl:text-[42px] font-black text-[#14231A] tracking-tight leading-tight font-['Baloo_Chettan_2',sans-serif] m-0">
              സ്മാർട്ടായി വാങ്ങാം, <span className="text-[#EA580C]">ലാഭകരമായി വിൽക്കാം</span>
            </h1>
            
            <p className="text-sm xl:text-base text-[#4E6257] font-medium max-w-2xl mx-auto m-0 font-['Anek_Malayalam','Inter',sans-serif]">
              ഉപഭോക്താക്കൾക്ക് സമീപത്തെ വിശ്വസ്ത കടകളിൽ നിന്ന് എളുപ്പത്തിൽ വാങ്ങാം; വ്യാപാരികൾക്ക് ഡിജിറ്റൽ സംവിധാനങ്ങളിലൂടെ ബിസിനസ്സ് വളർത്താം.
            </p>
          </div>

          {/* Dual Gateway Portals with Covered Image Containers */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-5xl mb-8">
            
            {/* PORTAL 1: For Shoppers & Consumers */}
            <div
              onClick={onEnterAsConsumer}
              className="bg-white rounded-3xl border-2 border-[#E2DDD0] hover:border-[#064E3B] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(6,78,59,0.12)] transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
            >
              {/* Image Container Covering Top */}
              <div className="relative w-full h-48 xl:h-52 overflow-hidden bg-slate-100">
                <img
                  src="/shopper-portal-cover.jpg"
                  alt="Shopping from Local Stores in Kerala"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Floating Tag inside Cover */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#064E3B] text-xs font-extrabold border border-white/60 font-['Baloo_Chettan_2',sans-serif] shadow-xs flex items-center gap-1.5">
                  <span>🛒</span>
                  <span>ഉപഭോക്താക്കൾക്കായി</span>
                </div>

                {/* White Opacity Blending Container */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl py-2 px-3.5 border border-white/80 shadow-xs inline-block max-w-full font-['Baloo_Chettan_2',sans-serif]">
                    <div className="text-base font-black text-[#14231A] leading-tight m-0">
                      ഷോപ്പിംഗ് പോർട്ടൽ
                    </div>
                    <div className="text-xs text-[#3C5749] font-semibold font-['Anek_Malayalam',sans-serif]">
                      സമീപത്തെ വിശ്വസ്ത കടകളിൽ നിന്ന്
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 font-['Baloo_Chettan_2',sans-serif]">
                <div className="space-y-2">
                  <p className="text-xs xl:text-sm text-[#5C7267] leading-relaxed m-0 font-['Anek_Malayalam',sans-serif]">
                    സമീപത്തെ കടകളിലെ ഉൽപ്പന്നങ്ങൾ കാണൂ, ഓഫറുകൾ അറിയൂ, നേരിട്ട് ഓർഡർ ചെയ്യൂ.
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-[#2E4237] font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>സമീപത്തെ അംഗീകൃത കടകൾ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>തത്സമയ സ്റ്റോക്ക് & ഓഫറുകൾ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ഹോം ഡെലിവറി & സ്റ്റോർ പിക്കപ്പ്</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#064E3B] group-hover:bg-[#043327] text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                  >
                    <span>ഷോപ്പിംഗ് തുടങ്ങൂ</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* PORTAL 2: For Merchants & Shop Owners */}
            <div
              onClick={onOpenMerchantPortal}
              className="bg-white rounded-3xl border-2 border-[#E2DDD0] hover:border-[#D97706] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(217,119,6,0.12)] transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
            >
              {/* Image Container Covering Top */}
              <div className="relative w-full h-48 xl:h-52 overflow-hidden bg-slate-100">
                <img
                  src="/merchant-portal-cover.jpg"
                  alt="Merchant Store POS & Management"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Floating Tag inside Cover */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FEF3C7] backdrop-blur-md text-[#92400E] text-xs font-extrabold border border-[#FDE68A] font-['Baloo_Chettan_2',sans-serif] shadow-xs flex items-center gap-1.5">
                  <span>🏪</span>
                  <span>കടയുടമകൾക്കുമായി</span>
                </div>

                {/* White Opacity Blending Container */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl py-2 px-3.5 border border-white/80 shadow-xs inline-block max-w-full font-['Baloo_Chettan_2',sans-serif]">
                    <div className="text-base font-black text-[#14231A] leading-tight m-0">
                      വ്യാപാരി പോർട്ടൽ
                    </div>
                    <div className="text-xs text-[#78350F] font-semibold font-['Anek_Malayalam',sans-serif]">
                      ഡിജിറ്റൽ POS & സ്മാർട്ട് സ്റ്റോർ മാനേജ്‌മെന്റ്
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 font-['Baloo_Chettan_2',sans-serif]">
                <div className="space-y-2">
                  <p className="text-xs xl:text-sm text-[#5C7267] leading-relaxed m-0 font-['Anek_Malayalam',sans-serif]">
                    നിങ്ങളുടെ കട പീഡിയകാർട്ടിൽ ലിസ്റ്റ് ചെയ്ത് കൂടുതൽ കസ്റ്റമേഴ്സിനെ നേടൂ.
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-[#2E4237] font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>സ്മാർട്ട് സ്റ്റോർ ലിസ്റ്റിംഗ് & മാനേജ്‌മെന്റ്</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>സ്മാർട്ട് ഡിജിറ്റൽ POS & ബില്ലിംഗ് സിസ്റ്റം</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>തത്സമയ ഇൻവെന്ററി & ഓൺലൈൻ ഓർഡറുകൾ</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#D97706] group-hover:bg-[#B45309] text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                  >
                    <span>കട രജിസ്റ്റർ ചെയ്യാം</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Trust & Highlight Strip */}
          <div className="w-full max-w-4xl flex items-center justify-between text-xs text-[#526B5F] font-bold font-['Baloo_Chettan_2',sans-serif] pt-6 border-t border-[#E8E4D8] mb-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#064E3B]" />
              <span>50+ അംഗീകൃത പ്രാദേശിക കടകൾ</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#064E3B]" />
              <span>വേഗത്തിലുള്ള ഹോം ഡെലിവറി</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
              <span>100% സുരക്ഷിതം & വിശ്വസ്തം</span>
            </div>
          </div>
        </main>

        {/* Desktop Footer */}
        <footer className="w-full bg-white/90 border-t border-[#E8E4D8] py-3 px-8 text-center text-xs text-gray-500 font-['Baloo_Chettan_2',sans-serif] mt-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#14231A]">PeediaCart</span>
              <span>·</span>
              <span>കേരളത്തിലെ പ്രാദേശിക വ്യാപാര ശൃംഖല</span>
            </div>
            <div className="flex items-center gap-4 text-[#064E3B] font-bold">
              <button
                type="button"
                onClick={onOpenMerchantPortal}
                className="hover:underline cursor-pointer"
              >
                വ്യാപാരികൾക്കായി (Merchant Hub)
              </button>
              <span>·</span>
              <span>📍 Kerala</span>
            </div>
          </div>
        </footer>
      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE & TABLET VIEW (< lg) - Clean, Full-Height Dual-Portal Gateway  */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col flex-1 w-full bg-[#FAF9F5]">
        
        {/* Mobile Header Bar */}
        <header className="w-full bg-white border-b border-[#E8E4D8] px-4 py-3 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-lg mx-auto w-full flex items-center justify-between gap-3">
            {/* Official PeediyaCart Logo */}
            <div
              onClick={onEnterAsConsumer}
              className="shrink-0 active:scale-98 transition-transform cursor-pointer"
            >
              <EnteBazaarLogo size="sm" />
            </div>

            {/* Right Cluster: Location + Login */}
            <div className="flex items-center gap-2 shrink-0 font-['Baloo_Chettan_2',sans-serif]">
              <button
                type="button"
                onClick={() => setIsMobileLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#F3EFE6] text-[#064E3B] px-2.5 py-1 rounded-full text-xs font-bold border border-[#E0D8C7] active:scale-95"
              >
                <MapPin className="w-3 h-3 text-[#064E3B]" />
                <span className="truncate max-w-[90px]">{locationName}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {authUser ? (
                <button
                  type="button"
                  onClick={authUser.role === 'merchant' ? onOpenMerchantPortal : onEnterAsConsumer}
                  className="px-3 py-1 bg-[#064E3B] text-white text-xs font-bold rounded-full active:scale-95"
                >
                  {authUser.role === 'merchant' ? (authUser.shopName || 'ഡാഷ്‌ബോർഡ്') : 'അക്കൗണ്ട്'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConsumerLogin || onEnterAsConsumer}
                  className="px-3.5 py-1 bg-[#064E3B] text-white text-xs font-bold rounded-full active:scale-95"
                >
                  ലോഗിൻ
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Main Stage: Vast, Balanced, Rich Dual-Gateway View */}
        <div className="flex-1 w-full px-4 py-3 flex flex-col items-center justify-start">
          <div className="w-full max-w-md flex flex-col space-y-4">
            
            {/* Title Section */}
            <div className="text-center space-y-2 pt-2 pb-1">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF5EF] border border-[#CCE7D8] text-[#064E3B] text-xs font-extrabold font-['Baloo_Chettan_2',sans-serif] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>കേരളത്തിലെ പ്രാദേശിക വ്യാപാര ശൃംഖല</span>
              </div>
              
              <h1 className="text-[28px] xs:text-[30px] font-black text-[#14231A] leading-tight tracking-tight font-['Baloo_Chettan_2',sans-serif] m-0">
                സ്മാർട്ടായി വാങ്ങാം, <span className="text-[#EA580C]">ലാഭകരമായി വിൽക്കാം</span>
              </h1>
              
              <p className="text-xs xs:text-sm text-[#4E6257] font-medium leading-relaxed font-['Anek_Malayalam',sans-serif] m-0 max-w-xs mx-auto">
                ഉപഭോക്താക്കൾക്കായി ഷോപ്പിംഗും കടയുടമകൾക്കായി ബിസിനസ്സ് വളർച്ചയും.
              </p>
            </div>

            {/* MOBILE CARD 1: For Shoppers (Vast, Premium Image Cover) */}
            <div
              onClick={onEnterAsConsumer}
              className="rounded-3xl bg-white border-2 border-[#E2DDD0] hover:border-[#064E3B] shadow-md active:scale-[0.99] transition-all cursor-pointer overflow-hidden font-['Baloo_Chettan_2',sans-serif]"
            >
              <div className="relative w-full h-48 xs:h-52 sm:h-56 bg-slate-100 overflow-hidden">
                <img
                  src="/shopper-portal-cover.jpg"
                  alt="Shoppers"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#064E3B] text-xs font-extrabold shadow-xs flex items-center gap-1.5">
                  <span>🛒</span>
                  <span>ഉപഭോക്താക്കൾക്കായി</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3.5 border border-white/80 shadow-xs inline-block max-w-full">
                    <div className="text-base xs:text-lg font-black text-[#14231A] leading-tight">
                      ഷോപ്പിംഗ് പോർട്ടൽ
                    </div>
                    <div className="text-[11px] xs:text-xs text-[#3C5749] font-semibold font-['Anek_Malayalam',sans-serif]">
                      സമീപത്തെ വിശ്വസ്ത കടകളിൽ നിന്ന്
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 xs:p-5 space-y-3.5">
                <p className="text-xs xs:text-sm text-[#5C7267] font-['Anek_Malayalam',sans-serif] leading-relaxed m-0">
                  സമീപത്തെ കടകളിലെ ഉൽപ്പന്നങ്ങൾ കാണൂ, ഓഫറുകൾ അറിയൂ, നേരിട്ട് ഓർഡർ ചെയ്യൂ.
                </p>

                {/* Micro Features */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#2E4237] font-bold">
                  <div className="flex items-center gap-1.5 bg-[#F4F9F6] px-2.5 py-1.5 rounded-xl border border-[#D5EADF]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">അംഗീകൃത കടകൾ</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F4F9F6] px-2.5 py-1.5 rounded-xl border border-[#D5EADF]">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">ഹോം ഡെലിവറി</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3.5 px-4 bg-[#064E3B] hover:bg-[#043327] text-white text-xs xs:text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span>ഷോപ്പിംഗ് തുടങ്ങൂ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MOBILE CARD 2: For Merchants (Vast, Premium Image Cover) */}
            <div
              onClick={onOpenMerchantPortal}
              className="rounded-3xl bg-white border-2 border-[#E2DDD0] hover:border-[#D97706] shadow-md active:scale-[0.99] transition-all cursor-pointer overflow-hidden font-['Baloo_Chettan_2',sans-serif]"
            >
              <div className="relative w-full h-48 xs:h-52 sm:h-56 bg-slate-100 overflow-hidden">
                <img
                  src="/merchant-portal-cover.jpg"
                  alt="Merchants"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-extrabold shadow-xs flex items-center gap-1.5">
                  <span>🏪</span>
                  <span>കടയുടമകൾക്കുമായി</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3.5 border border-white/80 shadow-xs inline-block max-w-full">
                    <div className="text-base xs:text-lg font-black text-[#14231A] leading-tight">
                      വ്യാപാരി പോർട്ടൽ
                    </div>
                    <div className="text-[11px] xs:text-xs text-[#78350F] font-semibold font-['Anek_Malayalam',sans-serif]">
                      ഡിജിറ്റൽ POS & സ്മാർട്ട് സ്റ്റോർ മാനേജ്‌മെന്റ്
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 xs:p-5 space-y-3.5">
                <p className="text-xs xs:text-sm text-[#5C7267] font-['Anek_Malayalam',sans-serif] leading-relaxed m-0">
                  നിങ്ങളുടെ കട പീഡിയകാർട്ടിൽ ലിസ്റ്റ് ചെയ്ത് കൂടുതൽ കസ്റ്റമേഴ്സിനെ നേടൂ.
                </p>

                {/* Micro Features */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#2E4237] font-bold">
                  <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-2.5 py-1.5 rounded-xl border border-[#FDE68A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">സ്മാർട്ട് ബില്ലിംഗ് & POS</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-2.5 py-1.5 rounded-xl border border-[#FDE68A]">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">കൂടുതൽ ഓർഡറുകൾ</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3.5 px-4 bg-[#D97706] hover:bg-[#B45309] text-white text-xs xs:text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span>കട രജിസ്റ്റർ ചെയ്യാം</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Quick Action Strip (Brochures) */}
            <div className="grid grid-cols-2 gap-3 pt-1 font-['Baloo_Chettan_2',sans-serif]">
              <a
                href="/PeediaCart_Merchant_Brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-white border border-[#E2DDD0] text-center text-xs font-bold text-[#064E3B] flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>വ്യാപാരി ബ്രോഷർ</span>
              </a>

              <a
                href="/PeediaCart_Consumer_Brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-white border border-[#E2DDD0] text-center text-xs font-bold text-[#064E3B] flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>ഷോപ്പർ ബ്രോഷർ</span>
              </a>
            </div>

            {/* Mobile Trust Strip */}
            <div className="py-3 text-center font-['Baloo_Chettan_2',sans-serif] text-xs text-[#526B5F] font-bold flex items-center justify-center gap-3 border-t border-[#E8E4D8]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>50+ പ്രാദേശിക കടകൾ</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>വേഗത്തിലുള്ള ഡെലിവറി</span>
              </span>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <footer className="w-full bg-white border-t border-[#E8E4D8] py-2.5 px-4 text-center text-xs text-gray-500 font-['Baloo_Chettan_2',sans-serif] shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <span className="font-extrabold text-[#14231A]">PeediaCart</span>
            <span className="text-[#064E3B] font-bold">കേരള പ്രാദേശിക വ്യാപാര ശൃംഖല</span>
          </div>
        </footer>
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
