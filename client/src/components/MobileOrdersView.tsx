import React, { useState, useEffect, useMemo } from 'react';
import { PreBooking, User, PreBookingStatus, Product } from '../types';
import { fetchPreBookingsApi, updatePreBookingStatusApi } from '../services/api';
import { ProductImage } from './ProductImage';
import {
  ArrowLeft,
  Search,
  Store,
  RefreshCw,
  MessageCircle,
  Navigation,
} from 'lucide-react';

interface MobileOrdersViewProps {
  authUser: User | null;
  onBack: () => void;
  onOpenChat?: (shopName: string) => void;
  onGoShopping?: () => void;
  products?: Product[];
}

export const MobileOrdersView: React.FC<MobileOrdersViewProps> = ({
  authUser,
  onBack,
  onOpenChat,
  onGoShopping,
  products = [],
}) => {
  const [bookings, setBookings] = useState<PreBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const loadBookings = async (silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchPreBookingsApi(authUser.token);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load pre-bookings:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [authUser?.token]);

  // Live polling every 5s for order status updates
  useEffect(() => {
    if (!authUser?.token) return;
    const interval = setInterval(() => {
      loadBookings(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [authUser?.token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!authUser?.token) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingBookingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'cancelled', undefined, authUser.token);
      await loadBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
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
      case 'cancelled':
      case 'rejected':
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

  // Filter & Search
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus === 'pending' && b.status !== 'pending') return false;
      if (filterStatus === 'approved' && b.status !== 'approved') return false;
      if (filterStatus === 'completed' && b.status !== 'completed') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchShop = b.shopName.toLowerCase().includes(q);
        const matchItems = b.items?.some((it) => it.productName.toLowerCase().includes(q));
        if (!matchShop && !matchItems) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const readyCount = bookings.filter((b) => b.status === 'approved').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-24 font-sans animate-in fade-in duration-150 px-3 pt-2">
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-xl text-slate-800 shadow-2xs transition-all cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight m-0 font-sans">
              My Orders & Pre-Bookings
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadBookings()}
          disabled={isLoading}
          className="p-2 text-[#0D6344] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer shrink-0"
          title="Refresh orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. FILTER PILLS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#0D6344] text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Orders ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            filterStatus === 'pending'
              ? 'bg-[#0D6344] text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          In Progress ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('approved')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-[#0D6344] text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Ready for Pickup ({readyCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-[#0D6344] text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* 3. SEARCH INPUT */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Order Search"
          className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0D6344] focus:ring-1 focus:ring-[#0D6344] shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 4. ORDERS FEED */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
          <div className="w-8 h-8 border-3 border-[#0D6344] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-malayalam">ഓർഡറുകൾ ലഭ്യമാക്കുന്നു...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-12 px-6 text-center space-y-3.5 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0D6344] border border-emerald-100 flex items-center justify-center mx-auto text-2xl shadow-2xs">
            📦
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 font-malayalam m-0">
              {searchQuery ? 'ഓർഡറുകൾ കണ്ടെത്തിയില്ല' : 'സജീവമായ ഓർഡറുകൾ ഇല്ല'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-malayalam">
              {searchQuery
                ? `"${searchQuery}" എന്നതിന് അനുയോജ്യമായ ഓർഡറുകൾ ലഭ്യമല്ല.`
                : 'നിങ്ങൾ മുൻകൂട്ടി ബുക്ക് ചെയ്ത ഓർഡറുകളുടെ തത്സമയ സ്റ്റാറ്റസ് ഇവിടെ കാണാം.'}
            </p>
          </div>
          {onGoShopping && (
            <button
              type="button"
              onClick={onGoShopping}
              className="py-2.5 px-5 bg-[#0D6344] hover:bg-[#084D37] text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 font-malayalam shadow-xs"
            >
              ഷോപ്പിംഗ് ആരംഭിക്കുക
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:shadow-xs space-y-3 p-4"
            >
              {/* Card Header: Store Icon + Store Name + Date + Status Badge */}
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
              <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-1">
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
  );
};
