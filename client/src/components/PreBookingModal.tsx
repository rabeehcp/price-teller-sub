import React, { useState, useMemo } from 'react';
import { BasketItem, FullComparisonResponse, Shop, User, PreBooking, PreBookingItem } from '../types';
import { createPreBookingApi } from '../services/api';
import { ProductImage } from './ProductImage';
import {
  X,
  Clock,
  Store,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Info,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface PreBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  basketItems: BasketItem[];
  shops: Shop[];
  comparison: FullComparisonResponse | null;
  authUser: User | null;
  initialShopName?: string | null;
  onRequireAuth: () => void;
  onBookingSuccess?: (booking: PreBooking) => void;
  onOpenPreBookingsList?: () => void;
}

const PICKUP_OPTIONS = [
  { id: 'within-1-hour', label: '⚡ 1 മണിക്കൂറിനുള്ളിൽ (Within 1 hour)' },
  { id: 'today-evening', label: '🌆 ഇന്ന് വൈകുന്നേരം (5:00 PM – 8:00 PM)' },
  { id: 'tomorrow-morning', label: '🌅 നാളെ രാവിലെ (9:00 AM – 12:00 PM)' },
  { id: 'custom', label: '✏️ മറ്റൊരു സമയം തിരഞ്ഞെടുക്കുക...' },
];

