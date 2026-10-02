import React, { useState, useEffect } from 'react';
import { User, Location, ConsumerData } from '../types';
import { fetchPreBookingsApi } from '../services/api';
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
  ArrowLeft,
  Bookmark,
  Heart,
  ShoppingBag,
  List,
  Briefcase,
} from 'lucide-react';
import {
  ConsumerAddressModal,
  ConsumerPaymentsModal,
  ConsumerInviteModal,
  ConsumerSupportModal,
  ConsumerSettingsModal,
} from './ConsumerProfileModals';

interface MobileProfileViewProps {
  authUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSelectSubTab?: (tab: string) => void;
  onOpenPartnerPortal?: () => void;
  onBack?: () => void;
  currentLocation?: Location | null;
  onOpenLocationModal?: () => void;
  consumerData?: ConsumerData | null;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  authUser,
  onOpenAuthModal,
  onLogout,
  onSelectSubTab,
  onOpenPartnerPortal,
  onBack,
  currentLocation,
  onOpenLocationModal,
  consumerData,
}) => {
  const [activeModal, setActiveModal] = useState<
    'addresses' | 'payments' | 'refer' | 'support' | 'settings' | null
  >(null);
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    if (authUser?.token) {
      fetchPreBookingsApi(authUser.token)
        .then((b) => setOrderCount(b?.length || 0))
        .catch(() => {});
    }
  }, [authUser?.token]);

  const userName = authUser?.name || 'Rabeeh CP';
  const userEmail = authUser?.email || 'rabeehsp3663@gmail.com';
  const userPhone = authUser?.phone || '+91 9539839224';
  const avatarLetter = userName.charAt(0).toUpperCase() || 'R';
  const locationName = currentLocation?.name || 'Areekode';

  const savedListsCount = consumerData?.savedLists?.length || 0;
  const favoritesCount = consumerData?.favorites?.length || 1;

  const handleItemClick = (id: string) => {
    if (id === 'orders') {
      if (onSelectSubTab) onSelectSubTab('orders');
    } else if (id === 'chat') {
      if (onSelectSubTab) onSelectSubTab('chat');
    } else if (id === 'lists') {
      if (onSelectSubTab) onSelectSubTab('lists');
    } else if (id === 'favorites') {
      if (onSelectSubTab) onSelectSubTab('favorites');
    } else if (id === 'addresses') {
      if (onOpenLocationModal) onOpenLocationModal();
      else setActiveModal('addresses');
    } else if (id === 'payments') {
      setActiveModal('payments');
    } else if (id === 'refer') {
      setActiveModal('refer');
    } else if (id === 'support') {
      setActiveModal('support');
    } else if (id === 'settings') {
      setActiveModal('settings');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 font-sans pb-28 animate-in fade-in duration-150 px-3 pt-2">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between px-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-xl text-slate-800 shadow-2xs transition-all cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
        )}
        <h1 className="text-base font-black text-slate-900 tracking-tight m-0 font-sans">
          Profile
        </h1>
        <div className="w-8" />
      </div>

      {/* 2. USER IDENTITY CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs text-center space-y-2 relative overflow-hidden">
        {/* User Circular Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#173C2C] text-white flex items-center justify-center text-2xl font-black mx-auto ring-4 ring-emerald-500/20 shadow-xs select-none">
          {avatarLetter}
        </div>

        <div className="space-y-0.5 pt-1">
          <h2 className="text-lg font-black text-slate-900 m-0 tracking-tight">
            {userName}
          </h2>
          <p className="text-xs text-slate-500 font-medium m-0 font-mono">
            {userPhone}
          </p>
          <p className="text-xs text-slate-400 m-0">
            {userEmail}
          </p>
        </div>

        <div className="pt-1.5 flex justify-center">
          <span className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#0D6344] border border-[#C5ECD8] text-[11px] font-bold px-3 py-1 rounded-full font-malayalam shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6344]" />
            <span>Verified Consumer (പരിശോധിച്ച ഉപഭോക്താവ്)</span>
          </span>
        </div>
      </div>

      {/* 3. 3 KPI METRIC CARDS */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => handleItemClick('orders')}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-center space-y-1 shadow-2xs transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0D6344] flex items-center justify-center mx-auto">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-black text-slate-900 font-sans">
            {orderCount}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            Orders
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('lists')}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-center space-y-1 shadow-2xs transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0D6344] flex items-center justify-center mx-auto">
            <List className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-black text-slate-900 font-sans">
            {savedListsCount}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            Saved Lists
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('favorites')}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-center space-y-1 shadow-2xs transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-black text-slate-900 font-sans">
            {favoritesCount}
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            Favorites
          </div>
        </button>
      </div>

      {/* 4. GROUPED ACTIONS: GROUP 1 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => handleItemClick('orders')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-[#0D6344] transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                My Orders & Pre-Bookings
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                മുൻകൂട്ടി ബുക്കിംഗുകൾ
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('lists')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-[#0D6344] transition-colors">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                Saved Shopping Lists
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                ഷോപ്പിംഗ് ലിസ്റ്റുകൾ
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('favorites')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-rose-600 transition-colors">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                Favorite Products
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => handleItemClick('chat')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-[#0D6344] transition-colors">
              <MessageCircle className="w-4 h-4 text-[#0D6344]" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                Chat with Shops
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                കടകളുമായി തത്സമയ ചാറ്റ്
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 5. GROUPED ACTIONS: GROUP 2 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => handleItemClick('addresses')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-[#0D6344] transition-colors">
              <MapPin className="w-4 h-4 text-[#0D6344]" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                Saved Location ({locationName})
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                ഷോപ്പിംഗ് പ്രദേശം മാറ്റുക
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {onOpenPartnerPortal && (
          <button
            type="button"
            onClick={onOpenPartnerPortal}
            className="w-full flex items-center justify-between p-3.5 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Briefcase className="w-4 h-4 text-[#0D6344]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                    Field Agent Hub
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded font-sans">
                    50% Cut
                  </span>
                </div>
                <span className="text-[10.5px] text-emerald-700 font-malayalam block">
                  ഏജന്റ് പോർട്ടൽ ലോഗിൻ & വരുമാനം
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <button
          type="button"
          onClick={() => handleItemClick('settings')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-[#0D6344] transition-colors">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-sans">
                Account Settings
              </span>
              <span className="text-[10.5px] text-slate-400 font-malayalam block">
                ഭാഷ & നോട്ടിഫിക്കേഷനുകൾ
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 6. LOG OUT BUTTON */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs sm:text-sm rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-rose-200/80 shadow-2xs font-sans"
      >
        <span>Log Out</span>
        <LogOut className="w-4 h-4" />
      </button>

      {/* Modals */}
      {activeModal === 'addresses' && (
        <ConsumerAddressModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          authUser={authUser}
          currentLocation={currentLocation}
        />
      )}
      {activeModal === 'payments' && (
        <ConsumerPaymentsModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'refer' && (
        <ConsumerInviteModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'support' && (
        <ConsumerSupportModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          authUser={authUser}
        />
      )}
      {activeModal === 'settings' && (
        <ConsumerSettingsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          currentLocation={currentLocation}
          onOpenLocationModal={onOpenLocationModal}
        />
      )}
    </div>
  );
};
