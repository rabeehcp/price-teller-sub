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

function getVegetableMetadata(name: string): { emoji: string; note: string } {
  const n = name.toLowerCase();
  if (n.includes('potato') && !n.includes('sweet')) return { emoji: '🥔', note: 'Essential kitchen staple rich in complex carbs, potassium and Vitamin C' };
  if (n.includes('sweet potato')) return { emoji: '🍠', note: 'Nutrient-rich root with high beta-carotene, Vitamin A and dietary fiber' };
  if (n.includes('tomato')) return { emoji: '🍅', note: 'Rich in lycopene, Vitamin C and potassium for heart and skin vitality' };
  if (n.includes('onion') || n.includes('shallot')) return { emoji: '🧅', note: 'Flavor-packed allium vegetable with anti-inflammatory quercetin and prebiotics' };
  if (n.includes('garlic')) return { emoji: '🧄', note: 'Potent culinary spice and vegetable rich in allicin for natural immunity' };
  if (n.includes('ginger')) return { emoji: '🫚', note: 'Natural digestive aid and anti-inflammatory rhizome with gingerols' };
  if (n.includes('chilli') || n.includes('chili')) return { emoji: '🌶️', note: 'Spicy culinary essential loaded with metabolism-boosting capsaicin and Vitamin C' };
  if (n.includes('capsicum') || n.includes('bell pepper')) return { emoji: '🫑', note: 'Crisp vegetable with extraordinarily high Vitamin C, Vitamin A and antioxidants' };
  if (n.includes('carrot')) return { emoji: '🥕', note: 'Crunchy farm root packed with beta-carotene, lutein and eye health nutrients' };
  if (n.includes('beetroot') || n.includes('beet')) return { emoji: '🫒', note: 'Nitrate-rich super-root that promotes healthy blood circulation and stamina' };
  if (n.includes('cabbage')) return { emoji: '🥬', note: 'Cruciferous staple rich in Vitamin K, sulfur compounds and gut-friendly fiber' };
  if (n.includes('cauliflower')) return { emoji: '🥦', note: 'Mild, versatile cruciferous vegetable rich in choline and glucosinolates' };
  if (n.includes('broccoli')) return { emoji: '🥦', note: 'Nutrient-dense powerhouse full of sulforaphane, iron and Vitamin C' };
  if (n.includes('brinjal') || n.includes('eggplant')) return { emoji: '🍆', note: 'Plump antioxidant-rich vegetable with nasunin to protect cell membranes' };
  if (n.includes('okra') || n.includes('ladies finger') || n.includes('lady finger')) return { emoji: '🥒', note: 'High mucilage vegetable that aids digestion and regulates blood sugar' };
  if (n.includes('drumstick') || n.includes('moringa')) return { emoji: '🌿', note: 'Traditional ayurvedic superfood dense in calcium, phosphorus and Vitamin C' };
  if (n.includes('cucumber')) return { emoji: '🥒', note: 'Ultra-hydrating, cooling vegetable with silica for skin elasticity and electrolyte balance' };
  if (n.includes('pumpkin')) return { emoji: '🎃', note: 'Velvety sweet vegetable rich in beta-carotene, potassium and dietary fiber' };
  if (n.includes('ash gourd') || n.includes('bottle gourd') || n.includes('snake gourd') || n.includes('ridge gourd') || n.includes('ivy gourd') || n.includes('gourd')) return { emoji: '🥒', note: 'High water content gourd that cools the body and supports gentle digestion' };
  if (n.includes('bitter gourd')) return { emoji: '🥒', note: 'Renowned therapeutic vegetable with charantin and polypeptide-p for blood sugar control' };
  if (n.includes('beans') || n.includes('peas')) return { emoji: '🫛', note: 'Crisp legume rich in plant-based protein, dietary fiber and folates' };
  if (n.includes('spinach') || n.includes('cheera') || n.includes('leaves') || n.includes('mint') || n.includes('coriander') || n.includes('curry')) return { emoji: '🌿', note: 'Fresh aromatic greens loaded with iron, chlorophyll, folate and antioxidants' };
  if (n.includes('mushroom')) return { emoji: '🍄', note: 'Savory edible fungi loaded with Vitamin D, selenium and immune-modulating beta-glucans' };
  if (n.includes('corn') || n.includes('maize')) return { emoji: '🌽', note: 'Sweet, wholesome golden cob rich in lutein, zeaxanthin and dietary fiber' };
  if (n.includes('yam') || n.includes('taro') || n.includes('cassava') || n.includes('tapioca')) return { emoji: '🥔', note: 'Hearty traditional tuber offering sustained energy, potassium and dietary fiber' };
  return { emoji: '🥬', note: 'Fresh farm-harvested vegetable packed with natural vitamins and minerals' };
}

