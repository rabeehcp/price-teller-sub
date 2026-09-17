import React from 'react';
import { Location, User } from '../types';
import { Home, Store, MapPin, ShoppingBag, User as UserIcon, LogOut, ArrowRight, ChevronDown } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface DesktopLeftSidebarProps {
  currentTab: string;
  onSelectTab: (tab: 'home' | 'shops' | 'map' | 'orders' | 'profile' | any) => void;
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  authUser: User | null;
  onOpenAuthModal?: () => void;
}

export const DesktopLeftSidebar: React.FC<DesktopLeftSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLocation,
  onOpenLocationModal,
  authUser,
  onOpenAuthModal,
}) => {
  const locationName = currentLocation?.name || 'Areekode';

  return (
    <aside className="w-64 bg-[#141816] text-white shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-[#242A27] shadow-xl fixed top-0 bottom-0 left-0 h-screen z-30 select-none overflow-y-auto">
      <div>
        {/* Official Brand Logo */}
        <div className="px-2 py-2 mb-4">
          <EnteBazaarLogo
            size="md"
            theme="dark"
            withTagline={true}
            onClick={() => onSelectTab('home')}
          />
        </div>

        {/* Navigation Menu matching Image 1 */}
        <nav className="space-y-1.5 font-malayalam">
          <button
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ഹോം (Home)</span>
          </button>

          <button
            onClick={() => onSelectTab('shops')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'shops'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>സമീപത്തെ കടകൾ (Shops)</span>
          </button>

          <button
            onClick={() => onSelectTab('map')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'map'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>മാപ്പ് (Nearby Map)</span>
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'orders'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ഓർഡറുകൾ (Orders)</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>പ്രൊഫൈൽ (Profile)</span>
          </button>
        </nav>
      </div>

      {/* Bottom Area: Location Selector Pill & Kerala Branding matching Image 1 */}
      <div className="space-y-3 pt-3 border-t border-[#242A27]">
        {/* Location Selector Pill matching Image 1 */}
        <div
          onClick={onOpenLocationModal}
          className="p-3 bg-[#1D2220] hover:bg-[#242A27] border border-[#2F3733] rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-all group"
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
            className="px-2.5 py-1 bg-[#10A978] hover:bg-[#0B8F68] text-[#141816] hover:text-white rounded-lg text-[10px] font-black font-malayalam transition-all cursor-pointer shrink-0"
          >
            മാറ്റുക
          </button>
        </div>

        {/* Brand Promise Footer matching Image 1 */}
        <div className="px-2 py-2 bg-black/25 rounded-xl text-center border border-[#242A27]/50">
          <div className="text-[11px] font-bold text-[#A2B1A9] font-malayalam leading-tight">
            നാടിന്റെ ഉൽപ്പന്നങ്ങൾ നിങ്ങളുടെ കൈകളിൽ
          </div>
        </div>
      </div>
    </aside>
  );
};
