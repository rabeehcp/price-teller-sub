import { pool } from '../db/pool';
import fs from 'fs';
import path from 'path';

// Exact mapping from existing/messy Malayalam/English names to pure, clean, simplified Malayalam names
export const CLEAN_PRODUCT_NAMES: Record<string, string> = {
  // Vegetables
  'നാടൻ തക്കാളി': 'തക്കാളി',
  'ബാംഗ്ലൂർ തക്കാളി': 'തക്കാളി',
  'ചെറിയ ഉരുളക്കിഴങ്ങ്': 'ഉരുളക്കിഴങ്ങ്',
  'സവാള (വലിയ ഉള്ളി)': 'സവാള',
  'ചെറിയ ഉള്ളി (സാമ്പാർ ഉള്ളി)': 'ചെറിയ ഉള്ളി',
  'നാടൻ പാവയ്ക്ക (കൈപ്പക്ക)': 'പാവയ്ക്ക',
  'കപ്പ (മരച്ചീനി)': 'കപ്പ',
  'ഏത്തക്കായ (പച്ചക്കായ)': 'ഏത്തക്കായ',
  'നാടൻ മത്തങ്ങ': 'മത്തങ്ങ',
  'നാടൻ വെള്ളരിക്ക': 'വെള്ളരിക്ക',
  'സാലഡ് വെള്ളരിക്ക': 'വെള്ളരിക്ക',
  'വയനാടൻ ഇഞ്ചി': 'ഇഞ്ചി',
  'നാടൻ വൻപയർ (പയർ)': 'വൻപയർ',
  'പടവലം (പോട്‌വൽ)': 'പടവലങ്ങ',
  'വാഴക്കൂമ്പ് (കുടപ്പൻ)': 'വാഴക്കൂമ്പ്',
  'സ്പ്രിംഗ് ഒനിയൻ (ഉള്ളിത്തണ്ട്)': 'സ്പ്രിംഗ് ഒനിയൻ',
  'സ്വീറ്റ് കോൺ (മധുരച്ചോളം)': 'സ്വീറ്റ് കോൺ',
  'കൂൺ (Mushroom)': 'കൂൺ',
  'കോൾറാബി (Knol Khol)': 'കോൾറാബി',
  'ബട്ടർ ബീൻസ്': 'ബീൻസ്',
  'മഞ്ഞ സൂക്കിനി': 'സൂക്കിനി',
  'പച്ച ക്യാപ്സിക്കം': 'ക്യാപ്സിക്കം',
  'ചുവന്ന ക്യാപ്സിക്കം': 'ക്യാപ്സിക്കം',
  'വരി വഴുതനങ്ങ': 'വഴുതനങ്ങ',
  'നീളൻ വഴുതനങ്ങ': 'വഴുതനങ്ങ',
  'ഉരുണ്ട വഴുതനങ്ങ': 'വഴുതനങ്ങ',
  'ബേബി കോൺ 200g': 'ബേബി കോൺ',
  'ബേബി കോൺ തൊലി കളഞ്ഞത്': 'ബേബി കോൺ',

  // Fruits
  'നേന്ത്രപ്പഴം (ഏത്തപ്പഴം)': 'നേന്ത്രപ്പഴം',
  'പപ്പായ (കപ്പങ്ങ / ഓമക്ക)': 'പപ്പായ',
  'വെണ്ണപ്പഴം (Avocado)': 'അവക്കാഡോ',
  'അവോക്കാഡോ / വെണ്ണപ്പഴം': 'അവക്കാഡോ',
  'ഷമാം (മുഴംപഴം)': 'ഷമാം',
  'സപ്പോട്ട / ചിക്കു': 'സപ്പോട്ട',
  'സബർജില്ലി (Green Pears)': 'സബർജിൽ',
  'നാടൻ സബർജില്ലി (Green Pears)': 'സബർജിൽ',
  'ചുവന്ന സബർജില്ലി (Red Pears)': 'സബർജിൽ',
  'പിയർ / സബർജിൽ': 'സബർജിൽ',
  'പുളി / വാളൻപുളി': 'വാളൻപുളി',
  'ചതുരപ്പുളി / നക്ഷത്രപ്പുളി': 'നക്ഷത്രപ്പുളി',
  'റോബസ്റ്റ പഴം (മോറിസ്)': 'റോബസ്റ്റ പഴം',
  'ചെങ്കദളി പഴം (ചുവന്ന പഴം)': 'ചെങ്കദളി പഴം',
  'മലവാഴപ്പഴം (കുന്നൻ പഴം)': 'കുന്നൻ പഴം',
  'മുസംബി (മധുരനാരങ്ങ)': 'മുസംബി',
  'മുസംബി / മധുരനാരങ്ങ': 'മുസംബി',
  'അത്തിപ്പഴം (Anjeer)': 'അത്തിപ്പഴം',
  'അത്തിപ്പഴം ബോക്സ്': 'അത്തിപ്പഴം',
  'പ്ലംസ് (ഇന്ത്യൻ പ്ലം)': 'പ്ലംസ്',
  'പേരയ്ക്ക (ഇംപോർട്ടഡ്)': 'പേരയ്ക്ക',
  'പനീർ മുന്തിരി (കറുത്ത മുന്തിരി)': 'കറുത്ത മുന്തിരി',
  'റെഡ് ഗ്ലോബ് മുന്തിരി (ചുവന്ന മുന്തിരി)': 'റെഡ് ഗ്ലോബ് മുന്തിരി',
  'ഷിംല ആപ്പിൾ': 'ആപ്പിൾ',
  'ഫ്യൂജി ആപ്പിൾ': 'ആപ്പിൾ',
  'റോയൽ ഗാല ആപ്പിൾ': 'ആപ്പിൾ',
  'റെഡ് ഡെലീഷ്യസ് ആപ്പിൾ': 'ആപ്പിൾ',
  'ചെറിയ ഓറഞ്ച്': 'ഓറഞ്ച്',
  'സ്ട്രോബെറി ബോക്സ്': 'സ്ട്രോബെറി',
  'ബ്ലൂബെറി ബോക്സ്': 'ബ്ലൂബെറി',
  'ചെറി (Cherry)': 'ചെറി',
  'കിവി (3 pcs)': 'കിവി',
  'ഡ്യൂറിയൻ പഴം': 'ദുരിയാൻ',

  // Pulses / Grains / Spices
  'ഉണക്കപ്പട്ടാണി (പച്ചപ്പട്ടാണി) 500g': 'ഉണക്കപ്പട്ടാണി 500g',
  'മസൂർ പരിപ്പ് (ചുവന്ന പരിപ്പ്) 500g': 'മസൂർ പരിപ്പ് 500g',
  'വൻപയർ (മമ്പയർ )': 'വൻപയർ',
  'വലിയ കടല (ബംഗാൾ കടല) 500g': 'വലിയ കടല 500g',
  'വെള്ളക്കടല (കാബൂളി കടല) 500g': 'വെള്ളക്കടല 500g',
  'ഗോതമ്പ് പൊടി / ആട്ട': 'ഗോതമ്പ് പൊടി (ആട്ട)',
  'മഞ്ഞൾ (Whole)': 'മഞ്ഞൾ',
  'ഉണക്കമുളക്/വറ്റൽമുളക്': 'വറ്റൽമുളക്',
  'വിനാഗിരി/സുർക്ക': 'വിനാഗിരി',
  'ഇഞ്ചി (Spices)': 'ഇഞ്ചി',
  'കറിവേപ്പില (Spices)': 'കറിവേപ്പില',
  'വെളുത്തുള്ളി (Spices)': 'വെളുത്തുള്ളി',
  'പച്ചച്ചക്കപ്പൊടി (ചക്കപ്പൊടി) 200g': 'ചക്കപ്പൊടി 200g',
  'റൈസ് ബ്രാൻ ഓയിൽ (തവിട്ടെണ്ണ) 1 L': 'റൈസ് ബ്രാൻ ഓയിൽ 1 L'
};

