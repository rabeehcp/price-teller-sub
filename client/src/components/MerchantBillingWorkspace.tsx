import React, { useState, useEffect, useMemo } from 'react';
import { Product, Shop, User, SaleItem, MerchantSale, DailySalesSummary, CreateSalePayload } from '../types';
import { createMerchantSaleApi, fetchMerchantSalesSummaryApi, deleteMerchantSaleApi } from '../services/api';
import { ProductImage } from './ProductImage';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Tag,
  CreditCard,
  Smartphone,
  Banknote,
  Printer,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  FileText,
  User as UserIcon,
  Phone,
  Sparkles,
  Layers,
  Check,
  ArrowLeft,
} from 'lucide-react';

const AVAILABLE_PROVIDER_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', labelMl: 'പച്ചക്കറികൾ', icon: '🥬' },
  { id: 'fruits', label: 'Fruits', labelMl: 'പഴങ്ങൾ', icon: '🍎' },
  { id: 'meats', label: 'Fresh Meats', labelMl: 'ഇറച്ചി', icon: '🍗' },
  { id: 'fish', label: 'Fish & Seafood', labelMl: 'മത്സ്യം', icon: '🐟' },
  { id: 'dairy', label: 'Dairy & Eggs', labelMl: 'പാൽ & മുട്ട', icon: '🥛' },
  { id: 'staples', label: 'Staples & Grains', labelMl: 'ധാന്യങ്ങൾ', icon: '🍚' },
  { id: 'oils-spices', label: 'Oils & Spices', labelMl: 'എണ്ണ & മസാല', icon: '🫗' },
  { id: 'bakery-breakfast', label: 'Bakery', labelMl: 'ബേക്കറി', icon: '🍞' },
  { id: 'electronics', label: 'Electronics', labelMl: 'ഇലക്ട്രോണിക്സ്', icon: '🔌' },
  { id: 'utensils', label: 'Kitchen Utensils', labelMl: 'പാത്രങ്ങൾ', icon: '🍳' },
  { id: 'household', label: 'Cleaning & Home', labelMl: 'വീട്ടുസാധനങ്ങൾ', icon: '🧼' },
  { id: 'organic', label: 'Organic Produce', labelMl: 'ഓർഗാനിക്', icon: '🌿' },
];

const CATEGORY_ALIASES: Record<string, string[]> = {
  staples: ['staples', 'rice-grains', 'pulses-legumes'],
  'oils-spices': ['oils-spices', 'oils-sugar', 'spices'],
  household: ['household', 'cleaning-household', 'storage-containers', 'baby-family', 'personal-care'],
  'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'bread-bakery', 'snacks'],
  beverages: ['beverages', 'drinks', 'tea-coffee', 'juices'],
};

interface MerchantBillingWorkspaceProps {
  products: Product[];
  shops: Shop[];
  selectedShopName: string;
  shopCategories?: string[];
  authUser?: User | null;
  onBack?: () => void;
}

interface ActiveBillItem {
  product: Product;
  selectedUnit: string;
  quantity: number;
}