export async function ingestPothysVegetables() {
  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not configured. Check IMAGEKIT_* in server/.env');
  }

  console.log('📦 Connecting to PostgreSQL...');
  const client = await pool.connect();
  setPostgresConnected(true);

  console.log('🔍 Fetching Fresh Vegetables (Category 82414) from Pothysmart API...');
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
      categories: [82414], // Fresh Vegetables
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

    if (prods.length < limit) {
      break;
    }
    skip += limit;
  }

  console.log(`🥦 Discovered ${rawProducts.length} raw vegetable items from Pothysmart.`);

  const normalizedList: NormalizedCatalogProduct[] = [];
  let uploadSuccessCount = 0;
  let uploadSkippedCount = 0;
  let dbInsertCount = 0;

  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i];
    const sku = p.skus && p.skus.length > 0 ? p.skus[0] : { mrp: 0, sp: 0, name: '1 Kg', images: [] as string[] };
    const rawImage = (p.images && p.images[0]) || (sku.images && sku.images[0]) || '';
    const { emoji, note } = getVegetableMetadata(p.name);
    const productId = `pothys-veg-${p.id}`;
    const fileName = `pothys-veg-${p.id}.jpg`;
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
      // Find clean fallback from already uploaded vegetables if possible
      const cleanName = p.name.toLowerCase();
      const existingMatch = normalizedList.find(
        (ex) => ex.image.includes('ik.imagekit.io') && ex.name.toLowerCase().includes(cleanName.split(' ')[0])
      );
      if (existingMatch) {
        finalImageUrl = existingMatch.image;
      } else {
        finalImageUrl = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg'; // Coriander fallback
      }
      uploadSkippedCount++;
    }

    const unit = sku.name ? sku.name.trim() : '1 kg';
    const badge = sku.mrp > sku.sp ? 'Special Offer' : 'Fresh Harvest';

    const normalized: NormalizedCatalogProduct = {
      id: productId,
      name: p.name.trim(),
      categoryId: 'vegetables',
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
  const outPath = path.join(__dirname, '..', 'data', 'pothysVegetables.json');
  fs.writeFileSync(outPath, JSON.stringify(normalizedList, null, 2), 'utf-8');
  console.log(`💾 Saved ${normalizedList.length} normalized vegetable products to ${outPath}`);

  // Now safely fix existing Pinterest vegetable URLs in the database
  console.log('🛡️ Cleaning up any Pinterest links in existing vegetable products...');
  const pinVegs = await client.query(
    `SELECT id, name FROM products WHERE category_id = 'vegetables' AND (image LIKE '%pin.it%' OR image LIKE '%pinterest%')`
  );

  let pinFixedCount = 0;
  for (const pv of pinVegs.rows) {
    const pvName = pv.name.toLowerCase();
    // Find matching Pothys vegetable or high quality ImageKit image
    const match = normalizedList.find((np) => {
      const npName = np.name.toLowerCase();
      return (
        (pvName.includes('potato') && npName.includes('potato')) ||
        (pvName.includes('ഉരുള') && npName.includes('potato')) ||
        (pvName.includes('tomato') && npName.includes('tomato')) ||
        (pvName.includes('തക്കാളി') && npName.includes('tomato')) ||
        (pvName.includes('onion') && npName.includes('onion')) ||
        (pvName.includes('ഉള്ളി') && npName.includes('onion')) ||
        (pvName.includes('shallot') && npName.includes('shallot')) ||
        (pvName.includes('garlic') && npName.includes('garlic')) ||
        (pvName.includes('വെളുത്തുള്ളി') && npName.includes('garlic')) ||
        (pvName.includes('ginger') && npName.includes('ginger')) ||
        (pvName.includes('ഇഞ്ചി') && npName.includes('ginger')) ||
        (pvName.includes('chilli') && npName.includes('chilli')) ||
        (pvName.includes('മുളക്') && npName.includes('chilli')) ||
        (pvName.includes('capsicum') && npName.includes('capsicum')) ||
        (pvName.includes('carrot') && npName.includes('carrot')) ||
        (pvName.includes('കാരറ്റ്') && npName.includes('carrot')) ||
        (pvName.includes('beetroot') && npName.includes('beetroot')) ||
        (pvName.includes('ബീറ്റ്റൂട്ട്') && npName.includes('beetroot')) ||
        (pvName.includes('cabbage') && npName.includes('cabbage')) ||
        (pvName.includes('കാബേജ്') && npName.includes('cabbage')) ||
        (pvName.includes('cauliflower') && npName.includes('cauliflower')) ||
        (pvName.includes('കോളിഫ്ലവർ') && npName.includes('cauliflower')) ||
        (pvName.includes('brinjal') && npName.includes('brinjal')) ||
        (pvName.includes('വഴുതന') && npName.includes('brinjal')) ||
        (pvName.includes('okra') && (npName.includes('ladies finger') || npName.includes('okra'))) ||
        (pvName.includes('വെണ്ടക്ക') && (npName.includes('ladies finger') || npName.includes('okra'))) ||
        (pvName.includes('drumstick') && npName.includes('drumstick')) ||
        (pvName.includes('മുരിങ്ങ') && npName.includes('drumstick')) ||
        (pvName.includes('cucumber') && npName.includes('cucumber')) ||
        (pvName.includes('വെള്ളരിക്ക') && npName.includes('cucumber')) ||
        (pvName.includes('pumpkin') && npName.includes('pumpkin')) ||
        (pvName.includes('മത്തങ്ങ') && npName.includes('pumpkin')) ||
        (pvName.includes('gourd') && npName.includes('gourd')) ||
        (pvName.includes('പാവയ്ക്ക') && npName.includes('bitter gourd')) ||
        (pvName.includes('പടവലങ്ങ') && npName.includes('snake gourd')) ||
        (pvName.includes('ചുരയ്ക്ക') && npName.includes('bottle gourd')) ||
        (pvName.includes('കുമ്പളങ്ങ') && npName.includes('ash gourd')) ||
        (pvName.includes('കോവയ്ക്ക') && npName.includes('ivy gourd')) ||
        (pvName.includes('പീച്ചിങ്ങ') && npName.includes('ridge gourd')) ||
        (pvName.includes('beans') && npName.includes('beans')) ||
        (pvName.includes('പയർ') && (npName.includes('beans') || npName.includes('cowpea'))) ||
        (pvName.includes('peas') && npName.includes('peas')) ||
        (pvName.includes('spinach') && (npName.includes('spinach') || npName.includes('keerai') || npName.includes('leaves'))) ||
        (pvName.includes('ചീര') && (npName.includes('spinach') || npName.includes('keerai') || npName.includes('leaves'))) ||
        (pvName.includes('coriander') && npName.includes('coriander')) ||
        (pvName.includes('മല്ലിയില') && npName.includes('coriander')) ||
        (pvName.includes('mint') && npName.includes('mint')) ||
        (pvName.includes('പുതിന') && npName.includes('mint')) ||
        (pvName.includes('curry') && npName.includes('curry')) ||
        (pvName.includes('കറിവേപ്പില') && npName.includes('curry')) ||
        (pvName.includes('tapioca') && (npName.includes('tapioca') || npName.includes('cassava') || npName.includes('maravalli'))) ||
        (pvName.includes('കപ്പ') && (npName.includes('tapioca') || npName.includes('cassava') || npName.includes('maravalli'))) ||
        (pvName.includes('yam') && (npName.includes('yam') || npName.includes('sena'))) ||
        (pvName.includes('ചേന') && (npName.includes('yam') || npName.includes('sena'))) ||
        (pvName.includes('radish') && npName.includes('radish')) ||
        (pvName.includes('മുള്ളങ്കി') && npName.includes('radish'))
      );
    });

    if (match && match.image) {
      await client.query(`UPDATE products SET image = $1 WHERE id = $2`, [match.image, pv.id]);
      pinFixedCount++;
    } else {
      // Clean high-res fallback
      const cleanFallback = 'https://ik.imagekit.io/rcparkd3663/priceteller-catalog/pothys-veg-3136483.jpg';
      await client.query(`UPDATE products SET image = $1 WHERE id = $2`, [cleanFallback, pv.id]);
      pinFixedCount++;
    }
  }

  // Verification counts
  const totalCountRes = await client.query('SELECT count(*) FROM products');
  const vegCountRes = await client.query(`SELECT count(*) FROM products WHERE category_id = 'vegetables'`);
  const pinRemainingVegRes = await client.query(
    `SELECT count(*) FROM products WHERE category_id = 'vegetables' AND (image LIKE '%pin.it%' OR image LIKE '%pinterest%')`
  );
  const pinRemainingAllRes = await client.query(
    `SELECT count(*) FROM products WHERE (image LIKE '%pin.it%' OR image LIKE '%pinterest%')`
  );

  client.release();

  console.log('\n🎉 ==============================================');
  console.log(`✅ Ingested Pothys Vegetables: ${dbInsertCount}`);
  console.log(`✅ Uploaded to ImageKit: ${uploadSuccessCount} (+${uploadSkippedCount} existing/fallbacks)`);
  console.log(`🛡️ Fixed Pinterest links in vegetables: ${pinFixedCount}`);
  console.log(`📊 Remaining Pinterest links in vegetables: ${pinRemainingVegRes.rows[0].count}`);
  console.log(`📊 Total remaining Pinterest links across ALL products: ${pinRemainingAllRes.rows[0].count}`);
  console.log(`🥦 Total Vegetable Products in Catalog: ${vegCountRes.rows[0].count}`);
  console.log(`📦 Total Master Catalog Products: ${totalCountRes.rows[0].count}`);
  console.log('=================================================\n');
}

if (require.main === module) {
  ingestPothysVegetables()
    .then(() => {
      console.log('🏁 Pothys vegetable ingestion completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
