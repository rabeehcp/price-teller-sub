import React, { useState, useEffect, useMemo } from 'react';
import { Shop, PreBooking, PreBookingStatus } from '../types';
import { updateMerchantShopApi, updatePreBookingStatusApi } from '../services/api';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
  Save,
  RefreshCw,
  Phone,
  MessageSquare,
  Navigation,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  XCircle,
  Package,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Eye,
  Sliders,
  Send,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { ProductImage } from './ProductImage';

interface MerchantDeliveryWorkspaceProps {
  shop: Shop | undefined;
  token?: string;
  preBookings: PreBooking[];
  onShopUpdated: (updatedShop: Shop) => void;
  onPreBookingUpdated?: (updatedBooking: PreBooking) => void;
  onRefreshOrders?: () => void;
}

export const MerchantDeliveryWorkspace: React.FC<MerchantDeliveryWorkspaceProps> = ({
  shop,
  token,
  preBookings,
  onShopUpdated,
  onPreBookingUpdated,
  onRefreshOrders,
}) => {
  // Form State initialized from shop
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(
    shop?.isDeliveryAvailable ?? true
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(shop?.deliveryFee ?? 30);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(
    shop?.freeDeliveryThreshold ?? 500
  );
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(
    shop?.deliveryRadiusKm ?? 5
  );
  const [minDeliveryOrderAmount, setMinDeliveryOrderAmount] = useState<number>(
    shop?.minDeliveryOrderAmount ?? 100
  );
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>(
    shop?.estimatedDeliveryTime || '30 - 45 Mins'
  );
  const [deliveryHours, setDeliveryHours] = useState<string>(
    shop?.deliveryHours || '08:00 AM - 08:30 PM'
  );
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    shop?.deliveryNotes || 'Cash on Delivery and UPI available. Direct doorstep handover.'
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [saveErrorMsg, setSaveErrorMsg] = useState<string>('');

  // Order management filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivery-only' | 'pending' | 'out_for_delivery' | 'completed'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Sync state when shop prop updates
  useEffect(() => {
    if (shop) {
      setIsDeliveryAvailable(shop.isDeliveryAvailable ?? true);
      setDeliveryFee(shop.deliveryFee ?? 30);
      setFreeDeliveryThreshold(shop.freeDeliveryThreshold ?? 500);
      setDeliveryRadiusKm(shop.deliveryRadiusKm ?? 5);
      setMinDeliveryOrderAmount(shop.minDeliveryOrderAmount ?? 100);
      setEstimatedDeliveryTime(shop.estimatedDeliveryTime || '30 - 45 Mins');
      setDeliveryHours(shop.deliveryHours || '08:00 AM - 08:30 PM');
      setDeliveryNotes(
        shop.deliveryNotes || 'Cash on Delivery and UPI available. Direct doorstep handover.'
      );
    }
  }, [shop]);

  // Handle Save Settings
  const handleSaveSettings = async (overrideDeliveryState?: boolean) => {
    if (!token || !shop) return;
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const targetDeliveryAvailable =
      overrideDeliveryState !== undefined ? overrideDeliveryState : isDeliveryAvailable;

    try {
      const updated = await updateMerchantShopApi(
        {
          id: shop.id,
          isDeliveryAvailable: targetDeliveryAvailable,
          deliveryFee: Number(deliveryFee) || 0,
          freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
          deliveryRadiusKm: Number(deliveryRadiusKm) || 5,
          minDeliveryOrderAmount: Number(minDeliveryOrderAmount) || 0,
          estimatedDeliveryTime: estimatedDeliveryTime.trim(),
          deliveryHours: deliveryHours.trim(),
          deliveryNotes: deliveryNotes.trim(),
        },
        token
      );

      if (overrideDeliveryState !== undefined) {
        setIsDeliveryAvailable(overrideDeliveryState);
      }
      onShopUpdated(updated);
      setSaveSuccessMsg('ഡെലിവറി വിവരങ്ങൾ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു! (Delivery settings saved!)');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to save delivery settings');
      setTimeout(() => setSaveErrorMsg(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter Delivery Orders
  const deliveryOrders = useMemo(() => {
    return preBookings.filter((b) => {
      const isDelivery = b.fulfillmentType === 'delivery' || !!b.deliveryAddress;
      if (orderFilter === 'delivery-only') return isDelivery;
      if (orderFilter === 'pending') return isDelivery && b.status === 'pending';
      if (orderFilter === 'out_for_delivery') return isDelivery && (b.status === 'approved' || (b as any).status === 'out_for_delivery');
      if (orderFilter === 'completed') return isDelivery && b.status === 'completed';
      return true;
    });
  }, [preBookings, orderFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalDeliveries = preBookings.filter(
      (b) => b.fulfillmentType === 'delivery' || !!b.deliveryAddress
    );
    const pendingDeliveries = totalDeliveries.filter((b) => b.status === 'pending');
    const activeDispatch = totalDeliveries.filter((b) => b.status === 'approved');
    const completedDeliveries = totalDeliveries.filter((b) => b.status === 'completed');
    const totalDeliveryRevenue = completedDeliveries.reduce(
      (acc, b) => acc + (b.totalAmount || 0),
      0
    );

    return {
      total: totalDeliveries.length,
      pending: pendingDeliveries.length,
      activeDispatch: activeDispatch.length,
      completed: completedDeliveries.length,
      revenue: totalDeliveryRevenue,
    };
  }, [preBookings]);

  // Handle Order Status change
  const handleUpdateOrderStatus = async (bookingId: string, nextStatus: PreBookingStatus) => {
    if (!token) return;
    setUpdatingOrderId(bookingId);
    try {
      const updated = await updatePreBookingStatusApi(bookingId, nextStatus, undefined, token);
      if (onPreBookingUpdated) onPreBookingUpdated(updated);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper: Open WhatsApp for delivery dispatch
  const openWhatsAppDispatch = (booking: PreBooking) => {
    if (!booking.consumerPhone) return;
    const cleanPhone = booking.consumerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `നമസ്കാരം! ${shop?.name || 'നമ്മുടെ കടയിൽ'} നിന്നുള്ള താങ്കളുടെ ഹോം ഡെലിവറി ഓർഡർ (#${booking.id}) തയ്യാറായിട്ടുണ്ട്.\n\n` +
      `📦 സാധനങ്ങൾ: ${booking.itemCount} എണ്ണം\n` +
      `💵 തുക: ₹${booking.totalAmount}\n` +
      `📍 ഡെലിവറി വിലാസം: ${booking.deliveryAddress || 'കസ്റ്റമർ വിലാസം'}\n\n` +
      `ഞങ്ങളുടെ ഡെലിവറി എക്സിക്യൂട്ടീവ് ഉടൻ എത്തിച്ചേരും. നന്ദി!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-[#063B2A] via-[#0D6344] to-[#10A978] rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 text-7xl opacity-10 select-none pointer-events-none">
          🚚
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Delivery Management Hub
              </span>
              <span className="text-xs text-emerald-200 font-malayalam">
                ഹോം ഡെലിവറി സർവീസ്
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {shop?.name || 'Store'} Delivery Controls
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              തീരുമാനിക്കുക നിങ്ങളുടെ കടയിൽ നിന്ന് വീടുകളിലേക്ക് സാധനങ്ങൾ എത്തിച്ചു നൽകണോ വേണ്ടയോ എന്ന്. 
              (Choose whether your store accepts Home Delivery orders, set fees, delivery zones, and track real-time dispatches).
            </p>
          </div>

          {/* Master Delivery Opt-in Toggle */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-inner">
            <div>
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                {isDeliveryAvailable ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> ഡെലിവറി ലഭ്യമാണ് (ACTIVE)
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> താൽക്കാലികമായി നിർത്തി (PAUSED)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-emerald-100 font-medium">
                {isDeliveryAvailable
                  ? 'Shoppers can place home delivery orders'
                  : 'Only Store Pickup available to shoppers'}
              </div>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSettings(!isDeliveryAvailable)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isDeliveryAvailable ? 'bg-emerald-400' : 'bg-gray-400'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isDeliveryAvailable ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Delivery Status */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECE6DA] shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E5E]">
              Delivery Status
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDeliveryAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-lg sm:text-xl font-black ${
              isDeliveryAvailable ? 'text-[#0D6344]' : 'text-amber-700'
            }`}>
              {isDeliveryAvailable ? 'Enabled' : 'Disabled'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {isDeliveryAvailable ? 'Live on app' : 'Pickup only'}
            </span>
          </div>
          <p className="text-[11px] text-[#7C6E5E] font-malayalam mt-1">
            {isDeliveryAvailable ? 'ഉപഭോക്താക്കൾക്ക് ഓർഡർ ചെയ്യാം' : 'കടയിൽ നേരിട്ടെത്തി വാങ്ങൽ മാത്രം'}
          </p>
        </div>

        {/* Card 2: Active Dispatch Queue */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECE6DA] shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E5E]">
              Active Deliveries
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-800">
              {stats.pending + stats.activeDispatch} Orders
            </span>
            {stats.pending > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                {stats.pending} New
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7C6E5E] font-malayalam mt-1">
            {stats.pending} പെൻഡിങ് · {stats.activeDispatch} വഴിയിലാണ്
          </p>
        </div>

        {/* Card 3: Base Delivery Fee & Free Tier */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECE6DA] shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E5E]">
              Delivery Fee
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D6344] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-800">
              ₹{deliveryFee}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
              Free @ ₹{freeDeliveryThreshold}+
            </span>
          </div>
          <p className="text-[11px] text-[#7C6E5E] font-malayalam mt-1">
            ₹{freeDeliveryThreshold} ന് മുകളിൽ ഫ്രീ ഡെലിവറി
          </p>
        </div>

        {/* Card 4: Delivery Radius & ETA */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECE6DA] shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E5E]">
              Radius & Speed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-800">
              {deliveryRadiusKm} KM
            </span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-md">
              {estimatedDeliveryTime}
            </span>
          </div>
          <p className="text-[11px] text-[#7C6E5E] font-malayalam mt-1">
            പരമാവധി പരിധി {deliveryRadiusKm} കി.മീ
          </p>
        </div>
      </div>

      {/* Main Grid: Left Side Settings Studio / Right Side Live Customer App Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Detailed Settings Studio */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE6DA] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0D6344]" />
                  <span>Delivery Pricing & Configuration Studio</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  നിങ്ങളുടെ ഡെലിവറി ചാർജ്ജുകളും നിബന്ധനകളും ക്രമീകരിക്കുക
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                className="px-4 py-2 bg-[#0D6344] hover:bg-[#063B2A] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Settings</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {saveErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* Delivery Availability Toggle Card */}
            <div className="bg-[#FAF8F5] border border-[#ECE6DA] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-xs font-black text-slate-800 block">
                  Enable Home Delivery for Shoppers
                </label>
                <p className="text-[11px] text-[#7C6E5E]">
                  സ്വിച്ച് ഓഫ് ചെയ്താൽ ഉപഭോക്താക്കൾക്ക് സ്റ്റോർ പിക്കപ്പ് മാത്രമേ കാണിക്കൂ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryAvailable(!isDeliveryAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isDeliveryAvailable ? 'bg-[#10A978]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDeliveryAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Standard Delivery Fee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Standard Delivery Fee (₹)</span>
                  <span className="text-[10px] text-gray-400 font-malayalam">ഡെലിവറി ചാർജ്</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Field: Free Delivery Threshold */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Free Delivery Threshold (₹)</span>
                  <span className="text-[10px] text-emerald-600 font-bold font-malayalam">സൗജന്യ ഡെലിവറി</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Field: Min Order Value for Delivery */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Minimum Order Value (₹)</span>
                  <span className="text-[10px] text-gray-400 font-malayalam">കുറഞ്ഞ തുക</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={minDeliveryOrderAmount}
                    onChange={(e) => setMinDeliveryOrderAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Field: Delivery Radius in KM */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Max Delivery Radius (KM)</span>
                  <span className="text-[10px] text-gray-400 font-malayalam">പരമാവധി ദൂരം</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                    placeholder="5"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    KM
                  </span>
                </div>
              </div>

              {/* Field: Estimated Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Estimated Delivery Time</span>
                  <span className="text-[10px] text-gray-400 font-malayalam">എത്തിക്കുന്ന സമയം</span>
                </label>
                <input
                  type="text"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                  placeholder="30 - 45 Mins / Within 1 Hour"
                />
              </div>

              {/* Field: Delivery Hours */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Delivery Operating Hours</span>
                  <span className="text-[10px] text-gray-400 font-malayalam">പ്രവർത്തന സമയം</span>
                </label>
                <input
                  type="text"
                  value={deliveryHours}
                  onChange={(e) => setDeliveryHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                  placeholder="08:00 AM - 08:30 PM"
                />
              </div>
            </div>

            {/* Notes & Special Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Customer Delivery Instructions & Notes</span>
                <span className="text-[10px] text-gray-400 font-malayalam">പ്രത്യേക അറിയിപ്പുകൾ</span>
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-slate-800 focus:border-[#0D6344] focus:outline-none transition-colors"
                placeholder="e.g. Free delivery on orders above ₹500 within 5km radius. Pay via GooglePay / Cash upon delivery."
              />
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#0D6344] hover:bg-[#063B2A] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Delivery Configuration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Customer App Preview Simulation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-b from-[#1F1A14] to-[#2D261E] rounded-3xl p-5 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black tracking-wide uppercase text-gray-200">
                  Live Shopper App Preview
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Real-Time View
              </span>
            </div>

            <p className="text-[11px] text-gray-300">
              This is how your store badge and checkout banner appear to customers in your area:
            </p>

            {/* Mock Shopper Card */}
            <div className="bg-white rounded-2xl p-4 text-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#0D6344] flex items-center justify-center font-black text-sm">
                    🏪
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{shop?.name || 'Your Store'}</h4>
                    <span className="text-[10px] text-gray-500">⭐ {shop?.rating || 4.8} · {shop?.address || 'Main Road'}</span>
                  </div>
                </div>

                {isDeliveryAvailable ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    Delivery Available
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 border border-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    🏪 Pickup Only
                  </span>
                )}
              </div>

              {/* Free Delivery Meter Preview */}
              {isDeliveryAvailable && (
                <div className="bg-[#FAF8F5] border border-[#ECE6DA] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-[#0D6344] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Free Delivery at ₹{freeDeliveryThreshold}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      Standard: ₹{deliveryFee}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#10A978] rounded-full transition-all duration-300"
                      style={{ width: '65%' }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Add ₹150 more in basket to unlock <b>100% Free Home Delivery!</b>
                  </p>
                </div>
              )}

              {/* Delivery Specs Row */}
              {isDeliveryAvailable ? (
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Speed:</span>
                    <span className="font-bold text-slate-800">⚡ {estimatedDeliveryTime}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Coverage:</span>
                    <span className="font-bold text-slate-800">📍 Up to {deliveryRadiusKm} KM</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  🔒 ഈ കടയിൽ നിലവിൽ നേരിട്ടെത്തി വാങ്ങൽ (Store Pickup) മാത്രമേ ലഭ്യമായിട്ടുള്ളൂ.
                </div>
              )}
            </div>

            {/* Helpful Merchant Tip */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-gray-300">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <b>Pro Tip:</b> Stores with active Home Delivery and low minimum order limits receive on average <b>3.4x more orders</b> on EnteBazaar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Home Delivery Dispatch Board & Order Tracker */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE6DA] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0D6344]" />
              <span>Live Delivery Dispatch Queue</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ഹോം ഡെലിവറി ഓർഡറുകൾ പരിശോധിക്കുക, വാട്സാപ്പ് വഴി അപ്‌ഡേറ്റ് അയക്കുക
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'delivery-only', label: '🚚 Deliveries' },
              { id: 'pending', label: '⏳ Pending' },
              { id: 'out_for_delivery', label: '🛵 Dispatched' },
              { id: 'completed', label: '✅ Delivered' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOrderFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderFilter === f.id
                    ? 'bg-[#0D6344] text-white shadow-xs'
                    : 'bg-[#F5F8F6] text-[#4A3F35] hover:bg-[#E8F5EE]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table / Cards */}
        {deliveryOrders.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-3 shadow-inner">
              🚚
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Delivery Orders Found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {orderFilter === 'all'
                ? 'When customers place home delivery orders for this store, they will appear here with live dispatch controls.'
                : 'No delivery orders matching this status filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryOrders.map((booking) => {
              const isDelivery = booking.fulfillmentType === 'delivery' || !!booking.deliveryAddress;
              const isUpdating = updatingOrderId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-[#ECE6DA] hover:border-[#0D6344]/50 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3.5 relative"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">
                          #{booking.id.slice(-6).toUpperCase()}
                        </span>
                        {isDelivery ? (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Home Delivery
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🏪 Store Pickup
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {booking.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending
                        </span>
                      )}
                      {booking.status === 'approved' && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Package className="w-3 h-3 text-blue-600" /> Dispatched
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                        </span>
                      )}
                      {booking.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl space-y-1.5 text-xs">
                    {booking.consumerPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" /> Contact Phone:
                        </span>
                        <a
                          href={`tel:${booking.consumerPhone}`}
                          className="font-bold text-[#0D6344] hover:underline"
                        >
                          {booking.consumerPhone}
                        </a>
                      </div>
                    )}

                    {isDelivery && (
                      <div className="pt-1 border-t border-[#ECE6DA]/70 space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Delivery Destination:
                            </span>
                            <p className="font-semibold text-slate-800 text-xs leading-snug">
                              {booking.deliveryAddress || 'Address not specified'}
                            </p>
                            {booking.deliveryLandmark && (
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Landmark: <b>{booking.deliveryLandmark}</b>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="text-[11px] text-gray-600 italic bg-white p-2 rounded-lg border border-gray-100">
                        "{booking.notes}"
                      </div>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Items ordered ({booking.itemCount || booking.items.length}):</span>
                      <span className="font-black text-slate-900">₹{booking.totalAmount}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {booking.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-medium text-slate-700"
                        >
                          <ProductImage
                            productId={it.productId}
                            emoji={it.emoji}
                            alt={it.productName}
                            className="w-3 h-3 shrink-0"
                            imgClassName="w-3 h-3 object-contain"
                            fallbackEmojiClassName="text-[10px]"
                          />
                          <span>{it.productName}</span>
                          <span className="text-gray-400">×{it.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    {/* WhatsApp notification button */}
                    {booking.consumerPhone && (
                      <button
                        type="button"
                        onClick={() => openWhatsAppDispatch(booking)}
                        className="px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Send WhatsApp update"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateOrderStatus(booking.id, 'rejected')}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateOrderStatus(booking.id, 'approved')}
                            className="px-3.5 py-1.5 bg-[#0D6344] hover:bg-[#063B2A] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                            <span>Dispatch</span>
                          </button>
                        </>
                      )}

                      {booking.status === 'approved' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateOrderStatus(booking.id, 'completed')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
