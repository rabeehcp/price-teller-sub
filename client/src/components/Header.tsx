import React, { useState, useRef, useEffect } from 'react';
import { Location, User, ConsumerData } from '../types';
import { findNearestLocation } from '../services/locationService';
import { LocationMapPickerModal } from './LocationMapPickerModal';
import {
  MapPin,
  Store,
  Navigation,
  ChevronDown,
  ShoppingBag,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  MessageCircle,
  CalendarCheck,
  Globe,
  Flame,
  Search,
  X,
  Check,
} from 'lucide-react';

interface HeaderProps {
  locations: Location[];
  currentLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  customerCoords?: { lat: number; lng: number; name?: string } | null;
  onCustomerCoordsChanged?: (coords: { lat: number; lng: number; name?: string } | null) => void;
  basketCount: number;
  onOpenBasketMobile: () => void;
  currentRole: 'shopper' | 'merchant' | 'admin';
  onSelectRole: (role: 'shopper' | 'merchant' | 'admin') => void;
  onOpenDeals: () => void;
  onOpenShopCatalogue?: (shopName?: string) => void;
  authUser: User | null;
  consumerData?: ConsumerData | null;
  onOpenAuthModal: (mode?: 'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway') => void;
  onOpenConsumerDashboard?: () => void;
  onOpenMerchantDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenChat?: () => void;
  onOpenPreBookings?: () => void;
  pendingPreBookingsCount?: number;
  onLogout: () => void;
  onResetTrip?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  locations,
  currentLocation,
  onSelectLocation,
  customerCoords,
  onCustomerCoordsChanged,
  basketCount,
  onOpenBasketMobile,
  currentRole,
  onSelectRole,
  onOpenDeals,
  onOpenShopCatalogue,
  authUser,
  consumerData,
  onOpenAuthModal,
  onOpenConsumerDashboard,
  onOpenMerchantDashboard,
  onOpenAdminDashboard,
  onOpenChat,
  onOpenPreBookings,
  pendingPreBookingsCount = 0,
  onLogout,
  onResetTrip,
  onGoHome,
}) => {
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocationMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [gpsFeedback, setGpsFeedback] = useState<{ text: string; isWarning?: boolean } | null>(null);

  const handleGpsDetect = () => {
    setIsDetectingGps(true);
    setGpsFeedback(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onCustomerCoordsChanged?.({ lat, lng, name: 'Live GPS Location' });

          const result = findNearestLocation(lat, lng, locations);
          if (result) {
            onSelectLocation(result.nearestLocation);
            if (result.isWithinHubArea) {
              setGpsFeedback({
                text: `${result.nearestLocation.name} Hub (${result.distanceKm} km)`,
                isWarning: false,
              });
            } else {
              setGpsFeedback({
                text: `സമീപത്തെ ഹബ്ബ്: ${result.nearestLocation.name} (${result.distanceKm} km)`,
                isWarning: true,
              });
            }
          }
          setIsDetectingGps(false);
          setTimeout(() => {
            if (!result || result.isWithinHubArea) {
              setIsLocationMenuOpen(false);
            }
          }, 2000);
        },
        (err) => {
          setIsDetectingGps(false);
          setGpsFeedback({
            text: err.code === 1 ? 'Location permission denied' : 'GPS signal unavailable',
            isWarning: true,
          });
          setTimeout(() => setGpsFeedback(null), 3500);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsDetectingGps(false);
      setGpsFeedback({ text: 'GPS not supported on this device', isWarning: true });
      setTimeout(() => setGpsFeedback(null), 3500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border transition-all shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Role Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              else onSelectRole('shopper');
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#063B2A] text-[#10A978] flex items-center justify-center text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform shrink-0">
              🛒
            </div>
            <div className="text-lg sm:text-xl font-black tracking-tight text-slate-dark">
              Price<span className="text-[#0B8F68]">Teller</span>
            </div>
          </button>

          {/* Role Status Tag */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold">
            {currentRole === 'shopper' && (
              <span className="bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC] px-2.5 py-0.5 rounded-full font-malayalam text-[11px]">
                ഷോപ്പർ പോർട്ടൽ
              </span>
            )}
            {currentRole === 'merchant' && (
              <span className="bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Store className="w-3 h-3 text-[#0B8F68]" />
                <span>{authUser?.shopName || 'Merchant'}</span>
              </span>
            )}
            {currentRole === 'admin' && (
              <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                <span>Admin</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Location Hub Selector with GPS */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#DDF5EA]/50 border border-surface-border rounded-full text-xs font-bold text-slate-dark transition-all cursor-pointer max-w-[130px] sm:max-w-[200px] shadow-2xs"
            title="പ്രദേശം തിരഞ്ഞെടുക്കുക (Location Hub)"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="truncate">{currentLocation ? currentLocation.name : 'തിരൂർ'}</span>
            <ChevronDown className="w-3 h-3 text-slate-muted shrink-0" />
          </button>

          {isLocationMenuOpen && (
            <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-72 bg-white rounded-2xl shadow-xl border border-surface-border p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-black text-slate-muted uppercase tracking-wider font-malayalam">
                പ്രദേശം തിരഞ്ഞെടുക്കുക (Shopping Hub)
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <button
                  onClick={handleGpsDetect}
                  disabled={isDetectingGps}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#063B2A] bg-[#DDF5EA] hover:bg-[#C3EEDC] rounded-xl transition-colors cursor-pointer font-malayalam border border-[#C3EEDC]"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'GPS സ്കാനിംഗ്...' : 'GPS ഉപയോഗിക്കുക'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsLocationMenuOpen(false);
                    setIsMapPickerOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-bold text-slate-dark bg-white hover:bg-[#DDF5EA]/50 border border-surface-border rounded-xl transition-colors cursor-pointer"
                  title="മാപ്പിൽ സ്ഥലം തിരഞ്ഞെടുക്കുക"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-body" />
                  <span>Map</span>
                </button>
              </div>

              {gpsFeedback && (
                <div
                  className={`px-3 py-1.5 mb-2 text-[11px] font-bold rounded-xl border animate-in fade-in ${
                    gpsFeedback.isWarning
                      ? 'text-amber-900 bg-amber-50 border-amber-300'
                      : 'text-[#063B2A] bg-[#DDF5EA] border-[#C3EEDC]'
                  }`}
                >
                  {gpsFeedback.text}
                </div>
              )}

              {/* Location Search Input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="സ്ഥലം തിരയുക / Search town..."
                  className="w-full bg-[#F5F8F6] border border-surface-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-dark placeholder-slate-400 outline-none focus:border-[#0B8F68] focus:bg-white transition-all font-malayalam"
                  autoFocus
                />
                {locationSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLocationSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
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
                    const isSelected = currentLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsLocationMenuOpen(false);
                          setLocationSearchQuery('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B8F68] text-white font-bold'
                            : 'hover:bg-[#DDF5EA]/40 text-slate-dark'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold truncate">{loc.name}</div>
                          {loc.subArea && (
                            <div className={`text-[10px] truncate ${isSelected ? 'text-[#DDF5EA]' : 'text-slate-muted'}`}>
                              {loc.subArea}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Shop Catalogue Button */}
          {currentRole === 'shopper' && onOpenShopCatalogue && (
            <button
              onClick={() => onOpenShopCatalogue()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#063B2A] bg-[#DDF5EA] border border-[#C3EEDC] hover:bg-[#C3EEDC] transition-colors cursor-pointer font-malayalam"
            >
              <Store className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span>കടകൾ</span>
            </button>
          )}

          {/* Flash Deals Trigger */}
          {currentRole === 'shopper' && (
            <button
              onClick={onOpenDeals}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer font-malayalam"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>ഡീലുകൾ</span>
            </button>
          )}

          {/* Customer Chat Trigger */}
          {currentRole === 'shopper' && onOpenChat && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-dark bg-white border border-surface-border hover:bg-[#DDF5EA]/40 transition-colors cursor-pointer"
              title="വ്യാപാരികളുമായി ചാറ്റ് ചെയ്യുക"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span className="hidden sm:inline font-malayalam">ചാറ്റ്</span>
            </button>
          )}

          {/* Pre-Bookings Trigger */}
          {currentRole === 'shopper' && onOpenPreBookings && authUser && (
            <button
              onClick={onOpenPreBookings}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-dark bg-white border border-surface-border hover:bg-[#DDF5EA]/40 transition-colors cursor-pointer relative"
              title="എന്റെ ഓർഡറുകൾ / പ്രീ-ബുക്കിംഗുകൾ"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span className="font-malayalam">ഓർഡറുകൾ</span>
              {pendingPreBookingsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          )}

          {/* User Account / Sign In */}
          {authUser ? (
            <div className="flex items-center gap-1.5">
              {authUser.role === 'consumer' ? (
                <button
                  onClick={onOpenConsumerDashboard}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#DDF5EA] hover:bg-[#C3EEDC] border border-[#C3EEDC] rounded-xl transition-all cursor-pointer"
                  title="എന്റെ അക്കൗണ്ട് (Saved Lists & Favorites)"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#063B2A] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <span className="text-xs font-bold text-slate-dark truncate max-w-[70px] sm:max-w-[120px]">
                    {authUser.name}
                  </span>
                </button>
              ) : authUser.role === 'merchant' ? (
                <button
                  onClick={onOpenMerchantDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#063B2A] hover:bg-[#04281C] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-[#10A978]" />
                  <span className="truncate max-w-[100px]">{authUser.shopName || 'Dashboard'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal('consumer-login')}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer font-malayalam"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>ലോഗിൻ</span>
              </button>
            </div>
          )}

          {/* Mobile Floating Basket Button */}
          {currentRole === 'shopper' && (
            <button
              onClick={onOpenBasketMobile}
              className="lg:hidden relative p-2 bg-brand-600 text-white rounded-xl shadow-xs hover:bg-brand-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label="ബാസ്ക്കറ്റ് കാണുക"
            >
              <ShoppingBag className="w-4 h-4" />
              {basketCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-brand-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {basketCount}
                </span>
              )}
            </button>
          )}

        </div>
      </div>

      {/* Map Picker Modal */}
      <LocationMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={customerCoords?.lat || currentLocation?.lat || 10.9155}
        initialLng={customerCoords?.lng || currentLocation?.lng || 75.9238}
        title="മാപ്പിൽ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കൂ"
        subtitle="നിങ്ങളുടെ കൃത്യമായ സ്ഥലം മാപ്പിൽ പിൻ ചെയ്യുക. ഏറ്റവും അടുത്തുള്ള സൂപ്പർമാർക്കറ്റുകൾ ഇതിലൂടെ കണ്ടെത്താം."
        confirmButtonText="ഈ ലൊക്കേഷൻ സെറ്റ് ചെയ്യുക"
        onConfirm={(coords) => {
          onCustomerCoordsChanged?.({
            lat: coords.lat,
            lng: coords.lng,
            name: coords.address || 'Selected Map Location',
          });

          const result = findNearestLocation(coords.lat, coords.lng, locations);
          if (result) {
            onSelectLocation(result.nearestLocation);
            if (result.isWithinHubArea) {
              setGpsFeedback({
                text: `${result.nearestLocation.name} Hub (${result.distanceKm} km)`,
                isWarning: false,
              });
            } else {
              setGpsFeedback({
                text: `സമീപത്തെ ഹബ്ബ്: ${result.nearestLocation.name} (${result.distanceKm} km)`,
                isWarning: true,
              });
            }
          }
        }}
      />
    </header>
  );
};
