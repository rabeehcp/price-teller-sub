import '../utils/dns-fallback';
import { Router, Request, Response } from 'express';
import { db, Location } from '../db';
import { query } from '../db/pool';
import { compareBasket, BasketRequestItem } from '../services/comparisonEngine';
import { calculateHyperlocalDistance } from '../services/locationService';
import { subscriptionService } from '../services/subscriptionService';
import { verifyGoogleIdToken } from '../services/googleAuthService';
import { getImageKitClient } from '../utils/imagekit';

export const apiRouter = Router();

// ==================== AUTHENTICATION & RBAC MIDDLEWARES ====================
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function extractAuthToken(req: Request): string {
  const rawHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
  if (typeof rawHeader === 'string' && rawHeader.trim()) {
    return rawHeader.replace(/^Bearer\s+/i, '').trim();
  }
  return '';
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: any) {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Token missing in Authorization header.' });
    }
    const user = await db.getUserByToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token. Please log in again.' });
    }
    const { password: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Authentication internal error' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`,
      });
    }
    next();
  };
}

export const requireAdmin = requireRole(['admin']);
export const requireMerchant = requireRole(['merchant', 'admin']);

// 1. Locations
apiRouter.get('/locations', async (req: Request, res: Response) => {
  try {
    const locations = await db.getLocations();
    res.json({ success: true, data: locations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Categories
apiRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Shops (verified only for consumers by default)
apiRouter.get('/shops', async (req: Request, res: Response) => {
  try {
    const { locationId, includeUnverified } = req.query;
    const shops = await db.getShops(locationId as string, includeUnverified === 'true');
    res.json({ success: true, data: shops });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. Admin: All shops (including unverified)
apiRouter.get('/admin/shops', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shops = await db.getAllShopsAdmin();
    res.json({ success: true, data: shops });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b-2. Admin: All Master Products (unfiltered catalog)
apiRouter.get('/admin/products', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await db.getProducts({
      locationId: 'all',
      includeUnverifiedShops: true,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b-3. Merchant Master Catalog (unfiltered catalog for verified merchants)
apiRouter.get('/merchant/master-catalog', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await db.getProducts({
      locationId: 'all',
      includeUnverifiedShops: true,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Merchant's own shop only; avoids exposing the admin shop list to merchant clients.
apiRouter.get('/merchant/shop', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const shops = await db.getAllShopsAdmin();
    let shop = shops.find((s) =>
      (user.shopId && s.id.toLowerCase() === String(user.shopId).toLowerCase()) ||
      (user.shopName && s.name.toLowerCase() === String(user.shopName).toLowerCase())
    );
    if (!shop && (user.shopName || user.shopId)) {
      const shopName = String(user.shopName || user.shopId).trim();
      shop = await db.addShop({
        name: shopName,
        locationId: 'tirur',
        address: 'Store Address',
        distanceKm: 1.0,
        rating: 4.8,
        reviewCount: 1,
        shopType: 'supermarket',
        openingHours: '8:00 AM - 10:00 PM',
        phone: user.phone || '',
        isVerified: true,
        deliveryFee: 30,
        freeDeliveryThreshold: 500,
        color: '#0B8F68',
        categories: [
          'vegetables', 'fruits', 'staples', 'dairy', 'bakery-breakfast',
          'household', 'oils-spices', 'fish', 'electronics', 'meats',
          'organic', 'utensils'
        ],
      });
      await query(`UPDATE users SET shop_id = $1, shop_name = $2 WHERE id = $3`, [shop.id, shop.name, user.id]);
    }
    if (!shop) return res.status(404).json({ success: false, error: 'Merchant shop not found' });
    res.json({ success: true, data: shop });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3c. Shop-Specific Price Catalogue
apiRouter.get('/shops/:id/catalogue', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { locationId } = req.query;
    const catalogue = await db.getShopCatalogue(id, locationId as string);
    if (!catalogue) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.json({ success: true, data: catalogue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Products list & search (only verified store prices for consumers by default, master catalog when requested)
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, locationId, includeUnverified, includeMaster } = req.query;
    const isMerchantOrAdmin = req.headers['x-view'] === 'merchant' || req.headers['x-view'] === 'admin';
    const products = await db.getProducts({
      category: category as string,
      search: search as string,
      locationId: locationId as string,
      includeUnverifiedShops: includeUnverified === 'true',
      includeMaster: includeMaster === 'true' || isMerchantOrAdmin,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to extract true image URL from common formats (Google search, Wikimedia, Wikipedia, Pinterest, etc.)
function cleanAndNormalizeImageUrl(rawUrl: string): string {
  let target = rawUrl.trim();
  // Strip duplicate concatenated URLs if present (e.g. https://pin.it/...https://pin.it/...)
  const doubleMatch = target.match(/(https?:\/\/[^\s]+?)(?:https?:\/\/|$)/i);
  if (doubleMatch && doubleMatch[1]) {
    target = doubleMatch[1].trim();
  }
  try {
    const parsed = new URL(target);
    // 1. Google Images redirect: ?imgurl=...
    if (parsed.hostname.includes('google.') && parsed.searchParams.has('imgurl')) {
      const extracted = parsed.searchParams.get('imgurl');
      if (extracted) return decodeURIComponent(extracted);
    }
    // 2. Wikimedia/Wikipedia File page -> Special:Redirect/file/
    // e.g. https://commons.wikimedia.org/wiki/File:Apple.jpg -> https://commons.wikimedia.org/wiki/Special:Redirect/file/Apple.jpg
    const wikiMatch = target.match(/https?:\/\/([a-z0-9.-]+\.wikimedia\.org|[a-z0-9.-]+\.wikipedia\.org)\/wiki\/File:([^#?]+)/i);
    if (wikiMatch) {
      const domain = wikiMatch[1];
      const filename = wikiMatch[2];
      return `https://${domain}/wiki/Special:Redirect/file/${filename}`;
    }
  } catch (e) {
    // not a valid standard URL
  }
  return target;
}

/** Basic SSRF guard: only allow http(s) and block obvious private/local hosts. */
function assertSafeRemoteImageUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid image URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https image URLs are allowed');
  }
  const host = parsed.hostname.toLowerCase();
  const blocked =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host === 'metadata.google.internal';
  if (blocked) {
    throw new Error('Private or local image hosts are not allowed');
  }
  return parsed.toString();
}

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  let targetUrl = assertSafeRemoteImageUrl(cleanAndNormalizeImageUrl(url));
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  let res = await fetch(targetUrl, {
    headers,
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch image: HTTP ${res.status} ${res.statusText}`);
  }

  let contentType = res.headers.get('content-type') || '';

  // If response is HTML (e.g. user pasted webpage link like Pinterest, Wikipedia article, blog, etc.), attempt to extract image
  if (contentType.includes('text/html')) {
    const htmlText = await res.text();
    // 1. Check for og:image, twitter:image, twitter:image:src
    const ogMatch =
      htmlText.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["']/i) ||
      htmlText.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i);

    // 2. Check for high-resolution pinimg link if Pinterest
    const pinMatch = htmlText.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|1200x)\/[a-f0-9/]+\.(?:jpg|png|webp)/i);

    const candidateUrl = ogMatch ? ogMatch[1] : (pinMatch ? pinMatch[0] : null);

    if (candidateUrl) {
      let resolvedOg = candidateUrl;
      if (resolvedOg.startsWith('//')) resolvedOg = 'https:' + resolvedOg;
      else if (resolvedOg.startsWith('/')) {
        const u = new URL(targetUrl);
        resolvedOg = u.origin + resolvedOg;
      }
      const imageHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': targetUrl,
      };
      res = await fetch(resolvedOg, { headers: imageHeaders, redirect: 'follow' });
      if (!res.ok) {
        throw new Error(`Failed to fetch extracted image: HTTP ${res.status} ${res.statusText}`);
      }
      contentType = res.headers.get('content-type') || 'image/jpeg';
    } else {
      throw new Error('Webpage did not contain an extractable image (og:image / pinimg)');
    }
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!contentType || contentType.includes('octet-stream') || !contentType.startsWith('image/')) {
    const cleanLower = targetUrl.toLowerCase();
    if (cleanLower.endsWith('.jpg') || cleanLower.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (cleanLower.endsWith('.png')) {
      contentType = 'image/png';
    } else if (cleanLower.endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (cleanLower.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (cleanLower.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else {
      contentType = 'image/jpeg';
    }
  }

  return { buffer, contentType: contentType || 'image/jpeg' };
}

// 4b. Fetch remote image (e.g. from Chrome, Wikimedia, Google, Unsplash)
apiRouter.post('/fetch-remote-image', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'url is required' });
    }

    const { buffer, contentType } = await fetchImageBuffer(url);
    const base64 = buffer.toString('base64');
    const mime = contentType.split(';')[0].trim() || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;
    const sizeKB = Math.round(buffer.length / 1024);

    res.json({
      success: true,
      dataUrl,
      contentType: mime,
      sizeKB,
    });
  } catch (err: any) {
    console.error('fetch-remote-image error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to download image from this URL' });
  }
});

// Proxy remote image to bypass CORS / hotlink restrictions
apiRouter.get('/proxy-image', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  try {
    if (!url) return res.status(400).send('Missing url param');
    const { buffer, contentType } = await fetchImageBuffer(url);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err: any) {
    console.warn(`[proxy-image] Remote image unavailable (${url}):`, err?.message || err);
    // Return SVG fallback placeholder on 404 to avoid browser network error logs
    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f1f5f9" rx="16"/><text x="50%" y="50%" font-size="36" text-anchor="middle" dominant-baseline="central">📦</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(svgFallback));
  }
});

// 4c. Upload compressed product image
apiRouter.post('/upload-product-image', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    const fs = await import('fs');
    const path = await import('path');

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Ensure custom directory exists in client/public
    let clientPublicDir = path.resolve(process.cwd(), 'client', 'public');
    if (!fs.existsSync(clientPublicDir)) {
      clientPublicDir = path.resolve(process.cwd(), '..', 'client', 'public');
    }
    const uploadDir = path.join(clientPublicDir, 'products', 'custom');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `custom-${Date.now()}-${Math.floor(Math.random() * 10000)}.webp`;

    // 1. Upload to ImageKit if configured
    const ik = getImageKitClient();
    if (ik) {
      try {
        const upRes = await ik.upload({
          file: buffer,
          fileName: filename,
          folder: '/priceteller-custom/',
          useUniqueFileName: true,
        });
        return res.json({ success: true, imageUrl: upRes.url, message: 'Image uploaded to ImageKit CDN successfully' });
      } catch (ikErr: any) {
        console.warn('[ImageKit] Cloud upload failed, falling back to local file storage:', ikErr?.message || ikErr);
      }
    }

    // 2. Fallback to local file storage
    const targetFile = path.join(uploadDir, filename);
    fs.writeFileSync(targetFile, buffer);

    const imageUrl = `/products/custom/${filename}`;
    res.json({ success: true, imageUrl, message: 'Image uploaded successfully' });
  } catch (err: any) {
    console.error('Error uploading product image:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to upload image' });
  }
});

// 4c. Create new product
apiRouter.post('/products', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, categoryId, emoji, image, defaultUnit, availableUnits, unitMultiplier, isOrganic, badge, nutritionalNote, prices, stockStatus } = req.body;
    if (!name || !categoryId || !prices) {
      return res.status(400).json({ success: false, error: 'Name, categoryId, and prices are required' });
    }

    const cleanPrices: Record<string, number> = {};
    const cleanStock: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock'> = {};

    if (prices && typeof prices === 'object') {
      for (const [sName, pVal] of Object.entries(prices)) {
        const num = Number(pVal);
        if (!Number.isFinite(num) || num <= 0) continue;
        const targetShop = req.user.role === 'merchant' ? req.user.shopName : sName;
        if (!targetShop) continue;
        cleanPrices[targetShop] = num;
        const requestedStock = stockStatus && stockStatus[sName];
        cleanStock[targetShop] = ['in_stock', 'low_stock', 'out_of_stock'].includes(requestedStock)
          ? requestedStock
          : 'in_stock';
      }
    }

    if (req.user.role === 'merchant' && Object.keys(cleanPrices).length === 0) {
      return res.status(400).json({ success: false, error: 'A valid positive price is required for your store.' });
    }

    const newProd = await db.addProduct({
      name,
      categoryId,
      emoji: emoji || '🛒',
      image: image ? String(image).trim() : undefined,
      defaultUnit: defaultUnit || '1 kg',
      availableUnits: availableUnits && availableUnits.length ? availableUnits : [defaultUnit || '1 kg'],
      unitMultiplier: unitMultiplier || { [defaultUnit || '1 kg']: 1 },
      isOrganic: Boolean(isOrganic),
      badge: badge || undefined,
      nutritionalNote: nutritionalNote || undefined,
      prices: cleanPrices,
      stockStatus: cleanStock,
    });

    res.json({ success: true, data: newProd, message: 'Product added successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4d. Clear all product images
apiRouter.post('/products/clear-all-images', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.clearAllProductImages();
    res.json({ success: true, message: 'All product images cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4d-2. Wipe all products, shops, users, transactions, and reports
apiRouter.post('/admin/wipe-all-data', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.wipeAllData();
    res.json({ success: true, message: 'All product, store, user, and transaction data purged successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4e. Update specific product image
apiRouter.patch('/products/:id/image', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    const updated = await db.updateProductImage(id, image ? String(image).trim() : null);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product image updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Product details
apiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { locationId, includeUnverified } = req.query;
    const product = await db.getProductById(
      id,
      includeUnverified === 'true',
      locationId as string
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Price history
apiRouter.get('/products/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await db.getPriceHistory(id);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Compare smart basket
apiRouter.post('/compare', async (req: Request, res: Response) => {
  try {
    const { items, locationId, consumerLat, consumerLng } = req.body as {
      items: BasketRequestItem[];
      locationId?: string;
      consumerLat?: number;
      consumerLng?: number;
    };
    const comparison = await compareBasket(items || [], locationId, consumerLat, consumerLng);
    res.json({ success: true, data: comparison });
  } catch (err: any) {
    console.error('Error comparing basket:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal comparison error' });
  }
});

// 8. Flash Deals (scoped to consumer hyperlocal region)
apiRouter.get('/deals', async (req: Request, res: Response) => {
  try {
    const { locationId, includeUnverified } = req.query;
    const deals = await db.getFlashDeals(locationId as string, includeUnverified === 'true');
    res.json({ success: true, data: deals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Community Price Reports (scoped to consumer hyperlocal region)
apiRouter.get('/prices/reports', async (req: Request, res: Response) => {
  try {
    const { productId, locationId, includeUnverified } = req.query;
    const reports = await db.getPriceReports(
      productId as string,
      locationId as string,
      includeUnverified === 'true'
    );
    res.json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Submit Price Report
apiRouter.post('/prices/report', async (req: Request, res: Response) => {
  try {
    const { productId, productName, shopId, shopName, locationId, reportedPrice, unit, reportedBy } = req.body;
    if (!productId || !shopName || !reportedPrice) {
      return res.status(400).json({ success: false, error: 'Missing required report fields' });
    }
    const report = await db.addPriceReport({
      productId,
      productName: productName || 'Product',
      shopId: shopId || 'custom',
      shopName,
      locationId: locationId || 'tirur',
      reportedPrice: Number(reportedPrice),
      unit: unit || '1 kg',
      reportedBy: reportedBy || 'Community Shopper',
    });
    res.json({ success: true, data: report, message: 'Price report submitted and verified!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Upvote / Downvote Price Report
apiRouter.post('/prices/vote', async (req: Request, res: Response) => {
  try {
    const { reportId, type } = req.body;
    if (!reportId || !['up', 'down'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid vote parameters' });
    }
    const result = await db.votePriceReport(reportId, type);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Merchant Update
apiRouter.put('/merchant/prices', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopName, updates } = req.body;
    if (!shopName || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: 'Invalid updates payload' });
    }
    const targetShop = req.user.role === 'merchant' ? (req.user.shopName || '') : shopName;
    if (!targetShop) {
      return res.status(400).json({ success: false, error: 'Merchant shop is not configured.' });
    }
    if (req.user.role === 'merchant') {
      const userShopName = (req.user.shopName || '').toLowerCase().trim();
      const userShopId = (req.user.shopId || '').toLowerCase().trim();
      const requestedShop = shopName.toLowerCase().trim();
      if (requestedShop !== userShopName && requestedShop !== userShopId) {
        return res.status(403).json({ success: false, error: 'Forbidden: You can only update prices for your own shop.' });
      }
    }
    const sanitizedUpdates = updates.map((u: any) => ({
      productId: String(u.productId || ''),
      price: Number(u.price),
      stockStatus: u.stockStatus,
    })).filter((u: any) =>
      u.productId && Number.isFinite(u.price) && u.price > 0 &&
      ['in_stock', 'low_stock', 'out_of_stock'].includes(u.stockStatus)
    );
    if (sanitizedUpdates.length !== updates.length) {
      return res.status(400).json({ success: false, error: 'Every update must contain a productId, positive finite price, and valid stockStatus.' });
    }
    await db.updateMerchantPrices(targetShop, sanitizedUpdates);
    res.json({ success: true, message: `Prices updated successfully for ${shopName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. System Stats
apiRouter.get('/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await db.getAdminStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Admin: Add Shop
apiRouter.post('/admin/shops', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      locationId,
      address,
      distanceKm,
      rating,
      reviewCount,
      shopType,
      openingHours,
      phone,
      isVerified,
      deliveryFee,
      freeDeliveryThreshold,
      color,
      email,
      username,
      password,
      managerName,
    } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, error: 'Shop name and address are required' });
    }
    const newShop = await db.addShop({
      name,
      locationId: locationId || 'tirur',
      address,
      distanceKm: Number(distanceKm) || 1.0,
      rating: Number(rating) || 4.5,
      reviewCount: Number(reviewCount) || 50,
      shopType: shopType || 'supermarket',
      openingHours: openingHours || '8:00 AM - 9:30 PM',
      phone: phone || '+91 98470 00000',
      isVerified: Boolean(isVerified ?? true),
      deliveryFee: Number(deliveryFee) || 30,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) || 500,
      color: color || '#249044',
    });

    // Automatically create / ensure merchant login account for this shop
    const merchantResult = await db.ensureMerchantUserForShop({
      shopId: newShop.id,
      shopName: newShop.name,
      email,
      username,
      password,
      name: managerName,
      phone: newShop.phone,
      locationId: newShop.locationId,
    });

    res.json({
      success: true,
      data: newShop,
      merchantAccount: {
        email: merchantResult.user.email,
        username: merchantResult.user.username,
        password: merchantResult.rawPassword,
        name: merchantResult.user.name,
      },
      message: `Store '${newShop.name}' and merchant login created successfully! Login: ${merchantResult.user.email} / ${merchantResult.rawPassword}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Admin: Update Shop
apiRouter.put('/admin/shops/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.updateShop(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.json({ success: true, data: updated, message: 'Store updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15a. Merchant: Update own shop profile
apiRouter.put('/merchant/shop', authenticateToken, requireRole(['merchant']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const shops = await db.getAllShopsAdmin();
    let shop = shops.find((candidate) =>
      (user.shopId && candidate.id.toLowerCase() === String(user.shopId).toLowerCase()) ||
      (user.shopName && candidate.name.toLowerCase() === String(user.shopName).toLowerCase()) ||
      (req.body.name && candidate.name.toLowerCase() === String(req.body.name).trim().toLowerCase())
    );

    const allowedFields = [
      'name', 'address', 'phone', 'shopType', 'openingHours', 'deliveryFee',
      'freeDeliveryThreshold', 'categories', 'lat', 'lng',
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );
    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({ success: false, error: 'Shop name cannot be empty' });
    }

    if (!shop) {
      // Upsert: auto-create shop record for this merchant if not found
      const shopName = String(updates.name || user.shopName || 'My Store').trim();
      shop = await db.addShop({
        name: shopName,
        locationId: req.body.locationId || user.locationId || 'tirur',
        address: updates.address || 'Store Address',
        distanceKm: 1.0,
        rating: 4.8,
        reviewCount: 1,
        shopType: (updates.shopType as any) || 'supermarket',
        openingHours: updates.openingHours || '8:00 AM - 10:00 PM',
        phone: updates.phone || user.phone || '',
        isVerified: true,
        deliveryFee: Number(updates.deliveryFee) || 30,
        freeDeliveryThreshold: Number(updates.freeDeliveryThreshold) || 500,
        color: '#0B8F68',
        categories: Array.isArray(updates.categories) ? updates.categories : ['vegetables', 'fruits', 'staples', 'dairy'],
        lat: updates.lat !== undefined ? updates.lat : null,
        lng: updates.lng !== undefined ? updates.lng : null,
      });

      await query(`UPDATE users SET shop_id = $1, shop_name = $2 WHERE id = $3`, [shop.id, shop.name, user.id]);
      return res.json({ success: true, data: shop, message: 'Shop profile created and saved successfully!' });
    }

    const updated = await db.updateShop(shop.id, updates);
    if (!updated) return res.status(404).json({ success: false, error: 'Shop not found' });

    if (updates.name && updates.name !== user.shopName) {
      await query(`UPDATE users SET shop_name = $1 WHERE id = $2`, [updates.name, user.id]);
    }

    res.json({ success: true, data: updated, message: 'Shop profile updated successfully!' });
  } catch (err: any) {
    console.error('Error updating merchant shop profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15b. Admin: Delete Shop
apiRouter.delete('/admin/shops/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteShop(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.json({ success: true, message: 'Store removed successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Admin: Update Master Product
apiRouter.put('/admin/products/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: updated, message: 'Product updated in master catalog' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16b. Admin: Delete Product
apiRouter.delete('/admin/products/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted from master catalog' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. Admin: Add Location
apiRouter.post('/admin/locations', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subArea, state, country, currency, currencySymbol, lat, lng } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Location name is required' });
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `loc-${Date.now()}`;
    const newLoc = await db.addLocation({
      id,
      name,
      subArea: subArea || 'Central District',
      state: state || 'Kerala',
      country: country || 'India',
      currency: currency || 'INR',
      currencySymbol: currencySymbol || '₹',
      lat: Number(lat) || 10.9,
      lng: Number(lng) || 75.9,
    });
    res.json({ success: true, data: newLoc, message: 'Location added successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. Admin: Moderate Price Report
apiRouter.post('/admin/reports/:id/moderate', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject' });
    }
    const result = await db.moderatePriceReport(id, action);
    if (!result) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: result, message: `Report ${action}d successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. Merchant / Admin: Create Flash Deal
apiRouter.post('/merchant/deals', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId: reqShopId, shopName: reqShopName, productId, productName, emoji, originalPrice, dealPrice, unit, expiresInMinutes, tag } = req.body;
    const shopId = req.user.role === 'merchant' ? (req.user.shopId || reqShopId || 'custom') : (reqShopId || 'custom');
    const shopName = req.user.role === 'merchant' ? (req.user.shopName || reqShopName) : reqShopName;

    if (!shopName || !productId || !dealPrice) {
      return res.status(400).json({ success: false, error: 'Missing required flash deal fields' });
    }
    const orig = Number(originalPrice) || Number(dealPrice) * 1.2;
    const dp = Number(dealPrice);
    const discountPct = Math.round(((orig - dp) / orig) * 100);

    const deal = await db.createFlashDeal({
      shopId: shopId || 'custom',
      shopName,
      productId,
      productName: productName || 'Deal Item',
      emoji: emoji || '🔥',
      originalPrice: orig,
      dealPrice: dp,
      discountPercentage: discountPct > 0 ? discountPct : 10,
      unit: unit || '1 kg',
      expiresInMinutes: Number(expiresInMinutes) || 180,
      tag: tag || 'Flash Deal',
    });
    res.json({ success: true, data: deal, message: 'Flash deal broadcasted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19b. Merchant: Delist Item from Store Catalog
apiRouter.post('/merchant/products/:id/delist', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const shopName = req.user.role === 'merchant' ? (req.user.shopName || req.body.shopName) : req.body.shopName;
    if (!shopName) {
      return res.status(400).json({ success: false, error: 'Shop name is required' });
    }
    const ok = await db.delistMerchantProduct(shopName, id);
    if (!ok) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: `Product successfully removed from ${shopName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19c. Merchant: Re-list / Add Item to Store Catalog
apiRouter.post('/merchant/products/:id/relist', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    const shopName = req.user.role === 'merchant' ? (req.user.shopName || req.body.shopName) : req.body.shopName;
    if (!shopName) {
      return res.status(400).json({ success: false, error: 'Shop name is required' });
    }
    const ok = await db.relistMerchantProduct(shopName, id, price ? Number(price) : undefined);
    if (!ok) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: `Product restored to ${shopName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. Auth: Universal / Role-Enforced Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, username, password, expectedRole } = req.body;
    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required' });
    }
    const result = await db.authenticateUser(identifier, password, expectedRole);
    if (result.error || !result.user) {
      const statusCode = result.roleMismatch ? 403 : 401;
      return res.status(statusCode).json({
        success: false,
        error: result.error || 'Invalid credentials. Please check your credentials.',
        roleMismatch: !!result.roleMismatch,
        actualRole: result.actualRole,
      });
    }

    const { password: _, ...safeUser } = result.user;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      message: `Welcome back, ${safeUser.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20b. Auth: Google Identity Services (GIS) & OAuth2 Sign-In & Verification
apiRouter.post('/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential, idToken, accessToken, role, expectedRole } = req.body;
    const token = credential || idToken;

    let verifiedGoogleUser: {
      googleId: string;
      email: string;
      name: string;
      picture?: string;
      givenName?: string;
      familyName?: string;
    };

    if (accessToken && !token) {
      // Validate Google access token directly with Google userinfo API
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken.trim()}` },
      });
      if (!googleRes.ok) {
        throw new Error(`Google userinfo validation failed with status ${googleRes.status}`);
      }
      const data: any = await googleRes.json();
      if (!data.sub || !data.email) {
        throw new Error('Google account verification failed: missing sub or email');
      }
      verifiedGoogleUser = {
        googleId: data.sub,
        email: data.email.toLowerCase().trim(),
        name: data.name || data.email.split('@')[0],
        picture: data.picture,
        givenName: data.given_name,
        familyName: data.family_name,
      };
    } else {
      if (!token) {
        return res.status(400).json({ success: false, error: 'Google ID token credential or access token is required' });
      }
      // Strictly verify token with Google Identity Services backend
      verifiedGoogleUser = await verifyGoogleIdToken(token);
    }

    // Locate or create user in database safely
    const targetRole = expectedRole || role || 'consumer';
    const result = await db.authenticateOrRegisterGoogleUser({
      googleId: verifiedGoogleUser.googleId,
      email: verifiedGoogleUser.email,
      name: verifiedGoogleUser.name,
      picture: verifiedGoogleUser.picture,
      expectedRole: targetRole,
    });

    if (result.error || !result.user) {
      const statusCode = result.roleMismatch ? 403 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error || 'Google authentication failed',
        roleMismatch: !!result.roleMismatch,
        actualRole: result.actualRole,
      });
    }

    const { password: _, ...safeUser } = result.user;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      isNewUser: !!result.isNewUser,
      message: result.isNewUser
        ? `Welcome to PriceTeller, ${safeUser.name}!`
        : `Welcome back, ${safeUser.name}!`,
    });
  } catch (err: any) {
    console.error('Google Auth backend verification error:', err);
    res.status(401).json({
      success: false,
      error: `Google verification failed: ${err.message || 'Invalid token'}`,
    });
  }
});

// Dedicated Admin Login Endpoint
apiRouter.post('/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Admin username and password are required' });
    }
    const result = await db.authenticateUser(identifier, password, 'admin');
    if (result.error || !result.user) {
      return res.status(result.roleMismatch ? 403 : 401).json({
        success: false,
        error: result.error || 'Invalid admin credentials.',
        roleMismatch: !!result.roleMismatch,
        actualRole: result.actualRole,
      });
    }
    const { password: _, ...safeUser } = result.user;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      message: `Welcome to PriceTeller Admin Control Center, ${safeUser.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dedicated Consumer Login Endpoint
apiRouter.post('/auth/consumer/login', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const result = await db.authenticateUser(identifier, password, 'consumer');
    if (result.error || !result.user) {
      return res.status(result.roleMismatch ? 403 : 401).json({
        success: false,
        error: result.error,
        roleMismatch: !!result.roleMismatch,
        actualRole: result.actualRole,
      });
    }
    const { password: _, ...safeUser } = result.user;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      message: `Welcome back, ${safeUser.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dedicated Merchant Login Endpoint
apiRouter.post('/auth/merchant/login', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const result = await db.authenticateUser(identifier, password, 'merchant');
    if (result.error || !result.user) {
      return res.status(result.roleMismatch ? 403 : 401).json({
        success: false,
        error: result.error,
        roleMismatch: !!result.roleMismatch,
        actualRole: result.actualRole,
      });
    }
    const { password: _, ...safeUser } = result.user;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      message: `Welcome back, ${safeUser.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. Auth: Register Merchant
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, shopName, locationId, address, shopType, categories } = req.body;
    if (!email || !password || !shopName) {
      return res.status(400).json({ success: false, error: 'Email, password, and shop name are required' });
    }
    const newUser = await db.registerMerchant({
      name: name || `${shopName} Manager`,
      email,
      password,
      phone,
      shopName,
      locationId,
      address,
      shopType,
      categories: Array.isArray(categories) ? categories : undefined,
    });
    const { password: _, ...safeUser } = newUser;
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      message: `Store '${shopName}' registered successfully! Welcome to PriceTeller Partner Network.`,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// 22. Auth: Get Current User Profile
apiRouter.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const token = extractAuthToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token missing' });
    }
    const user = await db.getUserByToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 22b. Auth: Logout (Invalidate session token)
apiRouter.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    const token = extractAuthToken(req);
    if (token) {
      await db.logoutUser(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 23. Auth: Quick Merchant Accounts for easy demo
apiRouter.get('/auth/quick-merchants', async (req: Request, res: Response) => {
  try {
    const merchants = await db.getQuickMerchants();
    res.json({ success: true, data: merchants });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 24. Auth: Quick Consumer Accounts for easy testing
apiRouter.get('/auth/quick-consumers', async (req: Request, res: Response) => {
  try {
    const consumers = await db.getQuickConsumers();
    res.json({ success: true, data: consumers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 25. Auth: Register Consumer
apiRouter.post('/auth/consumer/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, locationId } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Full name, email, and password are required' });
    }
    const newUser = await db.registerConsumer({
      name,
      email,
      password,
      phone,
      locationId: locationId || 'tirur',
    });
    const { password: _, ...safeUser } = newUser;
    const consumerData = await db.getConsumerData(newUser.id);
    res.json({
      success: true,
      user: safeUser,
      token: safeUser.token,
      consumerData,
      message: `Account created for ${safeUser.name}! Welcome to PriceTeller.`,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Consumer registration failed' });
  }
});

// 26. Consumer: Get All Stored Data (Basket, Saved Lists, Favorites, Trip History)
apiRouter.get('/consumer/data', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await db.getConsumerData(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 27. Consumer: Sync / Update Active Basket
apiRouter.post('/consumer/basket', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { basket } = req.body;
    const updatedData = await db.updateConsumerBasket(userId, basket || []);
    res.json({ success: true, data: updatedData.basket, message: 'Basket synced to account' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 28. Consumer: Create New Named Saved List
apiRouter.post('/consumer/saved-lists', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, items } = req.body;
    if (!name || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'List name and at least one item are required' });
    }

    const savedList = await db.saveConsumerList(userId, name, items);
    res.json({ success: true, data: savedList, message: `List '${name}' saved successfully!` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 29. Consumer: Delete Saved List
apiRouter.delete('/consumer/saved-lists/:listId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const success = await db.deleteConsumerList(userId, listId);
    res.json({ success, message: success ? 'List removed' : 'List not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 30. Consumer: Toggle Favorite Product
apiRouter.post('/consumer/favorites', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    const result = await db.toggleConsumerFavorite(userId, productId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 31. Consumer: Record Completed Shopping Trip
apiRouter.post('/consumer/trip-history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { shopName, shopId, locationName, totalAmount, totalSavings, itemCount, itemsSummary } = req.body;
    const trip = await db.addConsumerTripHistory(userId, {
      shopName: shopName || 'Local Supermarket',
      shopId,
      locationName,
      totalAmount: Number(totalAmount) || 0,
      totalSavings: Number(totalSavings) || 0,
      itemCount: Number(itemCount) || 1,
      itemsSummary: itemsSummary || '',
    });

    res.json({ success: true, data: trip, message: 'Trip history recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 32. Conversations: List conversations for authenticated user (Consumer or Merchant)
apiRouter.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    let conversations = [];
    if (user.role === 'admin') {
      conversations = await db.getAllConversationsAdmin();
    } else if (user.role === 'merchant') {
      const shopIdentifier = user.shopId || user.shopName || '';
      conversations = await db.getConversationsForMerchant(shopIdentifier);
    } else {
      // Consumer or default shopper
      conversations = await db.getConversationsForConsumer(user.id);
    }

    res.json({ success: true, data: conversations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 33. Conversations: Create a new conversation (with attached basket snapshot)
apiRouter.post('/conversations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { shopId, shopName, basketSnapshot, initialMessage } = req.body;
    if (!shopName) {
      return res.status(400).json({ success: false, error: 'Shop name is required to start a conversation' });
    }

    const result = await db.createConversation({
      consumerId: user.id,
      consumerName: user.name,
      shopId: shopId || 'custom',
      shopName,
      basketSnapshot: basketSnapshot || {
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        estimatedTotal: 0,
        shopName,
        createdAt: new Date().toISOString(),
      },
      initialMessage,
    });

    res.json({
      success: true,
      data: result.conversation,
      initialMessage: result.initialMessage,
      message: 'Conversation initiated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper function to check conversation access permission
function canAccessConversation(user: any, conversation: any): boolean {
  if (!user || !conversation) return false;
  if (user.role === 'admin') return true;
  if (user.id === conversation.consumerId) return true;
  if (user.role === 'merchant') {
    const userShopName = (user.shopName || '').toLowerCase().trim();
    const convShopName = (conversation.shopName || '').toLowerCase().trim();
    if (user.shopId && conversation.shopId && user.shopId === conversation.shopId) return true;
    if (userShopName && convShopName && userShopName === convShopName) return true;
  }
  return false;
}

// 34. Conversations: Get Messages for a specific conversation
apiRouter.get('/conversations/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { id } = req.params;
    const conversation = await db.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Strict Role-based Access Control verification
    if (!canAccessConversation(user, conversation)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to view this conversation.',
      });
    }

    const messages = await db.getConversationMessages(id);
    res.json({
      success: true,
      data: messages,
      conversation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 35. Conversations: Send a two-way message in a conversation
apiRouter.post('/conversations/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { id } = req.params;
    const { text, basketSnapshot, clientMsgId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text cannot be empty' });
    }

    const conversation = await db.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Strict Role-based Access Control verification
    if (!canAccessConversation(user, conversation)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to post in this conversation.',
      });
    }

    const message = await db.addChatMessage(
      id,
      user.id,
      user.role,
      user.name,
      text.trim(),
      basketSnapshot,
      clientMsgId
    );
    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 36. Conversations: Mark all unread messages as read
apiRouter.post('/conversations/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { id } = req.params;
    const conversation = await db.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!canAccessConversation(user, conversation)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to access this conversation.',
      });
    }

    await db.markConversationRead(id, user.role);
    res.json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 37. Conversations: Update attached basket snapshot
apiRouter.put('/conversations/:id/basket', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { id } = req.params;
    const { basketSnapshot } = req.body;
    if (!basketSnapshot) {
      return res.status(400).json({ success: false, error: 'basketSnapshot is required' });
    }

    const conversation = await db.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!canAccessConversation(user, conversation)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to modify this conversation.',
      });
    }

    const updated = await db.updateConversationBasket(id, basketSnapshot);
    res.json({
      success: true,
      data: updated,
      message: 'Basket snapshot updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper function to check pre-booking access permission
function canAccessPreBooking(user: any, booking: any): boolean {
  if (user.role === 'admin') return true;
  if (user.id === booking.consumerId) return true;
  if (user.role === 'merchant') {
    const userShopName = (user.shopName || '').toLowerCase().trim();
    const bookingShopName = (booking.shopName || '').toLowerCase().trim();
    if (user.shopId && booking.shopId && user.shopId === booking.shopId) return true;
    if (userShopName && bookingShopName && userShopName === bookingShopName) return true;
  }
  return false;
}

// 37. Pre-Bookings: Create a new basket pre-booking
apiRouter.post('/pre-bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'consumer' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only authenticated consumers can create pre-bookings.' });
    }

    const {
      shopId,
      shopName,
      items,
      itemCount,
      totalQuantity,
      totalAmount,
      pickupTime,
      notes,
      consumerPhone,
      consumerEmail,
    } = req.body;

    if (!shopName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Shop name and at least one basket item are required for pre-booking.',
      });
    }

    const booking = await db.createPreBooking({
      consumerId: user.id,
      consumerName: user.name,
      consumerPhone: consumerPhone || user.phone || '',
      consumerEmail: consumerEmail || user.email || '',
      shopId: shopId || 'custom',
      shopName,
      items,
      itemCount: Number(itemCount) || items.length,
      totalQuantity: Number(totalQuantity) || items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
      totalAmount: Number(totalAmount) || items.reduce((acc: number, it: any) => acc + (it.lineTotal || 0), 0),
      pickupTime,
      notes,
    });

    res.json({
      success: true,
      data: booking,
      message: 'Basket pre-booked successfully! The merchant has received your request.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 38. Pre-Bookings: List pre-bookings for current authenticated user
apiRouter.get('/pre-bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    let bookings = [];
    if (user.role === 'admin') {
      bookings = await db.getAllPreBookingsAdmin();
    } else if (user.role === 'merchant') {
      const shopIdentifier = user.shopId || user.shopName || '';
      bookings = await db.getPreBookingsForMerchant(shopIdentifier);
    } else {
      bookings = await db.getPreBookingsForConsumer(user.id);
    }

    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 39. Pre-Bookings: Get single pre-booking details
apiRouter.get('/pre-bookings/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    const { id } = req.params;
    const booking = await db.getPreBookingById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Pre-booking not found' });
    }

    if (!canAccessPreBooking(user, booking)) {
      return res.status(403).json({ success: false, error: 'Access denied: You are not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 40. Pre-Bookings: Update pre-booking status (Approve, Reject, Complete, Cancel)
const handleUpdatePreBookingStatus = async (req: Request, res: Response) => {
  try {
    const user = await db.getUserByToken(extractAuthToken(req));
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
    }

    const { id } = req.params;
    const { status, merchantNote } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await db.getPreBookingById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Pre-booking not found' });
    }

    // Role-based status authorization:
    // Consumer can only cancel if pending
    if (user.role === 'consumer') {
      if (user.id !== booking.consumerId) {
        return res.status(403).json({ success: false, error: 'Access denied: Not your booking.' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, error: 'Consumers can only cancel their pending bookings.' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, error: `Cannot cancel booking with current status: ${booking.status}` });
      }
    } else if (user.role === 'merchant') {
      const userShopName = (user.shopName || '').toLowerCase().trim();
      const bookingShopName = (booking.shopName || '').toLowerCase().trim();
      const isOwnerShop = (user.shopId && user.shopId === booking.shopId) || (userShopName === bookingShopName);
      if (!isOwnerShop) {
        return res.status(403).json({ success: false, error: 'Access denied: You do not own the shop for this booking.' });
      }
    }

    const updated = await db.updatePreBookingStatus(id, status, merchantNote);
    res.json({
      success: true,
      data: updated,
      message: `Pre-booking status updated to ${status}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.patch('/pre-bookings/:id/status', handleUpdatePreBookingStatus);
apiRouter.put('/pre-bookings/:id/status', handleUpdatePreBookingStatus);

// 41. Hyperlocal Distance Calculation Endpoint
apiRouter.get('/hyperlocal/distance', async (req: Request, res: Response) => {
  try {
    const { consumerLat, consumerLng, locationId, shopId, shopName } = req.query;
    const [locations, shops] = await Promise.all([db.getLocations(), db.getShops()]);

    let shop = null;
    if (shopId) {
      shop = shops.find((s) => s.id === shopId);
    } else if (shopName) {
      shop = shops.find((s) => s.name.toLowerCase() === (shopName as string).toLowerCase());
    }

    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }

    let consumerLoc: Location | { lat: number; lng: number; name?: string } | null = null;
    if (consumerLat && consumerLng) {
      consumerLoc = { lat: Number(consumerLat), lng: Number(consumerLng), name: 'GPS Location' };
    } else if (locationId) {
      consumerLoc = locations.find((l) => l.id === locationId) || null;
    } else {
      consumerLoc = locations[0] || null;
    }

    const distanceData = calculateHyperlocalDistance(consumerLoc, shop, locations);
    res.json({
      success: true,
      data: {
        consumerLocation: distanceData.consumerLocationName,
        shop: shop.name,
        shopLocation: distanceData.shopLocationName,
        distanceKm: distanceData.distanceKm,
        formatted: `${distanceData.distanceKm} km`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 42. MERCHANT BILLING & SALES ENDPOINTS ====================

// 42a. Create Completed Sale / Bill
apiRouter.post('/merchant/sales', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const {
      shopId: reqShopId,
      shopName: reqShopName,
      items,
      itemCount,
      totalQuantity,
      subtotalAmount,
      discountTotal,
      totalAmount,
      paymentMethod,
      customerName,
      customerPhone,
      notes,
    } = req.body;

    const shopId = user.role === 'merchant' ? (user.shopId || user.shopName || 'my_shop') : (reqShopId || user.shopId || 'my_shop');
    const shopName = user.role === 'merchant' ? (user.shopName || 'My Supermarket') : (reqShopName || user.shopName || 'Supermarket');

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one line item is required to generate a bill.',
      });
    }

    // Sanitize and calculate totals accurately
    let computedSubtotal = 0;
    let computedDiscount = 0;
    let computedTotalQty = 0;

    const sanitizedItems = items.map((it: any) => {
      const qty = Math.max(0.01, Number(it.quantity) || 1);
      const originalUnitPrice = Math.max(0, Number(it.originalUnitPrice) || 0);
      const discountPerUnit = Math.max(0, Number(it.discountAmountPerUnit) || 0);
      const finalUnitPrice = Math.max(0, originalUnitPrice - discountPerUnit);
      const lineTotal = Math.round(finalUnitPrice * qty * 100) / 100;

      computedSubtotal += originalUnitPrice * qty;
      computedDiscount += discountPerUnit * qty;
      computedTotalQty += qty;

      return {
        productId: it.productId || 'custom',
        productName: it.productName || 'Item',
        emoji: it.emoji || '📦',
        quantity: qty,
        unit: it.unit || 'unit',
        originalUnitPrice,
        discountAmountPerUnit: discountPerUnit,
        finalUnitPrice,
        lineTotal,
      };
    });

    computedSubtotal = Math.round(computedSubtotal * 100) / 100;
    computedDiscount = Math.round(computedDiscount * 100) / 100;
    const computedFinalTotal = Math.max(0, Math.round((computedSubtotal - computedDiscount) * 100) / 100);

    const sale = await db.createMerchantSale({
      merchantId: user.id,
      shopId,
      shopName,
      items: sanitizedItems,
      itemCount: sanitizedItems.length,
      totalQuantity: Number(totalQuantity) || computedTotalQty,
      subtotalAmount: Number(subtotalAmount) || computedSubtotal,
      discountTotal: Number(discountTotal) || computedDiscount,
      totalAmount: Number(totalAmount) || computedFinalTotal,
      paymentMethod: paymentMethod || 'cash',
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: notes || undefined,
    });

    res.json({
      success: true,
      data: sale,
      message: `Bill #${sale.billNumber} created and recorded successfully!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 42b. List Sales for Merchant Shop (filter by date)
apiRouter.get('/merchant/sales', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { date, shopId: queryShopId } = req.query;
    const shopIdentifier = user.role === 'merchant' ? (user.shopId || user.shopName || '') : (queryShopId as string || user.shopId || user.shopName || '');

    const sales = await db.getMerchantSales(
      shopIdentifier,
      date ? (date as string) : undefined,
      user.role === 'merchant' ? user.id : undefined
    );

    res.json({ success: true, data: sales });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 42c. Get Daily Summary for Merchant Shop
apiRouter.get('/merchant/sales/summary', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { date, shopId: queryShopId } = req.query;
    const targetDate = (date as string) || new Date().toISOString().substring(0, 10);
    const shopIdentifier = user.role === 'merchant' ? (user.shopId || user.shopName || '') : (queryShopId as string || user.shopId || user.shopName || '');

    const summary = await db.getMerchantDailySummary(
      shopIdentifier,
      targetDate,
      user.role === 'merchant' ? user.id : undefined
    );

    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 42d. Get Single Sale by ID
apiRouter.get('/merchant/sales/:id', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const sale = await db.getMerchantSaleById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale record not found' });
    }

    if (user.role === 'merchant') {
      const userShop = (user.shopName || '').toLowerCase().trim();
      const saleShop = (sale.shopName || '').toLowerCase().trim();
      const owns = user.id === sale.merchantId || (user.shopId && user.shopId === sale.shopId) || userShop === saleShop;
      if (!owns) {
        return res.status(403).json({ success: false, error: 'Access denied: Not your store sale record' });
      }
    }

    res.json({ success: true, data: sale });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/merchant/sales/:id', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const sale = await db.getMerchantSaleById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale record not found' });
    }

    if (user.role === 'merchant') {
      const userShop = (user.shopName || '').toLowerCase().trim();
      const saleShop = (sale.shopName || '').toLowerCase().trim();
      const owns = user.id === sale.merchantId || (user.shopId && user.shopId === sale.shopId) || userShop === saleShop;
      if (!owns) {
        return res.status(403).json({ success: false, error: 'Access denied: Not your store sale record' });
      }
    }

    const deleted = await db.deleteMerchantSale(
      id,
      user.role === 'admin' ? undefined : user.id,
      user.role === 'admin' ? undefined : (user.shopId || user.shopName)
    );

    if (deleted) {
      res.json({ success: true, message: `Bill #${sale.billNumber} deleted successfully` });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete sale record' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SUBSCRIPTION & MONETIZATION ENDPOINTS
// ==========================================

// 1. Get all public active subscription plans
apiRouter.get('/subscription/plans', async (req: Request, res: Response) => {
  try {
    const plans = await db.getSubscriptionPlans(false);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin: Get all subscription plans (active + inactive)
apiRouter.get('/subscription/admin/plans', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await db.getSubscriptionPlans(true);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin: Create a new subscription plan
apiRouter.post('/subscription/plans', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { name, durationDays, pricePaise, currency, description, features, badge, isActive } = req.body;
    if (!name || durationDays === undefined || pricePaise === undefined) {
      return res.status(400).json({ success: false, error: 'Name, durationDays, and pricePaise are required' });
    }

    const newPlan = await db.createSubscriptionPlan({
      name,
      durationDays: Number(durationDays),
      pricePaise: Number(pricePaise),
      currency: currency || 'INR',
      description: description || '',
      features: Array.isArray(features) ? features : [],
      badge: badge || undefined,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    await db.logAuditAction({
      actorId: user.id,
      actorRole: 'admin',
      action: 'PLAN_CREATED',
      entityType: 'subscription_plan',
      entityId: newPlan.id,
      metadata: { planName: newPlan.name, pricePaise: newPlan.pricePaise },
    });

    res.json({ success: true, data: newPlan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Admin: Update subscription plan
apiRouter.put('/subscription/plans/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const updated = await db.updateSubscriptionPlan(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Subscription plan not found' });
    }

    await db.logAuditAction({
      actorId: user.id,
      actorRole: 'admin',
      action: 'PLAN_UPDATED',
      entityType: 'subscription_plan',
      entityId: id,
      metadata: req.body,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Merchant: Get active subscription status
apiRouter.get('/subscription/merchant/status', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const status = await subscriptionService.getMerchantSubscriptionStatus(
      user.id,
      user.name,
      user.shopName
    );

    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Merchant: Get subscription history
apiRouter.get('/subscription/merchant/history', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const history = await db.getMerchantSubscriptionHistory(user.id);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Merchant: Initialize checkout / Create UPI QR Order
apiRouter.post('/subscription/checkout', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { planId, idempotencyKey } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required for checkout' });
    }

    const order = await subscriptionService.createSubscriptionOrder({
      merchantId: user.id,
      planId,
      idempotencyKey,
    });

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Merchant: Verify payment & activate plan (Supports direct UPI confirmation)
apiRouter.post('/subscription/verify-payment', authenticateToken, requireMerchant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { orderId, paymentId, signature, upiRefId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    const result = await subscriptionService.verifyPaymentAndActivate({
      merchantId: user.id,
      orderId,
      paymentId,
      signature,
      upiRefId,
      actorRole: user.role,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Admin: Get all merchant subscriptions
apiRouter.get('/subscription/admin/subscriptions', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscriptions = await db.getAllMerchantSubscriptions();
    res.json({ success: true, data: subscriptions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Admin: Extend merchant subscription
apiRouter.post('/subscription/admin/subscriptions/:id/extend', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { extraDays, reason } = req.body;

    const days = parseInt(extraDays, 10);
    if (isNaN(days) || days <= 0) {
      return res.status(400).json({ success: false, error: 'extraDays must be a positive number' });
    }

    const updated = await subscriptionService.manualExtendSubscription({
      adminId: user.id,
      subscriptionId: id,
      extraDays: days,
      reason,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Admin: Cancel merchant subscription
apiRouter.post('/subscription/admin/subscriptions/:id/cancel', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const ok = await subscriptionService.cancelSubscription({
      actorId: user.id,
      actorRole: 'admin',
      subscriptionId: id,
      reason: reason || 'SuperAdmin cancelled subscription',
    });

    res.json({ success: ok, message: ok ? 'Subscription cancelled successfully' : 'Failed to cancel subscription' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Admin: Get all subscription payments
apiRouter.get('/subscription/admin/payments', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await db.getAllSubscriptionPayments();
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Admin: Subscription revenue stats and MRR
apiRouter.get('/subscription/admin/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await db.getSubscriptionStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Admin: Audit logs
apiRouter.get('/subscription/admin/audit-logs', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const logs = await db.getAuditLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});





