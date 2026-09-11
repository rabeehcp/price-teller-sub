import React from 'react';
import { User, Shop, Product, Location } from '../types';
import {
  ShieldCheck,
  Store,
  Package,
  MapPin,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface MobileAdminViewProps {
  authUser: User | null;
  shops: Shop[];
  products: Product[];
  locations: Location[];
  onOpenDrawer: () => void;
  onBackToShopper: () => void;
  onNavigateTab: (tab: 'stores' | 'catalog' | 'locations' | 'moderation' | 'subscriptions') => void;
}

export const MobileAdminView: React.FC<MobileAdminViewProps> = ({
  authUser,
  shops,
  products,
  locations,
  onOpenDrawer,
  onBackToShopper,
  onNavigateTab,
}) => {
  return (
    <div className="md:hidden space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP HEADER MATCHING SCREEN 8 */}
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
            <h1 className="text-lg font-black text-slate-950 font-malayalam tracking-tight m-0">
              അഡ്മിൻ ഡാഷ്ബോർഡ്
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToShopper}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold font-malayalam flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ഷോപ്പർ</span>
        </button>
      </div>

      {/* 2. 2x2 METRIC CARDS MATCHING SCREEN 8 */}
      <div className="grid grid-cols-2 gap-2.5 font-malayalam">
        
        {/* Metric 1 */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            മൊത്തം ഉപയോക്താക്കൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            2,482
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            ▲ +12%
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            മൊത്തം കടകൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {shops.length > 0 ? shops.length : 142}
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            ▲ +5%
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            മൊത്തം ഉൽപ്പന്നങ്ങൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {products.length > 0 ? products.length : '12,584'}
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            ▲ +8%
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            ഇന്നത്തെ ഓർഡറുകൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            248
          </div>
          <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-sans inline-block">
            ▼ -6%
          </span>
        </div>

      </div>

      {/* 3. RECENT ACTIVITY LIST MATCHING SCREEN 8 */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-3 font-malayalam">
        <h3 className="text-xs font-black text-slate-950 block">
          സമീപകാല പ്രവർത്തനം (Recent Activity)
        </h3>

        <div className="space-y-2 text-xs">
          
          <div
            onClick={() => onNavigateTab('stores')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shrink-0">
                🏪
              </div>
              <div className="min-w-0">
                <b className="text-xs text-slate-900 block truncate">പുതിയ കട രജിസ്ട്രേഷൻ</b>
                <span className="text-[10px] text-slate-400">FreshMart • 2 മണിക്കൂർ മുമ്പ്</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => onNavigateTab('catalog')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-sm shrink-0">
                🍎
              </div>
              <div className="min-w-0">
                <b className="text-xs text-slate-900 block truncate">പുതിയ ഉൽപ്പന്നം</b>
                <span className="text-[10px] text-slate-400">തക്കാളി • 3 മണിക്കൂർ മുമ്പ്</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-sm shrink-0">
                👤
              </div>
              <div className="min-w-0">
                <b className="text-xs text-slate-900 block truncate">ഉപയോക്താവ് സൈൻ അപ്പ്</b>
                <span className="text-[10px] text-slate-400">user123 • 4 മണിക്കൂർ മുമ്പ്</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

        </div>
      </div>

      {/* 4. SYSTEM STATUS PILL MATCHING SCREEN 8 */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-1.5 font-malayalam">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          സിസ്റ്റം സ്റ്റാറ്റസ് (System Status)
        </span>
        <div className="flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>എല്ലാം സാധാരണമാണ് (All Systems Operational)</span>
        </div>
      </div>

      {/* 5. QUICK MANAGEMENT BUTTONS */}
      <div className="grid grid-cols-2 gap-2 font-malayalam">
        <button
          type="button"
          onClick={() => onNavigateTab('stores')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900 flex items-center justify-center gap-2 shadow-2xs"
        >
          <Store className="w-4 h-4 text-emerald-700" />
          <span>കടകൾ ({shops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('catalog')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900 flex items-center justify-center gap-2 shadow-2xs"
        >
          <Package className="w-4 h-4 text-emerald-700" />
          <span>കാറ്റലോഗ് ({products.length})</span>
        </button>
      </div>

    </div>
  );
};
