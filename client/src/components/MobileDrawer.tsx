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
  Briefcase,
  Zap,
  Truck,
} from 'lucide-react';
import { User } from '../types';
import { EnteBazaarLogo } from './EnteBazaarLogo';

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
  onOpenChat?: () => void;
  onOpenFlashDeals?: () => void;
  onOpenMerchantPortal?: () => void;
  onOpenPartnerPortal?: () => void;
  onOpenAdminPortal?: () => void;

  // Merchant Navigation Props
  merchantTab?: 'dashboard' | 'inventory' | 'billing' | 'delivery' | 'prebookings' | 'chats' | 'profile' | 'deals';
  onSelectMerchantTab?: (tab: 'dashboard' | 'inventory' | 'billing' | 'delivery' | 'prebookings' | 'chats' | 'profile' | 'deals') => void;
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
  onOpenChat,
  onOpenFlashDeals,
  onOpenMerchantPortal,
  onOpenPartnerPortal,
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
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel - Warm, Clean, Professional Sidebar */}
      <div className="relative w-4/5 max-w-xs bg-[#FAF7F2] text-[#1F1A14] flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 font-sans h-full overflow-y-auto border-r border-[#ECE6DA]">

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#ECE6DA] bg-[#F7F2EA]">
          <div className="flex items-center justify-between h-9 mb-3">
            <EnteBazaarLogo
              size="md"
              theme="light"
              className="h-8 flex items-center"
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 hover:bg-black/10 text-[#7C6E5E] hover:text-[#1F1A14] transition-colors cursor-pointer border border-[#ECE6DA] shrink-0"
              title="Close Drawer"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {authUser ? (
            <div className="p-3 bg-white border border-[#ECE6DA] rounded-2xl flex items-center gap-3 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F5EE] border border-[#C5ECD8] text-[#0D6344] flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
                {isMerchant && authUser.shopName ? '🏪' : (authUser.name ? authUser.name.charAt(0).toUpperCase() : '👤')}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#1F1A14] truncate m-0 font-malayalam leading-tight">
                  {isMerchant ? (authUser.shopName || authUser.name || 'എന്റെ കട') : (authUser.name || 'ഉപയോക്താവ്')}
                </h4>
                <p className="text-[11px] text-[#7C6E5E] truncate font-sans mt-0.5">
                  {authUser.email || authUser.username || authUser.phone || 'Verified'}
                </p>
                <span className="inline-block mt-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#0D6344] border border-[#C5ECD8]">
                  {isMerchant ? '● വ്യാപാരി (MERCHANT)' : isAdmin ? '🛡️ Admin' : '🛒 ഉപഭോക്താവ് (SHOPPER)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal('consumer-login');
                }}
                className="w-full py-2.5 px-4 bg-[#0D6344] hover:bg-[#064E3B] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 font-malayalam cursor-pointer"
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
          <div className="p-3.5 space-y-1 flex-1 font-malayalam">
            <div className="text-[10px] font-bold text-[#8C7E6E] uppercase tracking-wider px-3 mb-2 font-sans">
              Merchant Navigation
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'dashboard'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'dashboard' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <LayoutGrid className={`w-4 h-4 shrink-0 ${merchantTab === 'dashboard' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>ഡാഷ്‌ബോർഡ് (Dashboard)</span>
            </button>

            {/* 2. Billing & POS */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('billing');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'billing'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'billing' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Receipt className={`w-4 h-4 shrink-0 ${merchantTab === 'billing' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>ബില്ലിംഗ് & POS</span>
            </button>

            {/* 3. Products */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('inventory');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'inventory'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'inventory' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Package className={`w-4 h-4 shrink-0 ${merchantTab === 'inventory' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>ഉൽപ്പന്നങ്ങൾ (Products)</span>
            </button>

            {/* 4. Pre-Bookings / Orders */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('prebookings');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'prebookings'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'prebookings' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <div className="flex items-center gap-3">
                <CalendarCheck className={`w-4 h-4 shrink-0 ${merchantTab === 'prebookings' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
                <span>ഓർഡറുകൾ (Pre-Bookings)</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-[#0D6344] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Delivery Hub */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('delivery');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'delivery'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'delivery' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <div className="flex items-center gap-3">
                <Truck className={`w-4 h-4 shrink-0 ${merchantTab === 'delivery' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
                <span>ഹോം ഡെലിവറി (Delivery Hub)</span>
              </div>
            </button>

            {/* 5. Customer Chat */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('chats');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'chats'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'chats' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <div className="flex items-center gap-3">
                <MessageCircle className={`w-4 h-4 shrink-0 ${merchantTab === 'chats' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
                <span>കസ്റ്റമർ ചാറ്റ് (Customer Chats)</span>
              </div>
              {unreadChatsCount > 0 && (
                <span className="bg-[#0D6344] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'deals'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'deals' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Flame className="w-4 h-4 text-[#F4B740] shrink-0" />
              <span>ഫ്ലാഷ് ഡീലുകൾ (Flash Deals)</span>
            </button>

            {/* 7. Store Profile */}
            <button
              onClick={() => {
                if (onSelectMerchantTab) onSelectMerchantTab('profile');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                merchantTab === 'profile'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {merchantTab === 'profile' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Store className={`w-4 h-4 shrink-0 ${merchantTab === 'profile' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>സ്റ്റോർ പ്രൊഫൈൽ (Store Profile)</span>
            </button>

            {/* Switch Mode & Role Switchers */}
            <div className="pt-3 pb-1 border-t border-[#ECE6DA] my-2 space-y-1.5">
              {onBackToShopper && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBackToShopper();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0D6344] bg-[#E8F5EE] hover:bg-[#D5EFE2] border border-[#C5ECD8] transition-all text-left cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0D6344] shrink-0" />
                  <span>കസ്റ്റമർ ആപ്പിലേക്ക് മടങ്ങുക (Back to Shopper)</span>
                </button>
              )}

              {onOpenPartnerPortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPartnerPortal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#E8F5EE] hover:bg-[#D5EFE2] rounded-xl text-xs font-bold text-[#0D6344] border border-[#C5ECD8] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#0D6344]" />
                    <span>ഏജന്റ് പോർട്ടൽ (Agent Hub)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D6344]" />
                </button>
              )}

              {onOpenSubscriptionModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscriptionModal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FDF5E8] hover:bg-[#FAEAD2] rounded-xl text-xs font-bold text-[#925807] border border-[#FBE6BA] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#D97706]" />
                    <span>സബ്സ്ക്രിപ്ഷൻ പ്ലാൻ (Plans)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B45309]" />
                </button>
              )}
            </div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ലോഗൗട്ട് (Logout)</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ADMIN MODE NAVIGATION MENU */}
        {/* ============================================================ */}
        {isAdmin && (
          <div className="p-3.5 space-y-1 flex-1 font-sans">
            <div className="text-[10px] font-bold text-[#8C7E6E] uppercase tracking-wider px-3 mb-2 font-sans">
              Admin Navigation
            </div>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('overview');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'dashboard' || adminTab === 'overview'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {(adminTab === 'dashboard' || adminTab === 'overview') && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <LayoutGrid className={`w-4 h-4 shrink-0 ${adminTab === 'dashboard' || adminTab === 'overview' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('users');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'users'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {adminTab === 'users' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Users className={`w-4 h-4 shrink-0 ${adminTab === 'users' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Users</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('stores');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'shops' || adminTab === 'stores'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {(adminTab === 'shops' || adminTab === 'stores') && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Store className={`w-4 h-4 shrink-0 ${adminTab === 'shops' || adminTab === 'stores' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Merchants</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('catalog');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'products' || adminTab === 'catalog'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {(adminTab === 'products' || adminTab === 'catalog') && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Package className={`w-4 h-4 shrink-0 ${adminTab === 'products' || adminTab === 'catalog' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Master Products</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('subscriptions');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'subscriptions'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {adminTab === 'subscriptions' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <CreditCard className={`w-4 h-4 shrink-0 ${adminTab === 'subscriptions' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Subscriptions</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('clients');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'clients'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {adminTab === 'clients' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Briefcase className={`w-4 h-4 shrink-0 ${adminTab === 'clients' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Field Agents</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('locations');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'locations'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {adminTab === 'locations' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <Settings className={`w-4 h-4 shrink-0 ${adminTab === 'locations' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Regional Hubs</span>
            </button>

            <button
              onClick={() => {
                if (onSelectAdminTab) onSelectAdminTab('moderation');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer relative ${
                adminTab === 'moderation'
                  ? 'bg-[#F8E7CD] text-[#1F1A14] shadow-2xs font-bold'
                  : 'text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14]'
              }`}
            >
              {adminTab === 'moderation' && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#10A978] rounded-r" />
              )}
              <ShieldCheck className={`w-4 h-4 shrink-0 ${adminTab === 'moderation' ? 'text-[#0D6344]' : 'text-[#7C6E5E]'}`} />
              <span>Price Reports</span>
            </button>

            <div className="pt-3 pb-1 border-t border-[#ECE6DA] my-2 space-y-1.5">
              {onBackToShopper && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBackToShopper();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0D6344] bg-[#E8F5EE] hover:bg-[#D5EFE2] border border-[#C5ECD8] transition-all text-left cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0D6344] shrink-0" />
                  <span>Back to Shopper App</span>
                </button>
              )}
            </div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SHOPPER / CONSUMER MODE NAVIGATION MENU */}
        {/* ============================================================ */}
        {isShopper && (
          <div className="p-3.5 space-y-1 flex-1 font-malayalam">
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>ഹോം (Home)</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('shops');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>സമീപത്തെ കടകൾ (Shops)</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-[#7C6E5E] shrink-0" />
                <span>എന്റെ ബാസ്കറ്റ് (My Basket)</span>
              </div>
              {basketCount > 0 && (
                <span className="bg-[#0D6344] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
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
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#7C6E5E] shrink-0" />
                <span>ഓർഡറുകൾ (Orders)</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-[#0D6344] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Flash Deals Option */}
            {onOpenFlashDeals && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFlashDeals();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFE8D6] hover:bg-[#FED7AA] border border-[#FDBA74] transition-colors text-left cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#EA580C] shrink-0 fill-[#EA580C]" />
                  <span>ഫ്ലാഷ് ഡീലുകൾ (Flash Deals)</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white font-sans animate-pulse">
                  LIVE
                </span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenChat) onOpenChat();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#7C6E5E] shrink-0" />
                <span>കടകളുമായി ചാറ്റ് (Chat with Shops)</span>
              </div>
              {unreadChatsCount > 0 && (
                <span className="bg-[#0D6344] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                  {unreadChatsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>എന്റെ ഇഷ്ടങ്ങൾ (Favorites)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>പ്രൊഫൈൽ (Profile)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (!authUser && onOpenAuthModal) onOpenAuthModal('consumer-login');
                else if (onOpenConsumerDashboard) onOpenConsumerDashboard();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>ക്രമീകരണങ്ങൾ (Settings)</span>
            </button>

            <button
              onClick={() => {
                alert('PeediaCart സഹായം: കസ്റ്റമർ സപ്പോർട്ടിനായി support@peediacart.in ബന്ധപ്പെടുക.');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A3F35] hover:bg-[#F3ECE0] hover:text-[#1F1A14] transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#7C6E5E] shrink-0" />
              <span>സഹായം (Help)</span>
            </button>

            {/* Direct Role Switching */}
            <div className="pt-3 pb-1 border-t border-[#ECE6DA] my-2 space-y-1.5">
              {onOpenPartnerPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPartnerPortal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#E8F5EE] hover:bg-[#D5EFE2] rounded-xl text-xs font-bold text-[#0D6344] border border-[#C5ECD8] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#0D6344]" />
                    <span>ഏജന്റ് ഹബ്ബ് (Agent Hub)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded font-sans">
                      50% Cut
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#0D6344]" />
                  </div>
                </button>
              )}

              {onOpenMerchantPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMerchantPortal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-[#4A3F35] border border-[#ECE6DA] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0D6344]" />
                    <span>വ്യാപാരി പാനൽ (Merchant)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {authUser?.role === 'admin' && onOpenAdminPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPortal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] border border-[#CBD5E1] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#334155]" />
                    <span>Admin Console</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#334155]" />
                </button>
              )}
            </div>

            {authUser && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ലോഗൗട്ട് (Logout)</span>
              </button>
            )}
          </div>
        )}

        {/* Local Shops Support Card */}
        <div className="p-4 border-t border-[#ECE6DA] bg-[#F7F2EA]">
          <div className="p-3 bg-white rounded-2xl border border-[#ECE6DA] flex items-start gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] text-[#0D6344] flex items-center justify-center shrink-0 shadow-2xs">
              <Palmtree className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-[#1F1A14] font-malayalam leading-tight mb-0.5">
                {isMerchant ? 'വ്യാപാരം മെച്ചപ്പെടുത്താം' : 'പ്രാദേശിക കടകളെ പിന്തുണക്കാം'}
              </h5>
              <p className="text-[10px] text-[#7C6E5E] font-malayalam leading-relaxed m-0">
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
