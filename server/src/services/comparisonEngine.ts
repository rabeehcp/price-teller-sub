import { db, Product, Shop, Location } from '../db';
import { calculateHyperlocalDistance } from './locationService';

export interface BasketRequestItem {
  productId: string;
  quantity: number;
  unit: string;
}

export interface ShopComparisonItemBreakdown {
  productId: string;
  productName: string;
  emoji: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isLowestForThisItem: boolean;
}

export interface ShopComparisonResult {
  shopId: string;
  shopName: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  shopType: string;
  color: string;
  total: number;
  availableTotal: number;
  itemCount: number;
  availableItemCount: number;
  outOfStockCount: number;
  isAllAvailable: boolean;
  missingProducts: { productId: string; productName: string; emoji: string }[];
  deliveryFee: number;
  isFreeDelivery: boolean;
  savingsVsHighest: number;
  differenceVsBest: number;
  isBestOverall: boolean;
  items: ShopComparisonItemBreakdown[];
}

export interface SplitStoreGroup {
  shopName: string;
  distanceKm: number;
  color: string;
  items: {
    productId: string;
    productName: string;
    emoji: string;
    quantity: number;
    unit: string;
    lineTotal: number;
  }[];
  subtotal: number;
}

export interface SplitBasketOptimization {
  isWorthSplitting: boolean;
  combinedTotal: number;
  singleBestTotal: number;
  additionalSavings: number;
  savingsPercentage: number;
  stores: SplitStoreGroup[];
  tipMessage: string;
}

export interface FullComparisonResponse {
  itemCount: number;
  totalQuantity: number;
  bestShopName: string;
  bestTotal: number;
  averageMarketTotal: number;
  maxSavings: number;
  shops: ShopComparisonResult[];
  splitOptimization: SplitBasketOptimization;
  itemizedMatrix: {
    productId: string;
    productName: string;
    emoji: string;
    unit: string;
    quantity: number;
    pricesByShop: Record<string, { unitPrice: number; lineTotal: number; isLowest: boolean; stockStatus: string }>;
  }[];
}

