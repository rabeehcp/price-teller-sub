import '../utils/dns-fallback';
import { pool } from '../db/pool';

async function run() {
  try {
    const catsRes = await pool.query(`
      SELECT category_id, default_unit, count(*) as count
      FROM products
      GROUP BY category_id, default_unit
      ORDER BY category_id, count DESC
    `);
    console.log('Category vs default_unit:');
    console.table(catsRes.rows);

    const oddUnits = await pool.query(`
      SELECT id, name, category_id, default_unit, available_units, unit_multiplier
      FROM products
      WHERE default_unit IN ('1 Unit', '1 pack', '1 Pack', '1 No', '8 No')
      LIMIT 50
    `);
    console.log('\nProducts with generic units:');
    console.table(oddUnits.rows);

    const grains = await pool.query(`
      SELECT id, name, category_id, default_unit, available_units
      FROM products
      WHERE category_id IN ('rice-grains', 'staples') OR name ILIKE '%rice%' OR name ILIKE '%അരി%'
      ORDER BY name
    `);
    console.log('\nAll grains/rice:');
    console.table(grains.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
