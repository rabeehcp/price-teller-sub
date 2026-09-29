import React from 'react';
import { User, Shop, Product, Location, PriceReport } from '../types';
import {
  ChevronRight,
  Menu,
  ArrowLeft,
} from 'lucide-react';

interface MobileAdminViewProps {
  authUser: User | null;
  shops: Shop[];
  products: Product[];
  locations: Location[];
  reports?: PriceReport[];
  usersCount?: number;
  onOpenDrawer: () => void;
  onBackToShopper?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MobileAdminView: React.FC<MobileAdminViewProps> = ({
  shops = [],
  products = [],
  locations = [],
  reports = [],
  usersCount = 0,
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
    <div className="w-full max-w-3xl mx-auto space-y-4 font-sans pb-24 animate-in fade-in duration-150">
      
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          {onBackToShopper && (
            <button
              type="button"
              onClick={onBackToShopper}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 rounded-xl text-slate-800 shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="Back to Shopper App"
              aria-label="Back to Shopper App"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
              <span className="text-xs font-semibold text-slate-800 hidden xs:inline">Back</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-xs cursor-pointer flex items-center gap-2"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Menu</span>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight m-0">
              Admin Dashboard
            </h1>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold rounded-full font-sans">
          Administrator
        </span>
      </div>

      {/* 2. 2x2 METRIC CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Metric 1: Stores */}
        <div 
          onClick={() => onNavigateTab('stores')}
          className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 block truncate">
            Registered Stores
          </span>
          <div className="text-xl font-bold text-slate-900 my-1">
            {shops.length}
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
            {verifiedStores} verified
          </span>
        </div>

        {/* Metric 2: Master Products */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 block truncate">
            Master Catalog
          </span>
          <div className="text-xl font-bold text-slate-900 my-1">
            {products.length}
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
            {pricedProductsCount} priced
          </span>
        </div>

        {/* Metric 3: Locations */}
        <div 
          onClick={() => onNavigateTab('locations')}
          className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 block truncate">
            Regional Hubs
          </span>
          <div className="text-xl font-bold text-slate-900 my-1">
            {locations.length}
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
            Network active
          </span>
        </div>

        {/* Metric 4: Moderation Queue */}
        <div 
          onClick={() => onNavigateTab('moderation')}
          className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 block truncate">
            Price Reports
          </span>
          <div className="text-xl font-bold text-slate-900 my-1">
            {reports.length}
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block ${
            pendingReports.length > 0 ? 'text-amber-800 bg-amber-50' : 'text-slate-600 bg-slate-100'
          }`}>
            {pendingReports.length > 0 ? `${pendingReports.length} pending review` : 'All reviewed'}
          </span>
        </div>

      </div>

      {/* 3. RECENT STORES DIRECTORY */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 block">
            Registered Stores
          </h3>
          <button
            onClick={() => onNavigateTab('stores')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            View All ({shops.length})
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shops.slice(0, 4).map((shop) => (
            <div
              key={shop.id || shop.name}
              onClick={() => onNavigateTab('stores')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-sm shrink-0">
                  🏪
                </div>
                <div className="min-w-0">
                  <b className="text-xs text-slate-900 block truncate">{shop.name}</b>
                  <span className="text-[10px] text-slate-500">{shop.address || shop.locationId || 'Kerala'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. QUICK NAVIGATION TILES */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          Quick Navigation
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigateTab('users')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">👥</span>
            <span>Users</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('stores')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">🏪</span>
            <span>Merchants ({shops.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">📦</span>
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('subscriptions')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">💳</span>
            <span>Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('clients')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">🤝</span>
            <span>Field Partners</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('locations')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-start gap-2.5 transition-colors cursor-pointer"
          >
            <span className="text-base">📍</span>
            <span>Locations</span>
          </button>
        </div>
      </div>

    </div>
  );
};
