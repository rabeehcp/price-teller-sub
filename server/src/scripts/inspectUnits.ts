import '../utils/dns-fallback';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool } from '../db/pool';

async function run() {
  try {
    const unitsRes = await pool.query(`
      SELECT default_unit, count(*) as count 
      FROM products 
      GROUP BY default_unit 
      ORDER BY count DESC
    `);
    console.log('Distinct default_unit in products:');
    console.log(JSON.stringify(unitsRes.rows, null, 2));

    const samplesRes = await pool.query(`
      SELECT p.id, p.name, p.category_id, p.default_unit, p.available_units, p.unit_multiplier
      FROM products p
      LIMIT 25
    `);
    console.log('\nSample products:');
    console.table(samplesRes.rows);

    const riceRes = await pool.query(`
      SELECT p.id, p.name, p.category_id, p.default_unit, p.available_units, p.unit_multiplier
      FROM products p
      WHERE p.name ILIKE '%rice%' OR p.name ILIKE '%അരി%' OR p.category_id = 'staples'
      LIMIT 25
    `);
    console.log('\nRice / Staples sample:');
    console.table(riceRes.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
