import React, { useState, useEffect, useMemo } from 'react';
import { Location, Shop, Product, Category } from '../types';
import { fetchShopCatalogueApi } from '../services/api';
import { ProductImage } from './ProductImage';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Star,
  ShieldCheck,
  Navigation,
  MessageCircle,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  Printer,
  ChevronDown,
  Store,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

interface ShopPriceCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  currentLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  shops: Shop[];
  initialShopName?: string | null;
  categories: Category[];
  products: Product[];
  basket: { productId: string; quantity: number; selectedUnit: string }[];
  onAddToBasket: (product: Product, unit?: string) => void;
  onQuantityChange: (productId: string, delta: number) => void;
  onOpenChat?: (shopName: string) => void;
  onOpenPreBooking?: (shopName: string) => void;
}

export const ShopPriceCatalogueModal: React.FC<ShopPriceCatalogueModalProps> = ({
  isOpen,
  onClose,
  locations,
  currentLocation,
  onSelectLocation,
  shops,
  initialShopName,
  categories,
  products: globalProducts,
  basket,
  onAddToBasket,
  onQuantityChange,
  onOpenChat,
  onOpenPreBooking,
}) => {
  if (!isOpen) return null;

  // Active Location
  const activeLocation = currentLocation || locations[0] || null;

  // Filter shops for current location
  const locationShops = useMemo(() => {
    if (!activeLocation) return shops;
    return shops.filter((s) => !s.locationId || s.locationId === activeLocation.id);
  }, [shops, activeLocation]);

  // Selected Shop State
  const [selectedShopId, setSelectedShopId] = useState<string>(() => {
    if (initialShopName) {
      const match = locationShops.find((s) => s.name.toLowerCase() === initialShopName.toLowerCase());
      if (match) return match.id;
    }
    return locationShops[0]?.id || (shops[0] ? shops[0].id : '');
  });

  // Keep selected shop in sync if initialShopName changes
  useEffect(() => {
    if (initialShopName) {
      const match = locationShops.find((s) => s.name.toLowerCase() === initialShopName.toLowerCase());
      if (match) {
        setSelectedShopId(match.id);
      }
    } else if (!selectedShopId && locationShops.length > 0) {
      setSelectedShopId(locationShops[0].id);
    }
  }, [initialShopName, locationShops]);

  // Active Shop object
  const activeShop = useMemo(() => {
    return locationShops.find((s) => s.id === selectedShopId) || locationShops[0] || shops[0] || null;
  }, [locationShops, selectedShopId, shops]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'deals'>('in_stock');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(false);

  // Catalogue data from API with fallback
  const [catalogueData, setCatalogueData] = useState<{
    products: {
      id: string;
      name: string;
      categoryId: string;
      emoji: string;
      image?: string;
      defaultUnit: string;
      availableUnits: string[];
      unitMultiplier: Record<string, number>;
      price: number;
      stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
      isOrganic?: boolean;
      badge?: string;
      nutritionalNote?: string;
    }[];
    totalCount: number;
    inStockCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load shop catalogue when active shop or location changes
  useEffect(() => {
    if (!activeShop) return;

    let isMounted = true;
    setIsLoading(true);

    fetchShopCatalogueApi(activeShop.id || activeShop.name, activeLocation?.id)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.products && res.products.length > 0) {
          setCatalogueData({
            products: res.products,
            totalCount: res.totalCount,
            inStockCount: res.inStockCount,
          });
        } else {
          // Fallback to local products array
          const shopName = activeShop?.name || '';
          const fallbackProds = (globalProducts || [])
            .filter((p) => (p.prices && shopName && p.prices[shopName] !== undefined) || (p.stockStatus && shopName && p.stockStatus[shopName] !== undefined))
            .map((p) => ({
              id: p.id,
              name: p.name,
              categoryId: p.categoryId,
              emoji: p.emoji,
              image: p.image,
              defaultUnit: p.defaultUnit,
              availableUnits: p.availableUnits || [p.defaultUnit],
              unitMultiplier: p.unitMultiplier || { [p.defaultUnit]: 1 },
              price: (p.prices && shopName && p.prices[shopName] !== undefined) ? p.prices[shopName] : (p.prices ? Object.values(p.prices)[0] || 50 : 50),
              stockStatus: (p.stockStatus && shopName && p.stockStatus[shopName]) || 'in_stock',
              isOrganic: p.isOrganic,
              badge: p.badge,
              nutritionalNote: p.nutritionalNote,
            }));

          setCatalogueData({
            products: fallbackProds,
            totalCount: fallbackProds.length,
            inStockCount: fallbackProds.filter((p) => p.stockStatus !== 'out_of_stock').length,
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const shopName = activeShop?.name || '';
        const fallbackProds = (globalProducts || [])
          .filter((p) => (p.prices && shopName && p.prices[shopName] !== undefined) || (p.stockStatus && shopName && p.stockStatus[shopName] !== undefined))
          .map((p) => ({
            id: p.id,
            name: p.name,
            categoryId: p.categoryId,
            emoji: p.emoji,
            image: p.image,
            defaultUnit: p.defaultUnit,
            availableUnits: p.availableUnits || [p.defaultUnit],
            unitMultiplier: p.unitMultiplier || { [p.defaultUnit]: 1 },
            price: (p.prices && shopName && p.prices[shopName] !== undefined) ? p.prices[shopName] : (p.prices ? Object.values(p.prices)[0] || 50 : 50),
            stockStatus: (p.stockStatus && shopName && p.stockStatus[shopName]) || 'in_stock',
            isOrganic: p.isOrganic,
            badge: p.badge,
            nutritionalNote: p.nutritionalNote,
          }));

        setCatalogueData({
          products: fallbackProds,
          totalCount: fallbackProds.length,
          inStockCount: fallbackProds.filter((p) => p.stockStatus !== 'out_of_stock').length,
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeShop?.id, activeShop?.name, activeLocation?.id, globalProducts]);

  // Filtered product items in active catalogue
  const filteredProducts = useMemo(() => {
    if (!catalogueData?.products) return [];
    let list = catalogueData.products;

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryId.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'organic') {
        list = list.filter((p) => p.isOrganic || p.categoryId === 'organic');
      } else {
        list = list.filter((p) => p.categoryId === selectedCategory);
      }
    }

    // 3. Stock filter
    if (stockFilter === 'in_stock') {
      list = list.filter((p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock');
    } else if (stockFilter === 'deals') {
      list = list.filter((p) => p.badge || p.price <= 50);
    }

    return list;
  }, [catalogueData?.products, searchQuery, selectedCategory, stockFilter]);

  // Selected Unit handling
  const handleUnitChange = (productId: string, unit: string) => {
    setSelectedUnits((prev) => ({ ...prev, [productId]: unit }));
  };

  const getProductPriceForUnit = (prod: any) => {
    const unit = selectedUnits[prod.id] || prod.defaultUnit;
    const mult = prod.unitMultiplier?.[unit] ?? 1;
    return Math.round(prod.price * mult);
  };

  const handleDirections = () => {
    if (!activeShop) return;
    const query = encodeURIComponent(`${activeShop.name}, ${activeShop.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    if (!activeShop) return;
    let text = `🛒 *${activeShop.name} - Price Catalogue*\n`;
    text += `📍 ${activeShop.address} (${activeLocation?.name || 'Local Market'})\n`;
    text += `📞 ${activeShop.phone} | ⏱️ ${activeShop.openingHours}\n\n`;
    text += `*Live Item Rates:*\n`;
    filteredProducts.slice(0, 15).forEach((p) => {
      const u = selectedUnits[p.id] || p.defaultUnit;
      const pr = getProductPriceForUnit(p);
      const statusIcon = p.stockStatus === 'out_of_stock' ? '❌ Out of stock' : '✅ In Stock';
      text += `• ${p.emoji} ${p.name} (${u}) - ₹${pr} [${statusIcon}]\n`;
    });
    text += `\n_Checked via PeediyaCart Smart Hyperlocal Portal_ · https://peediacart.vercel.app`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full h-[95dvh] sm:h-[92vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
        
        {/* Compact Modern Header Bar */}
        <div className="px-3 sm:px-5 py-2.5 bg-gradient-to-r from-[#1b3d22] to-[#0e2714] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-inner"
              style={{ backgroundColor: activeShop?.color || '#249044' }}
            >
              {activeShop?.name?.charAt(0) || '🏪'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  {activeShop?.name || 'Shop Price Catalogue'}
                </h2>
                {activeShop?.isVerified && (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {activeShop?.rating && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 bg-white/10 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    <Star className="w-2.5 h-2.5 fill-amber-300" /> {activeShop.rating}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-200/80 font-medium truncate">
                {activeShop?.address ? `${activeShop.address} (${activeLocation?.name || 'Kerala'})` : 'Live Product Prices'}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenChat && activeShop && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(activeShop.name);
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            )}

            {onOpenPreBooking && activeShop && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPreBooking(activeShop.name);
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Pre-Book</span>
              </button>
            )}

            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              title="Print Price List"
              className="hidden md:inline-flex p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-gray-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Compact 1-Row Store Switcher & Location Selector */}
        <div className="px-3 sm:px-5 py-1.5 bg-[#f4f7f1] border-b border-[#e0e5dc] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            {/* Location dropdown */}
            <div className="relative inline-flex items-center">
              <MapPin className="w-3 h-3 text-brand-600 absolute left-2 pointer-events-none" />
              <select
                value={activeLocation?.id || ''}
                onChange={(e) => {
                  const loc = locations.find((l) => l.id === e.target.value);
                  if (loc) onSelectLocation(loc);
                }}
                className="appearance-none bg-white border border-gray-300 hover:border-brand-500 font-bold text-[11px] text-slate-dark py-1 pl-6 pr-5 rounded-lg cursor-pointer focus:outline-none shadow-2xs"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Quick Switch Store Pills */}
            <div className="flex items-center gap-1.5">
              {locationShops.map((s) => {
                const isSelected = activeShop?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShopId(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-700 text-white shadow-2xs font-black'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'text-gray-500 font-medium'}`}>
                      ★{s.rating}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Store info toggle / Directions */}
          <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
            {activeShop?.phone && (
              <a
                href={`tel:${activeShop.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer active:scale-95"
                title={`${activeShop.name} വിളിക്കുക (${activeShop.phone})`}
              >
                <Phone className="w-3 h-3 text-[#0B8F68]" />
                <span className="hidden sm:inline">{activeShop.phone}</span>
                <span className="sm:hidden font-malayalam">വിളിക്കുക</span>
              </a>
            )}
            <button
              onClick={handleDirections}
              className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-lg font-bold text-[10px] inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Navigation className="w-2.5 h-2.5" /> Map
            </button>
          </div>
        </div>

        {/* Compact Search & Category Filters Bar */}
        <div className="px-3 sm:px-5 py-2 bg-[#fafcfa] border-b border-gray-200 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${filteredProducts.length} items in ${activeShop?.name || 'shop'} (e.g. Milk, Rice, Sugar...)`}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* In-Stock Filter & View Mode Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px]">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    stockFilter === 'all' ? 'bg-white text-slate-dark shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  All ({catalogueData?.totalCount || 0})
                </button>
                <button
                  onClick={() => setStockFilter('in_stock')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    stockFilter === 'in_stock' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  In Stock ({catalogueData?.inStockCount || 0})
                </button>
              </div>

              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('cards')}
                  title="Multi-Column Grid View (Dense)"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Compact Table View"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-brand-700 shadow-2xs' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap text-[11px] transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories
              .filter((c) => c.id !== 'all')
              .map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-700 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* 4. Products Container: High-Density Multi-Column Grid or Compact Table */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-[#f7f9f5] scroll-smooth">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <span className="text-xs font-bold text-gray-500">വിലവിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto my-6">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="text-sm font-bold text-slate-dark mb-1">സാധനങ്ങൾ കണ്ടെത്താനായില്ല</h4>
              <p className="text-xs text-gray-500 mb-3">
                {activeShop?.name}-ൽ ഈ തിരച്ചിലിൽ സാധനങ്ങൾ ലഭ്യമല്ല.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStockFilter('all');
                }}
                className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-700"
              >
                ഫിൽട്ടറുകൾ മാറ്റുക
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            
            /* --- DENSE MULTI-COLUMN GRID VIEW (Shows 16-24+ items at a time!) --- */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
              {filteredProducts.map((prod) => {
                const selectedUnit = selectedUnits[prod.id] || prod.defaultUnit;
                const calculatedPrice = getProductPriceForUnit(prod);
                const basketItem = basket.find((b) => b.productId === prod.id);
                const qtyInBasket = basketItem?.quantity || 0;
                const isOutOfStock = prod.stockStatus === 'out_of_stock';
                const isLowStock = prod.stockStatus === 'low_stock';
                const globalProd = globalProducts.find((p) => p.id === prod.id) || (prod as any);

                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-xl border p-2 sm:p-2.5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'border-rose-200 bg-rose-50/20 opacity-75'
                        : 'border-surface-border hover:border-brand-300'
                    }`}
                  >
                    <div>
                      {/* Top: Thumbnail & Stock Pill */}
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                          <ProductImage
                            productId={prod.id}
                            image={prod.image}
                            emoji={prod.emoji}
                            alt={prod.name}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-contain"
                            fallbackEmojiClassName="text-xl"
                            isOutOfStock={isOutOfStock}
                            stampSize="xs"
                          />
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {isOutOfStock ? (
                            <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              തീർന്നു
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              Low
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ലഭ്യമാണ്
                            </span>
                          )}
                          {prod.isOrganic && (
                            <span className="text-[8px] font-black text-emerald-800 bg-emerald-100/80 px-1 rounded">
                              🌿 Organic
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Name & Details */}
                      <h4
                        className="text-xs font-bold text-slate-dark leading-tight line-clamp-2 min-h-[30px]"
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>

                      {/* Unit Selector */}
                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                        {prod.availableUnits && prod.availableUnits.length > 1 ? (
                          <select
                            value={selectedUnit}
                            onChange={(e) => handleUnitChange(prod.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-[10px] font-bold text-slate-700 py-0.5 px-1.5 rounded cursor-pointer focus:outline-none"
                          >
                            {prod.availableUnits.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-gray-100 px-1.5 py-0.2 rounded font-semibold text-gray-600">
                            {prod.defaultUnit}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400">തത്സമയ വില</span>
                      </div>
                    </div>

                    {/* Bottom: Big Price & Add Button */}
                    <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1">
                      <div>
                        <div className="text-sm sm:text-base font-black text-brand-900 leading-none">
                          ₹{calculatedPrice}
                        </div>
                      </div>

                      <div>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-500 italic">ലഭ്യമല്ല</span>
                        ) : qtyInBasket > 0 ? (
                          <div className="inline-flex items-center gap-1 bg-brand-50 border border-brand-300 rounded-lg p-0.5">
                            <button
                              onClick={() => onQuantityChange(prod.id, -1)}
                              className="w-5 h-5 rounded bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-4 text-center font-black text-xs text-brand-900">
                              {qtyInBasket}
                            </span>
                            <button
                              onClick={() => onQuantityChange(prod.id, 1)}
                              className="w-5 h-5 rounded bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToBasket(globalProd, selectedUnit)}
                            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>ചേർക്കുക</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          ) : (

            /* --- ULTRA-COMPACT TABLE VIEW --- */
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#edf2ea] border-b border-gray-200 text-[10px] sm:text-[11px] font-black uppercase text-gray-600 tracking-wider">
                      <th className="py-2 px-3">ഉൽപ്പന്നം (Product)</th>
                      <th className="py-2 px-2 text-center">അളവ് (Unit)</th>
                      <th className="py-2 px-3 text-right">വില ({activeShop?.name})</th>
                      <th className="py-2 px-3 text-center">സ്റ്റോക്ക്</th>
                      <th className="py-2 px-3 text-right">ചേർക്കുക</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredProducts.map((prod) => {
                      const selectedUnit = selectedUnits[prod.id] || prod.defaultUnit;
                      const calculatedPrice = getProductPriceForUnit(prod);
                      const basketItem = basket.find((b) => b.productId === prod.id);
                      const qtyInBasket = basketItem?.quantity || 0;
                      const isOutOfStock = prod.stockStatus === 'out_of_stock';
                      const globalProd = globalProducts.find((p) => p.id === prod.id) || (prod as any);

                      return (
                        <tr
                          key={prod.id}
                          className={`hover:bg-[#fbfdfa] transition-colors ${
                            isOutOfStock ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-1.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                                <ProductImage
                                  productId={prod.id}
                                  image={prod.image}
                                  emoji={prod.emoji}
                                  alt={prod.name}
                                  className="w-full h-full"
                                  imgClassName="w-full h-full object-contain"
                                  fallbackEmojiClassName="text-base"
                                  isOutOfStock={isOutOfStock}
                                  stampSize="xs"
                                />
                              </div>
                              <div className="font-bold text-slate-dark text-xs flex items-center gap-1.5">
                                <span>{prod.name}</span>
                                {prod.isOrganic && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1 rounded">
                                    🌿
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-1.5 px-2 text-center">
                            {prod.availableUnits && prod.availableUnits.length > 1 ? (
                              <select
                                value={selectedUnit}
                                onChange={(e) => handleUnitChange(prod.id, e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-[11px] font-bold text-gray-700 py-0.5 px-1.5 rounded cursor-pointer"
                              >
                                {prod.availableUnits.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-600">
                                {prod.defaultUnit}
                              </span>
                            )}
                          </td>

                          <td className="py-1.5 px-3 text-right">
                            <span className="font-black text-slate-dark text-sm text-brand-900">
                              ₹{calculatedPrice}
                            </span>
                          </td>

                          <td className="py-1.5 px-3 text-center">
                            {prod.stockStatus === 'in_stock' && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> ലഭ്യമാണ്
                              </span>
                            )}
                            {prod.stockStatus === 'low_stock' && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                Low
                              </span>
                            )}
                            {prod.stockStatus === 'out_of_stock' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                തീർന്നു
                              </span>
                            )}
                          </td>

                          <td className="py-1.5 px-3 text-right">
                            {isOutOfStock ? (
                              <span className="text-[11px] text-gray-400 italic">Unavailable</span>
                            ) : qtyInBasket > 0 ? (
                              <div className="inline-flex items-center gap-1 bg-brand-50 border border-brand-300 rounded-lg p-0.5">
                                <button
                                  onClick={() => onQuantityChange(prod.id, -1)}
                                  className="w-5 h-5 rounded bg-white flex items-center justify-center font-bold text-xs"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-4 text-center font-black text-xs text-brand-900">
                                  {qtyInBasket}
                                </span>
                                <button
                                  onClick={() => onQuantityChange(prod.id, 1)}
                                  className="w-5 h-5 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAddToBasket(globalProd, selectedUnit)}
                                className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>ചേർക്കുക</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer Bar */}
        <div className="px-3 sm:px-5 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-gray-500 font-medium flex items-center gap-1.5 text-[11px]">
            <span><b>{filteredProducts.length}</b> സാധനങ്ങൾ കാണിക്കുന്നു</span>
            <span>·</span>
            <span className="text-emerald-700 font-bold">
              {activeShop?.name} Live Rates
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              ശരി (Done)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
