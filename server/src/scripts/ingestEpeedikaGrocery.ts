import fs from 'fs';
import path from 'path';
import { getImageKitClient } from '../utils/imagekit';
import { pool, setPostgresConnected } from '../db/pool';

interface EpeedikaRawItem {
  id: string;
  title: string;
  imgUrl: string;
  sp: number;
  mrp: number;
}

interface ConsolidatedGroceryProduct {
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
  originalId: string;
}

const KNOWN_BRANDS = [
  'aachi', 'aashirvaad', 'aashirbad', 'ab', 'act ii', 'ajmi', 'alibaba', 'alite',
  'ambadi', 'amul', 'anand', 'anu s', 'ashirvad', 'avt', 'bambino', 'boost', 'brahmins',
  'brooke bond', 'bru', 'cadbury', 'catch', 'ceregrow', 'chakki', 'chakson',
  'champion', 'ching s', 'choice', 'colgate', 'dabur', 'dalda', 'del monte',
  'dhathri', 'dettol', 'double horse', 'eastern', 'everest', 'fortune', 'glucon d',
  'gold winner', 'good day', 'good knight', 'haldiram', 'happilo', 'himalaya',
  'horlicks', 'id', 'india gate', 'indulekha', 'itc', 'jacker', 'johnson',
  'kanan devan', 'kellogg s', 'kera', 'kissan', 'klf', 'koozi', 'kraft',
  'lay s', 'lipton', 'm-seal', 'maggi', 'manorama', 'marico', 'mdh', 'mortein',
  'mothers', 'mtr', 'nescafe', 'nestle', 'nilons', 'nirma', 'nirapara', 'nutella',
  'oreo', 'palat', 'parle', 'patanjali', 'pavizham', 'pears', 'pediasure', 'pillsbury',
  'pompeian', 'priya', 'quaker', 'red label', 'real', 'ril', 'roopam', 'safal',
  'saffola', 'sakthi', 'saras', 'santoor', 'savlon', 'sensodyne', 'sev', 'shaji',
  'snickers', 'sunfeast', 'sunlight', 'surf excel', 'taj mahal', 'tata', 'tropicana',
  'ujala', 'vim', 'vital', 'volini', 'wagh bakri', 'white owl', 'whisper', 'wild stone',
  'wipro', 'woodwards', 'yippee'
];

