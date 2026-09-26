import bcrypt from 'bcryptjs';
import { query } from './db/pool';

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  if (BCRYPT_HASH_PATTERN.test(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }
  return storedPassword === password;
}

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
  userVoted?: string;
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
  role: 'admin' | 'merchant' | 'consumer';
  password: string;
  shopId?: string;
  shopName?: string;
  phone?: string;
  locationId?: string;
  createdAt?: string;
  token?: string;
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
  favorites: string[];
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
  plan?: SubscriptionPlan;
  merchantName?: string;
  merchantEmail?: string;
  shopName?: string;
  daysRemaining?: number;
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
  planName?: string;
  merchantName?: string;
  merchantEmail?: string;
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

class Database {
  constructor() {}

  public async getLocations(): Promise<Location[]> {

      const res = await query(
        `SELECT id, name, sub_area AS "subArea", state, country, currency, currency_symbol AS "currencySymbol", lat, lng, radius_km::float AS "radiusKm" 
         FROM locations 
         ORDER BY name ASC`
      );
      return res.rows;
  }

  public async addLocation(loc: Location): Promise<Location> {

      await query(
        `INSERT INTO locations (id, name, sub_area, state, country, currency, currency_symbol, lat, lng, radius_km)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           sub_area = EXCLUDED.sub_area,
           state = EXCLUDED.state,
           country = EXCLUDED.country,
           currency = EXCLUDED.currency,
           currency_symbol = EXCLUDED.currency_symbol,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           radius_km = EXCLUDED.radius_km`,
        [loc.id, loc.name, loc.subArea || null, loc.state, loc.country, loc.currency, loc.currencySymbol, loc.lat, loc.lng, loc.radiusKm || 15.0]
      );
      return loc;
  }

  public async getShops(locationId?: string, includeUnverified: boolean = false): Promise<Shop[]> {

      let sql = `SELECT id, name, location_id AS "locationId", address, 
                        distance_km::float AS "distanceKm", lat::float AS lat, lng::float AS lng, 
                        rating::float AS rating, review_count AS "reviewCount", shop_type AS "shopType", 
                        opening_hours AS "openingHours", phone, is_verified AS "isVerified", 
                        delivery_fee::float AS "deliveryFee", free_delivery_threshold::float AS "freeDeliveryThreshold", 
                        color, categories 
                 FROM shops 
                 WHERE 1=1`;
      const params: any[] = [];

      if (!includeUnverified) {
        sql += ` AND is_verified = true`;
      }

      if (locationId && locationId !== 'all') {
        params.push(locationId);
        sql += ` AND location_id = $${params.length}`;
      }

      sql += ` ORDER BY rating DESC, name ASC`;
      const res = await query(sql, params);
      return res.rows;
  }

  public async getAllShopsAdmin(): Promise<Shop[]> {

      const res = await query(
        `SELECT id, name, location_id AS "locationId", address, 
                distance_km::float AS "distanceKm", lat::float AS lat, lng::float AS lng, 
                rating::float AS rating, review_count AS "reviewCount", shop_type AS "shopType", 
                opening_hours AS "openingHours", phone, is_verified AS "isVerified", 
                delivery_fee::float AS "deliveryFee", free_delivery_threshold::float AS "freeDeliveryThreshold", 
                color, categories 
         FROM shops 
         ORDER BY name ASC`
      );
      return res.rows;
  }

  public async addShop(shop: Omit<Shop, 'id'>): Promise<Shop> {
const id = shop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `shop-${Date.now()}`;
const newShop: Shop = {
      ...shop,
      id,
    };


      await query(
        `INSERT INTO shops (id, name, location_id, address, distance_km, rating, review_count, shop_type, opening_hours, phone, is_verified, delivery_fee, free_delivery_threshold, color, categories, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          newShop.id,
          newShop.name,
          newShop.locationId,
          newShop.address,
          newShop.distanceKm,
          newShop.rating,
          newShop.reviewCount,
          newShop.shopType,
          newShop.openingHours,
          newShop.phone,
          newShop.isVerified,
          newShop.deliveryFee,
          newShop.freeDeliveryThreshold,
          newShop.color,
          JSON.stringify(newShop.categories || []),
          newShop.lat || null,
          newShop.lng || null,
        ]
      );
      return newShop;
  }

  public async updateShop(id: string, updates: Partial<Shop>): Promise<Shop | null> {

      const currentRes = await query(`SELECT * FROM shops WHERE id = $1`, [id]);
      if (currentRes.rows.length === 0) return null;
      const current = currentRes.rows[0];
      const oldName = current.name;

      const name = updates.name !== undefined ? updates.name : current.name;
      const locationId = updates.locationId !== undefined ? updates.locationId : current.location_id;
      const address = updates.address !== undefined ? updates.address : current.address;
      const distanceKm = updates.distanceKm !== undefined ? updates.distanceKm : current.distance_km;
      const rating = updates.rating !== undefined ? updates.rating : current.rating;
      const reviewCount = updates.reviewCount !== undefined ? updates.reviewCount : current.review_count;
      const shopType = updates.shopType !== undefined ? updates.shopType : current.shop_type;
      const openingHours = updates.openingHours !== undefined ? updates.openingHours : current.opening_hours;
      const phone = updates.phone !== undefined ? updates.phone : current.phone;
      const isVerified = updates.isVerified !== undefined ? updates.isVerified : current.is_verified;
      const deliveryFee = updates.deliveryFee !== undefined ? updates.deliveryFee : current.delivery_fee;
      const freeDeliveryThreshold = updates.freeDeliveryThreshold !== undefined ? updates.freeDeliveryThreshold : current.free_delivery_threshold;
      const color = updates.color !== undefined ? updates.color : current.color;
      const categories = updates.categories !== undefined ? JSON.stringify(updates.categories) : JSON.stringify(current.categories || []);
      const lat = updates.lat !== undefined ? updates.lat : current.lat;
      const lng = updates.lng !== undefined ? updates.lng : current.lng;

      const updatedRes = await query(
        `UPDATE shops 
         SET name = $1, location_id = $2, address = $3, distance_km = $4, rating = $5, 
             review_count = $6, shop_type = $7, opening_hours = $8, phone = $9, 
             is_verified = $10, delivery_fee = $11, free_delivery_threshold = $12, 
             color = $13, categories = $14, lat = $15, lng = $16
         WHERE id = $17
         RETURNING id, name, location_id AS "locationId", address, distance_km::float AS "distanceKm", 
                   rating::float AS rating, review_count AS "reviewCount", shop_type AS "shopType", 
                   opening_hours AS "openingHours", phone, is_verified AS "isVerified", 
                   delivery_fee::float AS "deliveryFee", free_delivery_threshold::float AS "freeDeliveryThreshold", 
                   color, categories, lat::float AS lat, lng::float AS lng`,
        [name, locationId, address, distanceKm, rating, reviewCount, shopType, openingHours, phone, isVerified, deliveryFee, freeDeliveryThreshold, color, categories, lat, lng, id]
      );

      if (updates.name && updates.name !== oldName) {
        const prods = await query(`SELECT id, prices, stock_status FROM products`);
        for (const p of prods.rows) {
          const prices = p.prices || {};
          const stockStatus = p.stock_status || {};
          if (prices[oldName] !== undefined) {
            prices[updates.name] = prices[oldName];
            delete prices[oldName];
          }
          if (stockStatus[oldName] !== undefined) {
            stockStatus[updates.name] = stockStatus[oldName];
            delete stockStatus[oldName];
          }
          await query(
            `UPDATE products SET prices = $1, stock_status = $2 WHERE id = $3`,
            [JSON.stringify(prices), JSON.stringify(stockStatus), p.id]
          );
        }
      }

      return updatedRes.rows[0] || null;
  }

  public async deleteShop(id: string): Promise<boolean> {

      const cur = await query(`SELECT name FROM shops WHERE id = $1`, [id]);
      const shopName = cur.rows[0]?.name;

      const res = await query(`DELETE FROM shops WHERE id = $1`, [id]);
      const deleted = (res.rowCount ?? 0) > 0;

      if (deleted && shopName) {
        const prods = await query(`SELECT id, prices, stock_status FROM products`);
        for (const p of prods.rows) {
          const prices = p.prices || {};
          const stockStatus = p.stock_status || {};
          let changed = false;
          if (prices[shopName] !== undefined) {
            delete prices[shopName];
            changed = true;
          }
          if (stockStatus[shopName] !== undefined) {
            delete stockStatus[shopName];
            changed = true;
          }
          if (changed) {
            await query(
              `UPDATE products SET prices = $1, stock_status = $2 WHERE id = $3`,
              [JSON.stringify(prices), JSON.stringify(stockStatus), p.id]
            );
          }
        }
      }

      return deleted;
  }

  public async getShopCatalogue(
    shopIdOrName: string,
    locationId?: string
  ): Promise<{
    shop: Shop;
    products: {
      id: string;
      name: string;
      categoryId: string;
      emoji: string;
      image?: string;
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
    }[];
    totalCount: number;
    inStockCount: number;
  } | null> {
    const allShops = await this.getAllShopsAdmin();
    const cleanQuery = shopIdOrName.trim().toLowerCase();
    const shop = allShops.find(
      (s) => s.id.toLowerCase() === cleanQuery || s.name.toLowerCase() === cleanQuery
    );
    if (!shop) return null;

    const allProducts = await this.getProducts({
      locationId: locationId || shop.locationId,
      includeUnverifiedShops: true,
    });

    const catalogueProducts = allProducts
      .filter((p) => p.prices[shop.name] !== undefined || p.stockStatus[shop.name] !== undefined)
      .map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        emoji: p.emoji,
        image: p.image,
        defaultUnit: p.defaultUnit,
        availableUnits: p.availableUnits || [p.defaultUnit],
        unitMultiplier: p.unitMultiplier || { [p.defaultUnit]: 1 },
        price: p.prices[shop.name] !== undefined ? p.prices[shop.name] : Math.round(Object.values(p.prices)[0] || 50),
        stockStatus: p.stockStatus[shop.name] || 'in_stock',
        isOrganic: p.isOrganic,
        isSeasonal: p.isSeasonal,
        badge: p.badge,
        nutritionalNote: p.nutritionalNote,
        lastUpdated: p.lastUpdated,
      }));

    return {
      shop,
      products: catalogueProducts,
      totalCount: catalogueProducts.length,
      inStockCount: catalogueProducts.filter((p) => p.stockStatus !== 'out_of_stock').length,
    };
  }

  public async getCategories(): Promise<Category[]> {

      const catsRes = await query(`SELECT id, name, slug, icon, description FROM categories ORDER BY name ASC`);
      const prodsRes = await query(`SELECT category_id, is_organic FROM products`);
      const products = prodsRes.rows;
      return catsRes.rows.map((c: any) => ({
        ...c,
        itemCount:
          c.id === 'all'
            ? products.length
            : products.filter((p: any) => p.category_id === c.id || (c.id === 'organic' && p.is_organic)).length,
      }));
  }

  public async getProducts(params?: { category?: string; search?: string; locationId?: string; includeUnverifiedShops?: boolean; includeMaster?: boolean }): Promise<Product[]> {

      let sql = `SELECT id, name, category_id AS "categoryId", emoji, image, default_unit AS "defaultUnit", 
                        available_units AS "availableUnits", unit_multiplier AS "unitMultiplier", 
                        is_organic AS "isOrganic", is_seasonal AS "isSeasonal", badge, 
                        nutritional_note AS "nutritionalNote", prices, stock_status AS "stockStatus", 
                        last_updated AS "lastUpdated" 
                 FROM products 
                 WHERE image IS NOT NULL AND TRIM(image) <> ''`;
      const queryParams: any[] = [];

      if (params?.category && params.category !== 'all') {
        const cat = params.category.toLowerCase().trim();
        if (cat === 'organic') {
          sql += ` AND (is_organic = true OR category_id = 'organic')`;
        } else if (cat === 'fruits') {
          sql += ` AND (category_id = 'fruits' OR category_id = 'fruits-vegetables')`;
        } else if (cat === 'vegetables') {
          sql += ` AND (category_id = 'vegetables' OR category_id = 'fruits-vegetables')`;
        } else if (cat === 'rice-grains') {
          sql += ` AND category_id IN ('rice-grains', 'staples', 'pulses-legumes')`;
        } else if (cat === 'dairy') {
          sql += ` AND category_id IN ('dairy')`;
        } else if (cat === 'spices') {
          sql += ` AND category_id IN ('spices', 'oils-spices')`;
        } else if (cat === 'grocery') {
          sql += ` AND category_id IN ('grocery', 'oils-sugar', 'sauces-condiments', 'staples', 'spices', 'pulses-legumes')`;
        } else if (cat === 'biscuits-snacks') {
          sql += ` AND category_id IN ('biscuits-snacks', 'beverages', 'bakery-breakfast', 'snacks-beverages')`;
        } else {
          queryParams.push(cat);
          sql += ` AND category_id = $${queryParams.length}`;
        }
      }

      if (params?.search && params.search.trim()) {
        queryParams.push(`%${params.search.toLowerCase().trim()}%`);
        sql += ` AND (LOWER(name) LIKE $${queryParams.length} OR LOWER(category_id) LIKE $${queryParams.length} OR LOWER(COALESCE(badge, '')) LIKE $${queryParams.length} OR LOWER(COALESCE(nutritional_note, '')) LIKE $${queryParams.length})`;
      }

      sql += ` ORDER BY name ASC`;
      const res = await query(sql, queryParams);
      let result: Product[] = res.rows;

      let shops = await this.getShops(params?.locationId, params?.includeUnverifiedShops);
      let allowedShopNames = new Set(shops.map((s) => s.name));

      result = result.map((p) => {
        let filteredPrices: Record<string, number> = {};
        let filteredStock: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
        for (const [shopName, price] of Object.entries(p.prices || {})) {
          if (allowedShopNames.has(shopName)) {
            filteredPrices[shopName] = Math.round(Number(price) || 0);
          }
        }
        for (const [shopName, stock] of Object.entries(p.stockStatus || {})) {
          if (allowedShopNames.has(shopName)) {
            filteredStock[shopName] = stock;
          }
        }
        if (params?.includeMaster && p.prices) {
          const roundedMaster: Record<string, number> = {};
          for (const [k, v] of Object.entries(p.prices)) {
            roundedMaster[k] = Math.round(Number(v) || 0);
          }
          filteredPrices = { ...roundedMaster, ...filteredPrices };
        }
        return {
          ...p,
          prices: filteredPrices,
          stockStatus: filteredStock,
        };
      });

      if (!params?.includeMaster) {
        result = result.filter((p) => Object.keys(p.prices).length > 0);
      }

      return result;
  }

  public async getProductById(id: string, includeUnverifiedShops: boolean = false, locationId?: string): Promise<Product | undefined> {

      const res = await query(
        `SELECT id, name, category_id AS "categoryId", emoji, image, default_unit AS "defaultUnit", 
                available_units AS "availableUnits", unit_multiplier AS "unitMultiplier", 
                is_organic AS "isOrganic", is_seasonal AS "isSeasonal", badge, 
                nutritional_note AS "nutritionalNote", prices, stock_status AS "stockStatus", 
                last_updated AS "lastUpdated" 
         FROM products 
         WHERE id = $1`,
        [id]
      );

      if (res.rows.length === 0) return undefined;
      const prod: Product = res.rows[0];
      if (includeUnverifiedShops && (!locationId || locationId === 'all')) return prod;

      const scopedShops = await this.getShops(locationId, includeUnverifiedShops);
      const scopedShopNames = new Set(scopedShops.map((s) => s.name));

      const filteredPrices: Record<string, number> = {};
      const filteredStock: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};
      for (const [shopName, price] of Object.entries(prod.prices || {})) {
        if (scopedShopNames.has(shopName)) {
          filteredPrices[shopName] = Math.round(Number(price) || 0);
        }
      }
      for (const [shopName, stock] of Object.entries(prod.stockStatus || {})) {
        if (scopedShopNames.has(shopName)) {
          filteredStock[shopName] = stock;
        }
      }

      return {
        ...prod,
        prices: filteredPrices,
        stockStatus: filteredStock,
      };
  }

  public async addProduct(product: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
const id = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
const newId = `${id}-${Date.now().toString().slice(-4)}`;
const lastUpdated = new Date().toISOString();
const newProduct: Product = {
      ...product,
      id: newId,
      image: product.image,
      lastUpdated,
    };


      await query(
        `INSERT INTO products (id, name, category_id, emoji, image, default_unit, available_units, unit_multiplier, is_organic, is_seasonal, badge, nutritional_note, prices, stock_status, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newProduct.id,
          newProduct.name,
          newProduct.categoryId,
          newProduct.emoji,
          newProduct.image || null,
          newProduct.defaultUnit,
          JSON.stringify(newProduct.availableUnits || []),
          JSON.stringify(newProduct.unitMultiplier || {}),
          newProduct.isOrganic || false,
          newProduct.isSeasonal || false,
          newProduct.badge || null,
          newProduct.nutritionalNote || null,
          JSON.stringify(newProduct.prices || {}),
          JSON.stringify(newProduct.stockStatus || {}),
          newProduct.lastUpdated,
        ]
      );
      return newProduct;
  }

