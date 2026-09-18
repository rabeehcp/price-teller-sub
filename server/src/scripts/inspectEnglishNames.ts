import { pool } from '../db/pool';

async function run() {
  const cats = ['vegetables', 'fruits'];
  for (const cat of cats) {
    const res = await pool.query("SELECT id, name FROM products WHERE category_id = $1 AND name ~ '^[A-Za-z0-9]' ORDER BY name ASC", [cat]);
    console.log(`\n=== ${cat.toUpperCase()} (${res.rows.length}) ===`);
    for (const r of res.rows) {
      console.log(`  ${r.id}: "${r.name}"`);
    }
  }
  pool.end();
}

run();
