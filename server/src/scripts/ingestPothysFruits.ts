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
  images: string[];
  outOfStock?: boolean;
}

interface PothysProductRaw {
  id: number;
  name: string;
  desc?: string;
  images?: string[];
  skus?: PothysSku[];
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
}

function getFruitMetadata(name: string): { emoji: string; note: string } {
  const n = name.toLowerCase();
  if (n.includes('banana')) return { emoji: '🍌', note: 'Rich in potassium, dietary fiber and Vitamin B6 for sustained energy' };
  if (n.includes('apple')) return { emoji: '🍎', note: 'High in soluble fiber, Vitamin C and cellular antioxidants' };
  if (n.includes('orange') || n.includes('mosambi')) return { emoji: '🍊', note: 'Excellent source of Vitamin C and immunity-supporting citrus flavonoids' };
  if (n.includes('grape')) return { emoji: '🍇', note: 'Rich in resveratrol, polyphenols and natural hydration' };
  if (n.includes('strawberry')) return { emoji: '🍓', note: 'Packed with Vitamin C, manganese and natural fruit antioxidants' };
  if (n.includes('blueberry')) return { emoji: '🫐', note: 'Superfood loaded with anthocyanins, brain-boosting antioxidants and Vitamin K' };
  if (n.includes('cherry')) return { emoji: '🍒', note: 'Anti-inflammatory fruit rich in natural melatonin and anthocyanins' };
  if (n.includes('kiwi')) return { emoji: '🥝', note: 'High enzyme fruit rich in Vitamin C, K and gut-friendly dietary fiber' };
  if (n.includes('avocado')) return { emoji: '🥑', note: 'Heart-healthy monounsaturated fats, potassium and Vitamin E' };
  if (n.includes('dragon')) return { emoji: '🐉', note: 'Exotic superfruit rich in prebiotics, dietary fiber and iron' };
  if (n.includes('guava')) return { emoji: '🍈', note: 'One of nature’s highest sources of natural Vitamin C and dietary fiber' };
  if (n.includes('papaya')) return { emoji: '🥭', note: 'Contains papain enzymes that promote optimal digestion and skin glow' };
  if (n.includes('plum')) return { emoji: '🍑', note: 'High in Vitamin A, K and antioxidant polyphenols' };
  if (n.includes('pear')) return { emoji: '🍐', note: 'Gentle on digestion, loaded with pectin fiber and copper' };
  if (n.includes('melon')) return { emoji: '🍈', note: 'Deeply hydrating, rich in beta-carotene, lycopene and electrolytes' };
  if (n.includes('anjeer') || n.includes('fig')) return { emoji: '🫒', note: 'Rich in bone-building calcium, magnesium, iron and dietary fiber' };
  if (n.includes('durian')) return { emoji: '🍈', note: 'King of Fruits, high energy and rich in B-complex vitamins' };
  return { emoji: '🍎', note: 'Fresh, nutrient-dense farm-harvested fruit' };
}

