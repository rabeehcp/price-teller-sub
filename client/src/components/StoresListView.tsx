import React, { useState, useMemo } from 'react';
import { Location, Shop, Product } from '../types';
import {
  Store,
  MapPin,
  Search,
  Star,
  ShieldCheck,
  Phone,
  Clock,
  Truck,
  MessageCircle,
  CalendarCheck,
  ArrowRight,
  ExternalLink,
  Navigation,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface StoresListViewProps {
  shops: Shop[];
  verifiedShops: Shop[];
  locations: Location[];
  currentLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  products: Product[];
  onOpenShopCatalogue: (shopName: string) => void;
  onOpenChat: (shopName: string) => void;
  onOpenPreBooking: (shopName: string) => void;
  onViewOnMap: () => void;
  onGoHome: () => void;
}

export const StoresListView: React.FC<StoresListViewProps> = ({
  shops,
  verifiedShops,
  locations,
  currentLocation,
  onSelectLocation,
  products,
  onOpenShopCatalogue,
  onOpenChat,
  onOpenPreBooking,
  onViewOnMap,
  onGoHome,
}) => {
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Active location shops
  const activeLocationShops = useMemo(() => {
    const list = verifiedShops.length > 0 ? verifiedShops : shops;
    if (!currentLocation) return list;
    return list.filter((s) => !s.locationId || s.locationId === currentLocation.id);
  }, [verifiedShops, shops, currentLocation]);

  // Filtered shops based on search & store type
  const filteredShops = useMemo(() => {
    return activeLocationShops.filter((s) => {
      const q = storeSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        (s.phone && s.phone.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'supermarket' && (!s.shopType || s.shopType === 'supermarket')) ||
        s.shopType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [activeLocationShops, storeSearch, selectedType]);

  // Product counts per shop
  const getProductCountForShop = (shopName: string) => {
    return products.filter(
      (p) => p.prices && p.prices[shopName] !== undefined && p.prices[shopName] > 0
    ).length;
  };

  return (
    <div className="space-y-6 font-malayalam animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2.5">
              <Store className="w-3.5 h-3.5" />
              <span>വെരിഫൈഡ് ഔട്ട്‌ലെറ്റുകൾ (Verified Outlets)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              നിങ്ങളുടെ അടുത്തുള്ള കടകൾ ({currentLocation?.name || 'Kerala'})
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium mt-1 max-w-xl">
              തത്സമയ വിലകളും സാധനങ്ങളുടെ ലഭ്യതയും കാണാം. കടകളുമായി നേരിട്ട് ചാറ്റ് ചെയ്യാനും ഓർഡർ പ്രീ-ബുക്ക് ചെയ്യാനും സാധിക്കും.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewOnMap}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>മാപ്പിൽ കാണുക (Interactive Map)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#66756E]" />
          <input
            type="text"
            value={storeSearch}
            onChange={(e) => setStoreSearch(e.target.value)}
            placeholder="കടയുടെ പേര് അല്ലെങ്കിൽ സ്ഥലം തിരയുക..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#F5F8F6] border border-[#E3ECE7] rounded-xl text-xs font-bold text-[#17221D] outline-none focus:bg-white focus:border-[#0B8F68] transition-all font-malayalam"
          />
        </div>

        {/* Store Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-bold pb-1 md:pb-0">
          {[
            { id: 'all', label: 'എല്ലാ കടകളും', icon: '🏪' },
            { id: 'supermarket', label: 'സൂപ്പർമാർക്കറ്റ്', icon: '🛒' },
            { id: 'organic', label: 'ഓർഗാനിക് സ്റ്റോർ', icon: '🌿' },
            { id: 'local_mart', label: 'ലോക്കൽ മാർട്ട്', icon: '🏬' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedType === type.id
                  ? 'bg-[#0B8F68] text-white font-black shadow-xs'
                  : 'bg-[#F5F8F6] text-[#66756E] hover:bg-[#DDF5EA]/60 border border-[#E3ECE7]'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stores Directory Grid */}
      {filteredShops.length === 0 ? (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F8F6] text-[#66756E] flex items-center justify-center mx-auto text-3xl mb-3">
            🏪
          </div>
          <h3 className="text-base font-bold text-[#17221D] mb-1">
            കടകൾ കണ്ടെത്തിയില്ല
          </h3>
          <p className="text-xs text-[#66756E] max-w-sm mx-auto mb-4">
            തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾ പ്രകാരം കടകൾ ലഭ്യമല്ല. തിരയൽ വാക്ക് മാറ്റുകയോ ലൊക്കേഷൻ മാറുകയോ ചെയ്യുക.
          </p>
          <button
            onClick={() => {
              setStoreSearch('');
              setSelectedType('all');
            }}
            className="px-4 py-2 bg-[#10A978] hover:bg-[#0B8F68] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            എല്ലാ കടകളും കാണുക
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredShops.map((shop) => {
            const productCount = getProductCountForShop(shop.name);
            return (
              <div
                key={shop.id || shop.name}
                className="bg-white border border-[#E3ECE7] hover:border-[#0B8F68]/60 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Shop Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs text-white shrink-0"
                        style={{ backgroundColor: shop.color || '#0B8F68' }}
                      >
                        🏪
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-[#17221D] group-hover:text-[#0B8F68] transition-colors m-0">
                            {shop.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#66756E] font-medium mt-0.5">
                          <MapPin className="w-3 h-3 text-[#0B8F68]" />
                          <span className="truncate max-w-[160px]">{shop.address}</span>
                        </div>
                      </div>
                    </div>

                    {shop.isVerified && (
                      <span className="bg-[#DDF5EA] text-[#063B2A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#0B8F68]/30 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-[#0B8F68]" />
                        <span>വെരിഫൈഡ്</span>
                      </span>
                    )}
                  </div>

                  {/* Highlights & Metadata Badge Strip */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#E3ECE7] my-3 text-[11px] font-semibold text-[#17221D]">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#F4B740] fill-[#F4B740]" />
                      <span>{shop.rating || 4.8} ({shop.reviewCount || 35} റിവ്യൂകൾ)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#0B8F68]" />
                      <span>{productCount > 0 ? `${productCount}+ ഇനങ്ങൾ` : 'ലൈവ് സ്റ്റോക്ക്'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#0B8F68]" />
                      <span>
                        {shop.freeDeliveryThreshold
                          ? `₹${shop.freeDeliveryThreshold}+ ഫ്രീ ഡെലിവറി`
                          : `ഡെലിവറി ഫീ ₹${shop.deliveryFee || 30}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#66756E]" />
                      <span>7:00 AM – 10:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onOpenShopCatalogue(shop.name)}
                    className="w-full py-2.5 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-98 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>വിലവിവരം കാണുക (View Full Prices)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenChat(shop.name)}
                      className="py-2 bg-[#F5F8F6] hover:bg-[#DDF5EA]/50 active:scale-98 text-[#17221D] border border-[#E3ECE7] rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#0B8F68]" />
                      <span>ചാറ്റ് ചെയ്യുക</span>
                    </button>

                    <button
                      onClick={() => onOpenPreBooking(shop.name)}
                      className="py-2 bg-[#DDF5EA] hover:bg-[#DDF5EA]/80 active:scale-98 text-[#063B2A] border border-[#0B8F68]/30 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#0B8F68]" />
                      <span>പ്രീ-ബുക്കിംഗ്</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