  public async deleteProduct(id: string): Promise<boolean> {

      const res = await query(`DELETE FROM products WHERE id = $1`, [id]);
      return (res.rowCount ?? 0) > 0;
  }

  public async clearAllProductImages(): Promise<void> {

      await query(`UPDATE products SET image = NULL`);
  }

  public async wipeAllData(): Promise<void> {

      await query(`
        TRUNCATE TABLE price_histories, price_reports, flash_deals, pre_bookings, messages, conversations, merchant_sales, consumer_data, products, shops, users CASCADE;
      `);
      await query(
        `INSERT INTO users (id, email, username, name, role, password, phone, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           username = EXCLUDED.username,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           password = EXCLUDED.password`,
        [
          'admin-1',
          'admin@priceteller.com',
          'priceteller10',
          'Super Admin',
          'admin',
          'password123',
          '+91 99999 00000',
          new Date().toISOString(),
          'tok-admin-1',
        ]
      );
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {

      const existing = await this.getProductById(id, true);
      if (!existing) return null;
      const merged: Product = {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      await query(
        `UPDATE products SET 
          name = $1, category_id = $2, emoji = $3, image = $4, default_unit = $5,
          available_units = $6, unit_multiplier = $7, is_organic = $8, is_seasonal = $9,
          badge = $10, nutritional_note = $11, prices = $12, stock_status = $13, last_updated = $14
        WHERE id = $15`,
        [
          merged.name,
          merged.categoryId,
          merged.emoji,
          merged.image || null,
          merged.defaultUnit,
          JSON.stringify(merged.availableUnits || []),
          JSON.stringify(merged.unitMultiplier || {}),
          !!merged.isOrganic,
          !!merged.isSeasonal,
          merged.badge || null,
          merged.nutritionalNote || null,
          JSON.stringify(merged.prices || {}),
          JSON.stringify(merged.stockStatus || {}),
          merged.lastUpdated,
          id,
        ]
      );
      
      return merged;
  }

  public async updateProductImage(id: string, imageUrl: string | null): Promise<boolean> {

      const res = await query(`UPDATE products SET image = $1 WHERE id = $2`, [imageUrl, id]);
      return (res.rowCount ?? 0) > 0;
  }

  public async getPriceHistory(productId: string): Promise<PriceHistoryPoint[]> {
    
      const res = await query(`SELECT points FROM price_histories WHERE product_id = $1`, [productId]);
      if (res.rows.length > 0 && Array.isArray(res.rows[0].points) && res.rows[0].points.length > 0) {
        return res.rows[0].points;
      }
    

    const prod = await this.getProductById(productId, true);
    if (!prod) return [];
    const priceVals = Object.values(prod.prices);
    const basePrice = priceVals.length > 0 ? Math.min(...priceVals) : 50;
    return [
      { date: '2026-08-01', price: Math.round(basePrice * 1.08), avgMarketPrice: Math.round(basePrice * 1.12) },
      { date: '2026-08-08', price: Math.round(basePrice * 1.05), avgMarketPrice: Math.round(basePrice * 1.09) },
      { date: '2026-08-15', price: Math.round(basePrice * 1.02), avgMarketPrice: Math.round(basePrice * 1.06) },
      { date: '2026-08-22', price: Math.round(basePrice * 0.98), avgMarketPrice: Math.round(basePrice * 1.04) },
      { date: '2026-08-30', price: basePrice, avgMarketPrice: Math.round(basePrice * 1.05) },
    ];
  }

  public async getPriceReports(productId?: string, locationId?: string, includeUnverified: boolean = false): Promise<PriceReport[]> {

      let sql = `SELECT id, product_id AS "productId", product_name AS "productName", 
                        shop_id AS "shopId", shop_name AS "shopName", location_id AS "locationId", 
                        reported_price::float AS "reportedPrice", unit, reported_by AS "reportedBy", 
                        timestamp, proof_url AS "proofUrl", status, upvotes, downvotes, user_voted AS "userVoted" 
                 FROM price_reports 
                 WHERE 1=1`;
      const params: any[] = [];

      if (!includeUnverified) {
        const verifiedShops = await this.getShops(locationId, false);
        const verifiedShopNames = verifiedShops.map((s) => s.name);
        const verifiedShopIds = verifiedShops.map((s) => s.id);
        if (verifiedShopNames.length > 0) {
          params.push(verifiedShopNames);
          params.push(verifiedShopIds);
          sql += ` AND (shop_name = ANY($${params.length - 1}) OR shop_id = ANY($${params.length}))`;
        }
      } else if (locationId && locationId !== 'all') {
        const scopedShops = await this.getShops(locationId, true);
        const scopedShopNames = scopedShops.map((s) => s.name);
        const scopedShopIds = scopedShops.map((s) => s.id);
        if (scopedShopNames.length > 0) {
          params.push(scopedShopNames);
          params.push(scopedShopIds);
          sql += ` AND (location_id = $${params.length - 1} OR shop_name = ANY($${params.length - 1}) OR shop_id = ANY($${params.length}))`;
        }
      }

      if (productId) {
        params.push(productId);
        sql += ` AND product_id = $${params.length}`;
      }

      sql += ` ORDER BY created_at DESC, id DESC`;
      const res = await query(sql, params);
      return res.rows;
  }

  public async addPriceReport(report: Omit<PriceReport, 'id' | 'timestamp' | 'status' | 'upvotes' | 'downvotes'>): Promise<PriceReport> {
const newReport: PriceReport = {
      ...report,
      id: `rep-${Date.now()}`,
      timestamp: 'Just now',
      status: 'verified',
      upvotes: 1,
      downvotes: 0,
    };


      await query(
        `INSERT INTO price_reports (id, product_id, product_name, shop_id, shop_name, location_id, reported_price, unit, reported_by, timestamp, proof_url, status, upvotes, downvotes, user_voted)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newReport.id,
          newReport.productId,
          newReport.productName,
          newReport.shopId,
          newReport.shopName,
          newReport.locationId,
          newReport.reportedPrice,
          newReport.unit,
          newReport.reportedBy,
          newReport.timestamp,
          newReport.proofUrl || null,
          newReport.status,
          newReport.upvotes,
          newReport.downvotes,
          newReport.userVoted || null,
        ]
      );

      const product = await this.getProductById(report.productId, true);
      if (product && product.prices[report.shopName] !== undefined) {
        product.prices[report.shopName] = report.reportedPrice;
        const lastUpdated = new Date().toISOString();
        await query(`UPDATE products SET prices = $1, last_updated = $2 WHERE id = $3`, [
          JSON.stringify(product.prices),
          lastUpdated,
          product.id,
        ]);
      }
      return newReport;
  }

  public async votePriceReport(reportId: string, type: 'up' | 'down'): Promise<PriceReport | null> {

      const col = type === 'up' ? 'upvotes' : 'downvotes';
      const res = await query(
        `UPDATE price_reports 
         SET ${col} = ${col} + 1 
         WHERE id = $1 
         RETURNING id, product_id AS "productId", product_name AS "productName", 
                   shop_id AS "shopId", shop_name AS "shopName", location_id AS "locationId", 
                   reported_price::float AS "reportedPrice", unit, reported_by AS "reportedBy", 
                   timestamp, proof_url AS "proofUrl", status, upvotes, downvotes, user_voted AS "userVoted"`,
        [reportId]
      );
      return res.rows[0] || null;
  }

  public async moderatePriceReport(reportId: string, action: 'approve' | 'reject'): Promise<PriceReport | null> {
const status = action === 'approve' ? 'verified' : 'rejected';


      const res = await query(
        `UPDATE price_reports 
         SET status = $1 
         WHERE id = $2 
         RETURNING id, product_id AS "productId", product_name AS "productName", 
                   shop_id AS "shopId", shop_name AS "shopName", location_id AS "locationId", 
                   reported_price::float AS "reportedPrice", unit, reported_by AS "reportedBy", 
                   timestamp, proof_url AS "proofUrl", status, upvotes, downvotes, user_voted AS "userVoted"`,
        [status, reportId]
      );

      const rep: PriceReport | undefined = res.rows[0];
      if (!rep) return null;

      if (action === 'approve') {
        const prod = await this.getProductById(rep.productId, true);
        if (prod) {
          prod.prices[rep.shopName] = rep.reportedPrice;
          await query(`UPDATE products SET prices = $1, last_updated = $2 WHERE id = $3`, [
            JSON.stringify(prod.prices),
            new Date().toISOString(),
            prod.id,
          ]);
        }
      }
      return rep;
  }

  public async getFlashDeals(locationId?: string, includeUnverified: boolean = false): Promise<FlashDeal[]> {

      let sql = `SELECT id, shop_id AS "shopId", shop_name AS "shopName", product_id AS "productId", 
                        product_name AS "productName", emoji, original_price::float AS "originalPrice", 
                        deal_price::float AS "dealPrice", discount_percentage::float AS "discountPercentage", 
                        unit, expires_in_minutes AS "expiresInMinutes", tag 
                 FROM flash_deals`;
      const params: any[] = [];

      if (!includeUnverified || (locationId && locationId !== 'all')) {
        const scopedShops = await this.getShops(locationId, includeUnverified);
        const scopedShopNames = scopedShops.map((s) => s.name);
        const scopedShopIds = scopedShops.map((s) => s.id);
        if (scopedShopNames.length > 0) {
          params.push(scopedShopNames);
          params.push(scopedShopIds);
          sql += ` WHERE (shop_name = ANY($1) OR shop_id = ANY($2))`;
        } else if (locationId && locationId !== 'all') {
          return [];
        }
      }

      sql += ` ORDER BY created_at DESC, id DESC`;
      const res = await query(sql, params);
      return res.rows;
  }

  public async createFlashDeal(deal: Omit<FlashDeal, 'id'>): Promise<FlashDeal> {
const newDeal: FlashDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
    };


      await query(
        `INSERT INTO flash_deals (id, shop_id, shop_name, product_id, product_name, emoji, original_price, deal_price, discount_percentage, unit, expires_in_minutes, tag)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newDeal.id,
          newDeal.shopId,
          newDeal.shopName,
          newDeal.productId,
          newDeal.productName,
          newDeal.emoji,
          newDeal.originalPrice,
          newDeal.dealPrice,
          newDeal.discountPercentage,
          newDeal.unit,
          newDeal.expiresInMinutes,
          newDeal.tag,
        ]
      );
      return newDeal;
  }

  public async updateMerchantPrices(
    shopName: string,
    updates: { productId: string; price: number; stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' }[]
  ): Promise<boolean> {
    if (!updates || updates.length === 0) return true;

    const now = new Date().toISOString();
    // Process in batches of 25 concurrent queries to guarantee blazing fast writes without exhausting connections
    const batchSize = 25;
    for (let i = 0; i < updates.length; i += batchSize) {
      const chunk = updates.slice(i, i + batchSize);
      await Promise.all(
        chunk.map((u) =>
          query(
            `UPDATE products 
             SET prices = COALESCE(prices, '{}'::jsonb) || CAST($1 AS jsonb),
                 stock_status = COALESCE(stock_status, '{}'::jsonb) || CAST($2 AS jsonb),
                 last_updated = $3 
             WHERE id = $4`,
            [
              JSON.stringify({ [shopName]: u.price }),
              JSON.stringify({ [shopName]: u.stockStatus }),
              now,
              u.productId,
            ]
          )
        )
      );
    }
    
    return true;
  }

  public async delistMerchantProduct(shopName: string, productId: string): Promise<boolean> {
    const prod = await this.getProductById(productId, true);
    if (!prod) return false;
    if (prod.prices && prod.prices[shopName] !== undefined) {
      delete prod.prices[shopName];
    }
    if (prod.stockStatus && prod.stockStatus[shopName] !== undefined) {
      delete prod.stockStatus[shopName];
    }

    
      await query(
        `UPDATE products SET prices = $1, stock_status = $2, last_updated = $3 WHERE id = $4`,
        [JSON.stringify(prod.prices), JSON.stringify(prod.stockStatus), new Date().toISOString(), prod.id]
      );
    
    return true;
  }

  public async relistMerchantProduct(shopName: string, productId: string, price?: number): Promise<boolean> {
    const prod = await this.getProductById(productId, true);
    if (!prod) return false;
    const existingPrices = Object.values(prod.prices || {}).filter((value) => Number.isFinite(value) && value > 0);
    const requestedPrice = Number(price);
    const avgPrice = Number.isFinite(requestedPrice) && requestedPrice > 0
      ? requestedPrice
      : (existingPrices.length > 0
        ? Math.round(existingPrices.reduce((a, b) => a + b, 0) / existingPrices.length)
        : 50);

    if (!prod.prices) prod.prices = {};
    if (!prod.stockStatus) prod.stockStatus = {};
    prod.prices[shopName] = avgPrice;
    prod.stockStatus[shopName] = 'in_stock';

    
      await query(
        `UPDATE products SET prices = $1, stock_status = $2, last_updated = $3 WHERE id = $4`,
        [JSON.stringify(prod.prices), JSON.stringify(prod.stockStatus), new Date().toISOString(), prod.id]
      );
    
    return true;
  }

  public async getAdminStats() {

      const [pCount, sCount, lCount, verifiedRep, pendingRep, dealsCount] = await Promise.all([
        query(`SELECT COUNT(*) AS count FROM products`),
        query(`SELECT COUNT(*) AS count FROM shops`),
        query(`SELECT COUNT(*) AS count FROM locations`),
        query(`SELECT COUNT(*) AS count FROM price_reports WHERE status = 'verified'`),
        query(`SELECT COUNT(*) AS count FROM price_reports WHERE status = 'pending'`),
        query(`SELECT COUNT(*) AS count FROM flash_deals`),
      ]);

      return {
        totalProducts: parseInt(pCount.rows[0]?.count || '0', 10),
        totalShops: parseInt(sCount.rows[0]?.count || '0', 10),
        totalLocations: parseInt(lCount.rows[0]?.count || '0', 10),
        totalVerifiedReports: parseInt(verifiedRep.rows[0]?.count || '0', 10),
        pendingReports: parseInt(pendingRep.rows[0]?.count || '0', 10),
        activeFlashDeals: parseInt(dealsCount.rows[0]?.count || '0', 10),
        totalDailySavingsEstimated: 18450,
        totalBasketQueriesToday: 420,
      };
  }

  public async getQuickMerchants() {

      const res = await query(
        `SELECT id, email, name, shop_name AS "shopName", shop_id AS "shopId" 
         FROM users 
         WHERE role = 'merchant' 
         ORDER BY name ASC`
      );
      return res.rows;
  }

  public async registerMerchant(params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName: string;
    locationId?: string;
    address?: string;
    shopType?: string;
    categories?: string[];
  }): Promise<User> {
const cleanEmail = params.email.trim().toLowerCase();


      const existingRes = await query(`SELECT id FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
      if (existingRes.rows.length > 0) {
        throw new Error('An account with this email already exists');
      }

      const shopRes = await query(`SELECT id, name FROM shops WHERE LOWER(name) = $1`, [params.shopName.trim().toLowerCase()]);
      let shop: Shop;
      if (shopRes.rows.length === 0) {
        shop = await this.addShop({
          name: params.shopName.trim(),
          locationId: params.locationId || 'tirur',
          address: params.address || 'Central Market Road',
          distanceKm: 1.2,
          rating: 4.8,
          reviewCount: 1,
          shopType: (params.shopType as any) || 'supermarket',
          openingHours: '8:00 AM - 10:00 PM',
          phone: params.phone || '+91 98470 12345',
          isVerified: true,
          deliveryFee: 30,
          freeDeliveryThreshold: 500,
          color: '#2563eb',
          categories: params.categories && params.categories.length > 0 ? params.categories : ['vegetables', 'fruits', 'staples', 'dairy'],
        });
      } else {
        shop = shopRes.rows[0];
        if (params.categories && params.categories.length > 0) {
          await this.updateShop(shop.id, { categories: params.categories });
        }
      }

      const newUser: User = {
        id: `usr-merchant-${Date.now()}`,
        email: cleanEmail,
        name: params.name || `${params.shopName} Partner`,
        role: 'merchant',
        password: await hashPassword(params.password || 'merchant123'),
        shopId: shop.id,
        shopName: shop.name,
        token: `tok-merchant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };

      await query(
        `INSERT INTO users (id, email, name, role, password, shop_id, shop_name, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUser.id, newUser.email, newUser.name, newUser.role, newUser.password, newUser.shopId, newUser.shopName, newUser.token]
      );
      return newUser;
  }

  public async ensureMerchantUserForShop(params: {
    shopId: string;
    shopName: string;
    email?: string;
    username?: string;
    password?: string;
    name?: string;
    phone?: string;
    locationId?: string;
  }): Promise<{ user: User; rawPassword: string; created: boolean }> {
const shopSlug = params.shopId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const email = (params.email || `${shopSlug}@gmail.com`).trim().toLowerCase();
const username = (params.username || shopSlug).trim().toLowerCase();
const rawPassword = params.password || 'password123';
const name = params.name || `${params.shopName} Manager`;


      const existingRes = await query(
        `SELECT id, email, username, name, role, password, shop_id AS "shopId", 
                shop_name AS "shopName", phone, location_id AS "locationId", 
                created_at AS "createdAt", token 
         FROM users 
         WHERE shop_id = $1 OR LOWER(email) = $2 OR LOWER(COALESCE(username, '')) = $3`,
        [params.shopId, email, username]
      );

      if (existingRes.rows.length > 0) {
        return { user: existingRes.rows[0], rawPassword, created: false };
      }

      const hashedPassword = await hashPassword(rawPassword);
      const newUser: User = {
        id: `usr-merchant-${shopSlug}-${Date.now()}`,
        email,
        username,
        name,
        role: 'merchant',
        password: hashedPassword,
        shopId: params.shopId,
        shopName: params.shopName,
        phone: params.phone,
        locationId: params.locationId,
        createdAt: new Date().toISOString(),
        token: `tok-merchant-${shopSlug}-${Date.now()}`,
      };

      await query(
        `INSERT INTO users (id, email, username, name, role, password, shop_id, shop_name, phone, location_id, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (email) DO UPDATE SET
           username = EXCLUDED.username,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           shop_id = EXCLUDED.shop_id,
           shop_name = EXCLUDED.shop_name`,
        [
          newUser.id,
          newUser.email,
          newUser.username,
          newUser.name,
          newUser.role,
          newUser.password,
          newUser.shopId,
          newUser.shopName,
          newUser.phone || null,
          newUser.locationId || null,
          newUser.createdAt,
          newUser.token,
        ]
      );

      return { user: newUser, rawPassword, created: true };
  }

  public async authenticateUser(
    identifier: string,
    password: string,
    expectedRole?: 'consumer' | 'merchant' | 'admin' | 'any'
  ): Promise<{ user?: User; error?: string; roleMismatch?: boolean; actualRole?: string }> {
const cleanId = (identifier || '').trim().toLowerCase();


      const res = await query(
        `SELECT id, email, username, name, role, password, shop_id AS "shopId", 
                shop_name AS "shopName", phone, location_id AS "locationId", 
                created_at AS "createdAt", token 
         FROM users 
         WHERE LOWER(email) = $1 
            OR LOWER(COALESCE(username, '')) = $1`,
        [cleanId]
      );

      if (res.rows.length === 0) {
        return { error: 'No account registered with this username or email. Please check your spelling or register a new account.' };
      }

      const user: User = res.rows[0];
      const passwordMatches = await verifyPassword(password, user.password);
      if (!passwordMatches) {
        return { error: 'Incorrect password. Please verify your credentials.' };
      }

      if (!BCRYPT_HASH_PATTERN.test(user.password)) {
        const upgradedPassword = await hashPassword(password);
        await query(`UPDATE users SET password = $1 WHERE id = $2`, [upgradedPassword, user.id]);
        user.password = upgradedPassword;
      }

      if (expectedRole && expectedRole !== 'any') {
        if (user.role !== expectedRole && user.role !== 'admin') {
          const actualLabel = user.role === 'consumer' ? 'Shopper / Consumer' : user.role === 'merchant' ? 'Store Partner / Merchant' : 'Super Admin';
          const expectedLabel = expectedRole === 'consumer' ? 'Shopper / Consumer' : expectedRole === 'merchant' ? 'Store Partner / Merchant' : 'Super Admin';
          return {
            error: `Role Mismatch: This account (${user.email || user.username}) is registered as a ${actualLabel}. You cannot log into the ${expectedLabel} portal with it.`,
            roleMismatch: true,
            actualRole: user.role,
          };
        }
      }

      if (!user.token) {
        user.token = `tok-${user.role}-${user.id}-${Date.now()}`;
        await query(`UPDATE users SET token = $1 WHERE id = $2`, [user.token, user.id]);
      }

      return { user };
  }

  public async logoutUser(token: string): Promise<boolean> {
if (!token) return true;
const cleanToken = token.replace('Bearer ', '').trim();
if (!cleanToken) return true;


      await query('UPDATE users SET token = NULL WHERE token = $1', [cleanToken]);
      return true;
  }

  public async getUserByToken(token: string): Promise<User | null> {
if (!token) return null;
const cleanToken = token.replace('Bearer ', '').trim();
if (!cleanToken) return null;


      const res = await query(
        `SELECT id, email, username, name, role, password, shop_id AS "shopId", 
                shop_name AS "shopName", phone, location_id AS "locationId", 
                created_at AS "createdAt", token 
         FROM users 
         WHERE token = $1`,
        [cleanToken]
      );
      return res.rows[0] || null;
  }

  public async getQuickConsumers(): Promise<{ id: string; name: string; email: string; phone?: string; locationId?: string; listCount: number; favoritesCount: number }[]> {

      const res = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.location_id AS "locationId",
                COALESCE(jsonb_array_length(c.saved_lists), 0) AS "listCount",
                COALESCE(jsonb_array_length(c.favorites), 0) AS "favoritesCount"
         FROM users u
         LEFT JOIN consumer_data c ON u.id = c.user_id
         WHERE u.role = 'consumer'
         ORDER BY u.name ASC`
      );
      return res.rows.map((r: any) => ({
        ...r,
        listCount: parseInt(r.listCount || '0', 10),
        favoritesCount: parseInt(r.favoritesCount || '0', 10),
      }));
  }

  public async registerConsumer(params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    locationId?: string;
  }): Promise<User> {
const cleanEmail = params.email.trim().toLowerCase();


      const existing = await query(`SELECT id FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
      if (existing.rows.length > 0) {
        throw new Error('An account with this email already exists');
      }

      const newUser: User = {
        id: `usr-consumer-${Date.now()}`,
        email: cleanEmail,
        name: params.name.trim() || 'Consumer Shopper',
        role: 'consumer',
        password: await hashPassword(params.password || 'consumer123'),
        phone: params.phone || '',
        locationId: params.locationId || 'tirur',
        createdAt: new Date().toISOString().split('T')[0],
        token: `consumer-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };

      await query(
        `INSERT INTO users (id, email, name, role, password, phone, location_id, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newUser.id, newUser.email, newUser.name, newUser.role, newUser.password, newUser.phone, newUser.locationId, newUser.createdAt, newUser.token]
      );

      await query(
        `INSERT INTO consumer_data (user_id, basket, saved_lists, favorites, trip_history, preferred_location_id, last_active)
         VALUES ($1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, $2, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [newUser.id, params.locationId || 'tirur']
      );

      return newUser;
  }

  public async authenticateOrRegisterGoogleUser(params: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
    expectedRole?: 'consumer' | 'merchant' | 'any';
  }): Promise<{ user: User; isNewUser?: boolean; error?: string; roleMismatch?: boolean; actualRole?: string }> {
const cleanEmail = params.email.trim().toLowerCase();
const cleanName = params.name.trim() || 'Google User';
const expectedRole = params.expectedRole || 'consumer';


      const res = await query(
        `SELECT id, email, username, name, role, password, shop_id AS "shopId", 
                shop_name AS "shopName", phone, location_id AS "locationId", 
                created_at AS "createdAt", token 
         FROM users 
         WHERE LOWER(email) = $1`,
        [cleanEmail]
      );

      if (res.rows.length > 0) {
        const user: User = res.rows[0];

        // Role verification if specific role requested
        if (expectedRole && expectedRole !== 'any' && user.role !== expectedRole && user.role !== 'admin') {
          const actualLabel = user.role === 'consumer' ? 'Shopper / Consumer' : user.role === 'merchant' ? 'Store Partner / Merchant' : 'Super Admin';
          const expectedLabel = expectedRole === 'consumer' ? 'Shopper / Consumer' : expectedRole === 'merchant' ? 'Store Partner / Merchant' : 'Super Admin';
          return {
            error: `Role Mismatch: Your Google account (${user.email}) is already registered as a ${actualLabel}. You cannot log into the ${expectedLabel} portal with it.`,
            roleMismatch: true,
            actualRole: user.role,
            user,
          };
        }

        user.token = `tok-${user.role}-${user.id}-${Date.now()}`;
        await query(`UPDATE users SET token = $1 WHERE id = $2`, [user.token, user.id]);
        return { user, isNewUser: false };
      }

      const newUserId = `usr-${expectedRole === 'merchant' ? 'merchant' : 'consumer'}-${Date.now()}`;
      const newUserToken = `tok-${expectedRole === 'merchant' ? 'merchant' : 'consumer'}-${newUserId}-${Date.now()}`;
      const createdAt = new Date().toISOString().split('T')[0];

      const newUser: User = {
        id: newUserId,
        email: cleanEmail,
        name: cleanName,
        role: expectedRole === 'merchant' ? 'merchant' : 'consumer',
        password: `google-oauth-${Date.now()}`,
        locationId: 'tirur',
        createdAt,
        token: newUserToken,
      };

      await query(
        `INSERT INTO users (id, email, name, role, password, phone, location_id, created_at, token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newUser.id, newUser.email, newUser.name, newUser.role, newUser.password, '', newUser.locationId, newUser.createdAt, newUser.token]
      );

      if (newUser.role === 'consumer') {
        await query(
          `INSERT INTO consumer_data (user_id, basket, saved_lists, favorites, trip_history, preferred_location_id, last_active)
           VALUES ($1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, $2, NOW())
           ON CONFLICT (user_id) DO NOTHING`,
          [newUser.id, 'tirur']
        );
      }

      return { user: newUser, isNewUser: true };
  }

  public async getConsumerData(userId: string): Promise<ConsumerData> {

      const res = await query(
        `SELECT user_id AS "userId", basket, saved_lists AS "savedLists", 
                favorites, trip_history AS "tripHistory", 
                preferred_location_id AS "preferredLocationId", 
                last_active AS "lastActive" 
         FROM consumer_data 
         WHERE user_id = $1`,
        [userId]
      );

      if (res.rows.length > 0) {
        return res.rows[0];
      }

      const initial: ConsumerData = {
        userId,
        basket: [],
        savedLists: [],
        favorites: [],
        tripHistory: [],
        preferredLocationId: 'tirur',
        lastActive: new Date().toISOString(),
      };

      await query(
        `INSERT INTO consumer_data (user_id, basket, saved_lists, favorites, trip_history, preferred_location_id, last_active)
         VALUES ($1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'tirur', NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      return initial;
  }

  public async updateConsumerBasket(userId: string, basket: ConsumerSavedListItem[]): Promise<ConsumerData> {

      const now = new Date().toISOString();
      await query(
        `INSERT INTO consumer_data (user_id, basket, saved_lists, favorites, trip_history, preferred_location_id, last_active)
         VALUES ($1, $2, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'tirur', $3)
         ON CONFLICT (user_id) DO UPDATE SET
           basket = EXCLUDED.basket,
           last_active = EXCLUDED.last_active`,
        [userId, JSON.stringify(basket || []), now]
      );
      return this.getConsumerData(userId);
  }

  public async saveConsumerList(
    userId: string,
    name: string,
    items: ConsumerSavedListItem[]
  ): Promise<ConsumerSavedList> {
const data = await this.getConsumerData(userId);
const newList: ConsumerSavedList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'My Shopping List',
      createdAt: new Date().toISOString().split('T')[0],
      items: items || [],
      totalItems: (items || []).reduce((acc, it) => acc + it.quantity, 0),
    };


      const updatedLists = [newList, ...(data.savedLists || [])];
      await query(
        `UPDATE consumer_data 
         SET saved_lists = $1, last_active = NOW() 
         WHERE user_id = $2`,
        [JSON.stringify(updatedLists), userId]
      );
      return newList;
  }

  public async deleteConsumerList(userId: string, listId: string): Promise<boolean> {
    const data = await this.getConsumerData(userId);
    const initialLen = (data.savedLists || []).length;
    const filteredLists = (data.savedLists || []).filter((l) => l.id !== listId);

    if (filteredLists.length < initialLen) {
      
        await query(
          `UPDATE consumer_data 
           SET saved_lists = $1, last_active = NOW() 
           WHERE user_id = $2`,
          [JSON.stringify(filteredLists), userId]
        );
      
      return true;
    }
    return false;
  }

  public async toggleConsumerFavorite(userId: string, productId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
    const data = await this.getConsumerData(userId);
    const favorites = [...(data.favorites || [])];

    const index = favorites.indexOf(productId);
    let isFavorite = false;
    if (index >= 0) {
      favorites.splice(index, 1);
      isFavorite = false;
    } else {
      favorites.push(productId);
      isFavorite = true;
    }

    
      await query(
        `UPDATE consumer_data 
         SET favorites = $1, last_active = NOW() 
         WHERE user_id = $2`,
        [JSON.stringify(favorites), userId]
      );
    

    return { isFavorite, favorites };
  }

  public async addConsumerTripHistory(
    userId: string,
    trip: {
      shopName: string;
      shopId?: string;
      locationName?: string;
      totalAmount: number;
      totalSavings: number;
      itemCount: number;
      itemsSummary: string;
    }
  ): Promise<ConsumerTripHistory> {
const data = await this.getConsumerData(userId);
const newTrip: ConsumerTripHistory = {
      id: `trip-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      shopName: trip.shopName,
      shopId: trip.shopId,
      locationName: trip.locationName || 'Tirur',
      totalAmount: trip.totalAmount,
      totalSavings: trip.totalSavings,
      itemCount: trip.itemCount,
      itemsSummary: trip.itemsSummary,
    };


      const updatedHistory = [newTrip, ...(data.tripHistory || [])];
      await query(
        `UPDATE consumer_data 
         SET trip_history = $1, last_active = NOW() 
         WHERE user_id = $2`,
        [JSON.stringify(updatedHistory), userId]
      );
      return newTrip;
  }

  public async getConversationsForConsumer(consumerId: string): Promise<Conversation[]> {

      const res = await query(
        `SELECT c.id, 
                c.consumer_id as "consumerId", 
                c.consumer_name as "consumerName", 
                c.shop_id as "shopId", 
                c.shop_name as "shopName", 
                c.basket_snapshot as "basketSnapshot", 
                c.status, 
                c.last_message as "lastMessage", 
                c.last_message_time as "lastMessageTime", 
                c.created_at as "createdAt", 
                c.updated_at as "updatedAt",
                COALESCE((
                  SELECT COUNT(*)::int 
                  FROM messages m 
                  WHERE m.conversation_id = c.id 
                    AND m.sender_role != 'consumer' 
                    AND m.is_read = false
                ), 0) as "unreadCount"
         FROM conversations c
         WHERE c.consumer_id = $1 
         ORDER BY c.updated_at DESC`,
        [consumerId]
      );
      return res.rows;
  }

  public async getConversationsForMerchant(shopIdentifier: string): Promise<Conversation[]> {

      const res = await query(
        `SELECT c.id, 
                c.consumer_id as "consumerId", 
                c.consumer_name as "consumerName", 
                c.shop_id as "shopId", 
                c.shop_name as "shopName", 
                c.basket_snapshot as "basketSnapshot", 
                c.status, 
                c.last_message as "lastMessage", 
                c.last_message_time as "lastMessageTime", 
                c.created_at as "createdAt", 
                c.updated_at as "updatedAt",
                COALESCE((
                  SELECT COUNT(*)::int 
                  FROM messages m 
                  WHERE m.conversation_id = c.id 
                    AND m.sender_role = 'consumer' 
                    AND m.is_read = false
                ), 0) as "unreadCount"
         FROM conversations c
         WHERE c.shop_id = $1 OR LOWER(c.shop_name) = LOWER($1)
         ORDER BY c.updated_at DESC`,
        [shopIdentifier]
      );
      return res.rows;
  }

  public async getAllConversationsAdmin(): Promise<Conversation[]> {

      const res = await query(
        `SELECT c.id, 
                c.consumer_id as "consumerId", 
                c.consumer_name as "consumerName", 
                c.shop_id as "shopId", 
                c.shop_name as "shopName", 
                c.basket_snapshot as "basketSnapshot", 
                c.status, 
                c.last_message as "lastMessage", 
                c.last_message_time as "lastMessageTime", 
                c.created_at as "createdAt", 
                c.updated_at as "updatedAt",
                COALESCE((
                  SELECT COUNT(*)::int 
                  FROM messages m 
                  WHERE m.conversation_id = c.id 
                    AND m.is_read = false
                ), 0) as "unreadCount"
         FROM conversations c
         ORDER BY c.updated_at DESC`
      );
      return res.rows;
  }

  public async getConversationById(conversationId: string): Promise<Conversation | null> {

      const res = await query(
        `SELECT id, 
                consumer_id as "consumerId", 
                consumer_name as "consumerName", 
                shop_id as "shopId", 
                shop_name as "shopName", 
                basket_snapshot as "basketSnapshot", 
                status, 
                last_message as "lastMessage", 
                last_message_time as "lastMessageTime", 
                created_at as "createdAt", 
                updated_at as "updatedAt"
         FROM conversations 
         WHERE id = $1`,
        [conversationId]
      );
      return res.rows[0] || null;
  }

  public async createConversation(data: {
    consumerId: string;
    consumerName: string;
    shopId: string;
    shopName: string;
    basketSnapshot: BasketSnapshot;
    initialMessage?: string;
  }): Promise<{ conversation: Conversation; initialMessage?: ChatMessage }> {
const now = new Date().toISOString();
const trimmedMsg = data.initialMessage?.trim() || 'Shared a basket inquiry';
let existingConv: Conversation | null = null;

      const res = await query(
        `SELECT id, 
                consumer_id as "consumerId", 
                consumer_name as "consumerName", 
                shop_id as "shopId", 
                shop_name as "shopName", 
                basket_snapshot as "basketSnapshot", 
                status, 
                last_message as "lastMessage", 
                last_message_time as "lastMessageTime", 
                created_at as "createdAt", 
                updated_at as "updatedAt"
         FROM conversations 
         WHERE consumer_id = $1 AND (shop_id = $2 OR LOWER(shop_name) = LOWER($3))
         ORDER BY updated_at DESC
         LIMIT 1`,
        [data.consumerId, data.shopId, data.shopName]
      );
      if (res.rows.length > 0) {
        existingConv = res.rows[0];
      }
    
if (existingConv) {
      // Update existing conversation with latest basket snapshot and last message
      existingConv.basketSnapshot = data.basketSnapshot;
      existingConv.lastMessage = trimmedMsg;
      existingConv.lastMessageTime = now;
      existingConv.updatedAt = now;

      let firstMsg: ChatMessage | undefined;
      if (data.initialMessage && data.initialMessage.trim()) {
        firstMsg = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conversationId: existingConv.id,
          senderId: data.consumerId,
          senderRole: 'consumer',
          senderName: data.consumerName,
          text: data.initialMessage.trim(),
          basketSnapshot: data.basketSnapshot,
          isRead: false,
          createdAt: now,
        };
      }

      
        await query(
          `UPDATE conversations 
           SET basket_snapshot = $1, last_message = $2, last_message_time = $3, updated_at = $3
           WHERE id = $4`,
          [JSON.stringify(data.basketSnapshot), trimmedMsg, now, existingConv.id]
        );

        if (firstMsg) {
          await query(
            `INSERT INTO messages (id, conversation_id, sender_id, sender_role, sender_name, text, basket_snapshot, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              firstMsg.id,
              firstMsg.conversationId,
              firstMsg.senderId,
              firstMsg.senderRole,
              firstMsg.senderName,
              firstMsg.text,
              firstMsg.basketSnapshot ? JSON.stringify(firstMsg.basketSnapshot) : null,
              false,
              firstMsg.createdAt,
            ]
          );
        }
      

      return { conversation: existingConv, initialMessage: firstMsg };
    }
const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const newConv: Conversation = {
      id: convId,
      consumerId: data.consumerId,
      consumerName: data.consumerName,
      shopId: data.shopId,
      shopName: data.shopName,
      basketSnapshot: data.basketSnapshot,
      status: 'active',
      lastMessage: trimmedMsg,
      lastMessageTime: now,
      createdAt: now,
      updatedAt: now,
    };
let firstMsg: ChatMessage | undefined;
if (data.initialMessage && data.initialMessage.trim()) {
      firstMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conversationId: convId,
        senderId: data.consumerId,
        senderRole: 'consumer',
        senderName: data.consumerName,
        text: data.initialMessage.trim(),
        basketSnapshot: data.basketSnapshot,
        isRead: false,
        createdAt: now,
      };
    }


