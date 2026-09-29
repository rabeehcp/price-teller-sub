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
  deleteSubscriptionPlanApi,
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
  fetchAdminUsers,
  deleteAdminUser,
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
  Briefcase,
  Star,
  Phone,
  Truck,
  Navigation,
  BadgeCheck,
  X,
} from 'lucide-react';
import { LocationMapPickerModal } from './LocationMapPickerModal';
import { MobileAdminView } from './MobileAdminView';
import { MobileDrawer } from './MobileDrawer';
import { EnteBazaarLogo } from './EnteBazaarLogo';
import { DesktopAdminOverview } from './DesktopAdminOverview';
import { ClientManagementTab } from './ClientManagementTab';
import { AdminSubscriptionTab } from './AdminSubscriptionTab';

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
  const [activeTab, setActiveTab] = useState<string>('overview');

  const effectiveTab =
    activeTab === 'dashboard' ? 'overview' :
    activeTab === 'shops' ? 'stores' :
    activeTab === 'products' ? 'catalog' :
    activeTab;

  // User Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'shopper' | 'consumer' | 'merchant' | 'admin'>('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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
  const [storeTypeFilter, setStoreTypeFilter] = useState<string>('all');
  const [storeVerificationFilter, setStoreVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showAllHubs, setShowAllHubs] = useState<boolean>(false);
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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

  const loadUsers = async () => {
    if (!authUser?.token) return;
    setUsersLoading(true);
    try {
      const data = await fetchAdminUsers(authUser.token);
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!authUser?.token) return;
    if (userToDelete.id === 'admin-1' || userToDelete.role === 'admin') {
      alert('Cannot delete primary Administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${userToDelete.name}" (${userToDelete.email}) from the database?`)) {
      return;
    }
    setDeletingUserId(userToDelete.id);
    try {
      await deleteAdminUser(userToDelete.id, authUser.token);
      setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    if ((effectiveTab === 'subscriptions' || effectiveTab === 'audit' || effectiveTab === 'overview') && authUser?.token) {
      loadSubscriptionData();
    }
    if ((effectiveTab === 'users' || effectiveTab === 'overview') && authUser?.token) {
      loadUsers();
    }
  }, [effectiveTab, authUser?.token]);

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

  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!authUser?.token) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete plan "${plan.name}" (ID: ${plan.id})?\n\nThis will remove it from the database.`
    );
    if (!confirmed) return;

    setDeletingPlanId(plan.id);
    try {
      await deleteSubscriptionPlanApi(plan.id, authUser.token);
      setSubPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      alert(err.message || 'Failed to delete plan');
    } finally {
      setDeletingPlanId(null);
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
      try {
        await deleteProductApi(id);
        setMasterProducts((prev) => prev.filter((p) => p.id !== id));
        onProductsUpdated(products.filter((p) => p.id !== id));
      } catch (err: any) {
        console.error('Failed to delete product:', err);
        alert(err.message || 'Failed to delete product from database');
      }
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
      const matchesType = storeTypeFilter === 'all' || (s.shopType || 'supermarket') === storeTypeFilter;
      const matchesVerification =
        storeVerificationFilter === 'all' ||
        (storeVerificationFilter === 'verified' ? s.isVerified : !s.isVerified);

      return matchesSearch && matchesRegion && matchesType && matchesVerification;
    });
  }, [shops, storeSearch, storeRegionFilter, storeTypeFilter, storeVerificationFilter, locations]);

  const storeMetrics = useMemo(() => {
    const total = shops.length;
    const verified = shops.filter((s) => s.isVerified).length;
    const activeHubIds = new Set(shops.map((s) => s.locationId).filter(Boolean));
    const activeHubCount = activeHubIds.size;
    const totalRatings = shops.reduce((acc, s) => acc + (s.rating || 0), 0);
    const avgRating = total > 0 ? (totalRatings / total).toFixed(1) : '5.0';
    const totalReviews = shops.reduce((acc, s) => acc + (s.reviewCount || 0), 0);
    const avgDeliveryFee = total > 0 ? Math.round(shops.reduce((acc, s) => acc + (s.deliveryFee || 0), 0) / total) : 30;
    const avgThreshold = total > 0 ? Math.round(shops.reduce((acc, s) => acc + (s.freeDeliveryThreshold || 0), 0) / total) : 500;

    const activeLocations = locations.filter((loc) => activeHubIds.has(loc.id));
    const emptyLocations = locations.filter((loc) => !activeHubIds.has(loc.id));

    return {
      total,
      verified,
      activeHubCount,
      avgRating,
      totalReviews,
      avgDeliveryFee,
      avgThreshold,
      activeLocations,
      emptyLocations,
    };
  }, [shops, locations]);

  const getShopInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getShopAvatarGradient = (id: string) => {
    const gradients = [
      'from-emerald-600 to-teal-700',
      'from-blue-600 to-indigo-700',
      'from-amber-600 to-orange-700',
      'from-violet-600 to-purple-800',
      'from-rose-600 to-pink-700',
      'from-teal-600 to-cyan-800',
    ];
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  const getShopTypeBadge = (shopType?: string) => {
    const type = shopType || 'supermarket';
    switch (type) {
      case 'supermarket':
        return { label: 'Supermarket', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'local_mart':
        return { label: 'Local Mart', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'organic':
        return { label: 'Organic Store', bg: 'bg-lime-50 text-lime-800 border-lime-200' };
      case 'wholesale':
        return { label: 'Wholesale', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'quick_commerce':
        return { label: 'Quick Mart', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: type.replace('_', ' '), bg: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F8F6] text-[#17221D] font-sans">
      {/* 1. DESKTOP LEFT SIDEBAR (Matching Warm Clean Theme) */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20 px-2 py-5' : 'w-56 xl:w-60 pr-3.5 pl-0 py-5'
        } fixed top-0 left-0 bottom-0 h-screen z-40 bg-[#FAF7F0] text-[#2B231B] shrink-0 hidden lg:flex flex-col justify-between border-r border-[#ECE6DA] shadow-2xs select-none transition-all duration-300 overflow-y-auto no-scrollbar font-sans`}
      >
        <div className="space-y-4">
          {/* Brand Logo */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-5'}`}>
            <EnteBazaarLogo
              size="sm"
              variant={isSidebarCollapsed ? 'icon' : 'horizontal'}
              theme="light"
              withTagline={false}
              onClick={() => setActiveTab('overview')}
            />
          </div>

          {/* Admin Role Pill */}
          <div className={isSidebarCollapsed ? 'px-1 flex justify-center' : 'px-4'}>
            <div
              className={`flex items-center gap-2 rounded-xl bg-white/80 border border-[#E5DFD4] text-[#2B231B] shadow-2xs transition-all ${
                isSidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-1.5 text-xs font-bold'
              }`}
            >
              <span>👑</span>
              {!isSidebarCollapsed && <span>Admin</span>}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
              { id: 'users', label: 'Users', icon: Users, badge: usersList.length > 0 ? String(usersList.length) : undefined },
              { id: 'stores', label: 'Merchants', icon: Store, badge: String(shops.length) },
              { id: 'catalog', label: 'Products', icon: Package, badge: String(activeProductList.length) },
              {
                id: 'moderation',
                label: 'Complaints',
                icon: AlertCircle,
                badge: reports.filter((r) => r.status === 'pending').length > 0
                  ? String(reports.filter((r) => r.status === 'pending').length)
                  : undefined,
              },
              { id: 'subscriptions', label: 'Subscriptions', icon: FileText },
              { id: 'clients', label: 'Field Clients', icon: Briefcase, badge: 'Partners' },
              { id: 'locations', label: 'Locations', icon: Settings, badge: String(locations.length) },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  title={item.label}
                  className={`w-full group flex items-center transition-all duration-150 cursor-pointer text-left relative ${
                    isSidebarCollapsed
                      ? 'justify-center p-3 rounded-2xl'
                      : 'gap-3 px-5 py-2.5 rounded-r-xl rounded-l-none'
                  } ${
                    isActive
                      ? 'bg-[#F8E7CD] text-[#1F1A14] font-semibold'
                      : 'text-[#2D261E] hover:bg-[#F3ECE0]'
                  }`}
                >
                  {/* Active Green Vertical Accent Line */}
                  {isActive && !isSidebarCollapsed && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#10A978]" />
                  )}
                  {isActive && isSidebarCollapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#10A978] rounded-r" />
                  )}

                  {/* Icon */}
                  <div className={`flex items-center justify-center shrink-0 ${isActive ? 'text-[#0D6344]' : 'text-[#5C5449]'}`}>
                    <Icon className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>

                  {/* Label and Badge */}
                  {!isSidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm font-medium tracking-tight truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#0D6344]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar Actions */}
        <div className={`space-y-3 pt-3 border-t border-[#ECE6DA] ${isSidebarCollapsed ? 'px-1' : 'px-4'}`}>
          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-[#7C6E5E] hover:text-[#2B231B] hover:bg-black/5 rounded-xl transition-colors cursor-pointer text-xs"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 hover:translate-x-0.5 transition-transform" />
            ) : (
              <div className="flex items-center gap-2 w-full justify-center">
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold text-xs">Collapse</span>
              </div>
            )}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout from Admin"
              className={`w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer border border-rose-200/80 ${
                isSidebarCollapsed ? 'p-2.5 text-xs' : 'px-3 py-2 text-xs'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN ADMIN WORKSPACE */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-56 xl:ml-60'
      }`}>
        {/* Top Header Bar matching Image 2 */}
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E3ECE7] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 shadow-2xs">
          {/* Left: Back / Menu & Search Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            {onBackToShopper && (
              <button
                type="button"
                onClick={onBackToShopper}
                className="p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA] border border-[#E3ECE7] active:scale-95 rounded-xl text-[#063B2A] transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                title="Back to Shopper App"
                aria-label="Back to Shopper App"
              >
                <ArrowLeft className="w-4 h-4 text-[#0B8F68]" />
                <span className="text-xs font-semibold hidden xs:inline">Shopper</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA]/50 border border-[#E3ECE7] active:scale-95 rounded-xl text-[#17221D] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              title="Open Menu"
            >
              <Menu className="w-4 h-4 text-[#0B8F68]" />
              <span className="text-xs font-semibold hidden xs:inline text-[#063B2A]">
                {effectiveTab === 'overview' ? 'Dashboard' :
                 effectiveTab === 'users' ? 'Users' :
                 effectiveTab === 'stores' ? 'Merchants' :
                 effectiveTab === 'catalog' ? 'Products' :
                 effectiveTab === 'subscriptions' ? 'Subscriptions' :
                 effectiveTab === 'clients' ? 'Field Partners' :
                 effectiveTab === 'locations' ? 'Locations' : 'Menu'}
              </span>
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

          {/* Right Header Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            {effectiveTab === 'catalog' && onOpenAddProductModal && (
              <button
                onClick={() => onOpenAddProductModal(catalogCategoryFilter !== 'all' ? catalogCategoryFilter : undefined)}
                className="px-3.5 py-2 bg-[#0B8F68] hover:bg-[#063B2A] active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {effectiveTab === 'stores' && (
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

            {/* Admin Profile Pill */}
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

        {/* Content Container */}
        <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

      {/* 1. OVERVIEW TAB */}
      {effectiveTab === 'overview' && (
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
      {effectiveTab === 'stores' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total Merchants */}
            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Merchants</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
                  <Store className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{storeMetrics.total}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {storeMetrics.verified} verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                Active registered shops on network
              </p>
            </div>

            {/* 2. Regional Footprint */}
            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Hubs</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shadow-2xs">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{storeMetrics.activeHubCount}</span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  of {locations.length} regions
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                Locations with live merchant stores
              </p>
            </div>

            {/* 3. Rating & Reputation */}
            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Platform Rating</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs">
                  <Star className="w-4.5 h-4.5 fill-amber-400" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">★ {storeMetrics.avgRating}</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  {storeMetrics.totalReviews} reviews
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                Average consumer store satisfaction
              </p>
            </div>

            {/* 4. Delivery Standard */}
            <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Avg Delivery Fee</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-2xs">
                  <Truck className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">₹{storeMetrics.avgDeliveryFee}</span>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                  Free &gt; ₹{storeMetrics.avgThreshold}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                Default localized doorstep fulfillment
              </p>
            </div>
          </div>

          {/* Main Store Management Card */}
          <div className="bg-white border border-[#E3ECE7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">
                    Store Directory & Regional Management
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                    {filteredShops.length} {filteredShops.length === 1 ? 'Store' : 'Stores'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium m-0">
                  View which region every shop belongs to, manage merchant profiles, filter by location hub, and configure delivery parameters.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar with clear button */}
                <div className="relative min-w-[220px] sm:min-w-[260px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search store, phone, region, address..."
                    className="w-full pl-8.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                  {storeSearch && (
                    <button
                      onClick={() => setStoreSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Region Selector Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <select
                    value={storeRegionFilter}
                    onChange={(e) => setStoreRegionFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold outline-none cursor-pointer pr-1 text-slate-800"
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

                {/* Store Type Filter */}
                <select
                  value={storeTypeFilter}
                  onChange={(e) => setStoreTypeFilter(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
                >
                  <option value="all">All Store Types</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="local_mart">Local Mart</option>
                  <option value="organic">Organic Store</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="quick_commerce">Quick Mart</option>
                </select>

                {/* Verification Filter */}
                <select
                  value={storeVerificationFilter}
                  onChange={(e) => setStoreVerificationFilter(e.target.value as any)}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                {/* Reset Filters CTA */}
                {(storeRegionFilter !== 'all' || storeSearch || storeTypeFilter !== 'all' || storeVerificationFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStoreRegionFilter('all');
                      setStoreSearch('');
                      setStoreTypeFilter('all');
                      setStoreVerificationFilter('all');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                    title="Reset all active filters"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Primary Add Store CTA */}
                <button
                  onClick={() => handleOpenAddStoreWithLocation(storeRegionFilter !== 'all' ? storeRegionFilter : undefined)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Store</span>
                </button>
              </div>
            </div>

            {/* Smart Regional Hub Filter Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Filter by Hub:
                  </span>
                </div>
                <button
                  onClick={() => setShowAllHubs(!showAllHubs)}
                  className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{showAllHubs ? 'Show Active Hubs Only' : `Show All Hubs (${locations.length})`}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin text-xs">
                {/* All Regions Pill */}
                <button
                  onClick={() => setStoreRegionFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    storeRegionFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>All Regions</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      storeRegionFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {shops.length}
                  </span>
                </button>

                {/* Hub Pills (Active hubs first, or all if toggled) */}
                {(showAllHubs ? locations : (storeMetrics.activeLocations.length > 0 ? storeMetrics.activeLocations : locations.slice(0, 10))).map((loc) => {
                  const locCount = shops.filter((s) => s.locationId === loc.id).length;
                  const isSelected = storeRegionFilter === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setStoreRegionFilter(loc.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : locCount > 0
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>📍 {loc.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : locCount > 0
                            ? 'bg-emerald-200/80 text-emerald-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {locCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modern Stores Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/90 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Merchant / Store</th>
                      <th className="py-3.5 px-4">Location Hub</th>
                      <th className="py-3.5 px-4">Street Address</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Delivery Policy</th>
                      <th className="py-3.5 px-4 text-right">Status & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredShops.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                              <Store className="w-6 h-6 opacity-80" />
                            </div>
                            <div>
                              <div className="font-black text-base text-slate-800">No matching stores found</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {storeRegionFilter !== 'all'
                                  ? `No stores currently registered in ${locations.find((l) => l.id === storeRegionFilter)?.name || 'the selected region'}.`
                                  : 'Try adjusting your search query, store type, or region filter.'}
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              {(storeRegionFilter !== 'all' || storeSearch || storeTypeFilter !== 'all' || storeVerificationFilter !== 'all') && (
                                <button
                                  onClick={() => {
                                    setStoreRegionFilter('all');
                                    setStoreSearch('');
                                    setStoreTypeFilter('all');
                                    setStoreVerificationFilter('all');
                                  }}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Reset Filters
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenAddStoreWithLocation(storeRegionFilter !== 'all' ? storeRegionFilter : undefined)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Add Store Here</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredShops.map((shop) => {
                        const loc = locations.find((l) => l.id === shop.locationId);
                        const typeBadge = getShopTypeBadge(shop.shopType);
                        const avatarGradient = getShopAvatarGradient(shop.id);
                        const initials = getShopInitials(shop.name);

                        return (
                          <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors group">
                            {/* 1. Store Avatar & Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs bg-gradient-to-br ${avatarGradient}`}
                                  title={shop.name}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                                      {shop.name}
                                    </span>
                                    {shop.isVerified && (
                                      <span title="Verified Store" className="inline-flex items-center">
                                        <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {shop.phone ? (
                                      <a
                                        href={`tel:${shop.phone}`}
                                        className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
                                      >
                                        <Phone className="w-2.5 h-2.5" />
                                        <span>{shop.phone}</span>
                                      </a>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 font-medium">No phone added</span>
                                    )}
                                    <span className="text-[10px] text-slate-300 font-mono">#{shop.id.slice(0, 8)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Region / Location Hub */}
                            <td className="py-3.5 px-4">
                              {loc ? (
                                <div className="space-y-1">
                                  <button
                                    onClick={() => setStoreRegionFilter(loc.id)}
                                    title={`Filter stores in ${loc.name}`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-black cursor-pointer transition-all hover:scale-102 shadow-2xs"
                                  >
                                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{loc.name}</span>
                                  </button>
                                  <span className="text-[10px] text-slate-500 font-semibold block truncate max-w-[200px]" title={loc.subArea ? `${loc.subArea}, ${loc.state}` : loc.state}>
                                    {loc.subArea ? `${loc.subArea}, ` : ''}{loc.state}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span>{shop.locationId || 'Unassigned'}</span>
                                </span>
                              )}
                            </td>

                            {/* 3. Street Address */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="text-slate-800 font-medium block truncate text-xs" title={shop.address}>
                                {shop.address}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                                <Navigation className="w-2.5 h-2.5 text-slate-400" />
                                <span>{shop.distanceKm} km from hub center</span>
                              </div>
                            </td>

                            {/* 4. Type */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[10px] border shadow-2xs ${typeBadge.bg}`}>
                                {typeBadge.label}
                              </span>
                            </td>

                            {/* 5. Rating */}
                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span className="font-black text-xs text-amber-900">{shop.rating || 4.8}</span>
                                <span className="text-[10px] text-amber-700/80 font-bold">
                                  ({shop.reviewCount || 1})
                                </span>
                              </div>
                            </td>

                            {/* 6. Delivery Policy */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 text-xs font-black text-slate-800">
                                  <Truck className="w-3 h-3 text-slate-500" />
                                  <span>₹{shop.deliveryFee}</span>
                                  <span className="text-[10px] font-normal text-slate-400">fee</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200/60 block w-fit">
                                  Free over ₹{shop.freeDeliveryThreshold}
                                </span>
                              </div>
                            </td>

                            {/* 7. Verification & Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleStoreVerify(shop)}
                                  title="Toggle verification status"
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                                    shop.isVerified
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${shop.isVerified ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>{shop.isVerified ? 'Verified' : 'Unverified'}</span>
                                </button>
                                <button
                                  onClick={() => handleStartEditShop(shop)}
                                  title="Edit store details & region"
                                  className="p-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStore(shop)}
                                  disabled={deletingShopId === shop.id}
                                  title={`Delete ${shop.name}`}
                                  className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-50"
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

              {/* Table Footer with Summary Info */}
              {filteredShops.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing <b className="text-slate-800">{filteredShops.length}</b> of <b className="text-slate-800">{shops.length}</b> total stores
                    </span>
                    {storeRegionFilter !== 'all' && (
                      <span className="bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200">
                        📍 Region: {locations.find((l) => l.id === storeRegionFilter)?.name || storeRegionFilter}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Click any hub pill to filter stores by geographic delivery region
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MASTER CATALOG TAB */}
      {effectiveTab === 'catalog' && (
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
      {effectiveTab === 'locations' && (
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
      {effectiveTab === 'moderation' && (
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
      {effectiveTab === 'subscriptions' && (
        <AdminSubscriptionTab token={authUser?.token} />
      )}

      {/* 7. FIELD CLIENTS / ONBOARDING PARTNERS MANAGEMENT */}
      {effectiveTab === 'clients' && (
        <ClientManagementTab token={authUser?.token} />
      )}

      {/* 8. USERS MANAGEMENT TAB */}
      {effectiveTab === 'users' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 m-0">Users Management</h2>
                  <span className="text-xs text-slate-500 font-medium">
                    Manage registered shoppers, merchant store accounts, and platform administrators
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={loadUsers}
                disabled={usersLoading}
                className="p-2 bg-gray-50 hover:bg-slate-100 text-slate-700 border border-gray-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                title="Refresh user list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* User Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Users</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{usersList.length}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Shoppers / Consumers</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {usersList.filter((u) => u.role === 'shopper' || u.role === 'consumer').length}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Merchant Accounts</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {usersList.filter((u) => u.role === 'merchant').length}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-500">Administrators</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {usersList.filter((u) => u.role === 'admin').length}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, phone, or shop name..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-medium text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {(['all', 'shopper', 'consumer', 'merchant', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${
                    userRoleFilter === role
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role === 'all' ? 'All Roles' :
                   role === 'shopper' ? 'Shopper' :
                   role === 'consumer' ? 'Consumer' :
                   role === 'merchant' ? 'Merchant' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table / List */}
          {usersLoading && usersList.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-600">Loading users...</p>
            </div>
          ) : (
            (() => {
              const filteredUsers = usersList.filter((u) => {
                const q = userSearch.toLowerCase().trim();
                const matchesQuery =
                  !q ||
                  (u.name && u.name.toLowerCase().includes(q)) ||
                  (u.email && u.email.toLowerCase().includes(q)) ||
                  (u.phone && u.phone.toLowerCase().includes(q)) ||
                  (u.shopName && u.shopName.toLowerCase().includes(q)) ||
                  (u.username && u.username.toLowerCase().includes(q));

                const matchesRole =
                  userRoleFilter === 'all' ||
                  u.role === userRoleFilter ||
                  (userRoleFilter === 'shopper' && (u.role === 'shopper' || u.role === 'consumer'));

                return matchesQuery && matchesRole;
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm font-semibold text-slate-700">No users found</p>
                    <span className="text-xs text-slate-500">Try adjusting your search query or filter.</span>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F0] border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Linked Shop / Details</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {filteredUsers.map((u) => {
                          const isProtectedAdmin = u.id === 'admin-1' || (u.role === 'admin' && u.email === 'admin@priceteller.com');
                          return (
                            <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {(u.name || u.email || 'U').charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{u.name || 'Unnamed User'}</div>
                                    <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                <div>{u.phone || '—'}</div>
                                {u.username && <div className="text-[10px] text-gray-400 font-mono">@{u.username}</div>}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                    u.role === 'admin'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : u.role === 'merchant'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-sky-50 text-sky-800 border-sky-200'
                                  }`}
                                >
                                  {u.role === 'admin' ? '👑 Admin' : u.role === 'merchant' ? '🏪 Merchant' : '🛒 Shopper'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {u.shopName ? (
                                  <span className="font-bold text-emerald-700">{u.shopName}</span>
                                ) : u.shopId ? (
                                  <span className="font-mono text-[10px] text-gray-500">{u.shopId}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-[11px]">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isProtectedAdmin ? (
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                    Protected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={deletingUserId === u.id}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95 disabled:opacity-50"
                                    title={`Delete ${u.name || u.email} permanently from database`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">Delete</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden space-y-3">
                    {filteredUsers.map((u) => {
                      const isProtectedAdmin = u.id === 'admin-1' || (u.role === 'admin' && u.email === 'admin@priceteller.com');
                      return (
                        <div
                          key={u.id}
                          className="bg-gray-50/60 border border-gray-200 rounded-2xl p-3.5 space-y-2.5 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-[#063B2A] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {(u.name || u.email || 'U').charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-xs">{u.name || 'Unnamed User'}</div>
                                <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                u.role === 'admin'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : u.role === 'merchant'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-sky-50 text-sky-800 border-sky-200'
                              }`}
                            >
                              {u.role === 'admin' ? '👑 Admin' : u.role === 'merchant' ? '🏪 Merchant' : '🛒 Shopper'}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                            {u.phone && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Phone:</span>
                                <span className="font-bold">{u.phone}</span>
                              </div>
                            )}
                            {u.shopName && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Shop:</span>
                                <span className="font-bold text-emerald-700">{u.shopName}</span>
                              </div>
                            )}
                            {u.createdAt && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-400">Joined:</span>
                                <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-1">
                            {isProtectedAdmin ? (
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                Primary Admin (Protected)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                disabled={deletingUserId === u.id}
                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete User from Database</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
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
        adminTab={effectiveTab}
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
