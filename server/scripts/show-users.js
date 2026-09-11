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

async function listUsers() {
  try {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        username, 
        role, 
        phone, 
        shop_name, 
        created_at 
      FROM users 
      ORDER BY role ASC, created_at DESC NULLS LAST
    `);

    console.log(`\n================ PriceTeller Accounts (${res.rows.length} total) ================`);
    console.table(res.rows);
    console.log('==================================================================\n');
  } catch (err) {
    console.error('Error fetching accounts:', err.message);
  } finally {
    await pool.end();
  }
}

listUsers();
