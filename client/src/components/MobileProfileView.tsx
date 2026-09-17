import React from 'react';
import { User } from '../types';
import {
  Package,
  MapPin,
  CreditCard,
  UserPlus,
  HelpCircle,
  Settings,
  ChevronRight,
  CheckCircle2,
  LogOut,
  MessageCircle,
} from 'lucide-react';

interface MobileProfileViewProps {
  authUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSelectSubTab?: (tab: string) => void;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  authUser,
  onOpenAuthModal,
  onLogout,
  onSelectSubTab,
}) => {
  const userName = authUser?.name || 'Rabeeh Areekode';
  const userEmail = authUser?.email || 'rabeeh@gmail.com';
  const avatarLetter = userName.charAt(0).toUpperCase();

  const menuItems = [
    {
      id: 'orders',
      title: 'എന്റെ ഓർഡറുകൾ (Orders)',
      icon: <Package className="w-5 h-5 text-[#4D6158]" />,
    },
    {
      id: 'chat',
      title: 'കടകളുമായി ചാറ്റ് (Chat with Shops)',
      icon: <MessageCircle className="w-5 h-5 text-[#0B8F68]" />,
    },
    {
      id: 'addresses',
      title: 'എന്റെ വിലാസങ്ങൾ',
      icon: <MapPin className="w-5 h-5 text-[#4D6158]" />,
    },
    {
      id: 'payments',
      title: 'പണമിടപാട് രീതികൾ',
      icon: <CreditCard className="w-5 h-5 text-[#4D6158]" />,
    },
    {
      id: 'refer',
      title: 'കൂട്ടുകാരെ ക്ഷണിക്കുക',
      icon: <UserPlus className="w-5 h-5 text-[#4D6158]" />,
    },
    {
      id: 'support',
      title: 'സഹായം & പിന്തുണ',
      icon: <HelpCircle className="w-5 h-5 text-[#4D6158]" />,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="w-5 h-5 text-[#4D6158]" />,
    },
  ];

  return (
    <div className="md:hidden space-y-4 font-sans pb-28 animate-in fade-in duration-150">
      
      {/* 1. Dark Green Hero Header Card (Matching Screen 5) */}
      <div className="bg-gradient-to-b from-[#063B2A] via-[#084D37] to-[#063B2A] text-white pt-8 pb-10 px-6 rounded-b-[36px] text-center relative shadow-sm">
        
        {/* Big Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#084D37] border-2 border-white/20 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-md font-sans">
          {avatarLetter}
        </div>

        {/* User Info */}
        <h2 className="text-lg font-black text-white mt-3 mb-0.5 font-sans">
          {userName}
        </h2>
        <p className="text-xs text-white/70 font-medium font-sans m-0">
          {userEmail}
        </p>

        {/* Verified Badge (Matching Screen 5) */}
        <div className="inline-flex items-center gap-1 bg-[#10A978]/20 border border-[#10A978]/40 px-3 py-1 rounded-full text-[11px] font-bold text-[#34D399] mt-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Verified</span>
        </div>
      </div>

      {/* 2. Menu Items Card (Matching Screen 5) */}
      <div className="px-4 -mt-5">
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-2 shadow-xs space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSubTab && onSelectSubTab(item.id)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#F5F8F6] rounded-2xl transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5F8F6] group-hover:bg-[#E8F5EE] flex items-center justify-center transition-colors shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-[#17221D] font-malayalam">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8A9992] group-hover:text-[#17221D] transition-colors" />
            </button>
          ))}

          {/* Logout / Switch User */}
          <button
            type="button"
            onClick={authUser ? onLogout : onOpenAuthModal}
            className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50 rounded-2xl transition-colors text-left cursor-pointer text-rose-600 mt-1 border-t border-[#F0F4F2]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-sm font-bold font-malayalam">
                {authUser ? 'ലോഗ് ഔട്ട് ചെയ്യുക' : 'ലോഗിൻ / രജിസ്റ്റർ'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

    </div>
  );
};
