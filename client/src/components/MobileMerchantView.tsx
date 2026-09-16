import React, { useState } from 'react';
import { Product, Shop, User, PreBooking } from '../types';
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
} from 'lucide-react';

interface MobileMerchantViewProps {
  authUser: User | null;
  selectedShopName: string;
  shops: Shop[];
  products: Product[];
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
  onOpenDrawer,
  onBackToShopper,
  onNavigateTab,
  onOpenAddProduct,
  onOpenSubscriptionPaywall,
  preBookingsCount = 0,
}) => {
  const [chartDays, setChartDays] = useState<'7' | '30'>('7');

  const currentShop = shops.find((s) => s.name.toLowerCase() === selectedShopName.toLowerCase());
  const shopProductsCount = products.filter(
    (p) => p.prices && p.prices[selectedShopName] !== undefined && p.prices[selectedShopName] > 0
  ).length;

  return (
    <div className="md:hidden space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP HEADER MATCHING SCREEN 7 */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-2xs cursor-pointer"
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

      {/* 2. STORE BANNER CARD MATCHING SCREEN 7 */}
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
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#DDF5EA] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. THREE STATS KPI CARDS MATCHING SCREEN 7 */}
      <div className="grid grid-cols-3 gap-2 font-malayalam">
        
        {/* KPI 1 */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            ഇന്നത്തെ വിൽപ്പനം
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans">
            ₹ 8,420
          </div>
          <span className="text-[9px] font-black text-[#063B2A] bg-[#DDF5EA] px-1.5 py-0.2 rounded-md font-sans">
            ▲ +12%
          </span>
        </div>

        {/* KPI 2 */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            ഓർഡറുകൾ
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans">
            24
          </div>
          <span className="text-[9px] font-black text-[#063B2A] bg-[#DDF5EA] px-1.5 py-0.2 rounded-md font-sans">
            ▲ +8%
          </span>
        </div>

        {/* KPI 3 */}
        <div className="p-3 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#66756E] block truncate">
            സജീവ ഉപഭോക്താക്കൾ
          </span>
          <div className="text-sm font-black text-[#17221D] my-0.5 font-sans">
            156
          </div>
          <span className="text-[9px] font-black text-[#063B2A] bg-[#DDF5EA] px-1.5 py-0.2 rounded-md font-sans">
            ▲ +3%
          </span>
        </div>

      </div>

      {/* 4. SIX ACTION BUTTONS MATCHING SCREEN 7 */}
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
            <span className="text-[10px] text-[#0B8F68] font-bold">{preBookingsCount} പ്രീ-ബുക്കിംഗ്</span>
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

      {/* 5. SALES TREND LINE CHART MATCHING SCREEN 7 */}
      <div className="p-4 bg-white border border-[#E3ECE7] rounded-3xl shadow-2xs space-y-3 font-malayalam">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#17221D] block">
              ഇന്നത്തെ വിൽപന (Sales Trend)
            </span>
            <div className="text-lg font-black text-[#063B2A] font-sans mt-0.5">
              ₹ 8,420 <span className="text-xs font-bold text-[#0B8F68] font-sans">▲ +12%</span>
            </div>
          </div>

          {/* 7 Days vs 30 Days toggle matching Screen 7 */}
          <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl text-[11px] font-bold border border-[#E3ECE7]">
            <button
              type="button"
              onClick={() => setChartDays('7')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
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
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartDays === '30'
                  ? 'bg-white text-[#063B2A] shadow-2xs font-black'
                  : 'text-[#66756E]'
              }`}
            >
              30 ദിവസം
            </button>
          </div>
        </div>

        {/* Smooth SVG Line Chart */}
        <div className="h-32 w-full pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
            <defs>
              <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10A978" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10A978" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,60 Q 50,45 100,55 T 200,30 T 300,10 L 300,80 L 0,80 Z"
              fill="url(#salesGrad)"
            />
            <path
              d="M 0,60 Q 50,45 100,55 T 200,30 T 300,10"
              fill="none"
              stroke="#0B8F68"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="300" cy="10" r="4" fill="#063B2A" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Quick Action: Add Product */}
      <button
        type="button"
        onClick={onOpenAddProduct}
        className="w-full py-3.5 px-4 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-98 text-white rounded-2xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 font-malayalam"
      >
        <PlusCircle className="w-4 h-4" />
        <span>+ പുതിയ ഉൽപ്പന്നം കാറ്റലോഗിൽ ചേർക്കുക</span>
      </button>

    </div>
  );
};
