import React from 'react';
import { Location, User } from '../types';
import { MapPin, ChevronDown, Bell, MessageCircle, Briefcase } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface MobileHeaderProps {
  currentLocation: Location | null;
  onOpenLocationModal: () => void;
  onOpenDrawer?: () => void;
  onOpenProfile?: () => void;
  onOpenChat?: () => void;
  onOpenPartnerPortal?: () => void;
  authUser: User | null;
  unreadNotificationsCount?: number;
  unreadChatsCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentLocation,
  onOpenLocationModal,
  onOpenDrawer,
  onOpenProfile,
  onOpenChat,
  onOpenPartnerPortal,
  authUser,
  unreadNotificationsCount = 1,
  unreadChatsCount = 0,
}) => {
  const avatarLetter = authUser?.name
    ? authUser.name.charAt(0).toUpperCase()
    : 'R';

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white backdrop-blur-sm px-3.5 sm:px-5 py-3 border-b border-[#EAEFF0] font-sans">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: PeediaCart Brand Logo */}
        <EnteBazaarLogo size="md" className="h-7 sm:h-8" />

        {/* Right Controls: Agent Pill, Location Pill, Chat, Bell, Avatar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Direct Agent Portal Pill */}
          {onOpenPartnerPortal && (
            <button
              type="button"
              onClick={onOpenPartnerPortal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full text-xs font-black text-amber-900 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Field Agent Hub (50% Cut)"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-[11px] font-black font-sans">Agent</span>
              <span className="text-[9px] bg-amber-200 text-amber-800 px-1 py-0.2 rounded font-bold">50%</span>
            </button>
          )}

          {/* Location Badge Pill */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F5F8F6] hover:bg-[#EBF3EE] border border-[#DCE8E1] rounded-full text-xs font-semibold text-[#17221D] transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0D6344] shrink-0" />
            <span className="text-[11px] font-black truncate max-w-[70px] sm:max-w-[85px] font-malayalam text-slate-800">
              {currentLocation ? currentLocation.name : 'Areekode'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#0D6344] shrink-0" />
          </button>

          {/* Chat with Shops Button */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="relative p-2 text-[#063B2A] bg-[#F0F0F0] hover:bg-[#E5E5E5] border border-[#E0E0E0] rounded-full transition-colors cursor-pointer active:scale-95"
              title="കടകളുമായി ചാറ്റ് ചെയ്യുക (Chat with Shops)"
              aria-label="Chat"
            >
              <MessageCircle className="w-4 h-4 text-[#0B8F68]" />
              {unreadChatsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10A978] rounded-full ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="relative p-2 text-[#2D3E35] hover:bg-[#F0F0F0] rounded-full transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D3E35]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Avatar with Notification Dot */}
          <button
            type="button"
            onClick={onOpenProfile || onOpenDrawer}
            className="relative w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold font-sans shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer ring-2 ring-[#0D6344]/20"
            aria-label="Profile"
          >
            {avatarLetter}
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

