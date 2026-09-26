import React, { useState, useEffect, useMemo } from 'react';
import {
  Category,
  Location,
  PriceReport,
  Product,
  Shop,
  User,
  SubscriptionPlan,
  MerchantSubscription,
  SubscriptionPayment,
  SubscriptionStats,
  AuditLog,
  ClientPartner,
  ClientPayout,
  ClientSummaryMetrics,
  ClientOnboardedShop,
} from '../types';
import { ProductImage } from './ProductImage';
import { EditProductModal } from './EditProductModal';
import {
  createLocationApi,
  createShopApi,
  deleteProductApi,
  deleteShopApi,
  fetchAdminProducts,
  fetchAdminShops,
  fetchAdminStats,
  moderatePriceReportApi,
  updateShopApi,
  fetchSubscriptionPlansApi,
  createSubscriptionPlanApi,
  updateSubscriptionPlanApi,
  fetchAdminSubscriptionsApi,
  extendAdminSubscriptionApi,
  cancelAdminSubscriptionApi,
  fetchAdminSubscriptionPaymentsApi,
  fetchAdminSubscriptionStatsApi,
  fetchAdminAuditLogsApi,
  fetchClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  recordClientPayoutApi,
  fetchClientOnboardedShopsApi,
} from '../services/api';
import {
  ShieldCheck,
  Store,
  Package,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Pencil,
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Search,
  Check,
  Building2,
  Users,
  Sparkles,
  Layers,
  Filter,
  RotateCw,
  Globe,
  Crosshair,
  LayoutGrid,
  CreditCard,
  LogOut,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Tag,
  ChevronDown,
  Bell,
  FileText,
  AlertCircle,
  Settings,
  ShoppingBag,
  Menu,
  Wallet,
  Copy,
  CheckCheck,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { LocationMapPickerModal } from './LocationMapPickerModal';
import { MobileAdminView } from './MobileAdminView';
import { MobileDrawer } from './MobileDrawer';
import { EnteBazaarLogo } from './EnteBazaarLogo';
import { DesktopAdminOverview } from './DesktopAdminOverview';
import { ClientManagementTab } from './ClientManagementTab';

export const MASTER_CATALOG_CATEGORIES: { id: string; name: string; icon: string; description: string }[] = [
  { id: 'all', name: 'All Master Items', icon: '✨', description: 'Browse and manage all platform master products' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', description: 'Daily fresh greens, roots, tubers & country vegetables' },
  { id: 'fruits', name: 'Fresh Fruits', icon: '🍎', description: 'Farm fresh fruits, seasonal berries & exotic fruits' },
  { id: 'rice-grains', name: 'Rice & Grains', icon: '🌾', description: 'Matta rice, biryani rice, flours, wheat & oats' },
  { id: 'pulses-legumes', name: 'Pulses & Legumes', icon: '🫘', description: 'Dals, green gram, chana, toor dal & pulses' },
  { id: 'spices', name: 'Spices & Masala', icon: '🌶️', description: 'Chilli, turmeric, garam masala & whole spices' },
  { id: 'oils-sugar', name: 'Oil, Salt & Sugar', icon: '🫙', description: 'Coconut oil, cooking oils, ghee, salt & sugar' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', description: 'Fresh milk, curd, cheese, butter & eggs' },
  { id: 'sauces-condiments', name: 'Sauces & Pickles', icon: '🥫', description: 'Ketchup, vinegar, pickles, papad & condiments' },
  { id: 'biscuits-snacks', name: 'Biscuits & Snacks', icon: '🍪', description: 'Biscuits, rusks, bread, chips, murukku & snacks' },
  { id: 'beverages', name: 'Tea, Coffee & Drinks', icon: '☕', description: 'Tea powder, coffee, Horlicks, Boost & fruit drinks' },
  { id: 'utensils', name: 'Kitchen Utensils', icon: '🍳', description: 'Cookware, pots, pressure cookers, tawas & cutlery' },
  { id: 'cleaning-household', name: 'Cleaning & Household', icon: '🧹', description: 'Detergents, soaps, dishwash, brooms & mops' },
  { id: 'storage-containers', name: 'Storage Containers', icon: '🧴', description: 'Plastic & steel jars, bottles, lunchboxes & flasks' },
  { id: 'baby-family', name: 'Baby & Family', icon: '🍼', description: 'Baby food, diapers, wipes, tissues & napkins' },
  { id: 'personal-care', name: 'Personal Care', icon: '🧼', description: 'Shampoo, hair oil, toothpaste, soaps & grooming' },
  { id: 'meats', name: 'Fresh Meats', icon: '🍗', description: 'Fresh chicken, mutton, beef & poultry' },
  { id: 'fish', name: 'Fish & Seafood', icon: '🐟', description: 'Fresh sea fish, river fish & prawns' },
  { id: 'electronics', name: 'Electronics & Appliances', icon: '🔌', description: 'Mixers, induction stoves, kettles & appliances' },
  { id: 'organic', name: 'Organic & Wellness', icon: '🌿', description: 'Certified organic, pesticide-free produce' },
];

interface AdminPanelProps {
  locations: Location[];
  shops: Shop[];
  products: Product[];
  categories: Category[];
  onBackToShopper: () => void;
  onShopsUpdated: (shops: Shop[]) => void;
  onProductsUpdated: (products: Product[]) => void;
  onLocationsUpdated: (locations: Location[]) => void;
  onOpenAddProductModal?: (categoryId?: string) => void;
  onLogout?: () => void;
  authUser?: User | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  locations,
  shops,
  products,
  categories,
  onBackToShopper,
  onShopsUpdated,
  onProductsUpdated,
  onLocationsUpdated,
  onOpenAddProductModal,
  onLogout,
  authUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'catalog' | 'locations' | 'moderation' | 'subscriptions' | 'clients'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogPageSize, setCatalogPageSize] = useState<number>(50);
  const [catalogSort, setCatalogSort] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'category'>('name-asc');
  const [catalogQuickFilter, setCatalogQuickFilter] = useState<'all' | 'organic' | 'priced' | 'unpriced' | 'offers'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isBatchDeleting, setIsBatchDeleting] = useState<boolean>(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeRegionFilter, setStoreRegionFilter] = useState<string>('all');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Subscriptions & Monetization Admin State
  const [subPlans, setSubPlans] = useState<SubscriptionPlan[]>([]);
  const [subList, setSubList] = useState<MerchantSubscription[]>([]);
  const [subPayments, setSubPayments] = useState<SubscriptionPayment[]>([]);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [subSearch, setSubSearch] = useState<string>('');
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('all');
  const [extendingSub, setExtendingSub] = useState<MerchantSubscription | null>(null);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [extendReason, setExtendReason] = useState<string>('SuperAdmin courtesy extension');
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');
  const [newPlanDuration, setNewPlanDuration] = useState<number>(30);
  const [newPlanPriceRs, setNewPlanPriceRs] = useState<number>(499);
  const [newPlanDesc, setNewPlanDesc] = useState<string>('');
  const [newPlanBadge, setNewPlanBadge] = useState<string>('');
  const [newPlanFeatures, setNewPlanFeatures] = useState<string>('Full Catalog Access\nLive POS Billing\nFlash Deals Support');

  // Modals inside Admin
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // New Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLocationId, setNewStoreLocationId] = useState(locations[0]?.id || 'tirur');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('+91 98470 ');
  const [newStoreType, setNewStoreType] = useState<'supermarket' | 'local_mart' | 'organic' | 'wholesale' | 'quick_commerce'>('supermarket');
  const [newStoreDistance, setNewStoreDistance] = useState('1.2');
  const [newStoreLat, setNewStoreLat] = useState<number | undefined>(undefined);
  const [newStoreLng, setNewStoreLng] = useState<number | undefined>(undefined);
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStorePassword, setNewStorePassword] = useState('password123');
  const [createdStoreCredential, setCreatedStoreCredential] = useState<{ email: string; username?: string; password: string; shopName: string } | null>(null);

  // Edit Store Form State
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreLocationId, setEditStoreLocationId] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');
  const [editStorePhone, setEditStorePhone] = useState('');
  const [editStoreType, setEditStoreType] = useState<'supermarket' | 'local_mart' | 'organic' | 'wholesale' | 'quick_commerce'>('supermarket');
  const [editStoreDistance, setEditStoreDistance] = useState('1.2');
  const [editStoreDeliveryFee, setEditStoreDeliveryFee] = useState('30');
  const [editStoreFreeDeliveryThreshold, setEditStoreFreeDeliveryThreshold] = useState('500');
  const [editStoreIsVerified, setEditStoreIsVerified] = useState(true);
  const [editStoreLat, setEditStoreLat] = useState<number | undefined>(undefined);
  const [editStoreLng, setEditStoreLng] = useState<number | undefined>(undefined);

  // New Location Form State
  const [newLocName, setNewLocName] = useState('');
  const [newLocSubArea, setNewLocSubArea] = useState('');
  const [newLocState, setNewLocState] = useState('Kerala');
  const [newLocLat, setNewLocLat] = useState<number>(10.9155);
  const [newLocLng, setNewLocLng] = useState<number>(75.9238);
  const [newLocRadiusKm, setNewLocRadiusKm] = useState<number>(15);

  // Reusable Map Picker State
  const [mapPickerState, setMapPickerState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    initialLat: number;
    initialLng: number;
    initialRadiusKm?: number;
    initialAddress?: string;
    isHubMode?: boolean;
    confirmButtonText?: string;
    onConfirm: (coords: { lat: number; lng: number; address?: string; radiusKm?: number }) => void;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    initialLat: 10.9155,
    initialLng: 75.9238,
    onConfirm: () => {},
  });

  // Local state for reports moderation queue
  const [reports, setReports] = useState<PriceReport[]>([
    {
      id: 'rep-mod-1',
      productId: 'banana',
      productName: 'Robusta Banana',
      shopId: 'green-mart',
      shopName: 'Green Mart',
      locationId: 'tirur',
      reportedPrice: 46,
      unit: '1 kg',
      reportedBy: 'Fayis K. (Community Shopper)',
      timestamp: '15 mins ago',
      status: 'pending',
      upvotes: 4,
      downvotes: 0,
    },
    {
      id: 'rep-mod-2',
      productId: 'milk',
      productName: 'Milma Toned Milk',
      shopId: 'market-hub',
      shopName: 'Market Hub',
      locationId: 'tirur',
      reportedPrice: 55,
      unit: '1 L',
      reportedBy: 'Sunil Nair',
      timestamp: '40 mins ago',
      status: 'pending',
      upvotes: 6,
      downvotes: 1,
    },
  ]);

  // Master Catalog local state (unfiltered platform master items)
  const [masterProducts, setMasterProducts] = useState<Product[]>(products);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchAdminStats().then((data) => setStats(data));
    fetchAdminShops().then((allShops) => {
      if (allShops && allShops.length > 0) {
        onShopsUpdated(allShops);
      }
    });
    setIsLoadingCatalog(true);
    fetchAdminProducts()
      .then((allProducts) => {
        if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
          setMasterProducts(allProducts);
          onProductsUpdated(allProducts);
        }
      })
      .finally(() => setIsLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setMasterProducts(products);
    }
  }, [products]);

  useEffect(() => {
    if (activeTab === 'subscriptions' && authUser?.token) {
      loadSubscriptionData();
    }
  }, [activeTab, authUser?.token]);

  const loadSubscriptionData = async () => {
    if (!authUser?.token) return;
    setSubLoading(true);
    try {
      const [plans, subs, payments, sStats, logs] = await Promise.all([
        fetchSubscriptionPlansApi(true, authUser.token),
        fetchAdminSubscriptionsApi(authUser.token),
        fetchAdminSubscriptionPaymentsApi(authUser.token),
        fetchAdminSubscriptionStatsApi(authUser.token),
        fetchAdminAuditLogsApi(50, authUser.token),
      ]);
      setSubPlans(plans);
      setSubList(subs);
      setSubPayments(payments);
      setSubStats(sStats);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load subscription admin data', err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!extendingSub || !authUser?.token) return;
    try {
      await extendAdminSubscriptionApi(extendingSub.id, extendDays, extendReason, authUser.token);
      setExtendingSub(null);
      loadSubscriptionData();
    } catch (err: any) {
      alert(err.message || 'Failed to extend subscription');
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    if (!authUser?.token) return;
    const reason = window.prompt('Enter reason for cancellation:');
    if (reason === null) return;
    try {
      await cancelAdminSubscriptionApi(subId, reason || 'SuperAdmin administrative cancellation', authUser.token);
      loadSubscriptionData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.token || !newPlanName.trim()) return;
    try {
      const features = newPlanFeatures.split('\n').map((f) => f.trim()).filter(Boolean);
      await createSubscriptionPlanApi(
        {
          name: newPlanName.trim(),
          durationDays: Number(newPlanDuration),
          pricePaise: Math.round(Number(newPlanPriceRs) * 100),
          description: newPlanDesc.trim(),
          badge: newPlanBadge.trim() || undefined,
          features,
          isActive: true,
        },
        authUser.token
      );
      setIsNewPlanOpen(false);
      setNewPlanName('');
      loadSubscriptionData();
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    }
  };

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    if (!authUser?.token) return;
    try {
      await updateSubscriptionPlanApi(plan.id, { isActive: !plan.isActive }, authUser.token);
      loadSubscriptionData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle plan status');
    }
  };

  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);

  const handleToggleStoreVerify = async (shop: Shop) => {
    const updated = await updateShopApi(shop.id, { isVerified: !shop.isVerified });
    if (updated) {
      onShopsUpdated(shops.map((s) => (s.id === shop.id ? { ...s, isVerified: !s.isVerified } : s)));
    }
  };

  const handleDeleteStore = async (shop: Shop) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${shop.name}"?\n\nThis will remove the store and its associated prices and regional listings.`
    );
    if (!confirmed) return;

    try {
      setDeletingShopId(shop.id);
      const success = await deleteShopApi(shop.id);
      if (success) {
        onShopsUpdated(shops.filter((s) => s.id !== shop.id));
        if (editingShop?.id === shop.id) {
          setEditingShop(null);
        }
      } else {
        alert('Could not delete store. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to delete store:', err);
      alert(err.message || 'Failed to delete store');
    } finally {
      setDeletingShopId(null);
    }
  };

  const handleStartEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setEditStoreName(shop.name);
    setEditStoreLocationId(shop.locationId || locations[0]?.id || 'tirur');
    setEditStoreAddress(shop.address);
    setEditStorePhone(shop.phone || '');
    setEditStoreType(shop.shopType || 'supermarket');
    setEditStoreDistance(String(shop.distanceKm ?? 1.0));
    setEditStoreDeliveryFee(String(shop.deliveryFee ?? 30));
    setEditStoreFreeDeliveryThreshold(String(shop.freeDeliveryThreshold ?? 500));
    setEditStoreIsVerified(shop.isVerified);
    setEditStoreLat(shop.lat);
    setEditStoreLng(shop.lng);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop || !editStoreName.trim() || !editStoreAddress.trim()) return;

    try {
      const updated = await updateShopApi(editingShop.id, {
        name: editStoreName.trim(),
        locationId: editStoreLocationId,
        address: editStoreAddress.trim(),
        phone: editStorePhone.trim(),
        shopType: editStoreType,
        distanceKm: Number(editStoreDistance) || 1.0,
        deliveryFee: Number(editStoreDeliveryFee) || 0,
        freeDeliveryThreshold: Number(editStoreFreeDeliveryThreshold) || 0,
        isVerified: editStoreIsVerified,
        lat: editStoreLat,
        lng: editStoreLng,
      });

      if (updated) {
        onShopsUpdated(shops.map((s) => (s.id === editingShop.id ? { ...s, ...updated } : s)));
        setEditingShop(null);
      }
    } catch (err) {
      console.error('Failed to update store:', err);
    }
  };

  const handleOpenAddStoreWithLocation = (locId?: string) => {
    if (locId) {
      setNewStoreLocationId(locId);
    } else if (locations.length > 0) {
      setNewStoreLocationId(locations[0].id);
    }
    setNewStoreLat(undefined);
    setNewStoreLng(undefined);
    setIsAddStoreOpen(true);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreAddress.trim()) return;

    try {
      const created = await createShopApi({
        name: newStoreName.trim(),
        locationId: newStoreLocationId,
        address: newStoreAddress.trim(),
        phone: newStorePhone.trim(),
        shopType: newStoreType,
        distanceKm: Number(newStoreDistance) || 1.0,
        lat: newStoreLat,
        lng: newStoreLng,
        rating: 4.6,
        reviewCount: 15,
        isVerified: true,
        deliveryFee: 30,
        freeDeliveryThreshold: 500,
        color: '#249044',
        email: newStoreEmail.trim() || undefined,
        password: newStorePassword.trim() || 'password123',
      });
      onShopsUpdated([...shops, created]);
      setIsAddStoreOpen(false);
      setNewStoreName('');
      setNewStoreAddress('');
      setNewStoreEmail('');
      setNewStorePassword('password123');
      setNewStoreLat(undefined);
      setNewStoreLng(undefined);
      if (created.merchantAccount) {
        setCreatedStoreCredential({
          email: created.merchantAccount.email,
          username: created.merchantAccount.username,
          password: created.merchantAccount.password,
          shopName: created.name,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    try {
      const created = await createLocationApi({
        name: newLocName.trim(),
        subArea: newLocSubArea.trim() || 'Central Market Hub',
        state: newLocState.trim(),
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        lat: newLocLat || 10.9155,
        lng: newLocLng || 75.9238,
        radiusKm: newLocRadiusKm || 15,
      });
      onLocationsUpdated([...locations, created]);
      setIsAddLocationOpen(false);
      setNewLocName('');
      setNewLocSubArea('');
    } catch (err) {
      console.error(err);
    }
  };

  const activeProductList = masterProducts.length > 0 ? masterProducts : products;

  const handleRefreshCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const allProducts = await fetchAdminProducts();
      if (allProducts && Array.isArray(allProducts) && allProducts.length > 0) {
        setMasterProducts(allProducts);
        onProductsUpdated(allProducts);
      }
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from master catalog?`)) {
      await deleteProductApi(id);
      setMasterProducts((prev) => prev.filter((p) => p.id !== id));
      onProductsUpdated(products.filter((p) => p.id !== id));
    }
  };

  const handleModerateReport = async (reportId: string, action: 'approve' | 'reject') => {
    await moderatePriceReportApi(reportId, action);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action === 'approve' ? 'verified' : 'rejected' } : r))
    );
  };

  // Real-time category product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeProductList.length };
    MASTER_CATALOG_CATEGORIES.forEach((c) => {
      if (c.id === 'all') return;
      if (c.id === 'organic') {
        counts[c.id] = activeProductList.filter((p) => p.isOrganic || p.categoryId?.toLowerCase() === 'organic').length;
      } else {
        counts[c.id] = activeProductList.filter((p) => p.categoryId?.toLowerCase() === c.id.toLowerCase()).length;
      }
    });
    return counts;
  }, [activeProductList]);

  // Quick filter counts
  const quickFilterCounts = useMemo(() => {
    let organic = 0;
    let priced = 0;
    let unpriced = 0;
    let offers = 0;

    activeProductList.forEach((p) => {
      if (p.isOrganic || p.categoryId?.toLowerCase() === 'organic') organic++;
      const hasPrices = p.prices && Object.values(p.prices).some((v) => typeof v === 'number' && !isNaN(v));
      if (hasPrices) priced++;
      else unpriced++;
      if (p.badge) offers++;
    });

    return { all: activeProductList.length, organic, priced, unpriced, offers };
  }, [activeProductList]);

  const filteredAndSortedProducts = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();

    const list = activeProductList.filter((p) => {
      const matchesCategory =
        catalogCategoryFilter === 'all' ||
        (catalogCategoryFilter === 'organic'
          ? p.isOrganic || p.categoryId?.toLowerCase() === 'organic'
          : p.categoryId?.toLowerCase() === catalogCategoryFilter.toLowerCase());

      if (!matchesCategory) return false;

      if (catalogQuickFilter === 'organic') {
        if (!(p.isOrganic || p.categoryId?.toLowerCase() === 'organic')) return false;
      } else if (catalogQuickFilter === 'priced') {
        const hasPrices = p.prices && Object.values(p.prices).some((v) => typeof v === 'number' && !isNaN(v));
        if (!hasPrices) return false;
      } else if (catalogQuickFilter === 'unpriced') {
        const hasPrices = p.prices && Object.values(p.prices).some((v) => typeof v === 'number' && !isNaN(v));
        if (hasPrices) return false;
      } else if (catalogQuickFilter === 'offers') {
        if (!p.badge) return false;
      }

      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = Boolean(p.categoryId && p.categoryId.toLowerCase().includes(q));
        const matchesNutri = Boolean(p.nutritionalNote && p.nutritionalNote.toLowerCase().includes(q));
        const matchesBadge = Boolean(p.badge && p.badge.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesNutri && !matchesBadge) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (catalogSort === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (catalogSort === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (catalogSort === 'price-asc') {
        const aVals = Object.values(a.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
        const bVals = Object.values(b.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
        const aMin = aVals.length > 0 ? Math.min(...aVals) : Infinity;
        const bMin = bVals.length > 0 ? Math.min(...bVals) : Infinity;
        return aMin - bMin;
      }
      if (catalogSort === 'price-desc') {
        const aVals = Object.values(a.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
        const bVals = Object.values(b.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
        const aMin = aVals.length > 0 ? Math.min(...aVals) : -1;
        const bMin = bVals.length > 0 ? Math.min(...bVals) : -1;
        return bMin - aMin;
      }
      if (catalogSort === 'category') {
        const catA = a.categoryId || '';
        const catB = b.categoryId || '';
        const catDiff = catA.localeCompare(catB);
        return catDiff !== 0 ? catDiff : a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [activeProductList, catalogCategoryFilter, catalogQuickFilter, catalogSearch, catalogSort]);

  const filteredProducts = filteredAndSortedProducts;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / catalogPageSize));
  const currentPage = Math.min(catalogPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * catalogPageSize;
    return filteredAndSortedProducts.slice(start, start + catalogPageSize);
  }, [filteredAndSortedProducts, currentPage, catalogPageSize]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCatalogPage(1);
    setSelectedProductIds(new Set());
  }, [catalogCategoryFilter, catalogQuickFilter, catalogSearch, catalogSort, catalogPageSize]);

  // Batch selection helpers
  const handleToggleSelectAll = () => {
    if (selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedProductIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.size} selected products from the master catalog?`)) {
      return;
    }
    setIsBatchDeleting(true);
    try {
      const idsToDelete = Array.from(selectedProductIds);
      for (const id of idsToDelete) {
        try {
          await deleteProductApi(id);
        } catch (err) {
          console.error(`Failed to delete product ${id}:`, err);
        }
      }
      setMasterProducts((prev) => prev.filter((p) => !selectedProductIds.has(p.id)));
      onProductsUpdated(products.filter((p) => !selectedProductIds.has(p.id)));
      setSelectedProductIds(new Set());
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const loc = locations.find((l) => l.id === s.locationId);
      const q = storeSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (loc && loc.name.toLowerCase().includes(q)) ||
        (loc && loc.subArea && loc.subArea.toLowerCase().includes(q)) ||
        (loc && loc.state && loc.state.toLowerCase().includes(q));

      const matchesRegion = storeRegionFilter === 'all' || s.locationId === storeRegionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [shops, storeSearch, storeRegionFilter, locations]);

  return (
    <div className="min-h-screen flex bg-[#F5F8F6] text-[#17221D] font-sans">
      {/* 1. DESKTOP LEFT SIDEBAR (Matching Ash Black Theme) */}
      <aside className="w-56 xl:w-64 bg-[#141816] text-white shrink-0 hidden lg:flex flex-col justify-between p-3.5 xl:p-4 border-r border-[#242A27] shadow-xl fixed top-0 bottom-0 left-0 h-screen z-30 select-none overflow-y-auto">
        <div>
          {/* Official Brand Logo */}
          <div className="px-2 py-2 mb-3">
            <EnteBazaarLogo
              size="md"
              theme="dark"
              withTagline={true}
              onClick={() => setActiveTab('overview')}
            />
          </div>

          {/* Admin Role Pill matching Image 2 */}
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1D2220] border border-[#2F3733] text-xs font-bold text-emerald-300">
              <span>👑</span>
              <span>Admin</span>
            </div>
          </div>

          {/* Navigation Links matching Image 2 */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-[#A2B1A9] hover:bg-[#202623] hover:text-white"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stores'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Merchants</span>
              </div>
              <span className="bg-[#202623] text-[#A2B1A9] text-[10px] font-black px-2 py-0.5 rounded-full font-sans">
                {shops.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Products</span>
              </div>
              <span className="bg-[#202623] text-[#A2B1A9] text-[10px] font-black px-2 py-0.5 rounded-full font-sans">
                {activeProductList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'moderation'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span>Complaints</span>
              </div>
              {reports.filter((r) => r.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full font-sans">
                  {reports.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Field Clients</span>
              </div>
              <span className="bg-[#202623] text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full font-sans">
                Partners
              </span>
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#A2B1A9] hover:bg-[#202623] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Locations</span>
              </div>
              <span className="bg-[#202623] text-[#A2B1A9] text-[10px] font-black px-2 py-0.5 rounded-full font-sans">
                {locations.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar Actions matching Image 2 */}
        <div className="space-y-3 pt-3 border-t border-[#242A27]">
          {/* Ash card */}
          <div className="p-3 bg-[#1D2220] border border-[#2F3733] rounded-2xl flex items-center gap-2.5">
            <span className="text-xl">🌱</span>
            <div className="text-[10px] text-[#A2B1A9] leading-tight font-medium">
              Together for a stronger local economy.
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout from Admin"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56 xl:ml-64">
        {/* Top Header Bar matching Image 2 */}
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E3ECE7] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 shadow-2xs">
          {/* Left: Back / Menu & Search Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            {onBackToShopper && (
              <button
                type="button"
                onClick={onBackToShopper}
                className="p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA] border border-[#E3ECE7] active:scale-95 rounded-xl text-[#063B2A] transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                title="കസ്റ്റമർ സ്റ്റോറിലേക്ക് മടങ്ങുക (Back to Shopper App)"
                aria-label="Back to Shopper App"
              >
                <ArrowLeft className="w-4 h-4 text-[#0B8F68]" />
                <span className="text-xs font-bold font-malayalam hidden xs:inline">ഷോപ്പർ</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA]/50 border border-[#E3ECE7] active:scale-95 rounded-xl text-[#17221D] transition-colors cursor-pointer shrink-0"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1 min-w-[100px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-3 sm:pr-4 py-2 bg-[#F5F8F6] border border-[#E3ECE7] rounded-xl text-xs font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0B8F68] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Header Quick Actions & Profile matching Image 2 */}
          <div className="flex items-center gap-3">
            {activeTab === 'catalog' && onOpenAddProductModal && (
              <button
                onClick={() => onOpenAddProductModal(catalogCategoryFilter !== 'all' ? catalogCategoryFilter : undefined)}
                className="px-3.5 py-2 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {activeTab === 'stores' && (
              <button
                onClick={() => setIsAddStoreOpen(true)}
                className="px-3.5 py-2 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Merchant</span>
              </button>
            )}

            {/* Notification Bell with red badge */}
            <button
              onClick={() => setActiveTab('moderation')}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border border-white" />
            </button>

            {/* Admin Profile Pill matching Image 2 */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#063B2A] text-white flex items-center justify-center font-black text-xs">
                A
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-800">
                <span>Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 p-2 bg-[#063B2A] border-b border-[#084D37] overflow-x-auto text-xs font-bold font-malayalam">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            📊 അവലോകനം
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'stores' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            🏪 സ്റ്റോറുകൾ ({shops.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            📦 കാറ്റലോഗ് ({activeProductList.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'locations' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            📍 ഹബ്ബുകൾ ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'moderation' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            🛡️ മോഡറേഷൻ ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'subscriptions' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            💳 സബ്സ്ക്രിപ്ഷൻ
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'clients' ? 'bg-[#0B8F68] text-white font-black' : 'text-[#DDF5EA]/70 hover:text-white'
            }`}
          >
            🤝 ഫീൽഡ് ക്ലയന്റ്സ്
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Mobile Admin View */}
          <div className="md:hidden">
            <MobileAdminView
              authUser={authUser || null}
              shops={shops}
              products={products}
              locations={locations}
              reports={reports}
              onOpenDrawer={() => setIsMobileDrawerOpen(true)}
              onBackToShopper={onBackToShopper}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          </div>

          {/* Desktop Overview */}
          <div className="hidden md:block space-y-6 animate-in fade-in duration-150">
            <DesktopAdminOverview
              shops={shops}
              products={products}
              locations={locations}
              reports={reports}
              subStats={subStats}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenAddProduct={() => onOpenAddProductModal?.()}
              onOpenAddStore={() => setIsAddStoreOpen(true)}
            />
          </div>
        </>
      )}

      {/* 2. STORES MANAGER TAB */}
      {activeTab === 'stores' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-dark m-0">Store Directory & Regional Management</h2>
              <span className="text-xs text-gray-400 font-semibold">
                View which region every shop belongs to, filter by location hub, and configure delivery settings
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Region Filter Selector */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="text-gray-400 font-medium">Region:</span>
                <select
                  value={storeRegionFilter}
                  onChange={(e) => setStoreRegionFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer pr-1 text-slate-dark"
                >
                  <option value="all">All Regions ({shops.length} stores)</option>
                  {locations.map((loc) => {
                    const count = shops.filter((s) => s.locationId === loc.id).length;
                    return (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({count} {count === 1 ? 'store' : 'stores'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Search store, region, address..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Reset filter button if active */}
              {(storeRegionFilter !== 'all' || storeSearch) && (
                <button
                  onClick={() => {
                    setStoreRegionFilter('all');
                    setStoreSearch('');
                  }}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}

              <button
                onClick={() => handleOpenAddStoreWithLocation(storeRegionFilter !== 'all' ? storeRegionFilter : undefined)}
                className="flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store</span>
              </button>
            </div>
          </div>

          {/* Quick Region Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-gray-100 text-xs">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Filter Hub:
            </span>
            <button
              onClick={() => setStoreRegionFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                storeRegionFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Regions ({shops.length})
            </button>
            {locations.map((loc) => {
              const locCount = shops.filter((s) => s.locationId === loc.id).length;
              const isSelected = storeRegionFilter === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setStoreRegionFilter(loc.id)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>📍 {loc.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {locCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stores Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 rounded-l-xl">Store Name</th>
                  <th className="py-3 px-3">Region / Location Hub</th>
                  <th className="py-3 px-3">Street Address</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Delivery Policy</th>
                  <th className="py-3 px-3 rounded-r-xl text-right">Verification & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <div className="font-bold text-sm text-gray-600">No stores found</div>
                      <div className="text-xs mt-0.5">
                        {storeRegionFilter !== 'all'
                          ? `No shops registered in ${locations.find((l) => l.id === storeRegionFilter)?.name || 'this region'}.`
                          : 'Try adjusting your search or region filter.'}
                      </div>
                      {storeRegionFilter !== 'all' && (
                        <button
                          onClick={() => handleOpenAddStoreWithLocation(storeRegionFilter)}
                          className="mt-3 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Store to {locations.find((l) => l.id === storeRegionFilter)?.name}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => {
                    const loc = locations.find((l) => l.id === shop.locationId);
                    return (
                      <tr key={shop.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* 1. Store Name */}
                        <td className="py-3.5 px-3">
                          <b className="font-extrabold text-slate-dark text-sm block">{shop.name}</b>
                          <span className="text-[11px] text-gray-400 font-semibold">{shop.phone || 'No phone'}</span>
                        </td>

                        {/* 2. Region / Location Hub */}
                        <td className="py-3.5 px-3">
                          {loc ? (
                            <div>
                              <button
                                onClick={() => setStoreRegionFilter(loc.id)}
                                title={`Filter stores in ${loc.name}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 rounded-lg text-xs font-extrabold cursor-pointer transition-colors"
                              >
                                <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                                <span>{loc.name}</span>
                              </button>
                              <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                                {loc.subArea ? `${loc.subArea}, ` : ''}{loc.state}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{shop.locationId || 'Unassigned'}</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Street Address */}
                        <td className="py-3.5 px-3 max-w-xs">
                          <span className="text-slate-dark font-medium block truncate">{shop.address}</span>
                          <span className="text-[10px] text-gray-400">📍 {shop.distanceKm} km from hub center</span>
                        </td>

                        {/* 4. Type */}
                        <td className="py-3.5 px-3">
                          <span className="capitalize px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px]">
                            {shop.shopType?.replace('_', ' ') || 'Supermarket'}
                          </span>
                        </td>

                        {/* 5. Rating */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-amber-700">★ {shop.rating}</span>{' '}
                          <span className="text-gray-400">({shop.reviewCount})</span>
                        </td>

                        {/* 6. Delivery Policy */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-dark">₹{shop.deliveryFee} fee</span>
                          <span className="text-[10px] text-emerald-600 block">
                            Free over ₹{shop.freeDeliveryThreshold}
                          </span>
                        </td>

                        {/* 7. Verification & Actions */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStoreVerify(shop)}
                              title="Toggle store verification"
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                                shop.isVerified
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {shop.isVerified ? '✓ Verified' : 'Unverified'}
                            </button>
                            <button
                              onClick={() => handleStartEditShop(shop)}
                              title="Edit store details & region"
                              className="p-1.5 bg-gray-100 hover:bg-brand-50 text-gray-600 hover:text-brand-700 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStore(shop)}
                              disabled={deletingShopId === shop.id}
                              title={`Delete ${shop.name}`}
                              className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MASTER CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Master Items</span>
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-dark">{activeProductList.length}</div>
              <span className="text-[11px] text-gray-400 font-medium">Across 20 grocery categories</span>
            </div>

            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Visible In Filter</span>
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">{filteredAndSortedProducts.length}</div>
              <span className="text-[11px] text-blue-600/80 font-medium">
                {catalogCategoryFilter !== 'all'
                  ? MASTER_CATALOG_CATEGORIES.find((c) => c.id === catalogCategoryFilter)?.name
                  : 'All categories selected'}
              </span>
            </div>

            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Priced In Shops</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{quickFilterCounts.priced}</div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {((quickFilterCounts.priced / (activeProductList.length || 1)) * 100).toFixed(0)}% mapped to retail stores
              </span>
            </div>

            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Organic Certified</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">{quickFilterCounts.organic}</div>
              <span className="text-[11px] text-amber-700 font-medium">Eco-friendly & pesticide-free</span>
            </div>
          </div>

          {/* Main Catalog Management Card */}
          <div className="bg-white border border-[#E3ECE7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Category Ribbon & Category Dropdown */}
            <div className="space-y-2.5 pb-3 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-dark">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Category Navigator</span>
                  <span className="text-[11px] font-bold text-gray-400">
                    ({categoryCounts[catalogCategoryFilter] || 0} products)
                  </span>
                </div>

                {/* Quick Category Dropdown for Fast Switching */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">Jump to:</span>
                  <select
                    value={catalogCategoryFilter}
                    onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-dark outline-none cursor-pointer focus:border-emerald-500"
                  >
                    {MASTER_CATALOG_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({categoryCounts[cat.id] || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Scrollable Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {MASTER_CATALOG_CATEGORIES.map((cat) => {
                  const isSelected = catalogCategoryFilter === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCatalogCategoryFilter(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : count > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toolbar: Search, Filters, Sort, and Controls */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              {/* Left: Search input + Clear */}
              <div className="flex items-center gap-2 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search product name, Malayalam, category, notes..."
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                  {catalogSearch && (
                    <button
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleRefreshCatalog}
                  disabled={isLoadingCatalog}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  title="Reload from server"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoadingCatalog ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="hidden sm:inline">{isLoadingCatalog ? 'Loading...' : 'Refresh'}</span>
                </button>
              </div>

              {/* Right: Sort selector, Page Size, Add Product */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* Sort selector */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-400 font-medium hidden sm:inline">Sort:</span>
                  <select
                    value={catalogSort}
                    onChange={(e) => setCatalogSort(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-dark outline-none cursor-pointer"
                  >
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="name-desc">Name (Z → A)</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {/* Items per page */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
                  <span className="text-gray-400 font-medium">Rows:</span>
                  <select
                    value={catalogPageSize}
                    onChange={(e) => setCatalogPageSize(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-dark outline-none cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                  </select>
                </div>

                {/* Primary Add Master Product Button */}
                <button
                  onClick={() => onOpenAddProductModal?.(catalogCategoryFilter !== 'all' ? catalogCategoryFilter : undefined)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Quick Filter:</span>
              <button
                onClick={() => setCatalogQuickFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogQuickFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({activeProductList.length})
              </button>
              <button
                onClick={() => setCatalogQuickFilter('organic')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogQuickFilter === 'organic'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>🌿 Organic</span>
                <span className="text-[10px] opacity-80">({quickFilterCounts.organic})</span>
              </button>
              <button
                onClick={() => setCatalogQuickFilter('offers')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogQuickFilter === 'offers'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>🏷️ Special Offers</span>
                <span className="text-[10px] opacity-80">({quickFilterCounts.offers})</span>
              </button>
              <button
                onClick={() => setCatalogQuickFilter('priced')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogQuickFilter === 'priced'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span>🏪 Priced in Shops</span>
                <span className="text-[10px] opacity-80">({quickFilterCounts.priced})</span>
              </button>
              <button
                onClick={() => setCatalogQuickFilter('unpriced')}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogQuickFilter === 'unpriced'
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>📦 Base Catalog Only</span>
                <span className="text-[10px] opacity-80">({quickFilterCounts.unpriced})</span>
              </button>

              {(catalogSearch || catalogCategoryFilter !== 'all' || catalogQuickFilter !== 'all') && (
                <button
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogCategoryFilter('all');
                    setCatalogQuickFilter('all');
                  }}
                  className="ml-auto text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Batch Actions Bar (Visible when items selected) */}
            {selectedProductIds.size > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedProductIds.size}
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    {selectedProductIds.size} {selectedProductIds.size === 1 ? 'item' : 'items'} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSelectAll}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100/50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {selectedProductIds.size === paginatedProducts.length ? 'Deselect Page' : 'Select All on Page'}
                  </button>
                  <button
                    onClick={() => setSelectedProductIds(new Set())}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={isBatchDeleting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBatchDeleting ? 'Deleting...' : `Delete Selected (${selectedProductIds.size})`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Products Table or Empty State */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-gray-50/60 rounded-3xl border border-dashed border-gray-300 space-y-3">
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-2xl mx-auto shadow-xs">
                  {MASTER_CATALOG_CATEGORIES.find((c) => c.id === catalogCategoryFilter)?.icon || '🔍'}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-dark mb-1">
                    No products matched your criteria
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {catalogSearch
                      ? `No master products match "${catalogSearch}". Try clearing your search or switching categories.`
                      : `No products found under the current filters.`}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCatalogSearch('');
                      setCatalogCategoryFilter('all');
                      setCatalogQuickFilter('all');
                    }}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => onOpenAddProductModal?.(catalogCategoryFilter !== 'all' ? catalogCategoryFilter : undefined)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Master Product</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Touch-Friendly Product Cards (< md) */}
                <div className="block md:hidden space-y-2.5">
                  {paginatedProducts.map((p) => {
                    const priceValues = Object.values(p.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
                    const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
                    const catMeta = MASTER_CATALOG_CATEGORIES.find((c) => c.id.toLowerCase() === p.categoryId?.toLowerCase());
                    const isSelected = selectedProductIds.has(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => setEditingProduct(p)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white active:scale-[0.99] shadow-2xs ${
                          isSelected ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 shrink-0 p-1 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            <ProductImage
                              productId={p.id}
                              image={p.image}
                              emoji={p.emoji || catMeta?.icon || '📦'}
                              alt={p.name}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain"
                              fallbackEmojiClassName="text-2xl"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="font-extrabold text-slate-900 text-sm truncate m-0">
                                {p.name}
                              </h4>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="rounded text-emerald-600 cursor-pointer"
                              />
                            </div>

                            {p.nutritionalNote && (
                              <p className="text-[11px] text-gray-500 truncate m-0">
                                {p.nutritionalNote}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                                {catMeta?.icon || '🏷️'} {p.categoryId}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                                {p.defaultUnit}
                              </span>
                              {p.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                                  {p.badge}
                                </span>
                              )}
                              {p.isOrganic && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                                  🌿 Organic
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Prices row & Touch Edit Button */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Store Price</div>
                            <div className="text-sm font-black text-emerald-700">
                              {minPrice !== null ? `₹${minPrice}` : 'Unpriced'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(p);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(p.id, p.name);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/90 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={paginatedProducts.length > 0 && selectedProductIds.size === paginatedProducts.length}
                            onChange={handleToggleSelectAll}
                            className="rounded text-emerald-600 cursor-pointer"
                            title="Select all on this page"
                          />
                        </th>
                        <th className="py-3 px-3.5">Product & Details (Click to edit)</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Default Unit</th>
                        <th className="py-3 px-3">Store Price</th>
                        <th className="py-3 px-3">Organic</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {paginatedProducts.map((p) => {
                        const priceValues = Object.values(p.prices || {}).filter((v) => typeof v === 'number' && !isNaN(v));
                        const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
                        const shopCount = priceValues.length;
                        const catMeta = MASTER_CATALOG_CATEGORIES.find((c) => c.id.toLowerCase() === p.categoryId?.toLowerCase());
                        const isSelected = selectedProductIds.has(p.id);

                        return (
                          <tr
                            key={p.id}
                            onClick={() => setEditingProduct(p)}
                            className={`transition-colors cursor-pointer group ${
                              isSelected ? 'bg-emerald-50/60' : 'hover:bg-emerald-50/40'
                            }`}
                            title="Click anywhere on this row to edit price and details"
                          >
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="rounded text-emerald-600 cursor-pointer"
                              />
                            </td>

                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 shrink-0 p-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-xs group-hover:border-emerald-300">
                                  <ProductImage
                                    productId={p.id}
                                    image={p.image}
                                    emoji={p.emoji || catMeta?.icon || '📦'}
                                    alt={p.name}
                                    className="w-full h-full"
                                    imgClassName="w-full h-full object-contain"
                                    fallbackEmojiClassName="text-2xl"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <b className="font-extrabold text-slate-dark block text-xs tracking-tight truncate max-w-sm sm:max-w-md group-hover:text-emerald-800">
                                    {p.name}
                                  </b>
                                  {p.nutritionalNote && (
                                    <span className="text-[11px] text-gray-500 font-medium block truncate max-w-sm sm:max-w-md">
                                      {p.nutritionalNote}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    {p.badge && (
                                      <span className="px-1.5 py-0.2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-md">
                                        {p.badge}
                                      </span>
                                    )}
                                    {p.isOrganic && (
                                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded-md">
                                        🌿 Organic
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCatalogCategoryFilter(p.categoryId?.toLowerCase() || 'all');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-transparent rounded-lg text-xs font-bold text-gray-700 transition-all cursor-pointer"
                                title={`Filter by ${catMeta?.name || p.categoryId}`}
                              >
                                <span>{catMeta?.icon || '🏷️'}</span>
                                <span className="capitalize">{catMeta?.name || p.categoryId}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 text-gray-600 font-semibold">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md font-mono text-[11px]">
                                {p.defaultUnit}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {minPrice !== null ? (
                                <div className="flex items-center gap-1.5">
                                  <div>
                                    <span className="font-black text-emerald-700 text-xs">₹{minPrice}</span>
                                    <span className="text-[10px] text-gray-400 font-medium block">
                                      in {shopCount} {shopCount === 1 ? 'store' : 'stores'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                                    Edit
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium text-[11px] bg-gray-100 px-2 py-0.5 rounded-md">
                                  Catalog Base
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {p.isOrganic ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[10px]">
                                  🌿 Yes
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px] font-medium">No</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all cursor-pointer shadow-xs"
                                  title="Edit Master Product Details & Prices"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer shadow-xs"
                                  title="Delete from Master Catalog"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-600">
                  <div className="font-medium">
                    Showing{' '}
                    <span className="font-black text-slate-dark">
                      {filteredAndSortedProducts.length === 0 ? 0 : (currentPage - 1) * catalogPageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-black text-slate-dark">
                      {Math.min(currentPage * catalogPageSize, filteredAndSortedProducts.length)}
                    </span>{' '}
                    of <span className="font-black text-slate-dark">{filteredAndSortedProducts.length}</span> products
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCatalogPage(1)}
                      disabled={currentPage <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers Window */}
                    {(() => {
                      const pages: number[] = [];
                      const maxButtons = 5;
                      let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                      let end = Math.min(totalPages, start + maxButtons - 1);
                      if (end - start + 1 < maxButtons) {
                        start = Math.max(1, end - maxButtons + 1);
                      }
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      return pages.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCatalogPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white shadow-xs font-black'
                              : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => setCatalogPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCatalogPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LOCATIONS MANAGER TAB */}
      {activeTab === 'locations' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs animate-in fade-in duration-150 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-black text-slate-dark m-0">Supported Regions & Shopping Hubs</h2>
              <span className="text-xs text-gray-400 font-semibold">
                View which grocery stores & shops are registered in each geographic region
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search regions & hubs..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <button
                onClick={() => setIsAddLocationOpen(true)}
                className="flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Region Hub</span>
              </button>
            </div>
          </div>

          {/* Location Hub Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Regions</div>
              <div className="text-xl font-black text-slate-dark mt-0.5">{locations.length} Hubs</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-400">Active Stores</div>
              <div className="text-xl font-black text-brand-700 mt-0.5">{shops.length} Stores</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-400">Covered Hubs</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {locations.filter((l) => shops.some((s) => s.locationId === l.id)).length} / {locations.length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-400">Avg Shops / Hub</div>
              <div className="text-xl font-black text-blue-700 mt-0.5">
                {locations.length > 0 ? (shops.length / locations.length).toFixed(1) : 0}
              </div>
            </div>
          </div>

          {/* Locations & Shops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations
              .filter(
                (loc) =>
                  !locationSearch ||
                  loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                  loc.subArea?.toLowerCase().includes(locationSearch.toLowerCase()) ||
                  loc.state.toLowerCase().includes(locationSearch.toLowerCase())
              )
              .map((loc) => {
                const locShops = shops.filter((s) => s.locationId === loc.id);
                return (
                  <div
                    key={loc.id}
                    className="border border-gray-200 rounded-3xl p-5 bg-gray-50/40 hover:bg-white hover:border-brand-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-dark">📍 {loc.name}</span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                locShops.length > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {locShops.length} {locShops.length === 1 ? 'Store Present' : 'Stores Present'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium block mt-0.5">
                            {loc.subArea} • {loc.state}, {loc.country}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full shrink-0">
                          {loc.currency} ({loc.currencySymbol})
                        </span>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">
                          📍 {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          Coverage: {loc.radiusKm || 15} km
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMapPickerState({
                              isOpen: true,
                              title: `Coverage Area for ${loc.name} Hub`,
                              subtitle: `Adjust center coordinates and customer connection radius for ${loc.name}.`,
                              initialLat: loc.lat || 10.9155,
                              initialLng: loc.lng || 75.9238,
                              initialRadiusKm: loc.radiusKm || 15,
                              isHubMode: true,
                              confirmButtonText: 'Update Hub Area',
                              onConfirm: async (coords) => {
                                try {
                                  const updated = await createLocationApi({
                                    id: loc.id,
                                    name: loc.name,
                                    subArea: loc.subArea,
                                    state: loc.state,
                                    country: loc.country,
                                    currency: loc.currency,
                                    currencySymbol: loc.currencySymbol,
                                    lat: coords.lat,
                                    lng: coords.lng,
                                    radiusKm: coords.radiusKm || 15,
                                  });
                                  onLocationsUpdated(locations.map((l) => (l.id === loc.id ? { ...l, ...updated } : l)));
                                } catch (e) {
                                  console.error('Failed to update hub area:', e);
                                }
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>View/Edit Area on Map</span>
                        </button>
                      </div>
                    </div>

                    {/* Shops Present in this Region */}
                    <div className="bg-white rounded-2xl p-3.5 border border-gray-100">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-brand-600" />
                          <span>Shops in this Region ({locShops.length})</span>
                        </span>
                        <button
                          onClick={() => handleOpenAddStoreWithLocation(loc.id)}
                          className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Shop</span>
                        </button>
                      </div>

                      {locShops.length === 0 ? (
                        <div className="py-3 text-center text-gray-400">
                          <p className="text-xs font-medium">No shops registered in this region yet.</p>
                          <button
                            onClick={() => handleOpenAddStoreWithLocation(loc.id)}
                            className="mt-2 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Onboard First Shop Here</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {locShops.map((shop) => (
                            <div
                              key={shop.id}
                              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-brand-50/40 hover:border-brand-200 transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <b className="text-xs font-bold text-slate-dark truncate">{shop.name}</b>
                                  <span className="capitalize px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded text-[9px] font-bold">
                                    {shop.shopType?.replace('_', ' ') || 'Supermarket'}
                                  </span>
                                  {shop.isVerified && (
                                    <span className="text-[10px] text-emerald-600 font-bold" title="Verified Outlet">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate mt-0.5">{shop.address}</div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-bold text-amber-700">★ {shop.rating}</span>
                                <button
                                  onClick={() => handleStartEditShop(shop)}
                                  title="Edit Store / Reassign Region"
                                  className="p-1 bg-white hover:bg-brand-100 text-gray-600 hover:text-brand-800 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStore(shop)}
                                  disabled={deletingShopId === shop.id}
                                  title={`Delete ${shop.name}`}
                                  className="p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                      {locShops.length > 0 ? (
                        <button
                          onClick={() => {
                            setStoreRegionFilter(loc.id);
                            setActiveTab('stores');
                          }}
                          className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>View {locShops.length} Stores in Directory Table</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No stores currently active in {loc.name}</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. MODERATION QUEUE TAB */}
      {activeTab === 'moderation' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs animate-in fade-in duration-150">
          <div className="pb-4 border-b border-gray-100 mb-4">
            <h2 className="text-xl font-black text-slate-dark m-0">Crowd-Report Moderation Queue</h2>
            <span className="text-xs text-gray-400 font-semibold">
              Approve or reject price updates submitted by local shoppers
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-sm font-black text-slate-dark">{r.productName}</b>
                    <span className="text-xs text-gray-400">at <b>{r.shopName}</b></span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Reported Price: <b className="text-brand-700">₹{r.reportedPrice}</b> / {r.unit} · Submitted by {r.reportedBy} ({r.timestamp})
                  </div>
                </div>

                {r.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModerateReport(r.id, 'approve')}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleModerateReport(r.id, 'reject')}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-gray-400">
                    Decision recorded
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SUBSCRIPTIONS & MONETIZATION TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Subscriptions Revenue Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">₹</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">
                ₹{subStats ? Math.round(subStats.totalRevenuePaise / 100).toLocaleString() : '0'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Direct UPI & Gateway Collections</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Monthly Recurring (MRR)</span>
                <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">📈</span>
              </div>
              <p className="text-2xl font-black text-indigo-300 mt-2">
                ₹{subStats ? Math.round(subStats.monthlyRecurringPaise / 100).toLocaleString() : '0'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Estimated normalized monthly run-rate</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Subscriptions</span>
                <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold">✓</span>
              </div>
              <p className="text-2xl font-black text-white mt-2">{subStats?.activeCount ?? 0}</p>
              <p className="text-[11px] text-slate-400 mt-1">Unlocked merchant dashboards</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Expired / Inactive</span>
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold">⚠️</span>
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">{subStats?.expiredCount ?? 0}</p>
              <p className="text-[11px] text-slate-400 mt-1">Requires renewal / follow-up</p>
            </div>
          </div>

          {/* Plan Configurations Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-dark">Subscription Tier Offerings</h3>
                <p className="text-xs text-gray-400">Public pricing and durations offered to registering shop partners</p>
              </div>
              <button
                onClick={() => setIsNewPlanOpen(true)}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Tier Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{plan.name}</span>
                        {plan.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {plan.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-black text-brand-700">
                      ₹{Math.round(plan.pricePaise / 100)} <span className="text-xs font-normal text-gray-500">/ {plan.durationDays} days</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-600">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePlanActive(plan)}
                      className="text-xs font-bold text-gray-600 hover:text-brand-600 cursor-pointer"
                    >
                      {plan.isActive ? 'Deactivate Tier' : 'Activate Tier'}
                    </button>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {plan.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant Subscriptions Management Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-dark">Active & Historical Store Subscriptions</h3>
                <p className="text-xs text-gray-400">Manage merchant memberships, extend days, or cancel access</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search store / email..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button
                  onClick={loadSubscriptionData}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 cursor-pointer"
                  title="Refresh subscription data"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {subLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading subscriptions list...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Merchant / Store</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Remaining</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subList
                      .filter((s) => {
                        const q = subSearch.toLowerCase().trim();
                        const matchesSearch =
                          !q ||
                          s.merchantName?.toLowerCase().includes(q) ||
                          s.merchantEmail?.toLowerCase().includes(q) ||
                          s.shopName?.toLowerCase().includes(q);
                        const matchesStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{sub.shopName || sub.merchantName || 'Store Partner'}</div>
                            <div className="text-[11px] text-gray-400">{sub.merchantEmail}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{sub.plan?.name || sub.planId}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'EXPIRED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {sub.status === 'ACTIVE' ? (
                              <span className="font-bold text-slate-700">{sub.daysRemaining} days</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(sub.expiresAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setExtendingSub(sub)}
                                className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                Extend
                              </button>
                              {sub.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleCancelSubscription(sub.id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {subList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">
                          No merchant subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Ledger & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Ledger */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-black text-slate-dark mb-1">Recent Subscription Payments</h3>
              <p className="text-xs text-gray-400 mb-4">Complete log of UPI & simulated merchant activations</p>
              <div className="overflow-y-auto max-h-[360px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Merchant</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-800">{p.merchantName || 'Merchant'}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{p.providerOrderId || p.id}</div>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-800">₹{Math.round(p.amountPaise / 100)}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {subPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-xs">
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-black text-slate-dark mb-1">Administrative Audit Logs</h3>
              <p className="text-xs text-gray-400 mb-4">Realtime audit trail of subscription activations, modifications & extensions</p>
              <div className="overflow-y-auto max-h-[360px] space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 border border-gray-200/70 rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wide">{log.action}</span>
                      <span className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Entity: <span className="font-mono text-gray-800">{log.entityType} ({log.entityId})</span>
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1 text-[10px] font-mono text-gray-500 truncate bg-white p-1.5 rounded border border-gray-200">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-xs">No audit logs recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FIELD CLIENTS / ONBOARDING PARTNERS MANAGEMENT */}
      {activeTab === 'clients' && (
        <ClientManagementTab token={authUser?.token} />
      )}

      {/* Extend Subscription Modal */}
      {extendingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-black text-slate-dark mb-1">Extend Subscription</h3>
            <p className="text-xs text-gray-400 mb-4">
              Grant additional active validity to <span className="font-bold text-slate-800">{extendingSub.shopName || extendingSub.merchantName}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Days to Add</label>
                <input
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendingSub(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtendSubscription}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Extension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {isNewPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-black text-slate-dark mb-3">Create Subscription Plan Tier</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Growth Tier"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPlanPriceRs}
                    onChange={(e) => setNewPlanPriceRs(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-bold text-brand-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Highlight Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Most Popular, 30% Off"
                  value={newPlanBadge}
                  onChange={(e) => setNewPlanBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={newPlanFeatures}
                  onChange={(e) => setNewPlanFeatures(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <h3 className="text-lg font-black text-slate-dark mb-1">Onboard New Store</h3>
            <p className="text-xs text-gray-400 mb-4">
              Determine the region and assign this grocery outlet to a shopping hub
            </p>
            <form onSubmit={handleCreateStore} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Lulu Hypermarket, Nilgiris Mart"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Region / Location Hub <span className="text-brand-600">*</span>
                </label>
                <select
                  value={newStoreLocationId}
                  onChange={(e) => setNewStoreLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-200 rounded-xl text-xs font-bold outline-none text-slate-dark"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.name} ({loc.subArea || loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  placeholder="e.g. Near New Bus Stand, Bypass Road"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStorePhone}
                  onChange={(e) => setNewStorePhone(e.target.value)}
                  placeholder="e.g. +91 98470 12345"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Type</label>
                  <select
                    value={newStoreType}
                    onChange={(e) => setNewStoreType(e.target.value as any)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="supermarket">Supermarket</option>
                    <option value="local_mart">Local Grocery</option>
                    <option value="organic">Organic Bazaar</option>
                    <option value="wholesale">Wholesale Mandi</option>
                    <option value="quick_commerce">Quick Commerce (15m)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newStoreDistance}
                    onChange={(e) => setNewStoreDistance(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Auto Merchant Login Account */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    🔑 Merchant Login Account
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    Auto-created
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-0.5">Manager Email (Optional)</label>
                    <input
                      type="email"
                      value={newStoreEmail}
                      onChange={(e) => setNewStoreEmail(e.target.value)}
                      placeholder="e.g. store@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-0.5">Login Password</label>
                    <input
                      type="text"
                      value={newStorePassword}
                      onChange={(e) => setNewStorePassword(e.target.value)}
                      placeholder="password123"
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-blue-700">
                  The store manager can immediately log in to PriceTeller with this email (or store name) and password to manage prices & products!
                </p>
              </div>

              {/* Map Coordinates & GPS Picker for New Store */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <span className="text-xs font-bold text-emerald-950">Store Map Coordinates (GPS)</span>
                  {newStoreLat !== undefined && newStoreLng !== undefined ? (
                    <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {newStoreLat.toFixed(5)}, {newStoreLng.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      Coordinates Not Set
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMapPickerState({
                      isOpen: true,
                      title: `Pick Coordinates for ${newStoreName || 'New Store'}`,
                      subtitle: 'Pinpoint store location on the map or use live GPS.',
                      initialLat: newStoreLat || locations.find((l) => l.id === newStoreLocationId)?.lat || 10.9155,
                      initialLng: newStoreLng || locations.find((l) => l.id === newStoreLocationId)?.lng || 75.9238,
                      initialAddress: newStoreAddress,
                      confirmButtonText: 'Set Store Coordinates',
                      onConfirm: (coords) => {
                        setNewStoreLat(coords.lat);
                        setNewStoreLng(coords.lng);
                        if (coords.address && !newStoreAddress) {
                          setNewStoreAddress(coords.address);
                        }
                      },
                    });
                  }}
                  className="w-full py-1.5 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📍 Set Exact Coordinates on Map / GPS</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-dark mb-1">Edit Store & Region Assignment</h3>
            <p className="text-xs text-gray-400 mb-4">
              Update store information or reassign to a different region hub
            </p>
            <form onSubmit={handleUpdateStore} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Region / Location Hub <span className="text-brand-600">*</span>
                </label>
                <select
                  value={editStoreLocationId}
                  onChange={(e) => setEditStoreLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50 border border-brand-300 rounded-xl text-xs font-bold outline-none text-slate-dark"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.name} ({loc.subArea || loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={editStoreAddress}
                  onChange={(e) => setEditStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editStorePhone}
                  onChange={(e) => setEditStorePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Type</label>
                  <select
                    value={editStoreType}
                    onChange={(e) => setEditStoreType(e.target.value as any)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="supermarket">Supermarket</option>
                    <option value="local_mart">Local Grocery</option>
                    <option value="organic">Organic Bazaar</option>
                    <option value="wholesale">Wholesale Mandi</option>
                    <option value="quick_commerce">Quick Commerce (15m)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editStoreDistance}
                    onChange={(e) => setEditStoreDistance(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={editStoreDeliveryFee}
                    onChange={(e) => setEditStoreDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={editStoreFreeDeliveryThreshold}
                    onChange={(e) => setEditStoreFreeDeliveryThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Map Coordinates & GPS Picker for Edit Store */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <span className="text-xs font-bold text-emerald-950">Store Map Coordinates (GPS)</span>
                  {editStoreLat !== undefined && editStoreLng !== undefined ? (
                    <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {editStoreLat.toFixed(5)}, {editStoreLng.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      Coordinates Not Set
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMapPickerState({
                      isOpen: true,
                      title: `Pick Coordinates for ${editStoreName}`,
                      subtitle: 'Pinpoint store location on the map or use live GPS.',
                      initialLat: editStoreLat || locations.find((l) => l.id === editStoreLocationId)?.lat || 10.9155,
                      initialLng: editStoreLng || locations.find((l) => l.id === editStoreLocationId)?.lng || 75.9238,
                      initialAddress: editStoreAddress,
                      confirmButtonText: 'Apply Coordinates',
                      onConfirm: (coords) => {
                        setEditStoreLat(coords.lat);
                        setEditStoreLng(coords.lng);
                        if (coords.address) {
                          setEditStoreAddress(coords.address);
                        }
                      },
                    });
                  }}
                  className="w-full py-1.5 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📍 Set Exact Coordinates on Map / GPS</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editStoreVerified"
                  checked={editStoreIsVerified}
                  onChange={(e) => setEditStoreIsVerified(e.target.checked)}
                  className="rounded text-brand-600 cursor-pointer"
                />
                <label htmlFor="editStoreVerified" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Verified Store Outlet
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDeleteStore(editingShop)}
                  disabled={deletingShopId === editingShop.id}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Store</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingShop(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <h3 className="text-lg font-black text-slate-dark mb-3">Add Shopping Location Hub</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City / Town Name</label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Palakkad, Thrissur, Mumbai"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sub-Area / Center</label>
                <input
                  type="text"
                  value={newLocSubArea}
                  onChange={(e) => setNewLocSubArea(e.target.value)}
                  placeholder="e.g. Central Market, MG Road"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newLocState}
                  onChange={(e) => setNewLocState(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              {/* Hub Center Coordinates & Radius Selector */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
                  <span>Hub Center & Radius Coverage</span>
                  <span className="font-mono text-[10px] text-emerald-800">
                    {newLocLat.toFixed(3)}, {newLocLng.toFixed(3)} ({newLocRadiusKm}km)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMapPickerState({
                      isOpen: true,
                      title: `Set Center & Coverage Area for ${newLocName || 'New Hub'}`,
                      subtitle: 'Choose the center of this hub and set the customer coverage circle.',
                      initialLat: newLocLat,
                      initialLng: newLocLng,
                      initialRadiusKm: newLocRadiusKm,
                      isHubMode: true,
                      confirmButtonText: 'Set Hub Area',
                      onConfirm: (coords) => {
                        setNewLocLat(coords.lat);
                        setNewLocLng(coords.lng);
                        if (coords.radiusKm) {
                          setNewLocRadiusKm(coords.radiusKm);
                        }
                      },
                    });
                  }}
                  className="w-full py-1.5 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📍 Pinpoint Center & Radius on Map</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store & Merchant Account Created Credentials Modal */}
      {createdStoreCredential && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Store & Merchant Login Ready!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Store <span className="font-bold text-gray-800">{createdStoreCredential.shopName}</span> has been added and a merchant account was generated.
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-left space-y-2">
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Merchant Login Credentials
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Email:</span>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {createdStoreCredential.email}
                </span>
              </div>
              {createdStoreCredential.username && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Username:</span>
                  <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {createdStoreCredential.username}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Password:</span>
                <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {createdStoreCredential.password}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              The store partner can now use these credentials to log in to the Merchant Portal and manage stock, prices, and orders.
            </p>

            <button
              onClick={() => setCreatedStoreCredential(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Done & Continue
            </button>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Edit Master Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          shops={shops}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={(updated) => {
            setMasterProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            onProductsUpdated(
              activeProductList.map((item) => (item.id === updated.id ? updated : item))
            );
          }}
        />
      )}

      {/* Reusable Map Picker Modal for Admin Store & Hub Location Configuration */}
      <LocationMapPickerModal
        isOpen={mapPickerState.isOpen}
        onClose={() => setMapPickerState((prev) => ({ ...prev, isOpen: false }))}
        initialLat={mapPickerState.initialLat}
        initialLng={mapPickerState.initialLng}
        initialRadiusKm={mapPickerState.initialRadiusKm}
        initialAddress={mapPickerState.initialAddress}
        title={mapPickerState.title}
        subtitle={mapPickerState.subtitle}
        isHubMode={mapPickerState.isHubMode}
        confirmButtonText={mapPickerState.confirmButtonText}
        onConfirm={mapPickerState.onConfirm}
      />

      {/* Mobile Navigation Drawer with Admin Mode */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        mode="admin"
        authUser={authUser || null}
        adminTab={activeTab}
        onSelectAdminTab={(tab) => {
          setActiveTab(tab as any);
          setIsMobileDrawerOpen(false);
        }}
        onBackToShopper={() => {
          setIsMobileDrawerOpen(false);
          onBackToShopper();
        }}
        onLogout={onLogout || onBackToShopper}
      />
    </div>
  );
};
