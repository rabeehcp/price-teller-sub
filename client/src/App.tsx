import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BasketItem,
  Category,
  FlashDeal,
  FullComparisonResponse,
  Location,
  Product,
  Shop,
} from './types';
import {
  compareBasketApi,
  fetchCategories,
  fetchFlashDeals,
  fetchLocations,
  fetchProducts,
  fetchShops,
  fetchAdminProducts,
  fetchAdminShops,
  fetchMerchantMasterCatalogApi,
  fetchMerchantShopApi,
  logoutUserApi,
} from './services/api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { SmartBasket } from './components/SmartBasket';
import { findNearestLocation } from './services/locationService';
import { ComparisonSummary } from './components/ComparisonSummary';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { CrowdReportModal } from './components/CrowdReportModal';
import { MerchantDashboard } from './components/MerchantDashboard';
import { WhatsAppExportModal } from './components/WhatsAppExportModal';
import { ShopDetailModal } from './components/ShopDetailModal';
import { ShopPriceCatalogueModal } from './components/ShopPriceCatalogueModal';
import { ItemizedMatrixModal } from './components/ItemizedMatrixModal';
import { FlashDealsBanner } from './components/FlashDealsBanner';
import { StoreDuelModal } from './components/StoreDuelModal';
import { AddProductModal } from './components/AddProductModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AuthModal } from './components/AuthModal';
import { OpeningPage } from './components/OpeningPage';
import { MalayalamOpeningPage } from './components/MalayalamOpeningPage';
import { ConsumerDashboardModal } from './components/ConsumerDashboardModal';
import { SaveBasketModal } from './components/SaveBasketModal';
import { SmartListQuickAdd } from './components/SmartListQuickAdd';
import { ConsumerChatModal } from './components/ConsumerChatModal';
import { PreBookingModal } from './components/PreBookingModal';
import { ConsumerPreBookingsModal } from './components/ConsumerPreBookingsModal';
import { MerchantSubscriptionPaywall } from './components/MerchantSubscriptionPaywall';
import { NearbyShopsMapView } from './components/NearbyShopsMapView';
import { StoresListView } from './components/StoresListView';
import { MobileHeader } from './components/MobileHeader';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileLocationModal } from './components/MobileLocationModal';
import { MobileHomeView } from './components/MobileHomeView';
import { MobileProductDetailModal } from './components/MobileProductDetailModal';
import { MobileBasketView } from './components/MobileBasketView';
import { loadActiveBasket, persistActiveBasket, clearActiveBasket, rehydrateBasket } from './services/sessionManager';

import { User, ConsumerData, ConsumerSavedList, ConsumerSavedListItem, SubscriptionStatusResponse } from './types';
import {
  fetchConsumerDataApi,
  syncConsumerBasketApi,
  saveConsumerListApi,
  deleteConsumerListApi,
  toggleConsumerFavoriteApi,
  fetchMerchantSubscriptionStatusApi,
  fetchCurrentUserApi,
  getAuthToken,
} from './services/api';
import { ShoppingCart, X, Home, Store, MapPin, Heart, Clock, User as UserIcon, Search, Shield, ChevronRight } from 'lucide-react';


// Helper utilities to accurately identify admin, merchant, or consumer route intents
const isExplicitAdminRoute = (): boolean => {
  try {
    const pathname = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const params = new URLSearchParams(window.location.search);

    return (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      params.get('portal') === 'admin' ||
      params.get('admin') === 'true' ||
      search.includes('portal=admin') ||
      search.includes('admin=true') ||
      hash === '#admin' ||
      hash.startsWith('#/admin')
    );
  } catch {
    return false;
  }
};

const isExplicitMerchantRoute = (): boolean => {
  try {
    const pathname = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const params = new URLSearchParams(window.location.search);

    return (
      pathname === '/merchant' ||
      pathname.startsWith('/merchant/') ||
      pathname === '/portal' ||
      pathname.startsWith('/portal/') ||
      params.get('portal') === 'merchant' ||
      params.get('merchant') === 'true' ||
      search.includes('portal=merchant') ||
      search.includes('merchant=true') ||
      hash === '#merchant' ||
      hash.startsWith('#/merchant')
    );
  } catch {
    return false;
  }
};

const isExplicitConsumerRoute = (): boolean => {
  try {
    const pathname = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const params = new URLSearchParams(window.location.search);

    return (
      pathname === '/consumer' ||
      pathname.startsWith('/consumer/') ||
      params.get('view') === 'consumer' ||
      params.get('portal') === 'consumer' ||
      search.includes('view=consumer') ||
      search.includes('portal=consumer') ||
      hash === '#consumer' ||
      hash.startsWith('#/consumer')
    );
  } catch {
    return false;
  }
};

