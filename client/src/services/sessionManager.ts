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
 * Loads the active basket for the current user.
 * Reads from sessionStorage or persistent localStorage.
 */
export function loadActiveBasket(): BasketItem[] {
  try {
    const raw =
      (typeof window !== 'undefined' && window.sessionStorage?.getItem(SESSION_BASKET_KEY)) ||
      (typeof window !== 'undefined' && window.localStorage?.getItem(SESSION_BASKET_KEY));
    if (!raw) return [];

    const data: StoredSessionData = JSON.parse(raw);
    const now = Date.now();

    // Check if basket session has expired
    if (!data.updatedAt || now - data.updatedAt > SESSION_TTL_MS) {
      try {
        sessionStorage.removeItem(SESSION_BASKET_KEY);
        localStorage.removeItem(SESSION_BASKET_KEY);
      } catch {}
      return [];
    }

    return Array.isArray(data.items) ? data.items : [];
  } catch (e) {
    console.warn('Could not read session basket, starting fresh', e);
    return [];
  }
}

/**
 * Persists basket items safely to both sessionStorage and localStorage
 */
export function persistActiveBasket(items: BasketItem[]): void {
  try {
    const sid = getOrCreateSessionId();
    const payload: StoredSessionData = {
      sessionId: sid,
      updatedAt: Date.now(),
      items: items.slice(0, 50), // prevent runaway payload sizes
    };
    const json = JSON.stringify(payload);
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) sessionStorage.setItem(SESSION_BASKET_KEY, json);
      if (window.localStorage) localStorage.setItem(SESSION_BASKET_KEY, json);
    }
  } catch (e) {
    console.warn('Could not persist session basket', e);
  }
}

/**
 * Clears the active shopping trip and starts completely fresh
 */
export function clearActiveBasket(): void {
  try {
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) {
        sessionStorage.removeItem(SESSION_BASKET_KEY);
        // Generate new fresh session ID
        const newSid = `shopper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('priceteller_session_id', newSid);
      }
      if (window.localStorage) {
        localStorage.removeItem(SESSION_BASKET_KEY);
        localStorage.removeItem('priceteller_basket');
      }
    }
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
