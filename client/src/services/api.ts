import {
  Category,
  FlashDeal,
  FullComparisonResponse,
  Location,
  PriceHistoryPoint,
  PriceReport,
  Product,
  Shop,
  ShopCatalogueResponse,
  BasketSnapshot,
  Conversation,
  ChatMessage,
  PreBooking,
  PreBookingItem,
  PreBookingStatus,
  SaleItem,
  MerchantSale,
  DailySalesSummary,
  CreateSalePayload,
  SubscriptionPlan,
  MerchantSubscription,
  SubscriptionPayment,
  SubscriptionStatusResponse,
  SubscriptionCheckoutOrder,
  SubscriptionStats,
  AuditLog,
} from '../types';
import { MALAPPURAM_LOCATIONS } from '../data/malappuramLocations';


const REMOTE_API_BASE = 'https://priceteller-api.delightfulwater-3f47513c.koreacentral.azurecontainerapps.io/api';
const isLocalNetwork =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost') ||
    /^192\.168\.\d+\.\d+$/.test(window.location.hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(window.location.hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(window.location.hostname));
const isVercel =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('.vercel.app') || window.location.hostname.includes('vercel'));
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV || isLocalNetwork || isVercel ? '/api' : REMOTE_API_BASE);


export function getAuthToken(): string | null {
  try {
    // 1. Check isolated session storage for the current browser tab
    const explicit = sessionStorage.getItem('priceteller_token');
    if (explicit) return explicit;
    const userStr = sessionStorage.getItem('priceteller_auth_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.token) return u.token;
    }

    // 2. Clean up legacy localStorage tokens to prevent persistent cross-tab/session leaks
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem('priceteller_token') || localStorage.getItem('priceteller_auth_user')) {
        localStorage.removeItem('priceteller_token');
        localStorage.removeItem('priceteller_auth_user');
      }
    }
  } catch {}
  return null;
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as any || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      console.warn(`[API] Request to ${url} returned status ${res.status}`);
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch (err) {
    console.warn(`[API] Network error requesting ${url}:`, err);
    return null;
  }
}

async function readJsonResponse(res: Response): Promise<any> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }
}

export async function fetchLocations(): Promise<Location[]> {
  const json = await safeFetchJson<{ success: boolean; data: Location[] }>(`${API_BASE}/locations`);
  if (json?.success && Array.isArray(json.data) && json.data.length > 0) return json.data;
  return MALAPPURAM_LOCATIONS;
}