function extractBrand(name: string): string | null {
  const lower = name.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.startsWith(b + ' ') || lower.includes(' ' + b + ' ') || lower.startsWith(b + '-')) {
      return b;
    }
  }
  return null;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\b(\d+(\.\d+)?)\s*(kg|gm|g|ml|l|ltr|no|pcs|box|pouch|bag|pack|packet|rs)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function baseGroupName(title: string): string {
  return title
    .toLowerCase()
    .replace(/\b(\d+(\.\d+)?)\s*(kg|gm|g|ml|l|ltr|no|pcs|box|pouch|bag|pack|packet|rs)\b/gi, '')
    .replace(/\b(loose|bag|packet|jar|pouch|sachet)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUnit(title: string): string {
  const match = title.match(/(\d+(\.\d+)?)\s*(kg|gm|g|ml|l|ltr|pcs|box|pouch|bag|packet)\b/i);
  if (match) {
    const num = match[1];
    const unit = match[3].toLowerCase();
    if (unit === 'gm' || unit === 'g') return `${num} g`;
    if (unit === 'kg') return `${num} kg`;
    if (unit === 'ml') return `${num} ml`;
    if (unit === 'l' || unit === 'ltr') return `${num} L`;
    return `${num} ${unit}`;
  }
  if (title.toLowerCase().includes('loose')) return '1 kg (Loose)';
  return '1 Unit';
}

function assignCategoryAndMetadata(name: string): { categoryId: string; emoji: string; note: string } {
  const n = name.toLowerCase();
  if (n.includes('tea') || n.includes('coffee') || n.includes('drink') || n.includes('horlicks') || n.includes('boost') || n.includes('bournvita')) {
    return { categoryId: 'beverages', emoji: '☕', note: 'Aromatic traditional brew rich in natural polyphenols and antioxidants' };
  }
  if (n.includes('rice') || n.includes('kuruva') || n.includes('matta') || n.includes('basmati') || n.includes('biryani') || n.includes('wheat') || n.includes('atta') || n.includes('maida') || n.includes('rava') || n.includes('aval') || n.includes('flour') || n.includes('podi') || n.includes('puttu') || n.includes('appam')) {
    return { categoryId: 'rice-grains', emoji: '🌾', note: 'Essential kitchen staple grain providing sustained complex carbohydrate energy' };
  }
  if (n.includes('dal') || n.includes('parippu') || n.includes('gram') || n.includes('payar') || n.includes('kadala') || n.includes('beans') || n.includes('peas') || n.includes('soya')) {
    return { categoryId: 'pulses-legumes', emoji: '🫘', note: 'Heart-healthy dietary legume packed with plant protein, minerals and fiber' };
  }
  if (n.includes('oil') || n.includes('ghee') || n.includes('salt') || n.includes('sugar') || n.includes('jaggery') || n.includes('sharkkara') || n.includes('kalkandam') || n.includes('vanaspati') || n.includes('dalda')) {
    return { categoryId: 'oils-sugar', emoji: '🫒', note: 'Pristine daily culinary essential for wholesome authentic cooking' };
  }
  if (n.includes('chilli') || n.includes('turmeric') || n.includes('coriander') || n.includes('pepper') || n.includes('masala') || n.includes('curry') || n.includes('cumin') || n.includes('fennel') || n.includes('jeerakam') || n.includes('clove') || n.includes('cardamom') || n.includes('tamarind') || n.includes('puli') || n.includes('kayam') || n.includes('mustard') || n.includes('fenugreek') || n.includes('cinnamon')) {
    return { categoryId: 'spices', emoji: '🌶️', note: 'Flavorful aromatic spice loaded with natural bioactive compounds and antioxidants' };
  }
  if (n.includes('sauce') || n.includes('vinegar') || n.includes('pickle') || n.includes('achar') || n.includes('jam') || n.includes('honey') || n.includes('ketchup') || n.includes('vermicelli') || n.includes('semiya') || n.includes('pasta') || n.includes('noodles') || n.includes('maggi')) {
    return { categoryId: 'sauces-condiments', emoji: '🍯', note: 'Traditional culinary delicacy crafted for delicious meal enhancements' };
  }
  if (n.includes('biscuit') || n.includes('cookie') || n.includes('snack') || n.includes('popcorn') || n.includes('rusk') || n.includes('chips') || n.includes('wafer') || n.includes('chocolate') || n.includes('mixture')) {
    return { categoryId: 'biscuits-snacks', emoji: '🍿', note: 'Crisp wholesome snack perfect for instant tea-time crunch and snacking' };
  }
  return { categoryId: 'staples', emoji: '🛒', note: 'Carefully sourced premium pantry grocery essential' };
}

export async function ingestEpeedikaGrocery() {
  const ik = getImageKitClient();
  if (!ik) {
    throw new Error('ImageKit client is not configured. Check IMAGEKIT_* in server/.env');
  }

  console.log('📦 Connecting to PostgreSQL...');
  const client = await pool.connect();
  setPostgresConnected(true);

  // 1. Load existing products from DB for strict deduplication
  const dbRes = await client.query('SELECT id, name, category_id FROM products');
  const dbProducts = dbRes.rows;
  console.log(`🔍 Loaded ${dbProducts.length} existing products from PostgreSQL.`);

  const dbEntries = dbProducts.map((p) => {
    const brand = extractBrand(p.name);
    const norm = normalizeTitle(p.name);
    return {
      id: p.id,
      name: p.name,
      brand,
      norm,
      tokens: new Set(norm.split(' ').filter((t) => t.length > 2)),
    };
  });

  // 2. Load epeedika raw grocery items
  const rawPath = path.join(__dirname, '..', 'data', 'epeedikaRawGrocery.json');
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw grocery file not found at ${rawPath}`);
  }
  const rawData: EpeedikaRawItem[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
  console.log(`🛒 Loaded ${rawData.length} products from epeedikaonline.`);

  // 3. Consolidate internal pack-size variants
  const groupMap = new Map<string, EpeedikaRawItem[]>();
  for (const item of rawData) {
    const key = baseGroupName(item.title);
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(item);
  }
  console.log(`📦 Consolidated into ${groupMap.size} distinct product lines.`);

  const duplicatesSkipped: { title: string; matchedWith: string; reason: string }[] = [];
  const candidatesToIngest: { primary: EpeedikaRawItem; variants: EpeedikaRawItem[] }[] = [];

  for (const [key, items] of groupMap.entries()) {
    // Pick the most standard retail variant (e.g. 500g or 1kg or first)
    const primary = items[0];
    const epBrand = extractBrand(primary.title);
    const epNorm = normalizeTitle(primary.title);
    const epTokens = epNorm.split(' ').filter((t) => t.length > 2);

    let match: any = null;
    let reason = '';

    // Check exact normalized match against existing DB products
    for (const db of dbEntries) {
      if (epNorm.length > 4 && db.norm.length > 4 && epNorm === db.norm) {
        match = db;
        reason = 'Exact normalized title match';
        break;
      }
    }

    // Check same brand + core product overlap
    if (!match && epBrand) {
      for (const db of dbEntries) {
        if (db.brand === epBrand) {
          const common = epTokens.filter((t) => db.tokens.has(t) && t !== epBrand);
          if (common.length >= 2 || (common.length >= 1 && epTokens.length <= 2)) {
            match = db;
            reason = `Same brand (${epBrand}) and product overlap (${common.join(', ')})`;
            break;
          }
        }
      }
    }

    // Check generic unbranded staple match
    if (!match && !epBrand) {
      const genericStaples = [
        'thuvaraparippu', 'toor dal', 'tuvar dal', 'urad dal', 'uzhunnu',
        'sugar', 'panchasara', 'salt', 'uppu', 'moong dal', 'cherupayar',
        'chana dal', 'kadala', 'tamarind', 'valanpuli'
      ];
      for (const staple of genericStaples) {
        if (epNorm.includes(staple)) {
          for (const db of dbEntries) {
            if (!db.brand && db.norm.includes(staple)) {
              match = db;
              reason = `Core generic staple match (${staple})`;
              break;
            }
          }
          if (match) break;
        }
      }
    }

    if (match) {
      duplicatesSkipped.push({ title: primary.title, matchedWith: match.name, reason });
    } else {
      candidatesToIngest.push({ primary, variants: items });
    }
  }

  console.log(`\n================ DEDUPLICATION AUDIT ================`);
  console.log(`Total Grouped Products: ${groupMap.size}`);
  console.log(`Skipped Duplicates: ${duplicatesSkipped.length}`);
  console.log(`Approved Unique Candidates: ${candidatesToIngest.length}`);
  console.log(`=====================================================\n`);

  const ingestedList: ConsolidatedGroceryProduct[] = [];
  let uploadSuccessCount = 0;
  let rejectedBadImageCount = 0;
  let dbInsertCount = 0;

  for (let i = 0; i < candidatesToIngest.length; i++) {
    const { primary, variants } = candidatesToIngest[i];
    const productId = `epeedika-grocery-${primary.id}`;
    const fileName = `epeedika-grocery-${primary.id}.jpg`;
    const targetImageKitUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${fileName}`;

    // Properly encode spaces or special characters in the source image URL
    let safeImgUrl = primary.imgUrl;
    if (safeImgUrl.includes(' ')) {
      safeImgUrl = safeImgUrl.replace(/ /g, '%20');
    }

    // Download and validate image binary
    let finalImageUrl = targetImageKitUrl;
    let isValidImage = false;

    try {
      console.log(`[${i + 1}/${candidatesToIngest.length}] Validating & uploading image for: ${primary.title}`);
      const imgRes = await fetch(safeImgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (imgRes.ok) {
        const arrayBuf = await imgRes.arrayBuffer();
        const buf = Buffer.from(arrayBuf);

        // Strict verification: size > 2000 bytes and valid JPEG/PNG magic bytes
        const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        const isPng = buf.length > 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;

        if (buf.length > 2000 && (isJpeg || isPng)) {
          isValidImage = true;
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
        isValidImage = true;
        finalImageUrl = targetImageKitUrl;
      } else {
        console.warn(`⚠️ Warning: Image upload failed for ${primary.title}:`, err?.message || err);
      }
    }

    if (!isValidImage) {
      console.warn(`❌ REJECTED: Product [${primary.id}] "${primary.title}" had an invalid or unverifiable image. Skipping per condition!`);
      rejectedBadImageCount++;
      continue;
    }

    const { categoryId, emoji, note } = assignCategoryAndMetadata(primary.title);
    const defaultUnit = extractUnit(primary.title);

    // Build available units from all variants
    const availableUnitsSet = new Set<string>();
    availableUnitsSet.add(defaultUnit);
    for (const v of variants) {
      availableUnitsSet.add(extractUnit(v.title));
    }
    const availableUnits = Array.from(availableUnitsSet);
    const unitMultiplier: Record<string, number> = {};
    for (const u of availableUnits) {
      unitMultiplier[u] = 1;
    }

    const badge = primary.mrp > primary.sp ? 'Special Offer' : 'Pantry Essential';

    const normalized: ConsolidatedGroceryProduct = {
      id: productId,
      name: primary.title.trim(),
      categoryId,
      emoji,
      image: finalImageUrl,
      defaultUnit,
      availableUnits,
      unitMultiplier,
      isOrganic: false,
      isSeasonal: false,
      badge,
      nutritionalNote: note,
      mrp: Number(primary.mrp) || Number(primary.sp) || 0,
      sellingPrice: Number(primary.sp) || 0,
      source: 'epeedikaonline',
      originalId: primary.id,
    };

    ingestedList.push(normalized);

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

  // Save to JSON dataset
  const outPath = path.join(__dirname, '..', 'data', 'epeedikaProducts.json');
  fs.writeFileSync(outPath, JSON.stringify(ingestedList, null, 2), 'utf-8');
  console.log(`💾 Saved ${ingestedList.length} verified grocery products to ${outPath}`);

  // Verification counts
  const totalCountRes = await client.query('SELECT count(*) FROM products');
  const epeedikaCountRes = await client.query(`SELECT count(*) FROM products WHERE id LIKE 'epeedika%'`);

  client.release();

  console.log('\n🎉 ==============================================');
  console.log(`✅ Duplicates Skipped: ${duplicatesSkipped.length}`);
  console.log(`✅ Bad / Unverifiable Images Rejected: ${rejectedBadImageCount}`);
  console.log(`✅ Genuine Products Ingested to DB: ${dbInsertCount}`);
  console.log(`✅ Uploaded to ImageKit: ${uploadSuccessCount}`);
  console.log(`📦 Total Epeedika Items in DB: ${epeedikaCountRes.rows[0].count}`);
  console.log(`📦 Total Master Catalog Products: ${totalCountRes.rows[0].count}`);
  console.log('=================================================\n');
}

if (require.main === module) {
  ingestEpeedikaGrocery()
    .then(() => {
      console.log('🏁 Epeedika grocery ingestion completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion failed:', err);
      process.exit(1);
    });
}
