import fs from 'fs';
import path from 'path';
import { getImageKitClient } from '../utils/imagekit';
import { pool, setPostgresConnected } from '../db/pool';

interface RawItem {
  name: string;
  brand?: { name: string };
  offers?: { price: number };
  image?: string[];
  description?: string;
}

function decodeHtml(html: string): string {
  return html
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
}

function getDrinkMetadata(name: string): { emoji: string; unit: string; note: string; badge: string } {
  const n = name.toLowerCase();

  // Determine emoji
  let emoji = '🥤';
  if (n.includes('lemon') || n.includes('lime') || n.includes('limca') || n.includes('sprite')) {
    emoji = '🍋';
  } else if (n.includes('orange') || n.includes('fanta') || n.includes('yuzu')) {
    emoji = '🍊';
  } else if (n.includes('coffee')) {
    emoji = '☕';
  } else if (n.includes('jeera') || n.includes('masala')) {
    emoji = '🌿';
  } else if (n.includes('cranberry') || n.includes('mango') || n.includes('blush') || n.includes('prebiotic')) {
    emoji = '🧃';
  }

  // Determine unit
  let unit = '750 ml';
  const unitMatch = n.match(/(\d+\.?\d*)\s*(ml|l|ltr|can|bottle)/i);
  if (unitMatch) {
    const val = unitMatch[1];
    const u = unitMatch[2].toLowerCase();
    if (u === 'ml') unit = `${val} ml`;
    else if (u === 'l' || u === 'ltr') unit = `${val} L`;
    else if (u === 'can') unit = '330 ml can';
    else unit = '1 bottle';
  } else if (n.includes('can')) {
    unit = '330 ml can';
  } else if (n.includes('pet')) {
    unit = '750 ml';
  }

  // Determine badge
  let badge = 'Chilled';
  if (n.includes('zero') || n.includes('sugar free')) {
    badge = 'Zero Sugar';
  } else if (n.includes('prebiotic')) {
    badge = 'Prebiotic';
  } else if (n.includes('sparkling')) {
    badge = 'Sparkling';
  }

  // Note
  let note = 'Crisp, chilled, and refreshing beverage for instant vitality and satisfaction';
  if (n.includes('zero') || n.includes('diet')) {
    note = 'Calorie-free, guilt-free sparkling refreshment with classic bold taste';
  } else if (n.includes('prebiotic') || n.includes('digestive')) {
    note = 'Gut-friendly prebiotic fizzy drink packed with natural fiber and flavor';
  } else if (n.includes('jeera')) {
    note = 'Traditional aromatic cumin-spiced refreshing soda for easy digestion';
  }

  return { emoji, unit, note, badge };
}

