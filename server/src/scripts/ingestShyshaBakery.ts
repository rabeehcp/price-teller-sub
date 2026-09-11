import fs from 'fs';
import path from 'path';
import { getImageKitClient } from '../utils/imagekit';
import { pool, setPostgresConnected } from '../db/pool';

interface ShyshaImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

interface ShyshaCategory {
  id: number;
  name: string;
  slug: string;
}

interface ShyshaPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
}

interface ShyshaRawProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  prices: ShyshaPrices;
  images: ShyshaImage[];
  categories: ShyshaCategory[];
  is_in_stock: boolean;
}

interface NormalizedCatalogProduct {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  image: string;
  defaultUnit: string;
  availableUnits: string[];
  unitMultiplier: Record<string, number>;
  isOrganic: boolean;
  isSeasonal: boolean;
  badge: string;
  nutritionalNote: string;
  mrp: number;
  sellingPrice: number;
  source: string;
  originalId: number;
  prices: Record<string, number>;
  stockStatus: Record<string, string>;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseUnitFromName(name: string): string {
  const n = name.toLowerCase();
  const match = n.match(/(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|gram|grams|ml|ltr|l|liter|litres|pcs|pieces|pack|pc))/i);
  if (match) {
    return match[1].replace(/\s+/g, ' ').trim();
  }
  return '1 pack';
}

function getCategoryAndEmoji(categories: ShyshaCategory[], name: string): { categoryId: string; emoji: string } {
  // Exclude the broad top-level 'Bakery & Beverages'
  const subCatNames = categories
    .map((c) => decodeHtmlEntities(c.name).toLowerCase())
    .filter((n) => !n.includes('bakery & beverages') && !n.includes('bakery &amp; beverages'));
  const n = name.toLowerCase();

  // 1. Ice Cream -> dairy
  if (subCatNames.some((c) => c.includes('ice cream')) || n.includes('ice cream') || n.includes('kulfi')) {
    return { categoryId: 'dairy', emoji: '🍦' };
  }

  // 2. Beverage (subcat or drink keywords)
  if (
    subCatNames.some((c) => c === 'beverage' || c === 'beverages' || c.includes('drink') || c.includes('juice')) ||
    n.includes('juice') || n.includes('squash') || n.includes('drink') || n.includes('shake') ||
    n.includes('tea') || n.includes('coffee') || n.includes('horlicks') || n.includes('boost') || n.includes('complan')
  ) {
    return { categoryId: 'beverages', emoji: '🧃' };
  }

  // 3. Biscuits, Cookies, Chocolates & Snacks -> biscuits-snacks
  if (subCatNames.some((c) => c.includes('biscuit') || c.includes('cookie')) || n.includes('biscuit') || n.includes('cookie') || n.includes('rusk') || n.includes('cracker')) {
    return { categoryId: 'biscuits-snacks', emoji: '🍪' };
  }
  if (subCatNames.some((c) => c.includes('chocolate') || c.includes('sweet')) || n.includes('chocolate') || n.includes('halwa') || n.includes('truffle') || n.includes('candy') || n.includes('sweet')) {
    return { categoryId: 'biscuits-snacks', emoji: '🍫' };
  }
  if (subCatNames.some((c) => c.includes('snack')) || n.includes('chips') || n.includes('mixture') || n.includes('murukku') || n.includes('sarkaravaratty') || n.includes('snack')) {
    return { categoryId: 'biscuits-snacks', emoji: '🥨' };
  }

  // 4. Bread & Cakes -> bakery-breakfast
  if (n.includes('cake') || n.includes('pastry') || n.includes('muffin') || n.includes('cupcake') || subCatNames.some((c) => c.includes('cake'))) {
    return { categoryId: 'bakery-breakfast', emoji: '🧁' };
  }
  if (n.includes('bread') || n.includes('bun') || n.includes('pav') || n.includes('chapati') || n.includes('roti') || n.includes('parotta') || n.includes('kulcha')) {
    return { categoryId: 'bakery-breakfast', emoji: '🍞' };
  }
  if (n.includes('croissant') || n.includes('puff')) {
    return { categoryId: 'bakery-breakfast', emoji: '🥐' };
  }

  return { categoryId: 'bakery-breakfast', emoji: '🥖' };
}

function getNutritionalNote(categoryId: string, name: string): string {
  const n = name.toLowerCase();
  if (n.includes('banana chips')) return 'Crispy Kerala snack made from select raw bananas, fried to perfection.';
  if (n.includes('sarkaravaratty')) return 'Traditional Kerala sweet delicacy made with jaggery, ginger and cardamom.';
  if (n.includes('bread')) return 'Freshly baked soft bread, ideal for healthy breakfasts and toasts.';
  if (n.includes('cake')) return 'Rich and delicious bakery cake baked with premium ingredients.';
  if (n.includes('cookie') || n.includes('biscuit')) return 'Crunchy, delightful baked cookies perfect with evening tea.';
  if (categoryId === 'beverages') return 'Refreshing beverage to keep you energized throughout the day.';
  return 'Fresh and wholesome bakery favorite prepared with quality ingredients.';
}

