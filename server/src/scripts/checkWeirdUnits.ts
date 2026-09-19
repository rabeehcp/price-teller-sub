import '../utils/dns-fallback';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { pool } from '../db/pool';

async function run() {
  try {
    const res = await pool.query(`
      SELECT category_id, default_unit, count(id) as count
      FROM products
      GROUP BY category_id, default_unit
      ORDER BY category_id, count(id) DESC
    `);
    
    const byCat: Record<string, any[]> = {};
    for (const r of res.rows) {
      if (!byCat[r.category_id]) byCat[r.category_id] = [];
      byCat[r.category_id].push(`${r.default_unit} (${r.count})`);
    }

    console.log('UNITS BY CATEGORY:');
    for (const [cat, units] of Object.entries(byCat)) {
      console.log(`${cat}: ${units.join(', ')}`);
    }

    const weird = await pool.query(`
      SELECT id, name, category_id, default_unit
      FROM products
      WHERE default_unit ILIKE '%unit%' OR default_unit ILIKE '%stem%'
      ORDER BY category_id, name
    `);
    console.log('\nALL UNIT / STEM PRODUCTS:');
    console.table(weird.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