export async function ingestInstamartDrinks() {
  console.log('🚀 Starting Instamart Cold Drinks Ingestion to ImageKit & Master Catalog...');

  const ikClient = getImageKitClient();
  if (!ikClient) {
    throw new Error('ImageKit client could not be initialized. Check IMAGEKIT_ credentials in .env');
  }

  const client = await pool.connect();
  setPostgresConnected(true);

  // Read saved JSON-LD content from step file
  const stepFilePath = path.join(
    process.env.USERPROFILE || 'C:/Users/STUDENT 09',
    '.gemini/antigravity-ide/brain/050a1bbc-dc0f-4891-8d31-04afb630b5be/.system_generated/steps/2160/content.md'
  );

  let rawItems: RawItem[] = [];
  if (fs.existsSync(stepFilePath)) {
    const content = fs.readFileSync(stepFilePath, 'utf8');
    const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
          rawItems.push(...data.itemListElement);
        }
      } catch (err: any) {
        console.warn('JSON-LD parse warning:', err.message);
      }
    }
  }

  console.log(`📋 Found ${rawItems.length} drinks in Instamart catalog data.`);

  let uploadedCount = 0;
  let alreadyOnCdnCount = 0;
  let insertedCount = 0;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const cleanName = decodeHtml(item.name);
    const brandName = decodeHtml(item.brand?.name || '');
    const price = typeof item.offers?.price === 'number' && item.offers.price > 0 ? item.offers.price : 40;
    const rawImage = item.image && item.image[0] ? item.image[0] : '';
    const { emoji, unit, note, badge } = getDrinkMetadata(cleanName);

    const slug = generateSlug(`${brandName}-${cleanName}`);
    const productId = `instamart-drink-${slug}`;
    const fileName = `instamart-drink-${slug}.png`;
    const targetImageKitUrl = `https://ik.imagekit.io/rcparkd3663/priceteller-catalog/${fileName}`;

    let finalImageUrl = targetImageKitUrl;

    console.log(`\n[${i + 1}/${rawItems.length}] Processing: "${cleanName}" (${brandName})`);

    // 1. Upload to ImageKit Storage
    if (rawImage) {
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
        console.log(`   ⚡ Already exists on ImageKit CDN: ${targetImageKitUrl}`);
        alreadyOnCdnCount++;
      } else {
        try {
          console.log(`   ⬇️ Fetching source image from Instamart CDN...`);
          const imgFetch = await fetch(rawImage, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              Referer: 'https://instamart.in/',
            },
          });

          if (imgFetch.ok) {
            const buf = Buffer.from(await imgFetch.arrayBuffer());
            if (buf.length > 500) {
              console.log(`   ⬆️ Uploading ${buf.length} bytes to ImageKit storage folder /priceteller-catalog/...`);
              const upRes = await ikClient.upload({
                file: buf,
                fileName: fileName,
                folder: '/priceteller-catalog/',
                useUniqueFileName: false,
              });
              finalImageUrl = upRes.url || targetImageKitUrl;
              console.log(`   ✅ ImageKit Upload Success: ${finalImageUrl}`);
              uploadedCount++;
            }
          } else {
            console.warn(`   ⚠️ Could not fetch source image (status ${imgFetch.status})`);
          }
        } catch (uploadErr: any) {
          if (uploadErr?.message?.includes('already exists') || uploadErr?.error?.includes('already exists')) {
            console.log(`   ⚡ Already in ImageKit storage.`);
            alreadyOnCdnCount++;
          } else {
            console.warn(`   ⚠️ ImageKit upload note:`, uploadErr?.message || uploadErr);
          }
        }
      }
    }

    // 2. Insert into PostgreSQL Master Catalog ONLY (no direct shop listings!)
    try {
      const pricesJson = JSON.stringify({ 'Master Catalog': price });
      const stockStatusJson = JSON.stringify({});
      const availableUnitsJson = JSON.stringify([unit]);
      const unitMultiplierJson = JSON.stringify({ [unit]: 1 });

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
          image = EXCLUDED.image,
          emoji = EXCLUDED.emoji,
          default_unit = EXCLUDED.default_unit,
          available_units = EXCLUDED.available_units,
          unit_multiplier = EXCLUDED.unit_multiplier,
          badge = EXCLUDED.badge,
          nutritional_note = EXCLUDED.nutritional_note,
          prices = EXCLUDED.prices,
          last_updated = NOW();
      `,
        [
          productId,
          cleanName,
          'beverages',
          emoji,
          finalImageUrl,
          unit,
          availableUnitsJson,
          unitMultiplierJson,
          false,
          false,
          badge,
          note,
          pricesJson,
          stockStatusJson,
        ]
      );

      console.log(`   📦 Inserted into Master Catalog with price ₹${price} (NOT in any storefront)`);
      insertedCount++;
    } catch (dbErr: any) {
      console.error(`   ❌ Database error for ${productId}:`, dbErr.message);
    }
  }

  client.release();

  console.log('\n========================================');
  console.log('🎉 INGESTION COMPLETED SUCCESSFULLY!');
  console.log(`- Total drinks processed: ${rawItems.length}`);
  console.log(`- Uploaded to ImageKit: ${uploadedCount}`);
  console.log(`- Existing in ImageKit CDN: ${alreadyOnCdnCount}`);
  console.log(`- Added to Master Catalog: ${insertedCount}`);
  console.log('- Shop storefront status: 100% UNLISTED from shops (Master Catalog only)');
  console.log('========================================\n');
}

if (require.main === module) {
  ingestInstamartDrinks()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal ingestion error:', err);
      process.exit(1);
    });
}
