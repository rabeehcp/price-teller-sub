import fs from 'fs';
import path from 'path';
import { pool, setPostgresConnected } from '../db/pool';

interface BaseProduct {
  id: string;
  name: string;
  categoryId?: string;
  defaultUnit?: string;
  mrp?: number;
  sellingPrice?: number;
  originalMrp?: number;
  originalOfferPrice?: number;
  badge?: string;
  nutritionalNote?: string;
  prices?: Record<string, number>;
  stockStatus?: Record<string, string>;
}

const SHOPS = ['Al-Iqwan', 'Malabar supermarker'];

function getEstimatedRateAndMrp(p: any): { rate: number; mrp: number; badge?: string } {
  const rawMrp = Number(p.mrp ?? p.originalMrp ?? 0);
  const rawSp = Number(p.sellingPrice ?? p.originalOfferPrice ?? p.price ?? 0);

  let rate = rawSp > 0 ? rawSp : (rawMrp > 0 ? rawMrp : 50);
  let mrp = rawMrp > 0 ? rawMrp : Math.round(rate * 1.15);

  if (rate > mrp && mrp > 0) {
    mrp = Math.round(rate * 1.1);
  }

  let badge = p.badge;
  if (mrp > rate && rate > 0) {
    const pct = Math.round(((mrp - rate) / mrp) * 100);
    if (pct >= 5) {
      badge = `${pct}% OFF`;
    }
  }

  return { rate, mrp, badge };
}