export async function ingestShyshaBakery() {
  console.log('🥐 Starting Shysha Bakery products ingestion...');

  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not configured. Check IMAGEKIT_* in server/.env');
  }

  console.log('📦 Connecting to PostgreSQL database...');
  const client = await pool.connect();
  setPostgresConnected(true);

  // 1. Fetch products from Shysha WooCommerce API
  const allRawProducts: ShyshaRawProduct[] = [];
  const totalPages = 2; // Category 223 has 184 products (page 1: 100, page 2: 84)

  for (let page = 1; page <= totalPages; page++) {
    console.log(`🌐 Fetching products from Shysha API (Page ${page}/${totalPages})...`);
    const apiUrl = `https://www.shysha.in/wp-json/wc/store/v1/products?category=223&per_page=100&page=${page}`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Shysha products on page ${page}: HTTP ${res.status}`);
    }

    const items: ShyshaRawProduct[] = await res.json();
    allRawProducts.push(...items);
    console.log(`   Fetched ${items.length} products from page ${page}.`);
  }

  console.log(`✅ Total products fetched from Shysha: ${allRawProducts.length}`);

  // 2. Prepare Unique Images Map for safe deduplicated upload
  const imageUrlMap = new Map<string, string>(); // sourceUrl -> imagekitUrl
  const uniqueSourceUrls = new Set<string>();
  for (const p of allRawProducts) {
    const src = p.images?.[0]?.src;
    if (src) {
      uniqueSourceUrls.add(src);
    }
  }
  console.log(`📸 Total unique images to process: ${uniqueSourceUrls.size}`);

  // 3. Process Images Safely
  let uploadedCount = 0;
  let alreadyPresentCount = 0;
  let failedCount = 0;

  const uniqueUrlList = Array.from(uniqueSourceUrls);
  const concurrency = 3; // Polite concurrency to ensure safety

  for (let i = 0; i < uniqueUrlList.length; i += concurrency) {
    const batch = uniqueUrlList.slice(i, i + concurrency);

    await Promise.all(
      batch.map(async (srcUrl) => {
        try {
          // Determine clean filename
          const cleanUrlWithoutQuery = srcUrl.split('?')[0];
          const rawBaseName = path.basename(cleanUrlWithoutQuery);
          const extMatch = rawBaseName.match(/\.(png|jpe?g|webp|gif|svg)$/i);
          const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
          const nameWithoutExt = rawBaseName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
          const cleanFileName = `shysha-bakery-${nameWithoutExt}${ext}`;

          const expectedTargetUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${cleanFileName}`;

          // Safety Pre-check: Check if image already exists on ImageKit CDN
          let alreadyExists = false;
          try {
            const headCheck = await fetch(expectedTargetUrl, { method: 'HEAD' });
            if (headCheck.ok) {
              alreadyExists = true;
            }
          } catch {
            alreadyExists = false;
          }

          if (alreadyExists) {
            alreadyPresentCount++;
            imageUrlMap.set(srcUrl, expectedTargetUrl);
            return;
          }

          // Download image safely
          const imgRes = await fetch(srcUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
              Referer: 'https://www.shysha.in/',
            },
          });

          if (!imgRes.ok) {
            throw new Error(`Failed to download image: HTTP ${imgRes.status}`);
          }

          const arrayBuf = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);

          if (buffer.length < 50) {
            throw new Error(`Image buffer too small (${buffer.length} bytes)`);
          }

          // Upload to ImageKit
          const uploadRes = await ik.upload({
            file: buffer,
            fileName: cleanFileName,
            folder: '/priceteller-catalog/',
            useUniqueFileName: false,
          });

          const finalUrl = uploadRes.url || expectedTargetUrl;
          imageUrlMap.set(srcUrl, finalUrl);
          uploadedCount++;
        } catch (err: any) {
          failedCount++;
          console.warn(`   ⚠️ Image upload warning for ${srcUrl}:`, err?.message || err);
          // Fallback to original URL so product is still usable
          imageUrlMap.set(srcUrl, srcUrl);
        }
      })
    );

    const processedSoFar = Math.min(i + concurrency, uniqueUrlList.length);
    console.log(
      `   [Images ${processedSoFar}/${uniqueUrlList.length}] Newly Uploaded: ${uploadedCount} | Existing/Skipped: ${alreadyPresentCount} | Failed: ${failedCount}`
    );

    // Polite delay between batches
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  console.log(`\n🎉 Image processing complete:`);
  console.log(`   - Uploaded to ImageKit: ${uploadedCount}`);
  console.log(`   - Reused Existing: ${alreadyPresentCount}`);
  console.log(`   - Fallback/Failed: ${failedCount}`);

  // 4. Normalize Products
  const normalizedList: NormalizedCatalogProduct[] = [];

  for (const p of allRawProducts) {
    const cleanName = decodeHtmlEntities(p.name);
    const { categoryId, emoji } = getCategoryAndEmoji(p.categories || [], cleanName);
    const unit = parseUnitFromName(cleanName);

    const rawPrice = parseInt(p.prices?.price || '0', 10);
    const rawRegularPrice = parseInt(p.prices?.regular_price || p.prices?.price || '0', 10);
    const sellingPrice = rawPrice > 0 ? rawPrice / 100 : 0;
    const mrp = rawRegularPrice > 0 ? rawRegularPrice / 100 : sellingPrice;

    const sourceImg = p.images?.[0]?.src || '';
    const finalImage = imageUrlMap.get(sourceImg) || sourceImg || '';

    const normalized: NormalizedCatalogProduct = {
      id: `shysha-bakery-${p.id}`,
      name: cleanName,
      categoryId,
      emoji,
      image: finalImage,
      defaultUnit: unit,
      availableUnits: [unit],
      unitMultiplier: { [unit]: 1 },
      isOrganic: cleanName.toLowerCase().includes('organic'),
      isSeasonal: false,
      badge: mrp > sellingPrice && sellingPrice > 0 ? `${Math.round(((mrp - sellingPrice) / mrp) * 100)}% OFF` : 'FRESH BAKERY',
      nutritionalNote: getNutritionalNote(categoryId, cleanName),
      mrp,
      sellingPrice,
      source: 'shysha',
      originalId: p.id,
      prices:
        sellingPrice > 0
          ? {
              'Al-Iqwan': sellingPrice,
              'Malabar supermarker': sellingPrice,
              Shysha: sellingPrice,
              MRP: mrp,
            }
          : {},
      stockStatus: {
        'Al-Iqwan': p.is_in_stock ? 'in_stock' : 'out_of_stock',
        'Malabar supermarker': p.is_in_stock ? 'in_stock' : 'out_of_stock',
        Shysha: p.is_in_stock ? 'in_stock' : 'out_of_stock',
      },
    };

    normalizedList.push(normalized);
  }

  // 5. Save Raw & Normalized Data to JSON
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const rawJsonPath = path.join(dataDir, 'shyshaBakeryRaw.json');
  fs.writeFileSync(rawJsonPath, JSON.stringify(allRawProducts, null, 2), 'utf-8');

  const normalizedJsonPath = path.join(dataDir, 'shyshaBakeryProducts.json');
  fs.writeFileSync(normalizedJsonPath, JSON.stringify(normalizedList, null, 2), 'utf-8');

  console.log(`💾 Saved catalog to:`);
  console.log(`   - ${rawJsonPath}`);
  console.log(`   - ${normalizedJsonPath}`);

  // 6. Safe Database Sync
  console.log(`🔄 Syncing ${normalizedList.length} products to PostgreSQL database...`);
  let dbInsertCount = 0;

  for (const prod of normalizedList) {
    await client.query(
      `
      INSERT INTO products (
        id, name, category_id, emoji, image, default_unit,
        available_units, unit_multiplier, is_organic, is_seasonal,
        badge, nutritional_note, prices, stock_status, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category_id = EXCLUDED.category_id,
        emoji = EXCLUDED.emoji,
        image = EXCLUDED.image,
        default_unit = EXCLUDED.default_unit,
        available_units = EXCLUDED.available_units,
        unit_multiplier = EXCLUDED.unit_multiplier,
        badge = EXCLUDED.badge,
        nutritional_note = EXCLUDED.nutritional_note,
        prices = EXCLUDED.prices,
        stock_status = EXCLUDED.stock_status,
        last_updated = NOW();
      `,
      [
        prod.id,
        prod.name,
        prod.categoryId,
        prod.emoji,
        prod.image,
        prod.defaultUnit,
        JSON.stringify(prod.availableUnits),
        JSON.stringify(prod.unitMultiplier),
        prod.isOrganic,
        prod.isSeasonal,
        prod.badge,
        prod.nutritionalNote,
        JSON.stringify(prod.prices),
        JSON.stringify(prod.stockStatus),
      ]
    );
    dbInsertCount++;
  }

  client.release();
  console.log(`✅ Successfully synced ${dbInsertCount} bakery products into PostgreSQL!`);
  console.log(`✨ Ingestion process completed safely!`);
}

// Direct execution support
if (require.main === module) {
  ingestShyshaBakery()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during Shysha ingestion:', err);
      process.exit(1);
    });
}
