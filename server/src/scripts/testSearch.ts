import { db } from '../db';
import { pool } from '../db/pool';

async function test() {
  const queries = ['tomato', 'തക്കാളി', 'onion', 'സവാള', 'potato', 'ഉരുളക്കിഴങ്ങ്', 'banana', 'നേന്ത്രപ്പഴം', 'chicken', 'കോഴിയിറച്ചി'];
  for (const q of queries) {
    const res = await db.getProducts({ search: q, includeMaster: true });
    console.log(`\n🔍 Search for "${q}" -> Found ${res.length} items:`);
    console.log(res.slice(0, 4).map(p => `  • ${p.name} (id: ${p.id})`).join('\n'));
  }
  pool.end();
}

test();
