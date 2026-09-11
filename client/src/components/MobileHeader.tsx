import React from 'react';
import { Location, User } from '../types';
import {
  Menu,
  MapPin,
  MessageCircle,
  ShoppingBag,
  ChevronDown,
  Bell,
  Sparkles,
} from 'lucide-react';

interface MobileHeaderProps {
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  onOpenDrawer: () => void;
  onOpenChat?: () => void;
  basketCount: number;
  onOpenBasket: () => void;
  authUser: User | null;
  onOpenAuthModal: (mode?: 'consumer-login') => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentLocation,
  onOpenLocationModal,
  onOpenDrawer,
  onOpenChat,
  basketCount,
  onOpenBasket,
  authUser,
  onOpenAuthModal,
}) => {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3ECE7] px-3.5 py-2.5 shadow-2xs font-sans">
      <div className="flex items-center justify-between gap-2">
        
        {/* Left: Brand Logo matching Screen 1 */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-xl bg-[#063B2A] text-[#10A978] flex items-center justify-center text-sm shadow-xs shrink-0 cursor-pointer"
            aria-label="മെനു തുറക്കുക"
          >
            🛒
          </button>

          <div className="min-w-0">
            <span className="font-black text-base tracking-tight text-[#063B2A] block leading-tight font-sans">
              Price<span className="text-[#0B8F68]">Teller</span>
            </span>
          </div>
        </div>

        {/* Center/Right: Location Pill & Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Location Hub Pill matching Screen 1 & 2 */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F5F8F6] hover:bg-[#DDF5EA]/60 active:scale-95 text-[#17221D] rounded-full text-xs font-bold transition-all cursor-pointer max-w-[130px] font-malayalam border border-[#E3ECE7]"
            title="പ്രദേശം തിരഞ്ഞെടുക്കുക"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="truncate text-[11px] font-extrabold">{currentLocation ? currentLocation.name : 'തിരൂർ'}</span>
            <ChevronDown className="w-3 h-3 text-[#66756E] shrink-0" />
          </button>

          {/* Chat / Notifications Icon matching Screen 1 */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="p-2 text-[#66756E] hover:text-[#0B8F68] hover:bg-[#DDF5EA]/40 rounded-xl transition-colors cursor-pointer relative"
              aria-label="ചാറ്റ്"
            >
              <MessageCircle className="w-4 h-4 text-[#0B8F68]" />
            </button>
          )}

          {/* User Profile Avatar / Drawer button matching Screen 1 */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-xl bg-[#DDF5EA] hover:bg-[#DDF5EA]/80 border border-[#0B8F68]/20 flex items-center justify-center text-[#063B2A] font-black text-xs transition-colors shrink-0 cursor-pointer"
            aria-label="അക്കൗണ്ട് പ്രൊഫൈൽ"
          >
            {authUser?.name ? (
              <span className="text-[#063B2A]">{authUser.name.charAt(0).toUpperCase()}</span>
            ) : (
              <span className="text-sm">👤</span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
