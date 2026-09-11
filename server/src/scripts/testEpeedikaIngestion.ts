import fs from 'fs';
import path from 'path';
import { pool } from '../db/pool';

interface EpeedikaItem {
  id: string;
  title: string;
  imgUrl: string;
  sp: number;
  mrp: number;
}

// Known grocery brands in Kerala / India
const KNOWN_BRANDS = [
  'aachi', 'aashirvaad', 'aashirbad', 'ab', 'act ii', 'ajmi', 'alibaba', 'alite',
  'ambadi', 'amul', 'anand', 'anu s', 'ashirvad', 'bambino', 'boost', 'brahmins',
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

export async function checkEpeedikaDeduplication() {
  const res = await pool.query('SELECT id, name, category_id FROM products');
  const dbProducts = res.rows;
  console.log(`Loaded ${dbProducts.length} existing products from PostgreSQL.`);

  const rawData: EpeedikaItem[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'epeedikaRawGrocery.json'), 'utf-8')
  );

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

  const duplicates: { epeedika: EpeedikaItem; matchedWith: string; reason: string }[] = [];
  const uniqueItems: EpeedikaItem[] = [];

  for (const ep of rawData) {
    const epBrand = extractBrand(ep.title);
    const epNorm = normalizeTitle(ep.title);
    const epTokens = epNorm.split(' ').filter((t) => t.length > 2);

    let match: any = null;
    let reason = '';

    // 1. Check exact normalized match
    for (const db of dbEntries) {
      if (epNorm.length > 4 && db.norm.length > 4 && epNorm === db.norm) {
        match = db;
        reason = 'Exact normalized title match';
        break;
      }
    }

    // 2. Check same brand + core product overlap
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

    // 3. Check generic loose staple duplicates (e.g. unbranded Toor Dal, unbranded Sugar, unbranded Rock salt)
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
      duplicates.push({ epeedika: ep, matchedWith: match.name, reason });
    } else {
      uniqueItems.push(ep);
    }
  }

  console.log(`\n================ DEDUPLICATION SUMMARY ================`);
  console.log(`Total Epeedika Grocery Items: ${rawData.length}`);
  console.log(`Duplicates to SKIP: ${duplicates.length}`);
  console.log(`Unique New Products to INGEST: ${uniqueItems.length}`);
  console.log(`=======================================================\n`);

  console.log('Sample Duplicates Skipped (First 15):');
  for (const d of duplicates.slice(0, 15)) {
    console.log(`❌ [${d.epeedika.id}] "${d.epeedika.title}" ==> Already in DB as "${d.matchedWith}" (${d.reason})`);
  }

  console.log('\nSample Unique Products to Ingest (First 15):');
  for (const u of uniqueItems.slice(0, 15)) {
    console.log(`✨ [${u.id}] "${u.title}" | SP: ₹${u.sp} | MRP: ₹${u.mrp} | Img: ${u.imgUrl}`);
  }

  return { duplicates, uniqueItems };
}

if (require.main === module) {
  checkEpeedikaDeduplication()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