export async function fetchCategories(): Promise<Category[]> {
  const json = await safeFetchJson<{ success: boolean; data: Category[] }>(`${API_BASE}/categories`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [
    { id: 'all', name: 'All Products', slug: 'all', icon: '✨', description: 'Explore full catalog across all grocery categories' },
    { id: 'vegetables', name: 'Vegetables', slug: 'vegetables', icon: '🥬', description: 'Daily fresh greens, roots & country vegetables' },
    { id: 'fruits', name: 'Fresh Fruits', slug: 'fruits', icon: '🍎', description: 'Farm-fresh, seasonal & exotic fruits' },
    { id: 'rice-grains', name: 'Rice & Grains', slug: 'rice-grains', icon: '🌾', description: 'Matta rice, biryani rice, flours, wheat & oats' },
    { id: 'pulses-legumes', name: 'Pulses & Legumes', slug: 'pulses-legumes', icon: '🫘', description: 'Dals, green gram, chana, toor dal & pulses' },
    { id: 'spices', name: 'Spices & Masala', slug: 'spices', icon: '🌶️', description: 'Chilli, turmeric, garam masala & whole spices' },
    { id: 'oils-sugar', name: 'Oil, Salt & Sugar', slug: 'oils-sugar', icon: '🫙', description: 'Coconut oil, cooking oils, ghee, salt & sugar' },
    { id: 'dairy', name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛', description: 'Fresh milk, curd, cheese, butter & eggs' },
    { id: 'sauces-condiments', name: 'Sauces & Pickles', slug: 'sauces-condiments', icon: '🥫', description: 'Ketchup, vinegar, pickles, papad & condiments' },
    { id: 'biscuits-snacks', name: 'Biscuits & Snacks', slug: 'biscuits-snacks', icon: '🍪', description: 'Biscuits, rusks, bread, chips, murukku & snacks' },
    { id: 'beverages', name: 'Tea, Coffee & Drinks', slug: 'beverages', icon: '☕', description: 'Tea powder, coffee, Horlicks, Boost & fruit drinks' },
    { id: 'utensils', name: 'Kitchen Utensils', slug: 'utensils', icon: '🍳', description: 'Cookware, pressure cookers, tawas & utensils' },
    { id: 'cleaning-household', name: 'Cleaning & Household', slug: 'cleaning-household', icon: '🧹', description: 'Detergents, soaps, dishwash & cleaners' },
    { id: 'storage-containers', name: 'Storage Containers', slug: 'storage-containers', icon: '🧴', description: 'Plastic & steel jars, bottles, lunchboxes & flasks' },
    { id: 'baby-family', name: 'Baby & Family', slug: 'baby-family', icon: '🍼', description: 'Baby food, diapers, wipes, tissues & napkins' },
    { id: 'personal-care', name: 'Personal Care', slug: 'personal-care', icon: '🧼', description: 'Shampoo, hair oil, toothpaste, soaps & grooming' },
    { id: 'meats', name: 'Fresh Meats', slug: 'meats', icon: '🍗', description: 'Fresh chicken, mutton, beef & poultry' },
    { id: 'fish', name: 'Fish & Seafood', slug: 'fish', icon: '🐟', description: 'Fresh sea fish, river fish & prawns' },
    { id: 'electronics', name: 'Electronics & Appliances', slug: 'electronics', icon: '🔌', description: 'Mixers, induction stoves, kettles & appliances' },
    { id: 'organic', name: 'Organic & Wellness', slug: 'organic', icon: '🌿', description: 'Certified organic, pesticide-free produce' },
  ];
}

export async function fetchShops(locationId?: string, includeUnverified?: boolean): Promise<Shop[]> {
  const params = new URLSearchParams();
  if (locationId) params.set('locationId', locationId);
  if (includeUnverified) params.set('includeUnverified', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  const json = await safeFetchJson<{ success: boolean; data: Shop[] }>(`${API_BASE}/shops${query}`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchAdminShops(token?: string): Promise<Shop[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  const json = await safeFetchJson<{ success: boolean; data: Shop[] }>(`${API_BASE}/admin/shops`, { headers });
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchMerchantShopApi(token?: string): Promise<Shop | null> {
  const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  const json = await safeFetchJson<{ success: boolean; data: Shop }>(`${API_BASE}/merchant/shop`, { headers });
  if (json?.success && json.data) return json.data;
  return null;
}

export async function fetchShopCatalogueApi(
  shopIdOrName: string,
  locationId?: string
): Promise<ShopCatalogueResponse | null> {
  const params = new URLSearchParams();
  if (locationId) params.set('locationId', locationId);
  const query = params.toString() ? `?${params.toString()}` : '';
  const encodedId = encodeURIComponent(shopIdOrName);
  const json = await safeFetchJson<{ success: boolean; data: ShopCatalogueResponse }>(
    `${API_BASE}/shops/${encodedId}/catalogue${query}`
  );
  if (json?.success && json.data) return json.data;
  return null;
}

export async function fetchProducts(params?: { category?: string; search?: string; locationId?: string; includeUnverified?: boolean; includeMaster?: boolean }): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.locationId) searchParams.set('locationId', params.locationId);
  if (params?.includeUnverified) searchParams.set('includeUnverified', 'true');
  if (params?.includeMaster) searchParams.set('includeMaster', 'true');

  const json = await safeFetchJson<{ success: boolean; data: Product[] }>(`${API_BASE}/products?${searchParams.toString()}`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function compareBasketApi(
  items: { productId: string; quantity: number; unit: string }[],
  locationId?: string,
  consumerLat?: number,
  consumerLng?: number
): Promise<FullComparisonResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, locationId, consumerLat, consumerLng }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to compare basket');
}

export async function uploadProductImageApi(imageBase64: string): Promise<string> {
  const res = await fetch(`${API_BASE}/upload-product-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  const json = await res.json();
  if (json.success && json.imageUrl) return json.imageUrl;
  throw new Error(json.error || 'Failed to upload image');
}

export async function fetchRemoteImageApi(url: string): Promise<{ dataUrl: string; contentType: string; sizeKB: number }> {
  const res = await fetch(`${API_BASE}/fetch-remote-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (json.success && json.dataUrl) return json;
  throw new Error(json.error || 'Failed to fetch image from URL');
}

export function getProxiedImageUrl(url: string): string {
  if (!url || url.startsWith('data:')) return url;
  if (url.startsWith('/api/proxy-image')) return `${API_BASE}${url.slice('/api'.length)}`;
  if (url.includes('/api/proxy-image')) return url;
  if (url.startsWith('/')) return url;
  return `${API_BASE}/proxy-image?url=${encodeURIComponent(url)}`;
}

export async function createProductApi(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to create product');
}

export async function fetchProductHistory(productId: string): Promise<PriceHistoryPoint[]> {
  const json = await safeFetchJson<{ success: boolean; data: PriceHistoryPoint[] }>(`${API_BASE}/products/${productId}/history`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchFlashDeals(locationId?: string): Promise<FlashDeal[]> {
  const query = locationId && locationId !== 'all' ? `?locationId=${encodeURIComponent(locationId)}` : '';
  const json = await safeFetchJson<{ success: boolean; data: FlashDeal[] }>(`${API_BASE}/deals${query}`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function submitPriceReport(data: {
  productId: string;
  productName: string;
  shopName: string;
  reportedPrice: number;
  unit: string;
  reportedBy?: string;
  locationId?: string;
}): Promise<PriceReport> {
  const res = await fetch(`${API_BASE}/prices/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to submit report');
}

export async function votePriceReport(reportId: string, type: 'up' | 'down'): Promise<PriceReport> {
  const res = await fetch(`${API_BASE}/prices/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, type }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to vote');
}

export async function updateMerchantPricesApi(
  shopName: string,
  updates: { productId: string; price: number; stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' }[]
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/merchant/prices`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ shopName, updates }),
  });
  const json = await res.json();
  return !!json.success;
}

export async function fetchAdminStats() {
  const json = await safeFetchJson<{ success: boolean; data: any }>(`${API_BASE}/stats`);
  if (json?.success) return json.data;
  return null;
}

export async function createShopApi(shopData: Partial<Shop> & { email?: string; password?: string }): Promise<Shop & { merchantAccount?: any }> {
  const res = await fetch(`${API_BASE}/admin/shops`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(shopData),
  });
  const json = await res.json();
  if (json.success) return { ...json.data, merchantAccount: json.merchantAccount };
  throw new Error(json.error || 'Failed to create shop');
}

export async function updateShopApi(id: string, updates: Partial<Shop>): Promise<Shop> {
  const res = await fetch(`${API_BASE}/admin/shops/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to update shop');
}

export async function updateMerchantShopApi(updates: Partial<Shop>): Promise<Shop> {
  const res = await fetch(`${API_BASE}/merchant/shop`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to update shop profile');
}

export async function deleteShopApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/shops/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  return !!json.success;
}

export async function updateProductApi(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (json.success && json.data) return json.data;
  throw new Error(json.error || 'Failed to update product');
}

export async function deleteProductApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  return !!json.success;
}

export async function createLocationApi(locData: Partial<Location>): Promise<Location> {
  const res = await fetch(`${API_BASE}/admin/locations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(locData),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to add location');
}

export async function moderatePriceReportApi(reportId: string, action: 'approve' | 'reject'): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/reports/${reportId}/moderate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action }),
  });
  const json = await res.json();
  return !!json.success;
}

export async function createFlashDealApi(dealData: Partial<FlashDeal>): Promise<FlashDeal> {
  const res = await fetch(`${API_BASE}/merchant/deals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dealData),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to create deal');
}

export async function delistMerchantProductApi(shopName: string, productId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/merchant/products/${productId}/delist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ shopName }),
  });
  const json = await res.json();
  return !!json.success;
}

export async function relistMerchantProductApi(shopName: string, productId: string, price?: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/merchant/products/${productId}/relist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ shopName, price }),
  });
  const json = await res.json();
  return !!json.success;
}

export async function loginUserApi(credentials: {
  email?: string;
  username?: string;
  password: string;
  expectedRole?: 'consumer' | 'merchant' | 'admin' | 'any';
}) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const json = await readJsonResponse(res);
  if (json.success) return json;
  throw new Error(json.error || 'Login failed');
}

