import React from 'react';
import { User, Shop, Product, Location, PriceReport } from '../types';
import {
  ShieldCheck,
  Store,
  Package,
  MapPin,
  AlertCircle,
  ChevronRight,
  Menu,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface MobileAdminViewProps {
  authUser: User | null;
  shops: Shop[];
  products: Product[];
  locations: Location[];
  reports?: PriceReport[];
  onOpenDrawer: () => void;
  onBackToShopper?: () => void;
  onNavigateTab: (tab: 'stores' | 'catalog' | 'locations' | 'moderation' | 'subscriptions') => void;
}

export const MobileAdminView: React.FC<MobileAdminViewProps> = ({
  shops = [],
  products = [],
  locations = [],
  reports = [],
  onOpenDrawer,
  onBackToShopper,
  onNavigateTab,
}) => {
  const verifiedStores = shops.filter((s) => s.isVerified !== false).length;
  const pricedProductsCount = products.filter(
    (p) => p.prices && Object.values(p.prices).some((val) => typeof val === 'number' && val > 0)
  ).length;
  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="md:hidden space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          {onBackToShopper && (
            <button
              type="button"
              onClick={onBackToShopper}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-xl text-slate-800 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="ഷോപ്പർ ആപ്പിലേക്ക് മടങ്ങുക (Back to Shopper App)"
              aria-label="Back to Shopper App"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950 font-malayalam hidden xs:inline">മടങ്ങുക</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-2xs cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-950 font-malayalam tracking-tight m-0">
              അഡ്മിൻ ഡാഷ്ബോർഡ്
            </h1>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold rounded-full font-sans">
          Admin
        </span>
      </div>

      {/* 2. 2x2 REAL METRIC CARDS */}
      <div className="grid grid-cols-2 gap-2.5 font-malayalam">
        
        {/* Metric 1: Stores */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            രജിസ്റ്റർ ചെയ്ത കടകൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {shops.length}
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            {verifiedStores} വെരിഫൈഡ്
          </span>
        </div>

        {/* Metric 2: Master Products */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            കാറ്റലോഗ് ഉൽപ്പന്നങ്ങൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {products.length}
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            {pricedProductsCount} വിലയുള്ളവ
          </span>
        </div>

        {/* Metric 3: Locations */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            റീജിയണൽ ഹബ്ബുകൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {locations.length}
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-sans inline-block">
            കേരള നെറ്റ്വർക്ക്
          </span>
        </div>

        {/* Metric 4: Moderation Queue */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 block truncate">
            വില റിപ്പോർട്ടുകൾ
          </span>
          <div className="text-xl font-black text-slate-950 my-1 font-sans">
            {reports.length}
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md font-sans inline-block ${
            pendingReports.length > 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
          }`}>
            {pendingReports.length > 0 ? `${pendingReports.length} റിവ്യൂ ചെയ്യാനുള്ളവ` : 'പൂർത്തിയായി'}
          </span>
        </div>

      </div>

      {/* 3. REAL RECENT STORES DIRECTORY */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-3 font-malayalam">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-950 block">
            രജിസ്റ്റർ ചെയ്ത കടകൾ (Registered Stores)
          </h3>
          <button
            onClick={() => onNavigateTab('stores')}
            className="text-[11px] font-bold text-emerald-700"
          >
            എല്ലാം കാണുക ({shops.length})
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shops.slice(0, 4).map((shop) => (
            <div
              key={shop.id || shop.name}
              onClick={() => onNavigateTab('stores')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shrink-0">
                  🏪
                </div>
                <div className="min-w-0">
                  <b className="text-xs text-slate-900 block truncate">{shop.name}</b>
                  <span className="text-[10px] text-slate-400">{shop.address || shop.locationId || 'Kerala'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. SYSTEM STATUS */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-1.5 font-malayalam">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          സിസ്റ്റം സ്റ്റാറ്റസ് (System Status)
        </span>
        <div className="flex items-center gap-2 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span>എല്ലാ സേവനങ്ങളും തത്സമയം പ്രവർത്തിക്കുന്നു (Operational)</span>
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
