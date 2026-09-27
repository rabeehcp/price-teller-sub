import React from 'react';
import { Location, User } from '../types';
import { Home, Zap, Store, MapPin, FileText, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
  },
  {
    id: 'deals',
    label: 'Flash Deals',
    icon: Zap,
    badge: 'LIVE',
  },
  {
    id: 'shops',
    label: 'Nearby Shops',
    icon: Store,
  },
  {
    id: 'map',
    label: 'Live Map',
    icon: MapPin,
  },
  {
    id: 'orders',
    label: 'My Orders',
    icon: FileText,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserIcon,
  },
];

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = React.memo(({
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
        isCollapsed ? 'w-18 px-2 py-4' : 'w-56 xl:w-60 pr-3.5 pl-0 py-5'
      } fixed top-0 left-0 bottom-0 h-screen z-40 bg-[#FAF7F0] text-[#2B231B] shrink-0 hidden lg:flex flex-col justify-between border-r border-[#ECE6DA] shadow-2xs select-none transition-all duration-200 overflow-y-auto no-scrollbar font-sans`}
    >
      {/* Top Section: Logo & Menu Items */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-5'}`}>
          <EnteBazaarLogo
            size={isCollapsed ? 'sm' : 'sm'}
            variant={isCollapsed ? 'icon' : 'horizontal'}
            theme="light"
            withTagline={false}
            onClick={() => onSelectTab('home')}
          />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`w-full group flex items-center transition-all duration-150 cursor-pointer text-left relative ${
                  isCollapsed
                    ? 'justify-center p-3 rounded-2xl'
                    : 'gap-3 px-5 py-2.5 rounded-r-xl rounded-l-none'
                } ${
                  isActive
                    ? 'bg-[#F8E7CD] text-[#1F1A14] font-semibold'
                    : 'text-[#2D261E] hover:bg-[#F3ECE0]'
                }`}
              >
                {/* Active Green Vertical Accent Line on Left Edge */}
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#10A978]" />
                )}

                {/* Icon */}
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    isActive ? 'text-[#1F1A14]' : 'text-[#2D261E]'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[1.8]" />
                </div>

                {/* English Label matching user screenshot */}
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-sm font-medium tracking-tight truncate">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#E11D48] text-white tracking-wider leading-none shadow-2xs">
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

      {/* Bottom Section: Location Pill & Collapse Button */}
      <div className={`space-y-3 pt-3 ${isCollapsed ? 'px-1' : 'px-4'}`}>
        {/* Location Pill matching user screenshot */}
        <button
          type="button"
          onClick={onOpenLocationModal}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-full border border-[#E5DFD4] bg-white/50 hover:bg-white text-[#2B231B] transition-all cursor-pointer shadow-2xs ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          title={`Delivery Hub: ${locationName} (Click to change)`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#5C5449] shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-semibold truncate max-w-[120px]">
              {locationName}
            </span>
          )}
        </button>

        {/* Optional Collapse Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-lg transition-colors cursor-pointer text-xs"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
});