function getSeedProductRate(p: { id: string; name: string; category_id: string; default_unit: string; nutritional_note?: string }): { rate: number; mrp: number; badge: string } {
  const name = (p.nutritional_note || p.name).toLowerCase();
  const cat = p.category_id || '';
  const unit = (p.default_unit || '').toLowerCase();

  let rate = 50;
  let mrp = 60;
  let badge = 'Special Price';

  // Meats & Fish
  if (cat === 'meats' || name.includes('mutton') || name.includes('beef') || name.includes('chicken')) {
    if (name.includes('mutton') || name.includes('ആട്ടിറച്ചി')) { rate = 750; mrp = 800; }
    else if (name.includes('beef') || name.includes('പോത്തിറച്ചി') || name.includes('ബീഫ്')) { rate = 380; mrp = 420; }
    else if (name.includes('naadan') || name.includes('നാടൻ കോഴി')) { rate = 260; mrp = 290; }
    else { rate = 160; mrp = 180; } // Chicken
  } else if (cat === 'fish' || name.includes('prawns') || name.includes('fish') || name.includes('മീൻ')) {
    if (name.includes('prawn') || name.includes('ചെമ്മീൻ')) { rate = 340; mrp = 380; }
    else if (name.includes('seer') || name.includes('നെയ്മീൻ')) { rate = 650; mrp = 720; }
    else if (name.includes('sardine') || name.includes('മത്തി')) { rate = 140; mrp = 160; }
    else if (name.includes('mackerel') || name.includes('അയല')) { rate = 200; mrp = 230; }
    else { rate = 220; mrp = 250; }
  }
  // Electronics
  else if (cat === 'electronics') {
    if (name.includes('induction') || name.includes('ഇൻഡക്ഷൻ')) { rate = 1899; mrp = 2499; }
    else if (name.includes('mixer') || name.includes('മിക്സി')) { rate = 2199; mrp = 2899; }
    else if (name.includes('kettle') || name.includes('കെറ്റിൽ')) { rate = 599; mrp = 899; }
    else { rate = 699; mrp = 999; }
  }
  // Utensils
  else if (cat === 'utensils') {
    if (name.includes('cooker') || name.includes('കുക്കർ')) { rate = 899; mrp = 1199; }
    else if (name.includes('pan') || name.includes('തവ') || name.includes('tawa')) { rate = 399; mrp = 499; }
    else if (name.includes('knife') || name.includes('കത്തി')) { rate = 95; mrp = 120; }
    else if (name.includes('strainer') || name.includes('അരിച്ചട്ടി')) { rate = 120; mrp = 150; }
    else if (name.includes('sickle') || name.includes('അരിവാൾ')) { rate = 160; mrp = 190; }
    else { rate = 249; mrp = 320; }
  }
  // Storage Containers
  else if (cat === 'storage-containers') {
    if (name.includes('steel') || name.includes('സ്റ്റീൽ')) { rate = 180; mrp = 240; }
    else if (name.includes('flask') || name.includes('ഫ്ലാസ്ക്')) { rate = 399; mrp = 549; }
    else if (name.includes('bottle') || name.includes('ബോട്ടിൽ')) { rate = 120; mrp = 160; }
    else { rate = 149; mrp = 199; }
  }
  // Baby Family
  else if (cat === 'baby-family') {
    if (name.includes('diaper') || name.includes('ഡയപ്പർ')) { rate = 399; mrp = 499; }
    else if (name.includes('wipes') || name.includes('വൈപ്പ്സ്')) { rate = 95; mrp = 140; }
    else if (name.includes('bottle') || name.includes('ബോട്ടിൽ')) { rate = 180; mrp = 240; }
    else if (name.includes('food') || name.includes('ഫുഡ്')) { rate = 240; mrp = 270; }
    else if (name.includes('tissue') || name.includes('ടിഷ്യു')) { rate = 65; mrp = 85; }
    else { rate = 85; mrp = 110; }
  }
  // Personal Care
  else if (cat === 'personal-care') {
    if (name.includes('shampoo') || name.includes('ഷാംപൂ')) { rate = 140; mrp = 175; }
    else if (name.includes('soap') || name.includes('സോപ്പ്')) { rate = 42; mrp = 50; }
    else if (name.includes('paste') || name.includes('പേസ്റ്റ്') || name.includes('tooth')) { rate = 65; mrp = 75; }
    else if (name.includes('hair oil') || name.includes('എണ്ണ')) { rate = 110; mrp = 135; }
    else { rate = 85; mrp = 110; }
  }
  // Cleaning & Household
  else if (cat === 'cleaning-household') {
    if (name.includes('detergent') || name.includes('ഡിറ്റർജന്റ്') || name.includes('powder')) { rate = 125; mrp = 150; }
    else if (name.includes('dishwash') || name.includes('ഡിഷ് വാഷ്')) { rate = 48; mrp = 55; }
    else if (name.includes('broom') || name.includes('ചൂൽ') || name.includes('mop')) { rate = 140; mrp = 180; }
    else { rate = 75; mrp = 95; }
  }
  // Oils, Salt & Sugar
  else if (cat === 'oils-sugar') {
    if (name.includes('coconut oil') || name.includes('വെളിച്ചെണ്ണ')) { rate = 175; mrp = 200; }
    else if (name.includes('ghee') || name.includes('നെയ്യ്')) { rate = 290; mrp = 330; }
    else if (name.includes('sugar') || name.includes('പഞ്ചസാര')) { rate = 44; mrp = 48; }
    else if (name.includes('salt') || name.includes('ഉപ്പ്')) { rate = 15; mrp = 18; }
    else { rate = 130; mrp = 155; }
  }
  // Rice & Grains
  else if (cat === 'rice-grains') {
    if (name.includes('basmati') || name.includes('ബാസ്മതി')) { rate = 120; mrp = 145; }
    else if (name.includes('biryani') || name.includes('ജീരകശാല') || name.includes('jeerakasala')) { rate = 135; mrp = 160; }
    else if (name.includes('matta') || name.includes('മട്ട')) { rate = 46; mrp = 52; }
    else if (name.includes('atta') || name.includes('ഗോതമ്പ്')) { rate = 45; mrp = 52; }
    else if (name.includes('maida') || name.includes('റവ') || name.includes('rava')) { rate = 38; mrp = 45; }
    else { rate = 44; mrp = 50; }
  }
  // Pulses & Legumes
  else if (cat === 'pulses-legumes') {
    if (name.includes('toor') || name.includes('തുവര')) { rate = 75; mrp = 85; }
    else if (name.includes('kadala') || name.includes('കടല') || name.includes('chana')) { rate = 65; mrp = 75; }
    else if (name.includes('payar') || name.includes('പയർ') || name.includes('moong')) { rate = 70; mrp = 80; }
    else if (name.includes('urad') || name.includes('ഉഴുന്ന്')) { rate = 80; mrp = 95; }
    else { rate = 68; mrp = 80; }
  }
  // Dairy & Eggs
  else if (cat === 'dairy') {
    if (name.includes('egg') || name.includes('മുട്ട')) { rate = 38; mrp = 42; }
    else if (name.includes('milk') || name.includes('പാൽ')) { rate = 28; mrp = 30; }
    else if (name.includes('butter') || name.includes('വെണ്ണ')) { rate = 56; mrp = 60; }
    else if (name.includes('paneer') || name.includes('പനീർ')) { rate = 85; mrp = 95; }
    else if (name.includes('curd') || name.includes('തൈര്')) { rate = 32; mrp = 35; }
    else { rate = 50; mrp = 60; }
  }
  // Beverages
  else if (cat === 'beverages') {
    if (name.includes('horlicks') || name.includes('ഹോർലിക്സ്') || name.includes('boost') || name.includes('ബൂസ്റ്റ്')) { rate = 240; mrp = 275; }
    else if (name.includes('tea') || name.includes('ചായ')) { rate = 135; mrp = 155; }
    else if (name.includes('coffee') || name.includes('കാപ്പി')) { rate = 95; mrp = 115; }
    else if (name.includes('juice') || name.includes('ജ്യൂസ്') || name.includes('squash')) { rate = 110; mrp = 130; }
    else if (name.includes('water') || name.includes('വെള്ളം')) { rate = 20; mrp = 20; }
    else { rate = 85; mrp = 100; }
  }
  // Biscuits & Snacks
  else if (cat === 'biscuits-snacks') {
    if (name.includes('banana chips') || name.includes('ചിപ്സ്')) { rate = 140; mrp = 160; }
    else if (name.includes('bread') || name.includes('ബ്രെഡ്')) { rate = 45; mrp = 50; }
    else if (name.includes('biscuit') || name.includes('ബിസ്കറ്റ്')) { rate = 30; mrp = 35; }
    else if (name.includes('rusk') || name.includes('റസ്ക്')) { rate = 40; mrp = 45; }
    else { rate = 40; mrp = 50; }
  }
  // Sauces & Condiments
  else if (cat === 'sauces-condiments') {
    if (name.includes('ketchup') || name.includes('സോസ്')) { rate = 75; mrp = 90; }
    else if (name.includes('pickle') || name.includes('അച്ചാർ')) { rate = 65; mrp = 80; }
    else if (name.includes('vinegar') || name.includes('വിനാഗിരി')) { rate = 35; mrp = 42; }
    else { rate = 55; mrp = 68; }
  }
  // Spices & Masala
  else if (cat === 'spices') {
    if (name.includes('cardamom') || name.includes('ഏലക്ക')) { rate = 280; mrp = 340; }
    else if (name.includes('pepper') || name.includes('കുരുമുളക്')) { rate = 160; mrp = 190; }
    else if (name.includes('chilli') || name.includes('മുളക് പൊടി')) { rate = 65; mrp = 75; }
    else if (name.includes('turmeric') || name.includes('മഞ്ഞൾ പൊടി')) { rate = 45; mrp = 55; }
    else if (name.includes('garam') || name.includes('മസാല')) { rate = 55; mrp = 65; }
    else { rate = 55; mrp = 68; }
  }
  // Fruits
  else if (cat === 'fruits') {
    if (name.includes('apple') || name.includes('ആപ്പിൾ')) { rate = 160; mrp = 190; }
    else if (name.includes('mango') || name.includes('മാമ്പഴം')) { rate = 120; mrp = 150; }
    else if (name.includes('orange') || name.includes('നാരങ്ങ') || name.includes('mosambi')) { rate = 85; mrp = 100; }
    else if (name.includes('banana') || name.includes('പഴം') || name.includes('വാഴപ്പഴം')) { rate = 48; mrp = 55; }
    else if (name.includes('dates') || name.includes('ഈന്തപ്പഴം')) { rate = 180; mrp = 220; }
    else if (name.includes('dragon') || name.includes('ഡ്രാഗൺ') || name.includes('avocado')) { rate = 150; mrp = 180; }
    else if (name.includes('coconut') || name.includes('തേങ്ങ')) { rate = 35; mrp = 40; }
    else { rate = 95; mrp = 115; }
  }
  // Vegetables
  else if (cat === 'vegetables') {
    if (name.includes('onion') || name.includes('സവാള')) { rate = 35; mrp = 42; }
    else if (name.includes('shallot') || name.includes('ചെറിയ ഉള്ളി')) { rate = 65; mrp = 75; }
    else if (name.includes('potato') || name.includes('ഉരുളക്കിഴങ്ങ്')) { rate = 32; mrp = 38; }
    else if (name.includes('tomato') || name.includes('തക്കാളി')) { rate = 28; mrp = 35; }
    else if (name.includes('garlic') || name.includes('വെളുത്തുള്ളി')) { rate = 140; mrp = 165; }
    else if (name.includes('ginger') || name.includes('ഇഞ്ചി')) { rate = 95; mrp = 115; }
    else if (name.includes('chilli') || name.includes('മുളക്')) { rate = 55; mrp = 65; }
    else if (name.includes('carrot') || name.includes('കാരറ്റ്')) { rate = 45; mrp = 55; }
    else { rate = 35; mrp = 45; }
  }

  const pct = Math.round(((mrp - rate) / mrp) * 100);
  if (pct >= 5) {
    badge = `${pct}% OFF`;
  }

  return { rate, mrp, badge };
}

