import dotenv from 'dotenv';
dotenv.config();
import { pool, query, setPostgresConnected } from '../db/pool';

async function check() {
  setPostgresConnected(true);
  const dupes = await query(`
    SELECT image, COUNT(*) as count, string_agg(name, ' | ') as names, string_agg(id, ' | ') as ids
    FROM products
    WHERE image IS NOT NULL AND TRIM(image) <> ''
    GROUP BY image
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);
  console.log(`Total duplicate image URLs found: ${dupes.rows.length}`);
  let totalAffectedProducts = 0;
  for (const r of dupes.rows) {
    const count = parseInt(r.count, 10);
    totalAffectedProducts += count;
    console.log(`\n[Shared ${count} times] Image: ${r.image}`);
    console.log(`Products: ${r.names}`);
    console.log(`IDs: ${r.ids}`);
  }
  console.log(`\nTotal affected products: ${totalAffectedProducts}`);
  await pool.end();
}

check().catch(console.error);
