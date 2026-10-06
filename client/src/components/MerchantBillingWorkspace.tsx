import React, { useState, useEffect, useMemo } from 'react';
import { Product, Shop, User, SaleItem, MerchantSale, DailySalesSummary, CreateSalePayload } from '../types';
import { createMerchantSaleApi, fetchMerchantSalesSummaryApi, deleteMerchantSaleApi } from '../services/api';
import { ProductImage } from './ProductImage';
import { getMalayalamName } from '../utils/malayalamNames';
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
  ChevronLeft,
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
  ScanBarcode,
  ArrowRight,
  X,
} from 'lucide-react';
import { useHorizontalScroll } from '../utils/useHorizontalScroll';

const AVAILABLE_PROVIDER_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', labelMl: 'പച്ചക്കറികൾ', icon: '🥬' },
  { id: 'fruits', label: 'Fruits', labelMl: 'പഴങ്ങൾ', icon: '🍎' },
  { id: 'meats', label: 'Fresh Meats', labelMl: 'ഇറച്ചി', icon: '🍗' },
  { id: 'fish', label: 'Fish & Seafood', labelMl: 'മത്സ്യം', icon: '🐟' },
  { id: 'dairy', label: 'Dairy & Eggs', labelMl: 'പാൽ & മുട്ട', icon: '🥛' },
  { id: 'staples', label: 'Staples & Grains', labelMl: 'ധാന്യങ്ങൾ', icon: '🍚' },
  { id: 'oils-spices', label: 'Oils & Spices', labelMl: 'എണ്ണ & മസാല', icon: '🫗' },
  { id: 'sauces-condiments', label: 'Sauces & Pickles', labelMl: 'സോസുകൾ & അച്ചാറുകൾ', icon: '🥫' },
  { id: 'beverages', label: 'Tea, Coffee & Drinks', labelMl: 'ചായ & പാനീയങ്ങൾ', icon: '☕' },
  { id: 'snacks', label: 'Evening Snacks', labelMl: 'നാലുമണി പലഹാരം', icon: '🥟' },
  { id: 'bakery-breakfast', label: 'Bakery', labelMl: 'ബേക്കറി', icon: '🍞' },
  { id: 'electronics', label: 'Electronics', labelMl: 'ഇലക്ട്രോണിക്സ്', icon: '🔌' },
  { id: 'utensils', label: 'Kitchen Utensils', labelMl: 'പാത്രങ്ങൾ', icon: '🍳' },
  { id: 'household', label: 'Cleaning & Home', labelMl: 'വീട്ടുസാധനങ്ങൾ', icon: '🧼' },
  { id: 'organic', label: 'Organic Produce', labelMl: 'ഓർഗാനിക്', icon: '🌿' },
];

