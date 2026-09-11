require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is not set in server/.env');
  process.exit(1);
}

const cleanUrl = dbUrl.includes('aivencloud.com') || dbUrl.includes('sslmode=require')
  ? dbUrl.replace(/[\?&]sslmode=[^&]+/, '')
  : dbUrl;

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false }
});

async function listShops() {
  try {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        location_id, 
        address, 
        phone, 
        shop_type, 
        rating, 
        is_verified 
      FROM shops 
      ORDER BY name ASC
    `);

    console.log(`\n================ PriceTeller Stores / Shops (${res.rows.length} total) ================`);
    console.table(res.rows);
    console.log('=======================================================================\n');
  } catch (err) {
    console.error('Error fetching shops:', err.message);
  } finally {
    await pool.end();
  }
}

listShops();
