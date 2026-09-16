import fs from 'fs';
import path from 'path';
import { getImageKitClient } from '../utils/imagekit';
import { pool, setPostgresConnected } from '../db/pool';

interface PothysSku {
  id: number;
  name: string;
  desc?: string;
  mrp: number;
  sp: number;
  dealp?: number;
  images?: string[];
  outOfStock?: boolean;
}

interface PothysProductRaw {
  id: number;
  name: string;
  brandName?: string;
  desc?: string;
  images?: string[];
  skus?: PothysSku[];
  categoryIds?: number[];
}

interface NormalizedCatalogProduct {
  id: string;
  name: string;
  brand: string;
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
}

function getSnackMetadata(name: string, brand?: string): { emoji: string; note: string } {
  const n = (name + ' ' + (brand || '')).toLowerCase();

  // Chocolates & Confectionery
  if (
    n.includes('chocolate') ||
    n.includes('choco') ||
    n.includes('cadbury') ||
    n.includes('dairy milk') ||
    n.includes('5 star') ||
    n.includes('five star') ||
    n.includes('gems') ||
    n.includes('perk') ||
    n.includes('kitkat') ||
    n.includes('munch') ||
    n.includes('snickers') ||
    n.includes('bar one') ||
    n.includes('hershey') ||
    n.includes('truffle') ||
    n.includes('fudge') ||
    n.includes('eclairs') ||
    n.includes('milkybar')
  ) {
    return {
      emoji: '🍫',
      note: 'Rich, smooth cocoa confectionery crafted for pure indulgence and sweet cravings',
    };
  }

  // Candies, Gums & Mints
  if (
    n.includes('chewing gum') ||
    n.includes('bubble gum') ||
    n.includes('orbit') ||
    n.includes('polo') ||
    n.includes('mint') ||
    n.includes('candy') ||
    n.includes('lollipop') ||
    n.includes('toffee') ||
    n.includes('marshmallow') ||
    n.includes('jelly')
  ) {
    return {
      emoji: '🍬',
      note: 'Sweet, flavorful candy and mints for instant freshness and delight',
    };
  }

  // Biscuits, Cookies, Wafers, Rusks
  if (
    n.includes('biscuit') ||
    n.includes('cookie') ||
    n.includes('rusk') ||
    n.includes('cracker') ||
    n.includes('wafer') ||
    n.includes('cream') ||
    n.includes('bourbon') ||
    n.includes('good day') ||
    n.includes('marie') ||
    n.includes('krackjack') ||
    n.includes('monaco') ||
    n.includes('bounce') ||
    n.includes('parle-g') ||
    n.includes('parle g') ||
    n.includes('hide & seek') ||
    n.includes('dark fantasy') ||
    n.includes('unibic') ||
    n.includes('oreo')
  ) {
    return {
      emoji: '🍪',
      note: 'Crispy oven-baked biscuits and cookies, perfect for tea-time and snacking',
    };
  }

  // Cakes, Brownies & Pastries
  if (
    n.includes('cake') ||
    n.includes('brownie') ||
    n.includes('muffin') ||
    n.includes('moonfils') ||
    n.includes('croissant') ||
    n.includes('pastry')
  ) {
    return {
      emoji: '🧁',
      note: 'Moist and delicious bakery delight baked with rich quality ingredients',
    };
  }

  // Chips, Crisps & Potato Snacks
  if (
    n.includes('chips') ||
    n.includes('crisps') ||
    n.includes('lays') ||
    n.includes('bingo') ||
    n.includes('kurkure') ||
    n.includes('tedhe medhe') ||
    n.includes('pringles') ||
    n.includes('nachos') ||
    n.includes('tortilla')
  ) {
    return {
      emoji: '🥔',
      note: 'Crunchy savory potato and corn crisps seasoned with zesty spices',
    };
  }

  // Popcorn
  if (n.includes('popcorn') || n.includes('corn')) {
    return {
      emoji: '🍿',
      note: 'Air-popped crispy corn snack seasoned to perfection for movie nights and treats',
    };
  }

  // Traditional Namkeens, Mixtures, Murukku, Haldiram's
  if (
    n.includes('mixture') ||
    n.includes('bhujia') ||
    n.includes('sev') ||
    n.includes('murukku') ||
    n.includes('pakoda') ||
    n.includes('namkeen') ||
    n.includes('chivda') ||
    n.includes('gathiya') ||
    n.includes('mathri') ||
    n.includes('boondi') ||
    n.includes('haldiram') ||
    n.includes('bikaji') ||
    n.includes('grb') ||
    n.includes('rajaram')
  ) {
    return {
      emoji: '🥨',
      note: 'Authentic traditional Indian savory namkeen seasoned with aromatic spices',
    };
  }

  // Sweets & Halwa
  if (
    n.includes('halwa') ||
    n.includes('laddu') ||
    n.includes('peda') ||
    n.includes('soan papdi') ||
    n.includes('gulab') ||
    n.includes('rasgulla') ||
    n.includes('mysore pak') ||
    n.includes('sweet')
  ) {
    return {
      emoji: '🍯',
      note: 'Mouth-watering traditional Indian confection prepared with pure ghee and sugar',
    };
  }

  // Default snack
  return {
    emoji: '🥨',
    note: 'Delicious, appetizing quality snack ideal for everyday cravings',
  };
}

