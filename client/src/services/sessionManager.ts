import { BasketItem, Product } from '../types';

const SESSION_BASKET_KEY = 'priceteller_session_basket_v1';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours auto-expiry

interface StoredSessionData {
  sessionId: string;
  updatedAt: number;
  items: BasketItem[];
}

/**
 * Generate a unique session ID for the current browsing session
 */
export function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem('priceteller_session_id');
    if (!sid) {
      sid = `shopper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('priceteller_session_id', sid);
    }
    return sid;
  } catch {
    return `shopper_${Date.now()}`;
  }
}

/**
 * Loads the active basket for the CURRENT tab/session only.
 * Will NOT leak previous users' or other customers' items from localStorage.
 */
export function loadActiveBasket(): BasketItem[] {
  try {
    // 1. First cleanup any legacy shared localStorage baskets from past versions
    if (localStorage.getItem('priceteller_basket')) {
      localStorage.removeItem('priceteller_basket');
    }

    const raw = sessionStorage.getItem(SESSION_BASKET_KEY);
    if (!raw) return [];

    const data: StoredSessionData = JSON.parse(raw);
    const now = Date.now();

    // Check if session basket has expired
    if (!data.updatedAt || now - data.updatedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_BASKET_KEY);
      return [];
    }

    return Array.isArray(data.items) ? data.items : [];
  } catch (e) {
    console.warn('Could not read session basket, starting fresh', e);
    return [];
  }
}

/**
 * Persists basket items safely to the isolated sessionStorage
 */
export function persistActiveBasket(items: BasketItem[]): void {
  try {
    const sid = getOrCreateSessionId();
    const payload: StoredSessionData = {
      sessionId: sid,
      updatedAt: Date.now(),
      items: items.slice(0, 50), // prevent runaway payload sizes
    };
    sessionStorage.setItem(SESSION_BASKET_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not persist session basket', e);
  }
}

/**
 * Clears the active shopping trip and starts completely fresh
 */
export function clearActiveBasket(): void {
  try {
    sessionStorage.removeItem(SESSION_BASKET_KEY);
    localStorage.removeItem('priceteller_basket');
    // Generate new fresh session ID
    const newSid = `shopper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('priceteller_session_id', newSid);
  } catch (e) {
    console.warn('Error clearing session basket', e);
  }
}

/**
 * Re-hydrates basket items with the latest product catalog from server
 * to prevent stale price or deleted product loopholes.
 */
export function rehydrateBasket(currentBasket: BasketItem[], liveProducts: Product[]): BasketItem[] {
  if (!currentBasket.length || !liveProducts.length) return currentBasket;

  const productMap = new Map<string, Product>();
  liveProducts.forEach((p) => productMap.set(p.id, p));

  const validItems: BasketItem[] = [];

  for (const item of currentBasket) {
    const liveProd = productMap.get(item.productId);
    if (liveProd) {
      const priceValues = Object.values(liveProd.prices || {});
      const stockStatuses = Object.values(liveProd.stockStatus || {});
      const isOutOfStock =
        priceValues.length === 0 ||
        (stockStatuses.length > 0 && stockStatuses.every((s) => s === 'out_of_stock'));

      // If out of stock across all stores, automatically exclude from basket
      if (isOutOfStock) continue;

      // Ensure unit is valid for this product
      const unit = liveProd.availableUnits.includes(item.selectedUnit)
        ? item.selectedUnit
        : liveProd.defaultUnit;

      validItems.push({
        ...item,
        product: liveProd,
        selectedUnit: unit,
        quantity: Math.max(1, Math.min(99, Math.floor(item.quantity || 1))),
      });
    }
  }

  return validItems;
}
