import React, { useState, useEffect } from 'react';
import { PreBooking, User, PreBookingStatus, Shop } from '../types';
import { fetchPreBookingsApi, updatePreBookingStatusApi } from '../services/api';
import { formatChatDateTime } from './ConsumerChatModal';
import { ProductImage } from './ProductImage';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Store,
  Calendar,
  ShoppingBag,
  RefreshCw,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
} from 'lucide-react';

interface ConsumerPreBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: User | null;
  shops?: Shop[];
  onOpenChat?: (shopName: string) => void;
}

export const ConsumerPreBookingsModal: React.FC<ConsumerPreBookingsModalProps> = ({
  isOpen,
  onClose,
  authUser,
  shops = [],
  onOpenChat,
}) => {
  if (!isOpen) return null;

  const [bookings, setBookings] = useState<PreBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const loadBookings = async (silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchPreBookingsApi(authUser.token);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load pre-bookings:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [authUser?.token]);

  // Auto-poll every 3s for live updates
  useEffect(() => {
    if (!authUser?.token) return;
    const interval = setInterval(() => {
      loadBookings(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [authUser?.token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!authUser?.token) return;
    if (!confirm('Are you sure you want to cancel this pending pre-booking request?')) return;

    setIsUpdatingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'cancelled', undefined, authUser.token);
      await loadBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel pre-booking');
    } finally {
      setIsUpdatingId(null);
    }
  };

  const getStatusBadge = (status: PreBookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>Pending Approval</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved & Packing</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Completed & Picked Up</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-900 border border-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined by Store</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative my-auto max-h-[94dvh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-4 sm:px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-600/30 border border-brand-400/30 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              📋
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-1.5 sm:gap-2">
                <span>My Pre-Booked Baskets</span>
                <span className="text-xs font-bold text-brand-300 bg-brand-900/60 px-2 py-0.5 rounded-full border border-brand-500/30">
                  {bookings.length}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300 truncate">
                Track real-time approval status and pickup details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold">
            {['all', 'pending', 'approved', 'completed', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl capitalize transition-all cursor-pointer text-xs active:scale-95 shrink-0 ${
                  filterStatus === st
                    ? 'bg-brand-600 text-white shadow-2xs font-extrabold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadBookings()}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Refresh bookings list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bookings List Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-3.5 flex-1 bg-[#fafbfa]">
          {isLoading && bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-xs gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
              <span>Loading your pre-booked baskets...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10 sm:py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl my-2 bg-white">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl mb-2">
                🛒
              </div>
              <b className="block text-xs sm:text-sm font-bold text-slate-dark mb-1">
                No {filterStatus !== 'all' ? filterStatus : ''} pre-bookings found
              </b>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Select products in your Smart Basket and tap <b>Pre-book Basket</b> to reserve items with your preferred store!
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const isExpanded = expandedBookingId === booking.id;
              const formattedDate = formatChatDateTime(booking.createdAt);
              const storeObj = shops.find(
                (s) => s.id === booking.shopId || s.name.toLowerCase() === booking.shopName.toLowerCase()
              );
              const shopPhone = storeObj?.phone;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all hover:border-brand-300 space-y-3"
                >
                  {/* Top Row: Store & Status */}
                  <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 flex items-center justify-center text-sm sm:text-base shrink-0 font-bold">
                        🏪
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-dark truncate">
                            {booking.shopName}
                          </span>
                          {shopPhone && (
                            <a
                              href={`tel:${shopPhone.replace(/[^0-9+]/g, '')}`}
                              className="p-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0B8F68] border border-emerald-200/80 transition-all shrink-0 active:scale-95"
                              title={`${booking.shopName} വിളിക്കുക (${shopPhone})`}
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 flex-wrap">
                          <span>Ref: {booking.id.slice(0, 8)}...</span>
                          <span>·</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">{getStatusBadge(booking.status)}</div>
                  </div>

                  {/* Booking Info Grid */}
                  <div className="bg-[#f5f8f3] rounded-xl p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">
                        Locked Total
                      </span>
                      <span className="font-black text-brand-700 text-xs sm:text-sm">
                        ₹{booking.totalAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">
                        Items / Units
                      </span>
                      <span className="font-bold text-slate-dark text-[11px] sm:text-xs">
                        {booking.itemCount} items ({booking.totalQuantity} units)
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">
                        Pickup Window
                      </span>
                      <span className="font-bold text-slate-dark text-[11px] sm:text-xs">
                        {booking.pickupTime || 'Today'}
                      </span>
                    </div>
                  </div>

                  {/* Order Notes / Instructions if any */}
                  {booking.notes && (
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-600">
                      <b className="text-[10px] uppercase text-gray-400 block mb-0.5">Your Note</b>
                      <span>{booking.notes}</span>
                    </div>
                  )}

                  {booking.merchantNote && (
                    <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900">
                      <b className="text-[10px] uppercase text-amber-700 block mb-0.5">Note from Merchant</b>
                      <span>{booking.merchantNote}</span>
                    </div>
                  )}

                  {/* Expandable Items List */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBookingId(isExpanded ? null : booking.id)
                      }
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {isExpanded ? 'Hide' : 'View'} {booking.itemCount} Reserved Items
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1 sm:gap-1.5 animate-in fade-in duration-150">
                        {booking.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-brand-200/80 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-dark shadow-2xs flex items-center gap-1.5"
                          >
                            <ProductImage
                              productId={it.productId}
                              emoji={it.emoji}
                              alt={it.productName}
                              className="w-3.5 h-3.5 shrink-0"
                              imgClassName="w-3.5 h-3.5 object-contain"
                              fallbackEmojiClassName="text-xs"
                            />
                            <span>{it.productName}</span>
                            <span className="text-gray-400 font-normal">
                              ({it.quantity} × {it.unit})
                            </span>
                            <span className="text-brand-700 font-bold">
                              ₹{it.lineTotal}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {shopPhone && (
                        <a
                          href={`tel:${shopPhone.replace(/[^0-9+]/g, '')}`}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#064E3B] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                          title={`${booking.shopName} കടയിലേക്ക് വിളിക്കുക (${shopPhone})`}
                        >
                          <Phone className="w-3.5 h-3.5 text-[#0B8F68]" />
                          <span>വിളിക്കുക</span>
                        </a>
                      )}

                      {onOpenChat && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenChat(booking.shopName);
                          }}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                          <span>Chat with Store</span>
                        </button>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={isUpdatingId === booking.id}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {isUpdatingId === booking.id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
