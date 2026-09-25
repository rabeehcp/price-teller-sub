require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
const cleanUrl = dbUrl.includes('aivencloud.com') || dbUrl.includes('sslmode=require')
  ? dbUrl.replace(/[\?&]sslmode=[^&]+/, '')
  : dbUrl;

const pool = new Pool({ connectionString: cleanUrl, ssl: { rejectUnauthorized: false } });

async function analyze() {
  try {
    const shopsRes = await pool.query('SELECT id, name FROM shops ORDER BY name');
    console.log(`\n=== SHOPS IN DATABASE (${shopsRes.rows.length}) ===`);
    console.table(shopsRes.rows);

    const productsRes = await pool.query('SELECT id, name, prices, category_id FROM products');
    console.log(`\nTotal Products in DB: ${productsRes.rows.length}`);

    // Find Al-Iqwan or all shops matching iqwan
    const iqwanShops = shopsRes.rows.filter(s => s.name.toLowerCase().includes('iqwan') || s.name.toLowerCase().includes('iqvan'));
    console.log('\nMatching Iqwan shop(s):', iqwanShops);

    const iqwanShopIds = new Set(iqwanShops.map(s => s.id));
    const iqwanShopNames = new Set(iqwanShops.map(s => s.name.toLowerCase()));

    let totalProductsWithPrices = 0;
    let iqwanHasPriceCount = 0;
    let iqwanSoleLowestCount = 0;
    let iqwanTiedLowestCount = 0;
    let iqwanHigherPriceCount = 0;

    const winningList = [];

    for (const p of productsRes.rows) {
      let priceObj = {};
      if (typeof p.prices === 'string') {
        try { priceObj = JSON.parse(p.prices); } catch (e) {}
      } else if (p.prices && typeof p.prices === 'object') {
        priceObj = p.prices;
      }

      const entries = Object.entries(priceObj)
        .map(([k, v]) => ({ shopKey: k, price: Number(v) }))
        .filter(e => !isNaN(e.price) && e.price > 0);

      if (entries.length === 0) continue;
      totalProductsWithPrices++;

      const minPrice = Math.min(...entries.map(e => e.price));
      const lowestEntries = entries.filter(e => e.price === minPrice);

      // Check if Iqwan is in this product
      const iqwanEntry = entries.find(e => iqwanShopIds.has(e.shopKey) || iqwanShopNames.has(e.shopKey.toLowerCase()));

      if (iqwanEntry) {
        iqwanHasPriceCount++;
        if (iqwanEntry.price === minPrice) {
          if (lowestEntries.length === 1) {
            iqwanSoleLowestCount++;
            winningList.push({ name: p.name, price: iqwanEntry.price, status: 'Sole Winner', category: p.category_id });
          } else {
            iqwanTiedLowestCount++;
            winningList.push({ name: p.name, price: iqwanEntry.price, status: 'Tied Lowest', tiedCount: lowestEntries.length, category: p.category_id });
          }
        } else {
          iqwanHigherPriceCount++;
        }
      }
    }

    console.log('\n================== AL-IQWAN PRICE ANALYSIS ==================');
    console.log(`Total Products in Catalog: ${productsRes.rows.length}`);
    console.log(`Products with Valid Prices: ${totalProductsWithPrices}`);
    console.log(`Products Offered by Al-Iqwan: ${iqwanHasPriceCount}`);
    console.log(`-------------------------------------------------------------`);
    console.log(`🏆 Products WON by Al-Iqwan (Sole Lowest Price): ${iqwanSoleLowestCount}`);
    console.log(`🤝 Products TIED for Lowest Price:              ${iqwanTiedLowestCount}`);
    console.log(`⭐ TOTAL BEST-PRICE / WON PRODUCTS:             ${iqwanSoleLowestCount + iqwanTiedLowestCount}`);
    console.log(`❌ Products where another shop was cheaper:       ${iqwanHigherPriceCount}`);
    console.log('=============================================================\n');

    console.log('Sample Won Products:');
    console.table(winningList.slice(0, 25));

  } catch (err) {
    console.error('Error during analysis:', err);
  } finally {
    await pool.end();
  }
}

analyze();
