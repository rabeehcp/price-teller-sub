import '../utils/dns-fallback';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool } from '../db/pool';

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, name, category_id, default_unit, available_units, unit_multiplier, prices
      FROM products
      WHERE id IN ('dairy-10-egg', 'dairy-12-quail-egg', 'prod-1788525998809-8809', 'grain-1-rice', 'grain-2-matta-rice', 'pothys-veg-4649834')
         OR name ILIKE '%മുട്ട%' OR name ILIKE '%ചിക്കൻ%' OR name ILIKE '%ബീഫ്%'
      ORDER BY category_id, name
    `);
    for (const r of res.rows) {
      console.log(r.id, r.name, r.category_id, r.default_unit, r.prices);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