export async function cleanAndDeduplicate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting product name cleanup and deduplication...');

    // 1. Fetch all products
    const res = await client.query('SELECT * FROM products ORDER BY category_id, id');
    const allProducts = res.rows;
    console.log(`Found ${allProducts.length} products in DB.`);

    // 2. Rename each product if in dictionary
    for (const p of allProducts) {
      const cleanName = CLEAN_PRODUCT_NAMES[p.name.trim()];
      if (cleanName && cleanName !== p.name) {
        await client.query('UPDATE products SET name = $1 WHERE id = $2', [cleanName, p.id]);
        p.name = cleanName;
      }
    }
    console.log('✅ Name simplification complete.');

    // 3. Group products by (category_id, name) to find duplicates
    const refreshed = await client.query('SELECT * FROM products ORDER BY category_id, id');
    const groupMap: Record<string, any[]> = {};

    for (const p of refreshed.rows) {
      const key = `${p.category_id}___${p.name.trim().toLowerCase()}`;
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(p);
    }

    let mergedGroups = 0;
    let deletedCount = 0;

    for (const [key, prods] of Object.entries(groupMap)) {
      if (prods.length <= 1) continue;

      mergedGroups++;
      console.log(`\n🔍 Merging duplicate group "${key}": ${prods.length} items`);
      for (const item of prods) {
        console.log(`   - ID: ${item.id} | Name: ${item.name} | Unit: ${item.default_unit} | Image: ${Boolean(item.image)}`);
      }

      // Choose primary product: prefer the one that has an image, or standard id
      prods.sort((a, b) => {
        const aHasImg = Boolean(a.image && a.image.startsWith('http')) ? 1 : 0;
        const bHasImg = Boolean(b.image && b.image.startsWith('http')) ? 1 : 0;
        if (aHasImg !== bHasImg) return bHasImg - aHasImg;
        // Prefer shorter id or standard prefix
        return a.id.localeCompare(b.id);
      });

      const primary = prods[0];
      const secondaries = prods.slice(1);

      // Merge prices
      let mergedPrices: Record<string, number> = { ...(primary.prices || {}) };
      for (const sec of secondaries) {
        if (sec.prices && typeof sec.prices === 'object') {
          for (const [shop, price] of Object.entries(sec.prices)) {
            if (typeof price === 'number' && (!mergedPrices[shop] || mergedPrices[shop] > price)) {
              mergedPrices[shop] = price;
            }
          }
        }
      }

      // Update primary product prices
      await client.query('UPDATE products SET prices = $1 WHERE id = $2', [JSON.stringify(mergedPrices), primary.id]);

      // Re-point related tables and delete secondaries
      for (const sec of secondaries) {
        try {
          await client.query('UPDATE price_histories SET product_id = $1 WHERE product_id = $2', [primary.id, sec.id]);
        } catch {}
        try {
          await client.query('UPDATE price_reports SET product_id = $1 WHERE product_id = $2', [primary.id, sec.id]);
        } catch {}
        try {
          await client.query('UPDATE flash_deals SET product_id = $1 WHERE product_id = $2', [primary.id, sec.id]);
        } catch {}
        try {
          await client.query('UPDATE pre_bookings SET product_id = $1 WHERE product_id = $2', [primary.id, sec.id]);
        } catch {}

        await client.query('DELETE FROM products WHERE id = $1', [sec.id]);
        deletedCount++;
        console.log(`   🗑️ Deleted duplicate product ${sec.id} (merged into ${primary.id})`);
      }
    }

    console.log(`\n🎉 Deduplication complete: Merged ${mergedGroups} groups, deleted ${deletedCount} redundant products.`);

    // 4. Update pothysVegetables.json catalog file
    const jsonPath = path.join(__dirname, '../data/pothysVegetables.json');
    if (fs.existsSync(jsonPath)) {
      const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const cleanJsonMap = new Map<string, any>();

      for (const item of rawData) {
        const clean = CLEAN_PRODUCT_NAMES[item.name?.trim()] || item.name;
        item.name = clean;
        const key = `${item.categoryId}___${clean.toLowerCase().trim()}`;

        if (!cleanJsonMap.has(key)) {
          cleanJsonMap.set(key, item);
        } else {
          // Merge prices into existing
          const existing = cleanJsonMap.get(key);
          if (item.prices) {
            existing.prices = { ...(existing.prices || {}), ...item.prices };
          }
        }
      }

      const deduplicatedJson = Array.from(cleanJsonMap.values());
      fs.writeFileSync(jsonPath, JSON.stringify(deduplicatedJson, null, 2), 'utf-8');
      console.log(`✅ Updated ${jsonPath} (now contains ${deduplicatedJson.length} distinct products)`);
    }

  } finally {
    client.release();
  }
}

if (require.main === module) {
  cleanAndDeduplicate()
    .then(() => {
      console.log('✅ Clean and Deduplicate script completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error running clean and deduplicate:', err);
      process.exit(1);
    });
}
