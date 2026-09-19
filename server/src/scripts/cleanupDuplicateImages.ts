import dotenv from 'dotenv';
dotenv.config();
import { pool, query, setPostgresConnected } from '../db/pool';

async function main() {
  const client = await pool.connect();
  setPostgresConnected(true);

  console.log('🚀 Starting Duplicate Products & Images Cleanup...');

  // 1. Target duplicate IDs to remove:
  // (A) 27 legacy seed vegetable duplicates:
  const legacyVegIds = [
    'veg-1-tomato',
    'veg-2-potato',
    'veg-4-small-onion-shallots',
    'veg-5-ladies-finger-okra',
    'veg-6-brinjal-eggplant',
    'veg-7-green-chilli',
    'veg-8-long-beans-yardlong-beans',
    'veg-9-drumstick',
    'veg-10-bitter-gourd',
    'veg-11-snake-gourd',
    'veg-12-bottle-gourd',
    'veg-13-ash-gourd',
    'veg-14-pumpkin',
    'veg-15-cucumber-malabar-cucumber',
    'veg-17-ridge-gourd',
    'veg-18-elephant-foot-yam',
    'veg-20-tapioca-cassava',
    'veg-23-carrot',
    'veg-24-beetroot',
    'veg-25-radish',
    'veg-26-cabbage',
    'veg-27-cauliflower',
    'veg-31-moringa-leaves',
    'veg-32-ginger',
    'veg-33-garlic',
    'veg-34-curry-leaves',
    'veg-35-coriander-leaves'
  ];

  // (B) Exact duplicate products in snacks, bakery, and vegetables:
  const duplicateItemIds = [
    'pothys-veg-4649927',    // Duplicate coriander leaf (pothys-veg-3136483 retained)
    'shysha-bakery-3757',    // Duplicate Kitkat Chocolate #2 (shysha-bakery-3756 retained)
    'shysha-bakery-3758',    // Duplicate Kitkat Chocolate #3 (shysha-bakery-3756 retained)
    'pothys-snack-3136032',  // Duplicate Bingo Potato Chips (pothys-snack-2917293 retained)
    'pothys-snack-3137378',  // Duplicate Cornado Thai Chilli (pothys-snack-3137903 retained)
    'pothys-snack-3137817',  // Duplicate Toblerone (pothys-snack-3139250 retained)
    'pothys-snack-3422534'   // Duplicate Rajaram's Sesame Balls (pothys-snack-3140017 retained)
  ];

  const allDuplicateIds = [...legacyVegIds, ...duplicateItemIds];
  console.log(`📋 Total duplicate items targeted for removal: ${allDuplicateIds.length}`);

  // 2. Clean dependent records in foreign tables
  console.log('🧹 Cleaning dependent records from flash_deals, price_reports, price_histories, shop_products...');
  const fdRes = await query(`DELETE FROM flash_deals WHERE product_id = ANY($1)`, [allDuplicateIds]);
  const prRes = await query(`DELETE FROM price_reports WHERE product_id = ANY($1)`, [allDuplicateIds]);
  const phRes = await query(`DELETE FROM price_histories WHERE product_id = ANY($1)`, [allDuplicateIds]);
  const spRes = await query(`DELETE FROM shop_products WHERE product_id = ANY($1)`, [allDuplicateIds]);

  console.log(`  - Deleted ${fdRes.rowCount || 0} flash deals`);
  console.log(`  - Deleted ${prRes.rowCount || 0} price reports`);
  console.log(`  - Deleted ${phRes.rowCount || 0} price histories`);
  console.log(`  - Deleted ${spRes.rowCount || 0} shop_products entries`);

  // 3. Delete from products table
  const delRes = await query(`DELETE FROM products WHERE id = ANY($1)`, [allDuplicateIds]);
  console.log(`✅ Successfully deleted ${delRes.rowCount} duplicate products from database.`);

  // 4. Verify post-cleanup state
  const totalProducts = await query('SELECT count(*) FROM products');
  const remainingVeg = await query(`SELECT count(*) FROM products WHERE category_id = 'vegetables'`);
  const remainingLegacyVeg = await query(`SELECT count(*) FROM products WHERE id LIKE 'veg-%'`);

  console.log('\n--- Post-Cleanup Verification ---');
  console.log(`Total remaining products in catalog: ${totalProducts.rows[0].count}`);
  console.log(`Remaining vegetables: ${remainingVeg.rows[0].count}`);
  console.log(`Remaining legacy veg-* items: ${remainingLegacyVeg.rows[0].count}`);

  client.release();
  await pool.end();
}

main().then(() => {
  console.log('\n🏁 Cleanup operation completed successfully.');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error during cleanup:', err);
  process.exit(1);
});
