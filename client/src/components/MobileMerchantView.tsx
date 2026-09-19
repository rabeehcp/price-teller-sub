import React, { useState } from 'react';
import { Product, Shop, User, PreBooking, DailySalesSummary, MerchantSale } from '../types';
import {
  Menu,
  Store,
  TrendingUp,
  Package,
  Tag,
  Zap,
  ShoppingBag,
  Clock,
  MessageCircle,
  PlusCircle,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  Crown,
  Receipt,
  CalendarCheck,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface MobileMerchantViewProps {
  authUser: User | null;
  selectedShopName: string;
  shops: Shop[];
  products: Product[];
  preBookings?: PreBooking[];
  todaySummary?: DailySalesSummary | null;
  salesList?: MerchantSale[];
  onOpenDrawer: () => void;
  onBackToShopper: () => void;
  onNavigateTab: (tab: 'inventory' | 'billing' | 'prebookings' | 'chats' | 'profile' | 'deals') => void;
  onOpenAddProduct: () => void;
  onOpenSubscriptionPaywall?: () => void;
  preBookingsCount?: number;
}

export const MobileMerchantView: React.FC<MobileMerchantViewProps> = ({
  authUser,
  selectedShopName,
  shops,
  products,
  preBookings = [],
  todaySummary = null,
  salesList = [],
  onOpenDrawer,
  onBackToShopper,
  onNavigateTab,
  onOpenAddProduct,
  onOpenSubscriptionPaywall,
  preBookingsCount = 0,
}) => {
  const [chartDays, setChartDays] = useState<'7' | '30'>('7');

  const currentShop = shops.find((s) => s.name.toLowerCase() === selectedShopName.toLowerCase());
  const carriedProducts = products.filter(
    (p) => p.prices && typeof p.prices[selectedShopName] === 'number' && p.prices[selectedShopName] > 0
  );
  const shopProductsCount = carriedProducts.length;

  const todayStr = new Date().toISOString().substring(0, 10);

  // 1. Real Today's Sales from POS bills + confirmed/completed pre-orders
  const todayPosSales = todaySummary?.totalSalesAmount || 0;
  const todayCompletedBookings = preBookings.filter(
    (b) =>
      (b.status === 'completed' || b.status === 'approved') &&
      b.createdAt &&
      b.createdAt.substring(0, 10) === todayStr
  );
  const todayBookingSales = todayCompletedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalTodaySales = todayPosSales + todayBookingSales;
  const todayTransactionsCount = (todaySummary?.totalBills || 0) + todayCompletedBookings.length;

  // 2. Real Orders (Pre-bookings & pending queue)
  const allBookings = preBookings;
  const pendingBookings = allBookings.filter((b) => b.status === 'pending');
  const totalBookingsCount = allBookings.length;

  // 3. Real Period Sales Trend (7 days or 30 days)
  const daysCount = chartDays === '7' ? 7 : 30;
  const dailyBuckets: { dateStr: string; label: string; amount: number; count: number }[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const label =
      daysCount === 7
        ? d.toLocaleDateString('en-IN', { weekday: 'short' })
        : `${d.getDate()}/${d.getMonth() + 1}`;
    dailyBuckets.push({ dateStr, label, amount: 0, count: 0 });
  }

  salesList.forEach((s) => {
    const sDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
    const bucket = dailyBuckets.find((b) => b.dateStr === sDate);
    if (bucket) {
      bucket.amount += s.totalAmount || 0;
      bucket.count += 1;
    }
  });

  allBookings.forEach((b) => {
    if (b.status === 'completed' || b.status === 'approved') {
      const bDate = b.createdAt ? b.createdAt.substring(0, 10) : '';
      const bucket = dailyBuckets.find((item) => item.dateStr === bDate);
      if (bucket) {
        bucket.amount += b.totalAmount || 0;
        bucket.count += 1;
      }
    }
  });

  const periodTotal = dailyBuckets.reduce((sum, b) => sum + b.amount, 0);
  const maxDailyAmount = Math.max(...dailyBuckets.map((b) => b.amount), 0);

  return (
    <div className="md:hidden space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToShopper}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-xl text-slate-800 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            title="കസ്റ്റമർ സ്റ്റോറിലേക്ക് മടങ്ങുക (Back to Customer Store)"
            aria-label="Back to Customer Store"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B8F68]" />
            <span className="text-xs font-bold text-[#063B2A] font-malayalam hidden xs:inline">മടങ്ങുക</span>
          </button>

          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-2xs cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-950 font-malayalam tracking-tight m-0 flex items-center gap-1.5">
              <span>എന്റെ കട (My Shop)</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#DDF5EA] text-[#063B2A] border border-[#10A978]/30 text-[11px] font-bold rounded-full font-sans">
            Merchant
          </span>
        </div>
      </div>

      {/* 2. STORE BANNER CARD */}
      <div className="p-4 bg-gradient-to-br from-[#063B2A] via-[#084D37] to-[#063B2A] text-white rounded-3xl shadow-lg border border-[#0B8F68]/30 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#10A978] text-[#063B2A] flex items-center justify-center font-black text-xl shadow-md shrink-0">
              🏪
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white truncate font-malayalam m-0">
                  {authUser?.shopName || selectedShopName}
                </h2>
                <span className="text-[9px] font-black bg-[#DDF5EA]/20 text-[#DDF5EA] border border-[#10A978]/40 px-2 py-0.2 rounded-full font-malayalam">
                  സജീവം
                </span>
              </div>
              <p className="text-xs text-[#DDF5EA]/80 font-medium truncate mt-0.5 font-malayalam">
                {currentShop?.address || 'മാർക്കറ്റ് റോഡ്, തിരുവനന്തപുരം'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#DDF5EA] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. THREE AUTHENTIC & LEGITIMATE KPI CARDS */}
      <div className="grid grid-cols-3 gap-2 font-malayalam">
        {/* KPI 1: Real Today's Sales */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            ഇന്നത്തെ വിൽപന
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans truncate">
            ₹ {totalTodaySales.toLocaleString('en-IN')}
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md font-sans inline-block truncate ${
            totalTodaySales > 0 ? 'text-[#063B2A] bg-[#DDF5EA]' : 'text-slate-500 bg-slate-100'
          }`}>
            {totalTodaySales > 0 ? `▲ ${todayTransactionsCount} വിൽപന` : 'ഇന്ന് ഇതുവരെ'}
          </span>
        </div>

        {/* KPI 2: Real Pre-bookings / Orders */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            ഓർഡറുകൾ
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans">
            {totalBookingsCount}
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md font-sans inline-block truncate ${
            pendingBookings.length > 0 ? 'text-amber-800 bg-amber-100' : 'text-[#063B2A] bg-[#DDF5EA]'
          }`}>
            {pendingBookings.length > 0 ? `▲ ${pendingBookings.length} പുതിയത്` : `${totalBookingsCount} ഓർഡർ`}
          </span>
        </div>

        {/* KPI 3: Real Listed Products */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            ലിസ്റ്റ് ചെയ്തവ
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans">
            {shopProductsCount}
          </div>
          <span className="text-[9px] font-bold text-[#063B2A] bg-[#DDF5EA] px-1.5 py-0.2 rounded-md font-sans inline-block truncate">
            സജീവം
          </span>
        </div>
      </div>

      {/* 4. SIX ACTION BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-malayalam">
        <button
          type="button"
          onClick={() => onNavigateTab('billing')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">ബില്ലിംഗ് & POS</b>
            <span className="text-[10px] text-[#66756E]">ദ്രുത ബില്ലിംഗ്</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('prebookings')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">ഓർഡറുകൾ</b>
            <span className="text-[10px] text-[#0B8F68] font-bold">
              {totalBookingsCount} പ്രീ-ബുക്കിംഗ്
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">ഉൽപ്പന്നങ്ങൾ</b>
            <span className="text-[10px] text-[#66756E]">{shopProductsCount} ഇനങ്ങൾ</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">വിലകൾ</b>
            <span className="text-[10px] text-[#66756E]">തത്സമയം മാറ്റുക</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('deals')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FEF8ED] border border-[#FBE6BA] text-[#F4B740] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">ഓഫറുകൾ</b>
            <span className="text-[10px] text-[#925807] font-bold">ഫ്ലാഷ് ഡീലുകൾ</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:border-[#0B8F68] active:scale-98 transition-all flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <b className="text-xs font-black text-[#17221D] block">സ്റ്റോക്ക്</b>
            <span className="text-[10px] text-[#66756E]">അപ്‌ഡേറ്റ് ചെയ്യുക</span>
          </div>
        </button>
      </div>

      {/* 5. GENUINE SALES TREND & ANALYTICS */}
      <div className="p-4 bg-white border border-[#E3ECE7] rounded-3xl shadow-2xs space-y-3 font-malayalam">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#17221D] block">
              വിൽപന വിശകലനം (Sales Analytics)
            </span>
            <div className="text-base sm:text-lg font-black text-[#063B2A] font-sans mt-0.5 flex items-baseline gap-2">
              <span>₹ {periodTotal.toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-bold text-[#66756E] font-malayalam">
                ({chartDays} ദിവസത്തെ ആകെ)
              </span>
            </div>
          </div>

          {/* 7 Days vs 30 Days toggle */}
          <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl text-[11px] font-bold border border-[#E3ECE7]">
            <button
              type="button"
              onClick={() => setChartDays('7')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartDays === '7'
                  ? 'bg-white text-[#063B2A] shadow-2xs font-black'
                  : 'text-[#66756E]'
              }`}
            >
              7 ദിവസം
            </button>
            <button
              type="button"
              onClick={() => setChartDays('30')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartDays === '30'
                  ? 'bg-white text-[#063B2A] shadow-2xs font-black'
                  : 'text-[#66756E]'
              }`}
            >
              30 ദിവസം
            </button>
          </div>
        </div>

        {/* Real Data Chart or Honest Empty State */}
        {periodTotal > 0 ? (
          <div className="space-y-2 pt-2">
            <div className="h-32 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 pb-2 border-b border-[#EAEFF0]">
              {dailyBuckets.map((bucket, idx) => {
                const heightPercent = maxDailyAmount > 0 ? Math.round((bucket.amount / maxDailyAmount) * 100) : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full flex items-end justify-center h-24">
                      <div
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        className={`w-full max-w-[24px] rounded-t-md transition-all ${
                          bucket.amount > 0 ? 'bg-[#0B8F68] group-hover:bg-[#063B2A]' : 'bg-[#E3ECE7]'
                        }`}
                        title={`${bucket.dateStr}: ₹${bucket.amount.toLocaleString('en-IN')} (${bucket.count} sales)`}
                      />
                    </div>
                    <span className="text-[9px] text-[#66756E] font-medium font-sans truncate w-full text-center">
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#66756E] font-sans px-1">
              <span>തത്സമയം രേഖപ്പെടുത്തിയ ഓർഡറുകളും POS ബില്ലുകളും</span>
              <span className="font-bold text-[#063B2A]">₹{periodTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 bg-[#F8FAF7] border border-dashed border-[#C5D7CC] rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
            <Receipt className="w-8 h-8 text-[#0B8F68]/70" />
            <p className="text-xs font-black text-[#17221D]">തത്സമയ വിൽപന രേഖകൾ നിലവിലില്ല</p>
            <p className="text-[11px] text-[#66756E] max-w-xs leading-relaxed font-sans">
              കഴിഞ്ഞ {chartDays} ദിവസത്തിൽ വിൽപനകളോ ബില്ലുകളോ രേഖപ്പെടുത്തിയിട്ടില്ല. ബില്ലിംഗ് & POS വഴി കൗണ്ടർ വിൽപന രേഖപ്പെടുത്തുകയോ ഉപഭോക്തൃ പ്രീ-ഓർഡറുകൾ സ്വീകരിക്കുകയോ ചെയ്യുമ്പോൾ ഇവിടെ യഥാർത്ഥ അനലിറ്റിക്സ് ലഭ്യമാകും.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('billing')}
              className="mt-1 px-3.5 py-1.5 bg-[#0B8F68] hover:bg-[#063B2A] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>ബില്ലിംഗ് & POS തുറക്കുക</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Action: Add Product */}
      <button
        type="button"
        onClick={onOpenAddProduct}
        className="w-full py-3.5 px-4 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-98 text-white rounded-2xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 font-malayalam cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>+ പുതിയ ഉൽപ്പന്നം കാറ്റലോഗിൽ ചേർക്കുക</span>
      </button>
    </div>
  );
};
