import React from 'react';
import { Location, User } from '../types';
import { Home, Store, MapPin, ShoppingBag, User as UserIcon, LogOut, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface DesktopLeftSidebarProps {
  currentTab: string;
  onSelectTab: (tab: 'home' | 'shops' | 'map' | 'orders' | 'profile' | any) => void;
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  authUser: User | null;
  onOpenAuthModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLocation,
  onOpenLocationModal,
  authUser,
  onOpenAuthModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16 p-2' : 'w-52 xl:w-56 2xl:w-64 p-3 xl:p-4'
      } bg-[#141816] text-white shrink-0 hidden lg:flex flex-col justify-between border-r border-[#242A27] shadow-xl fixed top-0 bottom-0 left-0 h-screen z-30 select-none overflow-y-auto transition-all duration-200`}
    >
      <div>
        {/* Official Brand Logo */}
        <div className={`px-1 py-2 mb-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <EnteBazaarLogo
            size={isCollapsed ? 'sm' : 'md'}
            variant={isCollapsed ? 'icon' : 'horizontal'}
            theme="dark"
            withTagline={!isCollapsed}
            onClick={() => onSelectTab('home')}
          />
        </div>

        {/* Navigation Menu matching Image 1 */}
        <nav className="space-y-1.5 font-malayalam">
          <button
            onClick={() => onSelectTab('home')}
            title="ഹോം (Home)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>ഹോം (Home)</span>}
          </button>

          <button
            onClick={() => onSelectTab('shops')}
            title="സമീപത്തെ കടകൾ (Shops)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'shops'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>സമീപത്തെ കടകൾ (Shops)</span>}
          </button>

          <button
            onClick={() => onSelectTab('map')}
            title="മാപ്പ് (Nearby Map)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'map'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>മാപ്പ് (Nearby Map)</span>}
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            title="ഓർഡറുകൾ (Orders)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'orders'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>ഓർഡറുകൾ (Orders)</span>}
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            title="പ്രൊഫൈൽ (Profile)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>പ്രൊഫൈൽ (Profile)</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Area: Location Selector Pill & Collapse Toggle */}
      <div className="space-y-2 pt-3 border-t border-[#242A27]">
        {/* Location Selector */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="w-full flex items-center justify-center p-2.5 bg-[#1D2220] hover:bg-[#242A27] border border-[#2F3733] rounded-xl text-white cursor-pointer transition-all"
            title={`ലോക്കേഷൻ: ${locationName} (ക്ലിക്ക് ചെയ്ത് മാറ്റുക)`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
          </button>
        ) : (
          <div
            onClick={onOpenLocationModal}
            className="p-2.5 xl:p-3 bg-[#1D2220] hover:bg-[#242A27] border border-[#2F3733] rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all group"
            title="സ്ഥലം മാറ്റുക (Change Location)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#10A978] text-[#141816] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#141816]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#8F9F97] uppercase tracking-wider font-bold">ലോക്കേഷൻ</div>
                <div className="text-xs font-black text-white truncate font-malayalam">
                  {locationName}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLocationModal();
              }}
              className="px-2 py-1 bg-[#10A978] hover:bg-[#0B8F68] text-[#141816] hover:text-white rounded-lg text-[10px] font-black font-malayalam transition-all cursor-pointer shrink-0"
            >
              മാറ്റുക
            </button>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
            } rounded-xl bg-[#181E1B] hover:bg-[#222A26] text-[#8F9F97] hover:text-white transition-all cursor-pointer font-malayalam border border-[#27322D]`}
            title={isCollapsed ? 'വികസിപ്പിക്കുക (Expand sidebar)' : 'സൈഡ്‌ബാർ ചുരുക്കുക (Collapse sidebar)'}
          >
            {!isCollapsed && <span className="text-[11px] font-semibold">ചുരുക്കുക</span>}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}

        {/* Brand Promise Footer matching Image 1 */}
        {!isCollapsed && (
          <div className="px-2 py-1.5 bg-black/25 rounded-xl text-center border border-[#242A27]/50">
            <div className="text-[10px] font-bold text-[#A2B1A9] font-malayalam leading-tight">
              നാടിന്റെ ഉൽപ്പന്നങ്ങൾ നിങ്ങളുടെ കൈകളിൽ
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