export async function loginWithGoogleApi(payload: {
  credential: string;
  expectedRole?: 'consumer' | 'merchant' | 'any';
}) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.success) return json;
  throw new Error(json.error || 'Google authentication failed');
}

export async function loginAdminApi(credentials: {
  username?: string;
  email?: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const json = await res.json();
  if (json.success) return json;
  throw new Error(json.error || 'Admin login failed');
}

export async function registerMerchantApi(merchantData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  shopName: string;
  locationId?: string;
  address?: string;
  shopType?: string;
  categories?: string[];
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(merchantData),
  });
  const json = await res.json();
  if (json.success) return json;
  throw new Error(json.error || 'Registration failed');
}

export async function fetchCurrentUserApi(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (json.success) return json.user;
  throw new Error(json.error || 'Failed to fetch user');
}

export async function fetchQuickMerchantsApi() {
  const json = await safeFetchJson<{ success: boolean; data: any[] }>(`${API_BASE}/auth/quick-merchants`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchQuickConsumersApi() {
  const json = await safeFetchJson<{ success: boolean; data: any[] }>(`${API_BASE}/auth/quick-consumers`);
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function registerConsumerApi(consumerData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locationId?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/consumer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consumerData),
  });
  const json = await res.json();
  if (json.success) return json;
  throw new Error(json.error || 'Consumer registration failed');
}

