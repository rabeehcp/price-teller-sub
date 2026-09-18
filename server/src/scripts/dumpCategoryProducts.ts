import { pool } from '../db/pool';

async function run() {
  const cats = ['vegetables', 'fruits', 'spices', 'staples', 'rice-grains', 'pulses-legumes', 'dairy', 'oils-sugar', 'meats', 'fish', 'sauces-condiments', 'bakery-breakfast', 'beverages', 'biscuits-snacks'];
  const results: Record<string, { id: string; name: string }[]> = {};
  
  for (const cat of cats) {
    const res = await pool.query("SELECT id, name FROM products WHERE category_id = $1 AND name ~ '^[A-Za-z0-9]' ORDER BY name ASC", [cat]);
    results[cat] = res.rows;
  }

  for (const cat of cats) {
    console.log(`\n================= ${cat.toUpperCase()} (${results[cat].length}) =================`);
    for (const item of results[cat]) {
      console.log(`${item.id} | ${item.name}`);
    }
  }

  pool.end();
}

run();
