import '../utils/dns-fallback';
import { pool } from '../db/pool';

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, name, category_id, default_unit, available_units, unit_multiplier, prices
      FROM products
      ORDER BY category_id, name
    `);

    console.log(`Total products: ${res.rows.length}`);

    // Find anomalies:
    // 1. unit is "1 Unit" or "1 unit" or "1 No" or "Banana Stem" or "1 Pack" or weird strings
    // 2. default_unit capitalization inconsistency ('1 Kg' vs '1 kg', '500 gm' vs '500 g')
    // 3. rice / grains where 1 kg is priced like 5 kg or vice versa
    // 4. vegetables where default_unit is strange
    // 5. eggs where unit is '1 unit' instead of '1 egg' / '1 pc' / '10 pcs'
    const weirdUnits: any[] = [];
    const riceIssues: any[] = [];
    const unitCapIssues: any[] = [];

    for (const p of res.rows) {
      const u = p.default_unit || '';
      const p1 = Object.values(p.prices || {})[0] as number || 0;

      if (/^(1 unit|1 Unit|Banana Stem|1 pack|1 Pack|1 pcs|1 Pcs|1 No|8 No|25 Pcs)$/i.test(u)) {
        weirdUnits.push({ id: p.id, name: p.name, cat: p.category_id, unit: u, price: p1 });
      }

      if (/(Kg|gm|500g|150g|250g|Piece|Bunch|Box)/.test(u)) {
        unitCapIssues.push({ id: p.id, name: p.name, unit: u });
      }

      if ((p.name.includes('അരി') || p.name.toLowerCase().includes('rice')) && !p.name.includes('പൊടിയരി') && !p.name.includes('അരിപ്പൊടി')) {
        riceIssues.push({ id: p.id, name: p.name, unit: u, avail: p.available_units, mult: p.unit_multiplier, samplePrice: p1 });
      }
    }

    console.log(`\n--- WEIRD UNITS (${weirdUnits.length}) ---`);
    console.table(weirdUnits);

    console.log(`\n--- RICE ITEMS (${riceIssues.length}) ---`);
    console.table(riceIssues);

    console.log(`\n--- INCONSISTENT CAPITALIZATION UNITS (${unitCapIssues.length}) ---`);
    console.log(`Count: ${unitCapIssues.length}`);
    console.table(unitCapIssues.slice(0, 30));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