      await query(
        `INSERT INTO conversations (id, consumer_id, consumer_name, shop_id, shop_name, basket_snapshot, status, last_message, last_message_time, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newConv.id,
          newConv.consumerId,
          newConv.consumerName,
          newConv.shopId,
          newConv.shopName,
          JSON.stringify(newConv.basketSnapshot),
          newConv.status,
          newConv.lastMessage,
          newConv.lastMessageTime,
          newConv.createdAt,
          newConv.updatedAt,
        ]
      );

      if (firstMsg) {
        await query(
          `INSERT INTO messages (id, conversation_id, sender_id, sender_role, sender_name, text, basket_snapshot, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            firstMsg.id,
            firstMsg.conversationId,
            firstMsg.senderId,
            firstMsg.senderRole,
            firstMsg.senderName,
            firstMsg.text,
            firstMsg.basketSnapshot ? JSON.stringify(firstMsg.basketSnapshot) : null,
            false,
            firstMsg.createdAt,
          ]
        );
      }

      return { conversation: newConv, initialMessage: firstMsg };
  }

  public async updateConversationBasket(
    conversationId: string,
    basketSnapshot: BasketSnapshot
  ): Promise<Conversation | null> {
const now = new Date().toISOString();


      const res = await query(
        `UPDATE conversations
         SET basket_snapshot = $1, updated_at = $2
         WHERE id = $3
         RETURNING id, 
                   consumer_id as "consumerId", 
                   consumer_name as "consumerName", 
                   shop_id as "shopId", 
                   shop_name as "shopName", 
                   basket_snapshot as "basketSnapshot", 
                   status, 
                   last_message as "lastMessage", 
                   last_message_time as "lastMessageTime", 
                   created_at as "createdAt", 
                   updated_at as "updatedAt"`,
        [JSON.stringify(basketSnapshot), now, conversationId]
      );
      return res.rows[0] || null;
  }

  public async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
      const res = await query(
        `SELECT id, 
                conversation_id as "conversationId", 
                sender_id as "senderId", 
                sender_role as "senderRole", 
                sender_name as "senderName", 
                text, 
                audio_url as "audioUrl",
                audio_duration as "audioDuration",
                basket_snapshot as "basketSnapshot",
                is_read as "isRead",
                client_msg_id as "clientMsgId",
                created_at as "createdAt"
         FROM messages 
         WHERE conversation_id = $1 
         ORDER BY created_at ASC`,
        [conversationId]
      );
      return res.rows;
  }

  public async addChatMessage(
    conversationId: string,
    senderId: string,
    senderRole: 'consumer' | 'merchant' | 'admin',
    senderName: string,
    text: string,
    basketSnapshot?: BasketSnapshot,
    clientMsgId?: string,
    audioUrl?: string,
    audioDuration?: number
  ): Promise<ChatMessage> {
    const now = new Date().toISOString();
    if (clientMsgId) {
        const existing = await query(
          `SELECT id, 
                  conversation_id as "conversationId", 
                  sender_id as "senderId", 
                  sender_role as "senderRole", 
                  sender_name as "senderName", 
                  text, 
                  audio_url as "audioUrl",
                  audio_duration as "audioDuration",
                  basket_snapshot as "basketSnapshot",
                  is_read as "isRead",
                  client_msg_id as "clientMsgId",
                  created_at as "createdAt"
           FROM messages 
           WHERE conversation_id = $1 AND client_msg_id = $2`,
          [conversationId, clientMsgId]
        );
        if (existing.rows.length > 0) {
          return existing.rows[0];
        }
    }
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      conversationId,
      senderId,
      senderRole,
      senderName,
      text: text?.trim() || (audioUrl ? '🎙️ Voice Message' : ''),
      audioUrl: audioUrl || undefined,
      audioDuration: audioDuration ? Number(audioDuration) : undefined,
      basketSnapshot: basketSnapshot && Object.keys(basketSnapshot).length > 0 ? basketSnapshot : undefined,
      isRead: false,
      clientMsgId,
      createdAt: now,
    };

      await query(
        `INSERT INTO messages (id, conversation_id, sender_id, sender_role, sender_name, text, audio_url, audio_duration, basket_snapshot, is_read, client_msg_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newMsg.id,
          newMsg.conversationId,
          newMsg.senderId,
          newMsg.senderRole,
          newMsg.senderName,
          newMsg.text,
          newMsg.audioUrl || null,
          newMsg.audioDuration || null,
          newMsg.basketSnapshot ? JSON.stringify(newMsg.basketSnapshot) : null,
          false,
          clientMsgId || null,
          newMsg.createdAt,
        ]
      );

      if (basketSnapshot && Object.keys(basketSnapshot).length > 0) {
        await query(
          `UPDATE conversations 
           SET last_message = $1, last_message_time = $2, updated_at = $2, basket_snapshot = $3 
           WHERE id = $4`,
          [newMsg.text, now, JSON.stringify(basketSnapshot), conversationId]
        );
      } else {
        await query(
          `UPDATE conversations 
           SET last_message = $1, last_message_time = $2, updated_at = $2 
           WHERE id = $3`,
          [newMsg.text, now, conversationId]
        );
      }

      return newMsg;
  }

  public async markConversationRead(
    conversationId: string,
    readerRole: 'consumer' | 'merchant' | 'admin' | string
  ): Promise<boolean> {

      if (readerRole === 'consumer') {
        await query(
          `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_role != 'consumer'`,
          [conversationId]
        );
      } else if (readerRole === 'merchant') {
        await query(
          `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_role = 'consumer'`,
          [conversationId]
        );
      } else {
        await query(
          `UPDATE messages SET is_read = true WHERE conversation_id = $1`,
          [conversationId]
        );
      }
      return true;
  }

  public async createPreBooking(data: {
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
    pickupTime?: string;
    notes?: string;
  }): Promise<PreBooking> {
const now = new Date().toISOString();
const id = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const newBooking: PreBooking = {
      id,
      consumerId: data.consumerId,
      consumerName: data.consumerName,
      consumerPhone: data.consumerPhone,
      consumerEmail: data.consumerEmail,
      shopId: data.shopId,
      shopName: data.shopName,
      items: data.items,
      itemCount: data.itemCount,
      totalQuantity: data.totalQuantity,
      totalAmount: data.totalAmount,
      status: 'pending',
      pickupTime: data.pickupTime,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };


      await query(
        `INSERT INTO pre_bookings (
          id, consumer_id, consumer_name, consumer_phone, consumer_email,
          shop_id, shop_name, items, item_count, total_quantity, total_amount,
          status, pickup_time, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newBooking.id,
          newBooking.consumerId,
          newBooking.consumerName,
          newBooking.consumerPhone || null,
          newBooking.consumerEmail || null,
          newBooking.shopId,
          newBooking.shopName,
          JSON.stringify(newBooking.items),
          newBooking.itemCount,
          newBooking.totalQuantity,
          newBooking.totalAmount,
          newBooking.status,
          newBooking.pickupTime || null,
          newBooking.notes || null,
          newBooking.createdAt,
          newBooking.updatedAt,
        ]
      );
      return newBooking;
  }

  public async getPreBookingsForConsumer(consumerId: string): Promise<PreBooking[]> {

      const res = await query(
        `SELECT id,
                consumer_id as "consumerId",
                consumer_name as "consumerName",
                consumer_phone as "consumerPhone",
                consumer_email as "consumerEmail",
                shop_id as "shopId",
                shop_name as "shopName",
                items,
                item_count as "itemCount",
                total_quantity as "totalQuantity",
                total_amount as "totalAmount",
                status,
                pickup_time as "pickupTime",
                notes,
                merchant_note as "merchantNote",
                created_at as "createdAt",
                updated_at as "updatedAt"
         FROM pre_bookings
         WHERE consumer_id = $1
         ORDER BY created_at DESC`,
        [consumerId]
      );
      return res.rows.map((row) => ({
        ...row,
        totalAmount: Number(row.totalAmount),
      }));
  }

  public async getPreBookingsForMerchant(shopIdentifier: string): Promise<PreBooking[]> {

      const res = await query(
        `SELECT id,
                consumer_id as "consumerId",
                consumer_name as "consumerName",
                consumer_phone as "consumerPhone",
                consumer_email as "consumerEmail",
                shop_id as "shopId",
                shop_name as "shopName",
                items,
                item_count as "itemCount",
                total_quantity as "totalQuantity",
                total_amount as "totalAmount",
                status,
                pickup_time as "pickupTime",
                notes,
                merchant_note as "merchantNote",
                created_at as "createdAt",
                updated_at as "updatedAt"
         FROM pre_bookings
         WHERE shop_id = $1 OR LOWER(shop_name) = LOWER($1)
         ORDER BY created_at DESC`,
        [shopIdentifier]
      );
      return res.rows.map((row) => ({
        ...row,
        totalAmount: Number(row.totalAmount),
      }));
  }

  public async getAllPreBookingsAdmin(): Promise<PreBooking[]> {

      const res = await query(
        `SELECT id,
                consumer_id as "consumerId",
                consumer_name as "consumerName",
                consumer_phone as "consumerPhone",
                consumer_email as "consumerEmail",
                shop_id as "shopId",
                shop_name as "shopName",
                items,
                item_count as "itemCount",
                total_quantity as "totalQuantity",
                total_amount as "totalAmount",
                status,
                pickup_time as "pickupTime",
                notes,
                merchant_note as "merchantNote",
                created_at as "createdAt",
                updated_at as "updatedAt"
         FROM pre_bookings
         ORDER BY created_at DESC`
      );
      return res.rows.map((row) => ({
        ...row,
        totalAmount: Number(row.totalAmount),
      }));
  }

  public async getPreBookingById(id: string): Promise<PreBooking | null> {

      const res = await query(
        `SELECT id,
                consumer_id as "consumerId",
                consumer_name as "consumerName",
                consumer_phone as "consumerPhone",
                consumer_email as "consumerEmail",
                shop_id as "shopId",
                shop_name as "shopName",
                items,
                item_count as "itemCount",
                total_quantity as "totalQuantity",
                total_amount as "totalAmount",
                status,
                pickup_time as "pickupTime",
                notes,
                merchant_note as "merchantNote",
                created_at as "createdAt",
                updated_at as "updatedAt"
         FROM pre_bookings
         WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      return {
        ...res.rows[0],
        totalAmount: Number(res.rows[0].totalAmount),
      };
  }

  public async updatePreBookingStatus(
    id: string,
    status: PreBookingStatus,
    merchantNote?: string
  ): Promise<PreBooking | null> {
const now = new Date().toISOString();


      let res;
      if (merchantNote !== undefined) {
        res = await query(
          `UPDATE pre_bookings
           SET status = $1, merchant_note = $2, updated_at = $3
           WHERE id = $4
           RETURNING id,
                     consumer_id as "consumerId",
                     consumer_name as "consumerName",
                     consumer_phone as "consumerPhone",
                     consumer_email as "consumerEmail",
                     shop_id as "shopId",
                     shop_name as "shopName",
                     items,
                     item_count as "itemCount",
                     total_quantity as "totalQuantity",
                     total_amount as "totalAmount",
                     status,
                     pickup_time as "pickupTime",
                     notes,
                     merchant_note as "merchantNote",
                     created_at as "createdAt",
                     updated_at as "updatedAt"`,
          [status, merchantNote, now, id]
        );
      } else {
        res = await query(
          `UPDATE pre_bookings
           SET status = $1, updated_at = $2
           WHERE id = $3
           RETURNING id,
                     consumer_id as "consumerId",
                     consumer_name as "consumerName",
                     consumer_phone as "consumerPhone",
                     consumer_email as "consumerEmail",
                     shop_id as "shopId",
                     shop_name as "shopName",
                     items,
                     item_count as "itemCount",
                     total_quantity as "totalQuantity",
                     total_amount as "totalAmount",
                     status,
                     pickup_time as "pickupTime",
                     notes,
                     merchant_note as "merchantNote",
                     created_at as "createdAt",
                     updated_at as "updatedAt"`,
          [status, now, id]
        );
      }
      if (res.rows.length === 0) return null;
      return {
        ...res.rows[0],
        totalAmount: Number(res.rows[0].totalAmount),
      };
  }

  public async createMerchantSale(saleData: {
    merchantId: string;
    shopId: string;
    shopName: string;
    items: SaleItem[];
    itemCount: number;
    totalQuantity: number;
    subtotalAmount: number;
    discountTotal: number;
    totalAmount: number;
    paymentMethod?: 'cash' | 'upi' | 'card' | 'credit' | 'other';
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<MerchantSale> {
const id = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const billNumber = `BILL-${Date.now().toString().slice(-6)}`;
const now = new Date().toISOString();
const paymentMethod = saleData.paymentMethod || 'cash';


      const res = await query(
        `INSERT INTO merchant_sales (
          id, merchant_id, shop_id, shop_name, bill_number, items,
          item_count, total_quantity, subtotal_amount, discount_total,
          total_amount, payment_method, customer_name, customer_phone,
          notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id,
                  merchant_id as "merchantId",
                  shop_id as "shopId",
                  shop_name as "shopName",
                  bill_number as "billNumber",
                  items,
                  item_count as "itemCount",
                  total_quantity as "totalQuantity",
                  subtotal_amount as "subtotalAmount",
                  discount_total as "discountTotal",
                  total_amount as "totalAmount",
                  payment_method as "paymentMethod",
                  customer_name as "customerName",
                  customer_phone as "customerPhone",
                  notes,
                  created_at as "createdAt"`,
        [
          id,
          saleData.merchantId,
          saleData.shopId,
          saleData.shopName,
          billNumber,
          JSON.stringify(saleData.items),
          saleData.itemCount,
          saleData.totalQuantity,
          saleData.subtotalAmount,
          saleData.discountTotal,
          saleData.totalAmount,
          paymentMethod,
          saleData.customerName || null,
          saleData.customerPhone || null,
          saleData.notes || null,
          now,
        ]
      );

      return {
        ...res.rows[0],
        totalQuantity: Number(res.rows[0].totalQuantity),
        subtotalAmount: Number(res.rows[0].subtotalAmount),
        discountTotal: Number(res.rows[0].discountTotal),
        totalAmount: Number(res.rows[0].totalAmount),
      };
  }

  public async getMerchantSales(
    shopIdentifier: string,
    dateStr?: string,
    merchantId?: string
  ): Promise<MerchantSale[]> {
const shopLower = (shopIdentifier || '').toLowerCase().trim();


      let queryText = `
        SELECT id,
               merchant_id as "merchantId",
               shop_id as "shopId",
               shop_name as "shopName",
               bill_number as "billNumber",
               items,
               item_count as "itemCount",
               total_quantity as "totalQuantity",
               subtotal_amount as "subtotalAmount",
               discount_total as "discountTotal",
               total_amount as "totalAmount",
               payment_method as "paymentMethod",
               customer_name as "customerName",
               customer_phone as "customerPhone",
               notes,
               created_at as "createdAt"
        FROM merchant_sales
        WHERE (LOWER(shop_name) = $1 OR shop_id = $1)
      `;
      const params: any[] = [shopLower];

      if (merchantId) {
        params.push(merchantId);
        queryText += ` AND merchant_id = $${params.length}`;
      }

      if (dateStr) {
        params.push(dateStr);
        queryText += ` AND DATE(created_at) = $${params.length}`;
      }

      queryText += ` ORDER BY created_at DESC`;

      const res = await query(queryText, params);
      return res.rows.map((row) => ({
        ...row,
        totalQuantity: Number(row.totalQuantity),
        subtotalAmount: Number(row.subtotalAmount),
        discountTotal: Number(row.discountTotal),
        totalAmount: Number(row.totalAmount),
      }));
  }

  public async getMerchantDailySummary(
    shopIdentifier: string,
    dateStr: string,
    merchantId?: string
  ): Promise<DailySalesSummary> {
    const sales = await this.getMerchantSales(shopIdentifier, dateStr, merchantId);

    const totalBills = sales.length;
    let totalQuantitySold = 0;
    let totalDiscountsGiven = 0;
    let totalSalesAmount = 0;
    const distinctProductIds = new Set<string>();

    for (const sale of sales) {
      totalQuantitySold += sale.totalQuantity || 0;
      totalDiscountsGiven += sale.discountTotal || 0;
      totalSalesAmount += sale.totalAmount || 0;
      if (Array.isArray(sale.items)) {
        for (const it of sale.items) {
          if (it.productId) distinctProductIds.add(it.productId);
        }
      }
    }

    return {
      date: dateStr,
      totalBills,
      totalProductsSold: distinctProductIds.size,
      totalQuantitySold: Math.round(totalQuantitySold * 100) / 100,
      totalDiscountsGiven: Math.round(totalDiscountsGiven * 100) / 100,
      totalSalesAmount: Math.round(totalSalesAmount * 100) / 100,
      sales,
    };
  }

  public async getMerchantSaleById(id: string): Promise<MerchantSale | null> {

      const res = await query(
        `SELECT id,
                merchant_id as "merchantId",
                shop_id as "shopId",
                shop_name as "shopName",
                bill_number as "billNumber",
                items,
                item_count as "itemCount",
                total_quantity as "totalQuantity",
                subtotal_amount as "subtotalAmount",
                discount_total as "discountTotal",
                total_amount as "totalAmount",
                payment_method as "paymentMethod",
                customer_name as "customerName",
                customer_phone as "customerPhone",
                notes,
                created_at as "createdAt"
         FROM merchant_sales
         WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      return {
        ...res.rows[0],
        totalQuantity: Number(res.rows[0].totalQuantity),
        subtotalAmount: Number(res.rows[0].subtotalAmount),
        discountTotal: Number(res.rows[0].discountTotal),
        totalAmount: Number(res.rows[0].totalAmount),
      };
  }

  public async deleteMerchantSale(
    id: string,
    merchantId?: string,
    shopIdentifier?: string
  ): Promise<boolean> {

      let queryText = `DELETE FROM merchant_sales WHERE id = $1`;
      const params: any[] = [id];

      if (merchantId) {
        params.push(merchantId);
        queryText += ` AND merchant_id = $${params.length}`;
      }
      if (shopIdentifier) {
        params.push(shopIdentifier.toLowerCase().trim());
        queryText += ` AND (shop_id = $${params.length} OR LOWER(shop_name) = $${params.length})`;
      }

      const res = await query(queryText, params);
      return (res.rowCount ?? 0) > 0;
  }

  public async getSubscriptionPlans(includeInactive = false): Promise<SubscriptionPlan[]> {

      let q = `SELECT id, name, duration_days as "durationDays", price_paise as "pricePaise", currency, description, features, badge, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM subscription_plans`;
      if (!includeInactive) {
        q += ` WHERE is_active = true`;
      }
      q += ` ORDER BY price_paise ASC`;
      const res = await query(q);
      return res.rows.map((r: any) => ({
        ...r,
        durationDays: Number(r.durationDays),
        pricePaise: Number(r.pricePaise),
        features: Array.isArray(r.features) ? r.features : typeof r.features === 'string' ? JSON.parse(r.features) : [],
      }));
  }

  public async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null> {

      const res = await query(
        `SELECT id, name, duration_days as "durationDays", price_paise as "pricePaise", currency, description, features, badge, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
         FROM subscription_plans WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        ...r,
        durationDays: Number(r.durationDays),
        pricePaise: Number(r.pricePaise),
        features: Array.isArray(r.features) ? r.features : typeof r.features === 'string' ? JSON.parse(r.features) : [],
      };
  }

  public async createSubscriptionPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
const id = data.id || `plan-${Date.now()}`;
const newPlan: SubscriptionPlan = {
      id,
      name: data.name || 'Custom Plan',
      durationDays: Number(data.durationDays) || 30,
      pricePaise: Number(data.pricePaise) || 0,
      currency: data.currency || 'INR',
      description: data.description || '',
      features: Array.isArray(data.features) ? data.features : [],
      badge: data.badge,
      isActive: data.isActive !== undefined ? !!data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


      await query(
        `INSERT INTO subscription_plans (id, name, duration_days, price_paise, currency, description, features, badge, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newPlan.id,
          newPlan.name,
          newPlan.durationDays,
          newPlan.pricePaise,
          newPlan.currency,
          newPlan.description,
          JSON.stringify(newPlan.features),
          newPlan.badge || null,
          newPlan.isActive,
          newPlan.createdAt,
          newPlan.updatedAt,
        ]
      );
      return newPlan;
  }

  public async updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {

      const existing = await this.getSubscriptionPlanById(id);
      if (!existing) return null;

      const merged: SubscriptionPlan = {
        ...existing,
        ...updates,
        durationDays: updates.durationDays !== undefined ? Number(updates.durationDays) : existing.durationDays,
        pricePaise: updates.pricePaise !== undefined ? Number(updates.pricePaise) : existing.pricePaise,
        features: updates.features !== undefined ? updates.features : existing.features,
        updatedAt: new Date().toISOString(),
      };

      await query(
        `UPDATE subscription_plans
         SET name = $1, duration_days = $2, price_paise = $3, currency = $4, description = $5, features = $6, badge = $7, is_active = $8, updated_at = $9
         WHERE id = $10`,
        [
          merged.name,
          merged.durationDays,
          merged.pricePaise,
          merged.currency,
          merged.description,
          JSON.stringify(merged.features),
          merged.badge || null,
          merged.isActive,
          merged.updatedAt,
          id,
        ]
      );
      return merged;
  }

  public async getMerchantActiveSubscription(merchantId: string): Promise<MerchantSubscription | null> {
    const now = new Date().toISOString();

    const res = await query(
      `SELECT ms.id, ms.merchant_id as "merchantId", ms.shop_id as "shopId", ms.plan_id as "planId",
              ms.status, ms.starts_at as "startsAt", ms.expires_at as "expiresAt",
              ms.auto_renew as "autoRenew", ms.cancelled_at as "cancelledAt", ms.cancel_reason as "cancelReason",
              ms.created_at as "createdAt", ms.updated_at as "updatedAt",
              sp.name as "planName", sp.duration_days as "planDurationDays", sp.price_paise as "planPricePaise",
              sp.currency as "planCurrency", sp.features as "planFeatures", sp.badge as "planBadge"
       FROM merchant_subscriptions ms
       LEFT JOIN subscription_plans sp ON sp.id = ms.plan_id
       WHERE ms.merchant_id = $1 AND ms.status = 'ACTIVE' AND ms.expires_at > $2
       ORDER BY 
         CASE WHEN ms.starts_at <= $2 THEN 0 ELSE 1 END ASC,
         ms.starts_at ASC,
         ms.created_at DESC
       LIMIT 1`,
      [merchantId, now]
    );

    if (res.rows.length === 0) {
      // Auto-mark expired any active subscriptions whose expires_at is past
      await query(
        `UPDATE merchant_subscriptions SET status = 'EXPIRED', updated_at = NOW()
         WHERE merchant_id = $1 AND status = 'ACTIVE' AND expires_at <= $2`,
        [merchantId, now]
      );
      return null;
    }

    const r = res.rows[0];
    const expires = new Date(r.expiresAt).getTime();
    const diffDays = Math.max(0, Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      ...r,
      daysRemaining: diffDays,
      plan: {
        id: r.planId,
        name: r.planName,
        durationDays: Number(r.planDurationDays),
        pricePaise: Number(r.planPricePaise),
        currency: r.planCurrency,
        description: '',
        features: Array.isArray(r.planFeatures) ? r.planFeatures : typeof r.planFeatures === 'string' ? JSON.parse(r.planFeatures) : [],
        badge: r.planBadge,
        isActive: true,
      },
    };
  }

  public async getMerchantSubscriptionHistory(merchantId: string): Promise<MerchantSubscription[]> {
    const res = await query(
      `SELECT ms.id, ms.merchant_id as "merchantId", ms.shop_id as "shopId", ms.plan_id as "planId",
              ms.status, ms.starts_at as "startsAt", ms.expires_at as "expiresAt",
              ms.auto_renew as "autoRenew", ms.cancelled_at as "cancelledAt", ms.cancel_reason as "cancelReason",
              ms.created_at as "createdAt", ms.updated_at as "updatedAt",
              sp.name as "planName", sp.price_paise as "planPricePaise", sp.duration_days as "planDurationDays"
       FROM merchant_subscriptions ms
       LEFT JOIN subscription_plans sp ON sp.id = ms.plan_id
       WHERE ms.merchant_id = $1
       ORDER BY ms.created_at DESC`,
      [merchantId]
    );

    return res.rows.map((r: any) => ({
      ...r,
      plan: {
        id: r.planId,
        name: r.planName,
        durationDays: Number(r.planDurationDays),
        pricePaise: Number(r.planPricePaise),
        currency: 'INR',
        description: '',
        features: [],
        isActive: true,
      },
    }));
  }

  public async getAllMerchantSubscriptions(): Promise<MerchantSubscription[]> {

      const res = await query(
        `SELECT ms.id, ms.merchant_id as "merchantId", ms.shop_id as "shopId", ms.plan_id as "planId",
                ms.status, ms.starts_at as "startsAt", ms.expires_at as "expiresAt",
                ms.auto_renew as "autoRenew", ms.cancelled_at as "cancelledAt", ms.cancel_reason as "cancelReason",
                ms.created_at as "createdAt", ms.updated_at as "updatedAt",
                u.name as "merchantName", u.email as "merchantEmail", u.shop_name as "shopName",
                sp.name as "planName", sp.price_paise as "planPricePaise", sp.duration_days as "planDurationDays"
         FROM merchant_subscriptions ms
         LEFT JOIN users u ON u.id = ms.merchant_id
         LEFT JOIN subscription_plans sp ON sp.id = ms.plan_id
         ORDER BY ms.created_at DESC`
      );

      return res.rows.map((r: any) => {
        const expires = new Date(r.expiresAt).getTime();
        const diffDays = Math.max(0, Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)));
        return {
          ...r,
          daysRemaining: r.status === 'ACTIVE' ? diffDays : 0,
          plan: {
            id: r.planId,
            name: r.planName,
            pricePaise: Number(r.planPricePaise),
            durationDays: Number(r.planDurationDays),
            currency: 'INR',
            description: '',
            features: [],
            isActive: true,
          },
        };
      });
  }

  public async createMerchantSubscription(data: {
    merchantId: string;
    shopId?: string;
    planId: string;
    durationDays: number;
  }): Promise<MerchantSubscription> {
    const activeSub = await this.getMerchantActiveSubscription(data.merchantId);
    const now = new Date();

    if (activeSub && new Date(activeSub.expiresAt) > now) {
      // If there is already an active subscription that hasn't expired, extend its expiration date
      // rather than creating disjoint future-dated subscriptions.
      const currentExpiry = new Date(activeSub.expiresAt);
      const newExpiresAt = new Date(currentExpiry.getTime() + data.durationDays * 24 * 60 * 60 * 1000);
      const updatedAt = new Date().toISOString();

      await query(
        `UPDATE merchant_subscriptions
         SET expires_at = $1, plan_id = $2, updated_at = $3
         WHERE id = $4`,
        [newExpiresAt.toISOString(), data.planId, updatedAt, activeSub.id]
      );

      return {
        ...activeSub,
        planId: data.planId,
        expiresAt: newExpiresAt.toISOString(),
        updatedAt,
      };
    }

    const startsAt = now;
    const expiresAt = new Date(startsAt.getTime() + data.durationDays * 24 * 60 * 60 * 1000);
    const id = `SUB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newSub: MerchantSubscription = {
      id,
      merchantId: data.merchantId,
      shopId: data.shopId,
      planId: data.planId,
      status: 'ACTIVE',
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await query(
      `INSERT INTO merchant_subscriptions (id, merchant_id, shop_id, plan_id, status, starts_at, expires_at, auto_renew, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newSub.id,
        newSub.merchantId,
        newSub.shopId || null,
        newSub.planId,
        newSub.status,
        newSub.startsAt,
        newSub.expiresAt,
        newSub.autoRenew,
        newSub.createdAt,
        newSub.updatedAt,
      ]
    );
    return newSub;
  }

  public async updateMerchantSubscriptionStatus(
    id: string,
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED',
    cancelReason?: string
  ): Promise<boolean> {
const now = new Date().toISOString();


      const res = await query(
        `UPDATE merchant_subscriptions
         SET status = $1, cancelled_at = $2, cancel_reason = $3, updated_at = $4
         WHERE id = $5`,
        [status, status === 'CANCELLED' ? now : null, cancelReason || null, now, id]
      );
      return (res.rowCount ?? 0) > 0;
  }

  public async extendMerchantSubscription(id: string, extraDays: number): Promise<MerchantSubscription | null> {

      const res = await query(
        `SELECT id, merchant_id as "merchantId", plan_id as "planId", expires_at as "expiresAt", status
         FROM merchant_subscriptions WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      const sub = res.rows[0];

      let baseDate = new Date(sub.expiresAt);
      if (baseDate < new Date()) {
        baseDate = new Date();
      }
      const newExpires = new Date(baseDate.getTime() + extraDays * 24 * 60 * 60 * 1000).toISOString();

      await query(
        `UPDATE merchant_subscriptions
         SET expires_at = $1, status = 'ACTIVE', updated_at = NOW()
         WHERE id = $2`,
        [newExpires, id]
      );

      return (await this.getAllMerchantSubscriptions()).find((s) => s.id === id) || null;
  }

  public async cancelMerchantSubscription(
    id: string,
    reason?: string
  ): Promise<boolean> {

      const res = await query(
        `UPDATE merchant_subscriptions
         SET status = 'CANCELLED',
             cancelled_at = NOW(),
             cancel_reason = $2,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id, reason || null]
      );
      return (res.rowCount ?? 0) > 0;
  }

  public async createSubscriptionPayment(data: {
    merchantId: string;
    planId: string;
    amountPaise: number;
    providerOrderId?: string;
    idempotencyKey: string;
    provider?: string;
  }): Promise<SubscriptionPayment> {
const id = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const newPayment: SubscriptionPayment = {
      id,
      merchantId: data.merchantId,
      planId: data.planId,
      amountPaise: data.amountPaise,
      currency: 'INR',
      provider: data.provider || 'razorpay',
      providerOrderId: data.providerOrderId,
      idempotencyKey: data.idempotencyKey,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };


      await query(
        `INSERT INTO subscription_payments (id, merchant_id, plan_id, amount_paise, currency, provider, provider_order_id, idempotency_key, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [
          newPayment.id,
          newPayment.merchantId,
          newPayment.planId,
          newPayment.amountPaise,
          newPayment.currency,
          newPayment.provider,
          newPayment.providerOrderId || null,
          newPayment.idempotencyKey,
          newPayment.status,
          newPayment.createdAt,
        ]
      );
      return newPayment;
  }

  public async updateSubscriptionPayment(
    idOrOrderId: string,
    updates: {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      providerPaymentId?: string;
      providerSignature?: string;
      subscriptionId?: string;
    }
  ): Promise<boolean> {
const now = new Date().toISOString();


      const res = await query(
        `UPDATE subscription_payments
         SET status = $1, provider_payment_id = COALESCE($2, provider_payment_id),
             provider_signature = COALESCE($3, provider_signature),
             subscription_id = COALESCE($4, subscription_id),
             completed_at = $5
         WHERE id = $6 OR provider_order_id = $6`,
        [
          updates.status,
          updates.providerPaymentId || null,
          updates.providerSignature || null,
          updates.subscriptionId || null,
          updates.status === 'SUCCESS' ? now : null,
          idOrOrderId,
        ]
      );
      return (res.rowCount ?? 0) > 0;
  }

  public async getAllSubscriptionPayments(): Promise<SubscriptionPayment[]> {

      const res = await query(
        `SELECT sp.id, sp.subscription_id as "subscriptionId", sp.merchant_id as "merchantId",
                sp.plan_id as "planId", sp.amount_paise as "amountPaise", sp.currency,
                sp.provider, sp.provider_order_id as "providerOrderId",
                sp.provider_payment_id as "providerPaymentId", sp.provider_signature as "providerSignature",
                sp.idempotency_key as "idempotencyKey", sp.status,
                sp.created_at as "createdAt", sp.completed_at as "completedAt",
                u.name as "merchantName", u.email as "merchantEmail",
                plan.name as "planName"
         FROM subscription_payments sp
         LEFT JOIN users u ON u.id = sp.merchant_id
         LEFT JOIN subscription_plans plan ON plan.id = sp.plan_id
         ORDER BY sp.created_at DESC`
      );
      return res.rows.map((r: any) => ({
        ...r,
        amountPaise: Number(r.amountPaise),
      }));
  }

  public async logAuditAction(data: {
    actorId: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: any;
  }): Promise<void> {
const id = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const now = new Date().toISOString();


      await query(
        `INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_type, entity_id, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, data.actorId, data.actorRole, data.action, data.entityType, data.entityId, JSON.stringify(data.metadata || {}), now]
      );
      return;
  }

  public async getAuditLogs(limit = 100): Promise<AuditLog[]> {

      const res = await query(
        `SELECT id, actor_id as "actorId", actor_role as "actorRole", action,
                entity_type as "entityType", entity_id as "entityId", metadata,
                created_at as "createdAt"
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );
      return res.rows.map((r: any) => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
      }));
  }

  public async getSubscriptionStats(): Promise<{
    activeCount: number;
    expiredCount: number;
    totalRevenuePaise: number;
    monthlyRecurringPaise: number;
  }> {

      const activeRes = await query(`SELECT COUNT(*) as count FROM merchant_subscriptions WHERE status = 'ACTIVE' AND expires_at > NOW()`);
      const expiredRes = await query(`SELECT COUNT(*) as count FROM merchant_subscriptions WHERE status = 'EXPIRED' OR (status = 'ACTIVE' AND expires_at <= NOW())`);
      const revenueRes = await query(`SELECT SUM(amount_paise) as total FROM subscription_payments WHERE status = 'SUCCESS'`);
      const mrrRes = await query(
        `SELECT SUM(sp.price_paise / (sp.duration_days / 30.0)) as mrr
         FROM merchant_subscriptions ms
         JOIN subscription_plans sp ON sp.id = ms.plan_id
         WHERE ms.status = 'ACTIVE' AND ms.expires_at > NOW()`
      );

      return {
        activeCount: Number(activeRes.rows[0]?.count || 0),
        expiredCount: Number(expiredRes.rows[0]?.count || 0),
        totalRevenuePaise: Number(revenueRes.rows[0]?.total || 0),
        monthlyRecurringPaise: Math.round(Number(mrrRes.rows[0]?.mrr || 0)),
      };
  }
}

export const db = new Database();