export const App: React.FC = () => {
  // Authentication State (Isolated to current tab/session via sessionStorage; validated with backend)
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(() => !!getAuthToken());

  // Shopper Main View Tab ('home' | 'shops' | 'map' | 'favorites' | 'orders' | 'profile')
  const [shopperTab, setShopperTab] = useState<'home' | 'shops' | 'map' | 'favorites' | 'orders' | 'profile'>('home');

  // App View State ('welcome' | 'portal' | 'consumer' | 'merchant' | 'admin')
  const [appView, setAppView] = useState<'welcome' | 'portal' | 'consumer' | 'merchant' | 'admin'>(() => {
    if (isExplicitAdminRoute()) {
      return 'admin';
    }
    if (isExplicitMerchantRoute()) {
      return 'portal';
    }
    if (isExplicitConsumerRoute()) {
      return 'consumer';
    }
    return 'welcome';
  });

  // 3-Role Persona State ('shopper' | 'merchant' | 'admin')
  const [currentRole, setCurrentRole] = useState<'shopper' | 'merchant' | 'admin'>('shopper');

  // Verify Session with Backend on Initial Mount
  useEffect(() => {
    async function verifySessionOnMount() {
      // Purge legacy cross-tab tokens from earlier versions
      try {
        localStorage.removeItem('priceteller_token');
        localStorage.removeItem('priceteller_auth_user');
      } catch {}

      const token = getAuthToken();
      if (!token) {
        setIsVerifyingSession(false);
        if (isExplicitAdminRoute()) {
          setAppView('admin');
        } else if (isExplicitMerchantRoute()) {
          setAppView('portal');
        } else if (isExplicitConsumerRoute()) {
          setAppView('welcome');
        } else {
          setAppView('welcome');
        }
        return;
      }

      try {
        const user = await fetchCurrentUserApi(token);
        if (user && user.role) {
          setAuthUser(user);
          try {
            sessionStorage.setItem('priceteller_token', user.token || token);
            sessionStorage.setItem('priceteller_auth_user', JSON.stringify(user));
          } catch {}

          const wantsAdmin = isExplicitAdminRoute();
          const wantsMerchant = isExplicitMerchantRoute();
          const wantsConsumer = isExplicitConsumerRoute();

          if (wantsAdmin) {
            setAppView('admin');
            if (user.role === 'admin') {
              setCurrentRole('admin');
            }
          } else if (wantsMerchant) {
            if (user.role === 'merchant' || user.role === 'admin') {
              setAppView('merchant');
              setCurrentRole(user.role === 'admin' ? 'admin' : 'merchant');
            } else {
              window.history.replaceState({}, '', '/');
              setAppView('welcome');
              setCurrentRole('shopper');
            }
          } else if (wantsConsumer) {
            setAppView('consumer');
            setCurrentRole('shopper');
          } else {
            // General or root route (e.g. localhost/): do NOT hijack into old screen! Always start at welcome!
            setAppView('welcome');
            setCurrentRole(user.role === 'admin' ? 'admin' : user.role === 'merchant' ? 'merchant' : 'shopper');
          }
        } else {
          throw new Error('Invalid user payload from /auth/me');
        }
      } catch (err) {
        console.warn('Backend rejected session token, resetting auth state:', err);
        try {
          sessionStorage.removeItem('priceteller_token');
          sessionStorage.removeItem('priceteller_auth_user');
          localStorage.removeItem('priceteller_token');
          localStorage.removeItem('priceteller_auth_user');
        } catch {}
        setAuthUser(null);
        if (isExplicitAdminRoute()) {
          setAppView('admin');
        } else if (isExplicitMerchantRoute()) {
          setAppView('portal');
        } else {
          setAppView('welcome');
        }
      } finally {
        setIsVerifyingSession(false);
      }
    }

    verifySessionOnMount();
  }, []);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<
    'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway'
  >('consumer-login');

  // Listen to browser forward/back popstate & pathname changes with strict authorization
  useEffect(() => {
    const handlePopState = () => {
      const wantsAdmin = isExplicitAdminRoute();
      const wantsMerchant = isExplicitMerchantRoute();
      const wantsConsumer = isExplicitConsumerRoute();

      if (wantsAdmin) {
        setAppView('admin');
        if (authUser?.role === 'admin') {
          setCurrentRole('admin');
        }
      } else if (wantsMerchant) {
        if (!authUser) {
          setAppView('portal');
        } else if (authUser.role === 'merchant' || authUser.role === 'admin') {
          setAppView('merchant');
          setCurrentRole(authUser.role === 'admin' ? 'admin' : 'merchant');
        } else {
          window.history.replaceState({}, '', '/');
          setAppView('welcome');
          setCurrentRole('shopper');
        }
      } else if (wantsConsumer) {
        setAppView(authUser ? 'consumer' : 'welcome');
      } else {
        // Root route /
        setAppView('welcome');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authUser]);

  // Consumer Stored Cloud Data State
  const [consumerData, setConsumerData] = useState<ConsumerData | null>(null);
  const [isConsumerDashboardOpen, setIsConsumerDashboardOpen] = useState<boolean>(false);
  const [isSaveBasketModalOpen, setIsSaveBasketModalOpen] = useState<boolean>(false);

  // Main Data States
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number; name?: string } | null>(() => {
    try {
      const s = localStorage.getItem('priceteller_customer_coords');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);

  // Verified Shops strictly for consumer usage
  const verifiedShops = useMemo(() => shops.filter((s) => s.isVerified), [shops]);


  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOrganicOnly, setIsOrganicOnly] = useState<boolean>(false);
  const [isUnder100Only, setIsUnder100Only] = useState<boolean>(false);

  // Modal States
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [addProductInitialCategory, setAddProductInitialCategory] = useState<string | undefined>(undefined);

  // Merchant Subscription Status State
  const [merchantSubStatus, setMerchantSubStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [isCheckingMerchantSubscription, setIsCheckingMerchantSubscription] = useState<boolean>(false);
  const [isMerchantUpgradeModalOpen, setIsMerchantUpgradeModalOpen] = useState<boolean>(false);

  // Isolated Session-Scoped Basket State (Zero cross-customer leakage)
  const [basket, setBasket] = useState<BasketItem[]>(() => loadActiveBasket());

  // Comparison State
  const [comparison, setComparison] = useState<FullComparisonResponse | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isStoreDuelOpen, setIsStoreDuelOpen] = useState<boolean>(false);

  // Modals & View States
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [reportProduct, setReportProduct] = useState<Product | null>(null);
  const [selectedShopDetail, setSelectedShopDetail] = useState<string | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [isItemizedMatrixOpen, setIsItemizedMatrixOpen] = useState<boolean>(false);
  const [showDealsBanner, setShowDealsBanner] = useState<boolean>(true);
  const [isMobileBasketOpen, setIsMobileBasketOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [chatModalInitialShop, setChatModalInitialShop] = useState<string | null>(null);

  // Redesigned Mobile Experience States
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isMobileLocationModalOpen, setIsMobileLocationModalOpen] = useState<boolean>(false);
  const [selectedMobileProduct, setSelectedMobileProduct] = useState<Product | null>(null);

  // Pre-Booking States
  const [isPreBookingModalOpen, setIsPreBookingModalOpen] = useState<boolean>(false);
  const [preBookingInitialShop, setPreBookingInitialShop] = useState<string | null>(null);
  const [isConsumerPreBookingsOpen, setIsConsumerPreBookingsOpen] = useState<boolean>(false);
  const [consumerPreBookingsCount, setConsumerPreBookingsCount] = useState<number>(0);

  // Shop-Specific Price Catalogue State
  const [isShopCatalogueOpen, setIsShopCatalogueOpen] = useState<boolean>(false);
  const [catalogueInitialShopName, setCatalogueInitialShopName] = useState<string | null>(null);

  const handleOpenShopCatalogue = (shopName?: string) => {
    setCatalogueInitialShopName(shopName || null);
    setIsShopCatalogueOpen(true);
  };

  const handleOpenChat = (targetShopName?: string) => {
    if (!authUser) {
      handleOpenAuthModal('consumer-login');
      return;
    }
    const chosenShop =
      targetShopName ||
      comparison?.bestShopName ||
      (verifiedShops[0] ? verifiedShops[0].name : shops[0]?.name || 'Green Mart');
    setChatModalInitialShop(chosenShop);
    setIsChatModalOpen(true);
  };

  const handleOpenPreBooking = (targetShopName?: string) => {
    if (!authUser) {
      handleOpenAuthModal('consumer-login');
      return;
    }
    const chosenShop =
      targetShopName ||
      comparison?.bestShopName ||
      (verifiedShops[0] ? verifiedShops[0].name : shops[0]?.name || 'Green Mart');
    setPreBookingInitialShop(chosenShop);
    setIsPreBookingModalOpen(true);
  };


  // Save isolated basket to sessionStorage on change
  useEffect(() => {
    persistActiveBasket(basket);
  }, [basket]);

  // Load consumer data & cloud basket whenever authUser is logged in
  useEffect(() => {
    if (authUser && (authUser.role === 'consumer' || authUser.role === 'shopper')) {
      fetchConsumerDataApi(authUser.id, authUser.token).then((data) => {
        if (data) {
          setConsumerData(data);
          // If cloud basket has saved items and local session basket is empty, restore them!
          if (data.basket && data.basket.length > 0 && products.length > 0 && basket.length === 0) {
            const rehydrated = data.basket
              .map((b: ConsumerSavedListItem) => {
                const p = products.find((x) => x.id === b.productId);
                return p
                  ? {
                      productId: p.id,
                      product: p,
                      quantity: b.quantity,
                      selectedUnit: b.selectedUnit || p.defaultUnit,
                    }
                  : null;
              })
              .filter(Boolean) as BasketItem[];
            if (rehydrated.length > 0) {
              setBasket(rehydrated);
            }
          }
        }
      });
    }
  }, [authUser?.id, products.length]);

  // Sync active basket to cloud storage whenever it changes for logged-in consumer
  useEffect(() => {
    if (authUser && (authUser.role === 'consumer' || authUser.role === 'shopper')) {
      const payload = basket.map((b) => ({
        productId: b.productId,
        quantity: b.quantity,
        selectedUnit: b.selectedUnit,
      }));
      syncConsumerBasketApi(authUser.id, payload, authUser.token);
    }
  }, [basket, authUser]);

  // Check merchant subscription status when viewing merchant dashboard
  useEffect(() => {
    if (!authUser || (authUser.role !== 'merchant' && appView !== 'merchant')) return;

    const cacheKey = `priceteller_subscription_status_${authUser.id}`;
    setIsCheckingMerchantSubscription(true);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const hasActive = Boolean(
          parsed.hasActiveSubscription ??
          parsed.isActive ??
          (parsed.subscription && (parsed.subscription.status === 'ACTIVE' || parsed.daysRemaining > 0))
        );
        setMerchantSubStatus({
          ...parsed,
          hasActiveSubscription: hasActive,
          isActive: hasActive,
        });
      }
    } catch {}

    fetchMerchantSubscriptionStatusApi(authUser.token)
      .then((res) => {
        if (!res) return;
        setMerchantSubStatus(res);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(res));
        } catch {}
      })
      .finally(() => setIsCheckingMerchantSubscription(false));
  }, [authUser?.token, authUser?.role, appView]);

  // Re-hydrate basket when products catalog loads or updates (fixes stale prices)
  useEffect(() => {
    if (products.length > 0) {
      setBasket((prev) => rehydrateBasket(prev, products));
    }
  }, [products]);

  // Location Selection Handler with Strict Persistence
  const handleSelectLocation = useCallback((loc: Location) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('priceteller_consumer_location_id', loc.id);
      localStorage.setItem('priceteller_location_manually_selected', 'true');
    } catch {}
  }, []);

  // Initial Data Fetch & Hyperlocal Region Resolution
  useEffect(() => {
    async function loadInitialData() {
      const [locs, cats] = await Promise.all([
        fetchLocations(),
        fetchCategories(),
      ]);
      setLocations(locs);
      setCategories(cats);

      // Determine Initial Consumer Hyperlocal Region:
      // 1. Check saved location in LocalStorage (e.g. Areekode, Tirur)
      let chosenLoc: Location | null = null;
      let hasExplicitSavedLoc = false;
      try {
        const savedLocId = localStorage.getItem('priceteller_consumer_location_id');
        if (savedLocId) {
          chosenLoc = locs.find((l) => l.id === savedLocId) || null;
          if (chosenLoc) {
            hasExplicitSavedLoc = true;
          }
        }
      } catch {}

      // 2. Or auth user preferred location
      if (!chosenLoc && authUser?.locationId) {
        chosenLoc = locs.find((l) => l.id === authUser.locationId) || null;
      }

      // 3. Fallback to first registered hub
      if (!chosenLoc && locs.length > 0) {
        chosenLoc = locs[0];
      }

      if (chosenLoc) {
        setCurrentLocation(chosenLoc);
      }

      // 4. Background GPS Detection ONLY on first visit when user has not explicitly chosen a region
      if (!hasExplicitSavedLoc && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Check again in case user picked location while GPS was resolving
            const latestSaved = localStorage.getItem('priceteller_consumer_location_id');
            if (latestSaved) return;

            const gpsRes = findNearestLocation(pos.coords.latitude, pos.coords.longitude, locs);
            if (gpsRes?.nearestLocation) {
              setCurrentLocation(gpsRes.nearestLocation);
              try {
                localStorage.setItem('priceteller_consumer_location_id', gpsRes.nearestLocation.id);
              } catch {}
            }
          },
          () => {},
          { timeout: 6000, enableHighAccuracy: true }
        );
      }
    }
    loadInitialData();
  }, [authUser?.locationId]);

  // Admin/merchant catalog loading is intentionally isolated from consumer loading.
  // This prevents consumer location/search changes from restarting protected catalog requests.
  useEffect(() => {
    if (authUser?.role !== 'admin' && authUser?.role !== 'merchant') return;

    let cancelled = false;
    setIsLoadingProducts(true);

    const loadPortalCatalog = async () => {
      try {
        if (authUser.role === 'admin') {
          const [prods, shps] = await Promise.all([
            fetchAdminProducts(authUser.token),
            fetchAdminShops(authUser.token),
          ]);
          if (cancelled) return;
          setProducts(prods);
          setShops(shps);
        } else {
          const [prods, ownShop] = await Promise.all([
            fetchMerchantMasterCatalogApi(authUser.token),
            fetchMerchantShopApi(authUser.token),
          ]);
          if (cancelled) return;
          setProducts(prods);
          setShops(ownShop ? [ownShop] : []);
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to load portal catalog:', err);
      } finally {
        if (!cancelled) setIsLoadingProducts(false);
      }
    };

    void loadPortalCatalog();
    return () => {
      cancelled = true;
    };
  }, [authUser?.role, authUser?.token]);

  // Consumer product loading is separate from merchant/admin loading.
  useEffect(() => {
    if (authUser?.role === 'admin' || authUser?.role === 'merchant' || appView === 'merchant') return;

    let cancelled = false;
    const loadConsumerData = async () => {
      try {
        let prods: Product[];
        let shps: Shop[];
        let deals: FlashDeal[];

        if (currentLocation?.id) {
          try {
            localStorage.setItem('priceteller_consumer_location_id', currentLocation.id);
          } catch {}
          [prods, shps, deals] = await Promise.all([
            fetchProducts({
              category: selectedCategoryId,
              search: searchQuery,
              locationId: currentLocation.id,
            }),
            fetchShops(currentLocation.id),
            fetchFlashDeals(currentLocation.id),
          ]);
        } else {
          [prods, shps, deals] = await Promise.all([
            fetchProducts({
              category: selectedCategoryId,
              search: searchQuery,
            }),
            fetchShops(),
            fetchFlashDeals(),
          ]);
        }

        if (cancelled) return;
        setProducts(prods);
        setShops(shps);
        setFlashDeals(deals);
      } catch (err) {
        console.error('Failed to load consumer catalog:', err);
      }
    };

    void loadConsumerData();
    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId, searchQuery, currentLocation, authUser?.role, appView]);

  // Periodic background live sync for real-time stock & price updates on the consumer screen
  useEffect(() => {
    const syncLiveCatalog = async () => {
      if (appView === 'consumer' || currentRole === 'shopper') {
        const latestProds = await fetchProducts({
          category: selectedCategoryId,
          search: searchQuery,
          locationId: currentLocation?.id,
        });
        if (Array.isArray(latestProds)) {
          setProducts((prev) => {
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(latestProds);
            return isDifferent ? latestProds : prev;
          });
        }
      }
    };

    const intervalId = setInterval(syncLiveCatalog, 3000);
    window.addEventListener('focus', syncLiveCatalog);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', syncLiveCatalog);
    };
  }, [appView, currentRole, selectedCategoryId, searchQuery, currentLocation]);

  // Trigger Comparison Engine on basket change
  const triggerComparison = useCallback(async (currentBasket: BasketItem[]) => {
    if (currentBasket.length === 0) {
      setComparison(null);
      return;
    }
    setIsComparing(true);
    try {
      const requestPayload = currentBasket.map((b) => ({
        productId: b.productId,
        quantity: b.quantity,
        unit: b.selectedUnit,
      }));
      const result = await compareBasketApi(
        requestPayload,
        currentLocation?.id,
        customerCoords?.lat,
        customerCoords?.lng
      );
      setComparison(result);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  }, [currentLocation, customerCoords]);

  useEffect(() => {
    triggerComparison(basket);
  }, [basket, triggerComparison]);

  // Basket Handlers
  const handleAddToBasket = (product: Product, unit?: string) => {
    const priceValues = Object.values(product.prices || {});
    const stockStatuses = Object.values(product.stockStatus || {});
    const isOutOfStock =
      priceValues.length === 0 ||
      (stockStatuses.length > 0 && stockStatuses.every((s) => s === 'out_of_stock'));
    if (isOutOfStock) return;

    const selectedUnit = unit || product.defaultUnit;
    setBasket((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, product, quantity: 1, selectedUnit }];
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setBasket((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((x): x is BasketItem => x !== null);
    });
  };

  const handleUnitChange = (productId: string, newUnit: string) => {
    setBasket((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, selectedUnit: newUnit } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setBasket((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearBasket = () => {
    clearActiveBasket();
    setBasket([]);
  };

  const handleQuickAdd = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p) handleAddToBasket(p, p.defaultUnit);
  };

  const handleQuickAddPopular = () => {
    const popularIds = ['banana', 'milk', 'rice', 'onion', 'oil'];
    const popularProds = products.filter((p) => {
      if (!popularIds.includes(p.id)) return false;
      const priceValues = Object.values(p.prices || {});
      const stockStatuses = Object.values(p.stockStatus || {});
      return priceValues.length > 0 && (!stockStatuses.length || !stockStatuses.every((s) => s === 'out_of_stock'));
    });
    if (popularProds.length > 0) {
      setBasket((prev) => {
        const next = [...prev];
        popularProds.forEach((p) => {
          if (!next.some((item) => item.productId === p.id)) {
            next.push({ productId: p.id, product: p, quantity: 1, selectedUnit: p.defaultUnit });
          }
        });
        return next;
      });
    }
  };

  const handleAddMultipleItems = (items: { product: Product; quantity: number; unit: string }[]) => {
    const inStockItems = items.filter(({ product }) => {
      const priceValues = Object.values(product.prices || {});
      const stockStatuses = Object.values(product.stockStatus || {});
      return priceValues.length > 0 && (!stockStatuses.length || !stockStatuses.every((s) => s === 'out_of_stock'));
    });

    setBasket((prev) => {
      const next = [...prev];
      inStockItems.forEach(({ product, quantity, unit }) => {
        const idx = next.findIndex((item) => item.productId === product.id && item.selectedUnit === unit);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: Math.min(99, next[idx].quantity + quantity),
          };
        } else {
          next.push({
            productId: product.id,
            product,
            quantity: Math.min(99, Math.max(1, quantity)),
            selectedUnit: unit,
          });
        }
      });
      return next;
    });
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setAuthUser(user);
    try {
      sessionStorage.setItem('priceteller_token', user.token || '');
      sessionStorage.setItem('priceteller_auth_user', JSON.stringify(user));
      localStorage.removeItem('priceteller_token');
      localStorage.removeItem('priceteller_auth_user');
    } catch {}
    setIsAuthModalOpen(false);
    if (user.role === 'admin') {
      window.history.pushState({}, '', '/admin');
      setAppView('admin');
      setCurrentRole('admin');
    } else if (user.role === 'merchant') {
      window.history.pushState({}, '', '/merchant');
      setAppView('merchant');
      setCurrentRole('merchant');
    } else {
      window.history.pushState({}, '', '/consumer');
      setAppView('consumer');
      setCurrentRole('shopper');
      // Fetch consumer data immediately
      fetchConsumerDataApi(user.id, user.token).then((data) => {
        if (data) {
          setConsumerData(data);
          if (data.basket && data.basket.length > 0 && products.length > 0) {
            const rehydrated = data.basket
              .map((b: ConsumerSavedListItem) => {
                const p = products.find((x) => x.id === b.productId);
                return p
                  ? {
                      productId: p.id,
                      product: p,
                      quantity: b.quantity,
                      selectedUnit: b.selectedUnit || p.defaultUnit,
                    }
                  : null;
              })
              .filter(Boolean) as BasketItem[];
            if (rehydrated.length > 0) {
              setBasket(rehydrated);
            }
          }
        }
      });
    }
  };

  const handleLogout = () => {
    const token = authUser?.token || getAuthToken();
    if (token) void logoutUserApi(token);
    clearActiveBasket();
    setBasket([]);
    setAuthUser(null);
    setConsumerData(null);
    try {
      sessionStorage.removeItem('priceteller_token');
      sessionStorage.removeItem('priceteller_auth_user');
      localStorage.removeItem('priceteller_token');
      localStorage.removeItem('priceteller_auth_user');
    } catch {}
    window.history.pushState({}, '', '/');
    setAppView('welcome');
    setCurrentRole('shopper');
  };

  const handleOpenAuthModal = (
    mode: 'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway' = 'consumer-login'
  ) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Consumer Favorites & List Handlers
  const handleToggleFavorite = async (product: Product) => {
    if (!authUser || (authUser.role !== 'consumer' && authUser.role !== 'shopper')) {
      handleOpenAuthModal('consumer-login');
      return;
    }
    try {
      const res = await toggleConsumerFavoriteApi(authUser.id, product.id, authUser.token);
      if (res && res.data) {
        setConsumerData((prev) => prev ? { ...prev, favorites: res.data.favorites } : null);
      }
    } catch (e) {
      console.warn('Failed to toggle favorite', e);
    }
  };

  const handleSaveNamedList = async (listName: string) => {
    if (!authUser || (authUser.role !== 'consumer' && authUser.role !== 'shopper')) {
      handleOpenAuthModal('consumer-login');
      return;
    }
    const payload = basket.map((b) => ({
      productId: b.productId,
      quantity: b.quantity,
      selectedUnit: b.selectedUnit,
    }));
    const newList = await saveConsumerListApi(authUser.id, listName, payload, authUser.token);
    if (newList) {
      setConsumerData((prev) =>
        prev ? { ...prev, savedLists: [newList, ...(prev.savedLists || [])] } : null
      );
    }
  };

  const handleDeleteNamedList = async (listId: string) => {
    if (!authUser) return;
    const success = await deleteConsumerListApi(listId, authUser.id, authUser.token);
    if (success) {
      setConsumerData((prev) =>
        prev ? { ...prev, savedLists: prev.savedLists.filter((l) => l.id !== listId) } : null
      );
    }
  };

  const handleLoadSavedList = (list: ConsumerSavedList) => {
    const loaded = list.items
      .map((item) => {
        const p = products.find((x) => x.id === item.productId);
        return p
          ? {
              productId: p.id,
              product: p,
              quantity: item.quantity,
              selectedUnit: item.selectedUnit || p.defaultUnit,
            }
          : null;
      })
      .filter(Boolean) as BasketItem[];
    if (loaded.length > 0) {
      setBasket(loaded);
    }
  };

  // 0. Filter Available Products for Consumer (Out of stock items across all shops are excluded)
  const inStockProducts = useMemo(() => {
    return products.filter((p) => {
      const prices = Object.values(p.prices || {});
      if (prices.length === 0) return false;
      const stockStatuses = Object.values(p.stockStatus || {});
      const isAllOutOfStock = stockStatuses.length > 0 && stockStatuses.every((s) => s === 'out_of_stock');
      return !isAllOutOfStock;
    });
  }, [products]);

  // Dynamic category item counts based strictly on available in-stock products
  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      let count = 0;
      if (cat.id === 'all') {
        count = inStockProducts.length;
      } else if (cat.id === 'organic') {
        count = inStockProducts.filter((p) => p.isOrganic || p.categoryId === 'organic').length;
      } else {
        count = inStockProducts.filter((p) => p.categoryId === cat.id).length;
      }
      return { ...cat, itemCount: count };
    });
  }, [categories, inStockProducts]);

  // Filtered Products display (strictly in-stock available products)
  let displayedProducts = inStockProducts;

  // 1. Strict Category Filtering: If a specific category is selected, ONLY display that category's items!
  if (selectedCategoryId && selectedCategoryId !== 'all') {
    if (selectedCategoryId === 'organic') {
      displayedProducts = displayedProducts.filter((p) => p.isOrganic || p.categoryId === 'organic');
    } else {
      displayedProducts = displayedProducts.filter((p) => p.categoryId === selectedCategoryId);
    }
  }

  // 2. Search Query Filtering
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayedProducts = displayedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryId.toLowerCase().includes(q) ||
        (p.nutritionalNote && p.nutritionalNote.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // 3. Quick Filter Toggles
  if (isOrganicOnly) {
    displayedProducts = displayedProducts.filter((p) => p.isOrganic || p.categoryId === 'organic');
  }
  if (isUnder100Only) {
    displayedProducts = displayedProducts.filter(
      (p) => Math.min(...Object.values(p.prices)) <= 100
    );
  }

  const totalBasketCount = basket.reduce((acc, it) => acc + it.quantity, 0);

  // 0. VERIFYING SESSION: Secure loading state (no flash of protected content before server confirms)
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg animate-pulse">
            🛡️
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold tracking-wide text-gray-200">Verifying PriceTeller Session...</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Validating credentials with secure server authority</p>
        </div>
      </div>
    );
  }

  const handleProductCreated = (newProd: Product, andAddToBasket: boolean) => {
    setProducts((prev) => [newProd, ...prev]);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === 'all' || c.id === newProd.categoryId
          ? { ...c, itemCount: (c.itemCount || 0) + 1 }
          : c
      )
    );
    if (andAddToBasket && (authUser?.role === 'consumer' || authUser?.role === 'shopper')) {
      handleAddToBasket(newProd, newProd.defaultUnit);
    }
  };

  // 1. ADMIN PORTAL OR ADMIN AUTHENTICATION (Always accessible via /admin, /admin=true, ?admin=true)
  if (appView === 'admin' || isExplicitAdminRoute()) {
    if (!authUser || authUser.role !== 'admin') {
      return (
        <AdminLoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => {
            window.history.pushState({}, '', '/');
            setAppView('welcome');
          }}
          currentUser={authUser}
        />
      );
    }

    return (
      <>
        <AdminPanel
          locations={locations}
          shops={shops}
          products={products}
          categories={categories}
          authUser={authUser}
          onBackToShopper={() => {
            window.history.pushState({}, '', '/consumer');
            setAppView('consumer');
            setCurrentRole('shopper');
          }}
          onShopsUpdated={(updated) => setShops(updated)}
          onProductsUpdated={(updated) => setProducts(updated)}
          onLocationsUpdated={(updated) => setLocations(updated)}
          onOpenAddProductModal={(catId) => {
            setAddProductInitialCategory(catId);
            setIsAddProductModalOpen(true);
          }}
          onLogout={handleLogout}
        />
        {isAddProductModalOpen && (
          <AddProductModal
            categories={categories}
            shops={shops}
            initialCategoryId={addProductInitialCategory}
            onClose={() => {
              setIsAddProductModalOpen(false);
              setAddProductInitialCategory(undefined);
            }}
            onProductCreated={handleProductCreated}
          />
        )}
      </>
    );
  }

  // 2. KERALA WELCOME LANDING PAGE (Default screen on localhost / root visit)
  if (appView === 'welcome') {
    return (
      <>
        <MalayalamOpeningPage
          locations={locations}
          currentLocation={currentLocation}
          authUser={authUser}
          onSelectLocation={handleSelectLocation}
          onEnterAsConsumer={() => {
            if (authUser) {
              window.history.pushState({}, '', '/consumer');
              setAppView('consumer');
              setCurrentRole('shopper');
            } else {
              handleOpenAuthModal('consumer-login');
            }
          }}
          onOpenConsumerLogin={() => {
            if (authUser) {
              window.history.pushState({}, '', '/consumer');
              setAppView('consumer');
              setCurrentRole('shopper');
            } else {
              handleOpenAuthModal('consumer-login');
            }
          }}
          onOpenMerchantPortal={() => {
            if (authUser?.role === 'merchant' || authUser?.role === 'admin') {
              window.history.pushState({}, '', '/merchant');
              setAppView('merchant');
              setCurrentRole(authUser.role === 'admin' ? 'admin' : 'merchant');
            } else {
              window.history.pushState({}, '', '/portal');
              setAppView('portal');
            }
          }}
          onOpenShopCatalogue={handleOpenShopCatalogue}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onLoginSuccess={handleLoginSuccess}
          locations={locations}
        />
      </>
    );
  }

  // 3. MERCHANT PORTAL ENTRANCE FOR UNAUTHENTICATED OR VISITING MERCHANTS
  if (appView === 'portal' || (!authUser && isExplicitMerchantRoute())) {
    return (
      <>
        <OpeningPage
          locations={locations}
          onOpenConsumerLogin={() => handleOpenAuthModal('consumer-login')}
          onLoginSuccess={handleLoginSuccess}
          onBackToWelcome={() => {
            window.history.pushState({}, '', '/');
            setAppView('welcome');
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onLoginSuccess={handleLoginSuccess}
          locations={locations}
        />
      </>
    );
  }

  // 4. MERCHANT DASHBOARD (Strictly when appView is 'merchant' AND user is verified merchant/admin)
  if (appView === 'merchant') {
    if (!authUser || (authUser.role !== 'merchant' && authUser.role !== 'admin')) {
      window.history.replaceState({}, '', '/portal');
      setAppView('portal');
      return null;
    }

    // Check if merchant requires an active subscription
    if (isCheckingMerchantSubscription || !merchantSubStatus) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Checking merchant access...</p>
          </div>
        </div>
      );
    }

    const hasActiveSub = Boolean(
      merchantSubStatus.hasActiveSubscription ||
      merchantSubStatus.isActive ||
      (merchantSubStatus.subscription && (merchantSubStatus.subscription.status === 'ACTIVE' || (merchantSubStatus.daysRemaining && merchantSubStatus.daysRemaining > 0)))
    );

    if (!hasActiveSub && !merchantSubStatus.isExempt) {
      return (
        <MerchantSubscriptionPaywall
          merchantName={authUser.name}
          shopName={authUser.shopName}
          token={authUser.token}
          statusInfo={merchantSubStatus}
          onSubscriptionSuccess={(sub) => {
            const nextStatus: SubscriptionStatusResponse = {
              hasActiveSubscription: true,
              isActive: true,
              isExempt: false,
              subscription: sub,
              daysRemaining: sub.daysRemaining || sub.plan?.durationDays || 30,
              plan: sub.plan || null,
              merchantName: authUser.name,
              shopName: authUser.shopName,
            };
            setMerchantSubStatus(nextStatus);
            try {
              localStorage.setItem(`priceteller_subscription_status_${authUser.id}`, JSON.stringify(nextStatus));
            } catch {}
          }}
          onLogout={handleLogout}
          onBackToApp={() => {
            window.history.pushState({}, '', '/consumer');
            setAppView('consumer');
          }}
        />
      );
    }

    return (
      <>
        <MerchantDashboard
          shops={shops}
          products={products}
          onBackToShopper={() => {
            window.history.pushState({}, '', '/consumer');
            setAppView('consumer');
            setCurrentRole('shopper');
          }}
          onProductsUpdated={(updated) => setProducts(updated)}
          onShopsUpdated={(updated) => setShops(updated)}
          onOpenAddProductModal={(catId) => {
            setAddProductInitialCategory(catId);
            setIsAddProductModalOpen(true);
          }}
          authUser={authUser}
          isLoadingProducts={isLoadingProducts}
          onLogout={handleLogout}
          subStatus={merchantSubStatus}
          onOpenSubscriptionPaywall={() => setIsMerchantUpgradeModalOpen(true)}
        />
        {isAddProductModalOpen && (
          <AddProductModal
            categories={categories}
            shops={shops}
            initialCategoryId={addProductInitialCategory}
            onClose={() => {
              setIsAddProductModalOpen(false);
              setAddProductInitialCategory(undefined);
            }}
            onProductCreated={handleProductCreated}
          />
        )}
        {isMerchantUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[#F5F8F6] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl border border-surface-border">
              <MerchantSubscriptionPaywall
                merchantName={authUser.name}
                shopName={authUser.shopName}
                token={authUser.token}
                statusInfo={merchantSubStatus}
                isModal={true}
                onClose={() => setIsMerchantUpgradeModalOpen(false)}
                onSubscriptionSuccess={(sub) => {
                  const nextStatus: SubscriptionStatusResponse = {
                    hasActiveSubscription: true,
                    isActive: true,
                    isExempt: false,
                    subscription: sub,
                    daysRemaining: sub.daysRemaining || (sub.plan?.durationDays ?? 30),
                    plan: sub.plan || null,
                    merchantName: authUser.name,
                    shopName: authUser.shopName,
                  };
                  setMerchantSubStatus(nextStatus);
                  try {
                    localStorage.setItem(`priceteller_subscription_status_${authUser.id}`, JSON.stringify(nextStatus));
                  } catch {}
                  setIsMerchantUpgradeModalOpen(false);
                }}
                onLogout={() => {
                  setIsMerchantUpgradeModalOpen(false);
                  handleLogout();
                }}
                onBackToApp={() => {
                  setIsMerchantUpgradeModalOpen(false);
                  window.history.pushState({}, '', '/consumer');
                  setAppView('consumer');
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // 5. AUTHENTICATED CONSUMER SHOPPING PORTAL (Protected; redirect unauthenticated users to welcome)
  if (!authUser) {
    window.history.replaceState({}, '', '/');
    setAppView('welcome');
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#F5F8F6] text-[#17221D] font-sans">
      
      {/* 1. DESKTOP LEFT SIDEBAR (Matching Screen 2 of Reference Image) */}
      <aside className="w-60 bg-[#063B2A] text-white shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-[#084D37] shadow-xl fixed top-0 bottom-0 left-0 h-screen z-30 font-malayalam select-none overflow-y-auto">
        <div>
          {/* Brand Logo */}
          <div
            onClick={() => {
              window.history.pushState({}, '', '/');
              setShopperTab('home');
              setAppView('welcome');
            }}
            className="flex items-center gap-2.5 px-3 py-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors mb-4"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10A978] text-[#063B2A] flex items-center justify-center font-black text-base shadow-sm">
              <MapPin className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white flex items-center gap-1 font-sans">
                PriceTeller
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium">
                വില താരതമ്യം
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setShopperTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                shopperTab === 'home'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-300" />
              <span>ഹോം (Home)</span>
            </button>

            <button
              onClick={() => setShopperTab('shops')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                shopperTab === 'shops'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>ഷോപ്പുകൾ (Stores)</span>
            </button>

            <button
              onClick={() => setShopperTab('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                shopperTab === 'map'
                  ? 'bg-[#0B8F68] text-white shadow-xs font-black'
                  : 'text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>മാപ്പ് (Nearby Map)</span>
            </button>

            <button
              onClick={() => {
                if (!authUser) {
                  handleOpenAuthModal('consumer-login');
                } else {
                  setIsConsumerDashboardOpen(true);
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white"
            >
              <Heart className="w-4 h-4 text-emerald-300" />
              <span>ഇഷ്ടപ്പെട്ടവ (Favorites)</span>
            </button>

            <button
              onClick={() => {
                if (!authUser) {
                  handleOpenAuthModal('consumer-login');
                } else {
                  setIsConsumerPreBookingsOpen(true);
                }
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>ഓർഡറുകൾ (Orders)</span>
              </div>
              {consumerPreBookingsCount > 0 && (
                <span className="bg-[#10A978] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-sans">
                  {consumerPreBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!authUser) {
                  handleOpenAuthModal('consumer-login');
                } else {
                  setIsConsumerDashboardOpen(true);
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-[#DDF5EA]/80 hover:bg-[#DDF5EA]/10 hover:text-white"
            >
              <UserIcon className="w-4 h-4 text-emerald-300" />
              <span>പ്രൊഫൈൽ (Profile)</span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar Actions */}
        <div className="space-y-2 pt-4 border-t border-[#084D37]">
          <button
            onClick={() => {
              if (authUser?.role === 'merchant') {
                setAppView('merchant');
              } else {
                handleOpenAuthModal('merchant-login');
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#084D37]/70 hover:bg-[#084D37] rounded-xl text-[11px] font-bold text-[#DDF5EA] transition-all border border-[#10A978]/30 cursor-pointer"
          >
            <span>വ്യാപാരി പാനൽ (Merchant)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {authUser && (
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-[#DDF5EA]/70 font-sans">
              <span className="truncate max-w-[120px] font-medium">{authUser.name}</span>
              <button
                onClick={handleLogout}
                className="text-[11px] text-red-300 hover:text-red-200 hover:underline cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 md:ml-60">
        
        {/* Mobile Header matching Screen 1 */}
        <MobileHeader
          currentLocation={currentLocation}
          onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenChat={() => handleOpenChat()}
          basketCount={totalBasketCount}
          onOpenBasket={() => setIsMobileBasketOpen(true)}
          authUser={authUser}
          onOpenAuthModal={handleOpenAuthModal}
        />

        {/* Desktop Header (Preserved 100%) */}
        <div className="hidden md:block">
          <Header
            locations={locations}
            currentLocation={currentLocation}
            onSelectLocation={handleSelectLocation}
            customerCoords={customerCoords}
            onCustomerCoordsChanged={(coords) => {
              setCustomerCoords(coords);
              if (coords) {
                try {
                  localStorage.setItem('priceteller_customer_coords', JSON.stringify(coords));
                } catch {}
              } else {
                try {
                  localStorage.removeItem('priceteller_customer_coords');
                } catch {}
              }
            }}
            basketCount={totalBasketCount}
            onOpenBasketMobile={() => setIsMobileBasketOpen(true)}
            currentRole={currentRole}
            onSelectRole={(r) => {
              if (r === 'shopper') {
                window.history.pushState({}, '', '/consumer');
                setAppView('consumer');
              } else if (r === 'merchant' && authUser?.role === 'merchant') {
                window.history.pushState({}, '', '/merchant');
                setAppView('merchant');
              } else if (r === 'admin' && authUser?.role === 'admin') {
                window.history.pushState({}, '', '/admin');
                setAppView('admin');
              } else {
                handleOpenAuthModal('merchant-login');
              }
            }}
            onOpenDeals={() => setShowDealsBanner(true)}
            onOpenShopCatalogue={() => setShopperTab('shops')}
            authUser={authUser}
            consumerData={consumerData}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenConsumerDashboard={() => setIsConsumerDashboardOpen(true)}
            onOpenMerchantDashboard={() => {
              window.history.pushState({}, '', '/merchant');
              setAppView('merchant');
            }}
            onOpenAdminDashboard={() => {
              window.history.pushState({}, '', '/admin');
              setAppView('admin');
            }}
            onOpenChat={() => handleOpenChat()}
            onOpenPreBookings={() => {
              if (!authUser) {
                handleOpenAuthModal('consumer-login');
              } else {
                setIsConsumerPreBookingsOpen(true);
              }
            }}
            pendingPreBookingsCount={consumerPreBookingsCount}
            onLogout={handleLogout}
            onResetTrip={handleClearBasket}
            onGoHome={() => {
              window.history.pushState({}, '', '/');
              setShopperTab('home');
              setAppView('welcome');
            }}
          />
        </div>

        <main className="flex-1 max-w-[1280px] w-full mx-auto px-3 sm:px-6 py-4">

          {/* Flash Deals Ticker */}
          {showDealsBanner && (
            <div className="hidden md:block">
              <FlashDealsBanner
                deals={flashDeals}
                onAddDealToBasket={handleQuickAdd}
              />
            </div>
          )}

          {/* TAB 1: HOME VIEW */}
          {shopperTab === 'home' && (
            <>
              {/* Mobile Home Screen matching Screen 1 & Screen 2 */}
              <div className="md:hidden">
                <MobileHomeView
                  products={displayedProducts}
                  shops={verifiedShops.length > 0 ? verifiedShops : shops}
                  categories={categoriesWithCounts}
                  currentLocation={currentLocation}
                  basket={basket}
                  favorites={consumerData?.favorites || []}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                  onAddToBasket={handleAddToBasket}
                  onQuantityChange={handleQuantityChange}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProductForDetail={(p) => setSelectedMobileProduct(p)}
                  onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
                  onOpenShopCatalogue={(s) => handleOpenShopCatalogue(s)}
                />
              </div>

              {/* Desktop Home Screen (Preserved 100%) */}
              <div className="hidden md:block space-y-4">
                {/* Hero Banner with Kerala Greeting */}
                <Hero
                  currentLocationName={currentLocation ? currentLocation.name : 'Tirur'}
                  totalProductsCount={products.length}
                  totalShopsCount={verifiedShops.length}
                  userName={authUser?.name || 'സുഹൃത്തേ'}
                  onQuickAddPopular={handleQuickAddPopular}
                  onOpenShopCatalogue={() => setShopperTab('shops')}
                />

                {/* ⚡ Smart Shopping List Quick-Paste / Auto-Add */}
                <SmartListQuickAdd
                  products={products}
                  onAddMultipleItems={handleAddMultipleItems}
                />

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Basket & Product Catalog (7 or 8 cols) */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    
                    {/* 1. My Basket Panel */}
                    <SmartBasket
                      basketItems={basket}
                      onQuantityChange={handleQuantityChange}
                      onUnitChange={handleUnitChange}
                      onRemoveItem={handleRemoveItem}
                      onClearBasket={handleClearBasket}
                      onQuickAdd={handleQuickAdd}
                      onOpenChat={() => handleOpenChat()}
                      onPreBookBasket={() => handleOpenPreBooking()}
                      onSaveList={() => {
                        if (!authUser) {
                          handleOpenAuthModal('consumer-login');
                        } else {
                          setIsSaveBasketModalOpen(true);
                        }
                      }}
                    />

                    {/* 2. Products Catalog Section */}
                    <section className="bg-white border border-surface-border rounded-2xl p-4 sm:p-6 shadow-xs font-sans">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-slate-dark m-0 font-malayalam">ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ (Popular Products)</h2>
                          <span className="text-xs text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full font-bold font-malayalam">
                            {displayedProducts.length} സാധനങ്ങൾ
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-muted font-medium mb-3 font-malayalam">
                        സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ ചേർക്കൂ. അടുത്തുള്ള സൂപ്പർമാർക്കറ്റുകളിലെ ലൈവ് വിലകൾ തത്സമയം താരതമ്യം ചെയ്യാം.
                      </p>

                      {/* Categories & Search */}
                      <CategoryFilter
                        categories={categoriesWithCounts}
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategory={setSelectedCategoryId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        isOrganicOnly={isOrganicOnly}
                        onToggleOrganicOnly={() => setIsOrganicOnly(!isOrganicOnly)}
                        isUnder100Only={isUnder100Only}
                        onToggleUnder100Only={() => setIsUnder100Only(!isUnder100Only)}
                      />

                      {/* Products Grid */}
                      <div className="relative mt-2 rounded-2xl bg-surface-subtle/50 border border-surface-border p-2 sm:p-3">
                        <div
                          className="max-h-[580px] sm:max-h-[640px] overflow-y-auto overscroll-contain pr-1 sm:pr-1.5 scroll-smooth"
                          id="products"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3.5">
                            {displayedProducts.map((product) => {
                              const basketItem = basket.find((b) => b.productId === product.id);
                              const isFav = !!consumerData?.favorites?.includes(product.id);
                              return (
                                <ProductCard
                                  key={product.id}
                                  product={product}
                                  quantityInBasket={basketItem?.quantity || 0}
                                  currentUnit={basketItem?.selectedUnit || product.defaultUnit}
                                  isFavorite={isFav}
                                  onAdd={handleAddToBasket}
                                  onQuantityChange={handleQuantityChange}
                                  onViewHistory={(p) => setHistoryProduct(p)}
                                  onReportPrice={(p) => setReportProduct(p)}
                                  onToggleFavorite={handleToggleFavorite}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </section>

                  </div>

                  {/* Right Column: Sticky Price Comparison Engine */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    <ComparisonSummary
                      comparison={comparison}
                      isLoading={isComparing}
                      onOpenShopDetails={(shopName) => setSelectedShopDetail(shopName)}
                      onOpenWhatsAppExport={() => setIsWhatsAppModalOpen(true)}
                      onOpenItemizedMatrix={() => setIsItemizedMatrixOpen(true)}
                      onOpenStoreDuel={() => setIsStoreDuelOpen(true)}
                      onOpenChat={(shopName) => handleOpenChat(shopName)}
                      onPreBookBasket={(shopName) => handleOpenPreBooking(shopName)}
                    />
                  </div>

                </div>
              </div>
            </>
          )}

          {/* TAB 2: STORES DIRECTORY VIEW */}
          {shopperTab === 'shops' && (
            <StoresListView
              shops={shops}
              verifiedShops={verifiedShops}
              locations={locations}
              currentLocation={currentLocation}
              onSelectLocation={handleSelectLocation}
              products={products}
              onOpenShopCatalogue={(shopName) => handleOpenShopCatalogue(shopName)}
              onOpenChat={(shopName) => handleOpenChat(shopName)}
              onOpenPreBooking={(shopName) => handleOpenPreBooking(shopName)}
              onViewOnMap={() => setShopperTab('map')}
              onGoHome={() => setShopperTab('home')}
            />
          )}

          {/* TAB 3: NEARBY SHOPS MAP VIEW */}
          {shopperTab === 'map' && (
            <NearbyShopsMapView
              shops={verifiedShops}
              currentLocation={currentLocation}
              customerCoords={customerCoords}
              onSelectShop={(shopName) => setSelectedShopDetail(shopName)}
              onOpenShopCatalogue={handleOpenShopCatalogue}
            />
          )}

        </main>

        {/* Desktop Footer (Preserved) */}
        <footer className="hidden md:block mt-12 py-6 bg-white border-t border-surface-border text-xs text-slate-muted font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-xs">
                🛒
              </div>
              <span className="font-bold text-slate-dark">PriceTeller</span>
              <span className="font-malayalam text-slate-muted">· “നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത് — PriceTeller”</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-muted">
              <span>📍 Serving Kerala Supermarkets</span>
            </div>
          </div>
        </footer>

        {/* 3. REDESIGNED MOBILE BOTTOM NAVIGATION BAR MATCHING REFERENCE */}
        <MobileBottomNav
          activeTab={shopperTab}
          onSelectTab={(tab) => {
            if (tab === 'profile') {
              if (!authUser) {
                handleOpenAuthModal('consumer-login');
              } else {
                setIsConsumerDashboardOpen(true);
              }
            } else {
              setShopperTab(tab);
            }
          }}
          basketCount={totalBasketCount}
          onOpenBasket={() => setIsMobileBasketOpen(true)}
          onOpenProfile={() => {
            if (!authUser) {
              handleOpenAuthModal('consumer-login');
            } else {
              setIsConsumerDashboardOpen(true);
            }
          }}
        />

      </div>

      {/* Floating Bottom Basket Bar for Mobile */}
      {basket.length > 0 && !isMobileBasketOpen && (
        <div className="md:hidden fixed bottom-14 left-3 right-3 z-30 bg-[#063B2A] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom duration-200 border border-[#0B8F68]/30 font-malayalam">
          <div
            onClick={() => setIsMobileBasketOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-2"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10A978] flex items-center justify-center text-[#063B2A] shrink-0 shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#DDF5EA] truncate">
                {totalBasketCount} സാധനങ്ങൾ ബാസ്ക്കറ്റിൽ
              </div>
              <div className="text-sm font-black text-[#10A978] font-sans">
                ഏറ്റവും മികച്ചത്: ₹{comparison?.bestTotal || 0}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMobileBasketOpen(true)}
              className="px-3.5 py-2 bg-[#10A978] hover:bg-[#0B8F68] text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 shadow-xs"
            >
              ബാസ്ക്കറ്റ് കാണുക
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Mobile Cart Drawer matching Screen 5 */}
      {isMobileBasketOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[88dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 font-sans">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3ECE7] bg-[#F5F8F6] shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#0B8F68]" />
                <h3 className="text-base font-black text-[#17221D] font-malayalam m-0">എന്റെ ബാസ്കറ്റ് ({totalBasketCount} ഇനങ്ങൾ)</h3>
              </div>
              <button
                onClick={() => setIsMobileBasketOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <MobileBasketView
                basketItems={basket}
                comparison={comparison}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onRemoveItem={handleRemoveItem}
                onClearBasket={handleClearBasket}
                onOpenShopDetails={(shopName) => {
                  setIsMobileBasketOpen(false);
                  setSelectedShopDetail(shopName);
                }}
                onOpenChat={(shopName) => {
                  setIsMobileBasketOpen(false);
                  handleOpenChat(shopName);
                }}
                onPreBookBasket={(shopName) => {
                  setIsMobileBasketOpen(false);
                  handleOpenPreBooking(shopName);
                }}
                onOpenWhatsAppExport={() => {
                  setIsMobileBasketOpen(false);
                  setIsWhatsAppModalOpen(true);
                }}
                onGoToShopCatalog={() => {
                  setIsMobileBasketOpen(false);
                  setShopperTab('home');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isStoreDuelOpen && (
        <StoreDuelModal
          shops={verifiedShops}
          comparison={comparison}
          onClose={() => setIsStoreDuelOpen(false)}
        />
      )}

      {historyProduct && (
        <PriceHistoryModal
          product={historyProduct}
          onClose={() => setHistoryProduct(null)}
        />
      )}

      {reportProduct && (
        <CrowdReportModal
          product={reportProduct}
          shops={verifiedShops}
          onClose={() => setReportProduct(null)}
          onSuccess={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            triggerComparison(basket);
          }}
        />
      )}

      {selectedShopDetail && (
        <ShopDetailModal
          shopName={selectedShopDetail}
          shops={verifiedShops}
          comparison={comparison}
          onClose={() => setSelectedShopDetail(null)}
          onOpenChat={(shop) => handleOpenChat(shop)}
          onOpenShopCatalogue={(shop) => handleOpenShopCatalogue(shop)}
        />
      )}

      {isWhatsAppModalOpen && (
        <WhatsAppExportModal
          basketItems={basket}
          comparison={comparison}
          locationName={currentLocation ? currentLocation.name : 'Tirur'}
          onClose={() => setIsWhatsAppModalOpen(false)}
        />
      )}

      {isItemizedMatrixOpen && (
        <ItemizedMatrixModal
          comparison={comparison}
          onClose={() => setIsItemizedMatrixOpen(false)}
        />
      )}

      {isAddProductModalOpen && (
        <AddProductModal
          categories={categories}
          shops={shops}
          onClose={() => setIsAddProductModalOpen(false)}
          onProductCreated={(newProd, andAddToBasket) => {
            setProducts((prev) => [newProd, ...prev]);
            // Update category count
            setCategories((prev) =>
              prev.map((c) =>
                c.id === 'all' || c.id === newProd.categoryId
                  ? { ...c, itemCount: (c.itemCount || 0) + 1 }
                  : c
              )
            );
            if (andAddToBasket) {
              handleAddToBasket(newProd, newProd.defaultUnit);
            }
          }}
        />
      )}

      {/* Consumer Saved Lists & Favorites Account Dashboard Modal */}
      {isConsumerDashboardOpen && authUser && (
        <ConsumerDashboardModal
          isOpen={isConsumerDashboardOpen}
          onClose={() => setIsConsumerDashboardOpen(false)}
          user={authUser}
          consumerData={consumerData}
          products={products}
          onLoadListIntoBasket={handleLoadSavedList}
          onDeleteList={handleDeleteNamedList}
          onAddFavoriteToBasket={(p) => handleAddToBasket(p, p.defaultUnit)}
          onRemoveFavorite={(prodId) => {
            const p = products.find((x) => x.id === prodId);
            if (p) handleToggleFavorite(p);
          }}
          onLogout={handleLogout}
          onOpenSaveCurrentBasketModal={() => setIsSaveBasketModalOpen(true)}
        />
      )}

      {/* Save Active Basket Named List Modal */}
      {isSaveBasketModalOpen && (
        <SaveBasketModal
          isOpen={isSaveBasketModalOpen}
          onClose={() => setIsSaveBasketModalOpen(false)}
          basket={basket}
          onSave={handleSaveNamedList}
        />
      )}

      {/* Consumer Chat with Merchant Modal */}
      {isChatModalOpen && (
        <ConsumerChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setChatModalInitialShop(null);
          }}
          authUser={authUser}
          shops={verifiedShops.length > 0 ? verifiedShops : shops}
          initialShopName={chatModalInitialShop}
          basketItems={basket}
          comparison={comparison}
          locationName={currentLocation ? currentLocation.name : 'Tirur'}
          onRequireAuth={() => handleOpenAuthModal('consumer-login')}
        />
      )}

      {/* Consumer Pre-Booking Basket Modal */}
      {isPreBookingModalOpen && (
        <PreBookingModal
          isOpen={isPreBookingModalOpen}
          onClose={() => {
            setIsPreBookingModalOpen(false);
            setPreBookingInitialShop(null);
          }}
          basketItems={basket}
          shops={verifiedShops.length > 0 ? verifiedShops : shops}
          comparison={comparison}
          authUser={authUser}
          initialShopName={preBookingInitialShop}
          onRequireAuth={() => handleOpenAuthModal('consumer-login')}
          onOpenPreBookingsList={() => setIsConsumerPreBookingsOpen(true)}
        />
      )}

      {/* Consumer Pre-Booked Baskets Status Tracker Modal */}
      {isConsumerPreBookingsOpen && authUser && (
        <ConsumerPreBookingsModal
          isOpen={isConsumerPreBookingsOpen}
          onClose={() => setIsConsumerPreBookingsOpen(false)}
          authUser={authUser}
          onOpenChat={(shopName) => handleOpenChat(shopName)}
        />
      )}

      {/* Shop-Specific Price & Availability Catalogue Modal */}
      {isShopCatalogueOpen && (
        <ShopPriceCatalogueModal
          isOpen={isShopCatalogueOpen}
          onClose={() => {
            setIsShopCatalogueOpen(false);
            setCatalogueInitialShopName(null);
          }}
          locations={locations}
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          shops={verifiedShops.length > 0 ? verifiedShops : shops}
          initialShopName={catalogueInitialShopName}
          categories={categories}
          products={products}
          basket={basket}
          onAddToBasket={handleAddToBasket}
          onQuantityChange={handleQuantityChange}
          onOpenChat={(shopName) => handleOpenChat(shopName)}
          onOpenPreBooking={(shopName) => handleOpenPreBooking(shopName)}
        />
      )}

      {/* Unified Authentication Modal (Consumer & Merchant) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        locations={locations}
      />

      {/* Redesigned Mobile Navigation Drawer matching Screen 9 */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        authUser={authUser}
        basketCount={totalBasketCount}
        pendingOrdersCount={consumerPreBookingsCount}
        onNavigateTab={(tab) => {
          if (tab === 'profile') {
            if (!authUser) handleOpenAuthModal('consumer-login');
            else setIsConsumerDashboardOpen(true);
          } else {
            setShopperTab(tab);
          }
        }}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenConsumerDashboard={() => setIsConsumerDashboardOpen(true)}
        onOpenPreBookings={() => {
          if (!authUser) handleOpenAuthModal('consumer-login');
          else setIsConsumerPreBookingsOpen(true);
        }}
        onOpenMerchantPortal={() => {
          if (authUser?.role === 'merchant') {
            window.history.pushState({}, '', '/merchant');
            setAppView('merchant');
          } else {
            handleOpenAuthModal('merchant-login');
          }
        }}
        onOpenAdminPortal={() => {
          if (authUser?.role === 'admin') {
            window.history.pushState({}, '', '/admin');
            setAppView('admin');
          } else {
            handleOpenAuthModal('merchant-login');
          }
        }}
        onLogout={handleLogout}
      />

      {/* Redesigned Mobile Location Permission Sheet matching Screen 10 */}
      <MobileLocationModal
        isOpen={isMobileLocationModalOpen}
        onClose={() => setIsMobileLocationModalOpen(false)}
        locations={locations}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        onAllowLocation={() => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCustomerCoords({ lat, lng, name: 'Live GPS Location' });
                try {
                  localStorage.setItem('priceteller_customer_coords', JSON.stringify({ lat, lng, name: 'Live GPS Location' }));
                } catch {}
                const result = findNearestLocation(lat, lng, locations);
                if (result) {
                  handleSelectLocation(result.nearestLocation);
                }
                setIsMobileLocationModalOpen(false);
              },
              () => {
                setIsMobileLocationModalOpen(false);
              },
              { timeout: 8000, enableHighAccuracy: true }
            );
          } else {
            setIsMobileLocationModalOpen(false);
          }
        }}
      />

      {/* Redesigned Mobile Product Multi-Store Comparison Modal matching Screen 3 */}
      {selectedMobileProduct && (
        <MobileProductDetailModal
          product={selectedMobileProduct}
          shops={verifiedShops.length > 0 ? verifiedShops : shops}
          quantityInBasket={basket.find((b) => b.productId === selectedMobileProduct.id)?.quantity || 0}
          currentUnit={basket.find((b) => b.productId === selectedMobileProduct.id)?.selectedUnit || selectedMobileProduct.defaultUnit}
          isFavorite={!!consumerData?.favorites?.includes(selectedMobileProduct.id)}
          onClose={() => setSelectedMobileProduct(null)}
          onAdd={(p, u) => handleAddToBasket(p, u)}
          onQuantityChange={handleQuantityChange}
          onToggleFavorite={handleToggleFavorite}
          onOpenShopCatalogue={(shopName) => {
            setSelectedMobileProduct(null);
            handleOpenShopCatalogue(shopName);
          }}
        />
      )}
    </div>
  );
};
export default App;