const CATEGORY_ALIASES: Record<string, string[]> = {
  staples: ['staples', 'rice-grains', 'pulses-legumes'],
  'oils-spices': ['oils-spices', 'oils-sugar', 'spices', 'sauces-condiments'],
  'sauces-condiments': ['sauces-condiments', 'sauces', 'pickles'],
  household: ['household', 'cleaning-household', 'storage-containers', 'baby-family', 'personal-care'],
  snacks: ['snacks', 'evening-snacks'],
  'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'bread-bakery', 'bakery'],
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
  const {
    containerRef: categoryScrollRef,
    canScrollLeft: canCategoryScrollLeft,
    canScrollRight: canCategoryScrollRight,
    scrollLeft: scrollCategoriesLeft,
    scrollRight: scrollCategoriesRight,
    hasMovedRef: categoryDragMovedRef,
  } = useHorizontalScroll<HTMLDivElement>();

  // Sales History & Summary State
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [dailySummary, setDailySummary] = useState<DailySalesSummary | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [receiptModalSale, setReceiptModalSale] = useState<MerchantSale | null>(null);
  const [deleteModalSale, setDeleteModalSale] = useState<MerchantSale | null>(null);
  const [isDeletingSale, setIsDeletingSale] = useState(false);
  const [isMobileBillSheetOpen, setIsMobileBillSheetOpen] = useState(false);

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

  // Step quantity directly from catalogue card (+/-)
  const handleProductStepQuantity = (productId: string, delta: number) => {
    const index = billItems.findIndex((it) => it.product.id === productId);
    if (index === -1) return;
    const currentItem = billItems[index];
    const newQty = Math.round((currentItem.quantity + delta) * 100) / 100;
    if (newQty <= 0) {
      setBillItems((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setBillItems((prev) =>
        prev.map((it, idx) => (idx === index ? { ...it, quantity: newQty } : it))
      );
    }
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
    setIsMobileBillSheetOpen(false);
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
      setIsMobileBillSheetOpen(false);

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
      {/* 1. STORE HEADER (Matches Mockup) */}
      <div className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-3xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-gray-50 hover:bg-[#EAF5F0] border border-gray-200 rounded-xl text-[#0D6344] active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക (Back to Dashboard)"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-[#EAF5F0] text-[#0D6344] flex items-center justify-center text-lg font-bold shadow-2xs shrink-0">
            🏪
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
              {selectedShopName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-700">Active</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('billing-pos-search-input');
            if (el) el.focus();
          }}
          className="p-2.5 rounded-2xl bg-gray-50 hover:bg-[#EAF5F0] border border-gray-200 text-[#0D6344] active:scale-95 transition-all cursor-pointer shadow-2xs"
          title="ബാർകോഡ് സ്കാനർ (Barcode Scanner)"
        >
          <ScanBarcode className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SEGMENTED MODE TOGGLE (Matches Mockup) */}
      <div className="bg-[#EEF2F0] p-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
        <button
          onClick={() => setWorkspaceTab('pos')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer ${
            workspaceTab === 'pos'
              ? 'bg-[#0D6344] text-white shadow-xs font-extrabold'
              : 'text-gray-700 hover:text-gray-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <span className="text-xs sm:text-sm font-malayalam font-bold leading-tight flex items-center gap-1.5">
            <span>ബില്ലിംഗ്</span>
            {billItems.length > 0 && (
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {billItems.length}
              </span>
            )}
          </span>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${workspaceTab === 'pos' ? 'text-emerald-100' : 'text-gray-500'}`}>
            (New Bill POS)
          </span>
        </button>

        <button
          onClick={() => setWorkspaceTab('history')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer ${
            workspaceTab === 'history'
              ? 'bg-[#0D6344] text-white shadow-xs font-extrabold'
              : 'text-gray-700 hover:text-gray-900 hover:bg-white/60 font-semibold'
          }`}
        >
          <span className="text-xs sm:text-sm font-malayalam font-bold leading-tight flex items-center gap-1.5">
            <span>വിൽപ്പന വിവരങ്ങൾ</span>
            {dailySummary && dailySummary.totalBills > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${workspaceTab === 'history' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {dailySummary.totalBills}
              </span>
            )}
          </span>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${workspaceTab === 'history' ? 'text-emerald-100' : 'text-gray-500'}`}>
            (Sales History)
          </span>
        </button>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT / MAIN CATALOGUE: Matches Mockup (Full width on mobile, 7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Search & Barcode Scan Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="billing-pos-search-input"
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:border-[#0D6344] focus:ring-2 focus:ring-[#0D6344]/15 outline-none shadow-2xs transition-all font-medium"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('billing-pos-search-input');
                    if (el) el.focus();
                  }}
                  className="p-2.5 sm:px-3 sm:py-2.5 bg-[#0D6344] hover:bg-[#094831] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="സ്കാൻ ചെയ്യുക (Scan Barcode)"
                >
                  <ScanBarcode className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter Pills with Desktop & Mobile Side-Scroll Navigation */}
              <div className="relative group/catscroll">
                {/* Left Scroll Navigation Button */}
                {canCategoryScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 bg-gradient-to-r from-[#F5F8F6] via-[#F5F8F6]/90 to-transparent pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollCategoriesLeft();
                      }}
                      className="pointer-events-auto w-7 h-7 rounded-full bg-white text-[#0D6344] hover:bg-[#EAF5F0] hover:text-[#094831] shadow-md border border-[#E3ECE7] flex items-center justify-center transition-all cursor-pointer active:scale-90"
                      title="മുമ്പത്തെ വിഭാഗങ്ങൾ (Scroll Left)"
                      aria-label="Scroll left categories"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div
                  ref={categoryScrollRef}
                  onClickCapture={(e) => {
                    if (categoryDragMovedRef.current) {
                      e.stopPropagation();
                    }
                  }}
                  className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth select-none touch-pan-x"
                >
                  <button
                    onClick={(e) => {
                      setSelectedCategory('all');
                      (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-[#EAF5F0] text-[#0D6344] border-2 border-[#0D6344] font-extrabold shadow-2xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    എല്ലാം ({eligibleProducts.length.toLocaleString()})
                  </button>
                  {availableCategories.map((cat) => {
                    const targetCats = CATEGORY_ALIASES[cat.id] || [cat.id];
                    const count = eligibleProducts.filter(
                      (p) => targetCats.includes(p.categoryId) || (cat.id === 'organic' && p.isOrganic)
                    ).length;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={(e) => {
                          setSelectedCategory(cat.id);
                          (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#EAF5F0] text-[#0D6344] border-2 border-[#0D6344] font-extrabold shadow-2xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.labelMl || cat.label}</span>
                        <span className="text-[10px] opacity-80">({count.toLocaleString()})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Scroll Navigation Button */}
                {canCategoryScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 bg-gradient-to-l from-[#F5F8F6] via-[#F5F8F6]/90 to-transparent pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollCategoriesRight();
                      }}
                      className="pointer-events-auto w-7 h-7 rounded-full bg-white text-[#0D6344] hover:bg-[#EAF5F0] hover:text-[#094831] shadow-md border border-[#E3ECE7] flex items-center justify-center transition-all cursor-pointer active:scale-90"
                      title="കൂടുതൽ വിഭാഗങ്ങൾ (Scroll Right)"
                      aria-label="Scroll right categories"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Products 2-col Grid (Matches Mockup) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 max-h-[620px] overflow-y-auto pr-1 pb-16 lg:pb-0">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="text-3xl mb-1">🔍</div>
                    <p className="text-xs text-gray-500 font-medium">സാധനങ്ങൾ കണ്ടെത്താനായില്ല (No products matched)</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const basePrice = p.prices[selectedShopName] || 0;
                    const inBill = billItems.find((it) => it.product.id === p.id);
                    const isOutOfStock = p.stockStatus[selectedShopName] === 'out_of_stock';
                    const mlName = getMalayalamName(p.name);

                    return (
                      <div
                        key={p.id}
                        className={`border rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all bg-white shadow-2xs hover:shadow-xs ${
                          isOutOfStock
                            ? 'border-gray-200 bg-gray-50/70 opacity-60'
                            : inBill
                            ? 'border-emerald-400 ring-1 ring-emerald-400/30 bg-emerald-50/15'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Product Image Container */}
                        <div className="w-full h-32 sm:h-36 bg-[#F8FAF9] rounded-xl flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                          <ProductImage
                            productId={p.id}
                            image={p.image}
                            emoji={p.emoji}
                            alt={p.name}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-contain"
                            fallbackEmojiClassName="text-4xl"
                          />
                        </div>

                        {/* Title: Malayalam primary + English subtitle */}
                        <div className="mb-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 line-clamp-1 leading-snug font-malayalam">
                            {mlName}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                            {p.name} • {p.defaultUnit}
                          </p>
                        </div>

                        {/* Price & Stepper / Add Button */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                          <span className="text-sm sm:text-base font-extrabold text-gray-900">
                            ₹{basePrice}
                          </span>

                          {inBill ? (
                            <div className="flex items-center gap-1 bg-[#0D6344] text-white rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleProductStepQuantity(p.id, -1)}
                                className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-xs font-black cursor-pointer transition-colors"
                                title="കുറയ്ക്കുക (Decrease)"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black px-1 min-w-[16px] text-center">
                                {inBill.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleProductStepQuantity(p.id, 1)}
                                className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-xs font-black cursor-pointer transition-colors"
                                title="കൂട്ടുക (Increase)"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => handleAddProductToBill(p)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                  : 'bg-white border border-emerald-300 text-[#0D6344] hover:bg-[#EAF5F0] hover:border-[#0D6344] active:scale-95 shadow-2xs font-bold'
                              }`}
                              title="ബില്ലിലേക്ക് ചേർക്കുക (Add to Bill)"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: DESKTOP REGISTER (Visible on lg and larger screens) */}
            <div className="hidden lg:flex lg:col-span-5 space-y-3 bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF5F0] text-[#0D6344] flex items-center justify-center font-bold text-sm">
                      🧾
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-tight">Customer Bill</h3>
                      <span className="text-[11px] text-gray-500 font-semibold">
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
                        className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0D6344]"
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
                        className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0D6344]"
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
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 my-2">
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
                              <b className="truncate text-gray-900 text-xs">{item.product.name}</b>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove item from bill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-gray-200/80">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                Unit
                              </span>
                              <select
                                value={item.selectedUnit}
                                onChange={(e) => handleUnitChange(idx, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                              >
                                {item.product.availableUnits.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </div>

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
                                  className="w-6 h-6 bg-[#0D6344] hover:bg-[#094831] text-white rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60">
                            <div className="text-[11px] text-gray-500">
                              Rate: <b className="text-gray-900 font-bold">₹{originalRate}</b> / {item.selectedUnit}
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 font-semibold block leading-none">Line Total</span>
                              <span className="font-black text-xs sm:text-sm text-[#0D6344]">
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
                              ? 'bg-[#0D6344] text-white border-[#0D6344] shadow-2xs font-black'
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

                <div className="bg-[#f7faf5] border border-[#e2e8df] rounded-2xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-600 font-medium">
                    <span>Subtotal ({billCalculations.itemCount} items)</span>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">₹{billCalculations.subtotal}</span>
                  </div>

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

                  <div className="flex items-center justify-between text-gray-900 text-sm sm:text-base font-black pt-2 border-t border-gray-200">
                    <span>Final Payable</span>
                    <span className="text-[#0D6344] text-lg sm:text-xl">₹{billCalculations.netTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteBill}
                  disabled={isSubmittingBill || billItems.length === 0}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isSubmittingBill || billItems.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0D6344] hover:bg-[#094831] text-white active:scale-98 shadow-emerald-900/10'
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

          {/* 3. MOBILE FLOATING LIVE BILL DOCK (Matches Mockup) */}
          {billItems.length > 0 && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 px-1">
                  <div>
                    <span>{billCalculations.itemCount} ഇനങ്ങൾ</span>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span>ആകെ ₹{billCalculations.netTotal}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                    <span className="font-semibold">UPI</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-semibold">Cash</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileBillSheetOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#0D6344] hover:bg-[#094831] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <span>ബിൽ ചെയ്യുക (Checkout)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. MOBILE SLIDE-UP CHECKOUT SHEET MODAL */}
          {isMobileBillSheetOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto w-full p-4 sm:p-5 shadow-2xl border-t border-gray-200 space-y-3.5 animate-in slide-in-from-bottom duration-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF5F0] text-[#0D6344] flex items-center justify-center text-sm font-bold">
                      🧾
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-tight">
                        ബില്ലിംഗ് വിവരങ്ങൾ (Bill Summary)
                      </h3>
                      <span className="text-[11px] text-gray-500 font-semibold">
                        {billCalculations.itemCount} ഇനങ്ങൾ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearBill}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={() => setIsMobileBillSheetOpen(false)}
                      className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Customer Info */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Customer Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Rahul K"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0D6344]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0D6344]"
                      />
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
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
                            <b className="truncate text-gray-900 text-xs">{item.product.name}</b>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-gray-200/80">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                              Unit
                            </span>
                            <select
                              value={item.selectedUnit}
                              onChange={(e) => handleUnitChange(idx, e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              {item.product.availableUnits.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>

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
                                className="w-6 h-6 bg-[#0D6344] hover:bg-[#094831] text-white rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60">
                          <div className="text-[11px] text-gray-500">
                            Rate: <b className="text-gray-900 font-bold">₹{originalRate}</b> / {item.selectedUnit}
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs sm:text-sm text-[#0D6344]">
                              ₹{lineTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

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
                              ? 'bg-[#0D6344] text-white border-[#0D6344] shadow-2xs font-black'
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

                {/* Summary Card */}
                <div className="bg-[#f7faf5] border border-[#e2e8df] rounded-2xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-600 font-medium">
                    <span>Subtotal ({billCalculations.itemCount} items)</span>
                    <span className="font-bold text-gray-900">₹{billCalculations.subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-1.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Discount</span>
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
                        className="w-16 text-xs font-black text-amber-950 bg-white border border-amber-300 rounded-lg px-2 py-0.5 outline-none text-right shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-900 font-black pt-1.5 border-t border-gray-200">
                    <span>Final Payable</span>
                    <span className="text-[#0D6344] text-base">₹{billCalculations.netTotal}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCompleteBill}
                  disabled={isSubmittingBill || billItems.length === 0}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    isSubmittingBill || billItems.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0D6344] hover:bg-[#094831] text-white active:scale-98'
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
                      <span>ബിൽ പൂർത്തിയാക്കുക • ₹{billCalculations.netTotal}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
