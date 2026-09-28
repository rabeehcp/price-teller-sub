import React, { useState, useEffect } from 'react';
import { User, ConsumerData, Product, ConsumerSavedList, Location, PreBooking, PreBookingStatus } from '../types';
import { ProductImage } from './ProductImage';
import { fetchPreBookingsApi, updatePreBookingStatusApi } from '../services/api';
import { formatCartItemQuantity } from '../utils/unitFormatter';
import { formatChatDateTime } from './ConsumerChatModal';
import {
  User as UserIcon,
  Package,
  Heart,
  Bookmark,
  MapPin,
  Mail,
  Phone,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Plus,
  Store,
  ExternalLink,
  MessageCircle,
  Calendar,
  Sparkles,
  Navigation,
  Search,
} from 'lucide-react';

interface DesktopProfileViewProps {
  authUser: User | null;
  consumerData: ConsumerData | null;
  products: Product[];
  currentLocation: Location | null;
  initialTab?: 'profile' | 'orders' | 'lists' | 'favorites';
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onLoadListIntoBasket: (list: ConsumerSavedList) => void;
  onDeleteList: (listId: string) => void;
  onAddFavoriteToBasket: (product: Product) => void;
  onRemoveFavorite: (productId: string) => void;
  onOpenChat?: (shopName: string) => void;
  onGoShopping?: () => void;
}

