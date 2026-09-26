import React from 'react';
import { Location, User } from '../types';
import { Home, Store, MapPin, ShoppingBag, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
      } fixed top-0 left-0 bottom-0 h-screen z-40 bg-[#F3EFE8] text-[#2A241C] shrink-0 hidden lg:flex flex-col justify-between border-r border-[#E0D7CB] shadow-xs select-none transition-all duration-300 overflow-y-auto no-scrollbar`}
    >
      {/* Top Header & Brand Area */}
      <div className="relative z-10">
        <div
          className={`flex items-center pb-3.5 mb-3 border-b border-[#E0D7CB] ${
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
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#063B2A]/10 text-[#063B2A] border border-[#063B2A]/20 font-sans tracking-wide shrink-0 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#063B2A] animate-pulse" />
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
                    ? 'bg-[#DFCFB6] text-[#7C3A20] font-bold shadow-2xs'
                    : 'text-[#4A433A] hover:text-[#2A241C] hover:bg-white/40'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'text-[#7C3A20] font-black scale-105'
                      : 'text-[#6E6559] group-hover:text-[#2A241C] group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                </div>

                {/* Text Content */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span
                      className={`text-[13px] leading-snug tracking-tight font-malayalam truncate ${
                        isActive ? 'font-black text-[#7C3A20]' : 'font-bold text-[#3B342B] group-hover:text-[#17221D]'
                      }`}
                    >
                      {item.malayalam}
                    </span>
                    <span
                      className={`text-[10px] leading-tight font-semibold font-sans truncate ${
                        isActive ? 'text-[#8C4E28]' : 'text-[#7A7061] group-hover:text-[#4A433A]'
                      }`}
                    >
                      {item.english}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Location Hub, Kerala Illustration & Collapse Toggle */}
      <div className="space-y-2.5 pt-3 border-t border-[#DDD2C3] relative z-10">
        {/* Location Selector */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="w-full flex items-center justify-center p-3 bg-white hover:bg-[#FAF7F2] border border-[#E0D7CB] rounded-2xl text-[#7C3A20] cursor-pointer transition-all shadow-2xs active:scale-95"
            title={`ഡെലിവറി ഹബ്ബ്: ${locationName} (മാറ്റാൻ ക്ലിക്ക് ചെയ്യുക)`}
          >
            <MapPin className="w-4 h-4 text-[#7C3A20]" />
          </button>
        ) : (
          <div
            onClick={onOpenLocationModal}
            className="flex items-center justify-between px-3 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E0D7CB] rounded-2xl transition-all cursor-pointer shadow-2xs group"
            title="ഡെലിവറി സ്ഥലം മാറ്റുക"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#7C3A20] shrink-0" />
              <span className="text-xs font-black text-[#2A241C] truncate font-sans">
                {locationName}
              </span>
            </div>

            <span className="text-[11px] font-bold text-[#7C3A20] group-hover:underline font-malayalam shrink-0">
              Change
            </span>
          </div>
        )}

        {/* Kerala Scenery / Village Illustration Card */}
        {!isCollapsed && (
          <div className="rounded-2xl overflow-hidden border border-[#E0D7CB] shadow-2xs relative bg-gradient-to-b from-[#DFCFB6] to-[#C9BAA0] h-24 flex items-end p-2.5">
            <div className="absolute inset-0 opacity-85 bg-cover bg-center" style={{
              backgroundImage: `radial-gradient(circle at 75% 25%, #FFF1D6 12%, transparent 13%), linear-gradient(to bottom, #E8DFC9 0%, #D8C7AA 55%, #A8B896 56%, #78996E 100%)`
            }}>
              <svg viewBox="0 0 200 80" className="w-full h-full object-cover">
                <path d="M0 60 Q 50 40 100 55 T 200 50 L 200 80 L 0 80 Z" fill="#6A8B5F" opacity="0.6" />
                <path d="M0 68 Q 60 52 120 62 T 200 58 L 200 80 L 0 80 Z" fill="#4D6E42" opacity="0.8" />
                <polygon points="120,48 145,35 170,48" fill="#A84C2C" />
                <rect x="126" y="48" width="38" height="24" fill="#F4E8D3" />
                <rect x="140" y="55" width="10" height="17" fill="#7C3A20" />
                <rect x="130" y="54" width="6" height="7" fill="#8C4E28" />
                <line x1="30" y1="75" x2="35" y2="40" stroke="#5A4736" strokeWidth="2.5" />
                <path d="M35 40 Q 20 30 10 38" stroke="#3F6335" strokeWidth="2" fill="none" />
                <path d="M35 40 Q 30 22 25 18" stroke="#3F6335" strokeWidth="2" fill="none" />
                <path d="M35 40 Q 45 22 55 24" stroke="#3F6335" strokeWidth="2" fill="none" />
                <path d="M35 40 Q 50 32 60 40" stroke="#3F6335" strokeWidth="2" fill="none" />
                <line x1="60" y1="75" x2="62" y2="48" stroke="#5A4736" strokeWidth="2" />
                <path d="M62 48 Q 50 40 42 46" stroke="#3F6335" strokeWidth="1.8" fill="none" />
                <path d="M62 48 Q 58 35 54 30" stroke="#3F6335" strokeWidth="1.8" fill="none" />
                <path d="M62 48 Q 70 35 78 38" stroke="#3F6335" strokeWidth="1.8" fill="none" />
              </svg>
            </div>

            <div className="relative z-10 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-xl w-full border border-white/60">
              <span className="text-[10px] font-bold text-[#4A433A] font-malayalam truncate block text-center">
                🌾 ഗ്രാമീണ ചന്ത · നേരിട്ട് നിങ്ങളുടെ വീട്ടിലേക്ക്
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
              isCollapsed ? 'justify-center p-2.5 bg-white hover:bg-[#FAF7F2] shadow-2xs hover:shadow-xs group' : 'justify-between px-3.5 py-2 bg-white hover:bg-[#FAF7F2]'
            } rounded-xl text-[#4A433A] hover:text-[#2A241C] transition-all cursor-pointer font-malayalam border border-[#E0D7CB]`}
            title={isCollapsed ? 'സൈഡ്‌ബാർ വലുതാക്കുക (Expand Sidebar)' : 'സൈഡ്‌ബാർ ചുരുക്കുക (Collapse Sidebar)'}
          >
            {!isCollapsed && <span className="text-[11px] font-bold">ചുരുക്കുക (Collapse)</span>}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#7C3A20] group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#7C3A20]" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
});
