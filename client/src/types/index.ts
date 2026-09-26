export interface Location {
  id: string;
  name: string;
  subArea?: string;
  state: string;
  country: string;
  currency: string;
  currencySymbol: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

export interface Shop {
  id: string;
  name: string;
  locationId: string;
  address: string;
  distanceKm: number;
  lat?: number;
  lng?: number;
  rating: number;
  reviewCount: number;
  shopType: 'supermarket' | 'local_mart' | 'organic' | 'wholesale' | 'quick_commerce';
  openingHours: string;
  phone: string;
  isVerified: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  color: string;
  categories?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  image?: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  isOrganic?: boolean;
  isSeasonal?: boolean;
  badge?: string;
  nutritionalNote?: string;
  prices: Record<string, number>;
  stockStatus: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'>;
  lastUpdated: string;
}

export interface BasketItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedUnit: string;
}

export interface ShopComparisonItemBreakdown {
  productId: string;
  productName: string;
  emoji: string;
  image?: string;
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
  phone?: string;
  color: string;
  total: number;
  availableTotal?: number;
  itemCount: number;
  availableItemCount: number;
  outOfStockCount: number;
  isAllAvailable: boolean;
  missingProducts?: { productId: string; productName: string; emoji: string }[];
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

export interface PriceHistoryPoint {
  date: string;
  price: number;
  avgMarketPrice: number;
}

export interface PriceReport {
  id: string;
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  locationId: string;
  reportedPrice: number;
  unit: string;
  reportedBy: string;
  timestamp: string;
  proofUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  upvotes: number;
  downvotes: number;
}

export interface FlashDeal {
  id: string;
  shopId: string;
  shopName: string;
  productId: string;
  productName: string;
  emoji: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  unit: string;
  expiresInMinutes: number;
  tag: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'shopper' | 'consumer' | 'merchant' | 'admin';
  token?: string;
  shopId?: string;
  shopName?: string;
  phone?: string;
  locationId?: string;
  createdAt?: string;
}

export interface QuickMerchantOption {
  id: string;
  email: string;
  name: string;
  shopName: string;
  shopId: string;
}

export interface QuickConsumerOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
  locationId?: string;
  listCount: number;
  favoritesCount: number;
}

export interface ConsumerSavedListItem {
  productId: string;
  quantity: number;
  selectedUnit: string;
}

export interface ConsumerSavedList {
  id: string;
  name: string;
  createdAt: string;
  items: ConsumerSavedListItem[];
  totalItems: number;
}

export interface ConsumerTripHistory {
  id: string;
  date: string;
  shopName: string;
  shopId?: string;
  locationName?: string;
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
  itemsSummary: string;
}

export interface ConsumerData {
  userId: string;
  basket: ConsumerSavedListItem[];
  savedLists: ConsumerSavedList[];
  favorites: string[]; // product IDs
  tripHistory: ConsumerTripHistory[];
  preferredLocationId?: string;
  lastActive: string;
}

export interface BasketSnapshotItem {
  productId: string;
  productName: string;
  emoji: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  lineTotal?: number;
}

export interface BasketSnapshot {
  items: BasketSnapshotItem[];
  itemCount: number;
  totalQuantity: number;
  estimatedTotal: number;
  shopName: string;
  shopId?: string;
  locationName?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  consumerId: string;
  consumerName: string;
  shopId: string;
  shopName: string;
  basketSnapshot: BasketSnapshot;
  status: 'active' | 'closed';
  lastMessage?: string;
  lastMessageTime: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'consumer' | 'merchant' | 'admin';
  senderName: string;
  text: string;
  audioUrl?: string;
  audioDuration?: number;
  basketSnapshot?: BasketSnapshot;
  createdAt: string;
  isRead?: boolean;
  clientMsgId?: string;
  status?: 'sending' | 'sent' | 'failed';
}

export type PreBookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface PreBookingItem {
  productId: string;
  productName: string;
  emoji: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface PreBooking {
  id: string;
  consumerId: string;
  consumerName: string;
  consumerPhone?: string;
  consumerEmail?: string;
  shopId: string;
  shopName: string;
  items: PreBookingItem[];
  itemCount: number;
  totalQuantity: number;
  totalAmount: number;
  status: PreBookingStatus;
  pickupTime?: string;
  notes?: string;
  merchantNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopCatalogueItem {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  price: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isOrganic?: boolean;
  isSeasonal?: boolean;
  badge?: string;
  nutritionalNote?: string;
  lastUpdated: string;
}

export interface ShopCatalogueResponse {
  shop: Shop;
  products: ShopCatalogueItem[];
  totalCount: number;
  inStockCount: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  emoji: string;
  quantity: number;
  unit: string;
  originalUnitPrice: number;
  discountAmountPerUnit: number;
  finalUnitPrice: number;
  lineTotal: number;
}

export interface MerchantSale {
  id: string;
  merchantId: string;
  shopId: string;
  shopName: string;
  billNumber: string;
  items: SaleItem[];
  itemCount: number;
  totalQuantity: number;
  subtotalAmount: number;
  discountTotal: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'other';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface DailySalesSummary {
  date: string;
  totalBills: number;
  totalProductsSold: number;
  totalQuantitySold: number;
  totalDiscountsGiven: number;
  totalSalesAmount: number;
  sales: MerchantSale[];
}

export interface CreateSalePayload {
  shopId?: string;
  shopName?: string;
  items: {
    productId: string;
    productName: string;
    emoji: string;
    quantity: number;
    unit: string;
    originalUnitPrice: number;
    discountAmountPerUnit: number;
    finalUnitPrice: number;
    lineTotal: number;
  }[];
  itemCount?: number;
  totalQuantity?: number;
  subtotalAmount?: number;
  discountTotal?: number;
  totalAmount?: number;
  paymentMethod?: 'cash' | 'upi' | 'card' | 'credit' | 'other';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

// ==========================================
// SUBSCRIPTION & MONETIZATION TYPES
// ==========================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
  currency: string;
  description: string;
  features: string[];
  badge?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantSubscription {
  id: string;
  merchantId: string;
  shopId?: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startsAt: string;
  expiresAt: string;
  autoRenew: boolean;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  daysRemaining?: number;
  plan?: SubscriptionPlan;
  merchantName?: string;
  merchantEmail?: string;
  shopName?: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId?: string;
  merchantId: string;
  planId: string;
  amountPaise: number;
  currency: string;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  idempotencyKey: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  merchantName?: string;
  merchantEmail?: string;
  planName?: string;
}

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  isActive?: boolean;
  isExempt: boolean;
  subscription: MerchantSubscription | null;
  daysRemaining: number;
  plan?: Partial<SubscriptionPlan> | null;
  merchantName?: string;
  shopName?: string;
}

export interface SubscriptionCheckoutOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  plan?: Partial<SubscriptionPlan> | null;
  planId?: string;
  planName?: string;
  upiString: string;
  upiQrUrl: string;
}

export interface SubscriptionStats {
  activeCount: number;
  expiredCount: number;
  totalRevenuePaise: number;
  monthlyRecurringPaise: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}