export async function fetchConsumerDataApi(userId: string, token?: string) {
  const json = await safeFetchJson<{ success: boolean; data: any }>(
    `${API_BASE}/consumer/data?userId=${encodeURIComponent(userId)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (json?.success) return json.data;
  return null;
}

export async function syncConsumerBasketApi(
  userId: string,
  basket: { productId: string; quantity: number; selectedUnit: string }[],
  token?: string
) {
  try {
    const res = await fetch(`${API_BASE}/consumer/basket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId, basket }),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.warn('Failed to sync basket to cloud', e);
    return false;
  }
}

export async function saveConsumerListApi(
  userId: string,
  name: string,
  items: { productId: string; quantity: number; selectedUnit: string }[],
  token?: string
) {
  const res = await fetch(`${API_BASE}/consumer/saved-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, name, items }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to save list');
}

export async function deleteConsumerListApi(listId: string, userId: string, token?: string) {
  const res = await fetch(`${API_BASE}/consumer/saved-lists/${listId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  return !!json.success;
}

export async function toggleConsumerFavoriteApi(userId: string, productId: string, token?: string) {
  const res = await fetch(`${API_BASE}/consumer/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, productId }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to toggle favorite');
}

export async function recordConsumerTripApi(
  userId: string,
  tripData: {
    shopName: string;
    shopId?: string;
    locationName?: string;
    totalAmount: number;
    totalSavings: number;
    itemCount: number;
    itemsSummary: string;
  },
  token?: string
) {
  try {
    const res = await fetch(`${API_BASE}/consumer/trip-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId, ...tripData }),
    });
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.warn('Failed to record trip', e);
    return null;
  }
}

export async function fetchConversationsApi(token?: string): Promise<Conversation[]> {
  const json = await safeFetchJson<{ success: boolean; data: Conversation[] }>(
    `${API_BASE}/conversations`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchConversationMessagesApi(
  conversationId: string,
  token?: string
): Promise<{ conversation: Conversation; messages: ChatMessage[] } | null> {
  const json = await safeFetchJson<{ success: boolean; data: ChatMessage[]; conversation: Conversation }>(
    `${API_BASE}/conversations/${conversationId}/messages`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success) {
    return {
      conversation: json.conversation,
      messages: json.data || [],
    };
  }
  return null;
}

export async function createConversationApi(
  data: {
    shopId: string;
    shopName: string;
    basketSnapshot: BasketSnapshot;
    initialMessage?: string;
  },
  token?: string
): Promise<{ conversation: Conversation; initialMessage?: ChatMessage }> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) {
    return {
      conversation: json.data,
      initialMessage: json.initialMessage,
    };
  }
  throw new Error(json.error || 'Failed to create conversation');
}

export async function sendMessageApi(
  conversationId: string,
  text: string,
  token?: string,
  basketSnapshot?: BasketSnapshot,
  clientMsgId?: string
): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text, basketSnapshot, clientMsgId }),
  });
  const json = await res.json();
  if (json.success) {
    return json.data;
  }
  throw new Error(json.error || 'Failed to send message');
}

export async function markConversationReadApi(
  conversationId: string,
  token?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('Failed to mark conversation read:', err);
    return false;
  }
}