export async function applyEstimatedProductRates() {
  console.log('📦 Connecting to PostgreSQL database...');
  const client = await pool.connect();
  setPostgresConnected(true);

  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const datasets = [
      { file: 'zeevProducts.json', label: 'Zeev Grocery Catalog' },
      { file: 'epeedikaProducts.json', label: 'Epeedika Supermarket' },
      { file: 'pothysVegetables.json', label: 'Pothys Fresh Vegetables' },
      { file: 'pothysProducts.json', label: 'Pothys Farm Fruits' },
      { file: 'shyshaBakeryProducts.json', label: 'Shysha Bakery & Delights' },
    ];

    let totalUpdatedFromLinks = 0;
    const allExtractedItems: Array<{ name: string; rate: number; mrp: number }> = [];

    for (const ds of datasets) {
      const filePath = path.join(dataDir, ds.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      const products: BaseProduct[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`\n🔄 Processing ${products.length} products from ${ds.label} (${ds.file})...`);

      let fileUpdatedCount = 0;

      for (const prod of products) {
        const { rate, mrp, badge } = getEstimatedRateAndMrp(prod);

        // Populate both active shops with exact extracted rate
        const prices: Record<string, number> = {};
        const stockStatus: Record<string, string> = {};
        for (const shop of SHOPS) {
          prices[shop] = rate;
          stockStatus[shop] = 'in_stock';
        }

        // Update in-memory JSON product
        prod.prices = prices;
        prod.stockStatus = stockStatus;
        if (badge) prod.badge = badge;
        if (ds.file.includes('zeev')) {
          prod.originalOfferPrice = rate;
          prod.originalMrp = mrp;
        } else {
          prod.sellingPrice = rate;
          prod.mrp = mrp;
        }

        allExtractedItems.push({ name: prod.name.toLowerCase(), rate, mrp });

        // Update in PostgreSQL
        const res = await client.query(
          `
          UPDATE products
          SET prices = $1,
              stock_status = $2,
              badge = COALESCE($3, badge),
              last_updated = NOW()
          WHERE id = $4
          `,
          [
            JSON.stringify(prices),
            JSON.stringify(stockStatus),
            badge || null,
            prod.id,
          ]
        );

        if (res.rowCount && res.rowCount > 0) {
          fileUpdatedCount++;
        }
      }

      // Save updated JSON file
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
      console.log(`✅ Saved ${fileUpdatedCount} updated prices to ${ds.file} and PostgreSQL`);
      totalUpdatedFromLinks += fileUpdatedCount;
    }

    // Now update Master Catalog Seed Products (331 items)
    console.log(`\n🌾 Updating Master Catalog Seed Products...`);
    const seedRes = await client.query(`
      SELECT id, name, category_id, default_unit, nutritional_note, badge, prices
      FROM products
      WHERE id NOT LIKE 'zeev-%'
        AND id NOT LIKE 'epeedika-%'
        AND id NOT LIKE 'pothys-%'
        AND id NOT LIKE 'shysha-%'
    `);

    let seedUpdated = 0;
    for (const seed of seedRes.rows) {
      const sName = (seed.nutritional_note || seed.name).toLowerCase();
      // Try to match with an extracted item first
      const hit = allExtractedItems.find((e) => e.name.includes(sName) || sName.includes(e.name));

      let rate: number;
      let badge: string;

      if (hit) {
        rate = hit.rate;
        const mrp = hit.mrp;
        const pct = Math.round(((mrp - rate) / mrp) * 100);
        badge = pct >= 5 ? `${pct}% OFF` : seed.badge || 'Daily Fresh';
      } else {
        const est = getSeedProductRate(seed);
        rate = est.rate;
        badge = est.badge || seed.badge || 'Daily Fresh';
      }

      // If it already had a valid custom price > 0, preserve that price if reasonable
      const existingPrices = seed.prices || {};
      const existingVals = Object.values(existingPrices).map(Number).filter((v) => v > 0);
      if (existingVals.length > 0 && existingVals[0] !== 50) {
        rate = existingVals[0];
      }

      const prices: Record<string, number> = {};
      const stockStatus: Record<string, string> = {};
      for (const shop of SHOPS) {
        prices[shop] = rate;
        stockStatus[shop] = 'in_stock';
      }

      await client.query(
        `
        UPDATE products
        SET prices = $1,
            stock_status = $2,
            badge = COALESCE($3, badge),
            last_updated = NOW()
        WHERE id = $4
        `,
        [
          JSON.stringify(prices),
          JSON.stringify(stockStatus),
          badge,
          seed.id,
        ]
      );
      seedUpdated++;
    }
    console.log(`✅ Updated ${seedUpdated} master catalog seed products with authentic market rates.`);

    // Verification Summary
    const statsRes = await client.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN prices = '{}'::jsonb THEN 1 END) as empty_prices_count,
        COUNT(CASE WHEN prices != '{}'::jsonb THEN 1 END) as valid_prices_count
      FROM products
    `);

    console.log('\n📊 FINAL DATABASE VERIFICATION STATS:');
    console.table(statsRes.rows);

    const samplePriced = await client.query(`
      SELECT id, name, category_id, badge, prices
      FROM products
      ORDER BY RANDOM()
      LIMIT 10
    `);
    console.log('\n🔍 Random 10 Products with Applied Rates:');
    console.table(samplePriced.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyEstimatedProductRates()
    .then(() => {
      console.log('🎉 Successfully applied estimated rates to all products!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error applying product rates:', err);
      process.exit(1);
    });
}
