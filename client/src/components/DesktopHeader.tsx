import React, { useState } from 'react';
import { User, Location } from '../types';
import { Search, Bell, Heart, ChevronDown, User as UserIcon, LogOut, Store, X, MapPin, ShoppingBag } from 'lucide-react';

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
  onSelectRole: (role: 'shopper' | 'merchant' | 'admin') => void;
  onLogout: () => void;
  basketCount?: number;
  basketSubtotal?: number;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
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
  onSelectRole,
  onLogout,
  basketCount = 0,
  basketSubtotal = 0,
  isRightSidebarOpen = false,
  onToggleRightSidebar,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const avatarLetter = authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'R';
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#F0F4F2] shadow-2xs font-sans">
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full max-w-[1720px] mx-auto">

        {/* Left: Location Selector Pill in Header */}
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

        {/* Middle: Integrated Search Bar (Matching Image 1) */}
        <div className="flex-1 max-w-xl xl:max-w-2xl">
          <div className="relative flex items-center bg-[#F5F8F6] border border-[#E3ECE7] rounded-full py-2 px-4 shadow-2xs focus-within:bg-white focus-within:border-[#0B8F68] transition-all">
            <Search className="w-4 h-4 text-[#8A9992] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="എന്താണ് തിരയുന്നത്?"
              className="w-full bg-transparent text-xs font-semibold text-[#17221D] placeholder-[#8A9992] outline-none font-malayalam"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-[#8A9992] hover:text-[#17221D] rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Cart Pill, Bell, Heart, Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Quick-Commerce Cart & Comparison Trigger */}
          {onToggleRightSidebar && (
            <button
              type="button"
              onClick={onToggleRightSidebar}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer font-malayalam shadow-2xs ${isRightSidebarOpen
                  ? 'bg-[#063B2A] text-white border-[#063B2A] shadow-xs'
                  : 'bg-[#F5F8F6] hover:bg-[#E8F8F0] border-[#E3ECE7] hover:border-[#10A978]/40 text-[#17221D]'
                }`}
              title={isRightSidebarOpen ? 'കാർട്ട് പാനൽ മറയ്ക്കുക (Hide Cart)' : 'കാർട്ട് & താരതമ്യം കാണുക (View Cart & Compare)'}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${isRightSidebarOpen ? 'text-[#34D399]' : 'text-[#0B8F68]'}`} />
              <span className="text-xs font-bold hidden md:inline">കാർട്ട്</span>
              {basketCount > 0 ? (
                <span className={`text-[11px] font-black font-sans px-2 py-0.2 rounded-full ${isRightSidebarOpen ? 'bg-[#10A978] text-white' : 'bg-[#063B2A] text-white'
                  }`}>
                  {basketCount} • ₹{basketSubtotal}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-sans font-bold">0</span>
              )}
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
            className="p-2.5 text-[#2D3E35] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
            aria-label="Favorites"
          >
            <Heart className="w-4 h-4 text-[#2D3E35]" />
          </button>

          {/* User Profile Avatar Dropdown (Matching Image 1) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 p-1 hover:bg-[#F5F8F6] rounded-full transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#063B2A] text-white flex items-center justify-center text-xs font-bold font-sans shadow-xs ring-2 ring-[#0B8F68]/20">
                {avatarLetter}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#66756E]" />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E3ECE7] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                {authUser ? (
                  <div className="px-4 py-2 border-b border-[#F0F4F2]">
                    <p className="text-xs font-bold text-[#17221D] truncate">{authUser.name}</p>
                    <p className="text-[10px] text-[#8A9992] truncate">{authUser.email}</p>
                  </div>
                ) : (
                  <div className="px-4 py-2 border-b border-[#F0F4F2]">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenAuthModal('consumer-login');
                      }}
                      className="w-full py-1.5 bg-[#063B2A] text-white text-xs font-bold rounded-xl text-center cursor-pointer font-malayalam"
                    >
                      ലോഗിൻ / രജിസ്റ്റർ
                    </button>
                  </div>
                )}

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#17221D] hover:bg-[#F5F8F6] transition-colors text-left cursor-pointer font-malayalam"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#0B8F68]" />
                    <span>പ്രൊഫൈൽ (Profile)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#17221D] hover:bg-[#F5F8F6] transition-colors text-left cursor-pointer font-malayalam"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#0B8F68]" />
                    <span>ഓർഡറുകൾ (Orders)</span>
                  </button>

                  <div className="border-t border-[#F0F4F2] my-1" />

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
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#063B2A] hover:bg-[#E8F5EE] transition-colors text-left cursor-pointer font-malayalam"
                  >
                    <Store className="w-3.5 h-3.5 text-[#0B8F68]" />
                    <span>വ്യാപാരി പാനൽ (Merchant)</span>
                  </button>

                  {authUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-malayalam border-t border-[#F0F4F2] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>ലോഗ് ഔട്ട് (Logout)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
