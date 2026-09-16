import React from 'react';
import { Location, User } from '../types';
import { MapPin, ChevronDown, Bell, Scale } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface MobileHeaderProps {
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  onOpenDrawer?: () => void;
  onOpenProfile?: () => void;
  onOpenCompare?: () => void;
  authUser: User | null;
  unreadNotificationsCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentLocation,
  onOpenLocationModal,
  onOpenDrawer,
  onOpenProfile,
  onOpenCompare,
  authUser,
  unreadNotificationsCount = 1,
}) => {
  const avatarLetter = authUser?.name
    ? authUser.name.charAt(0).toUpperCase()
    : 'R';

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#F0F4F2] shadow-2xs font-sans">
      <div className="flex items-center justify-between gap-2">
        {/* Left: EnteBazaar Brand Logo */}
        <EnteBazaarLogo size="sm" />

        {/* Right Controls: Location Pill, Compare Scale, Bell, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location Badge Pill */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F5F8F6] hover:bg-[#E8F5EE] border border-[#E3ECE7] rounded-full text-xs font-semibold text-[#17221D] transition-all cursor-pointer active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0B8F68] shrink-0" />
            <span className="text-[10px] font-bold truncate max-w-[70px] font-malayalam">
              {currentLocation ? currentLocation.name : 'Areekode'}
            </span>
            <ChevronDown className="w-2.5 h-2.5 text-[#66756E] shrink-0" />
          </button>

          {/* Compare Scale Button */}
          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="p-2 text-[#063B2A] bg-[#E8F5EE] hover:bg-[#D4EEDE] border border-[#C3EEDC] rounded-full transition-colors cursor-pointer active:scale-95"
              title="വില താരതമ്യം (Compare Prices)"
              aria-label="Compare"
            >
              <Scale className="w-4 h-4 text-[#0B8F68]" />
            </button>
          )}

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="relative p-2 text-[#2D3E35] hover:bg-[#F5F8F6] rounded-full transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D3E35]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile || onOpenDrawer}
            className="w-8 h-8 rounded-full bg-[#063B2A] text-white flex items-center justify-center text-xs font-bold font-sans shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer ring-2 ring-[#0B8F68]/20"
            aria-label="Profile"
          >
            {avatarLetter}
          </button>
        </div>
      </div>
    </header>
  );
};

