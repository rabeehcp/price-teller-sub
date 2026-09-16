import { pool, query, setPostgresConnected } from '../db/pool';

async function main() {
  const client = await pool.connect();
  setPostgresConnected(true);

  const res = await query('SELECT id, name, category_id, emoji, image FROM products ORDER BY category_id, name');
  console.log(`Total products: ${res.rows.length}`);

  console.log('\n--- Grouping by category ---');
  const catMap: Record<string, any[]> = {};
  for (const row of res.rows) {
    if (!catMap[row.category_id]) catMap[row.category_id] = [];
    catMap[row.category_id].push(row);
  }

  for (const cat of Object.keys(catMap)) {
    console.log(`\nCategory: ${cat} (${catMap[cat].length} items)`);
    for (const item of catMap[cat]) {
      console.log(`  - [${item.id}] "${item.name}" | img: ${item.image || 'NONE'}`);
    }
  }

  console.log('\n--- Duplicate image URLs across different products ---');
  const imgMap: Record<string, any[]> = {};
  for (const row of res.rows) {
    if (row.image && row.image.startsWith('http')) {
      if (!imgMap[row.image]) imgMap[row.image] = [];
      imgMap[row.image].push(row);
    }
  }

  for (const [img, products] of Object.entries(imgMap)) {
    if (products.length > 1) {
      console.log(`\n⚠️ Image shared by ${products.length} products: ${img}`);
      for (const p of products) {
        console.log(`   * [${p.id}] ${p.name}`);
      }
    }
  }

  client.release();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
