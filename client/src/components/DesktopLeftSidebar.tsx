import React from 'react';
import { Location, User } from '../types';
import { Home, Store, MapPin, ShoppingBag, User as UserIcon, ChevronLeft, ChevronRight, Sparkles, Navigation } from 'lucide-react';
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

interface NavItemConfig {
  id: string;
  malayalam: string;
  english: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    malayalam: 'ഹോം',
    english: 'Home',
    icon: Home,
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

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLocation,
  onOpenLocationModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20 p-3' : 'w-60 xl:w-64 2xl:w-72 p-4'
      } bg-[#0A130F] text-white shrink-0 hidden lg:flex flex-col justify-between border-r border-[#1B2922] shadow-2xl fixed top-0 bottom-0 left-0 h-screen z-30 select-none overflow-y-auto transition-all duration-300`}
    >
      {/* Top Header & Brand Area */}
      <div>
        <div
          className={`flex items-center pb-4 mb-3 border-b border-[#17251E] ${
            isCollapsed ? 'justify-center' : 'justify-between px-1'
          }`}
        >
          <EnteBazaarLogo
            size={isCollapsed ? 'sm' : 'md'}
            variant={isCollapsed ? 'icon' : 'horizontal'}
            theme="dark"
            withTagline={false}
            onClick={() => onSelectTab('home')}
          />
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
                className={`w-full flex items-center transition-all duration-200 cursor-pointer text-left rounded-2xl ${
                  isCollapsed
                    ? 'justify-center p-3'
                    : 'gap-3.5 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0B8F68] to-[#087353] text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/40'
                    : 'text-[#9AA8A1] hover:text-white hover:bg-[#14201A] border border-transparent hover:border-[#1E3128]/60'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'bg-[#121E18] text-[#71867D] group-hover:text-emerald-400 group-hover:bg-[#1A2A22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                </div>

                {/* Text Content */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span
                      className={`text-[13px] leading-snug tracking-tight font-malayalam truncate ${
                        isActive ? 'font-black text-white' : 'font-bold text-[#D3DFD9]'
                      }`}
                    >
                      {item.malayalam}
                    </span>
                    <span
                      className={`text-[10px] leading-tight font-medium font-sans truncate ${
                        isActive ? 'text-emerald-100/90' : 'text-[#6E8278]'
                      }`}
                    >
                      {item.english}
                    </span>
                  </div>
                )}

                {/* Active Dot Indicator */}
                {!isCollapsed && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0 mr-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Location Hub Card, Collapse Toggle & Brand Promise */}
      <div className="space-y-2.5 pt-3 border-t border-[#17251E]">
        {/* Location Selector Card */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="w-full flex items-center justify-center p-3 bg-[#121E18] hover:bg-[#182821] border border-[#1E3027] hover:border-emerald-500/40 rounded-2xl text-white cursor-pointer transition-all shadow-xs"
            title={`ഡെലിവറി ഹബ്ബ്: ${locationName} (മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക)`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
          </button>
        ) : (
          <div
            onClick={onOpenLocationModal}
            className="p-3 bg-[#121E18] hover:bg-[#172620] border border-[#1E3027] hover:border-emerald-500/40 rounded-2xl transition-all cursor-pointer shadow-xs group"
            title="ഡെലിവറി സ്ഥലം മാറ്റുക"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] uppercase font-bold text-[#71867D] tracking-wider block">
                    ഡെലിവറി ഹബ്ബ്
                  </span>
                  <span className="text-xs font-black text-white truncate block font-sans">
                    {locationName}
                  </span>
                </div>
              </div>

              <span className="px-2 py-1 bg-[#1A2C23] group-hover:bg-[#0B8F68] text-[#9AA8A1] group-hover:text-white border border-[#273F32] group-hover:border-emerald-500/50 rounded-lg text-[10px] font-bold font-malayalam transition-all shrink-0">
                മാറ്റുക
              </span>
            </div>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
            } rounded-xl bg-[#0E1813] hover:bg-[#15231C] text-[#71867D] hover:text-white transition-all cursor-pointer font-malayalam border border-[#1B2C23]`}
            title={isCollapsed ? 'സൈഡ്‌ബാർ വികസിപ്പിക്കുക' : 'സൈഡ്‌ബാർ ചുരുക്കുക'}
          >
            {!isCollapsed && <span className="text-[11px] font-semibold">ചുരുക്കുക (Collapse)</span>}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}

        {/* Clean Brand Guarantee Tagline */}
        {!isCollapsed && (
          <div className="px-2.5 py-2 bg-[#08100C] rounded-xl text-center border border-[#15231B]">
            <div className="text-[10px] font-bold text-[#7A9084] font-malayalam leading-tight flex items-center justify-center gap-1.5">
              <span>🌱</span>
              <span>നാടിന്റെ ഉൽപ്പന്നങ്ങൾ നിങ്ങളുടെ കൈകളിൽ</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