export async function ingestPothysFruits() {
  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not configured. Check IMAGEKIT_* in server/.env');
  }

  console.log('📦 Connecting to PostgreSQL...');
  const client = await pool.connect();
  setPostgresConnected(true);

  console.log('🔍 Fetching Fresh Fruits (Category 82413) from Pothysmart API...');
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

  const criteria = {
    categories: [82413], // Fresh Fruits
    inStockOnly: false,
    outOfStockOnly: false,
    skip: 0,
    limit: 100,
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
  const rawProducts = data.products || [];
  console.log(`🍎 Discovered ${rawProducts.length} raw fruit items from Pothysmart.`);

  const normalizedList: NormalizedCatalogProduct[] = [];
  let uploadSuccessCount = 0;
  let uploadSkippedCount = 0;
  let dbInsertCount = 0;

  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i];
    const sku = p.skus && p.skus.length > 0 ? p.skus[0] : { mrp: 0, sp: 0, name: '1 Kg', images: [] as string[] };
    const rawImage = (p.images && p.images[0]) || (sku.images && sku.images[0]) || '';
    const { emoji, note } = getFruitMetadata(p.name);
    const productId = `pothys-fruit-${p.id}`;
    const fileName = `pothys-fruit-${p.id}.jpg`;
    const targetImageKitUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${fileName}`;

    let finalImageUrl = targetImageKitUrl;

    // Check if valid image is present (not noimage.jpg)
    const isValidImage = rawImage && !rawImage.includes('noimage.jpg') && rawImage.startsWith('http');

    if (isValidImage) {
      try {
        console.log(`[${i + 1}/${rawProducts.length}] Downloading & uploading image for: ${p.name}`);
        const imgFetch = await fetch(rawImage, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });

        if (imgFetch.ok) {
          const buf = Buffer.from(await imgFetch.arrayBuffer());
          if (buf.length > 500) {
            const upRes = await ik.upload({
              file: buf,
              fileName: fileName,
              folder: '/priceteller-catalog/',
              useUniqueFileName: false,
            });
            finalImageUrl = upRes.url || targetImageKitUrl;
            uploadSuccessCount++;
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('already exists') || err?.error?.includes('already exists')) {
          finalImageUrl = targetImageKitUrl;
          uploadSkippedCount++;
        } else {
          console.warn(`⚠️ Warning: ImageKit upload failed for ${p.name}:`, err?.message || err);
          finalImageUrl = targetImageKitUrl;
        }
      }
    } else {
      // Fallback clean ImageKit images for products without a specific photo
      if (p.name.toLowerCase().includes('apple')) {
        finalImageUrl = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-fruit-5f6ab4c1.jpg'; // Fuji apple fallback
      } else {
        finalImageUrl = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/test-banana-green.jpg';
      }
      uploadSkippedCount++;
    }

    const unit = sku.name ? sku.name.trim() : '1 kg';
    const badge = sku.mrp > sku.sp ? 'Special Offer' : 'Fresh Harvest';

    const normalized: NormalizedCatalogProduct = {
      id: productId,
      name: p.name.trim(),
      categoryId: 'fruits',
      emoji,
      image: finalImageUrl,
      defaultUnit: unit,
      availableUnits: [unit],
      unitMultiplier: { [unit]: 1 },
      isOrganic: false,
      isSeasonal: false,
      badge,
      nutritionalNote: note,
      mrp: Number(sku.mrp) || 0,
      sellingPrice: Number(sku.sp) || 0,
      source: 'pothysmart',
      originalId: p.id,
    };

    normalizedList.push(normalized);

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
        JSON.stringify({
          'Al-Iqwan': normalized.sellingPrice,
          'Malabar supermarker': normalized.sellingPrice,
        }),
        JSON.stringify({
          'Al-Iqwan': 'in_stock',
          'Malabar supermarker': 'in_stock',
        }),
      ]
    );
    dbInsertCount++;
  }

  // Save to JSON artifact
  const outPath = path.join(__dirname, '..', 'data', 'pothysProducts.json');
  fs.writeFileSync(outPath, JSON.stringify(normalizedList, null, 2), 'utf-8');
  console.log(`💾 Saved ${normalizedList.length} normalized fruit products to ${outPath}`);

  // Now safely fix existing Pinterest fruit URLs in the database
  console.log('🛡️ Cleaning up any Pinterest links in existing fruit products...');
  const pinFruits = await client.query(
    `SELECT id, name FROM products WHERE category_id = 'fruits' AND (image LIKE '%pin.it%' OR image LIKE '%pinterest%')`
  );

  let pinFixedCount = 0;
  for (const pf of pinFruits.rows) {
    const pfName = pf.name.toLowerCase();
    // Find matching Pothys fruit or high quality ImageKit image
    const match = normalizedList.find((np) => {
      const npName = np.name.toLowerCase();
      return (
        (pfName.includes('banana') && npName.includes('banana')) ||
        (pfName.includes('വാഴ') && npName.includes('banana')) ||
        (pfName.includes('apple') && npName.includes('apple')) ||
        (pfName.includes('ആപ്പിൾ') && npName.includes('apple')) ||
        (pfName.includes('orange') && npName.includes('orange')) ||
        (pfName.includes('ഓറഞ്ച്') && npName.includes('orange')) ||
        (pfName.includes('മുസംബി') && npName.includes('mosambi')) ||
        (pfName.includes('grapes') && npName.includes('grapes')) ||
        (pfName.includes('മുന്തിരി') && npName.includes('grapes')) ||
        (pfName.includes('strawberry') && npName.includes('strawberry')) ||
        (pfName.includes('സ്ട്രോബെറി') && npName.includes('strawberry')) ||
        (pfName.includes('kiwi') && npName.includes('kiwi')) ||
        (pfName.includes('കിവി') && npName.includes('kiwi')) ||
        (pfName.includes('avocado') && npName.includes('avocado')) ||
        (pfName.includes('അവോക്കാഡോ') && npName.includes('avocado')) ||
        (pfName.includes('dragon') && npName.includes('dragon')) ||
        (pfName.includes('ഡ്രാഗൺ') && npName.includes('dragon')) ||
        (pfName.includes('durian') && npName.includes('durian')) ||
        (pfName.includes('ദുരിയാൻ') && npName.includes('durian')) ||
        (pfName.includes('plum') && npName.includes('plum')) ||
        (pfName.includes('പ്ലം') && npName.includes('plum')) ||
        (pfName.includes('pear') && npName.includes('pear')) ||
        (pfName.includes('പിയർ') && npName.includes('pear')) ||
        (pfName.includes('guava') && npName.includes('guava')) ||
        (pfName.includes('പേരയ്ക്ക') && npName.includes('guava'))
      );
    });

    if (match && match.image) {
      await client.query(`UPDATE products SET image = $1 WHERE id = $2`, [match.image, pf.id]);
      pinFixedCount++;
    } else {
      // Clean high-res fallback
      const cleanFallback = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/test-banana-green.jpg';
      await client.query(`UPDATE products SET image = $1 WHERE id = $2`, [cleanFallback, pf.id]);
      pinFixedCount++;
    }
  }

  // Verification counts
  const totalCountRes = await client.query('SELECT count(*) FROM products');
  const fruitsCountRes = await client.query(`SELECT count(*) FROM products WHERE category_id = 'fruits'`);
  const pinRemainingRes = await client.query(
    `SELECT count(*) FROM products WHERE category_id = 'fruits' AND (image LIKE '%pin.it%' OR image LIKE '%pinterest%')`
  );

  client.release();

  console.log('\n🎉 ==============================================');
  console.log(`✅ Ingested Pothys Fruits: ${dbInsertCount}`);
  console.log(`✅ Uploaded to ImageKit: ${uploadSuccessCount} (+${uploadSkippedCount} existing/fallbacks)`);
  console.log(`🛡️ Fixed Pinterest links in fruits: ${pinFixedCount}`);
  console.log(`📊 Remaining Pinterest links in fruits: ${pinRemainingRes.rows[0].count}`);
  console.log(`🍎 Total Fruit Products in Catalog: ${fruitsCountRes.rows[0].count}`);
  console.log(`📦 Total Master Catalog Products: ${totalCountRes.rows[0].count}`);
  console.log('=================================================\n');
}

if (require.main === module) {
  ingestPothysFruits()
    .then(() => {
      console.log('🏁 Pothys fruit ingestion completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
