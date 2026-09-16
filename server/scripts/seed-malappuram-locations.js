const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const towns = JSON.parse(fs.readFileSync(path.join(__dirname, '../../scratch_full_malappuram.json'), 'utf-8'));

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  const cleanUrl = databaseUrl.replace(/[\?&]sslmode=[^&]+/, '');
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL...');
    let count = 0;
    for (const t of towns) {
      const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const id = slug;
      const subArea = `${t.ml} · ${t.sub}`;
      await client.query(
        `INSERT INTO locations (id, name, sub_area, state, country, currency, currency_symbol, lat, lng, radius_km)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           sub_area = EXCLUDED.sub_area,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           radius_km = EXCLUDED.radius_km`,
        [id, t.name, subArea, 'Kerala', 'India', 'INR', '₹', t.lat, t.lng, 15.0]
      );
      count++;
    }
    console.log(`✅ Successfully seeded/updated ${count} Malappuram locations into PostgreSQL!`);

    const res = await client.query('SELECT COUNT(*) FROM locations');
    console.log(`📊 Total locations in PostgreSQL now: ${res.rows[0].count}`);
  } catch (err) {
    console.error('Error seeding locations:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
