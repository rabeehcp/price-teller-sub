import React from 'react';
import { Shop, Product, PreBooking } from '../types';
import { ProductImage } from './ProductImage';
import {
  ShoppingBag,
  Package,
  Clock,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface DesktopMerchantOverviewProps {
  shopName: string;
  shops: Shop[];
  products: Product[];
  preBookings: PreBooking[];
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct?: () => void;
}

export const DesktopMerchantOverview: React.FC<DesktopMerchantOverviewProps> = ({
  shopName,
  products = [],
  preBookings = [],
  onNavigateTab,
  onOpenAddProduct,
}) => {
  // 1. Real Store Inventory Data
  const carriedProducts = products.filter(
    (p) => p.prices && typeof p.prices[shopName] === 'number' && p.prices[shopName] > 0
  );

  const totalCatalogCount = products.length;
  const storeListedCount = carriedProducts.length;
  const coveragePercent = totalCatalogCount > 0 ? Math.round((storeListedCount / totalCatalogCount) * 100) : 0;

  // 2. Real Orders Data
  const totalOrdersCount = preBookings.length;
  const pendingOrders = preBookings.filter((b) => b.status === 'pending');
  const completedOrders = preBookings.filter((b) => b.status === 'completed');
  const totalSalesValue = preBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // 3. Category Breakdown for this store
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
    other: { name: 'Other', count: 0, icon: '📦' },
  };

  carriedProducts.forEach((p) => {
    const cat = p.categoryId?.toLowerCase() || 'other';
    if (categoryMap[cat]) {
      categoryMap[cat].count += 1;
    } else {
      categoryMap['other'].count += 1;
    }
  });

  const activeStoreCategories = Object.entries(categoryMap)
    .filter(([_, d]) => d.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{shopName}</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full font-sans">
              Active Store
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Store performance, live stock prices, and incoming shopper orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2 bg-[#0B8F68] hover:bg-[#063B2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Add / Update Products</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Truthful KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Listed Products */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Listed Products</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{storeListedCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{coveragePercent}% catalog coverage</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#0B8F68] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shopper Orders</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{totalOrdersCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{completedOrders.length} processed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#0B8F68] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">{pendingOrders.length}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingOrders.length > 0 ? 'Requires confirmation' : 'Queue clear'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Order Volume (Sales) */}
        <div className="p-4 sm:p-5 bg-white border border-[#E3ECE7] rounded-2xl shadow-2xs hover:shadow-sm transition-shadow flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Order Volume</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">
              ₹{totalSalesValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>From received pre-orders</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center shrink-0 font-black text-xl">
            ₹
          </div>
        </div>
      </div>

      {/* Middle Row: Live Store Listed Products (8 cols) + Category Breakdown (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Store Listed Products */}
        <div className="lg:col-span-8 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">Your Store Prices</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live items currently published to shoppers</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({carriedProducts.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {carriedProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>No products currently priced for this store.</p>
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="px-4 py-2 bg-[#0B8F68] text-white rounded-xl text-xs font-bold hover:bg-[#063B2A] transition-colors cursor-pointer"
                >
                  Set Store Prices from Master Catalog
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-gray-100 pb-2">
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Your Price</th>
                    <th className="py-2.5 px-3 font-semibold">Unit</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {carriedProducts.slice(0, 6).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          <ProductImage
                            productId={prod.id}
                            image={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="truncate">{prod.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 capitalize">{prod.categoryId || 'General'}</td>
                      <td className="py-3 px-3 font-black text-emerald-700 font-sans text-sm">
                        ₹{prod.prices[shopName]}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{prod.defaultUnit || '1 kg'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateTab('inventory')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Active Categories in Store */}
        <div className="lg:col-span-4 bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900">Category Coverage</h3>
              <span className="text-xs font-bold text-slate-400 font-sans">{storeListedCount} items</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {activeStoreCategories.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No categories active yet.
                </div>
              ) : (
                activeStoreCategories.slice(0, 5).map(([key, data]) => {
                  const pct = storeListedCount > 0 ? Math.round((data.count / storeListedCount) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{data.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{data.name}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{data.count} items</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-sans">
                        {pct}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-2 bg-[#F5F8F6] hover:bg-[#E8F8F0] text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Update Category Pricing →
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Orders Table */}
      <div className="bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Shopper Pre-Orders & Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time incoming orders from consumers</p>
          </div>
          <button
            onClick={() => onNavigateTab('prebookings')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({preBookings.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {preBookings.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 space-y-1">
              <div className="text-2xl mb-1">🛒</div>
              <p className="font-semibold text-slate-600">No customer pre-orders received yet.</p>
              <p>When shoppers place pre-orders or send shopping lists to {shopName}, they will appear here live.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-gray-100 pb-2">
                  <th className="py-2.5 px-3 font-semibold">Order ID</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Items</th>
                  <th className="py-2.5 px-3 font-semibold">Total</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preBookings.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 font-sans">{order.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{order.consumerName || 'Shopper'}</td>
                    <td className="py-3 px-3 text-slate-500">{order.itemCount} items</td>
                    <td className="py-3 px-3 font-black text-slate-900 font-sans">₹{order.totalAmount}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('prebookings')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