export async function compareBasket(
  items: BasketRequestItem[],
  locationId?: string,
  consumerLat?: number,
  consumerLng?: number
): Promise<FullComparisonResponse> {
  if (!items || items.length === 0) {
    return {
      itemCount: 0,
      totalQuantity: 0,
      bestShopName: '',
      bestTotal: 0,
      averageMarketTotal: 0,
      maxSavings: 0,
      shops: [],
      splitOptimization: {
        isWorthSplitting: false,
        combinedTotal: 0,
        singleBestTotal: 0,
        additionalSavings: 0,
        savingsPercentage: 0,
        stores: [],
        tipMessage: 'Add products to compare prices.',
      },
      itemizedMatrix: [],
    };
  }

  const [shops, products, locations] = await Promise.all([
    db.getShops(locationId),
    db.getProducts({ locationId }),
    db.getLocations(),
  ]);
  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  const consumerLoc: Location | { lat: number; lng: number; name?: string } | null =
    consumerLat !== undefined && consumerLng !== undefined
      ? { lat: consumerLat, lng: consumerLng, name: 'Current Location' }
      : locations.find((l) => l.id === locationId) || locations[0] || null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (shops.length === 0) {
    return {
      itemCount: items.length,
      totalQuantity,
      bestShopName: '',
      bestTotal: 0,
      averageMarketTotal: 0,
      maxSavings: 0,
      shops: [],
      splitOptimization: {
        isWorthSplitting: false,
        combinedTotal: 0,
        singleBestTotal: 0,
        additionalSavings: 0,
        savingsPercentage: 0,
        stores: [],
        tipMessage: 'ഈ പ്രദേശത്ത് കടകൾ രജിസ്റ്റർ ചെയ്തിട്ടില്ല.',
      },
      itemizedMatrix: [],
    };
  }

  // Compute itemized lowest prices across in-stock stores for reference
  const itemLowestPrice = new Map<string, number>();
  items.forEach((item) => {
    const prod = productMap.get(item.productId);
    if (prod) {
      const multiplier = prod.unitMultiplier[item.unit] ?? 1;
      let minUnitPrice = Infinity;
      shops.forEach((shop) => {
        const stockStatus = prod.stockStatus?.[shop.name] || 'in_stock';
        if (stockStatus === 'out_of_stock') return; // Only count in-stock stores as lowest benchmark
        const p = prod.prices[shop.name];
        if (p !== undefined && p > 0) {
          const effectiveUnitPrice = Math.round(p * multiplier);
          if (effectiveUnitPrice < minUnitPrice) {
            minUnitPrice = effectiveUnitPrice;
          }
        }
      });
      itemLowestPrice.set(item.productId, minUnitPrice === Infinity ? 0 : minUnitPrice);
    }
  });

  // Calculate per-shop totals, availability, and item breakdowns
  const shopResults: ShopComparisonResult[] = shops.map((shop) => {
    let total = 0;
    let availableTotal = 0;
    let availableCount = 0;
    let outOfStockCount = 0;
    const missingProducts: { productId: string; productName: string; emoji: string }[] = [];

    const breakdownItems: ShopComparisonItemBreakdown[] = items
      .map((item) => {
        const prod = productMap.get(item.productId);
        if (!prod) return null;

        const basePrice = prod.prices[shop.name] || 0;
        const multiplier = prod.unitMultiplier[item.unit] ?? 1;
        const unitPrice = Math.round(basePrice * multiplier);
        const lineTotal = unitPrice * item.quantity;
        const stockStatus =
          prod.prices[shop.name] === undefined || prod.prices[shop.name] <= 0
            ? 'out_of_stock'
            : prod.stockStatus?.[shop.name] || 'in_stock';

        if (stockStatus !== 'out_of_stock' && basePrice > 0) {
          availableCount++;
          availableTotal += lineTotal;
        } else {
          outOfStockCount++;
          missingProducts.push({
            productId: prod.id,
            productName: prod.name,
            emoji: prod.emoji,
          });
        }

        total += lineTotal;

        const isLowest = stockStatus !== 'out_of_stock' && unitPrice <= (itemLowestPrice.get(item.productId) || 0);

        return {
          productId: prod.id,
          productName: prod.name,
          emoji: prod.emoji,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
          stockStatus,
          isLowestForThisItem: isLowest,
        };
      })
      .filter((x): x is ShopComparisonItemBreakdown => x !== null);

    const isFreeDelivery = total >= shop.freeDeliveryThreshold;
    const deliveryFee = isFreeDelivery ? 0 : shop.deliveryFee;
    const { distanceKm } = calculateHyperlocalDistance(consumerLoc, shop, locations);

    return {
      shopId: shop.id,
      shopName: shop.name,
      address: shop.address,
      distanceKm,
      rating: shop.rating,
      reviewCount: shop.reviewCount,
      shopType: shop.shopType,
      color: shop.color,
      total,
      availableTotal,
      itemCount: items.length,
      availableItemCount: availableCount,
      outOfStockCount,
      isAllAvailable: outOfStockCount === 0,
      missingProducts,
      deliveryFee,
      isFreeDelivery,
      savingsVsHighest: 0,
      differenceVsBest: 0,
      isBestOverall: false,
      items: breakdownItems,
    };
  });

  // Sort by complete availability first, then by total cost ascending
  shopResults.sort((a, b) => {
    if (a.isAllAvailable && !b.isAllAvailable) return -1;
    if (!a.isAllAvailable && b.isAllAvailable) return 1;
    return a.total - b.total;
  });

  const bestShop = shopResults[0] || {
    shopId: 'none',
    shopName: 'No Store',
    total: 0,
  };
  const highestTotal = Math.max(...shopResults.map((s) => s.total), 0);
  const avgTotal = Math.round(
    shopResults.reduce((sum, s) => sum + s.total, 0) / (shopResults.length || 1)
  );

  shopResults.forEach((s, idx) => {
    s.isBestOverall = idx === 0 && s.isAllAvailable;
    s.differenceVsBest = s.total - bestShop.total;
    s.savingsVsHighest = highestTotal - s.total;
  });

  // Split-Basket Heuristic Solver:
  // Find the cheapest in-stock store for each product
  const splitStoreMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      emoji: string;
      quantity: number;
      unit: string;
      lineTotal: number;
      distanceKm: number;
      color: string;
    }[]
  >();

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod) continue;

    let bestShopForThisItem: Shop | null = null;
    let bestLineTotal = Infinity;

    const multiplier = prod.unitMultiplier[item.unit] ?? 1;

    for (const shop of shops) {
      const stock = prod.stockStatus?.[shop.name] || 'in_stock';
      if (stock === 'out_of_stock' || prod.prices[shop.name] === undefined || prod.prices[shop.name] <= 0) continue;
      const price = prod.prices[shop.name] || 0;
      const lineCost = Math.round(price * multiplier) * item.quantity;
      if (lineCost < bestLineTotal) {
        bestLineTotal = lineCost;
        bestShopForThisItem = shop;
      }
    }

    if (bestShopForThisItem) {
      const currentShop: Shop = bestShopForThisItem;
      if (!splitStoreMap.has(currentShop.name)) {
        splitStoreMap.set(currentShop.name, []);
      }

      splitStoreMap.get(currentShop.name)!.push({
        productId: prod.id,
        productName: prod.name,
        emoji: prod.emoji,
        quantity: item.quantity,
        unit: item.unit,
        lineTotal: bestLineTotal,
        distanceKm: currentShop.distanceKm,
        color: currentShop.color,
      });
    }
  }

  const splitStores: SplitStoreGroup[] = Array.from(splitStoreMap.entries()).map(([shopName, itemsList]) => {
    const shop = shops.find((s) => s.name === shopName);
    const subtotal = itemsList.reduce((sum, i) => sum + i.lineTotal, 0);
    const distKm = shop ? calculateHyperlocalDistance(consumerLoc, shop, locations).distanceKm : 1;
    return {
      shopName,
      distanceKm: distKm,
      color: shop?.color || '#249044',
      items: itemsList,
      subtotal,
    };
  });

  const combinedSplitTotal = splitStores.reduce((sum, s) => sum + s.subtotal, 0);
  const additionalSavings = bestShop.total - combinedSplitTotal;
  const isWorthSplitting = splitStores.length > 1 && additionalSavings >= 10;
  const savingsPct = bestShop.total > 0 ? Math.round((additionalSavings / bestShop.total) * 100) : 0;

  const splitOptimization: SplitBasketOptimization = {
    isWorthSplitting,
    combinedTotal: combinedSplitTotal,
    singleBestTotal: bestShop.total,
    additionalSavings,
    savingsPercentage: savingsPct,
    stores: splitStores,
    tipMessage: isWorthSplitting
      ? `Splitting your basket between ${splitStores.map((s) => s.shopName).join(' & ')} saves an extra ₹${additionalSavings} (${savingsPct}%) over the single best store!`
      : `Single-store shopping at ${bestShop.shopName} gives the optimal balance of price and convenience.`,
  };

  // Itemized comparison matrix
  const itemizedMatrix = items.map((item) => {
    const prod = productMap.get(item.productId);
    const pricesByShop: Record<string, { unitPrice: number; lineTotal: number; isLowest: boolean; stockStatus: string }> = {};

    if (prod) {
      const multiplier = prod.unitMultiplier[item.unit] ?? 1;
      shops.forEach((shop) => {
        const base = prod.prices[shop.name] || 0;
        const unitPrice = Math.round(base * multiplier);
        const lineTotal = unitPrice * item.quantity;
        const isLowest = unitPrice <= (itemLowestPrice.get(item.productId) || 0);
        const stock = prod.stockStatus[shop.name] || 'in_stock';
        pricesByShop[shop.name] = { unitPrice, lineTotal, isLowest, stockStatus: stock };
      });
    }

    return {
      productId: item.productId,
      productName: prod?.name || item.productId,
      emoji: prod?.emoji || '📦',
      unit: item.unit,
      quantity: item.quantity,
      pricesByShop,
    };
  });

  return {
    itemCount: items.length,
    totalQuantity,
    bestShopName: bestShop.shopName,
    bestTotal: bestShop.total,
    averageMarketTotal: avgTotal,
    maxSavings: highestTotal - bestShop.total,
    shops: shopResults,
    splitOptimization,
    itemizedMatrix,
  };
}
