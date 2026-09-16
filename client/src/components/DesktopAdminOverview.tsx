import React from 'react';
import { Shop, Product, Location, PriceReport, SubscriptionStats } from '../types';
import { Users, Store, Package, MapPin, AlertCircle, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DesktopAdminOverviewProps {
  shops: Shop[];
  products: Product[];
  locations: Location[];
  reports: PriceReport[];
  subStats?: SubscriptionStats | null;
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct?: () => void;
  onOpenAddStore?: () => void;
}

export const DesktopAdminOverview: React.FC<DesktopAdminOverviewProps> = ({
  shops = [],
  products = [],
  locations = [],
  reports = [],
  subStats,
  onNavigateTab,
}) => {
  // 1. Real Authentic Metrics Calculation
  const totalStores = shops.length;
  const verifiedStores = shops.filter((s) => s.isVerified !== false).length;
  const unverifiedStores = totalStores - verifiedStores;

  const totalProducts = products.length;
  const pricedProductsCount = products.filter(
    (p) => p.prices && Object.values(p.prices).some((val) => typeof val === 'number' && val > 0)
  ).length;

  const totalLocations = locations.length;
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const activeSubsCount = subStats?.activeCount ?? 0;

  // 2. Real Category Distribution from active catalog
  const categoryMap: Record<string, { name: string; count: number; icon: string }> = {
    vegetables: { name: 'Vegetables', count: 0, icon: '🥬' },
    fruits: { name: 'Fresh Fruits', count: 0, icon: '🍎' },
    'rice-grains': { name: 'Rice & Grains', count: 0, icon: '🌾' },
    'pulses-legumes': { name: 'Pulses & Dals', count: 0, icon: '🫘' },
    spices: { name: 'Spices & Masala', count: 0, icon: '🌶️' },
    'oils-sugar': { name: 'Oil & Sugar', count: 0, icon: '🫙' },
    dairy: { name: 'Dairy & Eggs', count: 0, icon: '🥛' },
    'biscuits-snacks': { name: 'Snacks', count: 0, icon: '🍪' },
    beverages: { name: 'Tea & Coffee', count: 0, icon: '☕' },
    meats: { name: 'Fresh Meats', count: 0, icon: '🍗' },
    fish: { name: 'Fish & Seafood', count: 0, icon: '🐟' },
    cleaning: { name: 'Cleaning', count: 0, icon: '🧹' },
    other: { name: 'Other Items', count: 0, icon: '📦' },
  };

  products.forEach((p) => {
    const cat = p.categoryId?.toLowerCase() || 'other';
    if (categoryMap[cat]) {
      categoryMap[cat].count += 1;
    } else {
      categoryMap['other'].count += 1;
    }
  });

  const sortedCategories = Object.entries(categoryMap)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  const topCategories = sortedCategories.slice(0, 4);
  const otherCategoriesCount = sortedCategories.slice(4).reduce((sum, [_, d]) => sum + d.count, 0);

  // 3. Real Location Hub Store Distribution
  const locationStats = locations.map((loc) => {
    const hubShops = shops.filter(
      (s) => s.locationId === loc.id || (s.address && s.address.toLowerCase().includes(loc.name.toLowerCase()))
    );
    const percentage = totalStores > 0 ? Math.round((hubShops.length / totalStores) * 100) : 0;
    return {
      id: loc.id,
      name: loc.name,
      shopsCount: hubShops.length,
      percentage,
    };
  }).sort((a, b) => b.shopsCount - a.shopsCount);

  // Today formatted
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Title & Subtitle + Date Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Admin Console</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full font-sans">
              Live Production
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Real-time platform metrics, catalog directory, and regional coverage.
          </p>
        </div>

        {/* Date pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E3ECE7] rounded-xl text-xs font-semibold text-slate-600 shadow-2xs self-start sm:self-auto">
          <span className="text-emerald-700">📅</span>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">System Date</div>
            <div className="font-bold text-slate-800">{todayStr}</div>
          </div>
        </div>
      </div>

      {/* 4 Truthful KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Stores */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Stores</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{totalStores}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{verifiedStores} verified • {unverifiedStores} unverified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#0B8F68] flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Catalog Products */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Products</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{totalProducts}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{pricedProductsCount} with live shop prices</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3EB] text-[#F97316] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Location Hubs */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Regional Hubs</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{totalLocations}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kerala panchayats & towns</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#0B8F68] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Price Moderation / Active Subscriptions */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Reports Queue</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{reports.length}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingReports.length} pending community verification</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Regional Hub Network (8 cols) + Real Master Catalog Category Distribution (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Regional Store Network Distribution */}
        <div className="lg:col-span-8 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">Regional Store Network</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live store distribution across active Kerala town hubs</p>
            </div>
            <button
              onClick={() => onNavigateTab('locations')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Hubs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {locationStats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No regional hubs configured.</div>
            ) : (
              locationStats.slice(0, 6).map((loc) => (
                <div key={loc.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10A978]" />
                      <span className="text-slate-800">{loc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-medium font-sans">
                        {loc.shopsCount} {loc.shopsCount === 1 ? 'store' : 'stores'}
                      </span>
                      <span className="text-emerald-700 font-bold font-sans min-w-[36px] text-right">
                        {loc.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0B8F68] to-[#10A978] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(loc.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Real Top Categories Breakdown */}
        <div className="lg:col-span-4 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Catalog Categories</h3>
              <span className="text-xs font-bold text-slate-400 font-sans">{totalProducts} items</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {topCategories.map(([key, data]) => {
                const pct = totalProducts > 0 ? Math.round((data.count / totalProducts) * 100) : 0;
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{data.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{data.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{data.count} products</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-sans">
                      {pct}%
                    </span>
                  </div>
                );
              })}

              {otherCategoriesCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📦</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Other Categories</div>
                      <div className="text-[10px] text-slate-400 font-sans">{otherCategoriesCount} products</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-md font-sans">
                    {totalProducts > 0 ? Math.round((otherCategoriesCount / totalProducts) * 100) : 0}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onNavigateTab('catalog')}
              className="w-full py-2 bg-[#F5F8F6] hover:bg-[#E8F8F0] text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Manage Full Master Catalog →
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Real Moderation Reports Table (8 cols) + Real Registered Stores List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Price Moderation Submissions Queue */}
        <div className="lg:col-span-8 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">Community Price Moderation Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time shopper submissions and price updates for review</p>
            </div>
            <button
              onClick={() => onNavigateTab('moderation')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Queue ({reports.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No active price reports in queue. All store prices are verified.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-gray-100 pb-2">
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold">Store</th>
                    <th className="py-2.5 px-3 font-semibold">Reported Price</th>
                    <th className="py-2.5 px-3 font-semibold">Reported By</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.slice(0, 5).map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{rep.productName}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{rep.shopName}</td>
                      <td className="py-3 px-3 font-black text-emerald-700 font-sans">₹{rep.reportedPrice} <span className="text-[10px] text-slate-400 font-normal">/{rep.unit}</span></td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">{rep.reportedBy || 'Community Shopper'}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rep.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rep.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Real Registered Stores */}
        <div className="lg:col-span-4 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Registered Stores</h3>
              <button
                onClick={() => onNavigateTab('stores')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({shops.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {shops.slice(0, 5).map((shop) => (
                <div key={shop.id || shop.name} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-900 flex items-center justify-center text-base shrink-0">
                      🏪
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{shop.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {shop.address || shop.locationId || 'Kerala'} {shop.phone ? `• ${shop.phone}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    shop.isVerified !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {shop.isVerified !== false ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button
              onClick={() => onNavigateTab('stores')}
              className="w-full py-2 bg-[#F5F8F6] hover:bg-[#E8F8F0] text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Manage All {shops.length} Stores →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