export const DesktopProfileView: React.FC<DesktopProfileViewProps> = ({
  authUser,
  consumerData,
  products,
  currentLocation,
  initialTab = 'profile',
  onOpenLocationModal,
  onOpenAuthModal,
  onLogout,
  onLoadListIntoBasket,
  onDeleteList,
  onAddFavoriteToBasket,
  onRemoveFavorite,
  onOpenChat,
  onGoShopping,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'lists' | 'favorites'>(initialTab);
  const [bookings, setBookings] = useState<PreBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Live polling every 5s for order status updates
  useEffect(() => {
    if (!authUser?.token) return;
    const interval = setInterval(() => {
      loadBookings(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [authUser?.token]);

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (orderFilterStatus === 'pending' && b.status !== 'pending') return false;
    if (orderFilterStatus === 'approved' && b.status !== 'approved') return false;
    if (orderFilterStatus === 'completed' && b.status !== 'completed') return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchShop = b.shopName.toLowerCase().includes(q);
      const matchItems = b.items?.some((it) => it.productName.toLowerCase().includes(q));
      if (!matchShop && !matchItems) return false;
    }
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const readyCount = bookings.filter((b) => b.status === 'approved').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  // Sync initial tab when switched from sidebar
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load pre-bookings
  const loadBookings = async (silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoadingBookings(true);
    try {
      const data = await fetchPreBookingsApi(authUser.token);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load pre-bookings:', err);
    } finally {
      if (!silent) setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [authUser?.token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!authUser?.token) return;
    if (!confirm('Are you sure you want to cancel this pre-booking?')) return;

    setCancellingBookingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'cancelled', undefined, authUser.token);
      await loadBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel pre-booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusBadge = (status: PreBookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-bold px-3 py-1 rounded-full font-sans shadow-2xs">
            Pending Pickup
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-[11px] font-bold px-3 py-1 rounded-full font-sans shadow-2xs">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-[11px] font-bold px-3 py-1 rounded-full font-sans">
            Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-3 py-1 rounded-full font-sans">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full font-sans">
            {status}
          </span>
        );
    }
  };

  const userName = authUser?.name || 'ഉപഭോക്താവ്';
  const userEmail = authUser?.email || 'user@example.com';
  const userLetter = userName.charAt(0).toUpperCase() || '👤';
  const locationName = currentLocation?.name || 'Areekode';

  const favoriteProducts = products.filter((p) =>
    consumerData?.favorites?.includes(p.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-150">
      
      {/* 1. HERO PROFILE BANNER */}
      <div className="bg-gradient-to-r from-[#063B2A] via-[#084D37] to-[#0B8F68] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 right-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-400/10 pointer-events-none blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Big Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#10A978] text-[#063B2A] border-2 border-white/30 flex items-center justify-center text-3xl font-black shadow-lg shrink-0 select-none">
              {userLetter}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight">
                  {userName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#10A978]/20 border border-[#10A978]/50 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>പരിശോധിച്ച ഉപഭോക്താവ്</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-white/80 font-medium mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{userEmail}</span>
                </span>
                {authUser?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{authUser.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="font-malayalam">{locationName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons on hero */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-malayalam"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>ലൊക്കേഷൻ മാറ്റുക</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-malayalam"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ലോഗ് ഔട്ട്</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS QUICK-JUMP BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-malayalam">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-1 ring-[#0B8F68]'
              : 'bg-white border-[#E3ECE7] hover:border-[#C3EEDC] hover:bg-[#F5F8F6] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#4D6158]">ഓർഡറുകൾ (Orders)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0B8F68] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17221D] font-sans">
            {bookings.length}
          </div>
          <div className="text-[11px] text-[#66756E] mt-0.5">മുൻകൂട്ടി ബുക്കിംഗുകൾ</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lists')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'lists'
              ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-1 ring-[#0B8F68]'
              : 'bg-white border-[#E3ECE7] hover:border-[#C3EEDC] hover:bg-[#F5F8F6] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#4D6158]">സേവ് ചെയ്ത ലിസ്റ്റുകൾ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0B8F68] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17221D] font-sans">
            {consumerData?.savedLists?.length || 0}
          </div>
          <div className="text-[11px] text-[#66756E] mt-0.5">ഷോപ്പിംഗ് ലിസ്റ്റുകൾ</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-1 ring-[#0B8F68]'
              : 'bg-white border-[#E3ECE7] hover:border-[#C3EEDC] hover:bg-[#F5F8F6] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#4D6158]">പ്രിയപ്പെട്ടവ (Favorites)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17221D] font-sans">
            {favoriteProducts.length}
          </div>
          <div className="text-[11px] text-[#66756E] mt-0.5">സേവ് ചെയ്ത ഉൽപ്പന്നങ്ങൾ</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#E8F5EE] border-[#0B8F68] shadow-sm ring-1 ring-[#0B8F68]'
              : 'bg-white border-[#E3ECE7] hover:border-[#C3EEDC] hover:bg-[#F5F8F6] shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#4D6158]">പ്രൊഫൈൽ വിവരങ്ങൾ</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-[#0B8F68] flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-black text-[#17221D] truncate">
            {userName.split(' ')[0]}
          </div>
          <div className="text-[11px] text-[#66756E] mt-0.5">അക്കൗണ്ട് ക്രമീകരണങ്ങൾ</div>
        </button>
      </div>

      {/* 3. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#E3ECE7] pb-1 font-malayalam">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-white border-t-2 border-t-[#0B8F68] border-x border-[#E3ECE7] text-[#063B2A] -mb-1.5'
              : 'text-[#66756E] hover:text-[#17221D]'
          }`}
        >
          <UserIcon className="w-4 h-4 text-[#0B8F68]" />
          <span>പ്രൊഫൈൽ (Profile)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-white border-t-2 border-t-[#0B8F68] border-x border-[#E3ECE7] text-[#063B2A] -mb-1.5'
              : 'text-[#66756E] hover:text-[#17221D]'
          }`}
        >
          <Package className="w-4 h-4 text-[#0B8F68]" />
          <span>ഓർഡറുകൾ ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lists')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'lists'
              ? 'bg-white border-t-2 border-t-[#0B8F68] border-x border-[#E3ECE7] text-[#063B2A] -mb-1.5'
              : 'text-[#66756E] hover:text-[#17221D]'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#0B8F68]" />
          <span>സേവ് ചെയ്ത ലിസ്റ്റുകൾ ({consumerData?.savedLists?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-white border-t-2 border-t-[#0B8F68] border-x border-[#E3ECE7] text-[#063B2A] -mb-1.5'
              : 'text-[#66756E] hover:text-[#17221D]'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>പ്രിയപ്പെട്ടവ ({favoriteProducts.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="space-y-6">

        {/* TAB 1: PROFILE OVERVIEW */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Details Box */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E3ECE7] shadow-2xs space-y-6 font-sans">
              <div className="border-b border-[#F0F4F2] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
                    അക്കൗണ്ട് വിവരങ്ങൾ (Account Information)
                  </h3>
                  <p className="text-xs text-[#66756E] mt-0.5">
                    നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളും കോൺടാക്റ്റ് വിശദാംശങ്ങളും.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7]">
                  <div className="text-[11px] font-bold text-[#66756E] uppercase tracking-wider">പേര് (Name)</div>
                  <div className="text-sm font-black text-[#17221D] mt-1">{userName}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7]">
                  <div className="text-[11px] font-bold text-[#66756E] uppercase tracking-wider">ഇമെയിൽ (Email)</div>
                  <div className="text-sm font-black text-[#17221D] mt-1">{userEmail}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7]">
                  <div className="text-[11px] font-bold text-[#66756E] uppercase tracking-wider">ഫോൺ നമ്പർ (Phone)</div>
                  <div className="text-sm font-black text-[#17221D] mt-1">{authUser?.phone || 'ചേർത്തിട്ടില്ല'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7]">
                  <div className="text-[11px] font-bold text-[#66756E] uppercase tracking-wider">അക്കൗണ്ട് തരം (Account Role)</div>
                  <div className="text-sm font-black text-[#0B8F68] mt-1 flex items-center gap-1 font-malayalam">
                    <span>ഉപഭോക്താവ് (Consumer)</span>
                  </div>
                </div>
              </div>

              {/* Delivery Area Card */}
              <div className="p-5 rounded-2xl bg-[#E8F5EE] border border-[#C3EEDC] flex items-center justify-between gap-4 font-malayalam">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0B8F68] text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#063B2A]">സജീവമായ ഷോപ്പിംഗ് ലൊക്കേഷൻ</div>
                    <div className="text-base font-extrabold text-[#17221D]">{locationName}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="px-4 py-2 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  മാറ്റുക (Change)
                </button>
              </div>
            </div>

            {/* Quick Actions Side Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3ECE7] shadow-2xs space-y-4 font-malayalam h-fit">
              <h3 className="text-sm font-extrabold text-[#17221D] border-b border-[#F0F4F2] pb-2 m-0">
                ദ്രുത പ്രവർത്തനങ്ങൾ (Quick Links)
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F8F6] border border-transparent hover:border-[#E3ECE7] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#0B8F68]" />
                    <span className="text-xs font-bold text-[#17221D]">മുൻകൂട്ടി ബുക്കിംഗുകൾ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('lists')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F8F6] border border-transparent hover:border-[#E3ECE7] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-[#0B8F68]" />
                    <span className="text-xs font-bold text-[#17221D]">ഷോപ്പിംഗ് ലിസ്റ്റുകൾ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F8F6] border border-transparent hover:border-[#E3ECE7] transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-[#17221D]">പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <div className="border-t border-[#F0F4F2] pt-2">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold">അക്കൗണ്ട് ലോഗ് ഔട്ട് ചെയ്യുക</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS & PRE-BOOKINGS */}
        {activeTab === 'orders' && (
          <div className="space-y-5 font-sans">
            {/* Top Bar: Title & Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight m-0 font-sans">
                  My Orders & Pre-Bookings
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-malayalam">
                  നിങ്ങൾ അടുത്തുള്ള സൂപ്പർമാർക്കറ്റുകളിൽ ബുക്ക് ചെയ്ത സാധനങ്ങളുടെ തത്സമയ സ്റ്റാറ്റസ്.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadBookings()}
                disabled={isLoadingBookings}
                className="p-2.5 text-[#0D6344] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    orderFilterStatus === 'all'
                      ? 'bg-[#0D6344] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Orders ({bookings.length})
                </button>

                <button
                  type="button"
                  onClick={() => setOrderFilterStatus('pending')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    orderFilterStatus === 'pending'
                      ? 'bg-[#0D6344] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  In Progress ({pendingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setOrderFilterStatus('approved')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    orderFilterStatus === 'approved'
                      ? 'bg-[#0D6344] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Ready for Pickup ({readyCount})
                </button>

                <button
                  type="button"
                  onClick={() => setOrderFilterStatus('completed')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    orderFilterStatus === 'completed'
                      ? 'bg-[#0D6344] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>

              {/* Order Search Input */}
              <div className="relative sm:w-64">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Order Search"
                  className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D6344] focus:ring-1 focus:ring-[#0D6344] shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Content Feed */}
            {isLoadingBookings ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
                <div className="w-8 h-8 border-3 border-[#0D6344] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-malayalam">ബുക്കിംഗുകൾ ലഭ്യമാക്കുന്നു...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-2xs p-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0D6344] border border-emerald-100 flex items-center justify-center mx-auto text-3xl shadow-2xs">
                  📦
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-malayalam">
                    {orderSearchQuery ? 'ഓർഡറുകൾ കണ്ടെത്തിയില്ല' : 'നിലവിൽ സജീവമായ ബുക്കിംഗുകൾ ഒന്നുമില്ല'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-malayalam">
                    {orderSearchQuery
                      ? `"${orderSearchQuery}" എന്നതിന് അനുയോജ്യമായ ഓർഡറുകൾ ലഭ്യമല്ല.`
                      : 'സാധനങ്ങൾ തെരഞ്ഞെടുത്ത് അടുത്തുള്ള കടകളിൽ മുൻകൂട്ടി ബുക്ക് ചെയ്യുക. മികച്ച വിലയും ലാഭവും നേടൂ.'}
                  </p>
                </div>
                {onGoShopping && (
                  <button
                    type="button"
                    onClick={onGoShopping}
                    className="px-5 py-2.5 bg-[#0D6344] hover:bg-[#084D37] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors font-malayalam shadow-xs"
                  >
                    ഷോപ്പിംഗ് ആരംഭിക്കുക
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all p-4 space-y-3.5 flex flex-col justify-between"
                  >
                    {/* Header Row: Store Icon + Store Name + Date + Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#0D6344] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm font-black text-slate-900 truncate m-0 font-sans">
                            {booking.shopName}
                          </h3>
                          <span className="text-xs text-slate-400 font-sans shrink-0">
                            {formatOrderDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>

                    {/* Items Thumbnails Row */}
                    <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar py-1">
                      {booking.items.map((item, idx) => {
                        const matchedProduct = products.find(
                          (p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase()
                        );
                        return (
                          <div
                            key={idx}
                            className="shrink-0 w-24 bg-[#F8FAF9] border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between shadow-2xs text-center relative"
                          >
                            {/* Quantity Badge on Top-Right */}
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-200/90 text-slate-700 font-bold text-[9px] flex items-center justify-center font-sans">
                              {item.quantity}
                            </span>

                            {/* Thumbnail */}
                            <div className="w-full aspect-square flex items-center justify-center p-1 my-1 overflow-hidden">
                              <ProductImage
                                productId={item.productId}
                                image={(item as any).image || matchedProduct?.image}
                                emoji={item.emoji || matchedProduct?.emoji || '📦'}
                                alt={item.productName}
                                className="w-full h-full flex items-center justify-center"
                                imgClassName="max-h-full max-w-full object-contain"
                                fallbackEmojiClassName="text-2xl"
                              />
                            </div>

                            {/* Title & Price */}
                            <div className="pt-1 border-t border-slate-200/60">
                              <div className="text-[10px] font-bold text-slate-800 truncate font-sans" title={item.productName}>
                                {item.productName}
                              </div>
                              <div className="text-[10px] font-black text-slate-900 font-sans mt-0.5">
                                ₹{item.lineTotal || (item.unitPrice ? item.unitPrice * item.quantity : 125)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer: Total Amount + Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium font-sans">Order total</div>
                        <div className="text-base font-black text-slate-900 font-sans">
                          ₹{booking.totalAmount}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-sans flex-wrap">
                        {onOpenChat && (
                          <button
                            type="button"
                            onClick={() => onOpenChat(booking.shopName)}
                            className="px-3 py-1.5 bg-[#0D6344] hover:bg-[#084D37] active:scale-95 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat with Store</span>
                          </button>
                        )}

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.shopName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-slate-500" />
                          <span>Directions</span>
                        </a>

                        {booking.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingBookingId === booking.id}
                            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                          >
                            {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED LISTS */}
        {activeTab === 'lists' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E3ECE7] shadow-2xs space-y-4 font-sans">
            <div className="border-b border-[#F0F4F2] pb-3">
              <h3 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
                സേവ് ചെയ്ത ഷോപ്പിംഗ് ലിസ്റ്റുകൾ (Saved Shopping Lists)
              </h3>
              <p className="text-xs text-[#66756E] mt-0.5">
                നിങ്ങൾ പതിവായി വാങ്ങുന്ന സാധനങ്ങളുടെ ലിസ്റ്റുകൾ ഒറ്റ ക്ലിക്കിൽ ബാസ്കറ്റിലേക്ക് ചേർക്കാം.
              </p>
            </div>

            {(!consumerData?.savedLists || consumerData.savedLists.length === 0) ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto text-2xl">
                  📋
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#17221D] font-malayalam">
                    സേവ് ചെയ്ത ലിസ്റ്റുകൾ ഒന്നുമില്ല
                  </h4>
                  <p className="text-xs text-[#66756E] max-w-md mx-auto mt-1 font-malayalam">
                    ബാസ്കറ്റിൽ സാധനങ്ങൾ ചേർത്ത ശേഷം "സേവ് ലിസ്റ്റ്" അമർത്തി ഭാവിയിലെ ഓർഡറുകൾക്കായി സൂക്ഷിക്കാം.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-malayalam">
                {consumerData.savedLists.map((list) => (
                  <div
                    key={list.id}
                    className="p-5 bg-white border border-[#E3ECE7] hover:border-[#C3EEDC] rounded-2xl transition-all shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-[#17221D] font-sans truncate m-0">
                          {list.name}
                        </h4>
                        <span className="text-[11px] font-bold bg-[#E8F5EE] text-[#0B8F68] px-2 py-0.5 rounded-full font-sans">
                          {list.items.length} സാധനങ്ങൾ
                        </span>
                      </div>
                      <div className="text-[10px] text-[#66756E] font-sans mt-1">
                        സൃഷ്ടിച്ചത്: {new Date(list.createdAt).toLocaleDateString('ml-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F0F4F2]">
                      <button
                        type="button"
                        onClick={() => onLoadListIntoBasket(list)}
                        className="flex-1 py-2 px-3 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ബാസ്കറ്റിൽ ചേർക്കുക</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteList(list.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-3xl p-6 border border-[#E3ECE7] shadow-2xs space-y-4 font-sans">
            <div className="border-b border-[#F0F4F2] pb-3">
              <h3 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">
                പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ (Favorite Items)
              </h3>
              <p className="text-xs text-[#66756E] mt-0.5">
                നിങ്ങൾ ഹൃദയചിഹ്നം നൽകി അടയാളപ്പെടുത്തിയ ഉൽപ്പന്നങ്ങൾ.
              </p>
            </div>

            {favoriteProducts.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
                  ❤️
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#17221D] font-malayalam">
                    പ്രിയപ്പെട്ട ഉൽപ്പന്നങ്ങൾ ഒന്നും ചേർത്തിട്ടില്ല
                  </h4>
                  <p className="text-xs text-[#66756E] max-w-md mx-auto mt-1 font-malayalam">
                    ഉൽപ്പന്നങ്ങളിലെ ❤️ ചിഹ്നത്തിൽ ക്ലിക്ക് ചെയ്ത് അവ നിങ്ങളുടെ പ്രിയപ്പെട്ടവയിലേക്ക് ചേർക്കാം.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {favoriteProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-white border border-[#E3ECE7] hover:border-[#C3EEDC] rounded-2xl transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="w-full h-28 bg-[#F5F8F6] rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden relative">
                        <ProductImage
                          image={prod.image}
                          emoji={prod.emoji}
                          alt={prod.name}
                          className="w-full h-full"
                          imgClassName="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(prod.id)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-xs hover:bg-rose-50 cursor-pointer"
                          title="Remove Favorite"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-[#17221D] line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>
                      <div className="text-[10px] text-[#66756E] mt-0.5">
                        {prod.defaultUnit}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#F0F4F2] flex items-center justify-between">
                      <span className="text-xs font-black text-[#0B8F68] font-sans">
                        ₹{Object.values(prod.prices || {})[0] || 50}
                      </span>

                      <button
                        type="button"
                        onClick={() => onAddFavoriteToBasket(prod)}
                        className="px-2.5 py-1 bg-[#063B2A] hover:bg-[#0B8F68] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors font-malayalam flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>ചേർക്കുക</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
