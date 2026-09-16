import React from 'react';
import {
  Home,
  ShoppingCart,
  Clock,
  Heart,
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut,
  Store,
  ShieldCheck,
  X,
  Palmtree,
  ChevronRight,
  LayoutGrid,
  Package,
  Receipt,
  CalendarCheck,
  MessageCircle,
  Flame,
  Crown,
  Users,
  CreditCard,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { User } from '../types';

export type DrawerMode = 'shopper' | 'merchant' | 'admin';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  authUser: User | null;
  basketCount?: number;
  pendingOrdersCount?: number;
  unreadChatsCount?: number;
  
  // Shopper Navigation Props
  onNavigateTab?: (tab: 'home' | 'shops' | 'map' | 'favorites' | 'orders' | 'profile') => void;
  onOpenAuthModal?: (mode?: 'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway') => void;
  onOpenConsumerDashboard?: () => void;
  onOpenPreBookings?: () => void;
  onOpenMerchantPortal?: () => void;
  onOpenAdminPortal?: () => void;
  
  // Merchant Navigation Props
  merchantTab?: 'dashboard' | 'inventory' | 'billing' | 'prebookings' | 'chats' | 'profile' | 'deals';
  onSelectMerchantTab?: (tab: 'dashboard' | 'inventory' | 'billing' | 'prebookings' | 'chats' | 'profile' | 'deals') => void;
  onOpenSubscriptionModal?: () => void;
  
  // Admin Navigation Props
  adminTab?: string;
  onSelectAdminTab?: (tab: string) => void;
  
  // General Props
  onBackToShopper?: () => void;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  mode = 'shopper',
  authUser,
  basketCount = 0,
  pendingOrdersCount = 0,
  unreadChatsCount = 0,
  onNavigateTab,
  onOpenAuthModal,
  onOpenConsumerDashboard,
  onOpenPreBookings,
  onOpenMerchantPortal,
  onOpenAdminPortal,
  merchantTab = 'dashboard',
  onSelectMerchantTab,
  onOpenSubscriptionModal,
  adminTab = 'dashboard',
  onSelectAdminTab,
  onBackToShopper,
  onLogout,
}) => {
  if (!isOpen) return null;

  // Determine effective role & mode
  const isMerchant = mode === 'merchant';
  const isAdmin = mode === 'admin';
  const isShopper = mode === 'shopper';

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#063B2A] text-white flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 font-sans h-full overflow-y-auto">
        
        {/* Top Header */}
        <div className="p-5 border-b border-[#084D37] bg-[#04281C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#10A978] text-[#063B2A] flex items-center justify-center font-black text-sm shadow-sm">
                {isMerchant ? '🏪' : isAdmin ? '🛡️' : '🛒'}
              </div>
              <span className="font-black text-base text-white tracking-tight font-sans">
                {isMerchant ? 'Merchant Portal' : isAdmin ? 'Admin Panel' : 'PriceTeller'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#DDF5EA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {authUser ? (
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#10A978] text-[#063B2A] flex items-center justify-center text-lg font-black shrink-0 border-2 border-[#DDF5EA]/40 shadow-md">
                {isMerchant && authUser.shopName ? '🏪' : (authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤')}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm text-white truncate m-0 font-malayalam">
                  {isMerchant ? (authUser.shopName || authUser.name || 'എന്റെ കട') : (authUser.name || 'ഉപയോക്താവ്')}
                </h4>
                <p className="text-[11px] text-[#DDF5EA]/80 truncate font-mono">
                  {authUser.email || authUser.username || authUser.phone || 'Verified'}
                </p>
                <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-[#10A978]/20 text-[#DDF5EA] border border-[#10A978]/30">
                  {isMerchant ? '🟢 വ്യാപാരി (MERCHANT)' : isAdmin ? '🛡️ അഡ്മിൻ (ADMIN)' : '🛒 ഉപഭോക്താവ് (SHOPPER)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal('consumer-login');
                }}
                className="w-full py-2.5 px-4 bg-[#10A978] hover:bg-[#0B8F68] active:scale-95 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-malayalam cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>ലോഗിൻ / സൈൻ അപ്പ് ചെയ്യുക</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MERCHANT MODE NAVIGATION MENU */}
        {/* ============================================================ */}
        {isMerchant && (
          <div className="p-4 space-y-1.5 flex-1 font-malayalam">
            <div className="text-[10px] font-black text-[#DDF5EA]/90 uppercase tracking-wider px-3 mb-2 font-sans">
              Merchant Navigation
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'dashboard'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ഡാഷ്‌ബോർഡ് (Dashboard)</span>
            </button>

            {/* 2. Billing & POS */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('billing');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'billing'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ബില്ലിംഗ് & POS</span>
            </button>

            {/* 3. Products */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('inventory');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'inventory'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ഉൽപ്പന്നങ്ങൾ (Products)</span>
            </button>

            {/* 4. Pre-Bookings / Orders */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('prebookings');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'prebookings'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <CalendarCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>ഓർഡറുകൾ (Pre-Bookings)</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-2 py-0.2 rounded-full font-sans">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 5. Customer Chat */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('chats');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'chats'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>കസ്റ്റമർ ചാറ്റ് (Customer Chats)</span>
              </div>
              {unreadChatsCount > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-2 py-0.2 rounded-full font-sans">
                  {unreadChatsCount}
                </span>
              )}
            </button>

            {/* 6. Flash Deals */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('deals');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'deals'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-[#F4B740] shrink-0" />
              <span>ഫ്ലാഷ് ഡീലുകൾ (Flash Deals)</span>
            </button>

            {/* 7. Store Profile */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('profile');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                merchantTab === 'profile'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>സ്റ്റോർ പ്രൊഫൈൽ (Store Profile)</span>
            </button>

            {/* Switch Mode & Role Switchers */}
            <div className="pt-3 pb-2 border-t border-[#084D37] my-2 space-y-1.5">
              {onOpenSubscriptionModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscriptionModal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#084D37]/70 hover:bg-[#084D37] rounded-xl text-xs font-bold text-[#DDF5EA] border border-[#10A978]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-[#F4B740]" />
                    <span>സബ്സ്ക്രിപ്ഷൻ പ്ലാൻ (Plans)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-300 shrink-0" />
                <span>ലോഗൗട്ട് (Logout)</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ADMIN MODE NAVIGATION MENU */}
        {/* ============================================================ */}
        {isAdmin && (
          <div className="p-4 space-y-1.5 flex-1 font-malayalam">
            <div className="text-[10px] font-black text-[#DDF5EA]/90 uppercase tracking-wider px-3 mb-2 font-sans">
              Admin Navigation
            </div>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'dashboard'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>അഡ്മിൻ ഡാഷ്‌ബോർഡ് (Dashboard)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('users');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ഉപയോക്താക്കൾ (Users)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('shops');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'shops'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>കടകൾ (Shops Directory)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('products');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'products'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>മാസ്റ്റർ ഉൽപ്പന്നങ്ങൾ (Products)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('subscriptions');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'subscriptions'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>സബ്‌സ്‌ക്രിപ്ഷനുകൾ (Subscriptions)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('audit');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                adminTab === 'audit'
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ഓഡിറ്റ് ലോഗ് (Audit Logs)</span>
            </button>

            <div className="pt-3 pb-2 border-t border-[#084D37] my-2"></div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-300 shrink-0" />
                <span>ലോഗൗട്ട് (Logout)</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SHOPPER / CONSUMER MODE NAVIGATION MENU (Screen 9) */}
        {/* ============================================================ */}
        {isShopper && (
          <div className="p-4 space-y-1 flex-1 font-malayalam">
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <Home className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ഹോം (Home)</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('shops');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>സമീപത്തെ കടകൾ (Shops)</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <ShoppingCart className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>എന്റെ ബാസ്കറ്റ് (My Basket)</span>
              </div>
              {basketCount > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-2 py-0.2 rounded-full font-sans">
                  {basketCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenPreBookings) onOpenPreBookings();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>ഓർഡറുകൾ (Orders)</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-2 py-0.2 rounded-full font-sans">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <Heart className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>എന്റെ ഇഷ്ടങ്ങൾ (Favorites)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>പ്രൊഫൈൽ (Profile)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>ക്രമീകരണങ്ങൾ (Settings)</span>
            </button>

            <button
              onClick={() => {
                alert('PriceTeller സഹായം: കസ്റ്റമർ സപ്പോർട്ടിനായി support@priceteller.in ബന്ധപ്പെടുക.');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>സഹായം (Help)</span>
            </button>

            {/* Direct Role Switching */}
            <div className="pt-3 pb-2 border-t border-[#084D37] my-2 space-y-1.5">
              {onOpenMerchantPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMerchantPortal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#084D37]/70 hover:bg-[#084D37] rounded-xl text-xs font-bold text-[#DDF5EA] border border-[#10A978]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-emerald-300" />
                    <span>വ്യാപാരി പാനൽ (Merchant)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {authUser?.role === 'admin' && onOpenAdminPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPortal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#084D37]/70 hover:bg-[#084D37] rounded-xl text-xs font-bold text-[#DDF5EA] border border-[#10A978]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>അഡ്മിൻ പാനൽ (Admin)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-300 shrink-0" />
                <span>ലോഗൗട്ട് (Logout)</span>
              </button>
            )}
          </div>
        )}

        {/* Local Shops Support Card (Matching Screen 9 bottom) */}
        <div className="p-4 border-t border-[#084D37] bg-[#04281C]">
          <div className="p-3 bg-[#063B2A] rounded-2xl border border-[#084D37] flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10A978]/20 text-[#10A978] flex items-center justify-center shrink-0">
              <Palmtree className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-black text-xs text-white font-malayalam leading-tight mb-0.5">
                {isMerchant ? 'വ്യാപാരം മെച്ചപ്പെടുത്താം' : 'പ്രാദേശിക കടകളെ പിന്തുണക്കാം'}
              </h5>
              <p className="text-[10px] text-[#DDF5EA]/70 font-malayalam leading-snug">
                {isMerchant
                  ? 'കൃത്യമായ വിലകളും ഉൽപ്പന്ന ലഭ്യതയും അപ്‌ഡേറ്റ് ചെയ്ത് കൂടുതൽ ഉപഭോക്താക്കളെ നേടൂ.'
                  : 'നിങ്ങളുടെ പിന്തുണ കേരളത്തിലെ പ്രാദേശിക കടകൾക്ക് വളരെയധികം പ്രധാനമാണ്.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
