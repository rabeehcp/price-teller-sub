import '../utils/dns-fallback';
import { pool } from '../db/pool';

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, name, default_unit, available_units, unit_multiplier, prices
      FROM products
      WHERE id LIKE 'grain-%'
      ORDER BY id
    `);
    for (const r of res.rows) {
      console.log(r.id, r.name, r.default_unit, r.prices);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