export const MerchantBillingWorkspace: React.FC<MerchantBillingWorkspaceProps> = ({
  products,
  shops,
  selectedShopName,
  shopCategories,
  authUser,
  onBack,
}) => {
  const [workspaceTab, setWorkspaceTab] = useState<'pos' | 'history'>('pos');

  // Active Bill State
  const [billItems, setBillItems] = useState<ActiveBillItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'credit' | 'other'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [completedSale, setCompletedSale] = useState<MerchantSale | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Product Search & Filter for POS
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sales History & Summary State
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [dailySummary, setDailySummary] = useState<DailySalesSummary | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [receiptModalSale, setReceiptModalSale] = useState<MerchantSale | null>(null);
  const [deleteModalSale, setDeleteModalSale] = useState<MerchantSale | null>(null);
  const [isDeletingSale, setIsDeletingSale] = useState(false);

  const currentShop = shops.find((s) => s.name.toLowerCase() === selectedShopName.toLowerCase()) || shops[0];

  // Store's active supported categories
  const activeShopCategories = useMemo(() => {
    if (shopCategories && shopCategories.length > 0) return shopCategories;
    if (currentShop?.categories && currentShop.categories.length > 0) return currentShop.categories;
    return ['vegetables', 'fruits', 'staples', 'dairy'];
  }, [shopCategories, currentShop?.categories]);

  // Expand categories with aliases (e.g. household includes personal-care, bakery-breakfast includes beverages, etc.)
  const eligibleCategoryIds = useMemo(() => {
    return new Set(
      activeShopCategories.flatMap((category) => CATEGORY_ALIASES[category] || [category])
    );
  }, [activeShopCategories]);

  // Shop eligible products (must belong to shop's supported categories AND have pricing for this shop)
  const eligibleProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Must belong to store's selected/supported categories
      const matchesCat =
        eligibleCategoryIds.has(p.categoryId) ||
        (p.isOrganic && activeShopCategories.includes('organic'));
      if (!matchesCat) return false;

      // 2. Must be carried / priced by this store
      const price = p.prices[selectedShopName];
      return price !== undefined && price > 0;
    });
  }, [products, selectedShopName, eligibleCategoryIds, activeShopCategories]);

  // Categories present in eligible products
  const availableCategories = useMemo(() => {
    return AVAILABLE_PROVIDER_CATEGORIES.filter((cat) => {
      if (!activeShopCategories.includes(cat.id)) return false;
      const targetCats = CATEGORY_ALIASES[cat.id] || [cat.id];
      return eligibleProducts.some(
        (p) => targetCats.includes(p.categoryId) || (cat.id === 'organic' && p.isOrganic)
      );
    });
  }, [activeShopCategories, eligibleProducts]);

  // Filtered catalogue for POS
  const filteredProducts = useMemo(() => {
    return eligibleProducts.filter((p) => {
      const targetCats =
        selectedCategory === 'all'
          ? null
          : (CATEGORY_ALIASES[selectedCategory] || [selectedCategory]);
      const matchesCat =
        selectedCategory === 'all' ||
        targetCats!.includes(p.categoryId) ||
        (selectedCategory === 'organic' && p.isOrganic);
      const matchesSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(productSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [eligibleProducts, selectedCategory, productSearch]);

  // Calculations for current active bill
  const billCalculations = useMemo(() => {
    let subtotal = 0;
    let totalQuantity = 0;

    const sanitizedItems: SaleItem[] = billItems.map((item) => {
      const basePrice = item.product.prices[selectedShopName] || 0;
      const multiplier = item.product.unitMultiplier[item.selectedUnit] ?? 1;
      const originalUnitRate = Math.round(basePrice * multiplier);
      const lineTotal = Math.round(originalUnitRate * item.quantity * 100) / 100;

      subtotal += originalUnitRate * item.quantity;
      totalQuantity += item.quantity;

      return {
        productId: item.product.id,
        productName: item.product.name,
        emoji: item.product.emoji,
        quantity: item.quantity,
        unit: item.selectedUnit,
        originalUnitPrice: originalUnitRate,
        discountAmountPerUnit: 0,
        finalUnitPrice: originalUnitRate,
        lineTotal,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    const discountTotal = Math.min(subtotal, Math.max(0, Math.round(overallDiscount * 100) / 100));
    const netTotal = Math.max(0, Math.round((subtotal - discountTotal) * 100) / 100);

    return {
      items: sanitizedItems,
      subtotal,
      discountTotal,
      netTotal,
      totalQuantity,
      itemCount: billItems.length,
    };
  }, [billItems, selectedShopName, overallDiscount]);

  // Add product to bill
  const handleAddProductToBill = (product: Product) => {
    const existingIndex = billItems.findIndex(
      (it) => it.product.id === product.id && it.selectedUnit === product.defaultUnit
    );

    if (existingIndex > -1) {
      setBillItems((prev) =>
        prev.map((it, idx) => (idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it))
      );
    } else {
      setBillItems((prev) => [
        ...prev,
        {
          product,
          selectedUnit: product.defaultUnit,
          quantity: 1,
        },
      ]);
    }
  };

  // Change unit of item in bill
  const handleUnitChange = (index: number, newUnit: string) => {
    setBillItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        return {
          ...it,
          selectedUnit: newUnit,
        };
      })
    );
  };

  // Change quantity
  const handleQuantityChange = (index: number, delta: number) => {
    setBillItems((prev) =>
      prev
        .map((it, idx) => {
          if (idx !== index) return it;
          const newQty = Math.round((it.quantity + delta) * 100) / 100;
          return { ...it, quantity: Math.max(0.1, newQty) };
        })
        .filter((it) => it.quantity > 0)
    );
  };

  const handleSetDirectQuantity = (index: number, qty: number) => {
    setBillItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, quantity: Math.max(0.01, qty) } : it))
    );
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setBillItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear bill
  const handleClearBill = () => {
    if (billItems.length > 0 && !confirm('Are you sure you want to clear the current bill?')) return;
    setBillItems([]);
    setOverallDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    setBillNotes('');
    setPaymentMethod('cash');
    setErrorMsg(null);
  };

  // Complete and save bill to PostgreSQL
  const handleCompleteBill = async () => {
    if (billItems.length === 0) {
      setErrorMsg('Please add at least one product to the bill.');
      return;
    }
    if (!authUser?.token) {
      setErrorMsg('Authentication token missing. Please sign in as merchant.');
      return;
    }

    setIsSubmittingBill(true);
    setErrorMsg(null);

    try {
      const payload: CreateSalePayload = {
        shopId: authUser.shopId || currentShop?.id || 'my_shop',
        shopName: authUser.shopName || selectedShopName,
        items: billCalculations.items,
        itemCount: billCalculations.itemCount,
        totalQuantity: billCalculations.totalQuantity,
        subtotalAmount: billCalculations.subtotal,
        discountTotal: billCalculations.discountTotal,
        totalAmount: billCalculations.netTotal,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: billNotes.trim() || undefined,
      };

      const savedSale = await createMerchantSaleApi(payload, authUser.token);
      setCompletedSale(savedSale);
      setSuccessMsg(`✅ Bill #${savedSale.billNumber} of ₹${savedSale.totalAmount} saved successfully!`);

      // Reset bill inputs
      setBillItems([]);
      setOverallDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setBillNotes('');
      setPaymentMethod('cash');

      // Refresh daily history if on today's date
      loadDailySummary();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete and save bill');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Load daily sales history
  const loadDailySummary = async (dateStr = selectedDate) => {
    if (!authUser?.token) return;
    setIsLoadingHistory(true);
    try {
      const summary = await fetchMerchantSalesSummaryApi(dateStr, authUser.token);
      setDailySummary(summary);
    } catch (e) {
      console.warn('Failed to load daily summary', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleConfirmDeleteSale = async () => {
    if (!deleteModalSale) return;
    if (!authUser?.token) {
      setErrorMsg('Authentication token missing. Please sign in as merchant.');
      return;
    }

    setIsDeletingSale(true);
    try {
      await deleteMerchantSaleApi(deleteModalSale.id, authUser.token);
      setSuccessMsg(`🗑️ Bill #${deleteModalSale.billNumber} was deleted successfully.`);
      if (receiptModalSale?.id === deleteModalSale.id) {
        setReceiptModalSale(null);
      }
      if (completedSale?.id === deleteModalSale.id) {
        setCompletedSale(null);
      }
      setDeleteModalSale(null);
      loadDailySummary(selectedDate);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete bill');
    } finally {
      setIsDeletingSale(false);
    }
  };

  useEffect(() => {
    if (workspaceTab === 'history') {
      loadDailySummary(selectedDate);
    }
  }, [workspaceTab, selectedDate, selectedShopName, authUser?.token]);

  // Filtered sales in history view
  const filteredSales = useMemo(() => {
    if (!dailySummary?.sales) return [];
    if (!historySearch.trim()) return dailySummary.sales;
    const query = historySearch.toLowerCase().trim();
    return dailySummary.sales.filter(
      (s) =>
        s.billNumber.toLowerCase().includes(query) ||
        (s.customerName && s.customerName.toLowerCase().includes(query)) ||
        (s.customerPhone && s.customerPhone.includes(query)) ||
        s.items.some((it) => it.productName.toLowerCase().includes(query))
    );
  }, [dailySummary?.sales, historySearch]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Workspace Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl p-2 shadow-2xs flex-wrap">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-[#DDF5EA] border border-gray-200 rounded-xl text-[#063B2A] active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
            title="ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക (Back to Dashboard)"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B8F68]" />
            <span className="font-malayalam text-xs font-bold">ഡാഷ്‌ബോർഡ്</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
          <button
            onClick={() => setWorkspaceTab('pos')}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              workspaceTab === 'pos'
                ? 'bg-brand-600 text-white shadow-xs font-black'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>New Bill (POS)</span>
            {billItems.length > 0 && (
              <span className="bg-amber-500 text-slate-dark text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {billItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setWorkspaceTab('history')}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              workspaceTab === 'history'
                ? 'bg-brand-600 text-white shadow-xs font-black'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales History & Reports</span>
            {dailySummary && dailySummary.totalBills > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {dailySummary.totalBills}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold px-2">
          <span>🏪 Store: <b className="text-slate-dark">{selectedShopName}</b></span>
        </div>
      </div>

      {/* SUCCESS / ERROR NOTICES */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-900 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: POS BILLING WORKSPACE                                             */}
      {/* ========================================================================= */}
      {workspaceTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT: Product Search & Quick Picker Catalogue (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-3 bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-dark flex items-center gap-1.5">
                  <span>📦 Store Catalogue</span>
                  <span className="text-xs text-gray-400 font-semibold">({eligibleProducts.length} items)</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select items to add to the customer's current bill
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full max-w-[200px] sm:max-w-[240px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                എല്ലാം ({eligibleProducts.length.toLocaleString()})
              </button>
              {availableCategories.map((cat) => {
                const targetCats = CATEGORY_ALIASES[cat.id] || [cat.id];
                const count = eligibleProducts.filter(
                  (p) => targetCats.includes(p.categoryId) || (cat.id === 'organic' && p.isOrganic)
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.labelMl || cat.label}</span>
                    <span className="text-[10px] opacity-75">({count.toLocaleString()})</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 text-xs">
                  No products matched your search in this store.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const basePrice = p.prices[selectedShopName] || 0;
                  const inBill = billItems.find((it) => it.product.id === p.id);
                  const isOutOfStock = p.stockStatus[selectedShopName] === 'out_of_stock';

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddProductToBill(p)}
                      className={`border rounded-2xl p-2.5 flex flex-col justify-between transition-all select-none ${
                        isOutOfStock
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : inBill
                          ? 'border-brand-500 bg-brand-50/40 shadow-xs cursor-pointer hover:border-brand-600'
                          : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-xs cursor-pointer active:scale-98'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="w-8 h-8 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                          <ProductImage
                            productId={p.id}
                            image={p.image}
                            emoji={p.emoji}
                            alt={p.name}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-contain"
                            fallbackEmojiClassName="text-xl"
                          />
                        </div>
                        {inBill && (
                          <span className="text-[10px] font-black bg-brand-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                            {inBill.quantity} in bill
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-extrabold text-xs text-slate-dark line-clamp-1 leading-snug">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Unit: {p.defaultUnit}
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-brand-700">₹{basePrice}</span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className="px-2 py-0.8 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Active Bill Table & POS Checkout (5 Cols on desktop) */}
          <div className="lg:col-span-5 space-y-3 bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-sm">
                    🧾
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-dark leading-tight">Customer Bill</h3>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      {billCalculations.itemCount} line item{billCalculations.itemCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {billItems.length > 0 && (
                  <button
                    onClick={handleClearBill}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Optional Customer Info */}
              <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-gray-50 border border-gray-200/80 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Customer Name (Opt)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul K"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Phone (Opt)
                  </label>
                  <div className="relative">
                    <Phone className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Active Bill Line Items List */}
              {billItems.length === 0 ? (
                <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl my-2 bg-[#fafbfa]">
                  <div className="text-3xl mb-2">🛒</div>
                  <b className="block text-xs text-gray-600 mb-1">Your bill is empty</b>
                  <p className="text-[11px] text-gray-400">
                    Click items from the catalogue on the left to add them to this bill.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 my-2">
                  {billItems.map((item, idx) => {
                    const basePrice = item.product.prices[selectedShopName] || 0;
                    const multiplier = item.product.unitMultiplier[item.selectedUnit] ?? 1;
                    const originalRate = Math.round(basePrice * multiplier);
                    const lineTotal = Math.round(originalRate * item.quantity * 100) / 100;

                    return (
                      <div
                        key={`${item.product.id}-${idx}`}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-xs space-y-2"
                      >
                        {/* Line 1: Emoji, Name, and Delete */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-6 h-6 shrink-0 p-0.5 bg-white border border-gray-100 rounded-md flex items-center justify-center">
                              <ProductImage
                                productId={item.product.id}
                                image={item.product.image}
                                emoji={item.product.emoji}
                                alt={item.product.name}
                                className="w-full h-full"
                                imgClassName="w-full h-full object-contain"
                                fallbackEmojiClassName="text-sm"
                              />
                            </div>
                            <b className="truncate text-slate-dark text-xs">{item.product.name}</b>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove item from bill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line 2: Unit Selector & Quantity Controls */}
                        <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-gray-200/80">
                          {/* Unit Selection */}
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                              Unit
                            </span>
                            <select
                              value={item.selectedUnit}
                              onChange={(e) => handleUnitChange(idx, e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 text-slate-800 font-bold text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              {item.product.availableUnits.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Controls */}
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                              Quantity
                            </span>
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(idx, -1)}
                                className="w-6 h-6 bg-white hover:bg-gray-100 text-gray-700 rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={item.quantity}
                                onChange={(e) => handleSetDirectQuantity(idx, parseFloat(e.target.value) || 1)}
                                className="w-10 text-center font-black text-xs bg-transparent border-0 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(idx, 1)}
                                className="w-6 h-6 bg-brand-600 hover:bg-brand-700 text-white rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Line 3: Pricing Summary */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60">
                          <div className="text-[11px] text-gray-500">
                            Rate: <b className="text-slate-dark font-bold">₹{originalRate}</b> / {item.selectedUnit}
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 font-semibold block leading-none">Line Total</span>
                            <span className="font-black text-xs sm:text-sm text-brand-700">
                              ₹{lineTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Checkout & Payment Section */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'credit', label: 'Credit', icon: FileText },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-1.5 px-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-brand-600 text-white border-brand-700 shadow-2xs font-black'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bill Totals Summary Card */}
              <div className="bg-[#f7faf5] border border-[#e2e8df] rounded-2xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-600 font-medium">
                  <span>Subtotal ({billCalculations.itemCount} items)</span>
                  <span className="font-bold text-slate-dark text-xs sm:text-sm">₹{billCalculations.subtotal}</span>
                </div>

                {/* Overall Discount Input (Above Final Payable) */}
                <div className="flex items-center justify-between gap-2 p-2 bg-amber-50/80 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Discount / Concession</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-amber-800">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={billCalculations.subtotal}
                      step="any"
                      placeholder="0"
                      value={overallDiscount || ''}
                      onChange={(e) => setOverallDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 text-xs sm:text-sm font-black text-amber-950 bg-white border border-amber-300 rounded-lg px-2 py-1 outline-none text-right shadow-2xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-dark text-sm sm:text-base font-black pt-2 border-t border-gray-200">
                  <span>Final Payable</span>
                  <span className="text-brand-700 text-lg sm:text-xl">₹{billCalculations.netTotal}</span>
                </div>
              </div>

              {/* Complete & Record Bill Action */}
              <button
                onClick={handleCompleteBill}
                disabled={isSubmittingBill || billItems.length === 0}
                className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  isSubmittingBill || billItems.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-98 shadow-brand-500/20'
                }`}
              >
                {isSubmittingBill ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Sale • ₹{billCalculations.netTotal}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SALES HISTORY & DAILY KPI REPORTS                                 */}
      {/* ========================================================================= */}
      {workspaceTab === 'history' && (
        <div className="space-y-4">
          
          {/* Top Controls: Date Picker & Refresh */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-dark flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Daily Sales Register</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Review completed sales, total revenue, item discounts, and customer receipts
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Date Shortcuts */}
              <button
                onClick={() => {
                  const today = new Date().toISOString().substring(0, 10);
                  setSelectedDate(today);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === new Date().toISOString().substring(0, 10)
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>

              <button
                onClick={() => {
                  const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
                  setSelectedDate(yesterday);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === new Date(Date.now() - 86400000).toISOString().substring(0, 10)
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yesterday
              </button>

              {/* Native Date Input */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-slate-800 font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              />

              <button
                onClick={() => loadDailySummary()}
                disabled={isLoadingHistory}
                className="p-2 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Daily Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Total Sales */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Revenue</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                ₹{dailySummary?.totalSalesAmount || 0}
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 font-semibold">
                Recorded sales for {selectedDate}
              </span>
            </div>

            {/* 2. Total Bills Count */}
            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span>Total Bills</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
                {dailySummary?.totalBills || 0}
              </div>
              <span className="text-[10px] text-blue-700 mt-1 font-semibold">
                Completed customer transactions
              </span>
            </div>

            {/* 3. Products Sold */}
            <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                <span>Products Sold</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-950 mt-1">
                {dailySummary?.totalProductsSold || 0}
              </div>
              <span className="text-[10px] text-purple-700 mt-1 font-semibold">
                Distinct catalog products
              </span>
            </div>

            {/* 4. Total Quantity Sold */}
            <div className="bg-white border border-cyan-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-600" />
                <span>Total Units/Qty</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-950 mt-1">
                {dailySummary?.totalQuantitySold || 0}
              </div>
              <span className="text-[10px] text-cyan-700 mt-1 font-semibold">
                Cumulative units & weight sold
              </span>
            </div>

            {/* 5. Total Discounts Given */}
            <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Discounts Given</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                ₹{dailySummary?.totalDiscountsGiven || 0}
              </div>
              <span className="text-[10px] text-amber-700 mt-1 font-semibold">
                Total savings granted to buyers
              </span>
            </div>
          </div>

          {/* Sales History List & Filter */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3 flex-wrap">
              <div>
                <h4 className="text-sm font-black text-slate-dark flex items-center gap-1.5">
                  <span>Transactions on {selectedDate}</span>
                  <span className="text-xs text-gray-400 font-semibold">({filteredSales.length} bills)</span>
                </h4>
              </div>

              {/* Search filter for history */}
              <div className="relative w-full max-w-[240px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by bill #, customer..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* List Content */}
            {isLoadingHistory ? (
              <div className="py-16 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
                <span>Loading sales from PostgreSQL...</span>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl my-2 bg-[#fafbfa]">
                <div className="text-3xl mb-2">📋</div>
                <b className="block text-sm font-bold text-slate-dark mb-1">No sales recorded on this date</b>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Use the <b>New Bill (POS)</b> tab above to ring up customer sales and generate official receipts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales.map((sale) => {
                  const isExpanded = expandedSaleId === sale.id;
                  const timeFormatted = new Date(sale.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sale.id}
                      className="bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-2xl p-3.5 sm:p-4 transition-all"
                    >
                      {/* Sale Summary Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center text-base font-black shrink-0">
                            🧾
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <b className="text-sm text-slate-dark">{sale.billNumber}</b>
                              <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full uppercase">
                                {sale.paymentMethod}
                              </span>
                              <span className="text-[11px] text-gray-400 font-semibold">{timeFormatted}</span>
                            </div>
                            <div className="text-xs text-gray-600 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Customer: <b>{sale.customerName || 'Walk-in Customer'}</b></span>
                              {sale.customerPhone && (
                                <>
                                  <span>•</span>
                                  <span>📞 {sale.customerPhone}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{sale.itemCount} items ({sale.totalQuantity} total qty)</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200/60">
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-black text-brand-700 block leading-tight">
                              ₹{sale.totalAmount}
                            </span>
                            {sale.discountTotal > 0 && (
                              <span className="text-[10px] text-amber-700 font-bold block">
                                Saved ₹{sale.discountTotal}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setReceiptModalSale(sale)}
                              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="View & Print Bill Receipt"
                            >
                              <Printer className="w-3.5 h-3.5 text-gray-600" />
                              <span className="hidden xs:inline">Receipt</span>
                            </button>

                            <button
                              onClick={() => setDeleteModalSale(sale)}
                              className="p-1.5 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-gray-400 hover:text-rose-600 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title="Delete Bill Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                              className="p-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title={isExpanded ? 'Collapse items' : 'Expand items'}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Line Items Table */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200 bg-white rounded-xl p-3 space-y-2 animate-in fade-in">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Itemized Bill Breakdown
                          </div>
                          <div className="divide-y divide-gray-100 text-xs">
                            {sale.items.map((it, itIdx) => (
                              <div
                                key={itIdx}
                                className="py-2 flex items-center justify-between gap-2 flex-wrap"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-6 h-6 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center">
                                    <ProductImage
                                      productId={it.productId}
                                      emoji={it.emoji}
                                      alt={it.productName}
                                      className="w-full h-full"
                                      imgClassName="w-full h-full object-contain"
                                      fallbackEmojiClassName="text-sm"
                                    />
                                  </div>
                                  <span className="font-bold text-slate-dark truncate">{it.productName}</span>
                                  <span className="text-gray-500 text-[11px]">
                                    ({it.quantity} × {it.unit})
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-right text-[11px] shrink-0">
                                  <div>
                                    <span className="text-gray-400 block text-[9px] leading-none">Catalog Rate</span>
                                    <span className="text-gray-600">₹{it.originalUnitPrice}</span>
                                  </div>

                                  {it.discountAmountPerUnit > 0 && (
                                    <div>
                                      <span className="text-amber-700 block text-[9px] leading-none">Discount</span>
                                      <span className="text-amber-700 font-bold">-₹{it.discountAmountPerUnit}</span>
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-gray-400 block text-[9px] leading-none">Final Total</span>
                                    <span className="font-black text-brand-700">₹{it.lineTotal}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
                            <span>Subtotal: ₹{sale.subtotalAmount}</span>
                            {sale.discountTotal > 0 && <span>Total Discount: -₹{sale.discountTotal}</span>}
                            <span className="text-brand-800 text-sm font-black">Net Paid: ₹{sale.totalAmount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT PREVIEW / PRINT MODAL                                             */}
      {/* ========================================================================= */}
      {(completedSale || receiptModalSale) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 relative max-h-[92vh] flex flex-col justify-between">
            {/* Close Button */}
            <button
              onClick={() => {
                setCompletedSale(null);
                setReceiptModalSale(null);
              }}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Printable Receipt Content */}
            {(() => {
              const currentReceipt = completedSale || receiptModalSale;
              if (!currentReceipt) return null;

              return (
                <div className="space-y-3.5 overflow-y-auto pr-1">
                  {/* Store Header */}
                  <div className="text-center pb-3 border-b border-dashed border-gray-300">
                    <div className="text-3xl mb-1">🏪</div>
                    <h2 className="text-base sm:text-lg font-black text-slate-dark">{currentReceipt.shopName}</h2>
                    <p className="text-[11px] text-gray-500 font-medium">Official Sales Receipt</p>
                    <div className="inline-block mt-1 px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-800 rounded-full text-[10px] font-black">
                      #{currentReceipt.billNumber}
                    </div>
                  </div>

                  {/* Transaction Metadata */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600 border-b border-gray-100 pb-2">
                    <div>Date: <b>{new Date(currentReceipt.createdAt).toLocaleDateString()}</b></div>
                    <div className="text-right">Time: <b>{new Date(currentReceipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b></div>
                    <div>Payment: <b className="uppercase">{currentReceipt.paymentMethod}</b></div>
                    <div className="text-right truncate">Customer: <b>{currentReceipt.customerName || 'Walk-in'}</b></div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-1.5 py-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Item (Qty)</span>
                      <span>Total</span>
                    </div>
                    {currentReceipt.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold text-slate-dark truncate">
                            {it.emoji} {it.productName}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {it.quantity} {it.unit} @ ₹{it.finalUnitPrice}
                            {it.discountAmountPerUnit > 0 && ` (Disc ₹${it.discountAmountPerUnit})`}
                          </div>
                        </div>
                        <span className="font-bold text-slate-dark shrink-0">₹{it.lineTotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="pt-2 border-t border-dashed border-gray-300 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{currentReceipt.subtotalAmount}</span>
                    </div>
                    {currentReceipt.discountTotal > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>Discounts Given</span>
                        <span>-₹{currentReceipt.discountTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-dark text-base font-black pt-1 border-t border-gray-100">
                      <span>TOTAL PAID</span>
                      <span className="text-brand-700">₹{currentReceipt.totalAmount}</span>
                    </div>
                  </div>

                  <div className="text-center pt-2 text-[10px] text-gray-400 font-medium">
                    Thank you for shopping at {currentReceipt.shopName}!
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 shrink-0">
              <button
                onClick={handlePrintReceipt}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={() => {
                  const currentReceipt = completedSale || receiptModalSale;
                  if (currentReceipt) setDeleteModalSale(currentReceipt);
                }}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => {
                  setCompletedSale(null);
                  setReceiptModalSale(null);
                }}
                className="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deleteModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-dark">Delete Bill #{deleteModalSale.billNumber}?</h3>
                <p className="text-xs text-gray-500">Amount: ₹{deleteModalSale.totalAmount} • {deleteModalSale.itemCount} items</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete this bill record? This action will permanently remove it from your PostgreSQL database and recalculate your daily totals.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeleteModalSale(null)}
                disabled={isDeletingSale}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSale}
                disabled={isDeletingSale}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isDeletingSale ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingSale ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
