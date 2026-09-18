import dotenv from 'dotenv';
dotenv.config();
import { pool, query, setPostgresConnected } from '../db/pool';

async function main() {
  const client = await pool.connect();
  setPostgresConnected(true);

  // 1. Get IDs of products without images
  const findRes = await query(`
    SELECT id, name, category_id 
    FROM products 
    WHERE image IS NULL OR TRIM(image) = ''
  `);

  console.log(`Found ${findRes.rows.length} products without images to remove.`);

  if (findRes.rows.length > 0) {
    const ids = findRes.rows.map(r => r.id);

    // Delete associated flash_deals and price_reports if any
    await query(`DELETE FROM flash_deals WHERE product_id = ANY($1)`, [ids]);
    await query(`DELETE FROM price_reports WHERE product_id = ANY($1)`, [ids]);
    await query(`DELETE FROM price_histories WHERE product_id = ANY($1)`, [ids]);

    // Delete from products
    const delRes = await query(`DELETE FROM products WHERE id = ANY($1)`, [ids]);
    console.log(`✅ Successfully deleted ${delRes.rowCount} products without images from database.`);
  }

  // Verification
  const total = await query('SELECT count(*) FROM products');
  const withImg = await query("SELECT count(*) FROM products WHERE image IS NOT NULL AND TRIM(image) <> ''");
  const withoutImg = await query("SELECT count(*) FROM products WHERE image IS NULL OR TRIM(image) = ''");

  console.log(`\n--- Verification ---`);
  console.log(`Total remaining products: ${total.rows[0].count}`);
  console.log(`Products with image: ${withImg.rows[0].count}`);
  console.log(`Products without image: ${withoutImg.rows[0].count}`);

  client.release();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
