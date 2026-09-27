import React from 'react';
import { Location, User } from '../types';
import { Home, Store, MapPin, ShoppingBag, User as UserIcon, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface DesktopLeftSidebarProps {
  currentTab: string;
  onSelectTab: (tab: 'home' | 'deals' | 'shops' | 'map' | 'orders' | 'profile' | any) => void;
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  authUser: User | null;
  onOpenAuthModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemConfig {
  id: string;
  malayalam: string;
  english: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    malayalam: 'ഹോം',
    english: 'Home',
    icon: Home,
  },
  {
    id: 'deals',
    malayalam: 'ഫ്ലാഷ് ഡീലുകൾ',
    english: 'Flash Deals',
    icon: Zap,
    badge: 'LIVE',
  },
  {
    id: 'shops',
    malayalam: 'സമീപത്തെ കടകൾ',
    english: 'Nearby Shops',
    icon: Store,
  },
  {
    id: 'map',
    malayalam: 'മാപ്പ് എക്സ്പ്ലോറർ',
    english: 'Live Map',
    icon: MapPin,
  },
  {
    id: 'orders',
    malayalam: 'ഓർഡറുകൾ',
    english: 'My Orders',
    icon: ShoppingBag,
  },
  {
    id: 'profile',
    malayalam: 'പ്രൊഫൈൽ',
    english: 'My Account',
    icon: UserIcon,
  },
];

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = React.memo(({
  currentTab,
  onSelectTab,
  currentLocation,
  onOpenLocationModal,
  isCollapsed = true,
  onToggleCollapse,
}) => {
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20 p-3' : 'w-64 xl:w-68 p-4'
      } fixed top-0 left-0 bottom-0 h-screen z-40 bg-white text-[#17221D] shrink-0 hidden lg:flex flex-col justify-between border-r border-[#E5ECE8] shadow-xs select-none transition-all duration-300 overflow-y-auto no-scrollbar`}
    >
      {/* Top Header & Brand Area */}
      <div className="relative z-10">
        <div
          className={`flex items-center pb-3.5 mb-3 border-b border-[#EEF2F0] ${
            isCollapsed ? 'justify-center' : 'justify-between px-0.5'
          }`}
        >
          <EnteBazaarLogo
            size={isCollapsed ? 'sm' : 'xs'}
            variant={isCollapsed ? 'icon' : 'horizontal'}
            theme="light"
            withTagline={false}
            onClick={() => onSelectTab('home')}
          />
          {!isCollapsed && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0D6344]/10 text-[#0D6344] border border-[#0D6344]/20 font-sans tracking-wide shrink-0 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D6344] animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 font-sans">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={`${item.malayalam} (${item.english})`}
                className={`w-full group flex items-center transition-all duration-150 cursor-pointer text-left rounded-2xl relative overflow-hidden ${
                  isCollapsed
                    ? 'justify-center p-3'
                    : 'gap-3.5 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#E8F5EE] text-[#0D6344] font-bold shadow-2xs'
                    : 'text-[#52635B] hover:text-[#11261D] hover:bg-[#F4F8F6]'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'text-[#0D6344] font-black scale-105'
                      : 'text-[#6B7D74] group-hover:text-[#11261D] group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                </div>

                {isCollapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}

                {/* Text Content */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div className="min-w-0 flex flex-col justify-center">
                      <span
                        className={`text-[13px] leading-snug tracking-tight font-malayalam truncate ${
                          isActive ? 'font-black text-[#0D6344]' : 'font-bold text-[#2A3B33] group-hover:text-[#11261D]'
                        }`}
                      >
                        {item.malayalam}
                      </span>
                      <span
                        className={`text-[10px] leading-tight font-semibold font-sans truncate ${
                          isActive ? 'text-[#0D6344]/80' : 'text-[#7B8C83] group-hover:text-[#4A5D54]'
                        }`}
                      >
                        {item.english}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-sans tracking-wide shrink-0 ml-1 shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Location Hub & Collapse Toggle */}
      <div className="space-y-2.5 pt-3 border-t border-[#EEF2F0] relative z-10">
        {/* Location Selector */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="w-full flex items-center justify-center p-3 bg-[#F8FAF9] hover:bg-[#E8F5EE] border border-[#E3ECE7] hover:border-[#0D6344]/30 rounded-2xl text-[#0D6344] cursor-pointer transition-all shadow-2xs active:scale-95"
            title={`ഡെലിവറി ഹബ്ബ്: ${locationName} (മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക)`}
          >
            <MapPin className="w-4 h-4 text-[#0D6344]" />
          </button>
        ) : (
          <div
            onClick={onOpenLocationModal}
            className="flex items-center justify-between px-3 py-2 bg-[#F8FAF9] hover:bg-[#E8F5EE] border border-[#E3ECE7] hover:border-[#0D6344]/30 rounded-2xl transition-all cursor-pointer shadow-2xs group"
            title="ഡെലിവറി സ്ഥലം മാറ്റുക"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#0D6344] shrink-0" />
              <span className="text-xs font-black text-[#17221D] truncate font-sans">
                {locationName}
              </span>
            </div>

            <span className="text-[11px] font-bold text-[#0D6344] group-hover:underline font-malayalam shrink-0">
              Change
            </span>
          </div>
        )}

        {/* Clean Mint Info Card */}
        {!isCollapsed && (
          <div className="rounded-2xl border border-[#D5EADB] bg-gradient-to-br from-[#EBF5EE] to-[#E3EFE7] p-3 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-[#0D6344] font-malayalam block">
              🌿 പ്രാദേശിക കടകൾ · മികച്ച വില
            </span>
            <span className="text-[10px] text-[#556B60] font-sans mt-0.5 block">
              Kerala grocery price comparison
            </span>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5 bg-white hover:bg-[#F8FAF9] shadow-2xs group' : 'justify-between px-3.5 py-2 bg-white hover:bg-[#F8FAF9]'
            } rounded-xl text-[#556B60] hover:text-[#17221D] transition-all cursor-pointer font-malayalam border border-[#E3ECE7]`}
            title={isCollapsed ? 'സൈഡ്‌ബാർ വലുതാക്കുക (Expand Sidebar)' : 'സൈഡ്‌ബാർ ചുരുക്കുക (Collapse Sidebar)'}
          >
            {!isCollapsed && <span className="text-[11px] font-bold">ചുരുക്കുക (Collapse)</span>}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#0D6344] group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#0D6344]" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
});