export async function ingestPothysSnacks() {
  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not configured. Check IMAGEKIT_* in server/.env');
  }
  const ikClient = ik;

  console.log('📦 Connecting to PostgreSQL...');
  const client = await pool.connect();
  setPostgresConnected(true);

  // 1. Fetch active shops to accurately populate prices
  const shopsRes = await client.query('SELECT name FROM shops');
  const shopNames = shopsRes.rows.map((r) => r.name);
  if (shopNames.length === 0) {
    shopNames.push('Malabar supermarker', 'HP STORE', 'Al-Iqwan');
  }
  console.log(`🏪 Active shops identified for pricing: ${shopNames.join(', ')}`);

  // 2. Fetch existing products in biscuits-snacks to prevent DB duplicates
  const existingProductsRes = await client.query(
    `SELECT id, LOWER(TRIM(name)) as clean_name, image FROM products WHERE category_id = 'biscuits-snacks'`
  );
  const existingByName = new Map<string, { id: string; image: string }>();
  for (const row of existingProductsRes.rows) {
    existingByName.set(row.clean_name, { id: row.id, image: row.image || '' });
  }
  console.log(`📋 Loaded ${existingByName.size} existing biscuits-snacks from DB for deduplication.`);

  // 3. Fetch all products from Rodeo Digital API (Category 82449 - Snacks & Namkeens)
  console.log('🔍 Fetching Snacks & Namkeens (Category 82449) from Pothysmart API...');
  const searchUrl = 'https://api.rodeodigital.com/search/api/v1/products/search';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'app-code': 'pothys',
    'store-id': '471',
    'store-loc-id': '686',
    'accept-language': 'en',
    'ecom-platform': 'web',
    'device-id': 'e2f9d8a1-3b7c-4c2d-9a8b-1c2d3e4f5a6b',
  };

  const rawProducts: PothysProductRaw[] = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const criteria = {
      categories: [82449],
      inStockOnly: false,
      outOfStockOnly: false,
      skip,
      limit,
      brands: [],
      types: [],
      topSellersOnly: false,
    };

    const fullUrl = `${searchUrl}?criteria=${encodeURIComponent(JSON.stringify(criteria))}&includefiltercriteria=false`;
    const apiRes = await fetch(fullUrl, { headers });

    if (!apiRes.ok) {
      throw new Error(`Rodeo Digital API returned HTTP ${apiRes.status}: ${await apiRes.text()}`);
    }

    const data = (await apiRes.json()) as { products?: PothysProductRaw[] };
    const prods = data.products || [];
    rawProducts.push(...prods);
    console.log(`   Fetched batch of ${prods.length} items (Total so far: ${rawProducts.length})...`);

    if (prods.length < limit) break;
    skip += prods.length;
  }

  console.log(`✅ Total products fetched from Pothysmart Category 82449: ${rawProducts.length}`);

  // 4. In-memory source image URL cache to prevent uploading the same image twice across products
  const imageUrlMap = new Map<string, string>(); // sourceUrl -> targetImageKitUrl

  // 5. Concurrency worker for polite & fast ImageKit processing
  let uploadSuccessCount = 0;
  let alreadyInImageKitCount = 0;
  let reusedCachedCount = 0;
  let noImageCount = 0;
  let dbInsertedCount = 0;
  let dbUpdatedCount = 0;

  const normalizedList: NormalizedCatalogProduct[] = [];

  // Helper function to process an individual product
  async function processProduct(p: PothysProductRaw, index: number) {
    const sku: PothysSku = p.skus && p.skus.length > 0 ? p.skus[0] : { id: 0, mrp: 0, sp: 0, dealp: 0, name: '1 pack', images: [] as string[] };
    const rawImage = (p.images && p.images[0]) || (sku.images && sku.images[0]) || '';
    const { emoji, note } = getSnackMetadata(p.name, p.brandName);

    const productId = `pothys-snack-${p.id}`;
    const fileName = `pothys-snack-${p.id}.jpg`;
    const targetImageKitUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${fileName}`;

    let finalImageUrl = '';

    const isValidImage = rawImage && !rawImage.includes('noimage.jpg') && rawImage.startsWith('http');

    if (isValidImage) {
      // 1. Check if source image already cached in this run
      if (imageUrlMap.has(rawImage)) {
        finalImageUrl = imageUrlMap.get(rawImage)!;
        reusedCachedCount++;
      } else {
        // 2. Pre-check: Does target image already exist on ImageKit CDN?
        let alreadyOnCDN = false;
        try {
          const headRes = await fetch(targetImageKitUrl, { method: 'HEAD' });
          if (headRes.ok) {
            alreadyOnCDN = true;
          }
        } catch {
          alreadyOnCDN = false;
        }

        if (alreadyOnCDN) {
          finalImageUrl = targetImageKitUrl;
          imageUrlMap.set(rawImage, targetImageKitUrl);
          alreadyInImageKitCount++;
        } else {
          // 3. Download from Pothys CDN & upload to ImageKit
          try {
            const imgFetch = await fetch(rawImage, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                Referer: 'https://pothysmart.com/',
              },
            });

            if (imgFetch.ok) {
              const buf = Buffer.from(await imgFetch.arrayBuffer());
              if (buf.length > 500) {
                const upRes = await ikClient.upload({
                  file: buf,
                  fileName: fileName,
                  folder: '/priceteller-catalog/',
                  useUniqueFileName: false,
                });
                finalImageUrl = upRes.url || targetImageKitUrl;
                imageUrlMap.set(rawImage, finalImageUrl);
                uploadSuccessCount++;
              } else {
                finalImageUrl = '';
                noImageCount++;
              }
            } else {
              finalImageUrl = '';
              noImageCount++;
            }
          } catch (err: any) {
            if (err?.message?.includes('already exists') || err?.error?.includes('already exists')) {
              finalImageUrl = targetImageKitUrl;
              imageUrlMap.set(rawImage, targetImageKitUrl);
              alreadyInImageKitCount++;
            } else {
              console.warn(`⚠️ [${index + 1}/${rawProducts.length}] ImageKit upload warning for ${p.name}:`, err?.message || err);
              finalImageUrl = targetImageKitUrl;
            }
          }
        }
      }
    } else {
      noImageCount++;
      finalImageUrl = '';
    }

    // Units and Pricing calculation
    const rawUnit = sku.name ? sku.name.trim() : '1 pack';
    const mrp = Number(sku.mrp) || 0;
    const sellingPrice = Number(sku.sp) || Number(sku.dealp) || mrp;

    let badge = '';
    if (mrp > sellingPrice && mrp > 0) {
      const discountPct = Math.round(((mrp - sellingPrice) / mrp) * 100);
      badge = discountPct > 0 ? `${discountPct}% OFF` : 'Special Offer';
    }

    // Available units
    const availableUnits = (p.skus && p.skus.length > 0)
      ? p.skus.map((s) => (s.name ? s.name.trim() : '1 pack'))
      : [rawUnit];
    const unitMultiplier: Record<string, number> = {};
    for (const u of availableUnits) {
      unitMultiplier[u] = 1;
    }

    const normalized: NormalizedCatalogProduct = {
      id: productId,
      name: p.name.trim(),
      brand: p.brandName?.trim() || '',
      categoryId: 'biscuits-snacks',
      emoji,
      image: finalImageUrl,
      defaultUnit: rawUnit,
      availableUnits,
      unitMultiplier,
      isOrganic: false,
      isSeasonal: false,
      badge,
      nutritionalNote: note,
      mrp,
      sellingPrice,
      source: 'pothysmart',
      originalId: p.id,
    };

    normalizedList.push(normalized);

    // Dynamic prices object for all registered shops
    const pricesObj: Record<string, number> = {};
    const stockObj: Record<string, string> = {};
    for (const shop of shopNames) {
      pricesObj[shop] = sellingPrice;
      stockObj[shop] = 'in_stock';
    }

    // Deduplication check with existing DB products
    const cleanPothysName = p.name.toLowerCase().trim();
    const existingMatch = existingByName.get(cleanPothysName);

    if (existingMatch) {
      // If product already exists in DB, update prices and only update image if missing
      const imageToSet = existingMatch.image && existingMatch.image.length > 5 ? existingMatch.image : finalImageUrl;
      await client.query(
        `
        UPDATE products SET
          prices = $1,
          stock_status = $2,
          badge = COALESCE(NULLIF(badge, ''), $3),
          image = $4,
          last_updated = NOW()
        WHERE id = $5
        `,
        [JSON.stringify(pricesObj), JSON.stringify(stockObj), badge, imageToSet, existingMatch.id]
      );
      dbUpdatedCount++;
    } else {
      // Upsert into PostgreSQL products table
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
          normalized.id,
          normalized.name,
          normalized.categoryId,
          normalized.emoji,
          normalized.image,
          normalized.defaultUnit,
          JSON.stringify(normalized.availableUnits),
          JSON.stringify(normalized.unitMultiplier),
          normalized.isOrganic,
          normalized.isSeasonal,
          normalized.badge,
          normalized.nutritionalNote,
          JSON.stringify(pricesObj),
          JSON.stringify(stockObj),
        ]
      );
      dbInsertedCount++;
      existingByName.set(cleanPothysName, { id: normalized.id, image: finalImageUrl });
    }

    if ((index + 1) % 50 === 0 || index + 1 === rawProducts.length) {
      console.log(
        `⚡ Processed ${index + 1}/${rawProducts.length} | Uploaded: ${uploadSuccessCount} | Pre-existing: ${alreadyInImageKitCount} | Reused: ${reusedCachedCount} | DB Inserted: ${dbInsertedCount} | DB Updated: ${dbUpdatedCount}`
      );
    }
  }

  // Process items with controlled concurrency
  const CONCURRENCY = 6;
  for (let i = 0; i < rawProducts.length; i += CONCURRENCY) {
    const batch = rawProducts.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map((p, idx) => processProduct(p, i + idx)));
  }

  // Save to JSON data artifact
  const outPath = path.join(__dirname, '..', 'data', 'pothysSnacks.json');
  fs.writeFileSync(outPath, JSON.stringify(normalizedList, null, 2), 'utf-8');
  console.log(`💾 Saved ${normalizedList.length} normalized snack & chocolate products to ${outPath}`);

  console.log('\n=========================================');
  console.log('🎉 Pothys Snacks & Chocolates Ingestion Summary:');
  console.log(`   - Total raw products processed: ${rawProducts.length}`);
  console.log(`   - New images uploaded to ImageKit: ${uploadSuccessCount}`);
  console.log(`   - Existing ImageKit images verified: ${alreadyInImageKitCount}`);
  console.log(`   - Reused shared image URLs: ${reusedCachedCount}`);
  console.log(`   - Products without valid images: ${noImageCount}`);
  console.log(`   - New products inserted to PostgreSQL: ${dbInsertedCount}`);
  console.log(`   - Existing products updated with prices: ${dbUpdatedCount}`);
  console.log('=========================================\n');

  client.release();
}

// Allow direct script execution
if (require.main === module || process.argv[1]?.includes('ingestPothysSnacks')) {
  ingestPothysSnacks()
    .then(() => {
      console.log('✅ Ingestion completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
