import React, { useState, useEffect, useRef } from 'react';
import { FlashDeal, Product, Shop, User, Conversation, ChatMessage, PreBooking, PreBookingStatus, SubscriptionStatusResponse } from '../types';
import { formatChatDateTime } from './ConsumerChatModal';
import { ProductImage } from './ProductImage';
import { MasterCatalogPickerModal } from './MasterCatalogPickerModal';
import {
  createFlashDealApi,
  updateMerchantPricesApi,
  updateMerchantShopApi,
  delistMerchantProductApi,
  relistMerchantProductApi,
  fetchConversationsApi,
  fetchConversationMessagesApi,
  sendMessageApi,
  markConversationReadApi,
  fetchPreBookingsApi,
  updatePreBookingStatusApi,
  fetchMerchantSubscriptionStatusApi,
} from '../services/api';
import {
  Store,
  Save,
  CheckCircle2,
  Search,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Clock,
  Phone,
  Truck,
  Plus,
  Tag,
  LogOut,
  UserCheck,
  Trash2,
  PlusCircle,
  EyeOff,
  Eye,
  AlertTriangle,
  X,
  MessageCircle,
  Send,
  ShoppingBag,
  User as UserIcon,
  CalendarCheck,
  XCircle,
  Check,
  Receipt,
  Crown,
  Calendar,
  Info,
  Zap,
  MapPin,
  Crosshair,
  Navigation,
  Globe,
  LayoutGrid,
  Package,
  Flame,
  Layers,
  Menu,
} from 'lucide-react';
import { MerchantBillingWorkspace } from './MerchantBillingWorkspace';
import { LocationMapPickerModal } from './LocationMapPickerModal';
import { MobileMerchantView } from './MobileMerchantView';
import { MobileDrawer } from './MobileDrawer';


interface MerchantDashboardProps {
  shops: Shop[];
  products: Product[];
  onBackToShopper: () => void;
  onProductsUpdated: (updatedProducts: Product[]) => void;
  onShopsUpdated: (updatedShops: Shop[]) => void;
  onOpenAddProductModal?: (categoryId?: string) => void;
  isLoadingProducts?: boolean;
  authUser?: User | null;
  onLogout?: () => void;
  subStatus?: SubscriptionStatusResponse | null;
  onOpenSubscriptionPaywall?: () => void;
}