export const PreBookingModal: React.FC<PreBookingModalProps> = ({
  isOpen,
  onClose,
  basketItems,
  shops,
  comparison,
  authUser,
  initialShopName,
  onRequireAuth,
  onBookingSuccess,
  onOpenPreBookingsList,
}) => {
  if (!isOpen) return null;

  // Selected store
  const defaultShopName =
    initialShopName ||
    comparison?.bestShopName ||
    shops[0]?.name ||
    'Green Mart';

  const [selectedShopName, setSelectedShopName] = useState<string>(defaultShopName);
  const [selectedPickupOption, setSelectedPickupOption] = useState<string>('within-1-hour');
  const [customPickupTime, setCustomPickupTime] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>(authUser?.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedBooking, setSubmittedBooking] = useState<PreBooking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentShop = shops.find((s) => s.name === selectedShopName) || shops[0];
  const comparisonShop = comparison?.shops.find((s) => s.shopName === selectedShopName);

  // Compute immutable snapshot for the chosen shop
  const snapshotItems: PreBookingItem[] = useMemo(() => {
    return basketItems.map((item) => {
      const minBasePrice = Math.min(...Object.values(item.product.prices || { '0': 50 }));
      const storePrice =
        item.product.prices && item.product.prices[selectedShopName] !== undefined
          ? item.product.prices[selectedShopName]
          : minBasePrice;
      const multiplier = item.product.unitMultiplier[item.selectedUnit] ?? 1;
      const unitPrice = Math.round(storePrice * multiplier);
      return {
        productId: item.productId,
        productName: item.product.name,
        emoji: item.product.emoji,
        quantity: item.quantity,
        unit: item.selectedUnit,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });
  }, [basketItems, selectedShopName]);

  const totalAmount = useMemo(() => {
    if (comparisonShop) return comparisonShop.total;
    return snapshotItems.reduce((acc, it) => acc + (it.lineTotal || 0), 0);
  }, [comparisonShop, snapshotItems]);

  const totalQuantity = useMemo(() => {
    return basketItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [basketItems]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      onRequireAuth();
      return;
    }

    if (snapshotItems.length === 0) {
      setErrorMsg('Your basket is empty. Please add items before pre-booking.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const pickupLabel =
      selectedPickupOption === 'custom'
        ? customPickupTime.trim() || 'Custom pickup time requested'
        : PICKUP_OPTIONS.find((p) => p.id === selectedPickupOption)?.label || 'Within 1 hour';

    try {
      const booking = await createPreBookingApi(
        {
          shopId: currentShop?.id || 'custom',
          shopName: selectedShopName,
          items: snapshotItems,
          itemCount: snapshotItems.length,
          totalQuantity,
          totalAmount,
          pickupTime: pickupLabel,
          notes: notes.trim() || undefined,
          consumerPhone: contactPhone.trim() || undefined,
          consumerEmail: authUser.email,
        },
        authUser.token
      );

      setSubmittedBooking(booking);
      if (onBookingSuccess) onBookingSuccess(booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit pre-booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative my-auto max-h-[94dvh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-brand-950 text-white p-4 sm:px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
              🛍️
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-1.5 sm:gap-2">
                <span>Pre-Book Basket</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                  Locked Price
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300 truncate">
                Reserve items with the merchant for hassle-free pickup
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-[#fafbfa]">
          {submittedBooking ? (
            /* Success View */
            <div className="text-center py-4 sm:py-6 px-2 sm:px-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl sm:text-3xl shadow-sm">
                ✅
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-dark">
                  Pre-Booking Request Sent!
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Your request has been forwarded to <b>{submittedBooking.shopName}</b>. The merchant will review and approve your order shortly.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-white border border-brand-200 rounded-2xl p-3.5 sm:p-4 text-left shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Booking Reference
                    </span>
                    <div className="font-mono text-xs font-black text-slate-dark">
                      {submittedBooking.id}
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700 animate-spin" /> Pending Approval
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px]">Store:</span>
                    <div className="font-bold text-slate-dark">{submittedBooking.shopName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Pickup Window:</span>
                    <div className="font-bold text-slate-dark">{submittedBooking.pickupTime || 'Within 1 hour'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Total Items:</span>
                    <div className="font-bold text-slate-dark">
                      {submittedBooking.itemCount} items ({submittedBooking.totalQuantity} units)
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Locked Amount:</span>
                    <div className="font-black text-brand-700 text-sm">
                      ₹{submittedBooking.totalAmount}
                    </div>
                  </div>
                </div>

                {/* Item List Preview */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {submittedBooking.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-[#f5f8f3] border border-brand-200/80 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-dark"
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
                      <span className="text-brand-700 font-bold">₹{it.lineTotal}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                {onOpenPreBookingsList && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPreBookingsList();
                    }}
                    className="w-full sm:flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>View My Pre-Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl sm:rounded-2xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Store Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-dark mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-brand-600" />
                    Select Store for Pickup
                  </span>
                  {currentShop?.isVerified && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Verified Partner
                    </span>
                  )}
                </label>
                <select
                  value={selectedShopName}
                  onChange={(e) => setSelectedShopName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl sm:rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-dark outline-none focus:border-brand-500 transition-colors cursor-pointer"
                >
                  {shops.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} {s.isVerified ? '✓' : ''} (⭐ {s.rating || 4.5})
                    </option>
                  ))}
                </select>
              </div>

              {/* Locked Snapshot Card */}
              <div className="bg-white border border-brand-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-xs text-slate-dark">
                    <span>🛒 Basket Snapshot</span>
                    <span className="text-[10px] font-normal text-gray-500">
                      ({snapshotItems.length} items · {totalQuantity} units)
                    </span>
                  </div>
                  <div className="text-sm font-black text-brand-700">
                    ₹{totalAmount}
                  </div>
                </div>

                {/* Items tags list */}
                <div className="flex flex-wrap gap-1 max-h-28 sm:max-h-32 overflow-y-auto">
                  {snapshotItems.map((it) => (
                    <span
                      key={it.productId}
                      className="inline-flex items-center gap-1.5 bg-[#f5f8f3] border border-brand-200/70 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-dark"
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
                      <span className="text-brand-700 font-bold">₹{it.lineTotal}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-2 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <b>Price Lock Guarantee:</b> Prices above are locked for this booking.
                  </span>
                </div>
              </div>

              {/* Pickup Time Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-dark mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  Preferred Pickup Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PICKUP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPickupOption(opt.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        selectedPickupOption === opt.id
                          ? 'bg-brand-50 border-brand-600 text-brand-900 shadow-2xs font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {selectedPickupOption === 'custom' && (
                  <input
                    type="text"
                    value={customPickupTime}
                    onChange={(e) => setCustomPickupTime(e.target.value)}
                    placeholder="e.g. Today around 6:30 PM after work"
                    className="mt-2 w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-dark outline-none focus:border-brand-500"
                    required
                  />
                )}
              </div>

              {/* Contact Phone & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-dark mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" /> Contact Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-dark outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-dark mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-gray-400" /> Notes for Store (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ripe bananas please"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-dark outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || snapshotItems.length === 0}
                  className="w-full py-3 sm:py-3.5 min-h-[46px] bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Pre-Booking...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Confirm Pre-Booking (Pay ₹{totalAmount} at Store)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
