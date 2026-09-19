import '../utils/dns-fallback';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool } from '../db/pool';

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, name, default_unit, available_units, unit_multiplier, prices
      FROM products
      WHERE category_id = 'rice-grains'
      ORDER BY name
    `);
    console.table(res.rows.map(r => ({
      id: r.id,
      name: r.name,
      default_unit: r.default_unit,
      available_units: JSON.stringify(r.available_units),
      unit_multiplier: JSON.stringify(r.unit_multiplier),
      prices: JSON.stringify(r.prices)
    })));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