const AVAILABLE_PROVIDER_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'meats', label: 'Fresh Meats', icon: '🍗' },
  { id: 'fish', label: 'Fish & Seafood', icon: '🐟' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛' },
  { id: 'staples', label: 'Staples & Grains', icon: '🍚' },
  { id: 'oils-spices', label: 'Oils & Spices', icon: '🫗' },
  { id: 'bakery-breakfast', label: 'Bakery', icon: '🍞' },
  { id: 'electronics', label: 'Electronics', icon: '🔌' },
  { id: 'utensils', label: 'Kitchen Utensils', icon: '🍳' },
  { id: 'household', label: 'Cleaning & Home', icon: '🧼' },
  { id: 'organic', label: 'Organic Produce', icon: '🌿' },
];

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  shops,
  products,
  onBackToShopper,
  onProductsUpdated,
  onShopsUpdated,
  onOpenAddProductModal,
  isLoadingProducts = false,
  authUser,
  onLogout,
  subStatus: propsSubStatus,
  onOpenSubscriptionPaywall,
}) => {
  const initialShopName = authUser?.shopName || shops[0]?.name || 'Green Mart';
  const [selectedShopName, setSelectedShopName] = useState<string>(initialShopName);
  const [merchantTab, setMerchantTab] = useState<'dashboard' | 'inventory' | 'billing' | 'prebookings' | 'chats' | 'profile' | 'deals'>('dashboard');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Subscription State & Days Remaining
  const [localSubStatus, setLocalSubStatus] = useState<SubscriptionStatusResponse | null>(propsSubStatus || null);
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (propsSubStatus) {
      setLocalSubStatus(propsSubStatus);
    }
  }, [propsSubStatus]);

  useEffect(() => {
    if (authUser?.token) {
      fetchMerchantSubscriptionStatusApi(authUser.token).then((res) => {
        if (res) setLocalSubStatus(res);
      });
    }
  }, [authUser?.token]);

  // Merchant Pre-Bookings State
  const [preBookings, setPreBookings] = useState<PreBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  const [preBookingFilter, setPreBookingFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<PreBooking | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Item temporarily out of stock');
  const [approveModalBooking, setApproveModalBooking] = useState<PreBooking | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>('✅ Items reserved and ready for pickup!');

  // Master Catalog State
  const [allMasterProducts, setAllMasterProducts] = useState<Product[]>(products);
  const [isMasterPickerOpen, setIsMasterPickerOpen] = useState<boolean>(false);

  // App owns the master-catalog request. Keep a single source of truth here
  // and never launch a second catalog request from this component.
  useEffect(() => {
    if (products.length > 0) {
      setAllMasterProducts(products);
    }
  }, [products]);

  // Merchant Customer Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const merchantChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authUser?.shopName) {
      handleStoreChange(authUser.shopName);
    }
  }, [authUser]);


  const currentShop = shops.find((s) => s.name === selectedShopName) || shops[0];

  const [editablePrices, setEditablePrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      if (p.prices && p.prices[selectedShopName] !== undefined) {
        initial[p.id] = p.prices[selectedShopName];
      }
    });
    return initial;
  });

  const [editableStock, setEditableStock] = useState<
    Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'>
  >(() => {
    const initial: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
    products.forEach((p) => {
      if (p.prices && p.prices[selectedShopName] !== undefined) {
        initial[p.id] = p.stockStatus[selectedShopName] || 'in_stock';
      }
    });
    return initial;
  });
  const [dirtyPriceIds, setDirtyPriceIds] = useState<Set<string>>(() => new Set());

  // Store Profile Form State
  const [shopName, setShopName] = useState(currentShop?.name || '');
  const [managerName, setManagerName] = useState(authUser?.name || `${currentShop?.name || 'Store'} Manager`);
  const [address, setAddress] = useState(currentShop?.address || '');
  const [phone, setPhone] = useState(currentShop?.phone || '');
  const [shopType, setShopType] = useState<string>(currentShop?.shopType || 'supermarket');
  const [openingHours, setOpeningHours] = useState(currentShop?.openingHours || '8:00 AM - 10:00 PM');
  const [deliveryFee, setDeliveryFee] = useState(String(currentShop?.deliveryFee || 30));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(currentShop?.freeDeliveryThreshold || 500)
  );
  const [shopLat, setShopLat] = useState<number | undefined>(currentShop?.lat);
  const [shopLng, setShopLng] = useState<number | undefined>(currentShop?.lng);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [isDetectingShopGps, setIsDetectingShopGps] = useState<boolean>(false);
  const [shopGpsStatus, setShopGpsStatus] = useState<string | null>(null);
  const [shopCategories, setShopCategories] = useState<string[]>(
    currentShop?.categories && currentShop.categories.length > 0
      ? currentShop.categories
      : ['vegetables', 'fruits', 'staples', 'dairy']
  );

  // Flash Deal Form State
  const [dealProductId, setDealProductId] = useState(products[0]?.id || 'banana');
  const [dealPrice, setDealPrice] = useState('40');
  const [dealDuration, setDealDuration] = useState('180');
  const [dealTag, setDealTag] = useState('Daily Morning Special');
  const [dealSuccessMsg, setDealSuccessMsg] = useState('');

  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // When store changes, sync initial state
  const handleStoreChange = (targetShopName: string) => {
    setSelectedShopName(targetShopName);
    const targetShop = shops.find((s) => s.name === targetShopName);
    if (targetShop) {
      setShopName(targetShop.name);
      setAddress(targetShop.address);
      setPhone(targetShop.phone);
      setShopType(targetShop.shopType);
      setOpeningHours(targetShop.openingHours);
      setDeliveryFee(String(targetShop.deliveryFee));
      setFreeDeliveryThreshold(String(targetShop.freeDeliveryThreshold));
      setShopLat(targetShop.lat);
      setShopLng(targetShop.lng);
      setShopGpsStatus(null);
      if (targetShop.categories && targetShop.categories.length > 0) {
        setShopCategories(targetShop.categories);
      }
    }

    const newPrices: Record<string, number> = {};
    const newStock: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
    products.forEach((p) => {
      if (p.prices && p.prices[targetShopName] !== undefined) {
        newPrices[p.id] = p.prices[targetShopName];
        newStock[p.id] = p.stockStatus[targetShopName] || 'in_stock';
      }
    });
    setEditablePrices(newPrices);
    setEditableStock(newStock);
  };

  const toggleShopCategory = (catId: string) => {
    setShopCategories((prev) =>
      prev.includes(catId) ? (prev.length > 1 ? prev.filter((c) => c !== catId) : prev) : [...prev, catId]
    );
  };

  const [stockSyncNotice, setStockSyncNotice] = useState<string | null>(null);

  const handlePriceChange = (productId: string, val: number) => {
    setDirtyPriceIds((prev) => new Set(prev).add(productId));
    setEditablePrices((prev) => ({ ...prev, [productId]: Math.max(1, val) }));
  };

  // Populate editable controls after async catalog/shop loading without overwriting
  // prices the merchant has already edited locally.
  useEffect(() => {
    if (isLoadingProducts || !selectedShopName || products.length === 0) return;
    setEditablePrices((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (dirtyPriceIds.has(p.id)) return;
        const price = p.prices?.[selectedShopName];
        if (price !== undefined) next[p.id] = price;
        else delete next[p.id];
      });
      return next;
    });
    setEditableStock((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (dirtyPriceIds.has(p.id)) return;
        if (p.prices?.[selectedShopName] !== undefined) {
          next[p.id] = p.stockStatus?.[selectedShopName] || 'in_stock';
        } else {
          delete next[p.id];
        }
      });
      return next;
    });
  }, [products, selectedShopName, isLoadingProducts, dirtyPriceIds]);

  const handleStockChange = async (productId: string, status: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    // 1. Immediately update local state
    setEditableStock((prev) => ({ ...prev, [productId]: status }));

    // 2. Immediately update parent products list (in-memory, immediate consumer screen update)
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stockStatus: {
            ...p.stockStatus,
            [selectedShopName]: status,
          },
        };
      }
      return p;
    });
    onProductsUpdated(updatedProducts);

    const targetProduct = products.find((p) => p.id === productId);
    const prodName = targetProduct ? targetProduct.name : 'Product';
    const statusLabel = status === 'in_stock' ? '🟢 In Stock' : status === 'low_stock' ? '🟡 Low Stock' : '🔴 Out of Stock';
    setStockSyncNotice(`Live update synced! ${prodName} is now ${statusLabel} in store.`);
    setTimeout(() => setStockSyncNotice(null), 3000);

    // 3. Immediately persist to database API
    try {
      const currentPrice = editablePrices[productId] ?? (targetProduct?.prices[selectedShopName] || 50);
      await updateMerchantPricesApi(selectedShopName, [
        {
          productId,
          price: currentPrice,
          stockStatus: status,
        },
      ]);
    } catch (err) {
      console.error('Error persisting instant stock status to server:', err);
    }
  };

  const applyQuickAdjustment = (productId: string, percentage: number) => {
    const current = editablePrices[productId] || 0;
    const adjusted = Math.round(current * (1 + percentage / 100));
    handlePriceChange(productId, adjusted);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // ONLY send updates for products currently carried in this shop
    const currentlyCarried = products.filter((p) => p.prices && p.prices[selectedShopName] !== undefined);
    const updates = currentlyCarried.map((p) => ({
      productId: p.id,
      price: editablePrices[p.id] ?? p.prices[selectedShopName] ?? 50,
      stockStatus: editableStock[p.id] ?? (p.stockStatus?.[selectedShopName] || 'in_stock'),
    }));

    try {
      await updateMerchantPricesApi(selectedShopName, updates);
      const updatedProducts = products.map((p) => {
        const u = updates.find((x) => x.productId === p.id);
        if (!u) return p;
        return {
          ...p,
          prices: { ...p.prices, [selectedShopName]: u.price },
          stockStatus: { ...p.stockStatus, [selectedShopName]: u.stockStatus },
        };
      });
      onProductsUpdated(updatedProducts);
      setDirtyPriceIds((prev) => {
        const next = new Set(prev);
        updates.forEach((u) => next.delete(u.productId));
        return next;
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Error updating merchant prices', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetectShopGps = () => {
    setShopGpsStatus(null);
    if (!('geolocation' in navigator)) {
      setShopGpsStatus('Geolocation not supported on this browser.');
      return;
    }
    setIsDetectingShopGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        setShopLat(detectedLat);
        setShopLng(detectedLng);
        setIsDetectingShopGps(false);
        setShopGpsStatus(`📍 Locked live GPS: ${detectedLat}, ${detectedLng}`);
      },
      (err) => {
        setIsDetectingShopGps(false);
        setShopGpsStatus(`⚠️ ${err.message || 'Could not fetch GPS location.'}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop) return;
    try {
      const updated = await updateMerchantShopApi({
        name: shopName.trim() || currentShop.name,
        address,
        phone,
        shopType: shopType as any,
        openingHours,
        deliveryFee: Number(deliveryFee),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        categories: shopCategories,
        lat: shopLat,
        lng: shopLng,
      });
      if (updated) {
        onShopsUpdated(shops.map((s) => (s.id === currentShop.id ? { ...s, ...updated } : s)));
        if (shopName.trim() && shopName.trim() !== selectedShopName) {
          setSelectedShopName(shopName.trim());
        }
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update shop profile', err);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === dealProductId);
    if (!prod || !currentShop) return;

    const originalPrice = editablePrices[prod.id] || prod.prices[currentShop.name] || 50;

    try {
      await createFlashDealApi({
        shopId: currentShop.id,
        shopName: currentShop.name,
        productId: prod.id,
        productName: prod.name,
        emoji: prod.emoji,
        originalPrice,
        dealPrice: Number(dealPrice),
        unit: prod.defaultUnit,
        expiresInMinutes: Number(dealDuration),
        tag: dealTag,
      });
      setDealSuccessMsg(`Flash deal for ${prod.name} is now live on PriceTeller!`);
      setTimeout(() => setDealSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Delist & Relist States
  const [delistConfirmProduct, setDelistConfirmProduct] = useState<Product | null>(null);
  const [inventoryViewMode, setInventoryViewMode] = useState<'carried' | 'not_carried'>('carried');
  const [delistLoading, setDelistLoading] = useState<string | null>(null);
  const [relistCustomPrices, setRelistCustomPrices] = useState<Record<string, number>>({});
  const [delistFeedbackMsg, setDelistFeedbackMsg] = useState<string>('');

  const handleDelistConfirm = async () => {
    if (!delistConfirmProduct || !currentShop) return;
    const prodId = delistConfirmProduct.id;
    setDelistLoading(prodId);
    try {
      await delistMerchantProductApi(selectedShopName, prodId);
      const updatedProducts = products.map((p) => {
        if (p.id !== prodId) return p;
        const newPrices = { ...p.prices };
        const newStock = { ...p.stockStatus };
        delete newPrices[selectedShopName];
        delete newStock[selectedShopName];
        return {
          ...p,
          prices: newPrices,
          stockStatus: newStock,
        };
      });
      setEditablePrices((prev) => {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      });
      setEditableStock((prev) => {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      });
      onProductsUpdated(updatedProducts);
      setDelistFeedbackMsg(`Removed "${delistConfirmProduct.name}" from your store catalog`);
      setTimeout(() => setDelistFeedbackMsg(''), 3500);
      setDelistConfirmProduct(null);
    } catch (err: any) {
      console.error('Failed to delist product', err);
    } finally {
      setDelistLoading(null);
    }
  };

  const handleRelistProduct = async (prod: Product) => {
    if (!currentShop) return;
    const prodId = prod.id;
    setDelistLoading(prodId);
    const existingPrices = Object.values(prod.prices);
    const avgCalculated = existingPrices.length > 0
      ? Math.round(existingPrices.reduce((a, b) => a + b, 0) / existingPrices.length)
      : 50;
    const customPrice = relistCustomPrices[prodId] && relistCustomPrices[prodId] > 0
      ? relistCustomPrices[prodId]
      : avgCalculated;

    try {
      await relistMerchantProductApi(selectedShopName, prodId, customPrice);
      const updatedProducts = products.map((p) => {
        if (p.id !== prodId) return p;
        return {
          ...p,
          prices: { ...p.prices, [selectedShopName]: customPrice },
          stockStatus: { ...p.stockStatus, [selectedShopName]: 'in_stock' as const },
        };
      });
      setEditablePrices((prev) => ({ ...prev, [prodId]: customPrice }));
      setEditableStock((prev) => ({ ...prev, [prodId]: 'in_stock' }));
      onProductsUpdated(updatedProducts);
      setDelistFeedbackMsg(`Added "${prod.name}" back into your active store inventory`);
      setTimeout(() => setDelistFeedbackMsg(''), 3500);
    } catch (err: any) {
      console.error('Failed to relist product', err);
    } finally {
      setDelistLoading(null);
    }
  };

  // Load conversations for merchant's store
  const loadMerchantConversations = async () => {

    if (!authUser?.token) return;
    try {
      const all = await fetchConversationsApi(authUser.token);
      // Filter strictly for this merchant's shop (selectedShopName)
      const filtered = all.filter(
        (c) =>
          c.shopId === currentShop?.id ||
          c.shopName.toLowerCase() === selectedShopName.toLowerCase()
      );
      setConversations(filtered);
      if (filtered.length > 0) {
        if (!selectedConversation) {
          setSelectedConversation(filtered[0]);
        } else {
          const updated = filtered.find((c) => c.id === selectedConversation.id);
          if (updated) {
            setSelectedConversation(updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load merchant conversations:', err);
    }
  };

  const loadMessagesForConversation = async (convId: string, silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await fetchConversationMessagesApi(convId, authUser.token);
      if (res) {
        setConversationMessages((prev) => {
          const serverIds = new Set(res.messages.map((m) => m.id));
          const serverClientMsgIds = new Set(res.messages.map((m) => m.clientMsgId).filter(Boolean));
          const localPending = prev.filter(
            (m) =>
              (m.status === 'sending' || m.status === 'failed') &&
              !serverIds.has(m.id) &&
              (!m.clientMsgId || !serverClientMsgIds.has(m.clientMsgId))
          );
          return [...res.messages, ...localPending];
        });
        setSelectedConversation(res.conversation);
        // Mark conversation as read
        markConversationReadApi(convId, authUser.token).catch(() => {});
        // Update local unread count for this conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Failed to load messages for merchant conversation:', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Load Pre-Bookings for merchant store
  const loadMerchantPreBookings = async (silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoadingBookings(true);
    try {
      const data = await fetchPreBookingsApi(authUser.token);
      const filtered = data.filter(
        (b) =>
          b.shopId === currentShop?.id ||
          b.shopName.toLowerCase() === selectedShopName.toLowerCase()
      );
      setPreBookings(filtered);
    } catch (err) {
      console.error('Failed to load merchant pre-bookings:', err);
    } finally {
      if (!silent) setIsLoadingBookings(false);
    }
  };

  const handleApprovePreBooking = async (bookingId: string, note?: string) => {
    if (!authUser?.token) return;
    setActionBookingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'approved', note || approvalNote, authUser.token);
      setApproveModalBooking(null);
      await loadMerchantPreBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to approve pre-booking');
    } finally {
      setActionBookingId(null);
    }
  };

  const handleRejectPreBooking = async (bookingId: string, reason?: string) => {
    if (!authUser?.token) return;
    setActionBookingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'rejected', reason || rejectReason, authUser.token);
      setRejectModalBooking(null);
      await loadMerchantPreBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to reject pre-booking');
    } finally {
      setActionBookingId(null);
    }
  };

  const handleCompletePreBooking = async (bookingId: string) => {
    if (!authUser?.token) return;
    if (!confirm('Mark this pre-booked order as Completed and Picked Up by customer?')) return;
    setActionBookingId(bookingId);
    try {
      await updatePreBookingStatusApi(bookingId, 'completed', 'Order picked up and completed', authUser.token);
      await loadMerchantPreBookings(true);
    } catch (err: any) {
      alert(err.message || 'Failed to mark pre-booking completed');
    } finally {
      setActionBookingId(null);
    }
  };

  useEffect(() => {
    if (authUser?.token) {
      loadMerchantConversations();
      loadMerchantPreBookings();
    }
  }, [authUser?.token, selectedShopName]);

  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessagesForConversation(selectedConversation.id);
    } else {
      setConversationMessages([]);
    }
  }, [selectedConversation?.id]);

  // Background polling for chats & pre-bookings
  useEffect(() => {
    if (!authUser?.token) return;
    const interval = setInterval(() => {
      loadMerchantConversations();
      loadMerchantPreBookings(true);
      if (selectedConversation?.id && merchantTab === 'chats') {
        loadMessagesForConversation(selectedConversation.id, true);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [authUser?.token, selectedConversation?.id, selectedShopName, merchantTab]);

  useEffect(() => {
    merchantChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isSendingReply]);

  const handleSendMerchantReply = async (customText?: string, existingClientMsgId?: string) => {
    const text = (customText || replyText).trim();
    if (!text || !selectedConversation || !authUser?.token) return;

    if (isSendingReply && !existingClientMsgId) return;

    const clientMsgId = existingClientMsgId || `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempId = `temp-${clientMsgId}`;

    if (!existingClientMsgId) {
      if (!customText) setReplyText('');
      const optimisticMsg: ChatMessage = {
        id: tempId,
        conversationId: selectedConversation.id,
        senderId: authUser.id,
        senderRole: 'merchant',
        senderName: selectedShopName || authUser.name || 'Merchant',
        text,
        status: 'sending',
        clientMsgId,
        createdAt: new Date().toISOString(),
      };
      setConversationMessages((prev) => [...prev, optimisticMsg]);
    } else {
      setConversationMessages((prev) =>
        prev.map((m) => (m.clientMsgId === existingClientMsgId ? { ...m, status: 'sending' } : m))
      );
    }

    setIsSendingReply(true);

    try {
      const newMsg = await sendMessageApi(
        selectedConversation.id,
        text,
        authUser.token,
        undefined,
        clientMsgId
      );
      setConversationMessages((prev) =>
        prev.map((m) =>
          m.clientMsgId === clientMsgId || m.id === tempId ? { ...newMsg, status: 'sent' } : m
        )
      );
      // Update local lastMessage in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      setConversationMessages((prev) =>
        prev.map((m) =>
          m.clientMsgId === clientMsgId || m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  const activeProductCatalog = allMasterProducts.length > 0 ? allMasterProducts : products;

  const handleProductAddedToShop = (productId: string, price: number) => {
    setAllMasterProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          prices: { ...p.prices, [selectedShopName]: price },
          stockStatus: { ...p.stockStatus, [selectedShopName]: 'in_stock' as const },
        };
      })
    );
    setEditablePrices((prev) => ({ ...prev, [productId]: price }));
    setEditableStock((prev) => ({ ...prev, [productId]: 'in_stock' }));
    onProductsUpdated(
      activeProductCatalog.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          prices: { ...p.prices, [selectedShopName]: price },
          stockStatus: { ...p.stockStatus, [selectedShopName]: 'in_stock' as const },
        };
      })
    );
    setDelistFeedbackMsg(`Successfully added product to your store!`);
    setTimeout(() => setDelistFeedbackMsg(''), 3500);
  };

  // The platform catalog uses more granular IDs than the merchant profile.
  // Treat legacy merchant groups as aliases so catalog items don't disappear
  // simply because, for example, 'rice-grains' is stored while the shop has
  // the older 'staples' specialization.
  const CATEGORY_ALIASES: Record<string, string[]> = {
    staples: ['staples', 'rice-grains', 'pulses-legumes'],
    'oils-spices': ['oils-spices', 'oils-sugar', 'spices'],
    household: ['household', 'cleaning-household', 'storage-containers', 'baby-family', 'personal-care'],
    'bakery-breakfast': ['bakery-breakfast', 'biscuits-snacks', 'beverages'],
  };

  // 1. Filter products eligible based on the shop's supported categories
  const eligibleProducts = activeProductCatalog.filter((p) => {
    if (!shopCategories || shopCategories.length === 0) return true;
    const eligibleCategoryIds = new Set(
      shopCategories.flatMap((category) => CATEGORY_ALIASES[category] || [category])
    );
    return eligibleCategoryIds.has(p.categoryId) || (p.isOrganic && shopCategories.includes('organic'));
  });

  // 2. Split into Carried (Active in this shop with valid price > 0) and Not Carried (Available in Master Catalog)
  const carriedProducts = eligibleProducts.filter((p) => p.prices && p.prices[selectedShopName] !== undefined && p.prices[selectedShopName] > 0);
  const notCarriedProducts = eligibleProducts.filter((p) => !p.prices || p.prices[selectedShopName] === undefined || p.prices[selectedShopName] <= 0);

  // 3. Filter current view mode by search & selected category tab
  const displayedInventoryList = (inventoryViewMode === 'carried' ? carriedProducts : notCarriedProducts).filter((p) => {
    const targetCats = CATEGORY_ALIASES[inventoryCategoryFilter] || [inventoryCategoryFilter];
    const matchesCategory =
      inventoryCategoryFilter === 'all' ||
      targetCats.includes(p.categoryId) ||
      (inventoryCategoryFilter === 'organic' && p.isOrganic);
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryId.toLowerCase().includes(search.toLowerCase()) ||
      (p.nutritionalNote && p.nutritionalNote.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeSub = localSubStatus?.subscription;
  const isExempt = localSubStatus?.isExempt;
  const daysLeft = localSubStatus?.daysRemaining ?? (activeSub ? Math.max(0, Math.ceil((new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0);
  const totalDays = activeSub?.plan?.durationDays || (daysLeft > 180 ? 365 : daysLeft > 30 ? 180 : 30);
  const progressPercent = isExempt ? 100 : Math.min(100, Math.max(0, Math.round((daysLeft / totalDays) * 100)));
  const formattedExpiry = activeSub?.expiresAt ? new Date(activeSub.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const formattedStart = activeSub?.startsAt ? new Date(activeSub.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen flex bg-[#F5F8F6] text-[#17221D] font-sans">
      
      {/* 1. DESKTOP LEFT SIDEBAR (Matching Screen 6 of Reference Image) */}
      <aside className="w-64 bg-[#063B2A] text-white shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-[#084D37] shadow-xl fixed top-0 bottom-0 left-0 h-screen z-30 font-malayalam select-none overflow-y-auto">
        <div>
          {/* Brand Logo */}
          <div
            onClick={onBackToShopper}
            className="flex items-center gap-2.5 px-3 py-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors mb-4"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10A978] text-[#063B2A] flex items-center justify-center font-black text-base shadow-sm">
              <Store className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white flex items-center gap-1 font-sans">
                PriceTeller
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium">
                വ്യാപാരികളുടെ പാനൽ
              </div>
            </div>
          </div>

          {/* Navigation Links (Matching Screen 6) */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setMerchantTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'dashboard'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-300" />
              <span>ഡാഷ്‌ബോർഡ് (Dashboard)</span>
            </button>

            <button
              onClick={() => setMerchantTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'inventory'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-300" />
              <span>ഉൽപ്പന്നങ്ങൾ (Products)</span>
            </button>

            <button
              onClick={() => setMerchantTab('billing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'billing'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-300" />
              <span>ബില്ലിംഗ് & POS</span>
            </button>

            <button
              onClick={() => setMerchantTab('prebookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'prebookings'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 text-emerald-300" />
                <span>ഓർഡറുകൾ (Orders)</span>
              </div>
              {preBookings.filter((b) => b.status === 'pending').length > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-sans">
                  {preBookings.filter((b) => b.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMerchantTab('chats')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'chats'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>കസ്റ്റമർ ചാറ്റ്</span>
              </div>
              {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-sans">
                  {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setMerchantTab('deals')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'deals'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-[#F4B740]" />
              <span>ഫ്ലാഷ് ഡീലുകൾ (Deals)</span>
            </button>

            <button
              onClick={() => setMerchantTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                merchantTab === 'profile'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>സ്റ്റോർ പ്രൊഫൈൽ</span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar Actions */}
        <div className="space-y-2 pt-4 border-t border-[#084D37]">
          <button
            onClick={onBackToShopper}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#084D37]/70 hover:bg-[#084D37] rounded-xl text-[11px] font-bold text-[#DDF5EA] transition-all border border-[#10A978]/30 cursor-pointer"
          >
            <span>← ഷോപ്പർ മോഡ് (Shopper)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {onLogout && (
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-[#DDF5EA]/70 font-sans">
              <span className="truncate max-w-[120px] font-medium">{authUser?.name || selectedShopName}</span>
              <button
                onClick={onLogout}
                className="text-[11px] text-red-300 hover:text-red-200 hover:underline cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN MERCHANT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E3ECE7] px-4 sm:px-6 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA]/50 border border-[#E3ECE7] active:scale-95 rounded-xl text-[#17221D] transition-colors cursor-pointer"
              title="മെനു തുറക്കുക (Open Menu)"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToShopper}
              className="md:hidden p-2 bg-[#F5F8F6] hover:bg-[#DDF5EA]/50 border border-[#E3ECE7] rounded-xl text-[#17221D] transition-colors"
              title="ഷോപ്പർ മോഡ്"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏪</span>
                <h1 className="text-base sm:text-lg font-black text-[#17221D] font-malayalam leading-tight">
                  {authUser?.shopName || selectedShopName}
                </h1>
                {authUser && (
                  <span className="bg-[#DDF5EA] text-[#063B2A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-malayalam">
                    <UserCheck className="w-3 h-3 text-[#0B8F68]" />
                    <span>വെരിഫൈഡ്</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {(!authUser || authUser.role === 'admin') && (
              <select
                value={selectedShopName}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="px-3 py-1.5 bg-[#F5F8F6] border border-[#E3ECE7] rounded-xl text-xs font-bold text-[#17221D] outline-none cursor-pointer hidden sm:inline-block"
              >
                {shops.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    🏪 {s.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsMasterPickerOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-malayalam"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ ഉൽപ്പന്നം ചേർക്കുക</span>
            </button>

            <button
              onClick={() => setIsSubModalOpen(true)}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-sans text-[11px]">{isExempt ? 'Lifetime' : `${daysLeft}d`}</span>
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-3 sm:px-6 py-5">
          
          {/* TAB 0: DASHBOARD OVERVIEW (Matching Screen 6) */}
          {merchantTab === 'dashboard' && (
            <>
              {/* Mobile View matching Screen 7 */}
              <div className="md:hidden">
                <MobileMerchantView
                  authUser={authUser || null}
                  selectedShopName={selectedShopName}
                  shops={shops}
                  products={products}
                  onOpenDrawer={() => setIsMobileDrawerOpen(true)}
                  onBackToShopper={onBackToShopper}
                  onNavigateTab={(tab) => setMerchantTab(tab as any)}
                  onOpenAddProduct={() => setIsMasterPickerOpen(true)}
                  onOpenSubscriptionPaywall={onOpenSubscriptionPaywall}
                  preBookingsCount={preBookings.length}
                />
              </div>

              {/* Desktop View (Preserved 100%) */}
              <div className="hidden md:block space-y-6 animate-in fade-in duration-150 font-malayalam">
                {/* Top Greeting Header (Screen 6) */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    സ്വാഗതം, {authUser?.shopName || selectedShopName}! 👋
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    ഇന്നത്തെ നിങ്ങളുടെ കടയുടെ സമഗ്ര വിവരങ്ങൾ
                  </p>
                </div>

              {/* 3 KPI Cards in a Row (Screen 6) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Metric 1: Total Sales */}
                <div className="p-4 sm:p-5 bg-white border border-surface-border rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      മൊത്തം വിൽപ്പനകൾ (Total Sales)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">
                      ₹2,482
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
                      ▲ 12% കഴിഞ്ഞ ആഴ്ചയെ അപേക്ഷിച്ച്
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xl">
                    📈
                  </div>
                </div>

                {/* Metric 2: Total Orders */}
                <div className="p-4 sm:p-5 bg-white border border-surface-border rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      ആകെ ഓർഡറുകൾ (Total Orders)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">
                      {preBookings.length || 142}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
                      ▲ 8% വർദ്ധനവ്
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xl">
                    📋
                  </div>
                </div>

                {/* Metric 3: Active Shoppers */}
                <div className="p-4 sm:p-5 bg-white border border-surface-border rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      സജീവ ഉപഭോക്താക്കൾ (Active Customers)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-sans">
                      87
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
                      ▲ 5% വർദ്ധനവ്
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xl">
                    👥
                  </div>
                </div>

              </div>

              {/* Middle Row: Sales Overview Chart + Today's Active Orders (Screen 6) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Sales Overview Chart (8 Cols) */}
                <div className="lg:col-span-8 bg-white border border-surface-border rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">വിൽപ്പനയുടെ അവലോകനം (Sales Overview)</h3>
                      <p className="text-xs text-slate-400">കഴിഞ്ഞ രണ്ടാഴ്ചയിലെ ദിവസേനയുള്ള വരുമാന ഗ്രാഫ്</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
                      <button className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg shadow-2xs">7 ദിവസം</button>
                      <button className="px-2.5 py-1 text-slate-500 hover:text-slate-800">14 ദിവസം</button>
                      <button className="px-2.5 py-1 text-slate-500 hover:text-slate-800">30 ദിവസം</button>
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="h-52 w-full pt-2">
                    <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                      <line x1="20" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="20" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="20" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" />

                      {/* Area fill under curve */}
                      <path
                        d="M 20 120 Q 80 110 140 90 T 260 70 T 380 40 T 480 25 L 480 140 L 20 140 Z"
                        fill="url(#greenGradient)"
                        opacity="0.25"
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16a34a" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>

                      {/* Line curve */}
                      <path
                        d="M 20 120 Q 80 110 140 90 T 260 70 T 380 40 T 480 25"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Chart dots */}
                      {[[20, 120], [140, 90], [260, 70], [380, 40], [480, 25]].map(([cx, cy], i) => (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r="4.5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                          <text x={cx} y={155} textAnchor="middle" className="text-[9px] fill-slate-400 font-sans">
                            {['ജൂൺ 14', 'ജൂൺ 16', 'ജൂൺ 18', 'ജൂൺ 19', 'ജൂൺ 20'][i]}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Active Orders Side Card (4 Cols) */}
                <div className="lg:col-span-4 bg-white border border-surface-border rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-slate-900">ഇന്ന് ആക്ടീവ് ഓർഡറുകൾ</h3>
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full font-sans">
                          {preBookings.filter((b) => b.status === 'pending').length || 3}
                        </span>
                      </div>
                      <button
                        onClick={() => setMerchantTab('prebookings')}
                        className="text-xs text-emerald-700 font-bold hover:underline"
                      >
                        എല്ലാം കാണുക
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { id: '#PT-4587', price: 299, status: 'തയ്യാറാക്കുന്നു' },
                        { id: '#PT-4586', price: 189, status: 'സ്ഥിരീകരിച്ചു' },
                        { id: '#PT-4585', price: 420, status: 'പുതിയത്' },
                      ].map((ord) => (
                        <div key={ord.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-xs text-slate-900 font-sans">{ord.id}</span>
                            <span className="text-[10px] text-slate-400 block font-sans">3 ഇനങ്ങൾ</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs text-slate-900 font-sans">₹{ord.price}</span>
                            <span className="text-[10px] text-emerald-700 font-bold block">{ord.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setMerchantTab('prebookings')}
                    className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    ഓർഡറുകൾ പരിശോധിക്കുക →
                  </button>
                </div>

              </div>

              {/* Bottom Row (3 Columns: Top Products, Quick Actions, Flash Deal) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Top Performing Products */}
                <div className="bg-white border border-surface-border rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-black text-slate-900">മികച്ച വിലയുള്ള ഉൽപ്പന്നങ്ങൾ</h4>
                    <span className="text-xs text-slate-400">{carriedProducts.length} ഇനങ്ങൾ</span>
                  </div>
                  <div className="space-y-2">
                    {carriedProducts.slice(0, 3).map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{prod.emoji}</span>
                          <div>
                            <div className="font-bold text-xs text-slate-900 truncate max-w-[130px]">{prod.name}</div>
                            <span className="text-[10px] text-slate-400 font-sans">{prod.defaultUnit}</span>
                          </div>
                        </div>
                        <div className="font-black text-xs text-emerald-800 font-sans">
                          ₹{editablePrices[prod.id] || prod.prices[selectedShopName] || 50}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Quick Actions */}
                <div className="bg-white border border-surface-border rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <h4 className="text-sm font-black text-slate-900 mb-3">ദ്രുത പ്രവർത്തികൾ (Quick Actions)</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsMasterPickerOpen(true)}
                      className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-700" />
                      <span>+ പുതിയ ഉൽപ്പന്നം ചേർക്കുക</span>
                    </button>
                    <button
                      onClick={() => setMerchantTab('inventory')}
                      className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-slate-600" />
                      <span>വിലകൾ പുതുക്കുക (Update Prices)</span>
                    </button>
                    <button
                      onClick={() => setMerchantTab('billing')}
                      className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-slate-600" />
                      <span>ലൈവ് POS ബില്ലിംഗ് തുറക്കുക</span>
                    </button>
                  </div>
                </div>

                {/* 3. Flash Deal Promo Banner Card */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⚡</span>
                      <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">ഫ്ലാഷ് ഡീൽ (Active Promo)</span>
                    </div>
                    <h4 className="text-sm font-black text-amber-950">വാഴപ്പഴം - 15% ഓഫർ</h4>
                    <p className="text-xs text-amber-800/80 mt-1">ഇന്നത്തെ പ്രത്യേക ഓഫർ തത്സമയം ഷോപ്പർമാർക്ക് ലഭ്യമാണ്.</p>
                  </div>
                  <button
                    onClick={() => setMerchantTab('deals')}
                    className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    ഡീലുകൾ മാനേജ് ചെയ്യുക →
                  </button>
                </div>

              </div>

            </div>
            </>
          )}

          {/* TAB 1: INVENTORY & PRICES */}
          {merchantTab === 'inventory' && (
            <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs animate-in fade-in duration-150">
          {delistFeedbackMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl mb-4 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{delistFeedbackMsg}</span>
              </div>
              <button
                onClick={() => setDelistFeedbackMsg('')}
                className="text-emerald-600 hover:text-emerald-800 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Store Categories Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-gray-100">
            <button
              onClick={() => setInventoryCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                inventoryCategoryFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✨ All My Categories ({eligibleProducts.length})
            </button>
            {AVAILABLE_PROVIDER_CATEGORIES.filter((cat) => shopCategories.includes(cat.id)).map((cat) => {
              const count = eligibleProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setInventoryCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    inventoryCategoryFilter === cat.id
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
            <button
              onClick={() => setMerchantTab('profile')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 ml-auto cursor-pointer flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>+ Add / Change Categories</span>
            </button>
          </div>

          {/* Carried vs Not Carried Sub-Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 w-fit text-xs font-bold">
              <button
                onClick={() => setInventoryViewMode('carried')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  inventoryViewMode === 'carried'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-gray-200 font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Listed in Store ({carriedProducts.length})</span>
              </button>
              <button
                onClick={() => setInventoryViewMode('not_carried')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  inventoryViewMode === 'not_carried'
                    ? 'bg-white text-slate-900 shadow-2xs border border-gray-200 font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>📦 Master Catalog ({notCarriedProducts.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {inventoryViewMode === 'carried' && (
                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:bg-gray-300 shrink-0"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Prices'}</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: ACTIVE / CARRIED ITEMS */}
          {isLoadingProducts ? (
            <div className="py-16 text-center text-gray-500 font-semibold">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-600" />
              Loading your inventory and master catalog...
            </div>
          ) : inventoryViewMode === 'carried' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Product</th>
                    <th className="pb-3 px-3">Unit</th>
                    <th className="pb-3 px-3">Live Price (₹)</th>
                    <th className="pb-3 px-3">Quick Adjust</th>
                    <th className="pb-3 px-3">Stock Status</th>
                    <th className="pb-3 px-3 text-right">Delist / Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedInventoryList.map((p) => {
                    const currentPrice = editablePrices[p.id] ?? 0;
                    const currentStock = editableStock[p.id] ?? 'in_stock';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
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
                          <div>
                            <b className="font-bold text-slate-dark block">{p.name}</b>
                            <span className="text-[10px] text-gray-400 font-medium capitalize">{p.categoryId}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-gray-500 font-medium">{p.defaultUnit}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 w-24">
                            <span className="text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={currentPrice}
                              onChange={(e) => handlePriceChange(p.id, Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white border border-gray-300 focus:border-brand-500 rounded-lg text-xs font-black text-slate-dark text-right outline-none"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => applyQuickAdjustment(p.id, -5)}
                              className="px-2 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-bold text-gray-600 transition-colors"
                              title="Decrease price by 5%"
                            >
                              -5%
                            </button>
                            <button
                              onClick={() => applyQuickAdjustment(p.id, 5)}
                              className="px-2 py-1 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 rounded text-[10px] font-bold text-gray-600 transition-colors"
                              title="Increase price by 5%"
                            >
                              +5%
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={currentStock}
                            onChange={(e) =>
                              handleStockChange(
                                p.id,
                                e.target.value as any
                              )
                            }
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${
                              currentStock === 'in_stock'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : currentStock === 'low_stock'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="in_stock">🟢 In Stock</option>
                            <option value="low_stock">🟡 Low Stock</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setDelistConfirmProduct(p)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                            title="Remove / Delist this item from my store"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedInventoryList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="max-w-md mx-auto flex flex-col items-center">
                          <span className="text-4xl block mb-2">🍎</span>
                          <h4 className="font-extrabold text-slate-800 text-sm mb-1">
                            No active products listed in your store yet
                          </h4>
                          <p className="text-xs text-gray-500 mb-4">
                            You can easily pick from 48+ Master Catalog fruits and platform products with 1 click, or create custom items!
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsMasterPickerOpen(true)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>📦 Pick from Master Catalog</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenAddProductModal?.()}
                              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              + Add Custom
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE 2: DELISTED / NOT CARRIED ITEMS */
            <div className="overflow-x-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-xs text-amber-900 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  These items belong to your supported categories but are currently <b>delisted / not carried</b> in <b>{selectedShopName}</b>. You can set a price and add them to your store catalog anytime.
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Product</th>
                    <th className="pb-3 px-3">Unit</th>
                    <th className="pb-3 px-3">Market Avg (₹)</th>
                    <th className="pb-3 px-3">My Selling Price (₹)</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedInventoryList.map((p) => {
                    const avg = Object.values(p.prices).length > 0
                      ? Math.round(Object.values(p.prices).reduce((a, b) => a + b, 0) / Object.values(p.prices).length)
                      : 50;
                    const customP = relistCustomPrices[p.id] ?? avg;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          <div className="w-8 h-8 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center opacity-60">
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
                          <div>
                            <b className="font-bold text-slate-700 block">{p.name}</b>
                            <span className="text-[10px] text-gray-400 font-medium capitalize">{p.categoryId}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-gray-500 font-medium">{p.defaultUnit}</td>

                        <td className="py-3 px-3 text-gray-600 font-bold">₹{avg}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 w-28">
                            <span className="text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={customP}
                              onChange={(e) =>
                                setRelistCustomPrices((prev) => ({
                                  ...prev,
                                  [p.id]: Number(e.target.value),
                                }))
                              }
                              className="w-full px-2 py-1 bg-white border border-gray-300 focus:border-brand-500 rounded-lg text-xs font-black text-slate-dark text-right outline-none"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRelistProduct(p)}
                            disabled={delistLoading === p.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                          >
                            {delistLoading === p.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PlusCircle className="w-3.5 h-3.5" />
                            )}
                            <span>+ Stock & List Item</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedInventoryList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                        All items in this category are currently active in your store inventory!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STORE PROFILE */}
      {merchantTab === 'profile' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs max-w-2xl animate-in fade-in duration-150 space-y-6">
          <div className="flex items-center justify-between mb-1 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-slate-dark m-0">
                Store Profile & Subscription Limits
              </h3>
              <p className="text-xs text-gray-500 font-medium m-0 mt-0.5">
                Configure your store details, manager name, contact info, and view active plan limits.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
              Store: {currentShop?.id}
            </span>
          </div>

          {/* Subscription Limits & Active Plan Card inside Profile */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Active Merchant Tier</span>
                  <h4 className="text-base font-black m-0">
                    {activeSub?.plan?.name || (isExempt ? 'Verified Partner Exempt Access' : 'Partner Access')}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setIsSubModalOpen(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                View Full Limits
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Limit Remaining</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {isExempt ? 'Unlimited' : `${daysLeft} Days`}
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {isExempt ? 'Permanent Access' : `of ${totalDays} days total`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Expiration Date</span>
                <div className="text-sm font-bold text-white mt-1">
                  {isExempt ? 'No Expiry' : formattedExpiry}
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Start: {formattedStart}
                </span>
              </div>
            </div>

            {!isExempt && (
              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1">
                  <span>Subscription Validity</span>
                  <span>{daysLeft} days remaining ({progressPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${daysLeft > 30 ? 'bg-emerald-400' : daysLeft > 7 ? 'bg-blue-400' : 'bg-amber-400'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Store profile & category specializations updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Fresh Daily Supermarket"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Manager / Owner Name</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 12345"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Store Type</label>
                <select
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                >
                  <option value="supermarket">🛒 Supermarket</option>
                  <option value="local_mart">🏪 Local Mart</option>
                  <option value="organic">🌿 Organic Store</option>
                  <option value="wholesale">📦 Wholesale & Staples</option>
                  <option value="quick_commerce">⚡ Quick Commerce (15 min)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Main Market Road, Near Municipal Stadium"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
              />
            </div>

            {/* Shop Map Location & Live GPS Determination Card */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-black text-emerald-950">Shop Map Coordinates & Live GPS</span>
                </div>
                {Number.isFinite(shopLat) && Number.isFinite(shopLng) ? (
                  <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {Number(shopLat).toFixed(5)}, {Number(shopLng).toFixed(5)}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                    GPS Coordinates Unset
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 font-medium mb-3 leading-relaxed">
                Pinpoint your exact shop coordinates on the map or use your live device GPS if you are currently at the store. This allows nearby consumers and the Smart Basket to calculate exact travel distances.
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDetectShopGps}
                  disabled={isDetectingShopGps}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Detect GPS location from this device right now"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isDetectingShopGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingShopGps ? 'Detecting GPS...' : '📍 Use Current Location (I am at shop)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Interactive Map</span>
                </button>
              </div>

              {shopGpsStatus && (
                <div className="mt-2 text-[11px] font-bold text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200">
                  {shopGpsStatus}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Operating Hours</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="8:00 AM - 10:00 PM"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Free Delivery Above (₹)</label>
                <input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            {/* Supported Categories Checkboxes */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-900">
                  Supported Store Categories ({shopCategories.length} Selected)
                </label>
                <span className="text-[10px] text-gray-500 font-medium">
                  Inventory pricing is enabled for these categories
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-gray-50 border border-gray-200 rounded-2xl max-h-48 overflow-y-auto">
                {AVAILABLE_PROVIDER_CATEGORIES.map((cat) => {
                  const isChecked = shopCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleShopCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                        isChecked
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer mt-2"
            >
              Save Store Profile & Specializations
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: FLASH DEALS */}
      {merchantTab === 'deals' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-6 shadow-xs max-w-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-dark">Launch Store Flash Deal</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-4">
            Broadcast a time-limited discount to attract more basket orders
          </p>

          {dealSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{dealSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Product</label>
              <select
                value={dealProductId}
                onChange={(e) => {
                  setDealProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) {
                    const orig = p.prices[selectedShopName] || 50;
                    setDealPrice(String(Math.round(orig * 0.85)));
                  }
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name} (Current: ₹{p.prices[selectedShopName] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deal Price (₹)</label>
                <input
                  type="number"
                  required
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expires In (Minutes)</label>
                <select
                  value={dealDuration}
                  onChange={(e) => setDealDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                  <option value="180">3 Hours</option>
                  <option value="360">6 Hours</option>
                  <option value="720">12 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Deal Tag / Announcement</label>
              <input
                type="text"
                value={dealTag}
                onChange={(e) => setDealTag(e.target.value)}
                placeholder="e.g. Weekend Special, Fresh Harvest Drop"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Broadcast Flash Deal Live</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB: BILLING & SALES WORKSPACE */}
      {merchantTab === 'billing' && (
        <MerchantBillingWorkspace
          products={products}
          shops={shops}
          selectedShopName={selectedShopName}
          shopCategories={shopCategories}
          authUser={authUser}
        />
      )}

      {/* TAB: BASKET PRE-BOOKINGS */}
      {merchantTab === 'prebookings' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-dark flex items-center gap-2 m-0">
                <CalendarCheck className="w-5 h-5 text-brand-600" />
                <span>Customer Basket Pre-Bookings</span>
                {preBookings.length > 0 && (
                  <span className="text-xs bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-0.5 rounded-full font-extrabold">
                    {preBookings.length} Total
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Review locked product snapshots, approve reservations, and confirm customer pickups for <b>{selectedShopName}</b>
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map((st) => {
                const count = st === 'all' ? preBookings.length : preBookings.filter((b) => b.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setPreBookingFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                      preBookingFilter === st
                        ? 'bg-brand-600 text-white shadow-2xs font-black'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        preBookingFilter === st ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => loadMerchantPreBookings()}
                disabled={isLoadingBookings}
                className="p-2 text-gray-400 hover:text-brand-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh pre-bookings"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {isLoadingBookings && preBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-xs gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
              <span>Loading customer pre-bookings...</span>
            </div>
          ) : preBookings.filter((b) => preBookingFilter === 'all' || b.status === preBookingFilter).length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl my-2 bg-[#fafbfa]">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl mb-2">
                🛍️
              </div>
              <b className="block text-sm font-bold text-slate-dark mb-1">
                No {preBookingFilter !== 'all' ? preBookingFilter : ''} pre-bookings found
              </b>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                When shoppers pre-book their baskets for pickup at {selectedShopName}, their orders and locked prices will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {preBookings
                .filter((b) => preBookingFilter === 'all' || b.status === preBookingFilter)
                .map((booking) => {
                  const formattedDate = formatChatDateTime(booking.createdAt);

                  return (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-brand-300 transition-all space-y-3.5"
                    >
                      {/* Top Header: Customer Info & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-lg font-black shrink-0">
                            👤
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-black text-slate-dark">{booking.consumerName}</h3>
                              {booking.consumerPhone && (
                                <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {booking.consumerPhone}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-mono font-semibold text-gray-500">Ref: {booking.id}</span>
                              <span>·</span>
                              <span>Booked on: {formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {booking.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>Pending Approval</span>
                            </span>
                          )}
                          {booking.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved & Packing</span>
                            </span>
                          )}
                          {booking.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Completed & Picked Up</span>
                            </span>
                          )}
                          {booking.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-900 border border-rose-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Declined</span>
                            </span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                              <span>Cancelled by Customer</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Snapshot Metrics Bar */}
                      <div className="bg-[#f5f8f3] border border-brand-100/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Locked Order Total</span>
                          <span className="font-black text-brand-700 text-base">₹{booking.totalAmount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Item Count</span>
                          <span className="font-bold text-slate-dark">
                            {booking.itemCount} items ({booking.totalQuantity} units)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Pickup Window</span>
                          <span className="font-bold text-slate-dark truncate block">
                            {booking.pickupTime || 'Within 1 hour'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Payment Method</span>
                          <span className="font-bold text-emerald-800">Pay at Store Pickup</span>
                        </div>
                      </div>

                      {/* Customer Notes */}
                      {booking.notes && (
                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-950 flex items-start gap-2">
                          <span className="text-sm">📝</span>
                          <div>
                            <b className="font-bold">Customer Note: </b>
                            <span>{booking.notes}</span>
                          </div>
                        </div>
                      )}

                      {/* Store Message / Note */}
                      {booking.merchantNote && (
                        <div className="bg-brand-50 border border-brand-200 rounded-xl p-2.5 text-xs text-brand-900 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <div>
                            <b className="font-bold">Store Response: </b>
                            <span>{booking.merchantNote}</span>
                          </div>
                        </div>
                      )}

                      {/* Locked Product Snapshot Breakdown */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <span>📦 Ordered Products Snapshot (Locked Price at Booking Time)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {booking.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-gray-200 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 shrink-0 p-0.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                                  <ProductImage
                                    productId={it.productId}
                                    emoji={it.emoji}
                                    alt={it.productName}
                                    className="w-full h-full"
                                    imgClassName="w-full h-full object-contain"
                                    fallbackEmojiClassName="text-base"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-dark truncate">{it.productName}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {it.quantity} × {it.unit} @ ₹{it.unitPrice}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0 font-black text-brand-700 ml-2">
                                ₹{it.lineTotal}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Chat with Customer button */}
                        <button
                          onClick={() => {
                            setMerchantTab('chats');
                            const conv = conversations.find(
                              (c) => c.consumerId === booking.consumerId || c.consumerName === booking.consumerName
                            );
                            if (conv) setSelectedConversation(conv);
                          }}
                          className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-slate-dark border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-brand-600" />
                          <span>Chat Customer</span>
                        </button>

                        {/* Status Change Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setRejectModalBooking(booking);
                                  setRejectReason('Item temporarily out of stock');
                                }}
                                disabled={actionBookingId === booking.id}
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline Request</span>
                              </button>

                              <button
                                onClick={() => {
                                  setApproveModalBooking(booking);
                                  setApprovalNote('✅ Items reserved and ready for pickup!');
                                }}
                                disabled={actionBookingId === booking.id}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {actionBookingId === booking.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>Approve Pre-Booking</span>
                              </button>
                            </>
                          )}

                          {booking.status === 'approved' && (
                            <>
                              <button
                                onClick={() => {
                                  setRejectModalBooking(booking);
                                  setRejectReason('Unable to fulfill reserved order');
                                }}
                                disabled={actionBookingId === booking.id}
                                className="px-3 py-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                              >
                                Cancel Order
                              </button>

                              <button
                                onClick={() => handleCompletePreBooking(booking.id)}
                                disabled={actionBookingId === booking.id}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {actionBookingId === booking.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Mark Picked Up & Completed</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Approve Pre-Booking Modal */}
      {approveModalBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xl font-bold">
                ✅
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Approve Pre-Booking
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Customer: {approveModalBooking.consumerName} ({approveModalBooking.itemCount} items · ₹{approveModalBooking.totalAmount})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-dark mb-1.5">
                Note for Customer / Ready Estimate
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Packed and ready for pickup at billing counter 2."
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 text-xs text-slate-dark outline-none focus:border-brand-500 focus:bg-white resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalBooking(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprovePreBooking(approveModalBooking.id, approvalNote)}
                disabled={actionBookingId === approveModalBooking.id}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionBookingId === approveModalBooking.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Pre-Booking Modal */}
      {rejectModalBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Decline Pre-Booking
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Customer: {rejectModalBooking.consumerName}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-dark mb-1.5">
                Reason for declining (sent to shopper)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Item temporarily out of stock',
                  'Store is closing early today',
                  'Price or quality variation',
                  'High in-store rush',
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg text-gray-700 transition-colors cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Type custom decline reason..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-slate-dark outline-none focus:border-brand-500 focus:bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleRejectPreBooking(rejectModalBooking.id, rejectReason)}
                disabled={actionBookingId === rejectModalBooking.id}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionBookingId === rejectModalBooking.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Confirm Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER CHATS */}
      {merchantTab === 'chats' && (
        <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-dark flex items-center gap-2 m-0">
                <MessageCircle className="w-5 h-5 text-brand-600" />
                <span>Customer Basket Inquiries</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Two-way live conversations with shoppers inquiring about baskets at <b>{selectedShopName}</b>.
              </p>
            </div>

            <button
              onClick={() => {
                loadMerchantConversations();
                if (selectedConversation?.id) {
                  loadMessagesForConversation(selectedConversation.id);
                }
              }}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-[#fafbfa]">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl mb-3">
                💬
              </div>
              <h3 className="text-base font-bold text-slate-dark mb-1">No customer inquiries yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                When consumers create or compare a basket and click <b>"Chat with Merchant"</b> for {selectedShopName}, their message and full basket breakdown will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[520px]">
              {/* Left Column: Conversations List (5 cols) */}
              <div className="lg:col-span-4 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50 flex flex-col h-[520px]">
                <div className="p-3 bg-white border-b border-gray-200 text-xs font-bold text-slate-dark flex items-center justify-between">
                  <span>Conversations ({conversations.length})</span>
                  <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    {selectedShopName}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                  {conversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    const formattedDateTime = formatChatDateTime(conv.lastMessageTime || conv.updatedAt);

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-3.5 text-left transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-brand-50/90 border-l-4 border-brand-600'
                            : 'hover:bg-white bg-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-xs">
                          {conv.consumerName ? conv.consumerName[0].toUpperCase() : 'C'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-black text-xs text-slate-dark truncate">
                              {conv.consumerName || 'Shopper'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {conv.unreadCount && conv.unreadCount > 0 ? (
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                                  {conv.unreadCount} new
                                </span>
                              ) : null}
                              <span className="text-[10px] text-gray-400">{formattedDateTime}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-600 truncate mb-1.5 font-medium">
                            {conv.lastMessage || 'Sent a basket inquiry'}
                          </p>

                          {conv.basketSnapshot && (
                            <span className="inline-flex items-center gap-1 bg-white border border-brand-200 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                              <span>🛒 {conv.basketSnapshot.itemCount || 0} items</span>
                              <span>·</span>
                              <span>₹{conv.basketSnapshot.estimatedTotal || 0}</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chat Thread & Basket Inspector (8 cols) */}
              <div className="lg:col-span-8 border border-gray-200 rounded-2xl bg-white flex flex-col h-[520px] overflow-hidden">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-dark">
                            {selectedConversation.consumerName || 'Shopper'}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            Inquiring at {selectedConversation.shopName}
                          </div>
                        </div>
                      </div>

                      {selectedConversation.basketSnapshot && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 font-semibold">Attached Basket:</span>
                          <span className="font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-lg">
                            {selectedConversation.basketSnapshot.itemCount} items · ₹
                            {selectedConversation.basketSnapshot.estimatedTotal}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Attached Basket Breakdown Inspector Card */}
                    {selectedConversation.basketSnapshot && selectedConversation.basketSnapshot.items?.length > 0 && (
                      <div className="bg-[#f5f8f3] border-b border-brand-100 p-3 text-xs shrink-0 max-h-36 overflow-y-auto">
                        <div className="flex items-center justify-between mb-1.5 font-bold text-slate-dark text-[11px]">
                          <span>🛒 Customer's Requested Items:</span>
                          <span className="text-brand-800 font-extrabold">
                            Estimated Total: ₹{selectedConversation.basketSnapshot.estimatedTotal}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedConversation.basketSnapshot.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-brand-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-dark shadow-2xs flex items-center gap-1.5"
                            >
                              <span>{it.emoji}</span>
                              <span>{it.productName}</span>
                              <span className="text-gray-400 font-normal">
                                ({it.quantity} × {it.unit})
                              </span>
                              {it.lineTotal ? (
                                <span className="text-brand-700 font-bold">₹{it.lineTotal}</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafbfa]">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-xs gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                          <span>Loading messages...</span>
                        </div>
                      ) : conversationMessages.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400">
                          No messages in this thread yet. Send a reply below.
                        </div>
                      ) : (
                        conversationMessages.map((msg) => {
                          const isMerchantSender =
                            msg.senderRole === 'merchant' ||
                            msg.senderId === authUser?.id ||
                            msg.senderName?.includes('Manager');
                          const formattedDateTime = formatChatDateTime(msg.createdAt);

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${
                                isMerchantSender ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5 px-1">
                                <span className="text-[10px] font-bold text-gray-500">
                                  {isMerchantSender
                                    ? `You (${selectedShopName})`
                                    : `${msg.senderName || 'Shopper'}`}
                                </span>
                                <span className="text-[10px] text-gray-400">· {formattedDateTime}</span>
                                {isMerchantSender && msg.status === 'sending' && (
                                  <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Sending...
                                  </span>
                                )}
                                {isMerchantSender && msg.status === 'failed' && (
                                  <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                                    Failed
                                    <button
                                      onClick={() => handleSendMerchantReply(msg.text, msg.clientMsgId)}
                                      className="underline hover:text-red-700 cursor-pointer font-extrabold"
                                    >
                                      Retry
                                    </button>
                                  </span>
                                )}
                                {isMerchantSender && msg.isRead && !msg.status && (
                                  <span className="text-[9px] text-emerald-600 font-semibold">Seen ✓✓</span>
                                )}
                              </div>

                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                                  isMerchantSender
                                    ? msg.status === 'failed'
                                      ? 'bg-red-500 text-white rounded-tr-xs font-medium'
                                      : 'bg-brand-600 text-white rounded-tr-xs font-medium'
                                    : 'bg-white text-slate-dark border border-gray-200 rounded-tl-xs'
                                }`}
                              >
                                <div>{msg.text}</div>

                                {msg.basketSnapshot && msg.basketSnapshot.items?.length > 0 && (
                                  <div
                                    className={`mt-2.5 pt-2 border-t rounded-xl p-2.5 text-xs ${
                                      isMerchantSender
                                        ? 'bg-black/15 border-white/20 text-white'
                                        : 'bg-[#f5f8f3] border-brand-200 text-slate-dark'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-bold mb-1.5 text-[11px]">
                                      <span className="flex items-center gap-1">
                                        <span>🛒</span>
                                        <span>
                                          Attached Basket ({msg.basketSnapshot.itemCount || msg.basketSnapshot.items.length} items)
                                        </span>
                                      </span>
                                      <span
                                        className={`font-black px-1.5 py-0.5 rounded text-[11px] ${
                                          isMerchantSender
                                            ? 'bg-white/20 text-white'
                                            : 'bg-brand-100 text-brand-800'
                                        }`}
                                      >
                                        ₹{msg.basketSnapshot.estimatedTotal}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {msg.basketSnapshot.items.map((it, idx) => (
                                        <span
                                          key={idx}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                                            isMerchantSender
                                              ? 'bg-white/20 text-white border border-white/15'
                                              : 'bg-white text-slate-dark border border-brand-200 shadow-2xs'
                                          }`}
                                        >
                                          <span>{it.emoji}</span>
                                          <span>{it.productName}</span>
                                          <span
                                            className={
                                              isMerchantSender ? 'text-white/80' : 'text-gray-400'
                                            }
                                          >
                                            ({it.quantity} × {it.unit})
                                          </span>
                                          {it.lineTotal ? (
                                            <span
                                              className={
                                                isMerchantSender
                                                  ? 'text-white font-bold'
                                                  : 'text-brand-700 font-bold'
                                              }
                                            >
                                              ₹{it.lineTotal}
                                            </span>
                                          ) : null}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={merchantChatEndRef} />
                    </div>

                    {/* Quick Merchant Response Macros */}
                    <div className="bg-white border-t border-gray-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Quick Reply:
                      </span>
                      {[
                        '✅ All items in your basket are packed and ready for pickup!',
                        '🚚 Yes, we offer home delivery. We will dispatch this within 30 mins.',
                        '🌿 Fresh stock arrived today; all items are in great quality.',
                        '👍 Order confirmed. We have reserved your items.',
                      ].map((macro, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMerchantReply(macro)}
                          disabled={isSendingReply}
                          className="text-[11px] font-semibold text-gray-700 hover:text-brand-800 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {macro}
                        </button>
                      ))}
                    </div>

                    {/* Reply Input Bar */}
                    <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMerchantReply();
                          }
                        }}
                        placeholder={`Reply to ${selectedConversation.consumerName || 'Shopper'}...`}
                        className="flex-1 bg-gray-50 border border-gray-300 focus:border-brand-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-dark outline-none transition-all"
                        disabled={isSendingReply}
                      />

                      <button
                        onClick={() => handleSendMerchantReply()}
                        disabled={!replyText.trim() || isSendingReply}
                        className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        {isSendingReply ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-gray-400 text-xs p-6 text-center">
                    Select a conversation from the left to view customer messages and attached basket.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  </div>

      {/* Delist Confirmation Modal */}
      {delistConfirmProduct && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Remove Item from Store Catalog?
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Store: {selectedShopName}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 p-1 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
                <ProductImage
                  productId={delistConfirmProduct.id}
                  image={delistConfirmProduct.image}
                  emoji={delistConfirmProduct.emoji}
                  alt={delistConfirmProduct.name}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-contain"
                  fallbackEmojiClassName="text-2xl"
                />
              </div>
              <div>
                <b className="text-xs font-bold text-slate-900 block">{delistConfirmProduct.name}</b>
                <span className="text-[11px] text-gray-500 capitalize">{delistConfirmProduct.categoryId} · {delistConfirmProduct.defaultUnit}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium mb-5 leading-relaxed">
              Shoppers will no longer see this product listed under <b>{selectedShopName}</b>. You can re-add it anytime from the <i>"Delisted / Not Carried"</i> tab.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDelistConfirmProduct(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelistConfirm}
                disabled={delistLoading === delistConfirmProduct.id}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {delistLoading === delistConfirmProduct.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Yes, Remove Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Catalog Quick-Picker Modal */}
      {isMasterPickerOpen && (
        <MasterCatalogPickerModal
          masterProducts={allMasterProducts}
          shopName={selectedShopName}
          categories={AVAILABLE_PROVIDER_CATEGORIES.map((c) => ({
            id: c.id,
            name: c.label,
            icon: c.icon,
            itemCount: allMasterProducts.filter((p) => ((CATEGORY_ALIASES[c.id] || [c.id]).includes(p.categoryId)) || (c.id === 'organic' && p.isOrganic)).length,
          }))}
          onClose={() => setIsMasterPickerOpen(false)}
          onProductAddedToShop={handleProductAddedToShop}
          onOpenCreateCustom={() => onOpenAddProductModal?.(inventoryCategoryFilter !== 'all' ? inventoryCategoryFilter : undefined)}
        />
      )}

      {/* Subscription Plan & Limits Details Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-brand-50 text-brand-700 rounded-2xl border border-brand-200">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-dark m-0">Subscription & Limit Details</h3>
                  <p className="text-xs text-gray-400 font-semibold m-0">
                    Active plan limits, validity countdown & store privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Countdown & Plan Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 mb-4 shadow-md relative overflow-hidden">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400 bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-500/30 inline-block mb-1.5">
                    {activeSub?.status === 'ACTIVE' ? '✓ ACTIVE SUBSCRIPTION' : isExempt ? '✓ VERIFIED EXEMPTION' : 'SUBSCRIPTION STATUS'}
                  </span>
                  <h4 className="text-xl font-black m-0">{activeSub?.plan?.name || (isExempt ? 'Verified Partner Exempt Access' : 'Merchant Partner Plan')}</h4>
                </div>
                {activeSub?.plan?.badge && (
                  <span className="text-xs font-black px-2.5 py-1 bg-amber-400 text-amber-950 rounded-xl shrink-0 shadow-xs">
                    {activeSub.plan.badge}
                  </span>
                )}
              </div>

              {/* Big Days Remaining Display */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Remaining Limit</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                    {isExempt ? 'Unlimited' : `${daysLeft} Days`}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {isExempt ? 'Permanent Access' : `of ${totalDays} days plan limit`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Valid Until</span>
                  <div className="text-base sm:text-lg font-black text-white mt-1">
                    {isExempt ? 'No Expiry' : formattedExpiry}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Started: {formattedStart}
                  </span>
                </div>
              </div>

              {/* Limit Timeline Progress Bar */}
              {!isExempt && (
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-300 mb-1">
                    <span>Subscription Limit Progress</span>
                    <span>{daysLeft} days remaining ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        daysLeft > 30 ? 'bg-emerald-400' : daysLeft > 7 ? 'bg-blue-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Included Platform Privileges & Features */}
            <div className="mb-5">
              <h5 className="text-xs font-black text-slate-dark uppercase tracking-wider mb-2.5">
                Active Plan Features & Included Quotas
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(activeSub?.plan?.features || [
                  'Unlimited Live Price Updates',
                  'Full Hyperlocal Catalog Sync',
                  'POS Billing & Daily Invoicing',
                  'Direct WhatsApp & In-App Customer Chat',
                  'Customer Pre-Bookings Management',
                  'Flash Deals Promotion Engine',
                ]).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-dark text-[11px] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium">
                Store: <b className="text-slate-dark">{selectedShopName}</b>
              </span>
              <div className="flex items-center gap-2">
                {onOpenSubscriptionPaywall && (
                  <button
                    onClick={() => {
                      setIsSubModalOpen(false);
                      onOpenSubscriptionPaywall();
                    }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
                  >
                    Extend / Change Plan
                  </button>
                )}
                <button
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Shop Map Picker Modal */}
      <LocationMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={shopLat || 10.9155}
        initialLng={shopLng || 75.9238}
        initialAddress={address}
        title={`Pinpoint Location for ${shopName || 'Store'}`}
        subtitle="Click anywhere on the map or use GPS to set the exact shop location coordinates."
        confirmButtonText="Apply Coordinates"
        onConfirm={(coords) => {
          setShopLat(coords.lat);
          setShopLng(coords.lng);
          if (coords.address) {
            setAddress(coords.address);
          }
          setShopGpsStatus(`📍 Map Pin Selected: ${coords.lat}, ${coords.lng}`);
        }}
      />

      {/* Mobile Navigation Drawer with Merchant Mode */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        mode="merchant"
        authUser={authUser || null}
        merchantTab={merchantTab}
        onSelectMerchantTab={(tab) => {
          setMerchantTab(tab);
          setIsMobileDrawerOpen(false);
        }}
        pendingOrdersCount={preBookings.filter((b) => b.status === 'pending').length}
        unreadChatsCount={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
        onOpenSubscriptionModal={() => {
          setIsMobileDrawerOpen(false);
          setIsSubModalOpen(true);
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