export async function updateConversationBasketApi(
  conversationId: string,
  basketSnapshot: BasketSnapshot,
  token?: string
): Promise<Conversation | null> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/basket`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ basketSnapshot }),
  });
  const json = await res.json();
  if (json.success) {
    return json.data;
  }
  return null;
}

// ----------------------------------------------------
// PRE-BOOKING APIS
// ----------------------------------------------------
export async function createPreBookingApi(
  data: {
    shopId: string;
    shopName: string;
    items: PreBookingItem[];
    itemCount: number;
    totalQuantity: number;
    totalAmount: number;
    pickupTime?: string;
    notes?: string;
    consumerPhone?: string;
    consumerEmail?: string;
  },
  token?: string
): Promise<PreBooking> {
  const res = await fetch(`${API_BASE}/pre-bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) {
    return json.data;
  }
  throw new Error(json.error || 'Failed to submit basket pre-booking');
}

export async function fetchPreBookingsApi(token?: string): Promise<PreBooking[]> {
  const json = await safeFetchJson<{ success: boolean; data: PreBooking[] }>(
    `${API_BASE}/pre-bookings`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchPreBookingByIdApi(
  bookingId: string,
  token?: string
): Promise<PreBooking | null> {
  const json = await safeFetchJson<{ success: boolean; data: PreBooking }>(
    `${API_BASE}/pre-bookings/${bookingId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && json.data) return json.data;
  return null;
}

export async function updatePreBookingStatusApi(
  bookingId: string,
  status: PreBookingStatus,
  merchantNote?: string,
  token?: string
): Promise<PreBooking> {
  const res = await fetch(`${API_BASE}/pre-bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status, merchantNote }),
  });
  const json = await res.json();
  if (json.success) {
    return json.data;
  }
  throw new Error(json.error || 'Failed to update pre-booking status');
}

// ==================== MERCHANT BILLING & SALES ====================

export async function createMerchantSaleApi(
  payload: CreateSalePayload,
  token?: string
): Promise<MerchantSale> {
  const res = await fetch(`${API_BASE}/merchant/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.success) {
    return json.data;
  }
  throw new Error(json.error || 'Failed to complete sale');
}

export async function fetchMerchantSalesApi(
  date?: string,
  token?: string
): Promise<MerchantSale[]> {
  const url = date
    ? `${API_BASE}/merchant/sales?date=${encodeURIComponent(date)}`
    : `${API_BASE}/merchant/sales`;
  const json = await safeFetchJson<{ success: boolean; data: MerchantSale[] }>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchMerchantSalesSummaryApi(
  date?: string,
  token?: string
): Promise<DailySalesSummary | null> {
  const url = date
    ? `${API_BASE}/merchant/sales/summary?date=${encodeURIComponent(date)}`
    : `${API_BASE}/merchant/sales/summary`;
  const json = await safeFetchJson<{ success: boolean; data: DailySalesSummary }>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (json?.success && json.data) return json.data;
  return null;
}

export async function fetchMerchantSaleByIdApi(
  id: string,
  token?: string
): Promise<MerchantSale | null> {
  const json = await safeFetchJson<{ success: boolean; data: MerchantSale }>(
    `${API_BASE}/merchant/sales/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && json.data) return json.data;
  return null;
}

export async function deleteMerchantSaleApi(
  id: string,
  token?: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/merchant/sales/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  if (json.success) {
    return true;
  }
  throw new Error(json.error || 'Failed to delete sale bill');
}

export async function fetchAdminProducts(token?: string): Promise<Product[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  const json = await safeFetchJson<{ success: boolean; data: Product[] }>(`${API_BASE}/admin/products`, { headers });
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchMerchantMasterCatalogApi(token?: string): Promise<Product[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : getAuthHeaders();
  const json = await safeFetchJson<{ success: boolean; data: Product[] }>(`${API_BASE}/merchant/master-catalog`, { headers });
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

// ==========================================
// SUBSCRIPTION & MONETIZATION APIS
// ==========================================

export async function fetchSubscriptionPlansApi(adminMode = false, token?: string): Promise<SubscriptionPlan[]> {
  const url = adminMode ? `${API_BASE}/subscription/admin/plans` : `${API_BASE}/subscription/plans`;
  const json = await safeFetchJson<{ success: boolean; data: SubscriptionPlan[] }>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function createSubscriptionPlanApi(planData: Partial<SubscriptionPlan>, token: string): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE}/subscription/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(planData),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to create plan');
}

export async function updateSubscriptionPlanApi(planId: string, planData: Partial<SubscriptionPlan>, token: string): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE}/subscription/plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(planData),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to update plan');
}

