import React, { useState } from 'react';
import { User, Location } from '../types';
import { Search, Bell, Heart, ChevronDown, ChevronRight, User as UserIcon, LogOut, Store, X, MapPin, ShoppingBag, Zap, Briefcase, Menu } from 'lucide-react';

interface DesktopHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  authUser: User | null;
  currentLocation?: Location | null;
  onOpenLocationModal?: () => void;
  onOpenAuthModal: (mode?: 'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway' | any) => void;
  onOpenFavorites: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
  onOpenFlashDeals?: () => void;
  onOpenPartnerPortal?: () => void;
  onSelectRole: (role: 'shopper' | 'merchant' | 'admin') => void;
  onLogout: () => void;
  basketCount?: number;
  basketSubtotal?: number;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  onToggleLeftSidebar?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  authUser,
  currentLocation,
  onOpenLocationModal,
  onOpenAuthModal,
  onOpenFavorites,
  onOpenOrders,
  onOpenProfile,
  onOpenFlashDeals,
  onOpenPartnerPortal,
  onSelectRole,
  onLogout,
  basketCount = 0,
  basketSubtotal = 0,
  isRightSidebarOpen = false,
  onToggleRightSidebar,
  onToggleLeftSidebar,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const avatarLetter = authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'R';
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#F0F4F2] shadow-2xs font-sans">
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full max-w-[1720px] mx-auto">

        {/* Left: Sidebar Toggle Button (Three Lines Icon) & Location Selector */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleLeftSidebar && (
            <button
              type="button"
              onClick={onToggleLeftSidebar}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F5F8F6] hover:bg-[#E8F8F0] border border-[#E3ECE7] hover:border-[#10A978]/40 text-[#0D6344] transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              title="Toggle Sidebar Navigation (മെനു)"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-[#0D6344] stroke-[2.2]" />
            </button>
          )}

          {onOpenLocationModal && (
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F8F6] hover:bg-[#E8F8F0] border border-[#E3ECE7] hover:border-[#10A978]/40 rounded-full text-xs font-bold text-[#17221D] transition-all cursor-pointer shrink-0 shadow-2xs font-malayalam"
              title="സ്ഥലം മാറ്റുക (Change Location Hub)"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0B8F68]" />
              <span className="truncate max-w-[80px] sm:max-w-[120px] xl:max-w-[160px]">{locationName}</span>
              <ChevronDown className="w-3 h-3 text-[#66756E]" />
            </button>
          )}
        </div>

        {/* Middle: Integrated Search Bar (Matching Mockup) */}
        <div className="flex-1 max-w-xl xl:max-w-2xl">
          <div className="relative flex items-center bg-[#F4F7F5] border border-[#E0ECE5] rounded-full py-2.5 px-4 shadow-2xs focus-within:bg-white focus-within:border-[#0D6344] focus-within:ring-2 focus-within:ring-[#0D6344]/15 transition-all">
            <Search className="w-4 h-4 text-[#7A8E84] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, grocery..."
              className="w-full bg-transparent text-xs font-semibold text-[#17221D] placeholder-[#7A8E84] outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-[#7A8E84] hover:text-[#17221D] rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Cart Pill, Bell, Heart, Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Quick Agent Hub Navigation Pill */}
          {onOpenPartnerPortal && (
            <button
              type="button"
              onClick={onOpenPartnerPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-900 transition-all cursor-pointer font-sans shadow-2xs active:scale-95 text-xs font-black"
              title="Field Agent Hub (50% Cut)"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span>Agent</span>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">50%</span>
            </button>
          )}

          {/* Quick-Commerce Cart & Comparison Trigger */}
          {onToggleRightSidebar && (
            <button
              type="button"
              onClick={onToggleRightSidebar}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-sans shadow-2xs ${isRightSidebarOpen
                  ? 'bg-[#0D6344] text-white border-[#0D6344] shadow-xs'
                  : 'bg-[#E8F5EE] hover:bg-[#DCF0E4] border-[#C3EEDC] text-[#0D6344]'
                }`}
              title={isRightSidebarOpen ? 'കാർട്ട് പാനൽ മറയ്ക്കുക (Hide Cart)' : 'കാർട്ട് & താരതമ്യം കാണുക (View Cart & Compare)'}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${isRightSidebarOpen ? 'text-white' : 'text-[#0D6344]'}`} />
              <span className="text-xs font-black">
                {basketCount > 0 ? (
                  <span>
                    {basketCount} <span className="opacity-60 mx-0.5">•</span> ₹{basketSubtotal.toFixed ? basketSubtotal.toFixed(2) : basketSubtotal}
                  </span>
                ) : (
                  <span>Cart</span>
                )}
              </span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 text-[#2D3E35] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D3E35]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white" />
          </button>

          {/* Favorite Heart */}
          <button
            type="button"
            onClick={onOpenFavorites}
            className="p-2 text-[#2D3E35] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
            aria-label="Favorites"
          >
            <Heart className="w-4 h-4 text-[#2D3E35]" />
          </button>

          {/* User Profile Avatar Dropdown (Matching Mockup) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1 p-0.5 hover:bg-[#F5F8F6] rounded-full transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#0D6344] text-white flex items-center justify-center text-xs font-black font-sans shadow-xs ring-2 ring-[#0D6344]/20">
                {avatarLetter}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#66756E]" />
            </button>

            {/* Dropdown Menu & Backdrop */}
            {isProfileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  {authUser ? (
                    <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 mb-1.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#063B2A] to-[#0D4A36] text-white flex items-center justify-center text-sm font-black font-sans shrink-0 shadow-xs ring-2 ring-emerald-500/20">
                        {avatarLetter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate leading-snug">{authUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate font-sans">{authUser.email}</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md font-sans ${authUser.role === 'merchant'
                              ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-300/60'
                              : 'bg-white text-slate-600 border border-slate-200'
                            }`}>
                            {authUser.role === 'merchant' ? '🏪 Partner Merchant' : '👤 Shopper'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 mb-1.5 text-center">
                      <p className="text-xs font-bold text-slate-700 font-malayalam mb-2">PeediaCart-ലേക്ക് സ്വാഗതം</p>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onOpenAuthModal('consumer-login');
                        }}
                        className="w-full py-2 bg-[#063B2A] hover:bg-[#084D37] text-white text-xs font-bold rounded-xl text-center cursor-pointer font-malayalam transition-colors shadow-2xs"
                      >
                        ലോഗിൻ / രജിസ്റ്റർ
                      </button>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0B8F68] flex items-center justify-center shrink-0 group-hover:bg-[#063B2A] group-hover:text-white transition-all">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-malayalam">പ്രൊഫൈൽ</span>
                        <span className="text-[11px] font-sans text-slate-400 font-normal group-hover:text-slate-600">(Profile)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0B8F68] flex items-center justify-center shrink-0 group-hover:bg-[#063B2A] group-hover:text-white transition-all">
                          <Heart className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-malayalam">ഓർഡറുകൾ</span>
                        <span className="text-[11px] font-sans text-slate-400 font-normal group-hover:text-slate-600">(Orders)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        if (authUser?.role === 'merchant') {
                          onSelectRole('merchant');
                        } else {
                          onOpenAuthModal('merchant-login');
                        }
                      }}
                      className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-[#063B2A] hover:bg-emerald-50/80 transition-all text-left cursor-pointer border border-emerald-100/60 bg-emerald-50/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#063B2A] flex items-center justify-center shrink-0 group-hover:bg-[#063B2A] group-hover:text-white transition-all">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-malayalam whitespace-nowrap">വ്യാപാരി പാനൽ</span>
                        <span className="text-[10px] font-sans text-emerald-800 font-semibold px-1.5 py-0.5 bg-emerald-100/80 rounded-md">Partner</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600/70 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {onOpenPartnerPortal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onOpenPartnerPortal();
                        }}
                        className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50/90 transition-all text-left cursor-pointer border border-amber-200/80 bg-amber-50/50 mt-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-malayalam whitespace-nowrap">ഏജന്റ് ഹബ്ബ്</span>
                            <span className="text-[10px] font-sans text-amber-800 font-bold px-1.5 py-0.2 bg-amber-200/80 rounded">50% Cut</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    )}

                    {authUser && (
                      <>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-malayalam">ലോഗ് ഔട്ട്</span>
                            <span className="text-[11px] font-sans opacity-80 font-normal">(Logout)</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
