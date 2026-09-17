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
import { findNearestLocation, requestBrowserGps, reverseGeocodeDetails, GpsDebugInfo } from './services/locationService';
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
import { MobileCategoryView } from './components/MobileCategoryView';
import { MobileProductDetailModal } from './components/MobileProductDetailModal';
import { MobileBasketView } from './components/MobileBasketView';
import { MobileCompareView } from './components/MobileCompareView';
import { MobileProfileView } from './components/MobileProfileView';
import { DesktopHeader } from './components/DesktopHeader';
import { DesktopLeftSidebar } from './components/DesktopLeftSidebar';
import { DesktopHomeView } from './components/DesktopHomeView';
import { DesktopRightSidebar } from './components/DesktopRightSidebar';
import { DesktopProfileView } from './components/DesktopProfileView';
import { EnteBazaarLogo } from './components/EnteBazaarLogo';
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
import { ShoppingCart, X, Home, Store, MapPin, Heart, Clock, User as UserIcon, Search, Shield, ChevronRight, Scale, MessageCircle, ArrowLeft } from 'lucide-react';


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

  // Shopper Main View Tab ('home' | 'search' | 'cart' | 'compare' | 'orders' | 'profile' | 'shops' | 'map' | 'favorites')
  const [shopperTab, setShopperTab] = useState<'home' | 'search' | 'cart' | 'compare' | 'orders' | 'profile' | 'shops' | 'map' | 'favorites' | 'categories'>('home');

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
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<Category | null>(null);

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

  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsFeedback, setGpsFeedback] = useState<{ text: string; isWarning?: boolean } | null>(null);
  const [gpsDebugDetails, setGpsDebugDetails] = useState<GpsDebugInfo | null>(null);

  const handleCustomerCoordsChanged = useCallback((coords: { lat: number; lng: number; name?: string } | null) => {
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
  }, []);

  const handleDetectGpsLocation = useCallback(() => {
    setIsDetectingGps(true);
    setGpsFeedback(null);
    requestBrowserGps(
      async (coords) => {
        const lat = coords.lat;
        const lng = coords.lng;
        
        const details = await reverseGeocodeDetails(lat, lng, coords.accuracy);
        setGpsDebugDetails(details);

        if (details.isAcceptableAccuracy === false) {
          setIsDetectingGps(false);
          const accuracyKm = Math.round((coords.accuracy / 1000) * 10) / 10;
          setGpsFeedback({
            text: `GPS സിഗ്നൽ കൃത്യത കുറവാണ് (${accuracyKm} km). ദയവായി പട്ടികയിൽ നിന്ന് സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.`,
            isWarning: true,
          });
          return;
        }

        const placeName = details.locality || details.townCity || details.district || details.displayName;
        const newCoords = { lat, lng, name: placeName };
        handleCustomerCoordsChanged(newCoords);

        const result = findNearestLocation(lat, lng, locations);
        if (result) {
          handleSelectLocation(result.nearestLocation);
          if (result.isWithinHubArea) {
            setGpsFeedback({
              text: `${placeName} (${result.nearestLocation.name} Hub, ${result.distanceKm} km)`,
              isWarning: false,
            });
            setTimeout(() => {
              setIsMobileLocationModalOpen(false);
              setGpsFeedback(null);
            }, 3000);
          } else {
            setGpsFeedback({
              text: `നിങ്ങളുടെ സ്ഥലം (${placeName}) മലപ്പുറം ഹബ്ബിന് പുറത്താണ്. സമീപത്തെ ഹബ്ബ്: ${result.nearestLocation.name} (${result.distanceKm} km)`,
              isWarning: true,
            });
          }
        } else {
          setIsMobileLocationModalOpen(false);
        }
        setIsDetectingGps(false);
      },
      (errorMsg, debugInfo) => {
        setIsDetectingGps(false);
        if (debugInfo) {
          setGpsDebugDetails(debugInfo);
        }
        setGpsFeedback({
          text: errorMsg,
          isWarning: true,
        });
      }
    );
  }, [locations, handleSelectLocation, handleCustomerCoordsChanged]);

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

      // 4. Default to saved or first registered hub without auto-overriding via IP geolocation
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

        const isMerchant = currentRole === 'merchant' || authUser?.role === 'merchant';
        if (currentLocation?.id) {
          try {
            localStorage.setItem('priceteller_consumer_location_id', currentLocation.id);
          } catch {}
          [prods, shps, deals] = await Promise.all([
            fetchProducts({
              category: selectedCategoryId,
              search: searchQuery,
              locationId: currentLocation.id,
              includeMaster: isMerchant,
            }),
            fetchShops(currentLocation.id),
            fetchFlashDeals(currentLocation.id),
          ]);
        } else {
          [prods, shps, deals] = await Promise.all([
            fetchProducts({
              category: selectedCategoryId,
              search: searchQuery,
              includeMaster: isMerchant,
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
            <span className="text-sm font-bold tracking-wide text-gray-200">Verifying EnteBazaar Session...</span>
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
          onCustomerCoordsChanged={handleCustomerCoordsChanged}
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
          onSearch={(query) => {
            setSearchQuery(query);
            if (authUser) {
              window.history.pushState({}, '', '/consumer');
              setAppView('consumer');
              setCurrentRole('shopper');
            } else {
              handleOpenAuthModal('consumer-login');
            }
          }}
          onSelectCategory={(categoryId) => {
            setSelectedCategoryId(categoryId);
            if (authUser) {
              window.history.pushState({}, '', '/consumer');
              setAppView('consumer');
              setCurrentRole('shopper');
            } else {
              handleOpenAuthModal('consumer-login');
            }
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
      
      {/* 1. DESKTOP LEFT SIDEBAR (Matching Image 1 Reference) */}
      <DesktopLeftSidebar
        currentTab={shopperTab}
        onSelectTab={(tab) => {
          setShopperTab(tab);
          if (tab === 'home') setSelectedCategoryId('all');
        }}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
        authUser={authUser}
        onOpenAuthModal={() => handleOpenAuthModal('consumer-login')}
      />

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 md:ml-64">
        
        {/* Mobile Header matching Screen 1 */}
        <MobileHeader
          currentLocation={currentLocation}
          onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenProfile={() => setShopperTab('profile')}
          onOpenChat={() => handleOpenChat()}
          authUser={authUser}
          unreadNotificationsCount={1}
        />

        {/* Desktop Header (Matching Image 1) with Location Selector */}
        <div className="hidden md:block">
          <DesktopHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            authUser={authUser}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenFavorites={() => {
              if (!authUser) handleOpenAuthModal('consumer-login');
              else setShopperTab('profile');
            }}
            onOpenOrders={() => {
              if (!authUser) handleOpenAuthModal('consumer-login');
              else setShopperTab('orders');
            }}
            onOpenProfile={() => {
              if (!authUser) handleOpenAuthModal('consumer-login');
              else setShopperTab('profile');
            }}
            onSelectRole={(r) => {
              if (r === 'shopper') {
                setAppView('consumer');
              } else if (r === 'merchant') {
                setAppView('merchant');
              } else if (r === 'admin') {
                setAppView('admin');
              }
            }}
            onLogout={handleLogout}
          />
        </div>

        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5">

          {/* Flash Deals Ticker */}
          {showDealsBanner && (
            <div className="hidden md:block mb-4">
              <FlashDealsBanner
                deals={flashDeals}
                onAddDealToBasket={handleQuickAdd}
              />
            </div>
          )}

          {/* MOBILE SCREENS (Matching the 5 mobile views) */}
          <div className="md:hidden">
            {shopperTab === 'home' && (
              selectedMobileCategory ? (
                <MobileCategoryView
                  category={selectedMobileCategory}
                  products={products}
                  basket={basket}
                  onBack={() => {
                    setSelectedMobileCategory(null);
                    setSelectedCategoryId('all');
                  }}
                  onOpenCart={() => setShopperTab('cart')}
                  onSelectProduct={(p) => setSelectedMobileProduct(p)}
                  onAddToBasket={handleAddToBasket}
                  onQuantityChange={handleQuantityChange}
                />
              ) : (
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
                  onSelectCategory={(catId) => {
                    const cat: Category = {
                      id: catId,
                      name:
                        catId === 'vegetables'
                          ? 'പച്ചക്കറികൾ'
                          : catId === 'fruits'
                          ? 'പഴങ്ങൾ'
                          : catId === 'rice-grains'
                          ? 'ധാന്യങ്ങൾ'
                          : catId === 'dairy'
                          ? 'പാൽ & പാലുൽപ്പന്നങ്ങൾ'
                          : catId === 'spices'
                          ? 'മസാലകൾ'
                          : catId === 'grocery'
                          ? 'കറി സാധനങ്ങൾ'
                          : catId === 'biscuits-snacks'
                          ? 'സ്നാക്സ് & പാനീയങ്ങൾ'
                          : 'എല്ലാ ഉൽപ്പന്നങ്ങളും',
                      slug: catId,
                      icon:
                        catId === 'vegetables'
                          ? '🥬'
                          : catId === 'fruits'
                          ? '🍌'
                          : catId === 'rice-grains'
                          ? '🌾'
                          : catId === 'dairy'
                          ? '🥛'
                          : catId === 'spices'
                          ? '🌶️'
                          : catId === 'grocery'
                          ? '🥫'
                          : '🛒',
                      description: '',
                      itemCount: 0,
                    };
                    setSelectedMobileCategory(cat);
                    setSelectedCategoryId(catId);
                  }}
                  onAddToBasket={handleAddToBasket}
                  onQuantityChange={handleQuantityChange}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProductForDetail={(p) => setSelectedMobileProduct(p)}
                  onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
                  onOpenShopCatalogue={(s) => handleOpenShopCatalogue(s)}
                  onViewAllCategories={() => {
                    const cat: Category = {
                      id: 'all',
                      name: 'എല്ലാ ഉൽപ്പന്നങ്ങളും',
                      slug: 'all',
                      icon: '🛒',
                      description: '',
                      itemCount: products.length,
                    };
                    setSelectedMobileCategory(cat);
                    setSelectedCategoryId('all');
                  }}
                  onViewAllProducts={() => {
                    const cat: Category = {
                      id: 'all',
                      name: 'എല്ലാ ഉൽപ്പന്നങ്ങളും',
                      slug: 'all',
                      icon: '🛒',
                      description: '',
                      itemCount: products.length,
                    };
                    setSelectedMobileCategory(cat);
                    setSelectedCategoryId('all');
                  }}
                />
              )
            )}

            {shopperTab === 'search' && (
              <MobileCategoryView
                category={{
                  id: 'all',
                  name: 'തിരയുക',
                  slug: 'search',
                  icon: '🔍',
                  description: '',
                  itemCount: products.length,
                }}
                products={products}
                basket={basket}
                onBack={() => setShopperTab('home')}
                onOpenCart={() => setShopperTab('cart')}
                onSelectProduct={(p) => setSelectedMobileProduct(p)}
                onAddToBasket={handleAddToBasket}
                onQuantityChange={handleQuantityChange}
              />
            )}

            {shopperTab === 'cart' && (
              <MobileBasketView
                basketItems={basket}
                comparison={comparison}
                onBack={() => setShopperTab('home')}
                onGoToCompare={() => setShopperTab('compare')}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onRemoveItem={handleRemoveItem}
                onClearBasket={handleClearBasket}
                onCheckout={() => {
                  if (!authUser) {
                    handleOpenAuthModal('consumer-login');
                  } else {
                    handleOpenPreBooking();
                  }
                }}
              />
            )}

            {shopperTab === 'compare' && (
              <MobileCompareView
                basketItems={basket}
                comparison={comparison}
                currentLocation={currentLocation}
                onBack={() => setShopperTab('home')}
                onGoToSearch={() => setShopperTab('search')}
                onOpenShopDetails={(shopName) => setSelectedShopDetail(shopName)}
                onOpenChat={(shopName) => handleOpenChat(shopName)}
                onPreBookBasket={(shopName) => handleOpenPreBooking(shopName)}
                onOpenWhatsAppExport={() => setIsWhatsAppModalOpen(true)}
              />
            )}

            {shopperTab === 'profile' && (
              <MobileProfileView
                authUser={authUser}
                onOpenAuthModal={() => handleOpenAuthModal('consumer-login')}
                onLogout={handleLogout}
                onBack={() => setShopperTab('home')}
                onSelectSubTab={(tabId) => {
                  if (tabId === 'orders') {
                    if (!authUser) handleOpenAuthModal('consumer-login');
                    else setIsConsumerPreBookingsOpen(true);
                  } else if (tabId === 'chat') {
                    handleOpenChat();
                  } else if (tabId === 'addresses' || tabId === 'payments') {
                    if (!authUser) handleOpenAuthModal('consumer-login');
                    else setIsConsumerDashboardOpen(true);
                  }
                }}
              />
            )}

            {shopperTab === 'orders' && (
              <div className="p-4 space-y-3 font-sans pb-24">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F0F4F2]">
                  <button
                    type="button"
                    onClick={() => setShopperTab('home')}
                    className="p-1.5 bg-[#F5F8F6] hover:bg-[#E8F5EE] border border-[#E3ECE7] active:scale-95 rounded-xl text-[#17221D] transition-all cursor-pointer"
                    title="ഹോമിലേക്ക് മടങ്ങുക (Back to Home)"
                    aria-label="Back to Home"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#0B8F68]" />
                  </button>
                  <h2 className="text-base font-extrabold text-[#17221D] font-malayalam m-0">എന്റെ ഓർഡറുകൾ</h2>
                </div>
                {authUser ? (
                  <div className="p-6 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs">
                    <div className="w-14 h-14 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto text-xl">
                      📦
                    </div>
                    <h3 className="text-sm font-black text-[#17221D] font-malayalam">
                      സജീവമായ ഓർഡറുകൾ ഇല്ല
                    </h3>
                    <p className="text-xs text-[#66756E] font-malayalam">
                      നിങ്ങൾ ഓർഡർ ചെയ്ത സാധനങ്ങളുടെ വിവരങ്ങൾ ഇവിടെ കാണാം.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShopperTab('home')}
                      className="py-2.5 px-5 bg-[#063B2A] text-white text-xs font-bold rounded-xl cursor-pointer font-malayalam"
                    >
                      ഷോപ്പിംഗ് തുടരുക
                    </button>
                  </div>
                ) : (
                  <div className="p-8 bg-white border border-[#E3ECE7] rounded-3xl text-center space-y-3 shadow-2xs mt-4">
                    <div className="w-16 h-16 rounded-full bg-[#E8F5EE] text-[#0B8F68] flex items-center justify-center mx-auto text-2xl">
                      📦
                    </div>
                    <h3 className="text-base font-black text-[#17221D] font-malayalam">
                      ഓർഡറുകൾ കാണാൻ ലോഗിൻ ചെയ്യുക
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleOpenAuthModal('consumer-login')}
                      className="py-3 px-6 bg-[#063B2A] text-white text-xs font-bold rounded-2xl cursor-pointer font-malayalam"
                    >
                      ലോഗിൻ / രജിസ്റ്റർ
                    </button>
                  </div>
                )}
              </div>
            )}

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

            {shopperTab === 'map' && (
              <NearbyShopsMapView
                shops={verifiedShops}
                currentLocation={currentLocation}
                customerCoords={customerCoords}
                onSelectShop={(shopName) => setSelectedShopDetail(shopName)}
                onOpenShopCatalogue={handleOpenShopCatalogue}
                onBack={() => setShopperTab('home')}
              />
            )}
          </div>

          {/* DESKTOP MAIN APPLICATION VIEW */}
          <div className="hidden md:block">
            {shopperTab === 'home' && (
              <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <DesktopHomeView
                    products={displayedProducts}
                    shops={verifiedShops.length > 0 ? verifiedShops : shops}
                    categories={categoriesWithCounts}
                    currentLocation={currentLocation}
                    basket={basket}
                    favorites={consumerData?.favorites || []}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={(catId) => setSelectedCategoryId(catId)}
                    onAddToBasket={handleAddToBasket}
                    onQuantityChange={handleQuantityChange}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectProductForDetail={(p) => setSelectedMobileProduct(p)}
                    onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
                    onOpenShopCatalogue={(s) => handleOpenShopCatalogue(s)}
                    onClearBasket={handleClearBasket}
                    onOpenOrders={() => {
                      if (!authUser) handleOpenAuthModal('consumer-login');
                      else setIsConsumerPreBookingsOpen(true);
                    }}
                    onOpenDeals={() => setShowDealsBanner(true)}
                  />
                </div>
                <DesktopRightSidebar
                  basket={basket}
                  shops={verifiedShops.length > 0 ? verifiedShops : shops}
                  currentLocation={currentLocation}
                  comparison={comparison}
                  isLoadingComparison={isComparing}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                  onClearBasket={handleClearBasket}
                  onOpenCart={() => setIsMobileBasketOpen(true)}
                  onOpenShops={() => setShopperTab('shops')}
                  onOpenDeals={() => setShowDealsBanner(true)}
                  onOpenShopDetails={(shopName) => setSelectedShopDetail(shopName)}
                  onOpenWhatsAppExport={() => setIsWhatsAppModalOpen(true)}
                  onOpenItemizedMatrix={() => setIsItemizedMatrixOpen(true)}
                  onOpenStoreDuel={() => setIsStoreDuelOpen(true)}
                  onOpenChat={(shopName) => handleOpenChat(shopName)}
                  onPreBookBasket={(shopName) => handleOpenPreBooking(shopName)}
                />
              </div>
            )}

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

            {shopperTab === 'map' && (
              <NearbyShopsMapView
                shops={verifiedShops}
                currentLocation={currentLocation}
                customerCoords={customerCoords}
                onSelectShop={(shopName) => setSelectedShopDetail(shopName)}
                onOpenShopCatalogue={handleOpenShopCatalogue}
              />
            )}

            {shopperTab === 'profile' && (
              <DesktopProfileView
                authUser={authUser}
                consumerData={consumerData}
                products={products}
                currentLocation={currentLocation}
                initialTab="profile"
                onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
                onOpenAuthModal={() => handleOpenAuthModal('consumer-login')}
                onLogout={handleLogout}
                onLoadListIntoBasket={handleLoadSavedList}
                onDeleteList={handleDeleteNamedList}
                onAddFavoriteToBasket={(p) => handleAddToBasket(p, p.defaultUnit)}
                onRemoveFavorite={(prodId) => {
                  const p = products.find((x) => x.id === prodId);
                  if (p) handleToggleFavorite(p);
                }}
                onOpenChat={(shopName) => handleOpenChat(shopName)}
                onGoShopping={() => setShopperTab('home')}
              />
            )}

            {shopperTab === 'orders' && (
              <DesktopProfileView
                authUser={authUser}
                consumerData={consumerData}
                products={products}
                currentLocation={currentLocation}
                initialTab="orders"
                onOpenLocationModal={() => setIsMobileLocationModalOpen(true)}
                onOpenAuthModal={() => handleOpenAuthModal('consumer-login')}
                onLogout={handleLogout}
                onLoadListIntoBasket={handleLoadSavedList}
                onDeleteList={handleDeleteNamedList}
                onAddFavoriteToBasket={(p) => handleAddToBasket(p, p.defaultUnit)}
                onRemoveFavorite={(prodId) => {
                  const p = products.find((x) => x.id === prodId);
                  if (p) handleToggleFavorite(p);
                }}
                onOpenChat={(shopName) => handleOpenChat(shopName)}
                onGoShopping={() => setShopperTab('home')}
              />
            )}
          </div>

        </main>

        {/* Desktop Footer (Preserved) */}
        <footer className="hidden md:block mt-12 py-6 bg-white border-t border-surface-border text-xs text-slate-muted font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-xs">
                🛒
              </div>
              <span className="font-bold text-slate-dark">EnteBazaar</span>
              <span className="font-malayalam text-slate-muted">· “നിങ്ങളുടെ പൈസയ്ക്ക് ഏറ്റവും നല്ലത് — EnteBazaar”</span>
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
            setSelectedMobileCategory(null);
            setShopperTab(tab);
          }}
          basketCount={totalBasketCount}
        />

      </div>

      {/* Floating Bottom Basket Bar for Mobile */}
      {basket.length > 0 && !isMobileBasketOpen && shopperTab !== 'compare' && (
        <div className="md:hidden fixed bottom-14 left-3 right-3 z-30 bg-[#063B2A] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom duration-200 border border-[#0B8F68]/30 font-malayalam">
          <div
            onClick={() => setShopperTab('compare')}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-2"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10A978] flex items-center justify-center text-[#063B2A] shrink-0 shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#DDF5EA] truncate">
                {totalBasketCount} സാധനങ്ങൾ · വില താരതമ്യം
              </div>
              <div className="text-sm font-black text-[#10A978] font-sans">
                ഏറ്റവും കുറഞ്ഞത്: ₹{comparison?.bestTotal || 0}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShopperTab('compare')}
              className="px-3 py-2 bg-[#10A978] hover:bg-[#0B8F68] text-white text-xs font-black rounded-xl cursor-pointer active:scale-95 shadow-xs flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>താരതമ്യം</span>
            </button>
            <button
              onClick={() => setIsMobileBasketOpen(true)}
              className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95"
              title="ബാസ്ക്കറ്റ് കാണുക"
            >
              <ShoppingCart className="w-4 h-4" />
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
                onGoToCompare={() => {
                  setIsMobileBasketOpen(false);
                  setShopperTab('compare');
                }}
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
        onOpenChat={() => handleOpenChat()}
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
        onClose={() => {
          setIsMobileLocationModalOpen(false);
          setGpsFeedback(null);
        }}
        isDetecting={isDetectingGps}
        gpsFeedback={gpsFeedback}
        gpsDebugDetails={gpsDebugDetails}
        locations={locations}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        onAllowLocation={handleDetectGpsLocation}
      />

      {/* Redesigned Mobile Product Detail Modal matching Screen 3 */}
      {selectedMobileProduct && (
        <MobileProductDetailModal
          product={selectedMobileProduct}
          basket={basket}
          onClose={() => setSelectedMobileProduct(null)}
          onOpenCart={() => {
            setSelectedMobileProduct(null);
            setShopperTab('cart');
          }}
          onOpenChat={() => handleOpenChat()}
          onAdd={(p, u) => handleAddToBasket(p, u)}
          onQuantityChange={handleQuantityChange}
        />
      )}

      {/* Dedicated Floating Quick Chat Button for Mobile View */}
      {(appView === 'consumer' || appView === 'welcome') && !isChatModalOpen && (
        <div
          className={`md:hidden fixed right-3 z-30 transition-all duration-200 ${
            basket.length > 0 && !isMobileBasketOpen && shopperTab !== 'compare'
              ? 'bottom-28'
              : 'bottom-16'
          }`}
        >
          <button
            type="button"
            onClick={() => handleOpenChat()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#063B2A] hover:bg-[#0B8F68] text-white rounded-full shadow-lg border border-[#10A978]/40 active:scale-95 transition-all cursor-pointer font-malayalam"
            title="കടകളുമായി ചാറ്റ് ചെയ്യുക (Chat with Store)"
            aria-label="Chat with Store"
          >
            <div className="relative w-5 h-5 rounded-full bg-[#10A978] flex items-center justify-center text-[#063B2A] shrink-0 shadow-xs">
              <MessageCircle className="w-3 h-3 text-[#063B2A]" />
            </div>
            <span className="text-[11px] font-bold text-white tracking-tight">ചാറ്റ്</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default App;