export async function fetchMerchantSubscriptionStatusApi(token?: string): Promise<SubscriptionStatusResponse> {
  try {
    const res = await fetch(`${API_BASE}/subscription/merchant/status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      const hasActive = Boolean(
        data.hasActiveSubscription ??
        data.isActive ??
        (data.subscription && (data.subscription.status === 'ACTIVE' || data.daysRemaining > 0))
      );
      return {
        hasActiveSubscription: hasActive,
        isActive: hasActive,
        isExempt: Boolean(data.isExempt),
        subscription: data.subscription || null,
        daysRemaining: Number(data.daysRemaining || 0),
        plan: data.plan || data.subscription?.plan || null,
        merchantName: data.merchantName,
        shopName: data.shopName,
      };
    }
  } catch (err) {
    console.error('Failed to fetch merchant subscription status:', err);
  }
  return {
    hasActiveSubscription: false,
    isActive: false,
    isExempt: false,
    subscription: null,
    daysRemaining: 0,
  };
}

export async function fetchMerchantSubscriptionHistoryApi(token?: string): Promise<MerchantSubscription[]> {
  const json = await safeFetchJson<{ success: boolean; data: MerchantSubscription[] }>(
    `${API_BASE}/subscription/merchant/history`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function createSubscriptionCheckoutApi(
  planId: string,
  token?: string,
  idempotencyKey?: string
): Promise<SubscriptionCheckoutOrder> {
  const res = await fetch(`${API_BASE}/subscription/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ planId, idempotencyKey }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to initialize subscription checkout');
}

export async function verifySubscriptionPaymentApi(
  params: {
    orderId: string;
    paymentId?: string;
    signature?: string;
    upiRefId?: string;
  },
  token?: string
): Promise<{ success: boolean; subscription: MerchantSubscription; daysRemaining?: number }> {
  const res = await fetch(`${API_BASE}/subscription/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (json.success) {
    const data = json.data || {};
    if (data.subscription) {
      return {
        success: true,
        subscription: data.subscription,
        daysRemaining: data.daysRemaining ?? data.subscription.daysRemaining,
      };
    }
    if (data.activated && data.subscription) {
      return {
        success: true,
        subscription: data.subscription,
        daysRemaining: data.daysRemaining,
      };
    }
    return {
      success: true,
      subscription: data as MerchantSubscription,
      daysRemaining: (data as any).daysRemaining,
    };
  }
  throw new Error(json.error || 'Payment verification failed');
}

export async function fetchAdminSubscriptionsApi(token: string): Promise<MerchantSubscription[]> {
  const json = await safeFetchJson<{ success: boolean; data: MerchantSubscription[] }>(
    `${API_BASE}/subscription/admin/subscriptions`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function extendAdminSubscriptionApi(
  subscriptionId: string,
  extraDays: number,
  reason?: string,
  token?: string
): Promise<MerchantSubscription> {
  const res = await fetch(`${API_BASE}/subscription/admin/subscriptions/${subscriptionId}/extend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ extraDays, reason }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw new Error(json.error || 'Failed to extend subscription');
}

export async function cancelAdminSubscriptionApi(
  subscriptionId: string,
  reason?: string,
  token?: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/subscription/admin/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  return !!json.success;
}

export async function fetchAdminSubscriptionPaymentsApi(token: string): Promise<SubscriptionPayment[]> {
  const json = await safeFetchJson<{ success: boolean; data: SubscriptionPayment[] }>(
    `${API_BASE}/subscription/admin/payments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchAdminSubscriptionStatsApi(token: string): Promise<SubscriptionStats> {
  const json = await safeFetchJson<{ success: boolean; data: SubscriptionStats }>(
    `${API_BASE}/subscription/admin/stats`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (json?.success && json.data) return json.data;
  return {
    activeCount: 0,
    expiredCount: 0,
    totalRevenuePaise: 0,
    monthlyRecurringPaise: 0,
  };
}

export async function fetchAdminAuditLogsApi(limit = 100, token?: string): Promise<AuditLog[]> {
  const json = await safeFetchJson<{ success: boolean; data: AuditLog[] }>(
    `${API_BASE}/subscription/admin/audit-logs?limit=${limit}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (json?.success && Array.isArray(json.data)) return json.data;
  return [];
}






export async function logoutUserApi(token?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : getAuthHeaders(),
    });
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}
