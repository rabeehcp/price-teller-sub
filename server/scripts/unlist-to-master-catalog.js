require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL.replace(/[\?&]sslmode=[^&]+/, '');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

// The 500-something core essential categories to keep listed for all shops
const CORE_CATEGORIES = [
  'vegetables',
  'fruits',
  'rice-grains',
  'staples',
  'pulses-legumes',
  'spices',
  'oils-sugar',
  'oils-spices',
  'dairy',
  'meats',
  'fish',
  'organic',
  'bakery-breakfast'
];

const SHOPS = ['Al-Iqwan', 'HP STORE', 'Malabar supermarker'];

async function unlistProducts() {
  console.log('--- Starting Unlist Operation to Master Catalog ---');

  // 1. Fetch the products to be unlisted
  const unlistQuery = `
    SELECT id, name, category_id, prices, stock_status 
    FROM products 
    WHERE NOT (category_id = ANY($1))
  `;
  const unlistRows = (await pool.query(unlistQuery, [CORE_CATEGORIES])).rows;
  console.log(`Found ${unlistRows.length} products to unlist back to Master Catalog.`);

  // 2. Backup prices to data folder before modifying
  const backupPath = path.resolve(__dirname, '../src/data/unlisted_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(unlistRows, null, 2), 'utf8');
  console.log(`Saved backup of ${unlistRows.length} products with original prices to: ${backupPath}`);

  // 3. Update database: remove shop prices and stock status for unlisted products
  // Using jsonb '-' operator to delete the shop keys, leaving any other keys intact
  const updateRes = await pool.query(`
    UPDATE products 
    SET 
      prices = prices - 'Al-Iqwan' - 'HP STORE' - 'Malabar supermarker',
      stock_status = stock_status - 'Al-Iqwan' - 'HP STORE' - 'Malabar supermarker',
      last_updated = NOW()
    WHERE NOT (category_id = ANY($1))
  `, [CORE_CATEGORIES]);

  console.log(`Database updated: ${updateRes.rowCount} products unlisted from all 3 shops.`);

  // 4. Verify post-conditions
  console.log('\n--- Verification Post-Unlist ---');
  for (const shop of SHOPS) {
    const carriedRes = await pool.query(`
      SELECT count(*) FROM products 
      WHERE (prices->>$1)::numeric > 0
    `, [shop]);

    const notCarriedRes = await pool.query(`
      SELECT count(*) FROM products 
      WHERE prices->>$1 IS NULL OR (prices->>$1)::numeric <= 0
    `, [shop]);

    console.log(`Shop "${shop}":`);
    console.log(`  - Carried / Listed (ലിസ്റ്റ് ചെയ്തവ): ${carriedRes.rows[0].count}`);
    console.log(`  - Master Catalog (മാസ്റ്റർ കാറ്റലോഗ്): ${notCarriedRes.rows[0].count}`);
  }

  const totalRes = await pool.query('SELECT count(*) FROM products');
  console.log(`\nTotal catalog size preserved in database: ${totalRes.rows[0].count}`);
  console.log('--- Operation Completed Successfully ---');

  await pool.end();
}

unlistProducts().catch((err) => {
  console.error('Unlist failed:', err);
  pool.end();
  process.exit(1);
});
